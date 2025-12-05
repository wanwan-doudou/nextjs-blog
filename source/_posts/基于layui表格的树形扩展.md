---
title: 基于layui表格的树形扩展
date: 2021-12-09 00:00:00
tags:
  - layui
---

参考根据[官方文档](https://layui.itze.cn/extend/treeTable/index.html#doc)入门`treeTable树形表格`：

```js
{  
	elem: '#tree-table',// 必须  
	url: 'data/table-tree.json',// （url和data参数必须设置一个）  
	data: [{},{},{},...],  
	icon_key: 'title',// 必须  
	top_value: 0,  
	primary_key: 'id',  
	parent_key: 'pid',  
	hide_class: 'layui-hide',  
	icon: {  
		open: 'layui-icon layui-icon-triangle-d',  
		close: 'layui-icon layui-icon-triangle-r',  
		left: 16,  
	},  
	cols: [{  
		key: 'title',  
		title: '名称',  
		width: '100px',  
		template: function(item){return '显示内容'}  
	},{},...],  
	checked: {  
		key: 'id',  
		data: [0,1,4,10,11,5,2,6,7,3,8,9],  
	},  
	is_click_icon: false,  
	is_checkbox: false,  
	is_cache: true,  
	end: function(e){},  
}
```

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830222703.png)