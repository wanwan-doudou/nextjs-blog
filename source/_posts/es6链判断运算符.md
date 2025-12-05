---
title: es6链判断运算符
date: 2021-12-13 00:00:00
tags:
  - es6
---

今天写项目碰到一个问题，我明确知道这个对象中的有一个属性有值，

但是我获取的时候就报错，后面知道这个地方要使用链判断运算符。

现在我们来学习一下扩展运算符中的链判断运算符。

编程实务中，如果读取内部的某个属性，往往需要判断一下，属性的上层对象是否在。比如，读取`message.body.user.firstName`这个属性，安全的写法是写成下面这样。

```js
// 错误的写法  
const  firstName = message.body.user.firstName || 'default';  
  
// 正确的写法  
const firstName = (message  
  && message.body  
  && message.body.user  
  && message.body.user.firstName) || 'default';
```

上面例子中，`firstName`属性在对象的第四层，所以需要判断四次，每一层是否有值。

三元运算符`?:`也常用于判断对象是否存在。

```js
const fooInput = myForm.querySelector('input[name=foo]')  
const fooValue = fooInput ? fooInput.value : undefined
```

上面例子中，必须先判断`fooInput`是否存在，才能读取`fooInput.value`。

这样的层层判断非常麻烦，因此 [ES2020](https://github.com/tc39/proposal-optional-chaining) 引入了“链判断运算符”（optional chaining operator）`?.`，简化上面的写法。

```js
const firstName = message?.body?.user?.firstName || 'default';  
const fooValue = myForm.querySelector('input[name=foo]')?.value
```

上面代码使用了`?.`运算符，直接在链式调用的时候判断，左侧的对象是否为`null`或`undefined`。如果是的，就不再往下运算，而是返回`undefined`。

下面是判断对象方法是否存在，如果存在就立即执行的例子。

```js
iterator.return?.()
```

上面代码中，`iterator.return`如果有定义，就会调用该方法，否则`iterator.return`直接返回`undefined`，不再执行`?.`后面的部分。

对于那些可能没有实现的方法，这个运算符尤其有用。

```js
if (myForm.checkValidity?.() === false) {  
  // 表单校验失败  
  return;  
}
```

上面代码中，老式浏览器的表单对象可能没有`checkValidity()`这个方法，这时`?.`运算符就会返回`undefined`，判断语句就变成了`undefined === false`，所以就会跳过下面的代码。

链判断运算符`?.`有三种写法。

- obj?.prop // 对象属性是否存在
- obj?.[expr] // 同上
- func?.(...args) // 函数或对象方法是否存在

下面是`obj?.[expr]`用法的一个例子。

```js
let hex = "#C0FFEE".match(/#([A-Z]+)/i)?.[1];
```

上面例子中，字符串的`match()`方法，如果没有发现匹配会返回`null`，如果发现匹配会返回一个数组，`?.`运算符起到了判断作用。

下面是`?.`运算符常见形式，以及不使用该运算符时的等价形式。

```js
a?.b  
// 等同于  
a == null ? undefined : a.b  
  
a?.[x]  
// 等同于  
a == null ? undefined : a[x]  
  
a?.b()  
// 等同于  
a == null ? undefined : a.b()  
  
a?.()  
// 等同于  
a == null ? undefined : a()
```

上面代码中，特别注意后两种形式，如果`a?.b()`和`a?.()`。如果`a?.b()`里面的`a.b`有值，但不是函数，不可调用，那么`a?.b()`是会报错的。`a?.()`也是如此，如果`a`不是`null`或`undefined`，但也不是函数，那么`a?.()`会报错。

使用这个运算符，有几个注意点。。

（1）短路机制

本质上，`?.`运算符相当于一种短路机制，只要不满足条件，就不再往下执行。

```js
a?.[++x]  
// 等同于  
a == null ? undefined : a[++x]
```

上面代码中，如果`a`是`undefined`或`null`，那么`x`不会进行递增运算。也就是说，链判断运算符一旦为真，右侧的表达式就不再求值。

（2）括号的影响

如果属性链有圆括号，链判断运算符对圆括号外部没有影响，只对圆括号内部有影响。

```js
(a?.b).c  
// 等价于  
(a == null ? undefined : a.b).c
```

上面代码中，`?.`对圆括号外部没有影响，不管`a`对象是否存在，圆括号后面的`.c`总是会执行。

一般来说，使用`?.`运算符的场合，不应该使用圆括号。

（3）报错场合

以下写法是禁止的，会报错。

```js
// 构造函数  
new a?.()  
new a?.b()  
  
// 链判断运算符的右侧有模板字符串  
a?.`{b}`  
a?.b`{c}`  
  
// 链判断运算符的左侧是 super  
super?.()  
super?.foo  
  
// 链运算符用于赋值运算符左侧  
a?.b = c
```

（4）右侧不得为十进制数值

为了保证兼容以前的代码，允许`foo?.3:0`被解析成`foo ? .3 : 0`，因此规定如果`?.`后面紧跟一个十进制数字，那么`?.`不再被看成是一个完整的运算符，而会按照三元运算符进行处理，也就是说，那个小数点会归属于后面的十进制数字，形成一个小数。