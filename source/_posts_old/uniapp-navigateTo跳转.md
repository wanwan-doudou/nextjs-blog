---
title: uniapp navigateTo跳转
date: 2021-12-06 00:00:00
tags:
  - uniapp
---

uni.navigateTo(OBJECT)

保留当前页面，跳转到应用内的某个页面，使用`uni.navigateBack`可以返回到原页面。

参考代码：
    
    
    1  
    

| 
    
    
    <view class="square-like-user" @tap="navigateTo('/pages/contact/contact-detail/contact-detail?id=' + itemRe.id)">  
      
  
---|---  
  
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830221642.png)  
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830221722.png)  
**示例**
    
    
    1  
    2  
    3  
    4  
    

| 
    
    
    //在起始页面跳转到test.vue页面并传递参数    
    uni.navigateTo({    
        url: 'test?id=1&name=uniapp'    
    });  
      
  
---|---  
      
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    

| 
    
    
    // 在test.vue页面接受参数    
    export default {    
        onLoad: function (option) { //option为object类型，会序列化上个页面传递的参数    
            console.log(option.id); //打印出上个页面传递的参数。    
            console.log(option.name); //打印出上个页面传递的参数。    
        }    
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
    23  
    24  
    25  
    26  
    27  
    28  
    29  
    30  
    31  
    32  
    33  
    34  
    

| 
    
    
    // 在起始页面跳转到test.vue页面，并监听test.vue发送过来的事件数据    
    uni.navigateTo({    
      url: 'pages/test?id=1',    
      events: {    
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据    
        acceptDataFromOpenedPage: function(data) {    
          console.log(data)    
        },    
        someEvent: function(data) {    
          console.log(data)    
        }    
        ...    
      },    
      success: function(res) {    
        // 通过eventChannel向被打开页面传送数据    
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'data from starter page' })    
      }    
    })    
        
    // 在test.vue页面，向起始页通过事件传递数据    
    onLoad: function(option) {    
      // #ifdef APP-NVUE    
      const eventChannel = this.$scope.eventChannel; // 兼容APP-NVUE    
      // #endif    
      // #ifndef APP-NVUE    
      const eventChannel = this.getOpenerEventChannel();    
      // #endif    
      eventChannel.emit('acceptDataFromOpenedPage', {data: 'data from test page'});    
      eventChannel.emit('someEvent', {data: 'data from test page for someEvent'});    
      // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据    
      eventChannel.on('acceptDataFromOpenerPage', function(data) {    
        console.log(data)    
      })    
    }  
      
  
---|---  
  
url有长度限制，太长的字符串会传递失败，可改用[窗体通信](https://uniapp.dcloud.io/collocation/frame/communication)、[全局变量](https://ask.dcloud.net.cn/article/35021)，另外参数中出现空格等特殊字符时需要对参数进行编码，如下为使用`encodeURIComponent`对参数进行编码的示例。
    
    
    1  
    

| 
    
    
    <navigator :url="'/pages/test/test?item='+ encodeURIComponent(JSON.stringify(item))"></navigator>  
      
  
---|---  
      
    
    1  
    

| 
    
    
    <navigator :url="'/pages/test/test?item='+ encodeURIComponent(JSON.stringify(item))"></navigator>  
      
  
---|---  
  
**注意：**

  * 页面跳转路径有层级限制，不能无限制跳转新页面
  * 跳转到 tabBar 页面只能使用 switchTab 跳转
  * 路由API的目标页面必须是在pages.json里注册的vue页面。如果想打开web url，在App平台可以使用 [plus.runtime.openURL](http://www.html5plus.org/doc/zh_cn/runtime.html#plus.runtime.openURL)或web-view组件；H5平台使用 window.open；小程序平台使用web-view组件（url需在小程序的联网白名单中）。在hello uni-app中有个组件ulink.vue已对多端进行封装，可参考。
  * APP-NVUE平台暂不支持以`this.getOpenerEventChannel()`方式获取`eventChannel`，请换用`this.$scope.eventChannel`来获取，具体方式请参考上述示例。


