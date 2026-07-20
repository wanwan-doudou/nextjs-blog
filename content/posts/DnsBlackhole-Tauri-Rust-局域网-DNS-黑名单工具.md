---
title: "DnsBlackhole：我用 Tauri + Rust 做了一个局域网 DNS 黑名单工具"
date: 2026-07-20
excerpt: "介绍 DnsBlackhole 的开发背景，以及 DNS 转发、域名过滤、缓存、查询日志和 Windows、macOS 跨平台运行的实现思路。"
tags: ["DnsBlackhole", "DNS", "Tauri", "Rust", "网络安全"]
categories: ["桌面开发"]
preview: "/images/dnsblackhole/dashboard.png"
top: false
---

## 背景

家里的手机、电视、平板和电脑每天都会产生大量 DNS 查询，其中有广告、统计、崩溃上报和用户行为跟踪，也有一些我并不希望访问的域名。

浏览器扩展只能处理浏览器里的请求，换成电视、手机应用或游戏后就无能为力。把过滤放到 DNS 这一层，可以让同一个局域网里的设备共用一套规则。

成熟的 DNS 过滤方案很多，但我想要的是一个更适合自己使用习惯的桌面工具：

1. 可以直接安装在常开的 Windows 或 macOS 主机上。
2. 有图形界面，不需要一直编辑配置文件。
3. 支持远程黑名单、自定义规则和局域网 DNS 重写。
4. 能看到每次查询来自哪个客户端、命中了哪条规则。
5. 既能处理本机请求，也能作为家庭局域网的 DNS 转发器。

