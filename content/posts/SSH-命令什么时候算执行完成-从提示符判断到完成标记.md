---
title: "SSH 命令什么时候算执行完成：从提示符判断到完成标记"
date: 2026-05-18
tags: ["SSH", "xterm", "AI", "Tauri", "终端"]
categories: ["桌面开发"]
description: "记录智能终端中判断远程命令执行完成的实现：提示符匹配、命令标记、退出码捕获、网络设备兜底和交互程序处理。"
---

## 问题背景

普通 SSH 终端里，用户看见提示符回来，就知道上一条命令执行完了。但程序没有这么简单。

智能终端需要把命令输出继续交给 AI 分析，所以必须判断一条命令什么时候结束。如果判断早了，AI 会拿到不完整输出；判断晚了，界面会一直处于“等待命令执行完成”；如果遇到 `less`、`more`、网络设备分页输出，还可能卡在交互界面里。

一开始最直观的方案是匹配 Shell 提示符，比如：

```ts
const SHELL_PROMPT_PATTERNS = [
  /^[\w.-]+@[\w.-]+:.*[$#]\s*$/,
  /^\[[^\]]+@[^\]]+\][$#]\s*$/,
  /^root@[\w.-]+:.*#\s*$/,
  /^PS\s+[A-Z]:\\.*>\s*$/i,
];
```

这个方案能处理一部分情况，但不够稳。

## 只靠提示符的问题

提示符判断有几个天然缺陷：

1. 不同系统的 prompt 格式不一样。
2. 命令输出里可能出现类似 prompt 的文本。
3. 长命令执行时可能长时间没有输出。
4. 有些命令结束后不会返回标准 prompt。
5. 网络设备的 prompt 和 Linux Shell 完全不是一套格式。

所以对 Linux 命令采用更强的方式：给命令包一层开始标记和结束标记。

## 给命令加开始和结束标记

Linux Shell 支持 `printf` 和 `$?`，可以在命令前后插入控制标记：

```ts
export function buildInstrumentedCommand(command: string, markerId: string): string {
  const markers = getCommandMarkers(markerId);
  const normalizedCommand = command.replace(/\r\n/g, '\n').trimEnd();

  return [
    `printf '\\n%s\\n' ${shellSingleQuote(markers.start)}`,
    normalizedCommand,
    '__ai_ssh_exit=$?',
    `printf '\\n%s:%s\\n' ${shellSingleQuote(markers.end)} "$__ai_ssh_exit"`,
  ].join('\n');
}
```

实际发到终端里的命令类似这样：

```bash
printf '\n%s\n' '__AI_SSH_CMD_START_xxx__'
docker ps
__ai_ssh_exit=$?
printf '\n%s:%s\n' '__AI_SSH_CMD_END_xxx__' "$__ai_ssh_exit"
```

这样程序就不用猜“最后一行是不是提示符”，而是直接等待结束标记出现。结束标记后面还带了退出码。

## 解析输出时只保留真正结果

终端输出里会混着命令回显、开始标记、结束标记和内部控制行。解析时要把这些东西剥掉，只留下命令输出。

```ts
export function parseInstrumentedCommandOutput(
  output: string,
  markerId: string,
  command: string
): InstrumentedCommandOutput {
  const markers = getCommandMarkers(markerId);
  const normalizedOutput = output.replace(/\r/g, '');
  const lines = normalizedOutput.split('\n');
  const endPattern = new RegExp(`${escapeRegExp(markers.end)}:(\\d+)`);

  let startLineIndex = -1;
  let endLineIndex = -1;
  let exitCode: number | undefined;

  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();

    if (trimmed === markers.start || trimmed.includes(markers.start)) {
      startLineIndex = index;
      continue;
    }

    const endMatch = trimmed.match(endPattern);
    if (endMatch) {
      endLineIndex = index;
      exitCode = Number.parseInt(endMatch[1], 10);
      break;
    }
  }

  const bodyStart = startLineIndex >= 0 ? startLineIndex + 1 : 0;
  const bodyEnd = endLineIndex >= 0 ? endLineIndex : lines.length;

  return {
    started: startLineIndex >= 0,
    completed: endLineIndex >= 0,
    exitCode,
    output: lines.slice(bodyStart, bodyEnd).join('\n').trim(),
  };
}
```

这一步很关键。AI 不应该看到内部 marker，也不应该把命令回显当成执行结果。

