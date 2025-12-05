---
title: 使用docker-compose部署项目
date: 2024-11-22 00:00:00
tags:
  - docker
---

## 1. 使用PowerShell构建项目

```plaintext
$env:GOOS="linux"
$env:GOARCH="amd64"
go build -o main
```

## 2. 上传配置文件和构建的二进制文件

### 编写 Dockerfile

```plaintext
# 使用更小的基础镜像  
FROM alpine:latest  
  
# 安装运行 Go 程序所需的依赖  
RUN apk --no-cache add ca-certificates  
  
# 复制二进制文件到镜像中  
COPY ./main /usr/local/bin/main  
RUN chmod +x /usr/local/bin/main  
  
# 创建配置目录并复制所有配置文件到镜像中  
RUN mkdir /conf  
COPY ./*.yaml /conf/  
  
# 设置容器启动命令  
CMD ["/usr/local/bin/main", "web", "-d", "/conf"]
```

项目配置文件中的ip可以使用容器 服务的名称例如：

```plaintext
cache:  
  name: redis  
  redis:  
    driver: redis
    #address: '127.0.0.1:6379'
    address: 'redis:6379'  # 修改为服务名称  
    password: 123456  
    db: 0
```

## 3. 构建镜像

```plaintext
docker build -t qaps .
```

## 4. 创建project文件夹这里存放有关的配置

```plaintext
project/
├── docker-compose.yml
├── Dockerfile
├── config/
│   ├── redis/
│   │   └── redis.conf
│   ├── clickhouse/
│   │   ├── config.xml
│   │   └── users.xml
│   ├── mysql/
│   │   └── my.cnf
│   └── rabbitmq/
│       └── rabbitmq.conf
├── data/
│   ├── redis/
│   ├── clickhouse/
│   ├── mysql/
│   └── rabbitmq/
└── logs/
    ├── clickhouse/
    ├── mysql/
    └── rabbitmq/
```

## 5. 编写docker-compose.yml

```plaintext
version: '3.8'  
  
services:  
  go-app:  
    image: qaps:latest  
    container_name: go-app  
    restart: always  
    depends_on:  
      - redis  
      - clickhouse  
      - mysql  
      - rabbitmq  
    ports:  
      - "9010:9010"  
    networks:  
      - app-network  
  
  redis:  
    image: redis:latest  
    container_name: redis  
    restart: always  
    volumes:  
      - ./data/redis:/data  
      - ./config/redis/redis.conf:/usr/local/etc/redis/redis.conf  
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]  
    ports:  
      - "6379:6379"  
    networks:  
      - app-network  
  
  clickhouse:  
    image: clickhouse/clickhouse-server:latest  
    container_name: clickhouse  
    restart: always  
    cap_add:  
      - SYS_NICE  
    volumes:  
      - ./data/clickhouse:/var/lib/clickhouse  
      - ./config/clickhouse/config.xml:/etc/clickhouse-server/config.xml  
      - ./config/clickhouse/users.xml:/etc/clickhouse-server/users.xml  
      - ./logs/clickhouse:/var/log/clickhouse-server  
    ports:  
      - "8123:8123"  
      - "9000:9000"  
      - "9009:9009"  
    networks:  
      - app-network  
  
  mysql:  
    image: mysql:latest  
    container_name: mysql  
    restart: always  
    environment:  
      MYSQL_ROOT_PASSWORD: "123456"  
    volumes:  
      - ./data/mysql:/var/lib/mysql  
      - ./config/mysql/my.cnf:/etc/mysql/my.cnf  
      - ./logs/mysql:/var/log/mysql  
    ports:  
      - "3306:3306"  
    networks:  
      - app-network  
  
  rabbitmq:  
    image: rabbitmq:management  
    container_name: rabbitmq  
    restart: always  
    volumes:  
      - ./data/rabbitmq:/var/lib/rabbitmq/mnesia  
      - ./logs/rabbitmq:/var/log/rabbitmq  
      - ./config/rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf  
    ports:  
      - "5672:5672"  
      - "15672:15672"  
    networks:  
      - app-network  
  
networks:  
  app-network:  
    driver: bridge
```

### 启动

```plaintext
docker-compose up -d
```

以下是一些常用的 `docker-compose` 命令：

```plaintext
**后台启动服务（以分离模式运行）**：
docker-compose up -d

**前台启动服务（日志会显示在终端）**：
docker-compose up

**停止正在运行的服务，但不删除容器**：
docker-compose stop

**停止并删除容器、网络和在 `docker-compose.yml` 中定义的卷**：
docker-compose down

**构建或重新构建服务（如果修改了 Dockerfile，可以使用此命令）**：
docker-compose build

**查看所有服务的日志**：
docker-compose logs

**实时显示日志（跟踪日志）**：
docker-compose logs -f

**列出 Docker Compose 管理的所有容器**：
docker-compose ps

**在运行中的容器内执行命令（例如启动一个 bash shell）**：
docker-compose exec <服务名> bash

**运行一次性命令（在新容器中运行单个命令）**：
docker-compose run <服务名> <命令>

**查看当前配置的服务**：
docker-compose config

**删除所有停止的容器、未使用的网络以及悬挂的镜像**：
docker-compose down --volumes --remove-orphans

```