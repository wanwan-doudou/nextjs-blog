---
title: uni-app 页面通信与数据缓存实践
date: 2026-02-09 00:00:00
tags:
  - uniapp
  - 前端
categories:
  - 技术
description: uni-app 中最常用的页面跳转、对象传参、事件通信、本地缓存和键盘顶起问题处理方案。
---

## 1. 页面跳转与基础参数

`uni.navigateTo` 会保留当前页面栈，并跳转到新页面。

```js
uni.navigateTo({
  url: "/pages/test/test?id=1&name=uniapp",
});
```

在目标页 `onLoad` 中读取参数：

```js
export default {
  onLoad(option) {
    console.log(option.id);
    console.log(option.name);
  },
};
```

## 2. 传递对象参数（推荐编码）

对象不能直接拼到 URL，先 `JSON.stringify` 再编码，目标页再解码解析。

```js
// 发起页
toRemind() {
  const obj = JSON.stringify(this.dynamicLike);
  uni.navigateTo({
    url: "/pages/square/remind?obj=" + encodeURIComponent(obj),
  });
}
```

```js
// 目标页
onLoad(options) {
  this.userInfo = JSON.parse(decodeURIComponent(options.obj));
}
```

## 3. 页面间双向通信（eventChannel）

当 URL 参数过长或需要实时回传数据时，优先用 `eventChannel`。

```js
// 打开页
uni.navigateTo({
  url: "/pages/test/test?id=1",
  events: {
    acceptDataFromOpenedPage(data) {
      console.log("from child:", data);
    },
  },
  success(res) {
    res.eventChannel.emit("acceptDataFromOpenerPage", {
      source: "opener",
      payload: { id: 1 },
    });
  },
});
```

```js
// 被打开页
onLoad() {
  const eventChannel = this.getOpenerEventChannel();

  eventChannel.on("acceptDataFromOpenerPage", (data) => {
    console.log("from opener:", data);
  });

  eventChannel.emit("acceptDataFromOpenedPage", {
    source: "child",
    payload: { ok: true },
  });
}
```

## 4. 全局事件通信（uni.$emit / uni.$on）

适合不在父子关系里的页面或组件通信。

```js
// 发送方
uni.$emit("like", { postId: 1001, userId: 7 });
```

```js
// 接收方
onLoad() {
  uni.$on("like", this.handleLike);
},
onUnload() {
  uni.$off("like", this.handleLike);
},
methods: {
  handleLike(msg) {
    console.log(msg);
  },
}
```

## 5. 本地缓存读写

```js
// 写入
const users = uni.getStorageSync("users") || [];
users.push({ id: 1, name: "kwydy" });
uni.setStorageSync("users", users);

// 读取
const cachedUsers = uni.getStorageSync("users") || [];
console.log(cachedUsers);
```

## 6. 键盘弹出顶起页面问题

在 `pages.json` 对对应页面配置 `softinputMode: "adjustResize"`：

```json
{
  "path": "pages/topics/detail/detail",
  "style": {
    "navigationStyle": "custom",
    "softinputMode": "adjustResize"
  }
}
```

## 7. 使用建议

1. 简单参数用 URL，复杂对象优先 `eventChannel`。
2. 使用全局事件后，页面销毁时一定 `uni.$off`。
3. 缓存对象统一 JSON 结构，读取时提供默认值，避免空值报错。
