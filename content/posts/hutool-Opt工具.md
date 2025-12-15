---
title: hutool Opt工具
date: 2021-12-16 00:00:00
tags:
  - hutool
---

hutool 非空判断

```java
public static void main(String[] args) {  
    List lists = null;  
    // ofEmptyAble(List<T> value)  
    // 返回一个包裹里List集合可能为空的Opt，额外判断了集合内元素为空的情况  
    Opt.ofEmptyAble(lists).map(list -> {  
        System.out.println("数据");  
        return list;  
        // ofEmptyAble(List<T> value)  
        // 返回一个包裹里List集合可能为空的Opt，额外判断了集合内元素为空的情况  
    }).peek(list -> System.out.println("list:" + list));  
}
```

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830224529.png)

可以看到没有数据输出

当我们list有值的时候

```java
public static void main(String[] args) {  
    List lists = Arrays.asList("cat", "cow", "dog");  
    // ofEmptyAble(List<T> value)  
    // 返回一个包裹里List集合可能为空的Opt，额外判断了集合内元素为空的情况  
    Opt.ofEmptyAble(lists).map(list -> {  
        System.out.println("数据");  
        return list;  
        // ofEmptyAble(List<T> value)  
        // 返回一个包裹里List集合可能为空的Opt，额外判断了集合内元素为空的情况  
    }).peek(list -> System.out.println("list:" + list));  
}
```

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830224549.png)

list就被打印出来了