---
title: linux环境下升级node版本
date: 2022-09-01 00:00:00
tags:
  - linux
---

#### 1. 清除缓存信息

```plaintext
sudo npm cache clean -f
```

#### 2. 下载node安装包

```plaintext
sudo npm install -g n
```

#### 3. 升级node到稳定版本

```plaintext
sudo n stable
```

#### 4. 重启服务器

#### 5. 查看当前node版本

```plaintext
node -v
```