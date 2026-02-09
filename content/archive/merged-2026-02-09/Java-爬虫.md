---
title: Java 爬虫
date: 2021-12-11 00:00:00
tags:
  - java
---

创建一个maven项目

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830222854.png)

导入依赖

```xml
<dependencies>  
    <dependency>  
        <groupId>org.jsoup</groupId>  
        <artifactId>jsoup</artifactId>  
        <version>1.10.2</version>  
    </dependency>  
    <dependency>  
        <groupId>com.alibaba</groupId>  
        <artifactId>fastjson</artifactId>  
        <version>1.2.51</version>  
    </dependency>  
</dependencies
```

创建一个类

```java
public class Reptile {  
    public static void main(String[] args) throws IOException {  
      
    }  
}
```

我们要爬取的网页是[36壁纸](https://www.3gbizhi.com/tag/dongman/)

我们请求一下这个网页

```java
Connection connection = Jsoup  
// 设置URL  
.connect(WEB_URL)  
// 忽略解析不了的类型，强制解析，避免UnsupportedMimeTypeException  
.ignoreContentType(true)  
// 设置超时时间(ms)  
.timeout(60000);  
Document document = connection.get();  
List<String> srcs = document.getElementsByAttribute("lazysrc").stream().parallel().map(e -> e.attr("lazysrc")).collect(Collectors.toList());
```

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830223018.png)

可以看到数据已经获取到了

接下来我们把它遍历出来

```java
srcs.forEach(imgUrl -> {  
    String imgUrlClear = imgUrl.substring(0, imgUrl.lastIndexOf(".238.390.jpg"));  
    downloadPicture(imgUrlClear, "E:\\壁纸\\jail\\" + imgUrlClear.substring(imgUrl.lastIndexOf("/") + 1));  
});
```

然后我们把它下载到本地

```java
public static void downloadPicture(String imageUrl, String path) {  
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
}
```

这是完整代码

```java
import org.jsoup.Connection;  
import org.jsoup.Jsoup;  
import org.jsoup.nodes.Document;  
  
import java.io.*;  
import java.net.URL;  
import java.util.List;  
import java.util.stream.Collectors;  
  
public class Reptile {  
    static String WEB_URL = "https://www.3gbizhi.com/tag/dongman/";  
  
    public static void main(String[] args) throws IOException {  
  
        Connection connection = Jsoup  
                // 设置URL  
                .connect(WEB_URL)  
                // 忽略解析不了的类型，强制解析，避免UnsupportedMimeTypeException  
                .ignoreContentType(true)  
                // 设置超时时间(ms)  
                .timeout(60000);  
        Document document = connection.get();  
        List<String> srcs = document.getElementsByAttribute("lazysrc").stream().parallel().map(e -> e.attr("lazysrc")).collect(Collectors.toList());  
        srcs.forEach(imgUrl -> {  
            String imgUrlClear = imgUrl.substring(0, imgUrl.lastIndexOf(".238.390.jpg"));  
            downloadPicture(imgUrlClear, "E:\\壁纸\\jail\\" + imgUrlClear.substring(imgUrl.lastIndexOf("/") + 1));  
        });  
    }  
  
    public static void downloadPicture(String imageUrl, String path) {  
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
    }  
  
}
```

这是下载的壁纸

[](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211211222349487.png)