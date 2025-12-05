---
title: vue 数据绑定注意事项
date: 2022-01-21 00:00:00
tags:
  - vue
---

今天在项目中遇到了一个问题

我在data中定义了一个空 groupDetail: { }对象
    
    
    1  
    2  
    3  
    

| 
    
    
    data() {    
    	groupDetail: {},    
    }  
      
  
---|---  
  
在回调函数中给这个groupDetail赋值，结构是这样的
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    

| 
    
    
    groupDetail: {    
    	data: {    
    		name : 'kwydy',    
    		age : '19'    
    	}     
    },  
      
  
---|---  
  
在视图容器使用的时候我直接通过data.name去取，结果报错了
    
    
    1  
    

| 
    
    
    {{ groupDetail.data.name }}  
      
  
---|---  
  
把data里的groupDetail改成这样就可以了
    
    
    1  
    

| 
    
    
    groupDetail: { data: {} },  
      
  
---|---
