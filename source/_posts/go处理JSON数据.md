---
title: go处理JSON数据
date: 2024-09-05 00:00:00
tags:
  - go
---

在Go语言中，处理JSON数据通常使用标准库中的 `encoding/json` 包。以下是一些常用的操作方法：

### 一、基本操作

**1.将Go结构体编码为JSON**
`json.Marshal` 方法将Go结构体转换为JSON字节流。如果需要格式化输出，可以使用 `json.MarshalIndent`。

```go
type Person struct {  
    Name string `json:"name"`  
    Age  int    `json:"age"`  
}  
  
func main() {  
    // 将Go结构体编码为JSON  
    person := Person{Name: "aiJiang", Age: 22}  
    jsonData, err := json.Marshal(person)  
    if err != nil {  
       fmt.Println(err)  
       return  
    }  
    fmt.Println(string(jsonData))  
}
```

```go
func main() {  
    // 将Go结构体编码为JSON  
    person := Person{Name: "aiJiang", Age: 22}  
    jsonData, err := json.MarshalIndent(person, "", "    ")  
    if err != nil {  
       fmt.Println(err)  
       return  
    }  
    fmt.Println(string(jsonData))  
}
```

这是运行结果
![63ooq2.png](https://files.catbox.moe/63ooq2.png)

**2.将JSON解码为Go结构体**

```go
type Person struct {  
    Name string `json:"name"`  
    Age  int    `json:"age"`  
}  
  
func main() {  
    // 将JSON解码为Go结构体  
    jsonData := `{"name":"AI", "age":30}`  
    var p Person  
    err := json.Unmarshal([]byte(jsonData), &p)  
    if err != nil {  
       fmt.Println(err)  
       return  
    }  
    fmt.Printf("%+v\n", p)  
}
```

`json.Unmarshal` 方法将JSON字节流解析为Go结构体。

这是运行结果
![fjxlgu.png](https://files.catbox.moe/fjxlgu.png)

### 二、处理复杂JSON结构

**1. 处理嵌套结构**

```go
type Address struct {  
    City    string `json:"city"`  
    ZipCode string `json:"zip_code"`  
}  
  
type Person struct {  
    Name    string  `json:"name"`  
    Age     int     `json:"age"`  
    Address Address `json:"address"`  
}  
  
func main() {  
    jsonData := `{"name":"aiJiang", "age":22, "address":{"city":"changsha", "zip_code":"410000"}}`  
    var p Person  
    err := json.Unmarshal([]byte(jsonData), &p)  
    if err != nil {  
       fmt.Println(err)  
       return  
    }  
    fmt.Printf("%+v\n", p)  
}
```

这是运行结果
![30j4jq.png](https://files.catbox.moe/30j4jq.png)

**2. 处理动态或未知结构**
使用 `map[string]interface{}` 或 `interface{}` 来处理结构不确定的JSON数据。

```go
func main() {  
    jsonData := `{"name":"aiJiang", "age":22, "additional_info":{"hobbies":["play table tennis", "Program"], "is_student":false}}`  
    var result map[string]interface{}  
    err := json.Unmarshal([]byte(jsonData), &result)  
    if err != nil {  
       fmt.Println(err)  
       return  
    }  
    fmt.Printf("%+v\n", result)  
}
```

这是运行结果
![slqzze.png](https://files.catbox.moe/slqzze.png)

### 三、使用自定义的JSON标签

可以通过在结构体字段上使用 `json` 标签来控制JSON的编码和解码行为。

```go
type Person struct {  
    Name     string `json:"name"`  
    Age      int    `json:"age"`  
    Nickname string `json:"nickname,omitempty"` // omitempty表示为空时省略字段  
    Password string `json:"-"`                  // "-"表示忽略字段  
}  
  
func main() {  
    person := Person{  
       Name:     "aiJiang",  
       Age:      22,  
       Password: "123456",  
    }  
    jsonData, err := json.Marshal(person)  
    if err != nil {  
       fmt.Println(err)  
       return  
    }  
    fmt.Println(string(jsonData))  
}
```

这是运行结果
![8yx0r6.png](https://files.catbox.moe/8yx0r6.png)

### 四、流式编码和解码

对于处理大数据集或需要逐条处理JSON对象的情况，可以使用 `json.Encoder` 和 `json.Decoder`。以下是一些使用流式编解码的场景：

1. 大型数据集处理：当数据集太大，无法一次性加载到内存中时，可以使用流式编解码逐块读取或写入数据。
2. 网络传输：在网络应用中，流式编解码允许你边接收数据边解析，或者边生成数据边发送，这样可以减少内存占用并提高响应速度。
3. 实时数据处理：在需要实时处理数据的应用中，如日志分析或实时监控系统，流式编解码可以边读取数据边进行处理，而不需要等待整个数据集加载完成。
4. 逐条处理JSON对象：在处理JSON格式的数据流时，如果数据以对象的形式逐个出现，使用流式编解码可以逐个对象进行处理，而不是将整个数据集加载到内存中。
5. 节省内存：对于内存敏感的应用，流式编解码可以减少内存使用，因为它不需要一次性加载整个数据集。
6. 异步处理：在异步编程模型中，流式编解码可以与异步IO操作配合使用，提高程序的并发性能。
7. 数据转换：在需要将一种数据格式转换为另一种格式的过程中，流式编解码可以在转换过程中逐步处理数据，而不是将整个数据集加载到内存中进行转换。

```go
func main() {  
    // 流式编码  
    enc := json.NewEncoder(os.Stdout)  
    p := Person{Name: "aiJiang", Age: 22}  
    fmt.Print("Encoded JSON: ")  
    err := enc.Encode(p)  
    if err != nil {  
       return  
    } // 注意：Encode会自动在输出的JSON后面加上一个换行符  
  
    // 准备要解码的JSON数据  
    data := `{"name":"dou","age":23}`  
    dec := json.NewDecoder(strings.NewReader(data))  
  
    // 流式解码  
    var p2 Person  
    err = dec.Decode(&p2)  
    if err != nil {  
       fmt.Println("Error decoding JSON:", err)  
       return  
    }  
    fmt.Printf("Decoded struct: %+v\n", p2)  
}
```

这是运行结果
![i6ty61.png](https://files.catbox.moe/i6ty61.png)