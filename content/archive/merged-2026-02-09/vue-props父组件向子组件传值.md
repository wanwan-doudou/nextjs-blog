---
title: vue props父组件向子组件传值
date: 2021-12-14 00:00:00
tags:
  - vue
---

`props` 可以是数组或对象，用于接收来自父组件的数据。`props` 可以是简单的数组，或者使用对象作为替代，对象允许配置高级选项，如类型检测、自定义验证和设置默认值。

你可以基于对象的语法使用以下选项：

- type：可以是下列原生构造函数中的一种：String、Number、Boolean、Array、Object、Date、Function、Symbol、任何自定义构造函数、或上述内容组成的数组。会检查一个 prop 是否是给定的类型，否则抛出警告。
- default：any为该 prop 指定一个默认值。如果该 prop 没有被传入，则换做用这个值。对象或数组的默认值必须从一个工厂函数返回。
- required：Boolean定义该 prop 是否是必填项。在非生产环境中，如果这个值为 truthy 且该 prop 没有被传入的，则一个控制台警告将会被抛出。
- validator：Function自定义验证函数会将该 prop 的值作为唯一的参数代入。在非生产环境下，如果该函数返回一个 falsy 的值 (也就是验证失败)，一个控制台警告将会被抛出。你可以在这里查阅更多 prop 验证的相关信息。

实例

```js
//这是子组件  
<template>  
	<view>  
		<view>{{ name||'默认值' }}</view>  
	</view>  
</template>  
  
<script>  
export default {  
	props: {  
		name: {  
			type: String,  
			default: 'kwydy',  
		}  
	},  
	data() {  
		return {};  
	},  
	methods: {}  
};  
</script>
```

```js
//这是父组件  
<template>  
	<view class="container">  
		<view><props :name="href"></props></view>  
	</view>  
</template>  
  
<script>  
import props from '@/components/uni-section/props/props.vue';  
export default {  
	components: {  
		props  
	},  
	data() {  
		return {  
			href: 'https://uniapp.dcloud.io/component/README?id=uniui'  
		};  
	},  
	methods: {}  
};  
</script>
```

这是效果图

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830224024.png)