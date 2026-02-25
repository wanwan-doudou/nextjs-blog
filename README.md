# Gal Blog - Next.js 重构版

基于 Hexo Gal 主题重构的博客系统，当前使用 Next.js 16 + React 19。

## 技术栈

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui + Radix UI
- ESLint 10 (Flat Config) + typescript-eslint

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
# 代码检查
npm run lint

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
- ESLint 配置：`eslint.config.mjs`

## 部署

推荐使用 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## License

MIT
