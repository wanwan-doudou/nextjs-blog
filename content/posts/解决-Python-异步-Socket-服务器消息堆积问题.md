---
title: 解决 Python 异步 Socket 服务器消息堆积问题
date: 2024-09-11 00:00:00
tags:
  - python
---

## 问题描述

在开发一个 Python 异步 Socket 服务器时，遇到了消息堆积的问题。服务器包含一个 TCP 服务和一个键盘监听服务。当检测到特定的键盘操作时，服务器应该通过 TCP 向客户端发送消息。然而，这些消息并没有立即发送出去，而是在心跳消息发送时才一起发出，导致消息堆积。

## 原始代码

```markdown
### socket_server.py

```python
import asyncio
import socket

SERVER_ADDRESS = '0.0.0.0'
SERVER_PORT = 12345
client_socket = None

async def handle_client(socket, client_address):
    global client_socket
    print(f"设备已连接: {client_address}")
    client_socket = socket
    loop = asyncio.get_event_loop()

    try:
        while True:
            message = await loop.sock_recv(client_socket, 1024)
            if not message:
                break
            message = message.decode()
            print(f"收到消息: {message}")

            if message == "HEARTBEAT":
                print("收到心跳消息")
                continue

            reply = f"服务器收到: {message}"
            await loop.sock_sendall(client_socket, reply.encode())
            await asyncio.sleep(0)
            print(f"发送回复: {reply}")
    except ConnectionResetError:
        print("连接已关闭")
    finally:
        client_socket = None
        socket.close()

async def send_message(client_socket, message):
    print(f"准备发送消息: {message}")
    loop = asyncio.get_event_loop()
    try:
        await loop.sock_sendall(client_socket, message.encode())
        print(f"消息发送成功: {message}")
    except Exception as e:
        print(f"发送消息出错: {e}")

async def start_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((SERVER_ADDRESS, SERVER_PORT))
    server_socket.listen(1)
    print("等待设备连接")

    loop = asyncio.get_event_loop()
    server_socket.setblocking(False)

    while True:
        client_socket, client_address = await loop.sock_accept(server_socket)
        await asyncio.create_task(handle_client(client_socket, client_address))
```

### keyboard_listener.py (部分代码)

```python
async def process_messages():
    while True:
        message = await message_queue.get()
        if socket_server.client_socket is not None:
            await socket_server.send_message(socket_server.client_socket, message)
```

## 原始代码中的问题

1. send_message 函数没有在消息末尾添加换行符，可能导致客户端无法正确分割消息。
2. handle_client 函数在发送回复后使用了 await asyncio.sleep(0)，这可能导致不必要的延迟。
3. process_messages 函数没有在处理完一条消息后让出控制权给事件循环。

## 解决方案

### 1. 修改 send_message 函数

在 `socket_server.py` 中，将 `send_message` 函数修改如下：

```python
async def send_message(client_socket, message):
    print(f"准备发送消息: {message}")
    loop = asyncio.get_running_loop()
    try:
        await loop.sock_sendall(client_socket, (message + '\n').encode())
        print(f"消息发送成功: {message}")
    except Exception as e:
        print(f"发送消息出错: {e}")
```

### 2. 优化 handle_client 函数

在 `socket_server.py` 中，修改 `handle_client` 函数：

```python
async def handle_client(socket, client_address):
    global client_socket
    print(f"设备已连接: {client_address}")
    client_socket = socket
    loop = asyncio.get_running_loop()

    try:
        while True:
            message = await loop.sock_recv(client_socket, 1024)
            if not message:
                break
            message = message.decode().strip()	# 去除可能的换行符
            print(f"收到消息: {message}")

            if message == "HEARTBEAT":
                print("收到心跳消息")
                continue

            reply = f"服务器收到: {message}"
            await send_message(client_socket, reply)
    except ConnectionResetError:
        print("连接已关闭")
    finally:
        client_socket = None
        socket.close()
```

### 3. 优化 process_messages 函数

在 `keyboard_listener.py` 中，修改 `process_messages` 函数：

```python
async def process_messages():
    while True:
        message = await message_queue.get()
        if socket_server.client_socket is not None:
            await socket_server.send_message(socket_server.client_socket, message)
        await asyncio.sleep(0)  # 让出控制权给事件循环
```

## 结论

通过以上修改，解决了消息堆积的问题，使服务器能够及时将消息发送给客户端。关键改进包括：

1. 在发送消息时添加换行符，确保客户端能正确接收和分割消息。
2. 移除了 handle_client 函数中不必要的 asyncio.sleep(0)。
3. 在 process_messages 函数中添加了 await asyncio.sleep(0)，以确保在处理完一条消息后让出控制权。
4. 确保所有异步操作都正确使用 await。

## 这是修改后完整的代码

```python
# main.py

