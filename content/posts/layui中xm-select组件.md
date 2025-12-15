---
title: layui中xm select组件
date: 2021-12-07 00:00:00
tags:
  - layui
---

# xm-select

#### 介绍

始于Layui, 下拉选择框的多选解决方案

前身[前往formSelectes](https://gitee.com/link?target=https://github.com/hnzzmsf/layui-formSelects), 由于渲染速度慢, 代码冗余, 被放弃了

`xm-select`使用了新的开发方式, 利用preact进行渲染, 大幅度提高渲染速度, 并且可以灵活拓展

[xm-select演示站点](https://maplemei.gitee.io/xm-select/)

支持功能

- 国际化 - 中文/英文
- 多选
- 单选
- 重复选
- 分组
- 工具条
- 创建条目
- 显示模式
- 搜索模式 (本地数据过滤, 远程搜索)
- 分页模式
- 下拉树
- 下拉任意 - 可以自己写html

#### 快读上手

> 直接使用

```js
1. 引入 `dist/xm-select.js`  
2. 写一个`<div id="demo1"></div>`  
3. 渲染  
	var demo1 = xmSelect.render({  
		el: '#demo1',   
		data: [  
			{name: '水果', value: 1, selected: true, disabled: true},  
			{name: '蔬菜', value: 2, selected: true},  
			{name: '桌子', value: 3, disabled: true},  
			{name: '北京', value: 4},  
		],  
   })
```

> 二次开发

```js
1. git clone https://gitee.com/maplemei/xm-select.git  
2. cd xm-select  
3. yarn 或者 npm install
```

实例

```js
<!-- 占位 -->  
<div id="demo1"></div>  
  
  
<!-- 引入插件 -->  
<script src="../dist/xm-select.js" type="text/javascript" charset="utf-8"></script>  
<!-- 渲染页面 -->  
<script type="text/javascript">  
	var demo1 = xmSelect.render({  
		// 这里绑定css选择器  
		el: '#demo1',   
		// 渲染的数据  
		data: [  
			{name: '水果', value: 1, selected: true, disabled: true},  
			{name: '蔬菜', value: 2, selected: true},  
			{name: '桌子', value: 3, disabled: true},  
			{name: '北京', value: 4},  
		],  
	})  
	  
	// 变量, demo1 可以通过API操作  
	// 获取选中值, demo1.getValue();  
	// 设置选中值, demo1.setValue([{ name: '动态值', value: 999 }])  
	// ...  
</script>
```

实例

```js
<div class="layui-input-block" id="demo1">  
    <input autocomplete="off" class="layui-input" name="projectPerson"  
           required="" type="hidden">  
 </div>  
 <script>  
 	var selectName = xmSelect.render({  
    el: '#demo1',  
    data: [[${detail.principals}]].map(({username: name, id: value}) => 				({name, value}))  
    })  
 </script>
```