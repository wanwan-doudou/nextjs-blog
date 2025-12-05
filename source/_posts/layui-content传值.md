---
title: layui content传值
date: 2021-12-02 00:00:00
tags:
  - layui
---

**layui弹窗层**

content可传入的值是灵活多变的，不仅可以传入普通的html内容，还可以指定DOM，更可以随着type的不同而不同。

```js
/!*  
 如果是页面层  
 */  
layer.open({  
  type: 1,   
  content: '传入任意的文本或html' //这里content是一个普通的String  
});  
layer.open({  
  type: 1,  
  content: $('#id') //这里content是一个DOM，注意：最好该元素要存放在body最外层，否则可能被其它的相对元素所影响  
});  
//Ajax获取  
$.post('url', {}, function(str){  
  layer.open({  
    type: 1,  
    content: str //注意，如果str是object，那么需要字符拼接。  
  });  
});  
/!*  
 如果是iframe层  
 */  
layer.open({  
  type: 2,   
  content: 'http://sentsin.com' //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']  
});   
/!*  
 如果是用layer.open执行tips层  
 */  
layer.open({  
  type: 4,  
  content: ['内容', '#id'] //数组第二项即吸附元素选择器或者DOM  
});
```

```js
parent.layer.open({  
    //content:`${data.item.title}`  
    content: '<div id="contentDiv" style="margin-left:10px;margin-top:10px;"><input id="txtType" style="width:180px;height:50px;resize:none;border-radius:6px;" ></input></div>'  
    , btn: ['确定修改']  
    , yes: function (index, layero) {  
        var txtType = top.$('#txtType').val();  
        console.log(txtType);  
        treeTable.render(re);  
        layer.close(index);  
    }  
    , cancel: function () {  
        //return false 开启该代码可禁止点击该按钮关闭  
    }  
});
```