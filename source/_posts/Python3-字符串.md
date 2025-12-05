---
title: Python3 字符串
date: 2022-10-03 00:00:00
tags:
  - python
---

# Python3 字符串

字符串是 Python 中最常用的数据类型。我们可以使用引号( ‘ 或 “ )来创建字符串。

创建字符串很简单，只要为变量分配一个值即可。例如

> var1 = ‘Hello World!’var2 = “Runoob”

## Python 访问字符串中的值

Python 不支持单字符类型，单字符在 Python 中也是作为一个字符串使用。

Python 访问子字符串，可以使用方括号 [] 来截取字符串，字符串的截取的语法格式如下：

变量[头下标:尾下标]

索引值以 **0** 为开始值，**-1** 为从末尾的开始位置。

![](https://static.runoob.com/wp-content/uploads/123456-20200923-1.svg)
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20221003214949.png)

如下实例：

> var1 = ‘Hello World!’var2 = “Runoob”print (“var1[0]: “, var1[0])print (“var2[1:5]: “, var2[1:5])

以上实例执行结果：

> var1[0]:  Hvar2[1:5]:  unoo

## Python 字符串更新

你可以截取字符串的一部分并与其他字段拼接，如下实例：

> var1 = ‘Hello World!’print (“已更新字符串 : “, var1[:6] + ‘Runoob!’)

以上实例执行结果

> 已更新字符串 :  Hello Runoob!

## Python转义字符

在需要在字符中使用特殊字符时，python 用反斜杠 \ 转义字符。如下表：

| 转义字符 | 描述 | 实例 |
| --- | --- | --- |
| (在行尾时) | 续行符 |  |
| \ | 反斜杠符号 |  |
| ' | 单引号 |  |
| " | 双引号 |  |
| \a | 响铃 |  |
| \b | 退格(Backspace) |  |
| \000 | 空 |  |
| \n | 换行 |  |
| \t | 横向制表符 |  |
| \r | 回车，将 \r 后面的内容移到字符串开头，并逐一替换开头部分的字符，直至将 \r 后面的内容完全替换完成。 |  |
| \f | 换页 |  |

## Python字符串运算符

下表实例变量 a 值为字符串 “Hello”，b 变量值为 “Python”：

| 操作符 | 描述 | 实例 |
| --- | --- | --- |

- |  字符串连接 |   a + b 输出结果： HelloPython

- |   重复输出字符串 | a*2 输出结果：HelloHello[] |  通过索引获取字符串中字符 |   a[1] 输出结果 e[ : ] |   截取字符串中的一部分，遵循左闭右开原则，str[0:2] 是不包含第 3 个字符的。| a[1:4]输出结果 ellin | 成员运算符 - 如果字符串中包含给定的字符返回 True | ‘H’ in a 输出结果 Truenot in |   成员运算符 - 如果字符串中不包含给定的字符返回 True | ‘M’ not in a 输出结果 True

```python
a = "Hello"
b = "Python"

print("a + b 输出结果：", a + b) 
print("a * 2 输出结果：", a * 2)
print("a[1] 输出结果：", a[1])
print("a[1:4] 输出结果：", a[1:4])

if( "H" in a) :
    print("H 在变量 a 中")
else :
    print("H 不在变量 a 中")
    
if( "M" not in a) :
    print("M 不在变量 a 中")
else :
    print("M 在变量 a 中")
```

以上实例输出结果为：

> a + b 输出结果： HelloPythona * 2 输出结果： HelloHelloa[1] 输出结果： ea[1:4] 输出结果： ellH 在变量 a 中M 不在变量 a 中

## Python 字符串格式化

Python 支持格式化字符串的输出 。尽管这样可能会用到非常复杂的表达式，但最基本的用法是将一个值插入到一个有字符串格式符 %s 的字符串中。

在 Python 中，字符串格式化使用与 C 中 sprintf 函数一样的语法。

```python
print ("我叫 %s 今年 %d 岁!" % ('小明', 10))
```

以上实例输出结果：

> 我叫 小明 今年 10 岁!

python字符串格式化符号:

| 符号 | 描述 |
| --- | --- |
| %c | 格式化字符及其ASCII码 |
| %s | 格式化字符串 |
| %d | 格式化整数 |
| %u | 格式化无符号整型 |
| %o | 格式化无符号八进制数 |
| %x | 格式化无符号十六进制数 |
| %X | 格式化无符号十六进制数（大写） |
| %f | 格式化浮点数字，可指定小数点后的精度 |
| %e | 用科学计数法格式化浮点数 |
| %E | 作用同%e，用科学计数法格式化浮点数 |
| %g | %f和%e的简写 |
| %G | %f 和 %E 的简写 |
| %p | 用十六进制数格式化变量的地址 |

## Python三引号

python三引号允许一个字符串跨多行，字符串中可以包含换行符、制表符以及其他特殊字符。实例如下

```python
para_str = """这是一个多行字符串的实例
多行字符串可以使用制表符
TAB ( \t )。
也可以使用换行符 [ \n ]。
"""

print (para_str)
```

> 这是一个多行字符串的实例多行字符串可以使用制表符TAB (    )。也可以使用换行符 [ ]。

## f-string

f-string 是 python3.6 之后版本添加的，称之为字面量格式化字符串，是新的格式化字符串的语法。

之前我们习惯用百分号 (%):

> >>> name = ‘Runoob’>>> ‘Hello %s’ % name‘Hello Runoob’

**f-string** 格式化字符串以 f 开头，后面跟着字符串，字符串中的表达式用大括号 {} 包起来，它会将变量或表达式计算后的值替换进去，实例如下：

> >>> name = ‘Runoob’>>> f’Hello {name}’  # 替换变量‘Hello Runoob’>>> f’{1+2}’         # 使用表达式‘3’>>> w = {‘name’: ‘Runoob’, ‘url’: ‘www.runoob.com'}>>> f’{w[“name”]}: {w[“url”]}’‘Runoob: www.runoob.com‘

用了这种方式明显更简单了，不用再去判断使用 %s，还是 %d。

在 Python 3.8 的版本中可以使用 = 符号来拼接运算表达式与结果：

> >>> x = 1>>> print(f’{x+1}’)   # Python 3.62>>> x = 1>>> print(f’{x+1=}’)   # Python 3.8x+1=2