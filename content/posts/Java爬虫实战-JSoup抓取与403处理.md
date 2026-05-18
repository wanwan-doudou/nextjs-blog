---
title: Java 爬虫实战：JSoup 抓取与 403 处理
date: 2022-02-09 00:00:00
tags:
  - java
  - 爬虫
categories:
  - 技术
description: 从零实现 Java 图片爬取流程，包含 JSoup 解析、下载保存、User-Agent 处理 403 与常见稳定性优化。
---

## 1. 依赖

```xml
<dependency>
  <groupId>org.jsoup</groupId>
  <artifactId>jsoup</artifactId>
  <version>1.15.3</version>
</dependency>
```

## 2. 基本流程

1. 请求列表页 HTML。
2. 用选择器提取图片详情页链接或图片真实地址。
3. 下载文件到本地目录。
4. 处理 403、超时、重复下载等异常。

## 3. 页面抓取与解析

```java
Connection connection = Jsoup.connect(listUrl)
    .timeout(60_000)
    .ignoreContentType(true);

Document document = connection.get();
List<String> detailUrls = document.select(".boxgrid a").stream()
    .map(e -> "https://wall.alphacoders.com" + e.attr("href"))
    .toList();
```

## 4. 下载图片（含 403 处理）

一些站点会拒绝默认 Java 请求头，常见现象是：

`Server returned HTTP response code: 403`

可通过 `HttpURLConnection` 设置 `User-Agent`、`Referer` 等请求头提高成功率。

```java
private static void downloadImage(String imageUrl, Path targetPath) throws IOException {
    HttpURLConnection conn = (HttpURLConnection) new URL(imageUrl).openConnection();
    conn.setConnectTimeout(15_000);
    conn.setReadTimeout(30_000);
    conn.setRequestMethod("GET");
    conn.setRequestProperty(
        "User-Agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );
    conn.setRequestProperty("Accept", "image/avif,image/webp,image/apng,image/*,*/*;q=0.8");
    conn.setRequestProperty("Referer", "https://wall.alphacoders.com/");

    if (conn.getResponseCode() != HttpURLConnection.HTTP_OK) {
        throw new IOException("download failed, code=" + conn.getResponseCode());
    }

    Files.createDirectories(targetPath.getParent());
    try (InputStream in = conn.getInputStream()) {
        Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
    } finally {
        conn.disconnect();
    }
}
```

## 5. 一个可运行的最小示例

```java
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class WallpaperCrawler {
    private static final String LIST_URL =
        "https://wall.alphacoders.com/by_category.php?id=3&name=Anime+Wallpapers&page=1";
    private static final Path OUTPUT_DIR = Paths.get("E:/壁纸/java-crawler");

    public static void main(String[] args) throws Exception {
        Set<String> visited = new HashSet<>();
        List<String> detailUrls = fetchDetailUrls(LIST_URL);

        for (String detailUrl : detailUrls) {
            if (!visited.add(detailUrl)) {
                continue;
            }
            String imageUrl = fetchImageUrl(detailUrl);
            if (imageUrl == null || imageUrl.isBlank()) {
                continue;
            }

            String fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            Path target = OUTPUT_DIR.resolve(fileName);
            try {
                downloadImage(imageUrl, target);
                System.out.println("OK: " + target);
            } catch (IOException ex) {
                System.err.println("FAIL: " + imageUrl + " -> " + ex.getMessage());
            }
        }
    }

    private static List<String> fetchDetailUrls(String listUrl) throws IOException {
        Connection connection = Jsoup.connect(listUrl)
            .timeout(60_000)
            .ignoreContentType(true);

        Document document = connection.get();
        return document.select(".boxgrid a").stream()
            .map(e -> "https://wall.alphacoders.com" + e.attr("href"))
            .toList();
    }

    private static String fetchImageUrl(String detailUrl) throws IOException {
        Document detailDoc = Jsoup.connect(detailUrl)
            .timeout(60_000)
            .ignoreContentType(true)
            .get();

        Element image = detailDoc.selectFirst(".main-content[src]");
        return image == null ? null : image.attr("src");
    }

    private static void downloadImage(String imageUrl, Path targetPath) throws IOException {
        HttpURLConnection conn = (HttpURLConnection) new URL(imageUrl).openConnection();
        conn.setConnectTimeout(15_000);
        conn.setReadTimeout(30_000);
        conn.setRequestMethod("GET");
        conn.setRequestProperty(
            "User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        );
        conn.setRequestProperty("Referer", "https://wall.alphacoders.com/");

        if (conn.getResponseCode() != HttpURLConnection.HTTP_OK) {
            throw new IOException("HTTP " + conn.getResponseCode());
        }

        Files.createDirectories(targetPath.getParent());
        try (InputStream in = conn.getInputStream()) {
            Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } finally {
            conn.disconnect();
        }
    }
}
```

## 6. 常见问题

1. 403：补齐 `User-Agent`，必要时加 `Referer/Cookie`。
2. 下载慢：降低并发或分批抓取，避免被限流。
3. 空链接：选择器失效，先打印 HTML 片段排查。
4. 文件覆盖：按 URL 或哈希去重命名。

## 7. 实战建议

1. 优先抓公开页面并遵守站点规则。
2. 给请求加重试和退避策略，避免高频打点。
3. 把解析逻辑和下载逻辑拆开，便于维护与调试。
