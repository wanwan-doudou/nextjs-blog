---
title: Java爬虫之JSoup使用教程
date: 2022-09-25 00:00:00
tags:
  - java
---

## 介绍

JSoup是一个用于处理HTML的Java库，它提供了一个非常方便类似于使用DOM，CSS和jquery的方法的API来提取和操作数据。

## 主要类

### 1. org.jsoup.Jsoup类

Jsoup类是任何Jsoup程序的入口点，并将提供从各种来源加载和解析HTML文档的方法。

Jsoup类的一些重要方法如下：

| 方法 | 姓名 |
| --- | --- |
| static Connection connect(String url) | 创建并返回URL的连接。 |
| static Document parse(File in, String charsetName) | 将指定的字符集文件解析成文档。 |
| static Document parse(String html) | 将给定的html代码解析成文档。 |
| static String clean(String bodyHtml, Whitelist whitelist) | 从输入HTML返回安全的HTML，通过解析输入HTML并通过允许的标签和属性的白名单进行过滤。 |

### 2. org.jsoup.nodes.Document类

该类表示通过Jsoup库加载HTML文档。可以使用此类执行适用于整个HTML文档的操作。

Element类的重要方法可以参见 - [http://jsoup.org/apidocs/org/jsoup/nodes/Document.html](http://jsoup.org/apidocs/org/jsoup/nodes/Document.html) 。

### 3. org.jsoup.nodes.Element类

HTML元素是由标签名称，属性和子节点组成。 使用Element类，您可以提取数据，遍历节点和操作HTML。

Element类的重要方法可参见 - [http://jsoup.org/apidocs/org/jsoup/nodes/Element.html](http://jsoup.org/apidocs/org/jsoup/nodes/Element.html) 。

## 简单使用

### 安装

> 使用maven导包，也可以使用jar

```xml
<dependency>  
    <groupId>org.jsoup</groupId>  
    <artifactId>jsoup</artifactId>  
    <version>1.15.3</version>  
</dependency>
```

### 加载文档

#### 1. URL加载文档

从URL加载文档，使用`Jsoup.connect()`方法从URL加载HTML。

```java
try { 
 	Document document = Jsoup.connect("https://www.kwydy.cn").get(); 
    System.out.println(document.title()); 
} catch (IOException e) {
	e.printStackTrace(); 
}
```

#### 2. 从文件加载文档

使用`Jsoup.parse()`方法从文件加载HTML。

```java
try {
	Document document = Jsoup.parse( new File( "D:/temp/index.html" ) , "utf-8" ); 
    System.out.println(document.title()); 
} catch (IOException e) {
	e.printStackTrace(); 
}
```

#### 3. 从String加载文档

使用`Jsoup.parse()`方法从字符串加载HTML。

```java
try {
	String html = "<html><head><title>First parse</title></head>" + "<body><p>Parsed HTML into a doc.</p></body></html>";
	Document document = Jsoup.parse(html); 
	System.out.println(document.title()); 
} catch (IOException e) {
	e.printStackTrace(); 
}
```

### 提取数据

#### 使用DOM方法导航文档

元素提供了一系列类似DOM的方法来查找元素，并提取和操作它们的数据。DOM getter是上下文的：在父文档上调用，他们在文档下找到匹配的元素; 他们在一个子元素上调用了那个孩子下面的元素。通过这种方式，您可以了解所需的数据。

##### 寻找元素

- getElementById(String id)
- getElementsByTag(String tag)
- getElementsByClass(String className)
- getElementsByAttribute(String key) （及相关方法）
- 元素的兄弟姐妹：siblingElements()，firstElementSibling()，lastElementSibling()，nextElementSibling()，previousElementSibling()
- 图：parent()，children()，child(int index)

##### 处理元素数据

- attr(String key)获取和attr(String key, String value)设置属性
- attributes() 获得所有属性
- id()，className()和classNames()
- text()获取和text(String value)设置文本内容
- html()获取和html(String value)设置内部HTML内容
- outerHtml() 获取外部HTML值
- data()获取数据内容（例如script和style标签）
- tag() 和 tagName()

##### 操纵HTML和文本

- append(String html)， prepend(String html)
- appendText(String text)， prependText(String text)
- appendElement(String tagName)， prependElement(String tagName)
- html(String value)

## 实战爬取图片

```java
public class Test {  
    static String WEB_URL = "https://wall.alphacoders.com/by_category.php?id=3&name=Anime+Wallpapers&page=6";  
    static int index = 0;  
    static int page = 6;  
  
    public static void main(String[] args) throws IOException {  
        get(WEB_URL);  
    }  
  
    public static void get(String WEB_URL) throws IOException {  
        Connection connection = Jsoup.connect(WEB_URL).ignoreContentType(true).timeout(60000);  
        Document document = connection.get();  
        List<String> collect = document.getElementsByClass("boxgrid").select("a").stream().map(e -> e.attr("href")).collect(Collectors.toList());  
        collect.forEach(imgUrl -> {  
            String URL = "https://wall.alphacoders.com" + imgUrl;  
            Connection connection1 = Jsoup.connect(URL).ignoreContentType(true).timeout(60000);  
            try {  
                Document document1 = connection1.get();  
                String src = document1.getElementsByClass("main-content").attr("src");  
                downloadPicture(src, "E:\\博客壁纸\\" + src.substring(src.lastIndexOf("/") + 1));  
            } catch (IOException e) {  
                throw new RuntimeException(e);  
            }  
        });  
  
    }  
  
    public static void downloadPicture(String imageUrl, String path) throws IOException {  
        System.out.println(imageUrl);  
        index++;  
        System.out.println(index);  
        URL url = null;  
        try {  
            url = new URL(imageUrl);  
            DataInputStream dataInputStream = new DataInputStream(url.openStream());  
            FileOutputStream fileOutputStream = new FileOutputStream(new File(path));  
            ByteArrayOutputStream output = new ByteArrayOutputStream();  
            byte[] buffer = new byte[4096];  
            int length;  
            while ((length = dataInputStream.read(buffer)) > 0) {  
                output.write(buffer, 0, length);  
            }  
            fileOutputStream.write(output.toByteArray());  
            dataInputStream.close();  
            fileOutputStream.close();  
        } catch (IOException e) {  
            e.printStackTrace();  
        }  
        if (index >= 30) {  
            index = 0;  
            page++;  
            WEB_URL = "https://wall.alphacoders.com/by_category.php?id=3&name=Anime+Wallpapers&page=" + page;  
            System.out.println(WEB_URL);  
            get(WEB_URL);  
        }  
  
    }  
  
}
```

运行截图

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220925202454.png)