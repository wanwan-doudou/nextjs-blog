---
title: "SFTP 大文件传输优化：单流、分块与并发 Worker"
date: 2026-05-18
tags: ["SFTP", "Rust", "Tauri", "性能优化"]
categories: ["桌面开发"]
description: "记录智能终端中 SFTP 上传下载的实现：小文件单流，大文件并发分块，进度事件、取消机制和实现取舍。"
---

## 背景

桌面端做 SFTP 文件管理时，最先遇到的问题通常不是“能不能上传下载”，而是“传大文件时 UI 会不会卡、进度能不能显示、能不能取消”。

如果把文件内容读到前端，再通过 Tauri IPC 传给 Rust 后端，会有明显问题：

1. 大文件会占用大量前端内存。
2. Base64 或 JSON 传输会产生额外开销。
3. 前端渲染线程容易被拖慢。
4. 传输进度和取消不好做。

这个智能终端项目里的处理方式是：前端只把本地路径、远程路径和 taskId 传给后端，真正的文件读写都在 Rust 里完成。

## 前端只负责拿路径和展示任务

拖拽上传时，Tauri 原生事件可以直接拿到本地文件路径：

```ts
unlistenDrop = await listen<{ paths: string[] }>('tauri://drag-drop', async (event) => {
  const filePaths = event.payload.paths;
  if (!filePaths || filePaths.length === 0) return;

  for (const localPath of filePaths) {
    const fileName = localPath.split(/[\\/]/).pop() || 'unknown';
    const remotePath = `${session.currentDir}/${fileName}`;

    const taskId = addTask({
      type: 'upload',
      fileName,
      remotePath,
      localPath,
      size: fileSize,
    });

    await uploadFromFile(sessionId, localPath, remotePath, taskId);
  }
});
```

下载也是类似。用户通过保存对话框选择路径后，前端调用：

```ts
await downloadToFile(sessionId, file.path, savePath, taskId);
```

前端不碰文件内容，只监听后端进度事件：

```ts
listen<{ taskId: string; transferred: number; total: number; speed: number }>(
  `sftp-progress-${taskId}`,
  (event) => {
    updateProgress(taskId, event.payload.transferred);
    setTaskSpeed(taskId, event.payload.speed);
  }
);
```

这种方式让 React 只做 UI，文件 I/O 留给 Rust。

## 小文件走单流

这里以 20MB 作为分界线。小文件直接单流读写，逻辑简单，连接开销低。

```rust
if file_size < 20 * 1024 * 1024 {
    return self
        .download_single(
            session_id,
            remote_path,
            local_path,
            file_size,
            task_id,
            app_handle,
        )
        .await;
}
```

单流下载的核心就是远程读、本地写：

```rust
const CHUNK_SIZE: usize = 4 * 1024 * 1024;

loop {
    let n = remote_file
        .read(&mut chunk_buf)
        .await
        .map_err(|e| format!("读取文件失败: {:?}", e))?;

    if n == 0 {
        break;
    }

    local_file
        .write_all(&chunk_buf[..n])
        .await
        .map_err(|e| format!("写入本地文件失败: {:?}", e))?;

    transferred += n as u64;
}
```

4MB 分块是一个折中：块太小，事件和 I/O 调用频繁；块太大，内存占用和取消响应都会变差。

## 大文件用并发下载

大文件下载时，后端会开启多个 worker。每个 worker 单独打开 SFTP 子系统，读取不同 offset 的数据。

整体流程是：

1. 预创建本地文件。
2. 主任务把文件按 4MB 切块。
3. 多个 worker 按 offset 读取远程文件。
4. writer 任务按 offset seek 后写入本地文件。

writer 任务：

```rust
let writer_handle = tokio::spawn(async move {
    let mut file = tokio::fs::File::create(&local_path_owned)
        .await
        .map_err(|e| format!("创建本地文件失败: {:?}", e))?;

    let _ = file.set_len(file_size).await;

    while let Some((offset, data)) = write_rx.recv().await {
        file.seek(std::io::SeekFrom::Start(offset))
            .await
            .map_err(|e| format!("Writer Seek 失败: {:?}", e))?;
        file.write_all(&data)
            .await
            .map_err(|e| format!("Writer Write 失败: {:?}", e))?;
    }

    file.flush().await.map_err(|e| format!("Writer Flush 失败: {:?}", e))?;
    Ok::<(), String>(())
});
```

