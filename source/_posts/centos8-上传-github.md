---
title: centos8 上传 github
date: 2022-11-04 00:00:00
tags:
  - git
---

1 安装git

> sudo apt install git

绑定GitHub用户

> git config –global user.name “XXX”git config –global user.email xxx@xxx.com

查看用户信息

> git config –list

2 生成SSH key

> ssh-keygen -t rsa -C xxx@xxx.com

生成的公钥信息会存在/home/XXX/.ssh/id_rsa.pub文件里，打开该文件，复制公钥信息。打开GitHub，进入个人主页->settings->SSH and GPG keys->New SSH key
公钥名称可以自己设置，公钥信息即为刚才复制的文件全部内容

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20221104202332.png)
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20221104202349.png)

测试连接

> ssh -T git@github.com

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20221104202602.png)

3 创建本地仓库
进入要上传的文件夹目录下，输入

> git init

创建新仓库

（之后的操作要回到文件夹目录，不要在.git文件夹下面操作，不然会报错）

添加文件至工作区（工作区相当于一个缓存，存储还没有添加到本地仓库的文件）：

> git add 文件名

查看工作区文件：

> git status

把工作区文件提交到本地仓库

> git commit -m 备注

查看本地仓库文件

> git ls-files

关联远程仓库

> git remote add 仓库名称 仓库的SSH链接

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20221104202939.png)

一般来说，每个远程仓库只要关联一次即可生效，如果想删除关联的远程仓库可以使用：

> git remote rm 仓库名称

查看已关联的远程仓库列表

> git remote

把本地仓库内容上传至远程仓库

> git push 远程仓库名称 远程仓库文件夹

如果远程仓库有过修改，和 本地仓库内容不一致，提交可能出现报错。此时解决方法：

> git pull -rebase 远程仓库名称 本地仓库文件夹（默认为master）