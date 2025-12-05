---
title: vm.$nextTick( [callback] )
date: 2022-01-13 00:00:00
tags:
  - vue
---

在项目开发中，经常会遇到这样的场景。通过ajax获取到数据后，我们要去渲染dom或者初始化列表使用的滚动插件。

当数据没有渲染完成，就去获取DOM节点，这样是获取不到的

参数：{Function} [callback]

用法：将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。它跟全局方法 `Vue.nextTick` 一样，不同的是回调的 `this` 自动绑定到调用它的实例上。

示例：
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    8  
    9  
    10  
    11  
    12  
    13  
    14  
    15  
    16  
    

| 
    
    
    new Vue({    
      // ...    
      methods: {    
        // ...    
        example: function () {    
          // 修改数据    
          this.message = 'changed'    
          // DOM 还没有更新    
          this.$nextTick(function () {    
            // DOM 现在更新了    
            // `this` 绑定到当前实例    
            this.doSomethingElse()    
          })    
        }    
      }    
    })  
      
  
---|---  
      
    
    1  
    2  
    3  
    4  
    

| 
    
    
    this.$nextTick(() => {    
    	this.collItemCalcHeight(index);    
    	this.calcHeight();    
    });  
      
  
---|---
