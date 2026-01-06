---
title: ".NET Redis 工具类封装实践"
date: 2026-01-06
tags: ["dotnet", "redis", "cache", "pubsub"]
categories: ["后端开发"]
description: "封装一个功能完整的 Redis 工具类，支持字符串、哈希、列表、发布订阅、分布式锁等常用操作。"
---

## 概述

在 .NET 项目中使用 Redis，通常基于 `StackExchange.Redis` 库。本文介绍如何封装一个功能完整、易于使用的 Redis 工具类。

## 连接管理

### 初始化

```csharp
public static class RedisHelper {
    private static RedisConfig? _config;
    private static ConnectionMultiplexer? _connection;
    private static IDatabase? _database;
    private static readonly object _lock = new();

    public static void Initialize(RedisConfig config) {
        _config = config ?? throw new ArgumentNullException(nameof(config));

        lock (_lock) {
            _connection?.Dispose();

            var connectionString = _config.BuildConnectionString();
            _connection = ConnectionMultiplexer.Connect(connectionString);
            _database = _connection.GetDatabase(_config.Database);

            // 注册事件
            _connection.ConnectionFailed += (_, args) => {
                Console.WriteLine($"[Redis] 连接失败: {args.Exception?.Message}");
            };

            _connection.ConnectionRestored += (_, args) => {
                Console.WriteLine($"[Redis] 连接已恢复");
            };
        }
    }
}
```

### 键前缀管理

统一管理键名前缀，避免多项目键名冲突：

```csharp
private static string GetKey(string key) {
    return _config?.GetPrefixedKey(key) ?? key;
}

public static string GetPrefixedKey(string key) {
    return GetKey(key);
}
```

配置类示例：
```csharp
public class RedisConfig {
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 6379;
    public string? Password { get; set; }
    public int Database { get; set; } = 0;
    public string KeyPrefix { get; set; } = "SteelMill:";

    public string GetPrefixedKey(string key) {
        return string.IsNullOrEmpty(KeyPrefix) ? key : $"{KeyPrefix}{key}";
    }
}
```

## 字符串操作

```csharp
// 基础操作
public static bool Set(string key, string value, TimeSpan? expiry = null) {
    var db = GetDatabase();
    return db.StringSet(GetKey(key), value, expiry);
}

public static string? Get(string key) {
    var db = GetDatabase();
    var value = db.StringGet(GetKey(key));
    return value.HasValue ? value.ToString() : null;
}

// 对象序列化
public static bool SetObject<T>(string key, T obj, TimeSpan? expiry = null) {
    var json = JsonConvert.SerializeObject(obj);
    return Set(key, json, expiry);
}

public static T? GetObject<T>(string key) {
    var json = Get(key);
    return json == null ? default : JsonConvert.DeserializeObject<T>(json);
}

// 异步版本
public static async Task<bool> SetAsync(string key, string value, TimeSpan? expiry = null) {
    var db = GetDatabase();
    return await db.StringSetAsync(GetKey(key), value, expiry);
}
```

## 哈希操作

```csharp
public static bool HSet(string key, string field, string value) {
    var db = GetDatabase();
    return db.HashSet(GetKey(key), field, value);
}

public static string? HGet(string key, string field) {
    var db = GetDatabase();
    var value = db.HashGet(GetKey(key), field);
    return value.HasValue ? value.ToString() : null;
}

public static Dictionary<string, string> HGetAll(string key) {
    var db = GetDatabase();
    var entries = db.HashGetAll(GetKey(key));
    return entries.ToDictionary(
        e => e.Name.ToString(),
        e => e.Value.ToString()
    );
}

public static bool HDel(string key, string field) {
    var db = GetDatabase();
    return db.HashDelete(GetKey(key), field);
}
```

## 列表操作

```csharp
// 队列操作
public static long LPush(string key, string value) {
    return GetDatabase().ListLeftPush(GetKey(key), value);
}

public static long RPush(string key, string value) {
    return GetDatabase().ListRightPush(GetKey(key), value);
}

public static string? LPop(string key) {
    var value = GetDatabase().ListLeftPop(GetKey(key));
    return value.HasValue ? value.ToString() : null;
}

public static string? RPop(string key) {
    var value = GetDatabase().ListRightPop(GetKey(key));
    return value.HasValue ? value.ToString() : null;
}

public static long LLen(string key) {
    return GetDatabase().ListLength(GetKey(key));
}
```

