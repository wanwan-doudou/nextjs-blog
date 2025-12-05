---
title: uni-app分享微信群聊功能
date: 2022-01-25 00:00:00
tags:
  - uni-app
---

使用uni-app实现分享给微信群或者发布到朋友圈功能

### [](https://kwydy.gitee.io/2022/01/25/uni-app%E5%88%86%E4%BA%AB%E5%8A%9F%E8%83%BD/#uni-share-OBJECT "uni.share\(OBJECT\)")[uni.share(OBJECT)](https://uniapp.dcloud.io/api/plugins/share?id=share)

uni-app的App引擎已经封装了微信、QQ、微博的分享SDK，开发者可以直接调用相关功能。

可以分享到微信、QQ、微博，每个社交平台被称为分享服务提供商，即provider。

可以分享文字、图片、图文横条、音乐、视频等多种形式。同时注意，分享为小程序也使用本API。即在App里可以通过本API把一个内容以小程序（通常为内容页）方式直接分享给微信好友。

[![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20220125201418124.png)](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20220125201418124.png)

实例：
    
    
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
    
    
    share() {    
    			console.log('share called');    
    			let url = 'https://www.kuangstudy.com/bbs/' + this.topicId;    
    			let cont = this.topic.topicContent.substring(0,30);    
    			console.log("cont",cont);    
    			console.log('url');    
    			uni.share({    
    				provider: 'weixin',    
    				scene: 'WXSceneSession',    
    				type: 0,    
    				href: url,    
    				summary: cont,    
    				title: this.topic.topicTitle,    
    				imageUrl: 'https://www.kuangstudy.com/assert/images/avatar/1.jpg',    
    				success: res => {    
    					console.log('success:' + JSON.stringify(res));    
    				},    
    				fail: err => {    
    					console.log('fail:' + JSON.stringify(err));    
    				}    
    			});    
    		},  
      
  
---|---  
  
效果图：

[![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20220125201627581.png)](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20220125201627581.png)

[![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20220125201652060.png)](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20220125201652060.png)
