---
title: "终端 cd 后文件管理器自动跟随目录的实现"
date: 2026-05-18
tags: ["SSH", "SFTP", "xterm", "React", "Tauri"]
categories: ["桌面开发"]
description: "记录智能终端中终端目录和 SFTP 文件管理器联动的实现：OSC 目录解析、Prompt 兜底、状态同步和路径边界处理。"
---

## 背景

SSH 终端和 SFTP 文件管理器放在同一个应用里时，会有一个很自然的需求：我在终端里 `cd /var/log/nginx`，右侧文件管理器也应该自动跳到这个目录。

如果做不到，用户就要在终端和文件管理器里重复输入路径。尤其排查日志、修改配置时，这个体验会很割裂。

这个智能终端项目的目录同步思路是：

1. 从终端输出里解析当前目录。
2. 把目录状态保存到前端 store。
3. `TerminalView` 把目录变化转成待同步目录。
4. `FileExplorer` 收到后调用 SFTP `changeDir`。

## 优先从 OSC 序列解析目录

很多 Shell 会输出 OSC 控制序列来设置窗口标题或当前目录。其中 OSC 7 是比较适合拿目录的：

```ts
function parseDirectoryFromOsc(output: string): string | null {
  const osc7Match = output.match(/\x1b\]7;file:\/\/[^\/]*(\/[^\x07\x1b]*)/);
  if (osc7Match && osc7Match[1]) {
    return osc7Match[1];
  }

  const oscTitleRegex = /\x1b\][02];([^\x07\x1b]+)(?:\x07|\x1b\\)/g;
  let match;
  let lastValidPath: string | null = null;

  while ((match = oscTitleRegex.exec(output)) !== null) {
    const title = match[1];
    const pathMatch = title.match(/[\w.-]+@[\w.-]+:(\/[\S]*)/);
    if (pathMatch && pathMatch[1]) {
       lastValidPath = pathMatch[1];
    } else if (title.match(/^\/[\S]*$/)) {
       lastValidPath = title;
    }
  }

  return lastValidPath;
}
```

这里先看 OSC 7，再看 OSC 0/2 标题。原因是 OSC 7 表达的是 file URI，通常比 prompt 文本更准确。

## Prompt 解析作为兜底

不是所有远程环境都会输出 OSC 序列，所以还需要解析常见 Shell 提示符：

```ts
const PROMPT_DIR_PATTERNS: RegExp[] = [
  /[\w.-]+@[\w.-]+:([\S]+)[#$]\s*$/,
  /[\w.-]+@[\w.-]+\s+(\/[\S]*)[#$]\s*$/,
  /\[[\w.-]+@[\w.-]+\s+([\S]+)\][#$]\s*$/,
  /^(\/[\S]*)[#$]\s*$/,
  /[\w.-]+@[\w.-]+:(~[\S]*)[#$]\s*$/,
];
```

解析前先清理 ANSI 控制序列：

```ts
function stripAnsiCodes(text: string): string {
  return text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
             .replace(/\x1b\][^\x07]*\x07/g, '')
             .replace(/\x1b[PX^_][^\x1b]*\x1b\\/g, '')
             .replace(/\r/g, '');
}
```

然后只检查最近几行输出：

```ts
const lines = output.split('\n');
const recentLines = lines.slice(-5);

for (let i = recentLines.length - 1; i >= 0; i--) {
  const line = recentLines[i];
  const dir = parseDirectoryFromPrompt(line);
  if (dir) {
    detectedDir = dir;
    break;
  }
}
```

只看最近几行是为了减少误判。历史输出里可能有很多路径文本，只有最后的 prompt 才更可能代表当前目录。

## 目录变化才更新状态

解析到目录后，不是每次输出都更新，而是和当前记录比较：

```ts
if (detectedDir) {
  const currentDir = get().directories[sessionId];

  if (currentDir !== detectedDir) {
    set((state) => ({
      directories: {
        ...state.directories,
        [sessionId]: detectedDir!,
      },
    }));

    return detectedDir;
  }
}
```

这样可以避免终端持续输出时频繁触发 SFTP 切目录。

## TerminalView 转交给 FileExplorer

终端组件监听 SSH 输出时，会顺手把输出交给目录解析：

```ts
const detectedDir = parseAndUpdateFromOutput(session.id, data);
if (detectedDir && onDirectoryChange) {
  onDirectoryChange(detectedDir);
}
```

上层收到目录变化后，保存成一个待同步状态：

```ts
const handleDirectoryChange = useCallback((directory: string) => {
  setPendingSftpDir(directory);
}, []);
```

然后把它传给文件管理器：

```tsx
<FileExplorer
  sessionId={sessionId}
  serverId={serverId}
  syncDirectory={pendingSftpDir}
  onSyncComplete={() => setPendingSftpDir(null)}
/>
```

这样终端只负责发现目录变化，文件管理器自己决定如何处理同步。

## FileExplorer 调用 SFTP changeDir

文件管理器收到 `syncDirectory` 后，如果 SFTP 已连接，就切换目录：

```ts
useEffect(() => {
  if (syncDirectory && session?.connected) {
    if (syncDirectory === '~' && session.currentDir && session.currentDir !== '/') {
      onSyncComplete?.();
      return;
    }

    const targetDir = syncDirectory === '~' ? '.' : syncDirectory;

    changeDir(sessionId, targetDir)
      .then(() => {
        onSyncComplete?.();
      })
      .catch(() => {
        onSyncComplete?.();
      });
  }
}, [syncDirectory, session?.connected, session?.currentDir, sessionId, changeDir, onSyncComplete]);
```

这里对 `~` 做了特殊处理。SFTP 连接建立时通常已经在用户 home 目录，如果终端 prompt 只显示 `~`，直接让后端解析可能不稳定，所以用当前目录或 `.` 兜底。

## 后端负责 canonicalize

真正切目录时，后端会用 SFTP session 做路径解析和目录校验：

```rust
let new_path = meta
    .session
    .canonicalize(path)
    .await
    .map_err(|e| format!("路径解析失败: {:?}", e))?;

let metadata = meta
    .session
    .metadata(&new_path)
    .await
    .map_err(|e| format!("获取路径信息失败: {:?}", e))?;

if !metadata.is_dir() {
    return Err("目标路径不是目录".to_string());
}

meta.current_dir = new_path.clone();
```

前端只做“发现和请求”，路径是否存在、是否目录，交给 SFTP 后端确认。

## 这个方案的边界

目录同步不是百分百准确，主要边界有几个：

1. 自定义 prompt 如果不包含路径，前端就解析不到。
2. 远程 Shell 不输出 OSC 序列时，只能靠 prompt 猜。
3. `sudo -i`、`su` 后 prompt 格式可能变化。
4. 网络设备没有标准文件系统语义，不适合套这套 SFTP 同步。
5. `~` 的真实路径需要结合远程用户 home 目录判断。

所以这套机制适合 Linux/类 Unix 主机，不应该强行扩展到所有 SSH 设备。

## 总结

终端目录和 SFTP 文件管理器联动，本质上是把“人眼看 prompt”这件事程序化。

比较稳的实现顺序是：

1. 优先解析 OSC 7 这类明确目录信息。
2. 再用 Shell prompt 作为兜底。
3. 只在目录变化时触发同步。
4. 前端负责发现目录，后端负责校验路径。
5. 对 `~`、无权限、不存在目录等边界做容错。

这个功能不大，但对 SSH 工具的使用体验提升很明显。终端和文件管理器同步后，排查日志、定位配置文件、上传补丁都会顺很多。