## 发布/订阅

```csharp
public static long Publish(string channel, string message) {
    var subscriber = GetConnection().GetSubscriber();
    return subscriber.Publish(RedisChannel.Literal(GetKey(channel)), message);
}

public static void Subscribe(string channel, Action<string, string> handler) {
    var subscriber = GetConnection().GetSubscriber();
    subscriber.Subscribe(RedisChannel.Literal(GetKey(channel)), (ch, msg) => {
        handler(ch.ToString(), msg.ToString());
    });
}

public static void Unsubscribe(string channel) {
    var subscriber = GetConnection().GetSubscriber();
    subscriber.Unsubscribe(RedisChannel.Literal(GetKey(channel)));
}
```

## 分布式锁

```csharp
public static bool LockTake(string key, string value, TimeSpan expiry) {
    var db = GetDatabase();
    return db.LockTake(GetKey(key), value, expiry);
}

public static bool LockRelease(string key, string value) {
    var db = GetDatabase();
    return db.LockRelease(GetKey(key), value);
}
```

使用示例：
```csharp
var lockKey = "order:process:lock";
var lockValue = Guid.NewGuid().ToString();
var lockExpiry = TimeSpan.FromSeconds(30);

if (RedisHelper.LockTake(lockKey, lockValue, lockExpiry)) {
    try {
        // 执行业务逻辑
        ProcessOrder();
    }
    finally {
        RedisHelper.LockRelease(lockKey, lockValue);
    }
}
```

## 键管理

```csharp
public static bool Del(string key) {
    return GetDatabase().KeyDelete(GetKey(key));
}

public static long Del(params string[] keys) {
    var redisKeys = keys.Select(k => (RedisKey)GetKey(k)).ToArray();
    return GetDatabase().KeyDelete(redisKeys);
}

public static bool Exists(string key) {
    return GetDatabase().KeyExists(GetKey(key));
}

public static bool Expire(string key, TimeSpan expiry) {
    return GetDatabase().KeyExpire(GetKey(key), expiry);
}

public static TimeSpan? Ttl(string key) {
    return GetDatabase().KeyTimeToLive(GetKey(key));
}
```

## 连接测试

```csharp
public static bool TestConnection(out string errorMessage) {
    errorMessage = string.Empty;
    try {
        var db = GetDatabase();
        var result = db.Ping();
        Console.WriteLine($"[Redis] PING 响应时间: {result.TotalMilliseconds:F2} ms");
        return true;
    }
    catch (Exception ex) {
        errorMessage = ex.Message;
        return false;
    }
}
```

## 优雅关闭

```csharp
public static void Dispose() {
    _connection?.Dispose();
    _connection = null;
    _database = null;
    Console.WriteLine("[Redis] Redis 连接已关闭");
}
```

## 使用示例

```csharp
// 初始化
RedisHelper.Initialize(new RedisConfig {
    Host = "192.168.1.100",
    Port = 6379,
    Password = "secret",
    Database = 0,
    KeyPrefix = "SteelMill:"
});

// 缓存用户信息
RedisHelper.SetObject("user:1", new { Name = "张三", Age = 30 }, TimeSpan.FromHours(1));

// 发布消息
RedisHelper.Publish("DMS:Heartbeat", "{\"state\":\"ONLINE\"}");

// 订阅消息
RedisHelper.Subscribe("ICE:Message", (channel, message) => {
    Console.WriteLine($"收到消息: {message}");
});
```

## 总结

这个 Redis 工具类封装了常见的 Redis 操作，具有以下特点：

1. **统一键前缀**：避免多项目键名冲突
2. **对象序列化**：自动 JSON 序列化/反序列化
3. **连接管理**：自动重连、事件通知
4. **分布式锁**：简单易用的锁操作
5. **发布订阅**：封装消息通信
