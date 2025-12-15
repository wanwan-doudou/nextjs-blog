---
title: layui分页模块
date: 2021-12-20 00:00:00
tags:
  - layui
---

快速使用

laypage 的使用非常简单，指向一个用于存放分页的容器，通过服务端得到一些初始值，即可完成分页渲染：

```js
<!DOCTYPE html>  
<html>  
<head>  
  <meta charset="utf-8">  
  <title>layPage快速使用</title>  
  <link rel="stylesheet" href="/static/build/layui.css" media="all">  
</head>  
<body>  
   
<div id="test1"></div>  
   
<script src="/static/build/layui.js"></script>  
<script>  
layui.use('laypage', function(){  
  var laypage = layui.laypage;  
    
  //执行一个laypage实例  
  laypage.render({  
    elem: 'test1' //注意，这里的 test1 是 ID，不用加 # 号  
    ,count: 50 //数据总数，从服务端得到  
  });  
});  
</script>  
</body>  
</html>
```

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830225209.png)

当分页被切换时触发，函数返回两个参数：*obj*（当前分页的所有选项值）、first（是否首次，一般用于初始加载的判断）

```js
laypage.render({  
  elem: 'test1'  
  ,count: 70 //数据总数，从服务端得到  
  ,jump: function(obj, first){  
    //obj包含了当前分页的所有参数，比如：  
    console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。  
    console.log(obj.limit); //得到每页显示的条数  
      
    //首次不执行  
    if(!first){  
      //do something  
    }  
  }  
});
```