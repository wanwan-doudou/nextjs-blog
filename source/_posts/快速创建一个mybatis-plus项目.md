---
title: 快速创建一个mybatis-plus项目
date: 2022-09-14 00:00:00
tags:
  - mybatis-plus
---

## 创建项目

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220914101523.png)

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220914101647.png)

导入依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">  
    <modelVersion>4.0.0</modelVersion>  
    <!-- SpringBoot环境依赖 -->  
    <parent>  
        <groupId>org.springframework.boot</groupId>  
        <artifactId>spring-boot-starter-parent</artifactId>  
        <version>2.7.3</version>  
        <relativePath/> <!-- lookup parent from repository -->  
    </parent>  
    <groupId>com.kwydy</groupId>  
    <artifactId>mybatis-plus</artifactId>  
    <version>0.0.1-SNAPSHOT</version>  
    <name>mybatis-plus</name>  
    <description>mybatis-plus</description>  
    <!-- JDK依赖 -->  
    <properties>  
        <java.version>18</java.version>  
    </properties>
    <dependencies>        
    <!-- SpringMVC依赖 -->  
        <dependency>  
            <groupId>org.springframework.boot</groupId>  
            <artifactId>spring-boot-starter-web</artifactId>  
        </dependency>        
        <!-- MySQL驱动依赖 -->  
        <dependency>  
            <groupId>mysql</groupId>  
            <artifactId>mysql-connector-java</artifactId>  
            <scope>runtime</scope>  
        </dependency>        
        <!-- 数据库连接池 -->  
        <dependency>  
            <groupId>com.alibaba</groupId>  
            <artifactId>druid-spring-boot-starter</artifactId>  
            <version>1.2.11</version>  
        </dependency>        
        <!-- Test依赖 -->  
        <dependency>  
            <groupId>org.springframework.boot</groupId>  
            <artifactId>spring-boot-starter-test</artifactId>  
            <scope>test</scope>  
        </dependency>        
        <!-- MyBatis-Plus依赖 -->  
        <dependency>  
            <groupId>com.baomidou</groupId>  
            <artifactId>mybatis-plus-boot-starter</artifactId>  
            <version>3.5.2</version>  
        </dependency>        
        <!-- Lombok依赖 -->  
        <dependency>  
            <groupId>org.projectlombok</groupId>  
            <artifactId>lombok</artifactId>  
        </dependency>    
    </dependencies>  
    <build>        
	    <plugins>            
		    <plugin>                
			    <groupId>org.springframework.boot</groupId>  
                <artifactId>spring-boot-maven-plugin</artifactId>  
                <version>2.5.0</version>  
            </plugin>       
        </plugins>   
    </build>  
</project>
```

配置yml

```yml
spring:  
  datasource:  
    druid:  
      driver-class-name: com.mysql.cj.jdbc.Driver  
      url: jdbc:mysql://localhost:3306/mybatis_plus?serverTimezone=UTC  
      username: root  
      password: root  
  
server:  
  port: 8081
```

构建项目
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220914102808.png)

编写实体类 `User.java`

```java
@Component //（把普通pojo实例化到spring容器中，相当于配置文件中的 <bean id="" class=""/>）  
@Data  
public class User {  
    private Integer id;  
    private String name;  
    private Integer age;  
    private String email;  
  
}
```

编写 mapper 中的 `UserMapper`接口

```java
@Mapper  
public interface UserMapper extends BaseMapper<User> {  
}
```

编写service 中的 `IUserService`接口

```java
public interface IUserService extends IService<User> {  
}
```

编写impl 中 的 `UserServiceImpl`实现类

```java
@Service  
public class UserServiceImpl extends ServiceImpl<UserMapper,User> implements IUserService {  
  
}
```

编写controller 中 的 `UserController`

```java
@RestController  
@RequestMapping("/user")  
public class UserController {  
  
    @Resource  
    private IUserService userService;  
  
    @GetMapping  
    public List<User> getUser() {  
        return userService.list();  
    }  
  
}
```

搭建好之后就可以运行项目了
浏览器服务[localhost:8081/user](http://localhost:8081/user)

这是运行截图
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220914104217.png)