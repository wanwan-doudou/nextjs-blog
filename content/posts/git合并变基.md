---
title: git合并、变基
date: 2021-12-22 00:00:00
tags:
  - 踩坑记录
---

在团队开发中不免会遇到代码冲突

`idea`解决冲突方式如下

首先遇到冲突时`idea`会提醒

[](https://waibi.oss-cn-chengdu.aliyuncs.com/picGo/image-20201008150425651.png)

我们点击`Merge`后可以看到发生冲突的文件全都列出了

[](https://waibi.oss-cn-chengdu.aliyuncs.com/picGo/image-20201008150508632.png)

我们再次点击右边的合并(英文是`Merge`)

[](https://waibi.oss-cn-chengdu.aliyuncs.com/picGo/image-20201008150615768.png)

左边是我们本地的版本，右边是`git`仓库上的版本，中间则是我们需要修改成的版本

我们可以点击左下角的

接受左侧（本地覆盖服务器）

接受右侧（服务器覆盖本地）

或者在中间部分调整出最后想要的结果然后点击右下角的应用

[](https://waibi.oss-cn-chengdu.aliyuncs.com/picGo/image-20201008150948955.png)

如果弹出

[](https://waibi.oss-cn-chengdu.aliyuncs.com/picGo/image-20201008151023752.png)

我们只需要再提交一遍代码就好了

正常企业开发`git`提交操作为

写好代码`->`提交到本地仓库(`commit`)**`->`**拉取远程仓库代码(pull)**`->`**解决冲突**`->`**推送到远程仓库(`push`)