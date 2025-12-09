# Gal 主题 → Next.js 重构计划

## 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: TailwindCSS + shadcn/ui
- **图标**: Lucide Icons
- **部署**: Vercel

---

## 重构模块清单

### 核心页面

| 模块 | 原文件 | 状态 |
|------|--------|------|
| 首页（文章列表+分页） | `index.ejs` | [ ] |
| 文章详情页 | `post.ejs`, `_partial/article.ejs` | [ ] |
| 归档页 | `archive.ejs`, `_partial/archive.ejs` | [ ] |
| 标签页 | `tags.ejs`, `tag.ejs` | [ ] |
| 分类页 | `categories.ejs`, `category.ejs` | [ ] |
| 关于页 | `page.ejs` | [ ] |
| 壁纸页 | `page/wallpaper.ejs` | [ ] |
| 搜索页 | `page/search.ejs` | [ ] |
| 404页面 | `page/404.ejs` | [ ] |

### 布局组件

| 模块 | 原文件 | 状态 |
|------|--------|------|
| 全局布局 | `layout.ejs` | [ ] |
| 头部导航（Logo/菜单） | `_partial/header.ejs` | [ ] |
| 页脚 | `_partial/footer.ejs` | [ ] |
| 侧边栏 | `_partial/sidebar.ejs` | [ ] |
| 背景轮播（支持API随机图） | `_partial/slideshow.ejs` | [ ] |
| 移动端背景图 | `xs_bg_image` 配置 | [ ] |

### 侧边栏组件

| 模块 | 原文件 | 状态 |
|------|--------|------|
| 作者信息（头像） | `_widget/author.ejs` | [ ] |
| 搜索框 | `_widget/search.ejs` | [ ] |
| 最新文章 | `_widget/recent_posts.ejs` | [ ] |
| 热门文章 | `_widget/hot_posts.ejs` | [ ] |
| 随机文章 | `_widget/random_posts.ejs` | [ ] |
| 热门标签 | `_widget/hot_tags.ejs` | [ ] |
| 友情链接 | `_widget/friend_links.ejs` | [ ] |
| 个人链接（Github等） | `_widget/links.ejs` | [ ] |

### 功能模块

| 模块 | 原文件/配置 | 状态 |
|------|-------------|------|
| Markdown 渲染 | 代码高亮 `highlight_theme` | [ ] |
| 随机封面图API | `default_preview.api_urls` | [ ] |
| 分页组件 | `_partial/pagination.ejs` | [ ] |
| 返回顶部 | `blog.js` | [ ] |
| 音乐播放器 | `music_player` APlayer | [ ] |
| 看板娘 | `sakana_widget` Sakana Widget | [ ] |
| 图片灯箱 | 替换 Highslide | [ ] |
| 输入特效 | `power_mode` activate-power-mode | [ ] |
| AOS 滚动动画 | `aos.js` | [ ] |
| 欧尼酱功能 | `_partial/oni.ejs`, `oni.js` | [ ] |
| 公告功能 | `_partial/issue.ejs` | [ ] |

### 移除模块

| 模块 | 原因 |
|------|------|
| 评论系统 (Gitment) | 不需要 |
| LeanCloud 统计 | 不需要 |

---

## 目录结构

```
src/
├── app/                  # 页面路由
│   ├── page.tsx          # 首页
│   ├── posts/[slug]/     # 文章详情
│   ├── archives/         # 归档
│   ├── tags/[tag]/       # 标签
│   └── about/            # 关于
├── components/           # 组件
│   ├── layout/           # 布局组件
│   ├── sidebar/          # 侧边栏组件
│   └── ui/               # UI 组件
├── content/posts/        # Markdown 文章
├── lib/                  # 工具函数
└── styles/               # 样式
```

---

## 进度跟踪

- [x] 项目初始化
- [x] 基础布局
- [x] 首页 + 文章列表
- [x] 文章详情页
- [x] 归档/标签/分类页
- [x] 侧边栏组件
- [x] 背景轮播
- [x] 功能模块（音乐播放器、看板娘、返回顶部）
- [ ] 部署
