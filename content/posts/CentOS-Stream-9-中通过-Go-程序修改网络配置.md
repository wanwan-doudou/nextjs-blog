---
title: CentOS Stream 9 中通过 Go 程序修改网络配置
date: 2025-02-18 00:00:00
tags:
  - go
---

# CentOS Stream 9 网络配置管理指南

## 1. 概述

本文档详细介绍如何在 CentOS Stream 9 系统中使用 Go 程序进行网络配置管理。主要涉及以下几个方面：

- NetworkManager 配置文件结构
- 网络接口识别
- 配置文件生成和保存
- 网络配置的应用

## 2. NetworkManager 配置文件

### 2.1 配置文件位置

CentOS Stream 9 的网络配置文件存储在以下位置：

```bash
/etc/NetworkManager/system-connections/
```

配置文件使用 `.nmconnection` 作为扩展名，例如：`ens192.nmconnection`

### 2.2 配置文件格式

标准配置文件结构如下：

```ini
[connection]

id=ens192
type=ethernet
interface-name=ens192

[ethernet]

[ipv4]

address1=192.168.1.100/24,192.168.1.1
dns=8.8.8.8;8.8.4.4
method=manual
may-fail=false

[ipv6]

addr-gen-mode=eui64
method=auto

[proxy]
```

### 2.3 配置文件权限

配置文件必须设置正确的权限：

```bash

chmod 600 /etc/NetworkManager/system-connections/*.nmconnection
```

## 3. 网络接口识别

### 3.1 获取系统网络接口

使用 `nmcli` 命令获取系统网络接口信息：

```bash
nmcli -t -f DEVICE,TYPE device status
```

### 3.2 识别物理网络接口

需要排除以下类型的接口：

- 虚拟接口（以 veth 开头）
- 桥接接口（以 br- 开头）
- Docker 网桥（docker0）

```go
// getDefaultInterface
//
// @Description: 获取系统当前使用的默认物理网络接口
// @Author aiJiang <mr.wan16@petalmail.com>
// @Date 2024/2/17 15:30
// @return string 默认网络接口名称
// @return error 错误信息
func getDefaultInterface() (string, error) {
    cmd := exec.Command("nmcli", "-t", "-f", "DEVICE,TYPE,STATE", "device", "status")
    output, err := cmd.Output()
    if err != nil {
        return "", fmt.Errorf("执行 nmcli 命令失败: %v", err)
    }

    // 按行分割输出
    lines := strings.Split(string(output), "\n")
    for _, line := range lines {
        parts := strings.Split(line, ":")
        if len(parts) >= 2 {
            device := parts[0]
            deviceType := parts[1]

            // 排除虚拟接口和桥接接口
            if deviceType == "ethernet" &&
                !strings.HasPrefix(device, "veth") && // 排除 veth 开头的虚拟接口
                !strings.HasPrefix(device, "br-") && // 排除桥接接口
                device != "docker0" { // 排除 docker0 接口
                return device, nil
            }
        }
    }

    return "", fmt.Errorf("未找到默认物理网络接口")

}
```

## 4. 网络配置管理

### 4.1 配置数据结构

```go
type NetworkConfig struct {
    IPAddress string `json:"ipAddress"` // ip地址
    Netmask   string `json:"netmask"`   // 子网掩码
    Gateway   string `json:"gateway"`   // 网关
    DNS1      string `json:"dns1"`      // 主dns
    DNS2      string `json:"dns2"`      // 备dns
    Interface string `json:"interface"` // 网卡
}
```

### 4.2 子网掩码转换

将点分十进制子网掩码转换为 CIDR 格式：

```go
// netmaskToCIDR
//
// @Description: 将点分十进制子网掩码转换为CIDR格式（如：255.255.255.0 -> 24）
// @Author aiJiang <mr.wan16@petalmail.com>
// @Date  2025-02-17 13:29:42
// @param netmask 点分十进制格式的子网掩码
// @return int CIDR格式的掩码长度
// @return error 错误
func netmaskToCIDR(netmask string) (int, error) {
    parts := strings.Split(netmask, ".")
    if len(parts) != 4 {
        return 0, fmt.Errorf("invalid netmask format")
    }

    binary := ""
    for _, part := range parts {
        num, err := strconv.Atoi(part)
        if err != nil {
            return 0, err
        }
        binary += fmt.Sprintf("%08b", num)
    }

    count := strings.Count(binary, "1")
    return count, nil
}
```

