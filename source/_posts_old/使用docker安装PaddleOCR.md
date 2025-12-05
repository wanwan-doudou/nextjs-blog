---
title: 使用docker安装PaddleOCR
date: 2024-09-29 00:00:00
tags:
  - PaddleOCR
---

## 1\. 安装必要的系统工具
    
    
    1  
    2  
    

| 
    
    
    sudo yum install -y yum-utils device-mapper-persitent-data lvm2  
    sudo yum install -y epel-release  
      
  
---|---  
  
## 2\. 添加阿里云镜像仓库
    
    
    1  
    

| 
    
    
    sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo  
      
  
---|---  
  
## 3.更新并安装Docker-CE
    
    
    1  
    2  
    

| 
    
    
    sudo yum makecache fast   
    sudo yum -y install docker-ce  
      
  
---|---  
  
## 4\. 开启Docker服务
    
    
    1  
    

| 
    
    
    sudo service docker start  
      
  
---|---  
  
## 5\. 安装DockerCompose
    
    
    1  
    

| 
    
    
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-Linux-x86_64" -o /usr/local/bin/docker-compose  
      
  
---|---  
  
## 6\. 授予执行权限
    
    
    1  
    

| 
    
    
    sudo chmod +x /usr/local/bin/docker-compose  
      
  
---|---  
  
## 7\. 创建ocr-cpu目录
    
    
    1  
    2  
    3  
    

| 
    
    
    cd /home  
    mkdir ocr-cpu  
    cd ocr-cpu  
      
  
---|---  
  
## 8\. 编写Dockerfile
    
    
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
    39  
    40  
    41  
    42  
    43  
    44  
    45  
    