## 提示符仍然要作为兜底

标记方案也不是万能的。如果命令被交互程序接管，或者远程环境不支持预期的 Shell 行为，还是要回到提示符判断。

执行命令时会不断轮询终端输出：

```ts
const promptCompleted = shouldInstrumentCommand
  ? detectNewPromptLine(output)
  : detectNetworkPromptLine(output) || detectNewPromptLine(output);

if (!parsed.completed && Date.now() - startTime >= PROMPT_COMPLETION_GRACE_MS && promptCompleted) {
  parsed = {
    ...parsed,
    completed: true,
  };
}
```

也就是说：

1. 优先看结束标记。
2. 如果标记没出现，但提示符已经回来，就按完成处理。
3. 仍然不完成，就继续等待，直到超时。

这种组合比单纯 prompt 匹配稳很多。

## 网络设备不能直接套 Shell 标记

交换机、防火墙、路由器这类设备通常不是标准 Linux Shell。你不能随便发送：

```bash
printf ...
__ai_ssh_exit=$?
```

所以网络设备只能使用更保守的策略：

```ts
const NETWORK_PROMPT_PATTERNS = [
  /^[A-Za-z0-9_.:-]+(?:\([A-Za-z0-9_.:/-]+\))?\s*[>#]\s*$/,
  /^<[^>\r\n]{1,120}>\s*$/,
  /^\[[~*]?[A-Za-z0-9_.:/-]+(?:-[A-Za-z0-9_.:/-]+)*\]\s*$/,
];
```

对应的判断逻辑是：

1. 如果检测到网络设备 prompt，认为命令完成。
2. 如果有输出但长时间不再变化，也认为完成。
3. 如果检测到分页器，自动发送空格继续翻页。

```ts
if (
  !shouldInstrumentCommand &&
  !parsed.completed &&
  parsed.output.trim() &&
  Date.now() - lastOutputAt >= NETWORK_PROMPT_FALLBACK_IDLE_MS &&
  !detectInteractiveProgram(output)
) {
  parsed = {
    ...parsed,
    completed: true,
  };
}
```

这是一个取舍：网络设备协议差异太大，程序只能做“足够稳”的兜底，不能像 Linux Shell 一样拿到精确退出码。

## 处理 less、more、vim 这类交互程序

AI 自动执行命令时，如果上一条命令打开了 `less` 或 `more`，下一条命令可能根本不会进入 Shell，而是被分页器吃掉。

所以执行前会先检查当前终端输出是否处于交互程序：

```ts
const currentOutput = getOutput(sessionId);
const exitKey = detectInteractiveProgram(currentOutput);

if (exitKey) {
  onExecuteCommand(exitKey, { appendNewline: false });
  await new Promise(resolve => setTimeout(resolve, 500));
}
```

交互程序的识别主要看末尾特征：

```ts
const INTERACTIVE_PROGRAM_PATTERNS = [
  { pattern: /\(END\)\s*$/i, exitKey: 'q' },
  { pattern: /--More--/i, exitKey: ' ' },
  { pattern: /:\s*$/, exitKey: 'q', requiresCheck: true },
  { pattern: /\[ nano /i, exitKey: '\x18' },
];
```

这类处理不是为了完美模拟终端，而是为了避免 AI 自动链路被常见分页器卡住。

## 超时比无限等待更重要

再复杂的完成检测也会遇到边界情况。比如命令一直运行、网络断开、远程程序卡住、输出被应用吞掉。

所以等待必须有上限：

```ts
while (Date.now() - startTime < MAX_WAIT_TIME) {
  // 轮询输出并判断是否完成
}

if (!parsed.completed) {
  timedOut = true;
}
```

超时后不会继续把不完整结果交给 AI 自动分析，而是把命令状态标记为 timeout，并提示用户命令仍未结束。

## 总结

SSH 命令完成检测不是一个简单的正则问题。比较可靠的做法是分层：

1. Linux Shell 命令用开始/结束标记拿到精确边界和退出码。
2. 提示符判断作为兜底，不作为唯一依据。
3. 网络设备单独处理，不强行套 Shell 语义。
4. 分页器和交互程序要提前识别。
5. 自动执行必须有超时，不能无限等待。

这样 AI 拿到的命令结果才更接近真实执行结果，后续分析也不会建立在半截输出上。
