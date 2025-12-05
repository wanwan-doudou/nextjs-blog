---
title: 使用uni.navigateTo()传递对象
date: 2022-01-06 00:00:00
tags:
  - uniapp
---

1.跳转页面
    
    
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
    

| 
    
    
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
      
  
---|---  
  
2.接受界面
    
    
    1  
    2  
    3  
    4  
    

| 
    
    
    onLoad(options) {    
    		this.userInfo = JSON.parse(decodeURIComponent(options.obj));    
    		console.log(this.userInfo);    
    },  
      
  
---|---
