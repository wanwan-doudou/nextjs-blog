---
title: Stream流(1)
date: 2022-01-03 00:00:00
tags:
  - stream
---

## 概述

Java8的Stream使用的是函数式编程模式，如同它的名字一样，它可以被用来对集合或数组进行链状流式的操作。可以更方便的让我们对集合或数组操作。

### 数据准备

```java
<dependencies>  
        <dependency>  
            <groupId>org.projectlombok</groupId>  
            <artifactId>lombok</artifactId>  
            <version>1.18.16</version>  
        </dependency>  
    </dependencies>  
@Data  
@NoArgsConstructor  
@AllArgsConstructor  
@EqualsAndHashCode//用于后期的去重使用  
public class Author {  
    //id  
    private Long id;  
    //姓名  
    private String name;  
    //年龄  
    private Integer age;  
    //简介  
    private String intro;  
    //作品  
    private List<Book> books;  
}  
@Data  
@AllArgsConstructor  
@NoArgsConstructor  
@EqualsAndHashCode  
public class Book {  
    //id  
    private Long id;  
    //书名  
    private String name;  
    //分类  
    private String category;  
    //评分  
    private Integer score;  
    //简介  
    private String intro;  
}  
public class StreamDemo {  
  
    public static void main(String[] args) {  
        List<Author> authors = getAuthors();  
        System.out.println(authors);  
    }  
  
    private static List<Author> getAuthors() {  
        //数据初始化  
        Author author = new Author(1L, "蒙多", 33, "一个从才多种明悟哲理的祖安人", null);  
        Author author2 = new Author(2L, "亚拉索", 15, "狂风也追逐不上他的思考宿舍的", null);  
        Author author3 = new Author(3L, "易", 14, "是这个世界在限制他的思维", null);  
        Author author4 = new Author(4L, "易", 14, "是这个世界在限制他的思维", null);  
  
        //书籍列表  
        List<Book> books1 = new ArrayList<>();  
        List<Book> books2 = new ArrayList<>();  
        List<Book> books3 = new ArrayList<>();  
  
        books1.add(new Book(1L, "刀的两侧式光明与黑暗", "哲学,爱情", 88, "用一把刀划分了爱恨"));  
        books1.add(new Book(2L, "一个人不能死在同一把刀下", "个人成长,爱情", 99, "讲述如何从失败"));  
  
        books2.add(new Book(3L, "那风吹不到的地方", "哲学", 85, "带你用思维去领略世界的尽头"));  
        books2.add(new Book(3L, "那风吹不到的地方", "哲学", 85, "带你用思维去领略世界的尽头"));  
        books2.add(new Book(4L, "吹或不吹", "爱情，个人传记", 56, "一个哲学家的恋爱观注定很难把他"));  
  
        books2.add(new Book(5L, "你的剑就是我的剑", "爱情", 56, "无法想象一个武者能对他的伴侣"));  
        books2.add(new Book(6L, "风与剑", "个人传记", 100, "两个哲学家灵魂和肉体的碰撞会激起怎么"));  
        books2.add(new Book(6L, "风与剑", "个人传记", 100, "两个哲学家灵魂和肉体的碰撞会激起怎么"));  
  
        author.setBooks(books1);  
        author2.setBooks(books2);  
        author3.setBooks(books3);  
        author4.setBooks(books3);  
  
        List<Author> authorList = new ArrayList<>(Arrays.asList(author, author2, author3, author4));  
        return authorList;  
    }  
}
```

## 需求

我们可以效用getAuthors方法获取刀作家的集合。现在需要打印多有年龄小于18作家 的名字，并且要注意去重。

## 实现

```java
List<Author> authors = getAuthors();  
        //把集合转换成流  
        authors.stream()  
                .distinct()//去重0【  
                .filter(author -> author.getAge() < 18)  
                .forEach(author -> System.out.println(author.getName()));
```

## 常用操作

### 创建流

单例集合：集合对象.stream()

```java
List<Author> authors = getAuthors();  
Stream<Author> stream = authors.stream();
```

数组：Arrays.stream(数组)或者使用Stream.of来创建

```java
Integer arr[] = {1, 2, 3, 4, 5};  
Stream<Integer> stream = Arrays.stream(arr)  
Stream<Integer> stream2 = Stream.of(arr);
```

双列集合：

```java
Map<String, Integer> map = new HashMap<>();  
map.put("蜡笔小新", 19);  
map.put("黑子", 17);  
map.put("日向翔阳", 16);  
  
Set<Map.Entry<String, Integer>> entries = map.entrySet();  
Stream<Map.Entry<String, Integer>> stream = entries.stream();  
stream.filter(entry -> entry.getValue()>16)  
.forEach(entry -> System.out.println(entry.getKey() + "===" + entry.getValue()));
```