import asyncio
import keyboard_listener
import socket_server


async def main():
    # 启动TCP服务器
    server_task = asyncio.create_task(socket_server.start_server())

    # 启动键盘监听器
    listener_task = asyncio.create_task(keyboard_listener.start_listener())

    # 启动消息处理任务
    message_task = asyncio.create_task(keyboard_listener.process_messages())

    # 保持主线程运行，直到所有任务完成
    await asyncio.gather(
        server_task,
        listener_task,
        message_task
    )


if __name__ == "__main__":
    asyncio.run(main())

```

```python
# socket_server.py

import asyncio
import socket

SERVER_ADDRESS = '0.0.0.0'  # 监听所有IP地址
SERVER_PORT = 12345
client_socket = None  # 全局变量保存唯一的客户端连接


async def handle_client(socket, client_address):
    global client_socket
    print(f"设备已连接: {client_address}")
    client_socket = socket  # 保存客户端连接
    loop = asyncio.get_running_loop()

    try:
        while True:
            message = await loop.sock_recv(client_socket, 1024)
            if not message:
                break
            message = message.decode().strip()  # 去除可能的换行符
            print(f"收到消息: {message}")

            # 处理心跳消息
            if message == "HEARTBEAT":
                print("收到心跳消息")
                continue

            # 处理其他消息
            reply = f"服务器收到: {message}"
            await send_message(client_socket, reply)
    except ConnectionResetError:
        print("连接已关闭")
    finally:
        client_socket = None  # 客户端断开时重置全局变量
        socket.close()


async def send_message(client_socket, message):
    print(f"准备发送消息: {message}")
    loop = asyncio.get_running_loop()
    try:
        await loop.sock_sendall(client_socket, (message + '\n').encode())
        print(f"消息发送成功: {message}")
    except Exception as e:
        print(f"发送消息出错: {e}")


async def start_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((SERVER_ADDRESS, SERVER_PORT))
    server_socket.listen(1)
    print("等待设备连接")

    loop = asyncio.get_event_loop()
    server_socket.setblocking(False)

    while True:
        client_socket, client_address = await loop.sock_accept(server_socket)
        await asyncio.create_task(handle_client(client_socket, client_address))
        
```

```python
# keyboard_listener.py

import asyncio
from pynput import keyboard
import socket_server

# 初始化变量，用于跟踪Ctrl键的状态和按下c键的次数
is_ctrl_pressed = False
c_press_count = 0
message_queue = asyncio.Queue()  # 创建消息队列


def on_press(key, loop):
    """
    按键按下时调用的函数
    """
    global is_ctrl_pressed, c_press_count  # 声明使用全局变量
    # 检测左ctrl或右ctrl键按下
    if key == keyboard.Key.ctrl_l or key == keyboard.Key.ctrl_r:
        is_ctrl_pressed = True  # 设置Ctrl键状态为按下
    # 如果ctrl键被按住，检测c键按下
    elif is_ctrl_pressed and hasattr(key, 'char'):
        # 检测 Ctrl + c 的组合
        if key.char == '\x03':  # '\x03' 是 Ctrl + c 的控制字符
            c_press_count += 1  # 计数器增加
            if c_press_count == 3:
                c_press_count = 0  # 达到三次后重置计数器
                print("我按住ctrl然后连续按了三次c")
                if socket_server.client_socket is not None:  # 确保client_socket不为None
                    print("确保client_socket不为None")
                    asyncio.run_coroutine_threadsafe(
                        message_queue.put("123456789"),  # 将消息放入队列
                        loop
                    )


def on_release(key):
    """
    按键释放时调用的函数
    """
    global is_ctrl_pressed, c_press_count  # 声明使用全局变量
    # 检测左ctrl或右ctrl键释放
    if key == keyboard.Key.ctrl_l or key == keyboard.Key.ctrl_r:
        is_ctrl_pressed = False  # 设置Ctrl键状态为释放
        c_press_count = 0  # 重置计数器


def start_listener_sync(loop):
    """
    启动键盘监听器（同步方式）
    """
    listener = keyboard.Listener(on_press=lambda key: on_press(key, loop), on_release=on_release)  # 创建监听器
    listener.start()  # 启动监听器
    listener.join()  # 等待监听器线程结束


async def start_listener():
    """
    启动键盘监听器（异步方式）
    """
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, start_listener_sync, loop)


async def process_messages():
    while True:
        message = await message_queue.get()  # 从队列中获取消息
        if socket_server.client_socket is not None:
            await socket_server.send_message(socket_server.client_socket, message)
        await asyncio.sleep(0.1)  # 添加短暂延迟，让其他协程有机会运行

```

## 这是前端代码

```java
package com.aijiang.myapplication;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.SocketTimeoutException;

import android.util.Log;

