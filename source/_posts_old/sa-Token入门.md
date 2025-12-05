---
title: sa-Token入门
date: 2022-01-23 00:00:00
tags:
  - sa-Token
---

### [1、创建项目](https://sa-token.dev33.cn/doc/index.html#/start/example?id=_1%E3%80%81%E5%88%9B%E5%BB%BA%E9%A1%B9%E7%9B%AE)

在IDE中新建一个SpringBoot项目

### [](https://kwydy.gitee.io/2022/01/23/sa-Token%E5%85%A5%E9%97%A8/#2%E3%80%81%E6%B7%BB%E5%8A%A0%E4%BE%9D%E8%B5%96 "2、添加依赖")[2、添加依赖](https://sa-token.dev33.cn/doc/index.html#/start/example?id=_2%E3%80%81%E6%B7%BB%E5%8A%A0%E4%BE%9D%E8%B5%96)

在 `pom.xml` 中添加依赖：
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    

| 
    
    
    <!-- Sa-Token 权限认证, 在线文档：http://sa-token.dev33.cn/ -->    
    <dependency>    
        <groupId>cn.dev33</groupId>    
        <artifactId>sa-token-spring-boot-starter</artifactId>    
        <version>1.28.0</version>    
    </dependency>  
      
  
---|---  
  
### [3、设置配置文件](https://sa-token.dev33.cn/doc/index.html#/start/example?id=_3%E3%80%81%E8%AE%BE%E7%BD%AE%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6)

你可以**零配置启动项目** ，但同时你也可以在`application.yml`中增加如下配置，定制性使用框架：
    
    
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
    

| 
    
    
    server:    
        # 端口    
        port: 8081    
        
    # Sa-Token配置    
    sa-token:     
        # token名称 (同时也是cookie名称)    
        token-name: satoken    
        # token有效期，单位s 默认30天, -1代表永不过期     
        timeout: 2592000    
        # token临时有效期 (指定时间内无操作就视为token过期) 单位: 秒    
        activity-timeout: -1    
        # 是否允许同一账号并发登录 (为true时允许一起登录, 为false时新登录挤掉旧登录)     
        is-concurrent: true    
        # 在多人登录同一账号时，是否共用一个token (为true时所有登录共用一个token, 为false时每次登录新建一个token)     
        is-share: false    
        # token风格    
        token-style: uuid    
        # 是否输出操作日志     
        is-log: false  
      
  
---|---  
  
### [4、创建启动类](https://sa-token.dev33.cn/doc/index.html#/start/example?id=_4%E3%80%81%E5%88%9B%E5%BB%BA%E5%90%AF%E5%8A%A8%E7%B1%BB)

在项目中新建包 `com.pj` ，在此包内新建主类 `SaTokenDemoApplication.java`，输入以下代码：
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    

| 
    
    
    @SpringBootApplication    
    public class SaTokenDemoApplication {    
        public static void main(String[] args) throws JsonProcessingException {    
            SpringApplication.run(SaTokenDemoApplication.class, args);    
            System.out.println("启动成功：Sa-Token配置如下：" + SaManager.getConfig());    
        }    
    }  
      
  
---|---  
  
### [5、创建测试Controller](https://sa-token.dev33.cn/doc/index.html#/start/example?id=_5%E3%80%81%E5%88%9B%E5%BB%BA%E6%B5%8B%E8%AF%95controller)
    
    
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
    

| 
    
    
    @RestController    
    @RequestMapping("/user/")    
    public class UserController {    
        
        // 测试登录，浏览器访问： http://localhost:8081/user/doLogin?username=zhang&password=123456    
        @RequestMapping("doLogin")    
        public String doLogin(String username, String password) {    
            // 此处仅作模拟示例，真实项目需要从数据库中查询数据进行比对     
            if("zhang".equals(username) && "123456".equals(password)) {    
                StpUtil.login(10001);    
                return "登录成功";    
            }    
            return "登录失败";    
        }    
        
        // 查询登录状态，浏览器访问： http://localhost:8081/user/isLogin    
        @RequestMapping("isLogin")    
        public String isLogin() {    
            return "当前会话是否登录：" + StpUtil.isLogin();    
        }    
        
    }  
      
  
---|---  
  
### [6、运行](https://sa-token.dev33.cn/doc/index.html#/start/example?id=_6%E3%80%81%E8%BF%90%E8%A1%8C)

启动代码，从浏览器依次访问上述测试接口：

[![](https://oss.dev33.cn/sa-token/doc/test-do-login.png)](https://oss.dev33.cn/sa-token/doc/test-do-login.png)

[![](https://oss.dev33.cn/sa-token/doc/test-is-login.png)](https://oss.dev33.cn/sa-token/doc/test-is-login.png)
