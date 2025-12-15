---
title: element Carousel走马灯
date: 2021-12-29 00:00:00
tags:
  - element
---

首先引入js和css

```js
<!-- 引入样式 -->  
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">  
<!-- 引入组件库 -->  
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
```

接着引入vue

```js
<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
```

快速上手

```js
<!-- 轮播图 -->  
<section class="banner">  
    <el-carousel>  
        <el-carousel-item v-for="(item,index) in imgs" :key="index">  
            <img :src="item.src" alt="轮播图">  
        </el-carousel-item>  
    </el-carousel>  
</section>
```

```js
<script th:inline="javascript">  
    let vue = new Vue({  
        el: "#app"  
        , data: {  
            imgs: [[${contentBanner}]]  
        }  
    });  
</script>
```

效果如下

[](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211229231459157.png)

这是具体参数和事件

[](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20211229231745580.png)