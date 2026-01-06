---
title: "TimescaleDB time_bucket 实现历史数据智能降采样"
date: 2026-01-06
tags: ["postgresql", "timescaledb", "time-series", "performance"]
categories: ["数据库"]
description: "使用 TimescaleDB 的 time_bucket 函数实现时序数据的智能降采样，根据查询时间跨度动态选择采样间隔。"
---

## 背景

在工业监控系统中，传感器数据通常以每秒一条的频率存储。当用户查询一年的历史数据时，原始数据量可能达到 3000+ 万条，直接返回会导致：

1. 数据库查询超时
2. 网络传输压力大
3. 前端图表渲染卡顿

本文介绍如何使用 TimescaleDB 的 `time_bucket` 函数实现智能降采样。

## 核心策略

### 降采样策略表

根据时间跨度选择合适的采样间隔，确保返回数据量不超过 20,000 条：

```csharp
private AggregationStrategy CalculateSamplingStrategy(TimeSpan timeSpan) {
    const int maxDataPoints = 20000;
    var totalSeconds = (long)timeSpan.TotalSeconds;

    var strategies = new[] {
        new { Interval = "5 seconds",   Seconds = 5L,       Level = "5秒降采样" },
        new { Interval = "10 seconds",  Seconds = 10L,      Level = "10秒降采样" },
        new { Interval = "30 seconds",  Seconds = 30L,      Level = "30秒降采样" },
        new { Interval = "1 minute",    Seconds = 60L,      Level = "1分钟降采样" },
        new { Interval = "5 minutes",   Seconds = 300L,     Level = "5分钟降采样" },
        new { Interval = "15 minutes",  Seconds = 900L,     Level = "15分钟降采样" },
        new { Interval = "30 minutes",  Seconds = 1800L,    Level = "30分钟降采样" },
        new { Interval = "1 hour",      Seconds = 3600L,    Level = "1小时降采样" },
        new { Interval = "6 hours",     Seconds = 21600L,   Level = "6小时降采样" },
        new { Interval = "12 hours",    Seconds = 43200L,   Level = "12小时降采样" },
        new { Interval = "1 day",       Seconds = 86400L,   Level = "1天降采样" },
        new { Interval = "1 week",      Seconds = 604800L,  Level = "1周降采样" },
        new { Interval = "1 month",     Seconds = 2592000L, Level = "1月降采样" }
    };

    foreach (var strategy in strategies) {
        var estimatedPoints = totalSeconds / strategy.Seconds;
        if (estimatedPoints <= maxDataPoints) {
            return new AggregationStrategy {
                AggregationInterval = strategy.Interval,
                MaxLimit = maxDataPoints,
                AggregationLevel = strategy.Level
            };
        }
    }

    // 极端情况：动态计算间隔
    var requiredInterval = (long)Math.Ceiling(totalSeconds / (double)maxDataPoints);
    return new AggregationStrategy {
        AggregationInterval = $"{requiredInterval} seconds",
        AggregationLevel = $"动态降采样（{requiredInterval}秒间隔）"
    };
}
```

### 时间跨度与采样间隔对应

| 时间跨度 | 采样间隔 | 预计数据点 |
|---------|---------|-----------|
| 1 小时 | 5 秒 | 720 |
| 1 天 | 5 秒 | 17,280 |
| 1 周 | 30 秒 | 20,160 |
| 1 月 | 5 分钟 | 8,640 |
| 1 年 | 30 分钟 | 17,520 |

## SQL 查询构建

### 原始数据查询

当 `compress=false` 时返回完整原始数据：

```sql
SELECT
    created_at,
    "O2", "CO", "temperature"
FROM public."history_smoke_analyzer"
WHERE created_at >= @startTime AND created_at < @endTime
ORDER BY created_at ASC
```

### 降采样查询

使用 `time_bucket` + `FIRST` 取每个时间桶的第一条真实数据：

```sql
SELECT
    time_bucket('5 minutes', created_at) AS created_at,
    FIRST("O2", created_at) AS "O2",
    FIRST("CO", created_at) AS "CO",
    FIRST("temperature", created_at) AS "temperature"
FROM public."history_smoke_analyzer"
WHERE created_at >= @startTime AND created_at < @endTime
GROUP BY time_bucket('5 minutes', created_at)
ORDER BY created_at ASC
LIMIT 20000
```

### 为什么用 FIRST 而不是 AVG？

在工业监控场景中，我们更关心真实数据的波动趋势：

- `AVG`：会平滑掉峰值，可能错过瞬时异常
- `FIRST`：保留真实数据点，波动特征更明显
- `MIN/MAX`：适合查看极值，但不适合趋势分析

## 代码实现

```csharp
private string BuildQuerySql(string tableName, List<string> variableNames, 
    AggregationStrategy strategy) {
    
    // 原始数据查询
    if (!strategy.NeedsAggregation) {
        var columnList = string.Join(",\n", 
            variableNames.Select(v => $@"""{v}"""));
        var limitSql = strategy.MaxLimit > 0 ? $"\nLIMIT {strategy.MaxLimit}" : "";
        
        return $@"
            SELECT created_at, {columnList}
            FROM public.""{tableName}""
            WHERE created_at >= @startTime AND created_at < @endTime
            ORDER BY created_at ASC{limitSql}";
    }

    // 降采样查询
    var sampledColumns = string.Join(",\n",
        variableNames.Select(v => $@"FIRST(""{v}"", created_at) AS ""{v}"""));

    return $@"
        SELECT
            time_bucket('{strategy.AggregationInterval}', created_at) AS created_at,
            {sampledColumns}
        FROM public.""{tableName}""
        WHERE created_at >= @startTime AND created_at < @endTime
        GROUP BY time_bucket('{strategy.AggregationInterval}', created_at)
        ORDER BY created_at ASC
        LIMIT {strategy.MaxLimit}";
}
```

## 数值格式化

避免前端显示过长的浮点数：

```csharp
private object? FormatNumericValue(object? value) {
    return value switch {
        double d => Math.Round(d, 2),
        float f => Math.Round(f, 2),
        decimal m => Math.Round(m, 2),
        string s when double.TryParse(s, out var parsed) => Math.Round(parsed, 2),
        _ => value
    };
}
```

## 响应示例

```json
{
  "timeRange": "month",
  "startTime": "2026-01-01 00:00:00",
  "endTime": "2026-02-01 00:00:00",
  "timeSpanDays": 31,
  "totalDataPoints": 8640,
  "series": [
    {
      "modelName": "烟气分析仪",
      "variableName": "O2",
      "propertyName": "氧气浓度",
      "unit": "%",
      "data": [
        { "timestamp": "2026-01-01 00:00:00", "value": 3.52 },
        { "timestamp": "2026-01-01 00:05:00", "value": 3.48 }
      ]
    }
  ]
}
```

## 性能对比

| 场景 | 原始数据量 | 返回数据量 | 查询时间 |
|-----|-----------|-----------|---------|
| 1天原始 | 86,400 | 86,400 | 2.5s |
| 1天降采样 | 86,400 | 17,280 | 0.8s |
| 1月原始 | 2,678,400 | 超时 | - |
| 1月降采样 | 2,678,400 | 8,640 | 1.2s |

## 总结

TimescaleDB 的 `time_bucket` 函数为时序数据降采样提供了高效的数据库级解决方案。结合动态采样策略，我们可以在保证数据波动特征的同时，将返回数据量控制在合理范围内。
