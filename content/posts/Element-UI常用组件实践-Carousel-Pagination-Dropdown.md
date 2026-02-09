---
title: Element UI 常用组件实践：Carousel、Pagination、Dropdown
date: 2026-02-09 00:00:00
tags:
  - element
  - 前端
categories:
  - 技术
description: 合并整理 Element UI 中轮播图、分页和下拉菜单三个高频组件的最小可用写法与常见坑位。
---

## 1. 基础引入

```html
<!-- Vue 2 -->
<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>

<!-- Element UI -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css" />
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
```

## 2. Carousel（走马灯）

```html
<el-carousel :interval="5000" arrow="hover" height="240px">
  <el-carousel-item v-for="(item, index) in banners" :key="index">
    <img :src="item.src" :alt="item.title" style="width: 100%; height: 100%; object-fit: cover;" />
  </el-carousel-item>
</el-carousel>
```

```js
new Vue({
  el: "#app",
  data: {
    banners: [
      { title: "A", src: "/images/a.jpg" },
      { title: "B", src: "/images/b.jpg" },
    ],
  },
});
```

## 3. Pagination（分页）

```html
<el-pagination
  background
  :current-page="page"
  :page-size="pageSize"
  layout="total, prev, pager, next, jumper"
  :total="total"
  @current-change="handlePageChange"
/>
```

```js
new Vue({
  el: "#app",
  data: {
    page: 1,
    pageSize: 10,
    total: 1000,
  },
  methods: {
    handlePageChange(nextPage) {
      this.page = nextPage;
      this.loadData();
    },
    loadData() {
      // 根据 this.page / this.pageSize 请求后端
    },
  },
});
```

## 4. Dropdown（点击后不自动收起）

当下拉项里有复选框、输入框、二次确认操作时，默认点击即关闭会影响交互。  
可通过 `:hide-on-click="false"` 保持菜单展开。

```html
<el-dropdown trigger="click" :hide-on-click="false">
  <span class="el-dropdown-link">
    下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
  </span>
  <el-dropdown-menu slot="dropdown">
    <el-dropdown-item>
      <el-checkbox v-model="checkedA">选项A</el-checkbox>
    </el-dropdown-item>
    <el-dropdown-item divided @click.native="saveConfig">保存配置</el-dropdown-item>
  </el-dropdown-menu>
</el-dropdown>
```

## 5. 一页整合示例

```html
<div id="app">
  <el-carousel :interval="4000" height="220px">
    <el-carousel-item v-for="(item, index) in banners" :key="index">
      <img :src="item.src" style="width: 100%; height: 100%; object-fit: cover;" />
    </el-carousel-item>
  </el-carousel>

  <div style="margin: 16px 0;">
    <el-dropdown trigger="click" :hide-on-click="false">
      <span class="el-dropdown-link">筛选条件<i class="el-icon-arrow-down el-icon--right"></i></span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>
          <el-checkbox v-model="onlyOnline">仅在线</el-checkbox>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>

  <el-pagination
    background
    :current-page="page"
    :page-size="pageSize"
    layout="total, prev, pager, next"
    :total="total"
    @current-change="handlePageChange"
  />
</div>
```

## 6. 常见问题

1. 分页点击没反应：忘记监听 `@current-change` 或没触发重新请求。
2. 轮播图不显示：父容器高度为 0，或图片地址 404。
3. Dropdown 点击即关闭：没设置 `:hide-on-click="false"`。
