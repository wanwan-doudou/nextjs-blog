---
title: layui 实现不同用户操作权限不同
date: 2021-11-30 00:00:00
tags:
  - layui
---

在代码里面我们会遇到不同用户操作权限不同能用的功能也不一样

比如：我们能操作自己操作的群聊，但是不能修改其他群聊的数据

下面我们有个需求，一个是我创建的群，一个是我加入的群

我从layui数据表格中点击我加如的群时，操作功能模块删除掉

由于我们是动态创建表格的，所以我们先将对象封装到一个数组里面
    
    
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
    23  
    24  
    25  
    26  
    27  
    28  
    29  
    30  
    31  
    32  
    33  
    34  
    35  
    36  
    37  
    38  
    

| 
    
    
    let cols = [    
                [    
                    {    
                        field: 'id',    
                        title: 'ID',    
                        width: 80,    
                        hide: true,    
                 }, {    
                    field: 'cover'    
                    , title: '头像'    
                    , templet: '#cover'    
                    , width: 70,    
                }, {    
                    field: 'contactPerson'    
                    , title: '联系人'    
                    , edit: 'text'    
                    , width: 100,    
                }, {    
                    field: 'contactMobile'    
                    , title: '联系电话'    
                    , edit: 'text'    
                    , width: 160,    
                }, {    
                    field: 'name'    
                    , title: '工作单位'    
                    , edit: 'text',    
                }, {    
                    field: 'email'    
                    , title: '联系邮箱'    
                    , edit: 'text',    
                }, {    
                    field: 'addressDetail'    
                    , title: '详细地址'    
                    , edit: 'text'    
                    , width: 160,    
                }    
              ]    
            ]  
      
  
---|---  
  
在创建时进行判断
    
    
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
    

| 
    
    
    if (searchForm.queryType == 'JOIN') {    
        if (~optionIndex) {    
           cols[0].splice(optionIndex, 1)    
        }    
        } else {    
            if (!~optionIndex) {    
               cols[0].push({    
                     title: '操作',    
                     toolbar: '#test-table-toolbar-barDemo',    
                     width: 140,    
        	})    
       }    
    }  
      
  
---|---  
      
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    

| 
    
    
    if (searchForm.queryType == 'MADE' && !~cols.flat(Infinity).map(({title}) => title).findIndex(t => t == '操作')) {    
               cols[0].push({    
                   title: '操作',    
                   toolbar: '#test-table-toolbar-barDemo',    
                   width: 140,    
               })    
           }  
      
  
---|---
