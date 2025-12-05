---
title: Java 爬虫
date: 2021-12-11 00:00:00
tags:
  - java
---

创建一个maven项目

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830222854.png)

导入依赖
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    8  
    9  
    10  
    11  
    12  
    

| 
    
    
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
      
  
---|---  
  
创建一个类
    
    
    1  
    2  
    3  
    4  
    5  
    

| 
    
    
    public class Reptile {    
        public static void main(String[] args) throws IOException {    
            
        }    
    }  
      
  
---|---  
  
我们要爬取的网页是[36壁纸](https://www.3gbizhi.com/tag/dongman/)

我们请求一下这个网页
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    8  
    9  
    

| 
    
    
    Connection connection = Jsoup    
    // 设置URL    
    .connect(WEB_URL)    
    // 忽略解析不了的类型，强制解析，避免UnsupportedMimeTypeException    
    .ignoreContentType(true)    
    // 设置超时时间(ms)    
    .timeout(60000);    
    Document document = connection.get();    
    List<String> srcs = document.getElementsByAttribute("lazysrc").stream().parallel().map(e -> e.attr("lazysrc")).collect(Collectors.toList());  
      
  
---|---  
  
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830223018.png)

可以看到数据已经获取到了

接下来我们把它遍历出来
    
    
    1  
    2  
    3  
    4  
    

| 
    
    
    srcs.forEach(imgUrl -> {    
        String imgUrlClear = imgUrl.substring(0, imgUrl.lastIndexOf(".238.390.jpg"));    
        downloadPicture(imgUrlClear, "E:\\壁纸\\jail\\" + imgUrlClear.substring(imgUrl.lastIndexOf("/") + 1));    
    });  
      
  
---|---  
  
然后我们把它下载到本地
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    8  
    9  
    10  
    11  
    12  
    13  
    14  
    15  
    16  
    17  
    18  
    19  
    

| 
    
    
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
      
  
---|---  
  
这是完整代码
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    8  
    9  
    10  
    11  
    12  
    13  
    14  
    15  
    16  
    17  
    18  
    19  
    20  
    21  
    22  
    23  
    24  
    25  
    26  
    27  
    28  
    29  
    30  
    31  
    32  
    33  
    34  
    35  
    36  
    37  
    38  
    39  
    40  
    41  
    42  
    43  
    44  
    45  
    46  
    47  
    48  
    49  
    50  
    

| 
    
    
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
      
  
---|---  
  
这是下载的壁纸

[![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211211222349487.png)](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211211222349487.png)