worker 任务：

```rust
while let Some((offset, len)) = rx.recv().await {
    if c_cancelled.load(Ordering::SeqCst) {
        break;
    }

    file.seek(std::io::SeekFrom::Start(offset))
        .await
        .map_err(|e| e.to_string())?;

    let mut buf = vec![0u8; len as usize];
    let mut read_cnt = 0;
    while read_cnt < len as usize {
        let n = match file.read(&mut buf[read_cnt..]).await {
            Ok(0) => break,
            Ok(n) => n,
            Err(e) => return Err(e.to_string()),
        };
        read_cnt += n;
    }

    buf.truncate(read_cnt);
    let _ = w_tx.send((offset, buf)).await;
}
```

这里并发数设置为 6。不是越多越好，因为很多 SSH 服务端 `MaxSessions` 默认是 10，开太多子通道反而容易失败。

## 大文件并发上传

上传和下载类似，不过方向反过来：

1. 主任务读取本地文件。
2. 按 4MB 分块发送给 worker。
3. worker 打开远程文件。
4. worker seek 到指定 offset 后写入。

```rust
while let Some((offset, data)) = rx.recv().await {
    if c_cancelled.load(Ordering::SeqCst) {
        break;
    }

    file.seek(std::io::SeekFrom::Start(offset))
        .await
        .map_err(|e| format!("FileSeek: {}", e))?;

    file.write_all(&data)
        .await
        .map_err(|e| format!("FileWrite: {}", e))?;
}
```

上传前会先初始化远程文件：

```rust
let _ = meta
    .session
    .create(remote_path)
    .await
    .map_err(|e| format!("初始化远程文件失败: {:?}", e))?;
```

然后 worker 使用 `WRITE | CREATE` 打开同一个远程路径，并按 offset 写不同分块。

## 进度和速度

每次分块推进时，后端通过 Tauri event 把进度发给前端：

```rust
let _ = app.emit(&format!("sftp-progress-{}", tid), serde_json::json!({
    "taskId": tid,
    "transferred": transferred,
    "total": file_size,
    "speed": speed as u64
}));
```

前端根据 `transferred / size` 算百分比：

```ts
const progress = size > 0
  ? Math.min(100, Math.round((transferredSize / size) * 100))
  : 0;
```

当前实现里，并发传输的进度更接近“已分派分块”或“主循环已推进”的估算，不一定等于所有 worker 已经完全落盘。用于 UI 反馈足够，但如果要做更精确的传输统计，可以改成 worker 完成后回报真实字节数。

## 取消机制

取消操作不能只停前端 UI，后端任务也要能停。

后端用 `cancelled_tasks` 保存取消标记：

```rust
pub async fn cancel_upload(&self, _session_id: &str, token: &str) -> Result<(), String> {
    let mut cancelled = self.cancelled_tasks.lock().await;
    cancelled.insert(token.to_string());
    Ok(())
}
```

传输循环里定期检查：

```rust
if let Some(ref tid) = task_id_owned {
    if self.is_task_cancelled(tid).await {
        is_cancelled.store(true, Ordering::SeqCst);
        self.clear_cancelled_task(tid).await;
        return Err("上传已取消".to_string());
    }
}
```

并发 worker 之间再通过 `AtomicBool` 共享取消状态。一个地方出错或取消，其他 worker 能尽快停下来。

## 总结

SFTP 大文件传输优化的核心不是一上来就并发，而是分层：

1. 小文件单流，简单稳定。
2. 大文件分块，减少单次 I/O 压力。
3. 并发 worker 只用于大文件，提高吞吐。
4. 前端只传路径和监听进度，不搬运文件内容。
5. 取消机制要贯穿主任务和 worker。

这个方案不复杂，但很实用。尤其在 Tauri 桌面应用里，让 Rust 后端直接读写本地文件，比把文件内容绕到前端再发回后端要稳得多。
