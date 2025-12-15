---
title: mybatis-plus 根据条件动态修改条件构造器参数
date: 2022-01-21 00:00:00
tags:
  - mybatis-plus
---

[mybatis-plus](https://kwydy.gitee.io/tags/mybatis-plus/)  2022-01-21

我们有一个这样的需求：

群主能移除除了自己以外的所有群成员，

管理员能移除除群主和其他管理员的所有成员。

这里我们可以这样实现：

```java
// 将共有的查询方法抽取成一个wrapper  
LambdaQueryWrapper<GroupLink> wrapper = Wrappers.<GroupLink>lambdaQuery().eq(GroupLink::getGroupId, groupDTO.getId())  
.in(GroupLink::getUserId, groupDTO.getGroupUserIds());
```

这是枚举：

```java
@Getter  
@AllArgsConstructor  
public enum GroupRoleTypeEnum {  
  
    /**  
     * Cheating the compiler and the god.  
     */  
    NORMAL("普通用户"),  
    ADMIN("管理员"),  
    CREATOR("创建者");  
  
    private final String desc;  
  
}
```

```java
@Getter  
@AllArgsConstructor  
public enum GroupRoleTypeEnum {  
  
    /**  
     * Cheating the compiler and the god.  
     */  
    NORMAL("普通用户"),  
    ADMIN("管理员"),  
    CREATOR("创建者");  
  
    private final String desc;  
  
}
```