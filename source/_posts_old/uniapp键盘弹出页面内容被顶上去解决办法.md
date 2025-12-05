---
title: uniapp键盘弹出，页面内容被顶上去，解决办法
date: 2022-01-26 00:00:00
tags:
  - uni-app
---

修改pages.json文件中，需要弹出键盘的页面
    
    
    1  
    2  
    3  
    

| 
    
    
    "style": {    
          "softinputMode": "adjustResize",    
    }  
      
  
---|---  
      
    
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
    

| 
    
    
    {    
    	"path": "pages/topics/detail/detail",    
    	"style": {    
    		"navigationBarTitleText": "",    
    		"titleNView": false,    
    		"navigationStyle": "custom",    
    		"softinputMode": "adjustResize",    
    		"enablePullDownRefresh": true    
    	}    
    },  
      
  
---|---
