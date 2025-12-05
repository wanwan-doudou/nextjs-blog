---
title: vue使用踩坑
date: 2022-01-10 00:00:00
tags:
  - 踩坑记录
---


    1  
    2  
    3  
    4  
    5  
    6  
    7  
    8  
    

| 
    
    
    layui.use(() => {    
    	let vue = new Vue({    
        	el: '#member-category-app',    
        	data: {    
           		noData: true    
        	}    
    	})    
    }  
      
  
---|---  
  
我在下面方法中给noData赋值时用了this.noData导致赋值失败
    
    
    1  
    2  
    3  
    4  
    5  
    

| 
    
    
    if (res.data.records.length > 0) {    
        this.noData = false;    
    } else {    
        this.noData = true;    
    }  
      
  
---|---  
  
正确写法应该是这样
    
    
    1  
    2  
    3  
    4  
    5  
    

| 
    
    
    if (res.data.records.length > 0) {    
         vue.noData = false;    
    } else {    
         vue.noData = true;    
    }  
      
  
---|---
