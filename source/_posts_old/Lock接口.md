---
title: Lock接口
date: 2022-01-29 00:00:00
tags:
  - 并发编程
---

# 2 Lock 接口

# [](https://kwydy.gitee.io/2022/01/29/Lock%E6%8E%A5%E5%8F%A3/#2-1-%E5%A4%8D%E4%B9%A0Synchronized "2.1 复习Synchronized")2.1 复习Synchronized

### [](https://kwydy.gitee.io/2022/01/29/Lock%E6%8E%A5%E5%8F%A3/#2-1-1-Synchronized%E5%85%B3%E9%94%AE%E5%AD%97%E5%9B%9E%E9%A1%BE "2.1.1 Synchronized关键字回顾")2.1.1 Synchronized关键字回顾

  1. 修饰一个代码块，被修饰的代码块称为同步语句块，其作用的范围是大括号{}括起来的代码，作用的对象是调用这个代码块的对象;
  2. 修饰一个方法，被修饰的方法称为同步方法，其作用的范围是整个方法，作 用的对象是调用这个方法的对象;
     * 虽然可以使用synchronized来定义方法，但synchronized并不属于方法定义的一部分，因此，synchronized 关键字不能被继承。如果在父类中的某个方法使用了synchronized关键字，而在子类中覆盖了这个方法，在子类中的这个方法默认情况下并不是同步的，而必须显式地在子类的这个方法中加上synchronized关键字才可以。当然，还可以在子类方法中调用父类中相应的方法，这样虽然子类中的方法不是同步的，但子类调用了父类的同步方法，因此，子类的方法也就相当于同步了。
  3. 修改一个静态的方法，其作用的范围是整个静态方法，作用的对象是这个类的所有对象;
  4. 修改一个类，其作用的范围是synchronized后面括号括起来的部分，作用主的对象是这个类的所有对象。



### [](https://kwydy.gitee.io/2022/01/29/Lock%E6%8E%A5%E5%8F%A3/#2-1-2%E5%94%AE%E7%A5%A8%E6%93%8D%E4%BD%9C "2.1.2售票操作")2.1.2售票操作
    
    
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
    

| 
    
    
    class Ticket {    
        /**    
         * 票数    
         */    
        private int number = 30;    
        
        /**    
         * 操作方法：卖票    
         */    
        public synchronized void sale() {    
            // 判断：是否有票    
            if (number > 0) {    
                System.out.println(Thread.currentThread().getName() + " : 卖出： " + number-- + "剩下：" + number);    
            }    
        }    
    }    
        
    /**    
     * @author myAnswer <2273024587@qq.com>    
     */    
    public class SaleTicket {    
        /**    
         * 第二步  创建多个线程，调用资源类的操作方法    
         */    
        public static void main(String[] args) {    
            // 创建Ticket对象    
            Ticket ticket = new Ticket();    
            // 创建三个线程    
            new Thread(() -> {    
                // 调用卖票方法    
                for (int i = 0; i < 40; i++) {    
                    ticket.sale();    
                }    
            }, "AA").start();    
        
            new Thread(() -> {    
                // 调用卖票方法    
                for (int i = 0; i < 40; i++) {    
                    ticket.sale();    
                }    
            }, "BB").start();    
        
            new Thread(() -> {    
                // 调用卖票方法    
                for (int i = 0; i < 40; i++) {    
                    ticket.sale();    
                }    
            }, "CC").start();    
        }    
    }  
      
  
---|---  
  
## 2.2 什么是Lock接口

Lock锁实现提供了比使用同步方法和语句可以获得的更广泛的锁操作。它们允许更灵活的结构，可能具有非常不同的属性，并且可能支持多个关联的条件对象。Lock提供了比 synchronized更多的功能。

Lock 与的Synchronized区别:I

  * Lock不是Java语言内置的，synchronized是Java语言的关键字，因此是内置特性。Lock是一个类，通过这个类可以实现同步访问;
  * Lock和synchronized有一点非常大的不同，采用synchronized不需要用户  
去手动释放锁，当synchronized方法或者synchronized 代码块执行完之后，系统会自动让线程释放对锁的占用﹔而Lock 则必须要用户去手动释放锁，如果没有主动释放锁，就有可能导致出现死锁现象。



## [](https://kwydy.gitee.io/2022/01/29/Lock%E6%8E%A5%E5%8F%A3/#2-3-%E4%BD%BF%E7%94%A8Lock%E5%AE%9E%E7%8E%B0%E5%8D%96%E7%A5%A8%E4%BE%8B%E5%AD%90 "2.3 使用Lock实现卖票例子")2.3 使用Lock实现卖票例子
    
    
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
    

| 
    
    
    /**    
     * 第一步  创建资源类，定义属性和操作方法    
     *    
     * @author myAnswer <2273024587@qq.com>    
     * @since 2022/1/29 21:04    
     */    
        
    class LockTicket {    
        /**    
         * 创建可重入锁    
         */    
        private final ReentrantLock lock = new ReentrantLock();    
        /**    
         * 票数    
         */    
        private int number = 30;    
        
        /**    
         * 操作方法：卖票    
         */    
        public void sale() {    
            // 上锁    
            lock.lock();    
        
            try {    
                // 判断：是否有票    
                if (number > 0) {    
                    System.out.println(Thread.currentThread().getName() + " : 卖出： " + number-- + "剩下：" + number);    
                }    
            } finally {    
                //解锁    
                lock.unlock();    
            }    
        }    
    }    
        
    /**    
     * @author myAnswer <2273024587@qq.com>    
     */    
    public class LockSaleTicket {    
        /**    
         * 创建三个线程    
         */    
        public static void main(String[] args) {    
        
            LockTicket ticket = new LockTicket();    
        
            new Thread(() -> {    
                for (int i = 0; i < 40; i++) {    
                    ticket.sale();    
                }    
            }, "AA").start();    
            new Thread(() -> {    
                for (int i = 0; i < 40; i++) {    
                    ticket.sale();    
                }    
            }, "BB").start();    
            new Thread(() -> {    
                for (int i = 0; i < 40; i++) {    
                    ticket.sale();    
                }    
            }, "CC").start();    
        }    
    }  
      
  
---|---  
  
## 2.4 小结

Lock和synchronized有以下几点不同:

  1. Lock是一个接口，而synchronized是Java中的关键字，synchronized是内  
置的语言实现;
  2. synchronized在发生异常时，会自动释放线程占有的锁，因此不会导致死锁现象发生;而Lock在发生异常时，如果没有主动通过unLock()去释放锁，则很可能造成死锁现象，因此使用Lock时需要在finally块中释放锁;·
  3. Lock 可以让等待锁的线程响应中断，而synchronized却不行，使用  
synchronized 时，等待的线程会一直等待下去，不能够响应中断;
  4. 通过Lock 可以知道有没有成功获取锁，而synchronized却无法办到。
  5. Lock 可以提高多个线程进行读操作的效率。



在性能上来说，如果竞争资源不激烈，两者的性能是差不多的，而当竞争资源非常激烈时（即有大量线程同时竞争），此时Lock 的性能要远远优于synchronized。
