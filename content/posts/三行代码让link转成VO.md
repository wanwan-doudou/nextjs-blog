---
title: 三行代码让link转成VO
date: 2022-01-19 00:00:00
tags:
  - 每日一个小技巧
---

```java
List<GroupLinkVO> linkUserList = groupLinks.parallelStream().map(l -> BeanUtils.copyProperties(l, GroupLinkVO::new))  
.peek(link -> Opt.ofNullable(link.getUserId()).map(userMapByIds::get).peek(link::setUser))  
.filter(link -> Objects.nonNull(link.getUser())).collect(Collectors.toList());
```