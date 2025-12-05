---
title: hutool LocalDateTime工具
date: 2021-12-27 00:00:00
tags:
  - hutool
---

根据时间统计每天的登记数

[![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211227204138434.png)](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211227204138434.png)

但我们这个时候不需要时分秒，我们可以使用hutool中的[LocalDateTime工具](https://www.hutool.cn/docs/#/core/%E6%97%A5%E6%9C%9F%E6%97%B6%E9%97%B4/LocalDateTime%E5%B7%A5%E5%85%B7-LocalDateTimeUtil?id=localdatetime%E5%B7%A5%E5%85%B7-localdatetimeutil)进行日期格式化

实例：
    
    
    1  
    

| 
    
    
    Map<String, Long> collect = clockRecords.stream().collect(Collectors.groupingBy(clockRecord -> LocalDateTimeUtil.format(clockRecord.getGmtCreate(), DatePattern.NORM_DATE_PATTERN), Collectors.counting()));  
      
  
---|---  
  
除此之外LocalDateTime还有以下用法

  1. 日期转换


    
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    8  
    

| 
    
    
    String dateStr = "2020-01-23T12:23:56";    
    DateTime dt = DateUtil.parse(dateStr);    
        
    // Date对象转换为LocalDateTime    
    LocalDateTime of = LocalDateTimeUtil.of(dt);    
        
    // 时间戳转换为LocalDateTime    
    of = LocalDateTimeUtil.ofUTC(dt.getTime());  
      
  
---|---  
  
2.日期字符串解析
    
    
    1  
    2  
    3  
    4  
    

| 
    
    
    // 解析ISO时间    
    LocalDateTime localDateTime = LocalDateTimeUtil.parse("2020-01-23T12:23:56");    
    // 解析自定义格式时间    
    localDateTime = LocalDateTimeUtil.parse("2020-01-23", DatePattern.NORM_DATE_PATTERN);  
      
  
---|---  
  
3.计算时间间隔
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    

| 
    
    
    LocalDateTime start = LocalDateTimeUtil.parse("2019-02-02T00:00:00");    
    LocalDateTime end = LocalDateTimeUtil.parse("2020-02-02T00:00:00");    
        
    Duration between = LocalDateTimeUtil.between(start, end);    
        
    // 365    
    between.toDays();  
      
  
---|---
