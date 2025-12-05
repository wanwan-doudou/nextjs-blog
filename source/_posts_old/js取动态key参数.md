---
title: js取动态key参数
date: 2021-12-16 00:00:00
tags:
  - 前端
---

[前端](https://kwydy.gitee.io/tags/%E5%89%8D%E7%AB%AF/) 2021-12-16

有一个对象，其中包含若干个子对象，如何如何遍历这个对象中的子对象？
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    

| 
    
    
    var data = {    
        0:{"name":'wly'},    
        1:{"name":'kwy'}    
    }    
    for(var item in data ){    
        console.log(data[item].name)    
    }  
      
  
---|---  
  
[![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211216221915974.png)](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211216221915974.png)
