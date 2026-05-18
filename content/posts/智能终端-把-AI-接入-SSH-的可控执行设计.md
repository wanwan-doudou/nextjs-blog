---
title: "智能终端：把 AI 接入 SSH 的可控执行设计"
date: 2026-05-18
tags: ["Tauri", "Rust", "SSH", "AI", "安全"]
categories: ["桌面开发"]
description: "记录智能终端接入 AI 后，如何把模型输出、命令解析、人工确认、自动执行和文件写入控制在一条可追踪的链路里。"
---

## 背景

把 AI 接入 SSH 终端，最容易做成的版本其实很简单：用户问一句，模型回一段 Shell 命令，前端把命令写进终端。

但这个方案的问题也很明显。模型输出是文本，不是程序协议；文本里可能有解释、代码块、JSON、空白、甚至推理模型残留的 `<think>` 标签。更麻烦的是，SSH 终端连接的是真实机器，命令一旦执行，就不是普通聊天窗口里的“建议”了。

所以这个智能终端项目没有把“模型回复”和“终端执行”直接绑死，而是拆成几层：

1. 模型只能返回受控动作。
2. 程序负责解析动作。
3. 用户可以选择确认模式或自动模式。
4. 自动模式必须有停止条件和循环保护。
5. 文件写入走单独的 SFTP 能力，不靠 Shell 拼接文本。

这篇主要记录这个执行链路的设计。

## 系统提示词先收窄动作范围

后端会按设备类型生成不同的系统提示词。Linux 主机可以返回 `command`、`write_file`、`update_file`，网络设备只允许返回 CLI 命令。

核心约束是：需要执行命令时，模型必须在回复末尾给出一个 JSON command。

```rust
const AI_COMMON_SYSTEM_PROMPT: &str = r###"你是 SSH 终端助手，负责帮用户执行命令、分析输出、整理服务器信息。用中文简洁回复。

需要执行终端命令时，在回复末尾单独给一个 JSON command 代码块；具体命令必须符合当前设备类型。

已有输出足够时直接总结；还需要继续时只给下一步动作。说明里的示例命令用行内代码，不要放进 bash/shell/sh 代码块。命令仍在运行时，不要把暂无输出当作失败或完成。"###;
```

Linux 场景允许文件动作：

```json
{"action":"write_file","path":"/tmp/example.txt","content":["第一行","第二行"]}
```

网络设备场景则直接禁止文件写入：

````rust
const AI_NETWORK_ACTION_PROMPT: &str = r###"当前连接目标是交换机、防火墙、路由器等网络设备。

网络设备通常没有可用的 SFTP 文件写入能力，禁止返回 write_file、update_file、fileWrite 或 file_write。
需要查看或修改配置时，只能通过设备 CLI 交互，回复末尾最多给一个 JSON command：
```json
{"command":"show version"}
```
"###;
````

这里的重点不是“提示词能保证安全”，而是先把模型输出的形状压窄。后面的程序解析、确认、执行保护才是真正的控制点。

## 兼容模型输出，但不完全相信模型

不同模型对格式的遵守程度不一样。有的会严格输出 JSON 代码块，有的会直接输出裸 JSON，有的会给一个单行 Shell 代码块，还有的会带 `$ docker ps` 这种命令行示例。

所以后端解析时做了多层兼容：

```rust
fn parse_ai_response(text: &str) -> (String, Option<String>, Option<AiFileWrite>) {
    // 1. 优先解析 JSON 代码块
    if let Some(action) = extract_json_action(text) {
        let clean_text = remove_json_block(text);
        return match action {
            AiResponseAction::Command(command) => (clean_text, Some(command), None),
            AiResponseAction::FileWrite(file_write) => (clean_text, None, Some(file_write)),
        };
    }

    // 2. 兼容裸 JSON
    if let Some(action) = extract_bare_json_action(text) {
        return match action {
            AiResponseAction::Command(command) => ("".to_string(), Some(command), None),
            AiResponseAction::FileWrite(file_write) => ("".to_string(), None, Some(file_write)),
        };
    }

    // 3. 兼容单行 bash/shell 代码块
    if let Some(cmd) = extract_bash_command(text) {
        return (text.to_string(), Some(cmd), None);
    }

    // 4. 兼容 $ 开头的命令
    if let Some(cmd) = extract_dollar_command(text) {
        return (text.to_string(), Some(cmd), None);
    }

    (text.to_string(), None, None)
}
```

解析前还会清理推理模型残留：

```rust
let cleaned_response_text = strip_think_blocks(&response_text);
let (content, command, file_write) = parse_ai_response(&cleaned_response_text);
```

这个设计比较实用：对模型输出宽容，但只承认程序能解析出的动作。没解析出来，就当普通回答展示，不直接执行。

