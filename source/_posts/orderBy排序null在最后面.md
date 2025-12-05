---
title: orderBy排序，null在最后面
date: 2022-01-01 00:00:00
tags:
  - 数据库
---

我们进行排序查询时：

```plaintext
SELECT * FROM `user` ORDER BY username
```

可以看到`null`值排到了最上

[](https://waibi.oss-cn-chengdu.aliyuncs.com/picGo/image-20211229230611730.png)

如果我们要将`null`值排到最下方可以使用：

```plaintext
SELECT * FROM `user` ORDER BY ISNULL(username),username
```

执行结果：

[](https://waibi.oss-cn-chengdu.aliyuncs.com/picGo/image-20211229230707321.png)

这是因为`ISNULL`函数将其转换为了`0`和`1`，我们可以顺带查询出来看看：

```plaintext
SELECT *,ISNULL(username) FROM `user` ORDER BY ISNULL(username),username
```

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220901153120.png)