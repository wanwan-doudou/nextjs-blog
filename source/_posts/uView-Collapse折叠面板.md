---
title: uView Collapse折叠面板
date: 2022-01-12 00:00:00
tags:
  - uView
---

快速上手

```js
<template>  
  <u-collapse  
    @change="change"  
    @close="close"  
    @open="open"  
  >  
    <u-collapse-item  
      title="第一个折叠面板"  
      name="first"  
    >  
      <text class="u-collapse-content">第一条内容</text>  
    </u-collapse-item>  
    <u-collapse-item  
      title="第二个折叠面板"  
      name="second"  
    >  
      <text class="u-collapse-content">第二条内容</text>  
    </u-collapse-item>  
    <u-collapse-item  
      title="第三个折叠面板"  
      name="third"  
    >  
      <text class="u-collapse-content">第三条内容</text>  
    </u-collapse-item>  
  </u-collapse>  
</template>  
  
<script>  
	export default {  
		methods: {  
            open(e) {  
              console.log('open', e)  
            },  
            close(e) {  
              console.log('close', e)  
            },  
            change(e) {  
              console.log('change', e)  
            }  
        }  
	}  
</script>
```

### Collapse Item Props

[](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20220112204734435.png)

### Collapse Event

[](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/image-20220112205005086.png)