## 确认模式和自动模式

前端把操作模式分成两种：

1. **确认模式**：AI 给出命令后，只显示待执行状态，用户点确认后才写入终端。
2. **自动模式**：AI 给出命令后立即执行，并把输出继续交给 AI 分析。

自动模式的核心问题是防循环。比如模型不断建议同一条命令，或者一直围绕一个无效方向排查，就不能让它无限跑。

```ts
const registerAutoCommand = (command: string) => {
  const normalizedCommand = normalizeCommandForLoopGuard(command);
  const chain = autoCommandChainRef.current;

  if (chain.commands.includes(normalizedCommand)) {
    return {
      allowed: false,
      reason: `检测到 AI 重复建议同一条命令，已停止自动执行以避免循环：${command}`,
    };
  }

  if (chain.count >= MAX_AUTO_CHAIN_COMMANDS) {
    return {
      allowed: false,
      reason: `本轮任务已连续自动执行 ${MAX_AUTO_CHAIN_COMMANDS} 条命令，已暂停以避免循环。`,
    };
  }

  chain.commands.push(normalizedCommand);
  chain.count += 1;
  return { allowed: true };
};
```

这里不是判断命令是否“危险”，而是保证自动链路不会失控。真正高风险命令还需要更细的命令策略，比如按 `rm`、`mkfs`、`shutdown`、重定向覆盖等规则做风险分级。

## 文件写入不走 Shell

让 AI 生成下面这种命令看起来方便：

```bash
cat > /etc/demo.conf <<'EOF'
...
EOF
```

但在真实 SSH 终端里，这种方式很容易受到引号、转义、终端状态、复制粘贴中断影响。这里把文件写入抽成了独立动作：

```json
{"action":"update_file","path":"/tmp/example.txt","mode":"replace","oldContent":"旧内容","content":"新内容"}
```

前端收到文件动作后，不把它当 Shell 命令执行，而是走 SFTP：

```ts
if (mode === 'append') {
  await invoke('sftp_append_file', {
    sessionId,
    path: fileWrite.path,
    content: fileWrite.content,
    ensureNewline: fileWrite.ensureNewline ?? !fileWrite.content.startsWith('\n'),
  });
} else if (mode === 'overwrite') {
  await invoke('sftp_write_file', {
    sessionId,
    path: fileWrite.path,
    content: fileWrite.content,
  });
}
```

对于局部修改，会先读取远程文件，再用 `oldContent` 或 `anchor` 定位：

```ts
if (mode === 'replace') {
  const oldContent = fileWrite.oldContent;
  if (!oldContent) {
    throw new Error('replace 更新缺少 oldContent，无法定位要替换的内容');
  }

  const index = current.indexOf(oldContent);
  if (index < 0) {
    throw new Error('没有在远程文件中找到 oldContent，已停止更新以避免误改');
  }

  return `${current.slice(0, index)}${fileWrite.content}${current.slice(index + oldContent.length)}`;
}
```

这个设计的好处是：文件变更有明确语义，失败时可以停止，不需要靠 Shell 重定向去赌。

## 长任务要有滚动记忆

自动排查不是一次问答，而是一串命令和输出。直接把所有历史都塞给模型，很快会遇到上下文长度、重复输出和无关日志的问题。

这个智能终端项目做了两层处理：

1. 后端按 provider 的上下文窗口估算历史消息预算。
2. 前端把任务目标、已执行命令、关键输出和 AI 分析压缩成滚动摘要。

```ts
const appendTaskSummary = (entry: string) => {
  const normalizedEntry = entry.replace(/\n{3,}/g, '\n\n').trim();
  if (!normalizedEntry) return;

  const currentSummary = activeTaskSummaryRef.current.trim();
  const nextSummary = currentSummary
    ? `${currentSummary}\n\n${normalizedEntry}`
    : normalizedEntry;

  activeTaskSummaryRef.current = nextSummary;
  persistTaskMemory();
  void compressTaskSummaryIfNeeded();
};
```

压缩摘要时会要求保留目标、已确认事实、成功命令、失败命令和下一步，而不是保留完整输出。

## 总结

AI 接入 SSH 终端时，关键不是让模型“更聪明”，而是把模型从执行者降级成建议者，把真正的执行权交给程序流程控制。

这套设计可以总结成几条：

1. 模型输出必须被解析成明确动作。
2. 命令建议和命令执行分离。
3. 自动模式必须有重复检测、链路上限和停止机制。
4. 文件写入不要靠 Shell 拼文本，应该走结构化动作。
5. 长任务不能无脑堆历史，要维护滚动摘要。

这样做之后，AI 仍然可能判断错误，但错误会被限制在一条可观察、可停止、可回放的执行链路里。
