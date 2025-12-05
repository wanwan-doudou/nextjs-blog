---
title: JavaScript 赋值问题
date: 2021-12-31 00:00:00
tags:
  - 前端
---


    1  
    2  
    3  
    4  
    5  
    

| 
    
    
    let name = 'kwydy'    
    let aj = {data:name}    
    console.log(aj)    
    name = 'zgajbtcm'    
    console.log(aj)  
      
  
---|---  
  
[![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211231220834022.png)](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211231220834022.png)

可以看到aj还是为’kwydy’

我们需要再赋值一次
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    

| 
    
    
    let name = 'kwydy'    
    let aj = {data:name}    
    console.log(aj)    
    name = 'zgajbtcm'    
    aj = {data:name}    
    console.log(aj)  
      
  
---|---  
  
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830230521.png)
