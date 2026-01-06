---
title: ".NET 8 程序集动态加载机制"
date: 2026-01-06
tags: ["dotnet", "assembly", "dynamic-loading", "dll"]
categories: ["后端开发"]
description: "使用 AssemblyLoadContext 和 NativeLibrary 实现从自定义目录加载 DLL，支持 .NET 程序集和原生库。"
---

## 应用场景

在某些部署场景中，我们需要将 DLL 文件放在独立的目录中，而不是与可执行文件放在一起。例如：

```
deploy/
├── Web/
│   └── SteelMill.Api.exe
├── DLL/
│   ├── SqlSugar.dll
│   ├── StackExchange.Redis.dll
│   └── runtimes/
│       └── win-x64/
│           └── native/
│               └── e_sqlite3.dll
└── Common/
    └── Config/
        └── appsettings.json
```

本文介绍如何使用 .NET 8 的程序集加载机制实现这种部署模式。

## 模块初始化器

使用 `[ModuleInitializer]` 特性在程序集加载时立即执行初始化代码：

```csharp
public static class AssemblyResolverInit {
    private const string DllFolderName = "DLL";

    [ModuleInitializer]
    public static void Initialize() {
        string exeDir = AppDomain.CurrentDomain.BaseDirectory;
        
        // 注册 .NET 程序集解析器
        AssemblyLoadContext.Default.Resolving += ResolveAssembly;
        
        // 注册原生库解析器
        NativeLibrary.SetDllImportResolver(
            typeof(AssemblyResolverInit).Assembly, 
            DllImportResolver);
    }
}
```

## .NET 程序集加载

当 .NET 运行时无法在默认路径找到程序集时，会触发 `Resolving` 事件：

```csharp
private static Assembly? ResolveAssembly(AssemblyLoadContext alc, AssemblyName assemblyName) {
    try {
        string exeDir = AppDomain.CurrentDomain.BaseDirectory;
        string dllRootDir = Path.GetFullPath(Path.Combine(exeDir, "..", DllFolderName));

        // 1. 在 DLL 根目录查找
        string dllPath = Path.Combine(dllRootDir, $"{assemblyName.Name}.dll");
        if (File.Exists(dllPath)) {
            return alc.LoadFromAssemblyPath(dllPath);
        }

        // 2. 在运行时目录查找（处理平台相关程序集）
        string runtimeDir = RuntimeInformation.ProcessArchitecture switch {
            Architecture.X64 => "win-x64",
            Architecture.X86 => "win-x86",
            Architecture.Arm64 => "win-arm64",
            _ => "win-x64"
        };
        
        string runtimeDllPath = Path.Combine(
            dllRootDir, "runtimes", runtimeDir, "lib", "net8.0", 
            $"{assemblyName.Name}.dll");
            
        if (File.Exists(runtimeDllPath)) {
            return alc.LoadFromAssemblyPath(runtimeDllPath);
        }

        // 3. 兼容旧路径（exe 同级 Dll 目录）
        string legacyDllPath = Path.Combine(exeDir, "Dll", $"{assemblyName.Name}.dll");
        if (File.Exists(legacyDllPath)) {
            return alc.LoadFromAssemblyPath(legacyDllPath);
        }

        return null;  // 让 .NET 继续默认查找
    }
    catch {
        return null;
    }
}
```

## 原生库加载

对于 P/Invoke 调用的原生 DLL（如 SQLite、OpenSSL），使用 `NativeLibrary.SetDllImportResolver`：

```csharp
private static IntPtr DllImportResolver(
    string libraryName, 
    Assembly assembly, 
    DllImportSearchPath? searchPath) {
    
    try {
        string exeDir = AppDomain.CurrentDomain.BaseDirectory;
        string dllRootDir = Path.GetFullPath(Path.Combine(exeDir, "..", DllFolderName));

        string runtimeDir = RuntimeInformation.ProcessArchitecture switch {
            Architecture.X64 => "win-x64",
            Architecture.X86 => "win-x86",
            Architecture.Arm64 => "win-arm64",
            _ => "win-x64"
        };

        // 在 runtimes/{rid}/native 目录查找
        string nativePath = Path.Combine(
            dllRootDir, "runtimes", runtimeDir, "native", 
            $"{libraryName}.dll");
            
        if (File.Exists(nativePath)) {
            return NativeLibrary.Load(nativePath, assembly, searchPath);
        }

        // 兼容旧路径
        string legacyNativePath = Path.Combine(
            exeDir, "Dll", "runtimes", runtimeDir, "native", 
            $"{libraryName}.dll");
            
        if (File.Exists(legacyNativePath)) {
            return NativeLibrary.Load(legacyNativePath, assembly, searchPath);
        }
    }
    catch {
    }
    
    return IntPtr.Zero;  // 让 .NET 继续默认查找
}
```

## 目录结构约定

```
DLL/
├── SqlSugar.dll                           # 托管程序集
├── StackExchange.Redis.dll
├── Newtonsoft.Json.dll
└── runtimes/
    ├── win-x64/
    │   ├── lib/
    │   │   └── net8.0/
    │   │       └── System.Data.SqlClient.dll
    │   └── native/
    │       ├── e_sqlite3.dll              # 原生库
    │       └── librdkafka.dll
    └── win-arm64/
        └── ...
```

## 打包脚本示例

```powershell
# 发布主程序（不包含运行时）
dotnet publish -c Release -r win-x64 --no-self-contained -o ./publish/Web

# 复制 DLL 到独立目录
New-Item -ItemType Directory -Force -Path ./publish/DLL
Copy-Item ./publish/Web/*.dll ./publish/DLL/ -Exclude "SteelMill.*.dll"
Copy-Item -Recurse ./publish/Web/runtimes ./publish/DLL/

# 清理主程序目录中的 DLL
Remove-Item ./publish/Web/*.dll -Exclude "SteelMill.*.dll"
Remove-Item -Recurse ./publish/Web/runtimes
```

## 调试技巧

### 查看程序集加载日志

```csharp
[ModuleInitializer]
public static void Initialize() {
    AssemblyLoadContext.Default.Resolving += (alc, name) => {
        Console.WriteLine($"[AssemblyResolver] 正在查找: {name.Name}");
        var result = ResolveAssembly(alc, name);
        Console.WriteLine($"[AssemblyResolver] 结果: {(result != null ? "已加载" : "未找到")}");
        return result;
    };
}
```

### 常见问题

1. **FileLoadException**：版本不匹配，检查程序集版本
2. **FileNotFoundException**：路径错误，检查 DLL 是否存在
3. **BadImageFormatException**：平台不匹配（x86 vs x64）

## 总结

通过 `AssemblyLoadContext.Resolving` 和 `NativeLibrary.SetDllImportResolver`，我们可以灵活控制程序集和原生库的加载路径，实现更灵活的部署方案：

1. **模块初始化器**：确保在任何代码执行前完成注册
2. **多路径查找**：支持新旧目录结构兼容
3. **平台感知**：自动选择正确的运行时目录
4. **原生库支持**：处理 P/Invoke 调用的 DLL
