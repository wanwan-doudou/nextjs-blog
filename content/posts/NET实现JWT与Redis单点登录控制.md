---
title: ".NET 实现 JWT + Redis 单点登录控制"
date: 2026-01-06
tags: ["dotnet", "jwt", "redis", "authentication", "sso"]
categories: ["后端开发"]
description: "基于 JWT 和 Redis 实现多客户端单点登录控制，支持同一用户在不同设备的 Token 独立管理。"
---

## 背景

在工业控制系统中，常常需要支持用户在多台工控机上同时登录，但每台机器的会话需要独立管理。传统的单点登录方案只允许一处登录，而完全放开又无法有效管理会话。

本文介绍一种基于 JWT + Redis 的方案，实现"同用户多设备独立会话"的登录控制。

## 核心设计

### Token 结构

在 JWT 中嵌入 `clientId`（机器码）用于区分不同客户端：

```csharp
public static string GenerateAccessToken(
    long userId, 
    string username, 
    long roleId, 
    string? clientId = null) {
    
    var effectiveClientId = string.IsNullOrEmpty(clientId) ? "default" : clientId;

    var claims = new List<Claim> {
        new("userId", userId.ToString()),
        new("username", username),
        new("roleId", roleId.ToString()),
        new("clientId", effectiveClientId),  // 关键：嵌入机器码
        new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
    };

    var token = new JwtSecurityToken(
        issuer: _config.Issuer,
        audience: _config.Audience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(_config.AccessTokenExpiration),
        signingCredentials: credentials
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

### Redis 存储结构

使用 `用户ID + 客户端ID` 作为 Redis Key：

```
Web:Auth:UserToken:{userId}:{clientId}
```

例如：
- `Web:Auth:UserToken:1:abc123` - 用户1在机器abc123的Token
- `Web:Auth:UserToken:1:def456` - 用户1在机器def456的Token

```csharp
public static bool SaveUserToken(long userId, string token, string? clientId = null) {
    var effectiveClientId = string.IsNullOrEmpty(clientId) ? "default" : clientId;
    var key = $"Web:Auth:UserToken:{userId}:{effectiveClientId}";
    var expiry = TimeSpan.FromMinutes(_config.AccessTokenExpiration);
    
    RedisHelper.Set(key, token, expiry);
    return true;
}
```

### Token 验证流程

验证时除了校验 JWT 签名和有效期，还需比对 Redis 中存储的 Token：

```csharp
public static bool ValidateAccessToken(string token, out ClaimsPrincipal? principal) {
    principal = null;

    // 1. 标准 JWT 验证
    principal = tokenHandler.ValidateToken(token, validationParameters, out _);

    // 2. Redis 验证（单点登录控制）
    var userId = principal.FindFirst("userId")?.Value;
    var clientId = principal.FindFirst("clientId")?.Value;
    
    if (long.TryParse(userId, out long uid)) {
        var storedToken = GetUserToken(uid, clientId);
        if (string.IsNullOrEmpty(storedToken) || storedToken != token) {
            return false;  // Token 不匹配或已被覆盖
        }
    }

    return true;
}
```

### 登出功能

#### 按用户登出（踢出所有设备）

```csharp
public static bool RemoveUserToken(long userId) {
    var server = RedisHelper.GetServer();
    var pattern = RedisHelper.GetPrefixedKey($"Web:Auth:UserToken:{userId}:*");
    var keys = server.Keys(pattern: pattern).ToArray();
    
    if (keys.Length > 0) {
        RedisHelper.GetDatabase().KeyDelete(keys);
    }
    return true;
}
```

#### 按机器码登出（桌面端关闭时）

```csharp
public static int RemoveTokensByClientId(string clientId) {
    var pattern = RedisHelper.GetPrefixedKey($"Web:Auth:UserToken:*:{clientId}");
    var keys = server.Keys(pattern: pattern).ToArray();
    
    if (keys.Length > 0) {
        RedisHelper.GetDatabase().KeyDelete(keys);
    }
    return keys.Length;
}
```

## 登录流程

```csharp
public async Task<object> LoginAsync(LoginRequest request, string machineId) {
    // 1. 验证用户名密码
    var user = await DbHelper.GetDb().Queryable<User>()
        .Where(u => u.Username == request.Username)
        .FirstAsync();

    if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password)) {
        throw new UnauthorizedAccessException("用户名或密码错误");
    }

    // 2. 生成 Token（携带机器码）
    var accessToken = JwtHelper.GenerateAccessToken(
        user.Id, user.Username, user.RoleId, machineId);

    // 3. 踢掉同一客户端的旧连接
    await _notificationService.KickUserAsync(user.Id.ToString());

    // 4. 保存新 Token
    JwtHelper.SaveUserToken(user.Id, accessToken, machineId);

    return new { accessToken, user };
}
```

## 机器码生成

客户端启动时生成唯一机器码：

```csharp
public static string MachineId { get; } = GenerateMachineId();

private static string GenerateMachineId() {
    var combined = $"{Environment.MachineName}_{Environment.UserName}_Client";
    using var sha256 = SHA256.Create();
    var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(combined));
    return BitConverter.ToString(hashBytes, 0, 8).Replace("-", "").ToLowerInvariant();
}
```

## 应用场景

1. **工控系统**：同一操作员可在多台工控机登录，每台独立管理
2. **后台管理**：管理员可同时在办公电脑和移动端使用
3. **多终端应用**：支持 Web、桌面、移动端独立会话

## 总结

通过在 JWT 中嵌入 `clientId` 并使用 `userId:clientId` 作为 Redis Key，我们实现了灵活的多设备登录控制。这种方案既支持同用户多设备登录，又能在需要时精确踢出特定设备的会话。