于是就有了 [DnsBlackhole](https://github.com/wanwan-doudou/DnsBlackhole)。它使用 Tauri 2、TypeScript 和 Rust 构建，是一个带图形界面的本地 DNS 转发与域名拦截工具。

![DnsBlackhole 仪表盘](/images/dnsblackhole/dashboard.png)

上图是实际运行一段时间后的仪表盘。除了查询量和拦截率，还能看到请求域名排行、被拦截域名排行、客户端排行、黑名单命中排行和上游响应情况。

## 它不是什么

先说明项目边界：DnsBlackhole 不是权威 DNS，也不是从根服务器开始查询的完整递归解析器。

它接收客户端的 UDP 或 TCP DNS 请求，先执行访问控制、重写、过滤和缓存匹配；本地不能直接回答时，再把原始请求转发到配置的普通 UDP DNS 或 DoH 上游。

整体链路可以概括为：

```text
手机、电脑、电视、路由器
        │
        ▼
UDP / TCP 53 端口
        │
        ▼
客户端允许列表、拒绝列表、限速和 ANY 拒绝
        │
        ▼
DNS 重写 → 黑白名单匹配 → DNS 缓存
        │                         │
        │未命中                   │命中
        ▼                         ▼
主上游 DNS → Fallback DNS      直接响应客户端
        │
        ▼
查询日志、统计与仪表盘
```

这个定位让项目可以专注于“本地转发与过滤”，不用重新实现完整的递归解析体系。

## Tauri、TypeScript 和 Rust 的分工

DnsBlackhole 的前端没有引入大型 UI 框架，主要使用 TypeScript 生成界面和管理交互；Tauri command 负责前后端调用；DNS、规则、缓存、SQLite 和系统能力都放在 Rust 侧。

大致分工如下：

```text
TypeScript
├── 仪表盘与图表
├── DNS、过滤器和安全设置
├── 查询日志筛选与详情
└── Tauri command 调用

Rust
├── UDP / TCP DNS 服务
├── UDP DNS 与 DoH 上游
├── 规则编译、匹配和热更新
├── DNS 缓存与并发控制
├── SQLite 查询日志与统计
├── 系统托盘、开机启动和自动更新
└── macOS 后台 DNS 服务
```

这样做的好处是，界面关闭或刷新不会影响真正的网络状态；高频 DNS 请求也不需要经过 WebView。

## 同时处理 UDP 和 TCP DNS

DNS 最常见的是 UDP，但响应过大、客户端主动使用 TCP，或者上游 UDP 响应带有 `TC` 标志时，都需要支持 TCP。

服务启动时会为每个监听地址同时绑定 UDP 和 TCP：

```rust
struct ListenerPair {
    udp: Arc<UdpSocket>,
    tcp: Arc<TcpListener>,
}

fn bind_listener_pair(
    addr: SocketAddr,
    ipv6_only: bool,
) -> Result<ListenerPair, String> {
    let udp = bind_udp_listener(addr, ipv6_only)?;
    let tcp = bind_tcp_listener(addr, ipv6_only)?;

    Ok(ListenerPair {
        udp: Arc::new(udp),
        tcp: Arc::new(tcp),
    })
}
```

监听线程只负责接收请求，真正的解析、过滤和转发交给固定数量的 worker。工作队列是有界的，队列满时直接丢弃，而不是无限堆积内存。

```rust
const DNS_WORK_QUEUE_CAPACITY: usize = 8192;
const DNS_MIN_WORKERS: usize = 4;
const DNS_MAX_WORKERS: usize = 32;

fn dns_worker_count() -> usize {
    thread::available_parallelism()
        .map(|count| count.get().saturating_mul(2))
        .unwrap_or(DNS_MIN_WORKERS)
        .clamp(DNS_MIN_WORKERS, DNS_MAX_WORKERS)
}
```

UDP 响应还会根据客户端声明的 EDNS UDP 大小决定是否截断；如果上游 UDP 响应已经截断，则自动改用 TCP 再请求一次。

## 上游 DNS、Fallback 与 Bootstrap

上游既可以填写普通 DNS，也可以填写 DoH：

```text
https://dns.alidns.com/dns-query
https://doh.pub/dns-query
223.5.5.5
119.29.29.29
```

![DnsBlackhole 上游 DNS 设置](/images/dnsblackhole/dns-settings.png)

这里有一个容易形成循环的问题：如果 DoH 地址是 `https://dns.example.com/dns-query`，程序首先需要知道 `dns.example.com` 的 IP，但此时主 DNS 服务还依赖这个 DoH 上游。

所以 DnsBlackhole 单独提供 Bootstrap DNS，只允许填写 IP 或 `IP:端口`。启动时用它并行查询上游域名的 A 和 AAAA 记录，保留多个结果地址用于失败切换。

主上游全部失败后再请求 Fallback。两组上游使用相同的请求模式：

```rust
match mode {
    UpstreamMode::LoadBalance => {
        forward_load_balanced(query, upstreams, next_upstream)
    }
    UpstreamMode::ParallelRequests => {
        forward_parallel(query, upstreams)
    }
    UpstreamMode::FastestAddr => {
        forward_fastest_addr(query, upstreams)
    }
}
```

三种模式的用途不同：

1. **负载均衡**：轮流选择上游，失败后再尝试其他服务器。
2. **并行请求**：同时请求多个上游，采用最先成功的响应。
3. **最快的 IP 地址**：收集多个响应，再探测答案中的公网 IP，优先返回本机网络下可达性更好的结果。

上游域名暂时解析失败不会阻止整个 DNS 服务启动。失败端点会进入退避状态，到期后再尝试解析，避免一个配置错误拖垮全部上游。

## 大规模黑名单不能逐行匹配

远程 DNS 清单可能包含几十万甚至几百万条规则。如果每次查询都遍历文本或运行大量正则，查询延迟和内存占用都会很难控制。

![DnsBlackhole 远程黑名单](/images/dnsblackhole/filter-lists.png)

DnsBlackhole 支持常见 AdGuard DNS 规则子集、hosts 写法和纯域名写法，例如：

```text
||example.org^
@@||safe.example.org^
0.0.0.0 tracker.example.org
*.ads.example.org
example-blocked.local
```

还支持 `$important`、`$badfilter`、`$dnstype` 和 `$denyallow`。暂不支持的正则或高级修饰符不会悄悄当成普通域名处理，而是整条忽略，并在界面中统计忽略原因。

规则下载完成后会编译为 exact 和 suffix 两组索引：

```rust
struct RuleSet {
    exact: HashMap<Box<str>, RuleEntry>,
    suffix: HashMap<Box<str>, RuleEntry>,
}
```

精确规则直接查 `exact`；包含子域的规则则从完整域名开始，逐级检查父域：

```text
api.ads.example.org
    → ads.example.org
    → example.org
    → org
```

绝大多数清单使用规范的 `||domain^` 写法。对于这类简单规则，索引中只保存来源编号和规则类型，真正命中时再重建原始规则文本；只有带修饰符、非规范写法或同域名多条规则时，才保存完整规则。

规则优先级也不能只看“先匹配到谁”。当前顺序是：

1. 重要放行规则。
2. 重要拦截规则。
3. 普通放行规则。
4. 普通拦截规则。

这样可以正确处理 `important` 对普通 allowlist 的覆盖，也可以在查询日志中说明到底命中了什么规则、来自哪个清单。

## 自定义规则和局域网 DNS 重写

除了远程清单，还可以添加本地自定义规则：

```text
! 自定义规则会和远程清单一起生效
||example-blocked.local^
```

DNS 重写则适合局域网服务：

```text
nas.lan 192.168.1.10
*.home.lan 192.168.1.1
```

![DnsBlackhole 自定义过滤规则与 DNS 重写](/images/dnsblackhole/custom-rules-rewrites.png)

重写优先于黑名单匹配，避免自己定义的 `nas.lan` 被某条远程规则误拦。通配写法可以覆盖整个子域，同一个域名也可以分别配置 IPv4 和 IPv6。

规则、重写、拦截方式和日志忽略域名发生变化时，不需要重启 DNS 服务。运行中的过滤状态被打包成一份只读快照：

```rust
struct FilterRuntime {
    rules: CompiledRules,
    rewrites: CompiledRewrites,
    blocking: BlockingPolicy,
    log_ignore: DomainSet,
}

type SharedFilterRuntime = Arc<RwLock<Arc<FilterRuntime>>>;
```

保存配置时先在后台编译新规则，再一次性替换 `Arc<FilterRuntime>`。已经开始的查询继续使用旧快照，后续查询使用新快照，因此不会出现一次查询读到一半新规则、一半旧规则的情况，也不需要清空 DNS 缓存。

## DNS 缓存不仅是一个 HashMap

DNS 缓存的 key 不能只有域名和记录类型，还要考虑 class、递归标志、DNSSEC 相关标志和 EDNS UDP 大小。否则两个上下文不同的查询可能错误复用同一份响应。

```rust
struct QueryCacheKey {
    domain: String,
    qtype: u16,
    qclass: u16,
    recursion_desired: bool,
    authentic_data: bool,
    checking_disabled: bool,
    dnssec_ok: bool,
    edns_udp_size: Option<u16>,
}
```

缓存默认分成 64 个 shard，每个 shard 使用独立的 `RwLock`。不同域名的查询大概率落在不同分片，缓存命中不会争用一把全局写锁。

缓存命中时还要修改响应：

1. 把上游响应的 transaction ID 换成当前客户端请求的 ID。
2. 按已经缓存的时间递减 TTL。
3. 保留当前请求中的 question 大小写形式。
4. 根据客户端 UDP 大小限制决定是否截断。

DnsBlackhole 还提供乐观缓存。条目刚过期时可以先返回 TTL 为 1 的旧响应，同时在后台刷新：

```rust
let refresh = !fresh
    && entry
        .refreshing
        .compare_exchange(
            false,
            true,
            Ordering::AcqRel,
            Ordering::Acquire,
        )
        .is_ok();
```

`refreshing` 保证同一个过期条目只启动一次刷新任务。

如果缓存完全未命中，而同一时刻有多个客户端查询相同域名，则由一个 leader 请求上游，其他 follower 等待并复用结果。这相当于在 DNS 层做请求合并，避免热门域名缓存失效时瞬间把同一批查询全部打到上游。

## 查询日志不能阻塞 DNS 转发

查询日志需要记录域名、客户端、上游、耗时、命中规则和响应摘要，但不能让每次 DNS 请求都同步等待 SQLite 落盘。

DnsBlackhole 使用独立的有界通道传递日志，再由专用线程按批次写入：

```rust
const QUERY_LOG_QUEUE_CAPACITY: usize = 16384;
const QUERY_LOG_BATCH_SIZE: usize = 128;
const QUERY_LOG_BATCH_WAIT_TIMEOUT: Duration =
    Duration::from_millis(10);
```

日志线程最多收集 128 条，或者等待 10 毫秒，然后在同一个事务中批量写入。SQLite 使用 WAL 模式，并为界面查询单独打开只读连接，让仪表盘读取和日志写入可以并行。

为了避免每次打开仪表盘都扫描全部明细，写入查询日志时还会同步维护分钟统计、域名统计和上游统计表。

![DnsBlackhole 查询日志](/images/dnsblackhole/query-logs.png)

查询日志可以按已处理、已拦截和失败筛选，也可以搜索域名或客户端。每条记录会显示：

1. 查询类型和 UDP/TCP 传输方式。
2. 响应来自上游、缓存、重写还是拦截。
3. 上游服务器、处理耗时和响应代码。
4. 命中的规则、清单来源和 allowlist 覆盖关系。
5. DNS 响应中的 A、AAAA、CNAME、TXT 等答案摘要。

客户端 IP 也可以开启匿名化，日志保留时间到期后会连同聚合统计一起清理。

## 默认监听局域网，更要注意安全

为了方便作为家庭网关 DNS 使用，默认监听 `0.0.0.0:53` 和 `[::]:53`。这意味着安全边界不能只依赖“别人不知道这台主机”。

![DnsBlackhole 客户端访问控制](/images/dnsblackhole/client-security.png)

当前安全措施包括：

1. 允许和拒绝客户端列表均支持单个 IP 与 CIDR，拒绝列表优先。
2. 默认允许回环、私有 IPv4、ULA IPv6 和链路本地 IPv6。
3. 使用令牌桶限制每个客户端的持续查询速率，同时允许合理的短时突发。
4. 默认拒绝 ANY 查询。
5. UDP 访问拒绝和限速请求静默丢弃，TCP 尝试返回 `REFUSED`。
6. 远程清单和 DoH 默认只允许 HTTPS。
7. 单个远程清单默认限制为解压后 50 MB，超限立即停止并保留旧缓存。

如果只给本机使用，应把监听地址改成 `127.0.0.1` 并关闭 IPv6 监听。如果给局域网使用，还应检查主机和路由器防火墙，确保 `53/udp`、`53/tcp` 没有被映射到公网。

## 运行监控与数据迁移

桌面应用关闭窗口后可以留在系统托盘继续运行，也可以设置开机启动。运行监控会定期检查 DNS 工作线程，发现服务线程异常退出时自动恢复。

![DnsBlackhole 运行设置与数据存储](/images/dnsblackhole/runtime-storage.png)

查询日志、统计数据库和过滤器缓存可能逐渐变大，因此应用支持迁移数据目录。迁移时不是直接复制正在使用的 SQLite 数据库，而是使用 SQLite Backup API 创建目标库，完成后执行：

```sql
PRAGMA integrity_check;
```

只有完整性检查返回 `ok` 才会启用新目录。Windows 网络共享、macOS 网络卷和 iCloud 同步目录会被拒绝，因为 SQLite WAL 不适合放在这些存在同步冲突或文件锁语义差异的目录。

## Windows 和 macOS 的运行方式不同

Windows 通常可以直接监听 53 端口，DNS 引擎运行在 Tauri 后端中，窗口关闭后通过托盘继续工作。

macOS 对低端口和后台运行的限制更多。为了不让整个 GUI 一直以 root 身份运行，macOS 版本把 DNS 引擎放进独立的 LaunchDaemon：

```text
普通用户 Tauri GUI
        │
        │ Unix Socket RPC
        ▼
root DNS 后台服务
        │
        ├── 监听 53 端口
        ├── 读取和保存配置
        ├── 写入查询日志
        └── 更新过滤器
```

GUI 通过 `SMAppService` 注册服务，使用带长度前缀的 JSON RPC 查询状态、保存配置和读取日志。连接建立后还会校验协议版本、服务版本和 Unix Socket 对端用户。

应用升级时，旧服务自行退出，再由 launchd 的 `KeepAlive` 从新应用包中拉起当前版本，避免为了升级注销后台项并丢失用户已经批准的状态。

当前 Release 提供 Windows x64 的 NSIS、MSI 安装包，以及同时支持 Intel 和 Apple Silicon 的 macOS Universal DMG。macOS 版本使用自签名证书且未经 Apple 公证，首次安装需要在“系统设置 → 隐私与安全性”中允许打开。

## 快速使用

可以从 [GitHub Release](https://github.com/wanwan-doudou/DnsBlackhole/releases/latest) 下载最新版本。

安装后可以按下面的顺序配置：

1. 在“DNS 设置”确认监听地址、上游 DNS、Fallback DNS 和 Bootstrap DNS。
2. 在“安全防护”检查允许客户端网段。
3. 在“DNS 黑名单”点击“检查更新”，下载已启用的远程清单。
4. 按需添加自定义过滤规则或局域网 DNS 重写。
5. 启动服务，把本机或路由器下发的 DNS 地址指向运行 DnsBlackhole 的主机。
6. 在仪表盘和查询日志中确认请求已经进入。

不修改系统 DNS 时，可以先从本机测试：

```powershell
nslookup -port=53 example.com 127.0.0.1
nslookup -port=53 example-blocked.local 127.0.0.1
```

第二条域名对应默认自定义规则，应该在查询日志中显示为已拦截。

## 当前边界

DnsBlackhole 目前仍是一个持续完善中的 `0.1.x` 项目，当前边界包括：

1. 上游支持 UDP DNS 和 DoH，暂不支持 DoT、DoQ。
2. 不执行 DNSSEC 验证。
3. DNS 请求必须且只能包含一个 question。
4. 暂不支持正则过滤规则和全部 AdGuard 高级修饰符。
5. DNS 过滤只能阻止域名请求，不能移除网页中的广告占位，也无法阻止与正常内容共用域名的第一方广告。
6. macOS 版本尚未经过 Apple 公证。

我更希望把这些边界明确写出来，而不是把它描述成一个可以替代所有 DNS 或浏览器过滤工具的方案。

## 总结

DnsBlackhole 最初只是想解决“让家里的设备共用一套域名黑名单”这个问题，后面逐渐加入了 DoH、Fallback、Bootstrap DNS、规则编译、乐观缓存、查询日志、访问控制、运行监控和 macOS 后台服务。

它的核心思路可以总结为：

1. TypeScript 负责界面，Rust 负责真正的 DNS 数据面。
2. 规则在更新时编译，查询时只做索引匹配。
3. 缓存使用分片、乐观刷新和请求合并降低上游压力。
4. 查询日志异步批量写入，不阻塞 DNS 转发。
5. GUI 不需要高权限，macOS 的 53 端口交给独立后台服务。
6. 默认按家庭局域网设计，但仍然必须配合访问控制和防火墙。

项目已经开源，源码、安装包和后续更新都在 GitHub：

- 项目地址：[wanwan-doudou/DnsBlackhole](https://github.com/wanwan-doudou/DnsBlackhole)
- 最新版本：[GitHub Releases](https://github.com/wanwan-doudou/DnsBlackhole/releases/latest)

如果你也有常开的 Windows 或 macOS 主机，或者希望更直观地观察家里设备的 DNS 请求，可以下载试用。
