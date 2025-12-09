---
title: TailwindCSS 实用技巧
date: 2024-01-03
tags:
  - TailwindCSS
  - CSS
  - 前端
categories:
  - 技术
---

# TailwindCSS 实用技巧

TailwindCSS 是一个实用优先的 CSS 框架，让你可以快速构建现代化的用户界面。

## 基础用法

```html
<div class="bg-blue-500 text-white p-4 rounded-lg">
  Hello, TailwindCSS!
</div>
```

## 响应式设计

TailwindCSS 提供了简洁的响应式前缀：

```html
<div class="text-sm md:text-base lg:text-lg">
  响应式文字
</div>
```

- `sm:` - 640px 及以上
- `md:` - 768px 及以上
- `lg:` - 1024px 及以上
- `xl:` - 1280px 及以上

## 暗黑模式

```html
<div class="bg-white dark:bg-gray-800 text-black dark:text-white">
  支持暗黑模式
</div>
```

## 自定义颜色

在 `tailwind.config.js` 中添加自定义颜色：

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
      },
    },
  },
};
```

## 动画效果

```html
<button class="transition-all duration-300 hover:scale-105">
  悬停放大
</button>
```

## 总结

TailwindCSS 让 CSS 开发变得更加高效和有趣！
