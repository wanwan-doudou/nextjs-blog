---
title: uni-app数据缓存
date: 2022-01-07 00:00:00
tags:
  - uniapp
---

#### uni.setStorageSync(key,data)

将 data 存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容，这是一个同步接口。

示例：

```js
uni.setStorageSync('name','kwydy')
```

这里的”name”是本地缓存中指定的key

这里的”kwydy”是需要存储的内容

```js
newDynamicLike(msg) {  
			this.user = msg;  
			let users = uni.getStorageSync('users')||[]  
			users.push(this.user)  
			uni.setStorageSync('users',users)  
},
```

uni.getStorageSync(key)

从本地缓存中同步获取指定 key 对应的内容。

这里的”users”是从本地缓存中同步获取指定 key 对应的内容。