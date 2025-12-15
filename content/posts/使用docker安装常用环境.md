---
title: 使用docker安装常用环境
date: 2024-11-21 00:00:00
tags:
  - docker
---

# 安装redis

### 1. 拉取 Redis 镜像

```plaintext
docker pull redis:latest
```

### 2. 创建挂载目录

Redis 的数据需要持久化到本地文件系统，因此需要创建挂载目录：

```plaintext
mkdir -p /mydata/redis/data
mkdir -p /mydata/redis/conf
```

### 3.准备配置文件

以下是一个完整的 Redis 配置文件 `redis.conf` 示例，针对你要求的持久化、密码配置和常用设置已经做好调整。

```plaintext
# Redis 通用配置

# 监听地址，允许所有 IP 访问（不建议在生产环境中使用）
bind 0.0.0.0

# 端口号
port 6379

# 设置 Redis 密码
requirepass 123456

# 关闭保护模式（允许外部访问）
protected-mode no

# 持久化配置

# 快照持久化（RDB 配置）
# 按时间间隔和操作次数保存数据，示例为：
# - 每 900 秒（15 分钟）至少有 1 次修改
# - 每 300 秒（5 分钟）至少有 10 次修改
# - 每 60 秒（1 分钟）至少有 10000 次修改
save 900 1
save 300 10
save 60 10000

# 持久化文件名
dbfilename dump.rdb

# 持久化文件保存目录
dir /data

# AOF 持久化（日志追加模式）
# 启用 AOF（默认关闭）
appendonly yes

# AOF 文件名
appendfilename "appendonly.aof"

# AOF 的文件同步策略
# - always: 每次写入都同步（性能差，最安全）
# - everysec: 每秒同步一次（推荐，权衡性能和安全性）
# - no: 由操作系统决定同步时间（性能最好，安全性低）
appendfsync everysec

# 性能优化

# 指定最大客户端连接数，0 表示无限制
maxclients 10000

# 限制内存大小，单位字节（示例为 1GB，生产环境建议配置）
# maxmemory 1073741824

# 内存超出限制时的淘汰策略
# 可选值：
# - noeviction: 不再接受写入操作（默认）
# - allkeys-lru: 淘汰最少使用的键
# - volatile-lru: 在设置过期时间的键中淘汰最少使用的键
# - allkeys-random: 随机淘汰键
# - volatile-random: 在设置过期时间的键中随机淘汰
# - volatile-ttl: 在设置过期时间的键中淘汰存活时间最短的键
# maxmemory-policy allkeys-lru

# 日志配置

# 日志级别（可选：debug、verbose、notice、warning）
loglevel notice

# 日志文件路径（默认输出到标准输出）
# logfile "/data/redis.log"

# 后台运行
# 注意：在 Docker 中，不需要开启此选项，保持为 no 即可
daemonize no
```

### 使用说明

1. 文件保存位置 将以上内容保存到 /mydata/redis/conf/redis.conf 文件中。
2. 启动 Redis 容器 使用以下命令运行容器，并挂载配置文件和数据目录

```docker
docker run -d \
  --name redis \
  --restart=always \
  -p 6379:6379 \
  -v /mydata/redis/data:/data \
  -v /mydata/redis/conf/redis.conf:/usr/local/etc/redis/redis.conf \
  redis:latest \
  redis-server /usr/local/etc/redis/redis.conf
```

# 安装  clickhouse

### 1. 拉取 ClickHouse 镜像

首先从 Docker Hub 拉取最新的 ClickHouse 镜像：

```plaintext
docker pull clickhouse/clickhouse-server:latest
```

### 2. 创建挂载目录

创建本地目录，用于挂载 ClickHouse 的数据和配置文件：

```plaintext
mkdir -p /mydata/clickhouse/data
mkdir -p /mydata/clickhouse/config
mkdir -p /mydata/clickhouse/log

```

### 3. 准备配置文件

生成默认配置文件（可选）：

```plaintext
docker run --rm clickhouse/clickhouse-server cat /etc/clickhouse-server/config.xml > /mydata/clickhouse/config/config.xml
docker run --rm clickhouse/clickhouse-server cat /etc/clickhouse-server/users.xml > /mydata/clickhouse/config/users.xml
```

#### 配置说明：

1. config.xml 是主配置文件，用于配置存储路径、监听端口等。
2. users.xml 是用户配置文件，用于设置用户权限、默认密码等。``

