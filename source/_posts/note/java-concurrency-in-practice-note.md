---
date: 2018/9/5 14:45:59
tags: [java,读书笔记,并发]
title: 《Java并发编程实战》读书笔记
mathjax: true
---

如果你在亚马逊搜索java相关的书，本书排名是非常靠前的，[豆瓣](https://book.douban.com/subject/10484692/)的评分也很高。刚好我最近忙找工作，也需要复习并发相关的技术，所以果断买之。

书并不厚，但是知识量却非常的厚道，基本上对并发编程涉及到的规范、原理、设计模式、基础类库都进行了系统全局性的说明，并同时附带非常有代表性的代码辅以理解。即使是不使用java的工程师，也可以从本书中学到独立于java之外的并发编程思想和范式。这本书我仔细看了两遍，甚有收获，将相关笔记整理成文。[英文电子版](http://whiledoing.me/doc/java-concurrency-in-practice.pdf)

<!--more-->

# 第一章：简介

编写正确的程序很难，而编写正确的并发程序则难上加难。

线程带来的风险：

- 安全性

    多个线程的操作执行顺序不可预测。
    存在指令重排序和寄存器缓存，这些都增加多线程程序的复杂度。

- 活跃性

    活跃度关注：『某件正确的事情最终会发生』，主要问题包括死锁、饥饿、以及活锁。

- 性能

    保存和切换上下文，会丢失局部性，影响CPU性能。
    同步机制往往会抑制某些编译器的优化，使内存缓冲区数据无效，以及增加共享内存总线的同步流量。

# 第二章：线程安全性

要编写线程安全的代码，其核心在于要对状态访问操作进行管理，特别是对**共享的**和**可变的**状态的访问。

一般有三种思路来处理不可控的状态变量：1）线程之间不共享状态 2）状态变量不可变 3）访问变量时同步。

当设计线程安全类时，良好的面向对象技术、不可修改性、以及明晰的**不变性规范**都能起到一定的帮助作用。

线程安全类：但多个线程访问某个类时，不管运行环境采用何种调度方式或者这些线程将如何交替执行，且在主调代码中不需要额外的同步或协同，这个类都能表现出正确的行为，那么就称这个类是线程安全的。

最常见的竞态（race condition）条件类型就是：**先检查后执行**操作，即通过一个**可能失效的观测结果**来决定下一步的动作。

书中提到的一段示例代码，用来说明对多个状态变量同时进行修改必须保证操作的原子性：

```java
// 因数分解，如果当前计算数值和上一个计算数值相同，直接返回缓存结果，并将当前计算结果缓存。
@NotThreadSafe
public class UnsafeCachingFactorizer implements Servlet {
    private final AtomicReference<BigInteger> lastNumber = new AtomicReference<BigInteger>();
    private final AtomicReference<BigInteger[]> lastFactors = new AtomicReference<BigInteger[]>();

    public void service(ServletRequest req, ServletResponse resp) {
        BigInteger i = extractFromRequest(req);
        if (i.equals(lastNumber.get())
            encodeIntoResponse(resp, lastFactors.get());
        else {
            BigInteger[] factors = factor(i);
            lastNumber.set(i);
            lastFactors.set(factors);
            encodeIntoResponse(resp, factors);
        }
    }
}
```

上面的代码违背了一个不变性：**lastFactors缓存的数值应该一直等于lastNumber缓存数值的因数**。要保持不变性，就需要在**单个原子操作**中更新所有**相关的状态变量**

每个java对象都可以用做一个实现同步的锁，这个锁称为内置锁（intrinsic lock）或者监视器锁（monitor lock）。内置锁是**可重入的**，意味着如果获得锁L的当前线程T继续访问锁L，是可以进入的，这个机制简化了面向对象并发代码的开发，比如下面代码，如果不可重入，那么将产生死锁：

```java
public class Test {
    public synchronized f() {}
    public synchronized g() {
        // 可以重入，所以当前已经获得锁的线程可以获得f的锁，否则死锁
        f();
    }
}
```
---

一个加锁的原则是对不变性加锁：不变性条件中涉及的所有变量都需要由**同一个锁**来保护。

所以上面的代码可以改写成：

```java
@ThreadSafe
public class UnsafeCachingFactorizer implements Servlet {
    @GuardedBy("this") private BigInteger lastNumber;
    @GuardedBy("this") private BigInteger[] lastFactors;

    public void service(ServletRequest req, ServletResponse resp) {
        BigInteger i = extractFromRequest(req);
        BigInteger[] factors = null;

        // 将读和写分离，先用一个同步块进行读
        synchronized (this) {
            if (i.equals(lastNumber.get())
                // 注意访问的是clone，如果直接引用LastFactors，可能导致最后返回客户端的是别的线程修改后的数值，违背了不变性。
               factors = lastFactors.clone();
        }
    
        if (factors == null) {
            // 将计算时间长的代码提取出来，不要放到同步块中
            factors = factor(i);

            // 将写使用同步块保护，注意也是clone保持不变性。
            synchronized (this) {
                lastNumber = i;
                lastFactors = factors.clone();
            }
        }

        encodeIntoResponse(resp,factors);
    }
}
```

上面的代码体现了几个修改原则：

- 尽量降低同步块的大小，提高并发性能。
- 将和状态变量无关的操作，耗时的操作从同步块中提取出来，提供并发性能。
- 将读和写进行分开处理（分阶段，这样子便于提取阶段的同步块），读和写的时候都**保持不变性**
- 使用**不可变**的特性保持**离开同步块外的不变性**。
- 同一个不变性由一个锁进行控制。

# 第三章：对象的共享

当把变量声明为volatile类型后，编译器和运行时都会注意到这个变量是**共享**的，因此不会将该变量上的操作与其他内存操作一起重排序。volatile变量不会被缓存在寄存器或者对其他处理器不可见的地方，因此读取volatile类型的变量时总会返回最新写入的值。

加锁机制既可以保证可见性也可以保证原子性，而volatile变量只能保证可见性。加锁等价于在锁释放的时候，自动将数据进行同步，确保了可见性。

不要在构造函数中启动一个线程。因为构造函数中创建的线程很有可能将this引用包含进去，而当前构造函数还没有完成，却可能运行了线程，导致this还没有构造完成却被运行，产生诡异问题。

维持线程封闭性的一种方法是使用ThreadLocal，这个类可以将线程中某个值和线程关联起来，使得每个线程保存一个单独的值，而不是全局共享的数值。

在java内存模型中，final域能确保初始化过程的安全性，共享final数据时不需要同步。换句话说，final的对象初始化完成之后，java会负责将数据进行同步（volatile的逻辑，只是不需要声明volatile），而final数据构造完成之后当然更加安全，因为数据不可变。

对于在访问和更新多个相关变量出现的竞争条件问题，可以通过将这些变量**全部保存在一个不可变对象**中来消除。如果是一个可变的对象，那么就必须使用锁来确保原子性。如果是一个不可变的对象，那么当线程获得了对该对象的引用后，就**不必担心另一个线程会修改对象的状态**。比如考虑上面的问题，可以将`lastNumber`和`lastFactor`封装在一个不可变对象中，每次读操作都是读取不可变的数据，如果有别的线程改变了数据，也是生成了另外一个对象，而不改变当前读取到的`lastNumber`和`lastFactor`的数值。

```java
@Immutable
class OneValueCache {
    private final BigInteger lastNumber;
    private final BigInteger[] lastFactors;

    public OneValueCache(BigInteger i, BigInteger[] factors) {
        lastNumber = i;
        
        // copy主要目的防止factors改变cache内部数值，毕竟factors是对外暴露的，有可能被调用者不小心修改。
        lastFactors = Arrays.copy(factors, factors.length);
    }

    public BigInteger[] getFactors(BigInteger i) {
        if (lastNumber == null || !lastNumber.equals(i)) 
            return null;
        else
            return Arrays.copy(lastFactors, lastFactors.length);
    }
}

@ThreadSafe
public class UnsafeCachingFactorizer implements Servlet {
    // 使用volatile引用不可变对象来保证可见性，这是一种有用的使用套路。
    private volatile OneValueCache cache = new OneValueCache(null, null);

    public void service(ServletRequest req, ServletResponse resp) {
        BigInteger i = extraceFromRequest(req);

        // 这里读取到的都是不可变数值，即使别的线程修改了cache，也是另外一个cache对象
        BigInteger[] factors = cache.getFactors(i);
        if (factors == null) {
            factors = factor(i);
            cache = OneValueCache(i, factor)
        }

        // 可以分析一下，这里无论如何计算都保持了不变性。
        // 1）如果命中缓存，factors就是对应i分解的因子（所以需要将factors保存起来，如果这里使用cache.getFactors(i)就不对了）。
        // 2）如果没有命中缓存，那么factors也是对应i分解的因子，只是说cache原子性修改成另外一个对象。
        encodeIntoResponse(resp, factors);
    }
}
```

# 第四章：对象的组合

设计线程安全类，需要包含以下三个基本要素：

- 找出构成对象状态的所有变量。
- 找出约束状态变量的不变性条件。
- 建立对象状态的并发访问控制策略（不可变、线程封闭、加锁机制）

设计线程安全类时，什么时候可以发布一个状态变量，需要满足一下几个条件（统一说，就是要非常可控，暴露出去的状态各种情况下都可控）：

- 变量本身是线程安全的（比如上面不可变的cache类）
- 没有任何不变性条件来约束（不存在暴露出去的变量和别的变量有相互依赖关系，有约束关系）
- 变量操作上不存在不允许的状态转换（封装在变量自身类的接口中，而不要让外面瞎改数据状态）

# 第五章：基础构建模块

在并发环境中使用容器的迭代器需要留意`ConcurrentModificationException`错误。在非Concurrent的容器中，比如只是单纯同步的Vector容器，其提供的迭代器如果在访问数据期间发现容器结构变化（内部应该有修改计数器之类的保存容器状态），会提醒`ConcurrentModificationException`错误，这点需要留意。隐藏的迭代器操作也需要留意，比如调用容器的`toString() removeAll`方法等。

并发容器：

- `ConcurrentHashMap`替代同步Map。使用粒度更细的分段锁机制提供更高的并发粒度。迭代器不会抛出`ConcurrentModificationException`，使用了CopyOnWrite的技术保证不变性。
- `ConcurrentSkipListMap`和`ConcurrentSkipListSet`替代同步的`SortedMap`和`SortedSet`。
- `CopyOnWriteArrayList`代替同步的List。如果数组较大，复制开销较大，一般用于**访问迭代操作远远多于修改操作**的场景中。
- `BlockingQueue`实现阻塞的队列，用在生产者-消费者模型中。有两个实现，`LinkedBlockingQueue`和`ArrayBlockingQueue`，具体差别参考[Java阻塞队列ArrayBlockingQueue和LinkedBlockingQueue实现原理分析](https://fangjian0423.github.io/2016/05/10/java-arrayblockingqueue-linkedblockingqueue-analysis/)

---

同步组件：

- 闭锁（latch）的作用等价于一扇门，在闭锁达到状态之前，门一直关闭，没有线程可以通过。一旦门打开，就一直打开。闭锁使用`countDown`递减计数器，而`await`方法会一直等待计数器到达零。
- FutureTask 解耦了运行线程和执行线程，并且保证在得到计算结果之后将结果安全的从计算线程发布到运行线程。
- 信号量（Semaphore）用来控制同时访问特定资源的操作数量。`await`方法用来得到一个资源，而`release`方法用来释放一个资源。
- 栅栏（barrier）用来阻塞一组线程到达特定的状态。闭锁用于等待事件，而栅栏用来等待线程。

书中的示例代码很有意思：构建一个并发的缓存组件。最开始的实现版本如下：

```java
public class Memoizer1<A, V> implements Computable<A, v> {
    private final Map<A, V> cache = new ConcurrentHashMap<A, V>();

    public V compute(A Arg) throws InterruptedException {
        V result = cache.get(arg);
        if (result == null) {
            result = computer_impl(arg);
            cache.put(arg, result);
        }
        return result;
    }
}
```

乍一看使用了ConcurrentHashMap应该是线程安全的，但是并发容器并没有保证复合操作的并发正确性。比如这里，可能存在多个线程进入到if，导致重复计算，如果computer_impl的计算非常耗时，将一定程度失去了缓存的价值。改进的考虑点是：如果发现当前已经有线程在计算arg，那么别的线程就不应该再计算arg，而是等待别的线程计算完成。这个思路想到了FutureTask，cache中缓存FutureTask，一旦有运算，FutureTask就把坑位占住，而别的线程就不再计算，而是阻塞的等待FutureTask的计算完成：

```java
public class Memoizer2<A, V> implements Computable<A, v> {
    private final Map<A, Future<V>> cache = new ConcurrentHashMap<A, Future<V>>();

    public V compute(A Arg) throws InterruptedException {
        Future<V> future = cache.get(arg);
        if (future == null) {
            future = new FutureTask<V>(new Callable<V>() {
                public V call() throws InterruptedException {
                    return computer_impl(arg);
                }
            })            

            // 先把坑位站住，然后再异步执行
            cache.put(arg, future);
            future.run();
        }

        try {
            return future.get();
        } catch (ExecutionException e) {
            yhrow launderThrowable(e.getCause());
        }
    }
}
```

其实还可能存在一定情况下，两个线程同时进入if语句，生成两个Future，只是比之前实现的概率大大降低（因为执行计算的长时间运行逻辑被放到了单独计算线程，隔离于判断cache逻辑的线程，这样子cache逻辑线程将运行的很快，进而降低了竞争if语句的可能性）。本质的问题在于if的实现不是原子的，改进的方式是直接使用ConcurrentHashMap提供的`putIfAbsent`原子语句：

```java
public class Memoizer3<A, V> implements Computable<A, v> {
    private final Map<A, Future<V>> cache = new ConcurrentHashMap<A, Future<V>>();

    public V compute(A Arg) throws InterruptedException {
        Future<V> future = cache.get(arg);
        if (future == null) {
            future = new FutureTask<V>(new Callable<V>() {
                public V call() throws InterruptedException {
                    return computer_impl(arg);
                }
            })            

            // 原子的访问，保证了并发安全性
            f = cache.putIfAbsent(arg, future);

            // 表示原来的数值，如果原来没有数据，说明第一个放入，执行future，否则，future表示第一次放入的数据，等待结果
            if (f == null) 
                future.run();
            else
                future = f;
        }

        try {
            return future.get();
        } catch (ExecutionException e) {
            yhrow launderThrowable(e.getCause());
        }
    }
}
```

总结一下「并发技巧清单」：

- 尽量将域声明为final，除非需要他们是可变的。
- 不可变对象一定是线程安全的。
- 封装有助于管理复杂性。
- 用锁来保护每个可变变量。
- 当保护同一个不变性条件中的所有变量时，要使用同一个锁。
- 在执行复合操作期间，要持有锁。
- 如果从多个线程中访问同一个可变变量时没有同步机制，那么程序会出现问题。
- 不要故作聪明地推断出不需要同步。
- 将同步策略文档化。

# 第六章：任务执行

java类库中使用Executor来执行任务，将任务的提交和任务的执行策略进行分离有几个好处：

- 更好的管理线程资源。
- 制定执行策略（有多个任务并发、任务执行顺序、可以等待的任务数量、队列饱和策略等）
- 重用线程降低了线程创建和销毁的开销。（不过也有负面作用，比如ThreadLocal使用存在问题，因为同一个线程可能执行多个不同的任务，但ThreadLocal只专属于单一线程） 

ExecutorService接口扩展了Executor，在其中加入了对执行器进行生命管理的方法：

- `shutdown`用来平缓关闭执行器：不再接受新的任务，同时等待已经提交的任务完成（包括队列中还没有运行的任务）
- `shutdownNow`比较粗暴的关闭执行器：不再接受新的任务，同时尝试取消所有运行中的任务，也不会启动队列中没有运行的任务。
-ExecutorService关闭后的提交任务将由Rejected Execution Handler处理，一般是直接抛弃或者抛出`RejectedExecutionException`异常。
- `awitTermination`等待ExecutorService完全终止当前运行任务。
- `isTerminated`表示是否已经完全终结。

`Timer`类可以用来生成延迟任务，但其存在一定的问题：

- 单线程实现。不适用于对调度时间非常care的场景。
- 对异常不处理，而是直接终止Timer，已经入队但还没有执行的任务将不会重新执行。

替代方法是使用基于`DelayQueue`的`ScheduledThreadPoolExecutor`提供的调度功能。`DelayQueue`管理着一组Delay对象，只有当任务到了运行时间时才可以执行take操作。

java中对函数对象有两种包装接口：`Runnable`和`Callable`，其区别在于一个有返回值，一个没有：

```java
@FunctionalInterface
public interface Callable<V> {
    V call() throws Exception;
}

@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
```
`ExecutorService.execute`输入的是`Runnable`对象，其并不care返回值。如果要对任务的返回值进行控制，需要用到`Future`接口，该接口解耦了任务的运算和获取逻辑。Executor框架中的封装过程如下：

- `RunnableFuture`接口扩展了`Runnable`，这样子可将该接口生成的Future放到`ExecutorService.execute`中
- `FutureTask`最核心，扩展于`RunnableFuture`，同时构造时封装了一个`Runnable`对象，通过内部的`run`接口对实际运行对象进行封装，同时提供**安全的发布过程**（安全的get，set等接口）
- `AbstractExecutorService`是`ThreadPoolExecutor`的基类，其中定义了`newTaskFor`接口，默认逻辑就是生成`FutureTask`对象的工厂；和定义`submit`接口，用来提交`Callable`的任务，内部用`FutureTask`来进行中转。

下面的代码说明了上面的过程，截取自jdk1.8.0：

```java
public interface Future<V> {
    boolean cancel(boolean mayInterruptIfRunning);
    boolean isCancelled();
    boolean isDone();
    V get() throws InterruptedException, ExecutionException;
    V get(long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException;
}

public interface RunnableFuture<V> extends Runnable, Future<V> {
    void run();
}

public class FutureTask<V> implements RunnableFuture<V> {
    public FutureTask(Callable<V> callable) {
        if (callable == null)
            throw new NullPointerException();
        this.callable = callable;
        this.state = NEW; // ensure visibility of callable
    }

   public void run() {
        if (state != NEW ||
            !UNSAFE.compareAndSwapObject(this, runnerOffset,
                                         null, Thread.currentThread()))
            return;
        try {
            Callable<V> c = callable;
            if (c != null && state == NEW) {
                V result;
                boolean ran;
                try {
                    result = c.call();
                    ran = true;
                } catch (Throwable ex) {
                    result = null;
                    ran = false;
                    setException(ex);
                }
                if (ran)
                    set(result);
            }
        } finally {
            // runner must be non-null until state is settled to
            // prevent concurrent calls to run()
            runner = null;
            // state must be re-read after nulling runner to prevent
            // leaked interrupts
            int s = state;
            if (s >= INTERRUPTING)
                handlePossibleCancellationInterrupt(s);
        }
}

public abstract class AbstractExecutorService implements ExecutorService {
    protected <T> RunnableFuture<T> newTaskFor(Callable<T> callable) {
        return new FutureTask<T>(callable);
    }

    public <T> Future<T> submit(Callable<T> task) {
        if (task == null) throw new NullPointerException();
        RunnableFuture<T> ftask = newTaskFor(task);
        execute(ftask);
        return ftask;
    }
}

public class ThreadPoolExecutor extends AbstractExecutorService {
}
```

管理一系列的Future对象，可以使用`ExecutorService.invokeAll`接口，一次性等待所有任务都完成；也可以使用内部包裹了`BlockingQueue`的`ExcectorCompletionService`，其管理的FutureTask在完成后会将自身加到阻塞队列中，而外部调用程序通过take队列数据可实现每得到一个数据就处理的逻辑。

# 第七章：取消与关闭

在java中没有一种安全的抢占式方法来停止线程，因此也就没有安全的抢占式方法来停止任务。只有一些**协作式的机制**，使请求取消的任务和代码都遵循一种协商好的协议。

一个可取消的任务必须拥有「取消策略」：规定How（如何取消），When（什么时候检测取消）和What（如何处理取消）。

如何取消一般有两种方法：

1. 使用状态变量。线程中循环遍历状态变量，检测是否需要结束当前线程。
2. 使用中断。系统提供的大多数阻塞方法会相应中断`Thread.interrupt`：清除中断状态`Thread.isinterrupted`；抛出`InterruptedException`异常；表示阻塞操作由于中断而提前结束。

阻塞方法相应中断时，清除中断状态并抛出异常。而非阻塞方法中断时，中断状态将被设置，且一直保持，需要用户额外的处理。下面的代码结合中断状态和阻塞函数的异常处理机制来处理中断：

```java
public class PrimeGenerator implements Runnable {
    @Override
    public void run() {
        // 其实这里并不用while检查中断状态，因为queue.put方法是阻塞方法会对中断的异常进行处理。
        // 加上while的好处是可以提高总体相应，因为提前出中断就不需要计算generateNextPrime。
        while(!Thread.currentThread().isInterrupted()) {
            try {
                queue.put(generateNextPrime());
            } catch (InterruptedException e) {
                ...
            }
        }
    }
}
```

并不是所有的阻塞方法都可以响应中断：比如java.io包中的同步Socket/IO接口；Selector.select接口；或者是等待某一个不可响应中断的内置锁。这时候可改写当前线程或者包装类`FutureTask`的取消接口，在其中调用对应的取消函数。比如关闭套接字使得read或write方法抛出`SocketException`异常。

---

有时候，你希望创建一个线程来执行一些辅助工作，但又不希望这个线程阻碍JVM的关闭。在这种情况下就需要使用守护线程（Daemon Thread）。

在JVM启动时创建的所有线程中，出了主线程以外，其他的线程都是守护线程（例如垃圾回收器）。但创建一个新线程时，新线程将继承创建它的线程的守护状态，因此在默认情况下，主线程创建的所有线程都是普通线程。

普通线程和守护线程之间的差异在于当线程退出时发生的操作。但一个线程退出时，JVM会检查其他正在运行的线程，如果这些线程都是守护线程，那么JVM会正常退出操作。当JVM停止时，所有仍然存在的守护线程都将被抛弃：不会执行finally代码块，而是直接退出。守护进程最好是用户执行内部任务，而不需要额外的退出处理代码。

# 第八章：线程池的使用

大多数并行任务都可以放到线程池中运行，但下面的几种情况是例外：

- 依赖性任务。如果运行的任务依赖另外一些任务的结果，除非线程池足够大，否则可能出现死锁。运行的任务等待不会被运行的任务。
- 依赖线程封闭机制的任务。单线程任务不可多线程并行。
- 对响应时间敏感的任务。
- 使用ThreadLocal的任务。线程池会复用线程，进而复用了ThreadLocal变量。

---

线程池的核心类是`ThreadPoolExecutor`，一般我们不直接对其操作，而是使用类库提供的工厂方法对该类进行定制化对象生产。

构造`ThreadPoolExecutor`的几个重要参数：

- corePoolSize：默认的线程数目。在有任务提交时，初始化的线程数目。
- maximumPoolSize：最大线程数目。在任务超过corePoolSize时，自动扩展线程数目可到达的最大值。
- keepAliveTime：最大空闲时间。如果一个线程空闲时间超过该阈值，回收该线程（线程数目大于corePoolSize）
- workQueue：缓存任务的队列对象。

对于非常大的或者无界的线程池，可以使用`SynchronousQueue`来避免任务排队，以及直接将任务从生产者移交给工作者线程（比如`newCachedThreadPool`就是使用该队列实现）。`SynchronousQueue`不是真正的队列，而是一种在线程中移交任务的机制。要将一个元素放入到`SynchronousQueue`中，必须有另外一个线程正在等待这个元素。如果没有线程等待，并且线程池当前大小小于最大值，那么`ThreadPoolExecutor`将创建一个新的线程，**否则根据饱和策略，这个任务将被拒绝**。（所以需要无界的线程池，不然如果生产者速率过高，任务没有地方存放，只能抛弃，这不是想要的结果。）

---

如果放入`ThreadPoolExecutor`中的队列是有界的，当任务超过队列容量时，有如下的几种饱和策略：

- AbortPolicy。默认策略，抛出`RejectedExecutionException`异常，调用者可以捕获异常进行自定义处理。
- DiscardPolicy。直接抛弃，没有异常抛出。
- DiscardOldestPolicy。直接抛弃最旧的任务，同时放入新的任务。
- CallerRunsPolicy。不会抛弃任务，也不抛出异常，而是将任务放到调用execute的线程中执行。

---

`ThreadPoolExecutor`是可扩展的，其提供了几个可在子类中改写的方法：

- `beforeExecute`和`afterExecute`：运行任务和完成任务时候的回调，由运行任务的线程调用。
- `terminated`：线程池关闭时调用。

---

使用线程池实现bfs并行搜索迷宫问题的示例：

```java
public class ConcurrentPuzzleSolver<P, M> {
    private final Puzzle<P, M> puzzle; 
    private final ExecutorService exec; 
    private final ConcurrentMap<P, Boolean> seen; 

    // 使用一个Latch达到阻塞通知的效果
    final ValueLatch<Node<P, M>> solution = new ValueLatch<Node<P, M>>(); 
    
    public List<M> solve() throws InterruptedException { 
        try { 
            P p = puzzle.initialPosition(); 
            exec.execute(newTask(p, null, null)); 
            
            // 阻塞等待结果
            Node<P, M> solnNode = solution.getValue(); 
            return (solnNode == null) ? null : solnNode.asMoveList(); 
        } finally { 
            exec.shutdown(); 
        }
    }
    
    protected Runnable newTask(P p, M m, Node<P,M> n) { 
        return new SolverTask(p, m, n); 
    }
    
    class SolverTask extends Node<P, M> implements Runnable {
        public void run() { 
            // 这里非常关键：1）判断是否已经有结果，提前结束 2）原子的设置seen，防止重复运行相同结果
            if (solution.isSet() || seen.putIfAbsent(pos, true) != null) 
                return; 

            if (puzzle.isGoal(pos))
                solution.setValue(this); 
            else 
                // 其实是广度搜索，每一次搜索一个节点将可达的搜索放入队列，bfs的并行计算
                for (M m : puzzle.legalMoves(pos)) 
                    exec.execute(newTask(puzzle.move(pos, m), m, this));
        }
    }
}

@ThreadSafe 
public class ValueLatch<T> {
    @GuardedBy("this") private T value = null; 
    private final CountDownLatch done = new CountDownLatch(1);

    public synchronized void setValue(T newValue) { 
        if (done.getCount() != 0) { 
            value = newValue; 
            done.countDown(); 
        } 
    }
    
    public T getValue() throws InterruptedException { 
        done.await(); 
        synchronized (this) { return value; } 
    }
}
```

代码的结构很通用，可以将串行搜索任务并行化，每一次调用递归的solve函数都可以生成n个子solve任务，这些任务可以放入队列中并行处理。使用`ConcurretMap`来解决多线程情况下的判重问题。另外一个有意思的结构是使用Latch来保存结果，因为主线程需要阻塞等待最后的结果，设定一个数量为1的`CountDownLatch`，只要有一个设定了结果，就打开门阀。不过这里存在一个问题，如果没有结果，主线程会一直等待。有几种处理方法：1）限时的等待 2）限定任务的数量，如果任务超过一定数量，停止运行 3）统计任务数量，如发现没有额外任务，标记搜索无结果。

```java
public class PuzzleSolver<P,M> extends ConcurrentPuzzleSolver<P,M> { 
    private final AtomicInteger taskCount = new AtomicInteger(0);
    protected Runnable newTask(P p, M m, Node<P,M> n) { 
        return new CountingSolverTask(p, m, n); 
    }
    
    class CountingSolverTask extends SolverTask {
        CountingSolverTask(P pos, M move, Node<P, M> prev) { 
            super(pos, move, prev); 

            // 构造时候统计任务数量
            taskCount.incrementAndGet(); 
        } 
        
        public void run() { 
            try { 
                super.run(); 
            } finally { 
                // 结束运行时候减少数量，并判定是否无解
                if (taskCount.decrementAndGet() == 0) 
                    solution.setValue(null); 
            }
        }
    }
}
```

这里用到了bfs的一个特性：如果任务运行结束时队列无任务，说明所有的任务都处理完毕。

# 第十章：避免活跃性危险

在安全性和活跃性之间通常存在着某种制衡。我们使用加锁机制来确保线程安全，但如果过度使用锁，可能导致 Lock-Ordering Deadlock，或者因为使用信号量或线程池对资源进行管理而导致Resource Deadlock。

死锁产生的根源在于：多个并发的线程存在环路的锁依赖关系，且都不释放彼此的锁，循环等待。

加锁的顺序非常重要，如果两个线程试图以**不同的顺序来获得相同的锁**，就可能产生死锁。如果按照相同的顺序来请求锁，那么就不会出现循环的加锁依赖性。

顺序性有的时候并不明显，考虑下面的从A账户转到B账户的代码：

```java
public void transferMoney(Account from, Account to, int amount) throws InsufficientFundsExecption {
    synchronized(from) {
        synchronized(to) {
            if(from.getBalance().compareTo(amount) < 0)
                throw new InsufficientFundsExecption();
            else {
                from.debit(amount);
                to.credit(amount);
            }
        }
    }
}
```
看似所有的代码都按照from到to的方式加锁，但问题在于from和to依赖于调用者，完全存在同时调用了`transferMoney(A, B)`和`transferMoney(B, A)`的可能性。一种改进的措施是将**无序变有序**：

```java
private static final Object tieLock = new Object();

private void transferMoneyImpl(Account from, Account to, int amount) throws InsufficientFundsExecption {
    if(from.getBalance().compareTo(amount) < 0)
        throw new InsufficientFundsExecption();
    else {
        from.debit(amount);
        to.credit(amount);
    }
}

public void transferMoney(Account from, Account to, int amount) throws InsufficientFundsExecption {
    int fromHash = from.hashCode();
    int toHash = to.hashCode();

    if(fromHash < toHash) {
        synchronized(from) {
            synchronized(to) {
                transferMoneyImpl(from, to, amount)
            }
        }
    } elif(fromHash > toHash) {
        synchronized(to) {
            synchronized(from) {
                transferMoneyImpl(from, to, amount)
            }
        }
    } else {
        // 如果相同，使用加时赛(Tie-Breaking)锁
        synchronized(tieLock) {
            synchronized(from) {
                synchronized(to) {
                    transferMoneyImpl(from, to, amount)
                }
            }
        }
    }
}
```

提取可用来比较的hashCode来决定顺序，如果极端情况下出现相同，使用加时赛（Tie-Breaking）锁来保证同时只有一个线程以未知的顺序加锁。

---

另外一个顺序性不明显的情境来源于不同协作对象之间的交互，考虑下面出租车和调度器之间的协作关系导致的死锁：

```java
// Warning: deadlock-prone!
class Taxi {
    @GuardedBy("this") private Point location, destination;
    private final Dispatcher dispatcher;
    public Taxi(Dispatcher dispatcher) {
        this.dispatcher = dispatcher;
    }
    public synchronized Point getLocation() {
        return location;
    }
    public synchronized void setLocation(Point location) {
        this.location = location;
        if (location.equals(destination))
            dispatcher.notifyAvailable(this);
    }
}

class Dispatcher {
    @GuardedBy("this") private final Set<Taxi> taxis;
    @GuardedBy("this") private final Set<Taxi> availableTaxis;
    public Dispatcher() {
        taxis = new HashSet<Taxi>();
        availableTaxis = new HashSet<Taxi>();
    }
    public synchronized void notifyAvailable(Taxi taxi) {
        availableTaxis.add(taxi);
    }
    public synchronized Image getImage() {
        Image image = new Image();
        for (Taxi t : taxis)
            image.drawMarker(t.getLocation());
        return image;
    }
}
```

最大的问题在于`Taxi`类和`Dispatcher`类都使用synchronized来同步各种的状态，但协同调用的时候，就会存在锁顺序不一致问题。（比如一个线程setLocation等待Dispatcher的锁，而另一个线程getImage等待Taxi的锁）。本质问题在于：**在持有锁时调用一个也需要加锁的外部方法，就有可能导致活跃性问题**。所以我们在加锁的代码中一定要留意是否存在同时加锁的情况，尽量避免。

如果调用某个方法不需要持有锁，那么这种调用叫做开放调用（Open Call）。依赖于开放调用的类通常更容易降低加锁的范围，进而对于加锁的依赖关系更容易分析。代码可以修改为：

```java
@ThreadSafe
class Taxi {
    @GuardedBy("this") private Point location, destination;
    private final Dispatcher dispatcher;
    public synchronized Point getLocation() {
        return location;
    }
    public void setLocation(Point location) {
        boolean reachedDestination;

        // 只同步需要同步的地方，调用其余服务时不依赖于当前锁，也就不存在同时加锁导致死锁的可能。
        synchronized (this) {
            this.location = location;
            reachedDestination = location.equals(destination);
        }
        if (reachedDestination)
            dispatcher.notifyAvailable(this);
    }
}

@ThreadSafe
class Dispatcher {
    @GuardedBy("this") private final Set<Taxi> taxis;
    @GuardedBy("this") private final Set<Taxi> availableTaxis;
    public synchronized void notifyAvailable(Taxi taxi) {
        availableTaxis.add(taxi);
    }
    public Image getImage() {
        Set<Taxi> copy;
        synchronized (this) {
            copy = new HashSet<Taxi>(taxis);
        }
        Image image = new Image();
        for (Taxi t : copy)
            image.drawMarker(t.getLocation());
        return image;
    }
}
```

所以修改原则可以总结为：

- 降低同步的范围，降低分析锁的复杂度。
- 自制管理，当前对象的锁尽量只管理自己可控的代码，也就意味着，调用其余不可控代码时不要依赖当前加锁状态。

另外还存在的一些活跃性问题：

- 资源死锁。比如持有A资源信号量的线程等待B资源的信号量。（本质上就是死锁，只是形式上换成了可以管理多个资源的信号量）。或者是线程饥饿死锁（Thread-Starvation Deadlock），比如A任务等待永远不会被执行的B任务的运行结果。（有界的线程池/资源池与有相互依赖性的任务不要一起使用）。
- 饥饿。线程优先级问题。
- 活锁。过度的错误处理代码导致无限循环处理错误。通过等待随机长度的时间和回退可以有效避免活锁。

# 第十一章：性能与可伸缩性

可伸缩性指：**当增加计算资源时（CPU、内存、存储、I/O带宽等），程序的吞吐量或者处理能力是否相应的增加**。

在增加计算资源的情况下，程序理论上可以实现的最高加速比Amdahl计算公式如下：

$$ Speedup \leqslant \frac{1}{F+\frac{(1-F)}{N}} $$

其中，$F$表示当前程序串行的比例，$N$表示处理器个数。公式其实很好理解：$(1-F) \over N$表示并行的平均开销，加上串行的$F$就得到单个任务的单位耗时，再被一反除就得到单位时间运行任务数量，也就是加速比了。

根据公式，当处理器个数无限大时，加速比的最值是$1 \over F$，也就是说串行的比例决定了并行的上限。

任何并发程序都包含一些串行部分，比如BlockingQueue中阻塞等待数据，比如汇总结果的合并操作，都是一些隐含的串行处理逻辑。要想估算串行的比例，可以统计线程数量和吞吐率的变化关系，当线程数量增加到一定程度，吞吐率会趋于稳定，约为$1 \over F$。

---

并行程序的消耗代价主要来源于：

- 上下文切换。一般为5000-10000时钟周期，约几微秒。
- 内存同步。主要指竞争性同步。

非竞争性同步开销很低，而且大多数JVM都会进行优化，比如去掉一些不会发生竞争的锁（比如只有一个线程访问的锁）；比如进行锁粒度优化，将相邻的同步代码块用同一个锁合并。

可伸缩性最主要的威胁是竞争性的同步，也就是独占方式的资源锁。有三种方式可以降低锁的竞争程度：

- 减少锁的持有时间。
- 降低锁的请求频率。
- 使用带有协调机制的独占锁。

尽管缩小同步代码块可以提高可伸缩性，但同步代码块也不能过小：需要采用原子方法执行的操作还是要包含在一个代码块中。同时，同步也存在一定的开销，当把一个代码块分解为多个同步代码块时，反而会影响性能。所以经验法则是：**仅当可以将一些耗时的计算或者阻塞操作从同步代码块中移出时，才考虑同步代码块的大小**。

降低锁请求频率的技术是锁分解（独立变量使用独立的锁）和锁分段（根据访问区域划分锁，ConcurrentHashMap对key进行分段加锁）。采用多个相互独立的锁来保护独立的状态变量，从而改变由单个锁保护的情况，降低了锁竞争的频率。当然，锁越多死锁的风险也越大，这点需要留意。

另外，可以使用`ReadWriteLock`或者基于无锁操作的`AtomicLong`等原子组价来提高伸缩性。（具有协调机制的锁）

# 第十二章：并发程序的测试

为了有效的测试阻塞操作，除了需要测试阻塞操作的线程外，还需要一个控制线程，该线程控制阻塞线程的生命周期，确保测试可以有效的结束，代码如下：

```java
void testTakeBlocksWhenEmpty() {
    final BoundedBuffer<Integer> bb = new BoundedBuffer<Integer>(10); 
    Thread taker = new Thread() {
        public void run() {
            try {
                int unused = bb.take();

                // 如果不阻塞，报错误
                fail();
            } catch (InterruptedException success) { }
        }
    };

    try {
        taker.start();

        // 给一段时间来测试是否会fail，如果没有fail，说明阻塞（也可能存在时间给的不够，导致take时间过长，所以这里的时间需要设定好）了，后面逻辑负责结束线程
        Thread.sleep(LOCKUP_DETECT_TIMEOUT);
        taker.interrupt();
        taker.join(LOCKUP_DETECT_TIMEOUT);

        // 确保join成功（join超时也会到这里，并没有异常抛出），如果take不响应中断，join就会不成功，线程仍旧isAlive
        assertFalse(taker.isAlive());
    } catch (Exception unexpected) {
        fail();
    }
}
```

上面代码一方面可测试是否发生了阻塞，另一方面也隐含的测试出阻塞操作是可中断的。可能存在的问题在于等待阻塞的时间间隔`LOCKUP_DETECT_TIMEOUT`，如果设定过小，且操作耗时大于该阈值，测试也会成功，但其实测试应该失败。

---

在构建并发类的安全性测试时，需要解决的关键问题在于找出那些容易检查的属性，且这些属性在发生错误下极有可能失败，同时**又不会使得错误检测代码引入额外的并发性**。试想，如果测试代码也需要同步控制，就会影响测试类的同步性，影响测试任务的进程调度。（反证法）

考虑测试生产者-消费者队列的正确性，可以分别统计放入数据的hash总值和读取数据的hash总值，并对两者进行比对（类似于MD5，不全比对，而是比对摘要信息）。这样子可以在测试线程中单独统计hash总值，而不需要引入额外的同步性（使用AtomicInteger来统计，无锁算法）：

```java
public class PutTakeTest {
    private static final ExecutorService pool = Executors.newCachedThreadPool(); 
    private final AtomicInteger putSum = new AtomicInteger(0); 
    private final AtomicInteger takeSum = new AtomicInteger(0); 
    private final CyclicBarrier barrier; 
    private final BoundedBuffer<Integer> bb; 
    private final int nTrials, nPairs;
    
    public static void main(String[] args) { 
        new PutTakeTest(10, 10, 100000).test(); 
        pool.shutdown(); 
    }
    
    PutTakeTest(int capacity, int npairs, int ntrials) { 
        this.bb = new BoundedBuffer<Integer>(capacity); 
        this.nTrials = ntrials; 
        this.nPairs = npairs; 
        this.barrier = new CyclicBarrier(npairs * 2 + 1); 
    }
    
    void test() {
        try { 
            for (int i = 0; i < nPairs; i++) { 
                pool.execute(new Producer()); 
                pool.execute(new Consumer()); 
            } 
            barrier.await(); // wait for all threads to be ready
            barrier.await(); // wait for all threads to finish 
            assertEquals(putSum.get(), takeSum.get()); 
        } catch (Exception e) { 
            throw new RuntimeException(e); 
        }
    }

    static int xorShift(int y) {
        y ^= (y << 6);
        y ^= (y >>> 21);
        y ^= (y << 7);
        return y;
    }

    class Producer implements Runnable { 
        public void run() {
            try {
                // 独立的随机数生成，而不是系统线程安全的RNG
                int seed = (this.hashCode() ^ (int)System.nanoTime());
                int sum = 0;
                barrier.await();
                for (int i = nTrials; i > 0; --i) {
                    bb.put(seed);
                    sum += seed;
                    seed = xorShift(seed);
                }
                putSum.getAndAdd(sum);
                barrier.await();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }

    class Consumer implements Runnable { 
        public void run() {
            try {
                barrier.await();
                int sum = 0;
                for (int i = nTrials; i > 0; --i) {
                    sum += bb.take();
                }
                takeSum.getAndAdd(sum);
                barrier.await();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }
}
```

上面的代码有几个需要说明的地方：

- 使用`CyclicBarrier`来统一计算流程。第一个同步点同步所有进程进入到初始化好的状态。如果不同步，test线程循环加入producer线程，而如果producer线程执行时间很短，可能第一个producer刚执行完成第二个任务才加入进来，本来希望并行的因为加入速度和执行速度平齐，变成了串行执行。`CyclicBarrier`可以循环使用，一个栅栏任务完成，就会重新计数。
- 使用进程无关的随机数，而不是系统库提供的线程同步的随机数。使用`this.hashCode() ^ (int)System.nanoTime()`做为初始化种子。
- 使用`AtomicInteger`来统计随机数值。

---

由于并发代码中大多数错误都是一些低概率事件，因此测试并发错误需要反复地执行许多次，所有有些时候需要我们在测试时，手动提高并发的概率。一种可行的方法是使用`Thread.yield`方法来强制执行一次上下文交换，以便测试在进程切换，并发竞争情况下的计算正确性，比如下面的代码：

```java
public synchronized void transferCredits(Account from, Account to, int amount) {
    from.setBalance(from.getBalance() - amount);
    if (DEBUG) && random.nextInt(1000) > THRESHOLD)
        Thread.yield();
    to.setBalance(to.getBalance() + amount);
}
```

---

对java代码进行性能测试时，还需要考虑额外几个因素：

- 垃圾回收。
- 动态编译。JVM会将运行次数足够多的方法进行编译，将解释执行的字节码变为机器代码。可以将程序运行足够长的时间，这样编译过程和解释执行过程占据总体时间可以忽略（剩下都是编译后的直接执行）；也可以使代码预先运行一段时间，屏蔽掉该时间内的编译耗时。
- 无用代码消除。测试代码中会可能会引入一些无用的代码，对测试性能是有用的，但JVM可能优化掉。一个可行的方法是手头touch一下需要保留的无意义数据，比如下面的代码（之所以不是直接print，是因为测试代码最好不要执行I/O操作，以免存在偏差）：

    ```java
    // touch使用，但极低概率会进行I/O
    if (foo.x.hashCode() == System.nanoTime())
         System.out.print(" ");       
    ```

# 第十三章：显示锁

加锁有两种机制，一种是语法糖形式的内置锁synchronized，另一种是可重用的显示加锁ReentrantLock。两者在使用上存在如下几点主要区别：

1. 加锁语义。synchronized内置锁只有一种加锁形式：一直等待。而ReentrantLock额外提供了可定时和可轮询的`tryLock`接口，支持特定的业务的定制化处理。（比如为了避免死锁，可以加定时锁或者轮询加锁）

2. 可中断的锁。内置锁一个蛋疼的特性是不支持中断，如果需要中断，需要使用ReentrantLock的`lockInterruptibly`接口，同时，对`InterruptedExecption`进行处理。

3. 非块结构加锁。连锁式加锁（Hand-Over-Hand Locking）不是传统的块状加锁语义。

4. 公平性。内置锁是非公平加锁，而ReentrantLock构造时可选择是否是公平锁。
    
    在公平锁上，线程将按照它们发出的顺序来获得锁，但在非公平的锁上，则允许「插队」：当一个线程请求非公平锁时，如果在发出请求的同时该锁的状态变成可用，那么这个线程将跳过队列中所有的等待线程并获得这个锁。多数情况下，都应该使用非公平的锁。因为公平一定程度上会影响效率，因为将一个线程唤醒并执行是需要额外开销的，而非公平的插队使得当前线程立刻执行，效率更高。

读写锁`ReentrantReadWriteLock`是一种扩展语义范畴的显示调用锁，对读和写分别进行加锁，更好地提高了**读多于写情况**下的并发性能。

（这样看下来，还是python定义的lock模型更通用。本质上lock就应该支持自定义流程的调用形式，而synchronized的块状加锁应该只是一种语法糖，而不是底层的基础构件。）

# 第十四章：构建自定义的同步工具

在现有的同步类库的功能无法满足要求时，可以使用如下几种方式自定义同步器：

- 内置的条件队列。
- 显示的Condition变量。
- 基于`AbstractQueuedSynchronizer`构建

---

「条件队列」这个名字来源于：它使得一组线程（称之为等待线程集合）能够通过某种方式来等待特定的条件变成真。传统队列的元素是一个个数据，而与之不同，条件队列中的元素是一个个正在等待相关条件的线程。

每个java对象都可以作为一个锁，同样，每个对象也可以作为一个条件队列，使用`wait notify notifyAll`这些API进行操作。其操作框架有如下：

```java
void stateDependentMethod() throws InterruptedException {
    // condition predicate must be guarded by lock
    synchronized(this) {
        while (!conditionPredicate())
            wait();

            // object is now in desired state
            notifyAll();
    }
}
```

- 检测前置条件之前，要先获得锁，保证前置条件的一致性。（不被别的线程并发修改）
- 循环检测前置条件，因为可能被唤醒的时，前置条件仍失效（条件队列可能管理了多个条件谓词），所以需要循环检测。
- `Object.wait`操作会自动释放锁，并请求操作系统挂起当前线程。当醒来时，重新获取之前的锁。
- `Object.notifyAll`用来唤醒在当前条件上等待的所有线程。

相比于`notify`只唤醒一个线程，`notifyAll`适用面更广。如果当前的条件队列上管理了不同的条件谓词，如果使用`notify`可能唤醒的并不是真正改变了状态的线程，因而导致「信号丢失」，真正需要唤醒的线程等不到唤醒。只有同时满足下面两个条件才可以使用单一的`notify`而不是`notifyAll`：

- 所有等待线程的条件谓词都相同。
- 单进单出。（每次唤醒，只需要一个线程来处理。）

---

内置条件队列存在一些缺陷：每个内置锁只能有一个相关联的条件队列，而没法支持在不同条件谓词下分别等待的逻辑。灵活的方式是使用Condition，一个Condition和一个Lock相关联，但可以根据需要生成多个不同的Condition来分别管理。

在Condition对象中，与`wait notify notifyAll`对应的接口是`await signal signalAll`，名字是不一样的。其实Condition也有`wait`接口（继承于Object），但该接口提供的条件队列是**关联于Condition本身的锁，而不是生成Condition的锁**，使用接口时要特别留意。

Condition的公平性依赖于锁的公平性：Condition是否阻塞取决于是否可获得背后管理的锁，所以获取锁的公平性也决定了Condition的公平性（Condition调用signal时，只是将Condition管理的条件队列放入到Lock执行调度的队列，而具体是否能公平执行依赖于Lock的公平性）

如果需要使用一些高级功能，比如公平队列（构造公平的锁，然后根据公平的锁创建Condition），或者在每个锁上对应多个等待线程集，那就需要使用Condition而不是内置条件队列。

公平和不公平的区别在于：获取锁时是否检测当前已经有等待的阻塞队列。如果不检测，那就不公平，存在抢占。如果检测，就是公平，即使当前线程发现锁可用，也要让队列中的线程先调度。截取于`ReentrantLock`的源码：

```java
static final class FairSync extends Sync {
    protected final boolean tryAcquire(int acquires) {
        final Thread current = Thread.currentThread();
        int c = getState();
        if (c == 0) {
            // 关键差别就是是否检测hasQueuedPredecessors
            if (!hasQueuedPredecessors() &&
                compareAndSetState(0, acquires)) {
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        else if (current == getExclusiveOwnerThread()) {
            int nextc = c + acquires;
            if (nextc < 0)
                throw new Error("Maximum lock count exceeded");
            setState(nextc);
            return true;
        }
        return false;
    }
}
```

---

大多数的同步器都存在相同的内在逻辑和实现模式：

- 同步维护的状态。比如ReentrantLock需要维护当前线程已经重复获取锁的次数；Semaphore维护当前许可的数量。
- 根据当前的状态提供「获取」和「释放」两种语义。
- 对线程进行调度管理，获取时休眠或者自旋，释放时唤醒。
- 对异常进行处理。

系统大多数同步器都基于`AbstructQueuedSynchronizer`抽象类提供的框架代码进行实现。AQS的实现有如下几个要点：

- volatile 变量 state 记录状态。通过CAS的原子非阻塞接口对状态进行高效同步。
- 基于CLH算法的并发 Sync Queue 管理线程的阻塞和调度。
- 模板模式。AQS 内部定义获取锁(acquire)，释放锁(release)的主逻辑，子类实现相应模版方法。
- 支持共享和独占两种操作语义。两者的区别在于释放线程时，是否只有一个线程可以被唤醒。独占只有一个线程可以被唤醒，而共享有多个。

AQS的获取和释放逻辑大致如下：

```java
boolean acquire() throws InterruptedException {
    while (state does not permit acquire) { 
        if (blocking acquisition requested) { 
            enqueue current thread if not already queued block current thread 
        } 
        else 
            return failure
    } 
    possibly update synchronization state dequeue thread if it was queued 
    return success
}
    
void release() {
    update synchronization state 
    if (new state may permit a blocked thread to acquire) 
        unblock one or more queued threads 
}
```

子类需要实现的是根据当前的状态来判断是否可以执行获取和释放逻辑。如果是独占操作，需要实现`tryAcquire tryRelease isHeldExclusively`回调接口，如果是共享操作，需要实现`tryAcquireShared tryReleaseShard`接口。

下面的代码说明了如何用AQS实现Semaphore：

```java
public class Semaphore implements java.io.Serializable {
    private final Sync sync;

    // 核心在这里，将操作都委托给Sync对象，使用组合的方式而不是继承的方式来使用AbstractQueuedSynchronizer
    abstract static class Sync extends AbstractQueuedSynchronizer {
        Sync(int permits) { setState(permits); }
        final int getPermits() { return getState(); }

        // state状态记录的是当前资源数目。返回值如果是负值，表示获取失败；如果是0，表示同步器使用独占方式被获取；如果是正数，表示同步器通过非独占方式被获取。
        // 这里如果返回0，只是一种提示作用（不确定，有待进一步考证）说明当前是互斥占用，后面的acquire应该都不成功。（当然release后就重置了）
        final int nonfairTryAcquireShared(int acquires) {
            for (;;) {
                int available = getState();
                int remaining = available - acquires;
                if (remaining < 0 ||
                    compareAndSetState(available, remaining))
                    return remaining;
            }
        }

        protected final boolean tryReleaseShared(int releases) {
            for (;;) {
                int current = getState();
                int next = current + releases;
                if (next < current) // overflow
                    throw new Error("Maximum permit count exceeded");
                if (compareAndSetState(current, next))
                    return true;
            }
        }
    }

    static final class NonfairSync extends Sync {
        private static final long serialVersionUID = -2694183684443567898L;
        NonfairSync(int permits) { super(permits); }
        protected int tryAcquireShared(int acquires) {
            return nonfairTryAcquireShared(acquires);
        }
    }

    // fair的方法在获取时会判断是否有已经等待的线程
    static final class FairSync extends Sync {
        FairSync(int permits) { super(permits); }
        protected int tryAcquireShared(int acquires) {
            for (;;) {
                if (hasQueuedPredecessors())
                    return -1;
                int available = getState();
                int remaining = available - acquires;
                if (remaining < 0 ||
                    compareAndSetState(available, remaining))
                    return remaining;
            }
        }
    }

    // 构造默认是非公平
    public Semaphore(int permits) { sync = new NonfairSync(permits); }
    public Semaphore(int permits, boolean fair) { sync = fair ? new FairSync(permits) : new NonfairSync(permits); }

    // 都是委托给AQS来执行
    public void acquire(int permits) throws InterruptedException {
        if (permits < 0) throw new IllegalArgumentException();
        sync.acquireSharedInterruptibly(permits);
    }

    public void release(int permits) {
        if (permits < 0) throw new IllegalArgumentException();
        sync.releaseShared(permits);
    }
}
```

注意，使用委托而不是继承的方式来使用AQS，这样子可保持同步组件的纯粹性，避免引入不必要的AQS接口。

参考：

- [AQS源码剖析](https://www.jianshu.com/p/e7659436538b)
- [CLH锁](https://coderbee.net/index.php/concurrent/20131115/577)

# 原子变量与非阻塞同步机制

相比于锁，在管理线程间的竞争时存在一种更细粒度的技术，即提供了类似volatile的可见性，又支持原子的更新操作，这就是硬件级别提供的同步原语：CAS（比较并交换）。

在竞争程度不高时，使用CAS的同步方法比锁要快，即使是无竞争锁，其开销也大抵是CAS的两倍。但在竞争非常大时，锁的效率更高。但一般而言，现实情况下，使用CAS比使用锁性能更高，并发度更好。

java中CAS操作被封装在原子变量类中，可分为4组：标量类、更新器类、数组类、复合变量类。常用的就是标量类：AtomicInteger、AtomicLong、AtomicBoolean、AtomicReference。

构建非阻塞算法的技巧在于：**将执行原子修改的范围缩小到单个变量上**。如果修改不成功，就不停尝试。但如果要同时原子地修改多个变量，算法将变得比较复杂。以非阻塞链表的push为例，在链表中插入一个元素，需要原子的修改两个引用：

- P1: 当前尾结点的next设置为新节点 
- P2: 将新节点设置成尾结点。这种对多个变量进行修改的CAS算法，设计时有如下两个要点：

- 要保证数据结构总是处于一致的状态。考虑当线程B到达时，发现线程A正在执行更新，那么线程B就不能立即开始执行自己的更新操作，而是等待A执行完成（通过CAS的状态比较），然后再执行B的逻辑。
- 要确保一个线程失败时不会阻碍其他线程继续执行下去。考虑当B线程到达时，发现A已经完成了任务一，B可以帮助A完成后续的任务二，而不需要等待A唤醒之后完成，这样即使A出现问题，也可以保证其他任务可以继续执行下去。

下面的代码实现了无锁的链表插入操作：

```java
@ThreadSafe
public class LinkedQueue <E> {
    private static class Node <E> {
        final E item;

        // 这个域需要CAS操作，使用声明为AtomicReference
        final AtomicReference<Node<E>> next;
        public Node(E item, Node<E> next) {
            this.item = item;
            this.next = new AtomicReference<Node<E>>(next);
        }
    }

    private final Node<E> dummy = new Node<E>(null, null);
    private final AtomicReference<Node<E>> head = new AtomicReference<Node<E>>(dummy);
    private final AtomicReference<Node<E>> tail = new AtomicReference<Node<E>>(dummy);

    public boolean put(E item) {
        Node<E> newNode = new Node<E>(item, null);

        // 框架就是一个大循环 => 提取出所有需要修改的旧状态 => 生成新的状态 => CAS设置 => 考虑多个步骤的中间状态
        while (true) {
            Node<E> curTail = tail.get();
            Node<E> tailNext = curTail.next.get();

            // A：因为尾结点最后设置，所以这里先判断一下尾结点是不是已经不一样，如果不一样，说明别的进程已经完整的加入了一个元素，重新尝试。
            if (curTail != tail.get()) continue;

            // B：如果尾结点的下一个节点不空，说明别的进程已经完成了push的第一步，但还可能还没有完成第二步，帮其完成设置尾结点的任务。
            // 帮助完成之后，再重新执行我们自己的push操作，这符合上文设计要点二中的内容。这里的CAS并不检测结果，因为可能别的线程自己完成了任务，我们的帮助也并没有产生效果。
            if (tailNext != null) {
                tail.compareAndSet(curTail, tailNext);
                continue;
            } 

            // C：如果当前状态非常干净，那么执行步骤一，设定当前tail的下一个节点，CAS操作，保证只有一个线程可以将自己节点放到尾巴上
            if (curTail.next.compareAndSet(null, newNode)) {
                // D：完成最后一步设置tail节点。这里并没有对CAS结果进行检测，因为可能在B步骤中别人「帮助完成了」，所以不检测结果，如果没有人帮助完成，就自己完成
                tail.compareAndSet(curTail, newNode);
                return true;
            }
        }
    }
}
```

如果将上面的两个步骤记做P1和P2，当线程运行到循环中时，有4种中间状态需要考虑（其它线程导致的状态）：

- P1和P2都已经完成。对应上面的A。
- P1正在执行。对应上面的C。
- P1执行完成，P2没有执行。对应上面的B。
- P1和P2都没有完成。对应上面的D。

算法要解决的就是在不同的状态下都能保证一致性和可继续性。