| 
    
    
    # 使用最新版 Python    
    FROM python:slim    
        
    # 更新 apt-get 并安装必要的依赖    
    RUN apt-get update && \    
        apt-get install -y git libgomp1 libgl1-mesa-glx libglib2.0-0 && \    
        rm -rf /var/lib/apt/lists/*    
        
    # 更新 pip 并安装 setuptools    
    RUN pip install --upgrade pip setuptools -i https://mirrors.aliyun.com/pypi/simple    
        
    # 安装 paddlepaddle 和 paddlehub（使用最新版）    
    RUN pip install paddlepaddle paddlehub -i https://mirrors.aliyun.com/pypi/simple    
        
    # **关键修改**：降级 protobuf 到兼容版本 3.20.x，以避免 TypeError 错误    
    RUN pip install protobuf==3.20.* -i https://mirrors.aliyun.com/pypi/simple    
        
    # 克隆 PaddleOCR 仓库    
    RUN git clone https://gitee.com/paddlepaddle/PaddleOCR.git /PaddleOCR    
    WORKDIR /PaddleOCR    
        
    # 直接安装依赖    
    RUN pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple    
        
    # **关键修改**：设置环境变量以避免 protobuf 错误    
    ENV PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python    
        
    # 下载并解压模型    
    ADD https://paddleocr.bj.bcebos.com/PP-OCRv3/chinese/ch_PP-OCRv3_det_infer.tar /PaddleOCR/inference/    
    RUN tar xf /PaddleOCR/inference/ch_PP-OCRv3_det_infer.tar -C /PaddleOCR/inference/    
        
    ADD https://paddleocr.bj.bcebos.com/PP-OCRv3/chinese/ch_PP-OCRv3_rec_infer.tar /PaddleOCR/inference/    
    RUN tar xf /PaddleOCR/inference/ch_PP-OCRv3_rec_infer.tar -C /PaddleOCR/inference/    
        
    ADD https://paddleocr.bj.bcebos.com/dygraph_v2.0/ch/ch_ppocr_mobile_v2.0_cls_infer.tar /PaddleOCR/inference/    
    RUN tar xf /PaddleOCR/inference/ch_ppocr_mobile_v2.0_cls_infer.tar -C /PaddleOCR/inference/    
        
    # 安装 OCR 模块    
    RUN hub install deploy/hubserving/ocr_system/    
        
    # 暴露端口    
    EXPOSE 8866    
        
    # 启动 PaddleHub 服务    
    CMD ["hub", "serving", "start", "-m", "ocr_system"]  
      
  
---|---  
  
## 9\. 创建 docker-compose.yml 文件
    
    
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
    

| 
    
    
    version: '3'  # 正确的版本声明    
        
    services:    
      ocr-cpu:    
        image: ocr-cpu  # 注意这里的冒号应为连字符    
        restart: always    
        hostname: ocr-cpu    
        container_name: ocr-cpu    
        ports:    
          - "8866:8866"  # 使用引号包裹端口映射  
      
  
---|---  
  
## 10\. 运行Docker构建命令，docker-compose命令部署
    
    
    1  
    2  
    

| 
    
    
    docker build --network=host -t ocr-cpu .  
    docker-compose up -d  
      
  
---|---  
  
## 11\. 查看的容器

![image.png](https://kwydy.oss-cn-guangzhou.aliyuncs.com/doudou/202409291748598.png)

## 12\. 编写后端测试代码
    
    
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
    39  
    40  
    41  
    42  
    43  
    44  
    45  
    46  
    47  
    48  
    49  
    50  
    51  
    52  
    53  
    54  
    55  
    56  
    57  
    58  
    59  
    60  
    61  
    62  
    63  
    64  
    65  
    66  
    67  
    68  
    69  
    70  
    71  
    72  
    73  
    74  
    75  
    76  
    77  
    78  
    79  
    80  
    81  
    82  
    83  
    84  
    

| 
    
    
    package main    
        
    import (    
        "bytes"    
        "encoding/base64"    "encoding/json"    "fmt"    "io/ioutil"    "net/http"    "os")    
        
    func main() {    
        // URL 和图片路径设置    
        url := "http://192.168.31.203:8866/predict/ocr_system"    
        imagePath := `C:\Users\doudou\Desktop\微信截图_20240929171217.png`    
        
        // 读取图片    
        imgFile, err := os.Open(imagePath)    
        if err != nil {    
           fmt.Println("Error opening image file:", err)    
           return    
        }    
        defer imgFile.Close()    
        
        imgData, err := ioutil.ReadAll(imgFile)    
        if err != nil {    
           fmt.Println("Error reading image file:", err)    
           return    
        }    
        
        // Base64 编码    
        imgBase64 := base64.StdEncoding.EncodeToString(imgData)    
        data := map[string]interface{}{    
           "images": []string{imgBase64},    
        }    
        jsonData, err := json.Marshal(data)    
        if err != nil {    
           fmt.Println("Error marshaling JSON:", err)    
           return    
        }    
        
        // 发送请求    
        req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))    
        if err != nil {    
           fmt.Println("Error creating request:", err)    
           return    
        }    
        req.Header.Set("Content-Type", "application/json")    
        
        client := &http.Client{}    
        response, err := client.Do(req)    
        if err != nil {    
           fmt.Println("Error sending request:", err)    
           return    
        }    
        defer response.Body.Close()    
        
        body, err := ioutil.ReadAll(response.Body)    
        if err != nil {    
           fmt.Println("Error reading response body:", err)    
           return    
        }    
        
        // 解析 JSON 响应    
        var result map[string]interface{}    
        if err := json.Unmarshal(body, &result); err != nil {    
           fmt.Println("Error unmarshaling JSON:", err)    
           return    
        }    
        
        // 检查状态    
        if result["status"] == "000" {    
           if results, ok := result["results"].([]interface{}); ok {    
              for _, res := range results {    
                 if resList, ok := res.([]interface{}); ok {    
                    for _, item := range resList {    
                       if itemMap, ok := item.(map[string]interface{}); ok {    
                          text := itemMap["text"].(string)    
                          confidence := itemMap["confidence"].(float64)    
                          fmt.Printf("Text: %s, Confidence: %.2f\n", text, confidence)    
                       }    
                    }    
                 }    
              }    
           }    
        } else {    
           fmt.Println("Error in response:", result["msg"])    
        }    
    }  
      
  
---|---  
  
## 12\. 测试结果

![微信截图_20240929171217.png](https://kwydy.oss-cn-guangzhou.aliyuncs.com/doudou/202409291750650.png)

![image.png](https://kwydy.oss-cn-guangzhou.aliyuncs.com/doudou/202409291751743.png)
