# Gal Blog - Next.js 重构版

基于 Hexo Gal 主题使用 Next.js 14 重构的博客系统。

## 技术栈

- **Next.js 14** - React 框架 (App Router)
- **TailwindCSS** - 原子化 CSS 框架
- **shadcn/ui** - UI 组件库
- **Lucide Icons** - 图标库

## 功能特性

- ✅ 首页文章列表 + 分页
- ✅ 文章详情页
- ✅ 归档页面
- ✅ 标签页面
- ✅ 关于页面
- ✅ 壁纸页面
- ✅ 背景轮播
- ✅ 响应式设计
- ✅ 暗色主题

## 开始使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 目录结构

```
src/
├── app/                  # 页面路由
│   ├── page.tsx          # 首页
│   ├── posts/[slug]/     # 文章详情
│   ├── archives/         # 归档
│   ├── tags/[tag]/       # 标签
│   ├── about/            # 关于
│   └── wallpaper/        # 壁纸
├── components/           # 组件
│   ├── layout/           # 布局组件
│   ├── sidebar/          # 侧边栏组件
│   ├── posts/            # 文章组件
│   └── ui/               # UI 组件
├── config/               # 配置文件
├── content/posts/        # Markdown 文章
├── lib/                  # 工具函数
└── styles/               # 样式文件

content/
└── posts/                # Markdown 文章目录
```

## 添加文章

在 `content/posts/` 目录下创建 `.md` 文件：

```markdown
---
title: 文章标题
date: 2024-01-01
tags:
  - 标签1
  - 标签2
categories:
  - 分类
top: false
---

文章内容...
```

## 配置

编辑 `src/config/site.ts` 修改站点配置。

## 部署

推荐使用 Vercel 部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## License

MIT
