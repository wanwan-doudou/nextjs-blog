---
title: npm修改源为国内阿里云源
date: 2022-11-05 00:00:00
tags:
  - npm
---

修改npm源地址

> npm config set registry https://registry.npm.taobao.org

设置好之后可以通过运行npm config list查看是否配置成功

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20221105133101.png)

可以在registry字段下看到已经换成设置的阿里下载源，那么恭喜你配置成功了。