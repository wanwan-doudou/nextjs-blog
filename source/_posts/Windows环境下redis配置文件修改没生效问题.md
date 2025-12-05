---
title: Windows环境下redis配置文件修改没生效问题
date: 2022-01-27 00:00:00
tags:
  - 踩坑记录
---

当我们安装了redis服务后，发现在其配置文件redis.windows.conf（或redis.conf）设置了密码：requirepass 123456

但是打开redis-cli.exe后输入命令config get requirepass发现：

[](https://gss0.baidu.com/-vo3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D650%2C867/sign=0205bb3591504fc2a20ab803d0edcb29/b3fb43166d224f4a0d8f442e03f790529822d1fc.jpg)

这说明配置文件中密码设置后没有生效。
原因：问题在于我们启动redis服务时是直接在其安装目录中双击redis-server.exe启动的，这样启动的结果是，配置文件不会指定，此时redis并不会自动使用安装目录下的redis.windows.conf（或redis.conf）文件

[](https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D650%2C867/sign=e59f8638efdde711e7874bf092dfe223/21a4462309f79052a8df710306f3d7ca7acbd5ce.jpg)

红线框住的的提示说的很明确“ Warning: no config file specified”没有指定配置文件

解决方法：

在redis安装目录下新建文件startup.bat后，右击“编辑”，或者先用记事本建立该文件，再把扩展名改一下，文件里面写上：redis-server.exe redis.windows.conf。保存，以后再运行就直接运行这个文件，不要再直接运行redis-server.exe了，就可以了。

[](https://gss0.baidu.com/9vo3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D650%2C867/sign=e3c2f512b4096b63814c56563903ab7c/f636afc379310a555a9decc9bd4543a982261055.jpg)