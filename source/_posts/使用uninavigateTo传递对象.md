---
title: 使用uni.navigateTo()传递对象
date: 2022-01-06 00:00:00
tags:
  - uniapp
---

1.跳转页面

```js
data() {  
	return {  
		dynamicLike: {},  
	}  
}  
methods: {  
	toRemind() {  
			let obj = JSON.stringify(this.dynamicLike);  
			uni.navigateTo({  
				url: '/pages/square/remind?obj=' + encodeURIComponent(obj)  
			});  
			this.judge = false;  
		},  
}
```

2.接受界面

```js
onLoad(options) {  
		this.userInfo = JSON.parse(decodeURIComponent(options.obj));  
		console.log(this.userInfo);  
},
```