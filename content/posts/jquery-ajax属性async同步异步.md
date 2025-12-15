---
title: jquery ajax属性async(同步异步)
date: 2021-12-16 00:00:00
tags:
  - jquery
---

在jquery的ajax中如果我们希望实现同步或者异步我们可以直接设置async发生为真或假即可true false，下面举几个jquery ajax同步和异步实例

一.什么是同步请求：(false)
同步请求即是当前发出请求后，浏览器什么都不能做，必须得等到请求完成返回数据之后，才会执行后续的代码，相当于是排队，前一个人办理完自己的事务，下一个人才能接着办。也就是说，当JS代码加载到当前AJAX的时候会把页面里所有的代码停止加载，页面处于一个假死状态，当这个AJAX执行完毕后才会继续运行其他代码页面解除假死状态(即当ajax返回数据后，才执行后面的function2)。

二.什么是异步请求：(true) 异步请求就当发出请求的同时，浏览器可以继续做任何事，Ajax发送请求并不会影响页面的加载与用户的操作，相当于是在两条线上，各走各的，互不影响。

一般默认值为true，异步。异步请求可以完全不影响用户的体验效果，无论请求的时间长或者短，用户都在专心的操作页面的其他内容，并不会有等待的感觉。

实例

```js
<script>  
    $.ajax({  
        url: '/contentBanner/page',  
        async: false,  
        success() {  
            console.log("第一次")  
        }  
    })  
    console.log("第二次")  
</script>
```

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830224239.png)

```js
<script>  
    $.ajax({  
        url: '/contentBanner/page',  
        async: true,  
        success() {  
            console.log("第一次")  
        }  
    })  
    console.log("第二次")  
</script>
```

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830224253.png)