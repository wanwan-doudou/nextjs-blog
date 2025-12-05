---
title: uni-app 监听和触发全局自定义事件
date: 2022-01-08 00:00:00
tags:
  - uniapp
---

### uni.$emit(eventName,OBJECT)

触发全局的自定义事件，附加参数都会传给监听器回调函数。

eventName:事件名，String类型

OBJEC:触发事件携带的附加参数,Object类型

示例：
    
    
    1  
    2  
    3  
    

| 
    
    
    like(msg){    
    	uni.$emit('like', msg)    
    },  
      
  
---|---  
  
**uni.$on(eventName,callback)**

监听全局的自定义事件，事件由 `uni.$emit` 触发，回调函数会接收事件触发函数的传入参数。

eventName: 事件名，String类型

callback: 事件的回调函数，Function类型

示例：
    
    
    1  
    2  
    3  
    4  
    

| 
    
    
    uni.$on('like', this.like);    
    like(msg) {    
    	console.log(msg);    
    }  
      
  
---|---
