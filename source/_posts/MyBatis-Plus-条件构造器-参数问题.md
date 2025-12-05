---
title: MyBatis-Plus 条件构造器 参数问题
date: 2021-11-29 00:00:00
tags:
  - mybatis-plus
---

今天写项目遇到一个代码没看明白

```java
return page(page, CommonWrappers.inWrapper(MemberInfo::getId, list).like(StrUtil.isNotBlank(adminGroupDTO.getName()), MemberInfo::getName, adminGroupDTO.getName()));
```

当时看到条件构造器为什么传了三个参数

于是我到MyBatis-Plus官网找到了答案

[](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211129203858681.png)

第一个参数进行判断，例如：

```java
like(boolean condition, "name", "王")
```

当Boolean成立时才会执行

```java
name like '%王%'
```