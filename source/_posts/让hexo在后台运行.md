---
title: 让hexo在后台运行
date: 2022-09-01 00:00:00
tags:
  - 踩坑
---

# 安装pm2

```plaintext
npm  install -g pm2
```

写一个运行脚本，在博客根目录下面创建一个hexo_run.js

```js
//run
const { exec } = require('child_process')
exec('hexo server',(error, stdout, stderr) => {
        if(error){
                console.log('exec error: ${error}')
                return
        }
        console.log('stdout: ${stdout}');
        console.log('stderr: ${stderr}');
})
```

运行命令

```plaintext
pm2 start hexo_run.js
```