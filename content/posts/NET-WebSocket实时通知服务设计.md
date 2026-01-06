---
title: ".NET WebSocket 实时通知服务设计"
date: 2026-01-06
tags: ["dotnet", "websocket", "realtime", "notification"]
categories: ["后端开发"]
description: "实现一个完整的 WebSocket 实时通知服务，支持心跳监控、连接管理和用户踢出功能。"
---

## 概述

在工业监控系统中，前端需要实时展示设备状态、告警信息和各模块的在线状态。本文介绍如何使用 .NET WebSocket 实现一个统一的实时通知服务。

## 核心功能

- 多客户端 WebSocket 连接管理
- 模块心跳监控与状态同步
- 日志推送与未读计数
- 用户会话踢出（单点登录配合）

## 连接管理

使用 ConcurrentDictionary 管理 WebSocket 连接：

```csharp
public class UnifiedNotificationService : IUnifiedNotificationService {
    // 连接池：ConnectionId -> WebSocket
    private readonly ConcurrentDictionary<Guid, WebSocket> _connections = new();
    
    // 用户映射：UserId -> ConnectionId
    private readonly ConcurrentDictionary<string, Guid> _userConnections = new();

    public async Task AddConnectionAsync(WebSocket webSocket, string? userId = null) {
        var connectionId = Guid.NewGuid();
        _connections.TryAdd(connectionId, webSocket);

        if (!string.IsNullOrEmpty(userId)) {
            // 踢掉该用户的旧连接
            if (_userConnections.TryGetValue(userId, out var oldConnectionId)) {
                if (_connections.TryGetValue(oldConnectionId, out var oldWebSocket)) {
                    await SendAuthErrorAndCloseAsync(oldWebSocket, "会话已过期");
                    _connections.TryRemove(oldConnectionId, out _);
                }
            }
            _userConnections[userId] = connectionId;
        }

        // 立即推送最新数据
        await SendLatestDataToConnectionAsync(webSocket);
    }
}
```

## 心跳监控

### 订阅心跳

通过 Redis Pub/Sub 订阅各模块心跳：

```csharp
public UnifiedNotificationService() {
    HeartbeatService.SubscribeHeartbeat("DMS", heartbeat => {
        UpdateHeartbeat("DMS", heartbeat);
    });

    HeartbeatService.SubscribeHeartbeat("ICE", heartbeat => {
        UpdateHeartbeat("ICE", heartbeat);
    });
}
```

### 状态跟踪

使用状态机跟踪模块连接状态，防止网络抖动误报：

```csharp
private class ModuleConnectionStatus {
    public StateEnum? LastState { get; set; }
    public StateEnum CurrentState { get; set; }
    public int ConsecutiveCount { get; set; }      // 连续相同状态次数
    public bool HasLoggedCurrentState { get; set; }
    public bool IsFaulted { get; set; }            // 故障锁存
    public DateTime LastFaultTime { get; set; }
}

private void UpdateHeartbeat(string moduleName, SystemHeart heartbeat) {
    var moduleStatus = _moduleStatusCache.GetOrAdd(moduleName, _ => new ModuleConnectionStatus());

    // 故障优先：进入故障锁存状态
    if (heartbeat.State == StateEnum.ERROR) {
        if (!moduleStatus.IsFaulted) {
            moduleStatus.IsFaulted = true;
            moduleStatus.LastFaultTime = DateTime.Now;
            LogModuleStateAsync(moduleName, StateEnum.ERROR, heartbeat.Timestamp);
        }
        return;
    }

    // 故障解除：需等待 30 秒
    if (moduleStatus.IsFaulted) {
        var secondsSinceLastFault = (DateTime.Now - moduleStatus.LastFaultTime).TotalSeconds;
        if (secondsSinceLastFault < 30) {
            return;  // 继续保持故障状态
        }
        moduleStatus.IsFaulted = false;
    }

    // 正常状态变化处理...
}
```

### 超时检测

定时检查心跳超时（3秒未收到心跳判定离线）：

