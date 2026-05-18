---
title: "Tauri + Rust + React 实现智能终端桌面应用"
date: 2026-05-18
tags: ["Tauri", "Rust", "React", "SSH", "xterm"]
categories: ["桌面开发"]
description: "记录智能终端桌面应用的实现思路：Rust 管 SSH 会话，React 管终端界面，Tauri 事件负责前后端通信。"
---

## 背景

做一个 SSH 桌面终端，难点不在“连上 SSH”这一件事，而在于连接之后的状态管理。

终端不是普通表单。它有持续输出、用户输入、窗口尺寸变化、会话断开、缓冲区恢复、多个标签页、AI 面板、SFTP 文件管理器等一堆状态。前端需要像真实终端一样响应，后端又要稳定驱动 SSH 事件循环。

这个智能终端项目的整体结构是：

1. Rust 后端负责 SSH、SFTP、SQLite、AI API 请求。
2. React 前端负责终端 UI、会话标签、AI 面板、文件管理器。
3. Tauri command 负责主动调用。
4. Tauri event 负责持续输出。

这篇主要记录 SSH 终端这一层的实现。

## 后端用 SshManager 管会话

后端入口会在 Tauri 启动时创建全局状态：

```rust
app.manage(SshState {
    manager: Arc::new(SshManager::new()),
});
```

`SshManager` 内部按 `session_id` 管理 SSH 会话。每个会话里保存写入通道、运行状态和底层 session handle。

保存 handle 很重要。如果只保存 channel，不保存 session，连接可能会被提前 drop，表现出来就是终端刚连上又断开。

```rust
let session_data = Arc::new(Mutex::new(Some(SshSessionData {
    write_half: shared_write_half,
    running: running.clone(),
    session_handle: session_handle.clone(),
})));
```

这类状态不适合放在前端。前端只应该知道“当前会话是否连接、有哪些输出、要写入什么输入”，真正的网络连接生命周期应该由 Rust 管。

## SSH 通道拆成读写两条任务

SSH 连接建立后，请求 PTY 并启动 shell：

```rust
channel
    .request_pty(false, &term, cols, rows, 0, 0, &[])
    .await
    .map_err(|e| format!("PTY 请求失败: {:?}", e))?;

channel
    .request_shell(false)
    .await
    .map_err(|e| format!("启动 shell 失败: {:?}", e))?;
```

启动 shell 后，把 channel 拆成读写两半：

```rust
let (mut read_half, write_half) = channel.split();
let shared_write_half = Arc::new(Mutex::new(write_half));
```

读任务持续驱动 SSH 事件循环：

```rust
tokio::spawn(async move {
    loop {
        if !*read_running.read().await {
            break;
        }

        match read_half.wait().await {
            Some(ChannelMsg::Data { data }) => {
                if read_data_tx.send(data.to_vec()).is_err() {
                    break;
                }
            }
            Some(ChannelMsg::ExtendedData { data, .. }) => {
                let _ = read_data_tx.send(data.to_vec());
            }
            Some(ChannelMsg::Eof | ChannelMsg::Close) => {
                break;
            }
            Some(_) => {}
            None => break,
        }
    }
});
```

写任务只做一件事：接收前端输入并写入 SSH channel。

```rust
tokio::spawn(async move {
    while let Some(data) = write_rx.recv().await {
        if !*running_clone.read().await {
            break;
        }
        let write_half = write_channel.lock().await;
        if let Err(_) = write_half.data(data.as_bytes()).await {
            break;
        }
    }
});
```

这个拆分比较清晰：读任务负责输出事件，写任务负责用户输入，互相不阻塞。

## 输出通过 Tauri 事件推给前端

终端输出不是一次请求一次响应，不能用普通 command 返回。后端会把 SSH 输出通过事件发给前端：

```rust
let _ = app_handle_clone.emit(
    &format!("ssh-output-{}", session_id_clone),
    text,
);
```

前端按会话监听对应事件：

```ts
listen<string>(`ssh-output-${session.id}`, (event) => {
  const data = event.payload;
  terminal.write(data);
  outputStoreBufferRef.current += data;
  terminalStoreBufferRef.current += data;
});
```

事件名里带 `session.id`，这样多个 SSH 标签页同时连接时，输出不会串到别的终端。

## 前端用 xterm.js 渲染终端

React 负责创建 xterm 实例：

```ts
terminal = new Terminal({
  cursorBlink: true,
  fontFamily: 'JetBrains Mono, Consolas, monospace',
  fontSize: 14,
  convertEol: true,
  theme: getTerminalTheme(currentTheme),
});

terminal.loadAddon(fitAddon);
terminal.loadAddon(new WebLinksAddon());
terminal.open(terminalRef.current);
```

用户在终端里输入时，把数据发给后端：

```ts
terminal.onData((data: string) => {
  writeSsh(session.id, data);
});
```

这里要注意，终端输入不是“按回车后的一行命令”，而是原始数据流。方向键、退格、Ctrl+C 都会通过 `onData` 进入后端，所以不能把它当普通字符串表单处理。

## 终端尺寸要同步到远程 PTY

桌面窗口变化、左右分屏变化、文件管理器展开都会改变终端尺寸。如果远程 PTY 不知道新的行列数，`top`、`vim`、`less` 这类程序显示会错位。

前端用 `ResizeObserver` 重新 fit：

```ts
const resizeObserver = new ResizeObserver(() => {
  fitAddon.fit();
  const dims = fitAddon.proposeDimensions();
  if (sshConnectedRef.current && dims && dims.cols >= 20 && dims.rows >= 5) {
    resizeSsh(session.id, dims.cols, dims.rows);
  }
});
```

这里加 `sshConnectedRef` 和尺寸下限，是为了避免组件刚挂载时发送无效 resize。

## 切换标签页要恢复输出缓冲区

React 组件重新挂载时，如果只依赖当前 xterm 实例，切换标签后终端会空白。这里把每个会话的输出缓冲保存在 store 里：

```ts
const currentSessionState = useTerminalStore.getState().sessions.find(s => s.id === session.id);
if (currentSessionState && currentSessionState.buffer) {
  terminal.write(currentSessionState.buffer);
}
```

后端输出到来时，除了写入当前 xterm，也会追加到会话缓冲：

```ts
appendSessionOutput(session.id, terminalDataToSync);
```

这样终端实例可以销毁重建，但会话输出不会丢。

## 旧设备算法兼容

SSH 连接还有一个容易踩的坑：老交换机、老路由器可能只支持比较旧的算法。默认现代算法连接失败后，可以尝试旧算法兼容：

```rust
Err(error) if !server.legacy_algorithms && Self::should_retry_with_legacy(&error) => {
    client::connect(
        Arc::new(Self::client_config(true, &server.name)),
        addr.clone(),
        SshClientHandler {
            session_id: session_id.to_string(),
        },
    )
    .await
}
```

兼容算法包括旧的 KEX、CBC cipher、RSA/DSA 等。这个能力不应该默认无限放开，而应该只在需要兼容老设备时启用或重试。

## 总结

Tauri + Rust + React 做 SSH 终端，比较舒服的分工是：

1. Rust 管连接、认证、PTY、读写任务。
2. React 管 xterm 实例、布局、标签页和交互状态。
3. Tauri command 用于连接、写入、resize。
4. Tauri event 用于 SSH 持续输出。
5. Zustand 这类前端状态只保存 UI 状态和输出缓存，不接管真实连接。

这样做之后，终端本身、AI 面板和 SFTP 文件管理器都可以围绕同一个 session 组合起来，而不是互相抢状态。