```plaintext
# config.xml 开启远程登录
<listen_host>0.0.0.0</listen_host> 
# users.xml 配置密码
<password>123456</password>
```

### 4. 启动clickhouse容器

```plaintext
# 添加 CAP_SYS_NICE 容器权限，不然可能会出现这个错误get_mempolicy: Operation not permitted

docker run -d \
  --name clickhouse \
  --restart=always \
  --cap-add=SYS_NICE \
  -p 8123:8123 \
  -p 9000:9000 \
  -p 9009:9009 \
  -v /mydata/clickhouse/data:/var/lib/clickhouse \
  -v /mydata/clickhouse/config/config.xml:/etc/clickhouse-server/config.xml \
  -v /mydata/clickhouse/config/users.xml:/etc/clickhouse-server/users.xml \
  -v /mydata/clickhouse/log:/var/log/clickhouse-server \
  clickhouse/clickhouse-server:latest
```

# 安装  MySql

### 1. MySql 镜像

首先从 Docker Hub 拉取最新的 MySql 镜像：

```plaintext
docker pull mysql
```

#### 2. 创建目录结构

在 `/mydata` 下为 MySQL 创建独立的目录：

```plaintext
sudo mkdir -p /mydata/mysql/data
sudo mkdir -p /mydata/mysql/config
sudo mkdir -p /mydata/mysql/logs
```

### 3. 挂载目录授权

```plaintext
sudo chown -R 999:999 /mydata/mysql/data
```

#### 3. 准备 MySQL 配置文件（可选）

MySQL 容器允许自定义配置文件。如果需要，可以创建一个配置文件，例如 `/mydata/mysql/config/my.cnf`，内容如下：

```plaintext
[mysqld]
bind-address = 0.0.0.0
port = 3306
datadir = /var/lib/mysql
log-error = /var/log/mysql/error.log
max_connections = 200
sql_mode = "STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION"
```

#### 4. 启动 MySQL 容器

运行以下命令启动 MySQL 容器：

```plaintext
docker run -d \
  --name mysql \
  --restart=always \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -v /mydata/mysql/data:/var/lib/mysql \
  -v /mydata/mysql/config/my.cnf:/etc/mysql/my.cnf \
  -v /mydata/mysql/logs:/var/log/mysql \
  mysql:latest
```

#### 5. 配置远程访问

**1. 进入容器并连接到MySQL：**

```plaintext
docker exec -it mysql mysql -u root -p
```

在 MySQL 命令行中执行以下操作：

**2. 检查权限用户**
验证`root`用户的主机限制：

```plaintext
SELECT host, user FROM mysql.user WHERE user = 'root';
```

**3. 设置远程权限**
添加`root`用户的远程访问权限：

```plaintext
CREATE USER 'root'@'%' IDENTIFIED BY 'your_root_password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

**4. 测试远程用户**
确保创建远程用户可以访问：

```plaintext
SELECT host, user FROM mysql.user;
```

# 安装  rabbitmq

### 1. 创建所需目录

在宿主机上创建用于存储 RabbitMQ 配置和数据的目录：

```plaintext
mkdir -p /mydata/rabbitmq/data /mydata/rabbitmq/log /mydata/rabbitmq/config
```

### 2. 创建配置文件

RabbitMQ 可以通过 `rabbitmq.conf` 或 `advanced.config` 文件进行配置。这里使用 `rabbitmq.conf` 文件。

创建 `/mydata/rabbitmq/config/rabbitmq.conf` 文件并添加以下内容：

```plaintext
# RabbitMQ Configuration File

# 默认用户配置
default_user = admin
default_pass = 123456

# 持久化路径（数据和日志）
log.dir = /var/log/rabbitmq
raft.data_dir = /var/lib/rabbitmq/mnesia
```

### 3. 启动 RabbitMQ 容器

运行以下命令启动 RabbitMQ 容器，并将配置和数据挂载到宿主机：

```plaintext
docker run -d \
  --name rabbitmq \
  --restart=always \
  -p 5672:5672 \
  -p 15672:15672 \
  -v /mydata/rabbitmq/data:/var/lib/rabbitmq/mnesia \
  -v /mydata/rabbitmq/log:/var/log/rabbitmq \
  -v /mydata/rabbitmq/config/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf \
  rabbitmq:management

```

### 4、进入容器内部

```plaintext
docker exec -it 容器id /bin/bssh
rabbitmq-plugins enable rabbitmq_management
```