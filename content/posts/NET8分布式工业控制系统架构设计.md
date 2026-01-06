---
title: ".NET 8 分布式工业控制系统架构设计"
date: 2026-01-06
tags: ["dotnet", "architecture", "microservices", "industrial-control"]
categories: ["系统设计"]
description: "一个基于 .NET 8 的分布式钢厂智能燃烧控制系统架构设计，包含数据采集、算法引擎、Web API、看门狗等多个模块。"
---

## 系统概述

本文介绍一个基于 .NET 8 的分布式工业控制系统架构。该系统用于钢厂智能燃烧控制，包含以下核心模块：

- **SteelMill.Api**：Web API 服务，提供 RESTful 接口
- **SteelMill.Dms**：数据采集服务，从硬件设备采集数据
- **SteelMill.Ice**：算法引擎服务，执行控制算法
- **SteelMill.SoftDog**：看门狗服务，监控其他服务状态
- **SteelMill.Client**：桌面客户端，嵌入 WebView2

## 系统架构图

```
                    [SoftDog] (看门狗监控层)
                         ↓ 监控
                ┌────────┼────────┐
                ↓        ↓        ↓
硬件设备 
   ↓
[Dms] → Redis (发布数据)
   ↓
[Ice] → Redis (订阅数据 + 发布结果)
   ↓        ↑
   ↓        │ 动态加载
   ↓   [Ice.Mod] (算法模块)
   ↓
[Api] → Redis (订阅) + PostgreSQL (持久化)
   ↓
[Client] → WebView2 (前端界面)
```

## 技术栈

| 组件 | 技术选型 |
|-----|---------|
| 框架 | .NET 8 |
| Web | ASP.NET Core |
| 桌面 | WPF + WebView2 |
| 数据库 | PostgreSQL + TimescaleDB |
| 缓存 | Redis |
| ORM | SqlSugar |
| 认证 | JWT |
| 通信 | Modbus / Redis Pub/Sub |

## 模块职责

### SteelMill.Common（公共库）

所有模块共享的基础设施：

- **初始化器**：数据库、Redis、JWT、日志统一初始化
- **认证授权**：JWT 生成/验证，Token 管理
- **数据库**：SqlSugar 配置，DbHelper 封装
- **Redis**：连接管理，常用操作封装
- **日志**：数据库日志、文件日志
- **加密**：配置文件加密/解密

### SteelMill.Dms（数据采集服务）

```csharp
public class DmsManager {
    private Timer? _pollTimer;

    public void Start() {
        // 每秒采集一次数据
        _pollTimer = new Timer(async _ => {
            var data = await CollectFromModbus();
            await PublishToRedis(data);
            HeartbeatService.PublishHeartbeat("DMS", StateEnum.ONLINE);
        }, null, TimeSpan.Zero, TimeSpan.FromSeconds(1));
    }
}
```

### SteelMill.Ice（算法引擎服务）

支持动态加载算法模块 DLL：

```csharp
public class AlgorithmEngine {
    private readonly Dictionary<string, IAlgorithmModule> _modules = new();

    public void LoadModules() {
        var modulesDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Modules");
        foreach (var dll in Directory.GetFiles(modulesDir, "*.dll")) {
            var assembly = AssemblyLoadContext.Default.LoadFromAssemblyPath(dll);
            var module = // 反射创建实例
            _modules.Add(module.Name, module);
        }
    }

    public void Execute(string moduleName, DataContext context) {
        if (_modules.TryGetValue(moduleName, out var module)) {
            var result = module.Calculate(context);
            RedisHelper.Publish($"ICE:Result:{moduleName}", result);
        }
    }
}
```

### SteelMill.SoftDog（看门狗服务）

监控其他服务进程，自动重启：

```csharp
public class AppManager {
    private readonly List<AppConfig> _apps;

    public void StartMonitoring() {
        foreach (var app in _apps) {
            // 订阅心跳
            HeartbeatService.SubscribeHeartbeat(app.Name, heartbeat => {
                app.LastHeartbeat = DateTime.Now;
                app.State = heartbeat.State;
            });
        }

        // 定时检查
        _checkTimer = new Timer(_ => {
            foreach (var app in _apps) {
                if (app.State == StateEnum.ERROR || IsHeartbeatTimeout(app)) {
                    RestartApp(app);
                }
            }
        }, null, TimeSpan.Zero, TimeSpan.FromSeconds(5));
    }
}
```

### SteelMill.Client（桌面客户端）

嵌入 WebView2 加载前端页面：

```csharp
public class MainWindow : Window {
    private WebView2 _webView;

    public async Task InitializeAsync() {
        await _webView.EnsureCoreWebView2Async();
        
        // 注入机器码到 HTTP 头
        _webView.CoreWebView2.AddWebResourceRequestedFilter("*", CoreWebView2WebResourceContext.All);
        _webView.CoreWebView2.WebResourceRequested += (s, e) => {
            e.Request.Headers.SetHeader("X-Machine-Id", MachineId);
        };

        _webView.Source = new Uri(serverUrl);
    }
}
```

## 数据流

### 1. 数据采集流程

```
Modbus 设备 → Dms → Redis(DMS:Data) → Api → PostgreSQL
```

### 2. 算法控制流程

```
Api(配置参数) → Redis(ICE:Config) → Ice(算法计算) → Redis(ICE:Result) → Api(记录)
```

### 3. 心跳监控流程

```
Dms/Ice → Redis(Heartbeat) → Api(状态同步) → WebSocket → 前端
                          ↓
                      SoftDog(自动重启)
```

## 消息协议

使用 Redis Pub/Sub 进行模块间通信：

```json
// 心跳消息
{
  "module": "DMS",
  "state": "ONLINE",
  "timestamp": 1704499200
}

// 数据消息
{
  "modelName": "烟气分析仪",
  "properties": {
    "O2": 3.5,
    "CO": 120
  },
  "timestamp": 1704499200
}

// 控制消息
{
  "type": "controlExitNotice",
  "instanceName": "AFR_1",
  "data": {
    "guardedTarget": "SZ"
  }
}
```

## 部署架构

```
生产服务器
├── Api/
│   └── SteelMill.Api.exe
├── Dms/
│   └── SteelMill.Dms.exe
├── Ice/
│   ├── SteelMill.Ice.exe
│   └── Modules/
│       ├── AFR.dll
│       └── CO_Safety.dll
├── SoftDog/
│   └── SteelMill.SoftDog.exe (Windows Service)
├── DLL/
│   └── (共享 DLL)
└── Common/
    └── Config/
        └── appsettings.json (共享配置)

工控机
└── Client/
    └── SteelMill.Client.exe
```

## 高可用设计

1. **进程监控**：SoftDog 自动重启异常进程
2. **心跳检测**：3秒超时判定离线，连续3次离线记录日志
3. **故障锁存**：故障状态优先级最高，30秒内持续故障心跳
4. **优雅关闭**：所有模块支持信号处理和资源清理

## 总结

这个分布式工业控制系统架构具有以下特点：

- **模块化设计**：各服务独立部署，互不影响
- **统一通信**：Redis Pub/Sub 解耦模块间通信
- **动态扩展**：算法模块支持热更新
- **高可用性**：看门狗监控 + 自动重启
- **统一配置**：共享配置文件，简化运维
