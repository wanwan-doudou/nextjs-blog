# Gal Blog

现代化的二次元风格个人博客系统，采用 Next.js 16 + React 19 + TypeScript 7 打造。

## 技术栈

- Next.js 16 (App Router)
- React 19
- TypeScript 7
- Tailwind CSS 4
- shadcn/ui + Radix UI
- oxlint（代码检查）

## 功能特性

- 首页文章列表 + 分页
- 文章详情页（Markdown 渲染）
- 标签页 / 归档页
- 搜索页
- 友情链接页 / 关于页 / 壁纸页
- 背景轮播与侧边栏小组件
- 响应式布局与暗色主题

## 开始使用

```bash
npm install
npm run dev
```

开发环境默认地址：<http://localhost:3000>

## 常用命令

```bash
# 代码检查（oxlint + 类型检查）
npm run lint

# 自动修复可修复的 lint 问题
npm run lint:fix

# 仅类型检查
npm run typecheck

# 生产构建
npm run build

# 启动生产服务
npm run start
```

## 目录结构

```text
src/
├── app/                    # 路由与页面
│   ├── (main)/
│   ├── posts/[slug]/
│   ├── tags/[tag]/
│   ├── archives/
│   ├── search/
│   ├── links/
│   ├── about/
│   └── wallpaper/
├── components/             # 业务组件 + UI 组件
│   ├── layout/
│   ├── sidebar/
│   ├── posts/
│   ├── post/
│   ├── features/
│   └── ui/
├── config/site.ts          # 站点配置
├── lib/posts.ts            # Markdown 文章读取与处理
└── app/globals.css         # 全局样式（Tailwind CSS 4）

content/
├── posts/                  # 文章 Markdown
└── archive/                # 历史归档
```

## 添加文章

在 `content/posts/` 创建 `.md` 文件，例如：

```markdown
---
title: 文章标题
date: 2026-02-25
excerpt: 文章摘要（可选）
tags:
  - 标签1
  - 标签2
categories:
  - 分类
preview: /images/preview.jpg
top: false
---

文章内容...
```

## 配置说明

- 站点与菜单配置：`src/config/site.ts`
- Tailwind 配置：`tailwind.config.ts`
- PostCSS 配置：`postcss.config.mjs`（使用 `@tailwindcss/postcss`）
- Lint 配置：`.oxlintrc.json`

> 说明：TypeScript 7 与 typescript-eslint 暂不兼容（[typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)，需等 TS 7.1 的新 API），
> 因此改用原生支持 TypeScript 的 oxlint。待 typescript-eslint 支持 TS 7 后可按需切回 ESLint。

## 部署

推荐使用 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## License

MIT
