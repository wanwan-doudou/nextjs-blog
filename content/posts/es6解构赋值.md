---
title: es6解构赋值
date: 2022-01-22 00:00:00
tags:
  - es6
---

## 数组的解构赋值

### 基本用法

ES6 允许按照一定模式，从数组和对象中提取值，对变量进行赋值，这被称为解构（Destructuring）。

以前，为变量赋值，只能直接指定值。

```js
let a = 1;  
let b = 2;  
let c = 3;
```

ES6 允许写成下面这样。

```js
let [a, b, c] = [1, 2, 3];
```

上面代码表示，可以从数组中提取值，按照对应位置，对变量赋值。

本质上，这种写法属于“模式匹配”，只要等号两边的模式相同，左边的变量就会被赋予对应的值。下面是一些使用嵌套数组进行解构的例子。

```js
let [foo, [[bar], baz]] = [1, [[2], 3]];  
foo // 1  
bar // 2  
baz // 3  
  
let [ , , third] = ["foo", "bar", "baz"];  
third // "baz"  
  
let [x, , y] = [1, 2, 3];  
x // 1  
y // 3  
  
let [head, ...tail] = [1, 2, 3, 4];  
head // 1  
tail // [2, 3, 4]  
  
let [x, y, ...z] = ['a'];  
x // "a"  
y // undefined  
z // []
```

如果解构不成功，变量的值就等于`undefined`。

```js
let [foo] = [];  
let [bar, foo] = [1];
```

以上两种情况都属于解构不成功，`foo`的值都会等于`undefined`。

另一种情况是不完全解构，即等号左边的模式，只匹配一部分的等号右边的数组。这种情况下，解构依然可以成功。

```js
let [x, y] = [1, 2, 3];  
x // 1  
y // 2  
  
let [a, [b], d] = [1, [2, 3], 4];  
a // 1  
b // 2  
d // 4
```

上面两个例子，都属于不完全解构，但是可以成功。

如果等号的右边不是数组（或者严格地说，不是可遍历的结构，参见《Iterator》一章），那么将会报错。

```js
// 报错  
let [foo] = 1;  
let [foo] = false;  
let [foo] = NaN;  
let [foo] = undefined;  
let [foo] = null;  
let [foo] = {};
```

上面的语句都会报错，因为等号右边的值，要么转为对象以后不具备 Iterator 接口（前五个表达式），要么本身就不具备 Iterator 接口（最后一个表达式）。

# 对象解构赋值

```js
let msg = {user:{avatar:'头像'}}  
let obj = msg.user  
console.log(obj)  
console.log(msg.user)  
{avatar: '头像'}  
{avatar: '头像'}  
  
let msg = {user:{avatar:'头像'}}  
let obj = { avatar: msg.user.avatar }  
console.log(obj)  
console.log(msg.user)  
{avatar: '头像'}  
{avatar: '头像'}
```