```csharp
private async Task CheckHeartbeatTimeoutAsync() {
    foreach (var moduleName in new[] { "DMS", "ICE" }) {
        if (!_heartbeatCache.TryGetValue(moduleName, out var heartbeatInfo)) {
            continue;
        }

        var secondsSinceLastHeartbeat = (DateTime.Now - heartbeatInfo.ReceivedTime).TotalSeconds;
        
        if (secondsSinceLastHeartbeat > 3) {
            var moduleStatus = _moduleStatusCache[moduleName];
            moduleStatus.ConsecutiveCount++;
            
            // 连续 3 次检测到超时才记录离线
            if (moduleStatus.ConsecutiveCount >= 3 && !moduleStatus.HasLoggedCurrentState) {
                await LogModuleStateAsync(moduleName, StateEnum.OFFLINE, heartbeatInfo.Timestamp);
                moduleStatus.HasLoggedCurrentState = true;
            }
        }
    }
}
```

## 数据推送

### 轮询主循环

每秒轮询并推送数据：

```csharp
private Timer? _timer;

public async Task StartAsync() {
    _timer = new Timer(async _ => await PollAndPushDataAsync(), 
        null, TimeSpan.Zero, TimeSpan.FromSeconds(1));
}

private async Task PollAndPushDataAsync() {
    // 即使没有连接也要检查心跳
    await CheckHeartbeatTimeoutAsync();

    if (_connections.IsEmpty) return;

    // 获取物模型数据
    var modelData = ModelDataService.ReadModelData();
    
    // 获取心跳状态
    var heartbeatStatus = GetAllModuleStatus();
    
    // 查询未读日志
    var (unreadCount, latestUnread) = await QueryUnreadDataAsync();

    // 构建并广播消息
    var message = BuildUnifiedMessage(modelData, heartbeatStatus, unreadCount, latestUnread);
    await BroadcastMessageAsync(message);
}
```

### 消息格式

```json
{
  "type": "unified_data",
  "timestamp": "2026-01-06T10:00:00",
  "data": {
    "modelData": {
      "烟气分析仪": {
        "O2": 3.5,
        "O2_unit": "%",
        "CO": 120,
        "CO_unit": "ppm"
      }
    },
    "heartbeat": {
      "DMS": { "state": "ONLINE", "isOnline": true },
      "ICE": { "state": "ERROR", "isOnline": false }
    },
    "unread": {
      "count": 5,
      "latest": [
        { "id": 1, "message": "CO 浓度超标告警", "category": "报警记录" }
      ]
    }
  }
}
```

## 用户踢出

配合单点登录，踢出指定用户的 WebSocket 连接：

```csharp
public async Task KickUserAsync(string userId, string reason = "会话已过期") {
    if (_userConnections.TryRemove(userId, out var connectionId)) {
        if (_connections.TryRemove(connectionId, out var webSocket)) {
            await SendAuthErrorAndCloseAsync(webSocket, reason);
        }
    }
}

private async Task SendAuthErrorAndCloseAsync(WebSocket webSocket, string reason) {
    if (webSocket.State == WebSocketState.Open) {
        var errorMessage = JsonSerializer.Serialize(new {
            type = "auth_error",
            code = 401,
            message = reason
        });

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));
        await webSocket.SendAsync(
            Encoding.UTF8.GetBytes(errorMessage),
            WebSocketMessageType.Text, true, cts.Token);

        await webSocket.CloseAsync(
            WebSocketCloseStatus.PolicyViolation, reason, cts.Token);
    }
    webSocket.Dispose();
}
```

## 优雅关闭

```csharp
public async Task StopAsync() {
    _timer?.Dispose();
    
    foreach (var kvp in _connections) {
        if (kvp.Value.State == WebSocketState.Open) {
            await kvp.Value.CloseAsync(
                WebSocketCloseStatus.NormalClosure, "服务停止", CancellationToken.None);
        }
        kvp.Value.Dispose();
    }
    _connections.Clear();
}
```

## 总结

这个 WebSocket 通知服务实现了：

1. **连接管理**：支持多客户端、用户级别的连接跟踪
2. **心跳监控**：带防抖的模块状态监控，避免网络抖动误报
3. **故障锁存**：故障状态优先级最高，避免状态灯闪烁
4. **实时推送**：统一推送物模型数据、心跳状态、未读日志
5. **会话踢出**：配合 JWT 实现单点登录控制
