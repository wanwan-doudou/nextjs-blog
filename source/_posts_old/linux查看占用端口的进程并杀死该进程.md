---
title: linux查看占用端口的进程并杀死该进程
date: 2022-09-01 00:00:00
tags:
  - linux
---

## lsof

lsof(list open files)是一个列出当前系统打开文件的工具。

lsof 查看端口占用语法格式：
    
    
    1  
    

| 
    
    
    lsof -i:端口号  
      
  
---|---  
  
查看服务器 8000 端口的占用情况：

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220901162955.png)

## kill

在查到端口占用的进程后，如果你要杀掉对应的进程可以使用 kill 命令：
    
    
    1  
    

| 
    
    
    kill -9 PID  
      
  
---|---  
  
如上实例，我们看到 80 端口对应的 PID 为 1646，使用以下命令杀死进程：
    
    
    1  
    

| 
    
    
    kill -9 1646  
      
  
---|---
