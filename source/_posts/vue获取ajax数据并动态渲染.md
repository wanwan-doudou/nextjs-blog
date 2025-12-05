---
title: vue获取ajax数据并动态渲染
date: 2021-12-15 00:00:00
tags:
  - vue
---

实例

```js
var app = new Vue({  
    el: "#app",  
    data: {  
        res: []  
    }  
})  
$(function () {  
    $('.carousel').carousel({  
        interval: 5000  
    })  
});  
//查询content banner  
window.onload = function () {  
    $.ajax({  
        url: '',  
        method: "GET",  
        success(res) {  
            app.res = res;  
            return res;  
        }  
    });  
};
```

```js
<div class="item" v-for="(image,index) in res">  
    <img :src="image.cover" data-holder-rendered="true">  
</div>
```