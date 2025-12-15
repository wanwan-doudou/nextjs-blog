---
title: go使用原生mysql跨库操作保证事务一致性
date: 2024-09-25 00:00:00
tags:
  - go
---

## 对事物进行了简单的封装

```go
var (  
    db *sql.DB  
)  
  
// BeginTransaction 封装事务  
func BeginTransaction(fn func(tx *sql.Tx) error) error {  
    tx, err := db.Begin()  
    if err != nil {  
       return err  
    }  
    err = fn(tx)  
    if err != nil {  
       tx.Rollback()  
    } else {  
       tx.Commit()  
    }  
    return err  
}

func main() {  
    // 设置 MySQL 数据库的连接信息  
    dsn := "root:123456@tcp(192.168.31.202:3306)/"  
    var err error  
    db, err = sql.Open("mysql", dsn)  
  
    if err != nil {  
       log.Fatal(err)  
    }  
    defer db.Close()  
  
    BeginTransaction(func(tx *sql.Tx) error {  
       _, err := tx.Exec(`INSERT INTO test.user (id,user) VALUES (6,"小李2")`)  
       if err != nil {  
          return err  
       }  
       _, err = tx.Exec(`INSERT INTO test1.password (id,user_id,password) VALUES (5,5,"123456")`)  
       if err != nil {  
          return err  
       }  
  
       return nil  
    })
}
```