// TcpClient.java
public class TcpClient {
    private static final String TAG = "TcpClient";

    private String serverAddress;
    private int serverPort;
    private Socket socket;
    private PrintWriter out;
    private BufferedReader in;

    // 构造函数，初始化服务器地址和端口
    public TcpClient(String serverAddress, int serverPort) {
        this.serverAddress = serverAddress;
        this.serverPort = serverPort;
    }

    // 连接到服务器
    public void connect() throws Exception {
        Log.v(TAG, "Connecting to server...");
        socket = new Socket(serverAddress, serverPort);
        out = new PrintWriter(socket.getOutputStream(), true);
        in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        Log.v(TAG, "Connected to server.");
    }

    // 向服务器发送消息
    public void sendMessage(String message) {
        if (out != null && !out.checkError()) {
            Log.v(TAG, "Sending message: " + message);
            out.println(message);
            out.flush();
        }
    }

    // 接收来自服务器的消息
    public String receiveMessage() throws Exception {
        socket.setSoTimeout(60000); // 设置超时时间为60秒，可以根据需求调整
        if (in != null) {
            String response;
            try {
                response = in.readLine();
                if (response != null) {
                    Log.v(TAG, "我接受到的消息 message: " + response);
                    return response;
                } else {
                    Log.v(TAG, "No message received.");
                }
            } catch (SocketTimeoutException e) {
                Log.v(TAG, "Socket timeout, no message received.");
                // 这里可以发送心跳包
                sendMessage("HEARTBEAT"); // 发送心跳消息
            }
        }
        return null;
    }

    // 关闭连接
    public void close() throws Exception {
        if (socket != null) {
            socket.close();
        }
        if (out != null) {
            out.close();
        }
        if (in != null) {
            in.close();
        }
    }
}
```

```java
package com.aijiang.myapplication;

import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.net.SocketTimeoutException;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "MainActivity";
    private static final String SERVER_ADDRESS = "192.168.43.57";
    private static final int SERVER_PORT = 12345;
    private static final int HEARTBEAT_INTERVAL = 30000; // 30秒发送一次心跳

    private TextView textView; // 用于显示服务器回复的TextView
    private TcpClient tcpClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        textView = findViewById(R.id.textView); // 初始化TextView

        // 开始连接服务器
        new Thread(new TcpClientTask()).start();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            if (tcpClient != null) {
                tcpClient.close();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error closing TcpClient", e);
        }
    }

    private class TcpClientTask implements Runnable {

        @Override
        public void run() {
            tcpClient = new TcpClient(SERVER_ADDRESS, SERVER_PORT);
            try {
                tcpClient.connect();
                tcpClient.sendMessage("Hello, Server!");
                String response = tcpClient.receiveMessage();
                if (response != null) {
                    Log.v(TAG, "初始化连接时接收到的值: " + response);
                    runOnUiThread(() -> {
                        textView.setText(response); // 更新TextView的文本
                    });
                } else {
                    Log.d(TAG, "No response from server");
                    runOnUiThread(() -> {
                        textView.setText("No response from server");
                    });
                }

                // 启动心跳线程
                new Thread(new HeartbeatTask()).start();

                // 保持连接状态，不关闭
                while (true) {
                    try {
                        String serverMessage = tcpClient.receiveMessage();
                        if (serverMessage != null) {
                            Log.v(TAG, "后续收到的消息: " + serverMessage);
                            runOnUiThread(() -> {
                                // 如果包含多个消息，拆分并逐个显示
                                for (String msg : serverMessage.split("服务器收到: ")) {
                                    if (!msg.isEmpty()) {
                                        textView.append("\n" + msg); // 更新TextView的文本
                                    }
                                }
                            });
                        }
                    } catch (SocketTimeoutException e) {
                        Log.v(TAG, "Socket timeout, no message received.");
                        // 这里可以处理超时逻辑，但不要发送心跳消息
                    } catch (Exception e) {
                        Log.e(TAG, "Error receiving message", e);
                        // 处理重连逻辑
                    }
                }

            } catch (Exception e) {
                Log.e(TAG, "Error in TcpClientTask", e);
            }
        }
    }

    private class HeartbeatTask implements Runnable {

        @Override
        public void run() {
            while (true) {
                try {
                    Thread.sleep(HEARTBEAT_INTERVAL);
                    if (tcpClient != null) {
                        tcpClient.sendMessage("HEARTBEAT");
                        Log.v(TAG, "发送心跳消息");
                    }
                } catch (InterruptedException e) {
                    Log.e(TAG, "Heartbeat interval interrupted", e);
                }
            }
        }
    }
}
```

```xml
<!-- activity_main.xml -->
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/main"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World!"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

```xml
<!-- AndroidManifest.xml -->
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- 添加网络权限 -->
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MyApplication"
        tools:targetApi="31">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```