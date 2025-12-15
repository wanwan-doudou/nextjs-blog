---
title: element Pagination 分页
date: 2021-12-28 00:00:00
tags:
  - element
---

首先引入js和css

```js
<!-- 引入样式 -->  
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">  
<!-- 引入组件库 -->  
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
```

快速上手

```js
<el-pagination  
  background  
  layout="prev, pager, next"  
  :total="1000">  
</el-pagination>
```

效果如下：

[](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211228204802356.png)

具体参数如下：

[](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211228205243169.png)