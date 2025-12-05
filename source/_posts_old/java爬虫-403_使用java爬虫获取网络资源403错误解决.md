---
title: java爬虫 403_使用java爬虫获取网络资源403错误解决
date: 2022-12-20 00:00:00
tags:
  - java
---

今天爬虫的时候下载爬到的URL时候报这个错误

Server returned HTTP response code: 403 for URL:

这个错误。

有可能是服务器拒绝了java直接访问。

所以需要使用下面选中的部分。伪装成浏览器请求。
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    

| 
    
    
    URL url = new URL(imageUrl);    
    URLConnection uc;    
    uc = url.openConnection();    
    uc.addRequestProperty("User-Agent","Mozilla/4.0 (compatible; MSIE 6.0;WindowsNT 5.0)");    
    uc.setDoInput(true);//设置是否要从 URL 连接读取数据,默认为true    
    uc.connect();  
      
  
---|---
