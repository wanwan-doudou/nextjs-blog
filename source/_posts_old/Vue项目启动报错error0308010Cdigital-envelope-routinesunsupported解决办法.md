---
title: Vue项目启动报错“error:0308010C:digital envelope routines::unsupported解决办法”
date: 2023-04-24 00:00:00
tags:
  - vue
---

## Vue报错error:0308010C:digital envelope routines::unsupported

### 在package.json增加配置
    
    
    1  
    2  
    3  
    4  
    

| 
    
    
    "scripts": {  
        "serve": "set NODE_OPTIONS=--openssl-legacy-provider && vue-cli-service serve",  
        "build": "vue-cli-service build"  
      },  
      
  
---|---
