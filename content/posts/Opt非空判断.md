---
title: Opt非空判断
date: 2022-01-04 00:00:00
tags:
  - Opt
---

```java
List<Integer> list = new ArrayList<>();  
list.add(1);  
list.add(1);  
list.add(1);  
// 判断一个list是否为空，如果不为空判断是否包含元素，如果包含元素获取它的长度，否则返回0  
Integer integer = Opt.ofEmptyAble(list).map(List::size).orElse(0);  
System.out.println(integer);  
  
// 如果值不为空则打印，否则为空  
String z = Opt.ofBlankAble("值不为空").peek(System.out::println).orElse("kwydy");  
String s = Opt.ofBlankAble("").peek(System.out::println).orElse("kwydy");  
System.out.println(s);  
  
//如果值不为空则打印a,否则输出“我没有值”  
String a = null;  
Opt.ofNullable(a).ifPresentOrElse(s1 -> {  
System.out.println(s1);  
}, () -> {  
System.out.println("我没有值");  
});
```