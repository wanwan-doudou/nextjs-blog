---
title: Vue子组件给父组件传值
date: 2021-12-21 00:00:00
tags:
  - vue
---

**子组件向父组件传值**

1.在子组件中创建一个按钮，给按钮绑定一个点击事件

在响应该点击事件的函数中使用$emit来触发一个自定义事件，并传递一个参数

```js
<template>  
	<div id="app">  
		<div>我是子组件</div>  
		<p>{{ msg }}</p>  
		<button type="button" @click="sendToMessageParent">向父组件传值</button>  
	</div>  
</template>  
  
<script>  
export default {  
	name: 'emit',  
	props: {  
		msg: {  
			type:String,  
			default:"莫瑞诺"  
		}  
	},  
	methods: {  
		sendToMessageParent: function() {  
			this.$emit('listToChild', '你好父组件');  
		}  
	}  
};  
</script>  
  
<style></style>
```

2.在父组件中的子标签中监听该自定义事件并添加一个响应该事件的处理方法

```js
<template>  
	<div id="app"><emit v-on:listToChild="show"></emit></div>  
</template>  
  
<script>  
// import emit from '@/components/emit/emit.vue';  
import emit from "../../components/emit/emit.vue"  
export default {  
	name: 'app',  
	components: {  
		emit,  
	},  
	data() {  
		return {  
			age:'18'  
		};  
	},  
	methods: {  
		show: function(data) {  
			console.log("123")  
			console.log(data)  
		}  
	}  
};  
</script>  
  
<style></style>
```

这是运行结果

[](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211221224045410.png)