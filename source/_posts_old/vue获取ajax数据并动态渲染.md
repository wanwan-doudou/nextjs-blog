---
title: vue获取ajax数据并动态渲染
date: 2021-12-15 00:00:00
tags:
  - vue
---

实例
    
    
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
    17  
    18  
    19  
    20  
    21  
    22  
    

| 
    
    
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
      
  
---|---  
      
    
    1  
    2  
    3  
    

| 
    
    
    <div class="item" v-for="(image,index) in res">    
        <img :src="image.cover" data-holder-rendered="true">    
    </div>  
      
  
---|---
