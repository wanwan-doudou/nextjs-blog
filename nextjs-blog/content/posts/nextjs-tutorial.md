---
title: Next.js 14 入门教程
date: 2024-01-02
tags:
  - Next.js
  - React
  - 前端
categories:
  - 技术
---

# Next.js 14 入门教程

Next.js 是一个基于 React 的全栈 Web 框架，提供了开箱即用的服务端渲染、静态生成等功能。

## 为什么选择 Next.js？

1. **开箱即用** - 零配置即可开始开发
2. **服务端渲染** - 更好的 SEO 和首屏加载速度
3. **文件系统路由** - 基于文件结构自动生成路由
4. **API 路由** - 轻松创建后端 API

## App Router

Next.js 14 推荐使用 App Router，它提供了更强大的功能：

```typescript
// app/page.tsx
export default function Home() {
  return <h1>Hello, Next.js!</h1>;
}
```

## 服务端组件

默认情况下，App Router 中的组件都是服务端组件：

```typescript
// 这是一个服务端组件
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <div>{data.title}</div>;
}
```

## 客户端组件

使用 `"use client"` 指令创建客户端组件：

```typescript
"use client";

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## 总结

Next.js 14 是一个强大的 React 框架，适合构建各种类型的 Web 应用。