### 4.3 生成配置文件

```go
// saveNetworkConfig
//
// @Description: 将网络配置保存到系统配置文件中
// @Author aiJiang <mr.wan16@petalmail.com>
// @Date  2025-02-17 14:34:35
// @param config
// @return error
func saveNetworkConfig(config NetworkConfig) error {
    configPath := fmt.Sprintf("/etc/NetworkManager/system-connections/%s.nmconnection", config.Interface)

    // 转换子网掩码为 CIDR
    cidr, err := netmaskToCIDR(config.Netmask)
    if err != nil {
        return fmt.Errorf("无效的子网掩码: %v", err)
    }

    // 生成配置文件内容
    content := fmt.Sprintf(`[connection]
id=%s
type=ethernet
interface-name=%s

[ethernet]

[ipv4]
address1=%s/%d,%s
dns=%s;%s
method=manual
may-fail=false
  
[ipv6]
addr-gen-mode=eui64
method=auto

[proxy]`,
        config.Interface,
        config.Interface,
        config.IPAddress,
        cidr,
        config.Gateway,
        config.DNS1,
        config.DNS2)

    // 写入配置文件
    if err := os.WriteFile(configPath, []byte(content), 0600); err != nil {
        return fmt.Errorf("写入配置文件失败: %v", err)
    }

    return nil
}
```

### 4.4 应用网络配置

使用 `nmcli` 命令应用新的网络配置：

```go
// applyNetworkConfig
//
// @Description: 重启网络接口以应用新的配置
// @Author aiJiang <mr.wan16@petalmail.com>
// @Date  2025-02-17 14:34:25
// @param config
// @return error
func applyNetworkConfig(config NetworkConfig) error {
    // 重启网络接口
    restartCmd := fmt.Sprintf("nmcli connection down %s && sleep 2 && nmcli connection up %s",
        config.Interface, config.Interface)

    command := exec.Command("sh", "-c", restartCmd)
    if output, err := command.CombinedOutput(); err != nil {
        return fmt.Errorf("重启网络接口失败: %v, output: %s", err, string(output))
    }
    return nil
}
```

## 5. 安全考虑

### 5.1 权限检查

确保程序具有足够的权限：

```go
if os.Geteuid() != 0 {
	return fmt.Errorf("需要 root 权限执行网络配置")
}
```

### 5.2 配置文件权限

确保配置文件具有正确的权限（0600）：

- 所有者：root
- 权限：只有所有者可读写

### 5.3 输入验证

验证 IP 地址格式：

```go
// isValidIPAddress
//
// @Description: 验证IP地址格式
// @Author aiJiang <mr.wan16@petalmail.com>
// @Date  2025-02-17 14:34:43
// @param ip
// @return bool
func isValidIPAddress(ip string) bool {
    parts := strings.Split(ip, ".")
    if len(parts) != 4 {
        return false
    }

    for _, part := range parts {
        // strconv.Atoi()字符串（string） 转换为 整数
        num, err := strconv.Atoi(part)
        if err != nil || num < 0 || num > 255 {
            return false
        }
    }

    return true
}
```

## 6. 最佳实践

1. 在修改网络配置前备份现有配置
2. 实现错误回滚机制
3. 在应用配置前进行完整性检查
4. 记录所有操作日志
5. 实现超时机制，防止命令执行卡死
6. 提供配置验证功能

## 7. 故障排除

常见问题及解决方案：

1. 权限不足：确保以 root 权限运行
2. 配置文件格式错误：检查生成的配置文件格式
3. NetworkManager 服务未运行：检查服务状态
4. 网络接口不存在：验证接口名称
5. 配置应用失败：检查 nmcli 命令输出