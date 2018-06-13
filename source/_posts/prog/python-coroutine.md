---
date: 2018/6/13 22:40:02
tags: [python, 并发]
title: python coroutine and asyncio
---

最近在复习并发编程相关知识，顺带着就学了下python的协程，觉得值得写一篇文章记录下。

协程是一个非常有意思的概念，其设定非常类似于线程，不过比线程的调度更轻量。线程的调度依赖于操作系统，可以并发(parallelism)执行；协程由应用层调度，并不会利用多CPU，其实质是在应用层维持运行队列，单进程并行(concurrency)运行。

那么协程为什么有用呢(至少在python中非常有用)，有几点原因：

- 多I/O并发场景，可能并不需要太多CPU，但确会阻塞进程。
- 在python中如果I/O多的场景，可以用多线程来实现并发，但众所周知，python的GIL使得多线程等价于单进程，只是不会阻塞主进程而已。
- 而协程刚好满足了需求，即轻量，又不阻塞，又不存在创建线程的开销。

<!--more-->

其实，很多的I/O框架通过callback大法来实现异步调用，不过使用callback并不方便：

- 非常复杂的业务场景可能嵌套多个callback，写起来非常蛋疼，而且丑陋！
- 嵌套的callback会引入闭包，而闭包使用不当会存在很多诡异问题。（比如python闭包的lazy evaluation）

所以，协程从应用层面上给出了一个非常好而且**漂亮**的解决方案：

- 不用callback，等待事件时，原地暂停执行。
- 特定事件完成时，调度器调用对应协程继续执行。

在python2.x时代，可以使用tornado提供的协程实现，只是使用起来会相对受限，毕竟是上层的tricky hook。

python3.5后，使用async和await两个关键字来实现coroutine的底层语法。其实质是对之前的coroutine和yield from进行包装，实现语法级别的支持。

`asyncio`是携程的核心库，其中有两个核心概念：

* Future。该对象提供了一种同步机制：等待Future的语句将暂停执行，直到`Future.set_result`。其底层就是通过`Future.add_done_callback`将callback进行封装，比如await future语句，其等价于定义了一个callback，在future完成后，将当前的coroutine重新放入到执行队列中，等待下一次next操作。
* Task。Task本身就是一个Future，同时包装了执行函数（对generator进行包装）。asyncio库在放入函数执行时，其最终都会用`asyncio.ensure_future(coroutine_obj)`来生成Task对象。Task会监控执行函数的完成状态，完成后将结果保存在Task中，同时调用Task本身的done_callback。所以考虑下面的代码：

```python
async def f():
    # 执行环境暂停，Task(g()).add_done_callback(lambda future: self.loop.call_soon(self.step))    
    # 逻辑在于，新任务完成后，将当前任务重新放到执行队列，call_soon表示下一次loop的时候直接调用
    res = await g()
    return res

async def g():
    yield some_dummy_thing
    return 1

# 先创建一个Task(f())，执行过程中，又会创建Task(g())，当g执行完成后通知Task(f())继续执行。
asyncio.get_event_loop().run_until_complete(f())
```

参照上面说明的结构，我自己实现了一个简单版本的协程框架，实现一下，可以对相关概念有更加深刻的认识。代码如下：

```python
class EventLoop(object):
    inst = None

    @classmethod
    def instance(cls):
        if cls.inst is None:
            cls.inst = EventLoop()
        return cls.inst

    def __init__(self):
        # 执行队列是一个deque，因为需要从left删除节点，从right端插入节点
        from collections import deque
        self.stop = False
        self.ready = deque()

    def run_once(self):
        # 运行过程中可能加入新任务，所以这里保存原来的元素个数
        old_len = len(self.ready)
        for i in range(old_len):
            v = self.ready.popleft()
            v.step()

    def append_future(self, future):
        self.ready.append(future)

    def run_until_complete(self, gene):
        task = Task(gene)
        task.add_done_callback(self._set_stop)

        self.run_forever()
        return task.get_result()

    def _set_stop(self, future):
        self.stop = True

    def run_forever(self):
        while not self.stop:
            self.run_once()


class Future(object):
    def __init__(self):
        self.call_back = []
        self.result = None
        EventLoop.instance().append_future(self)

    def add_done_callback(self, cb):
        self.call_back.append(cb)

    def set_result(self, v=None):
        self.result = v
        for cb in self.call_back:
            cb(self)

    def get_result(self):
        return self.result

    def step(self):
        pass

class Task(Future):
    def __init__(self, gene):
        super().__init__()
        self.gene = gene

    def step(self):
        """Task里面裹的是gene，每次step都运行一次next(gene)，同时gene的返回值也是一个Future, 这样子当依赖
        的Future完成之后，可以将当前Task放到执行队列中"""
        try:
            future = next(self.gene)
            future.add_done_callback(lambda _: EventLoop.instance().append_future(self))
        except StopIteration as e:
            # 运行结束之后，将结果保存起来，同时通知上层依赖，本Task执行完毕
            self.set_result(e)

class DummyIOFuture(Future):
    """模拟I/O，运行一段时间之后，通知运行完成"""
    def step(self):
        # 这样你应该让EventLoop自己实现schedule，这样子进程就不会暂停了，这里只是demo演示
        print('getting some I/O')
        time.sleep(0.5)
        self.set_result()

def f():
    print('f is running, waiting for g complete')
    g_task = Task(g())
    yield g_task

    print('f is running, got g result')
    return g_task.get_result()

def g():
    print('g is running, waiting for dummy I/O finish')
    yield DummyIOFuture()
    print('g is running, dummy I/O has finished')
    return 200

if __name__ == '__main__':
    res = EventLoop.instance().run_until_complete(f())
    print('total task finish, get status code %s' % res)
```

更进一步，asyncio的核心逻辑都在主循环中体现，其主要做了几个事情：

1. 检测schedule的状态，去掉堆顶无效节点。（延迟删除，只是标记为cancelled）
2. 调用select，执行I/O
3. 取出需要运行的schedule放到运行队列_ready中
4. 执行所有需要执行的回调。

asyncio将所有的回调包装到handler中，有的回调是task，有的是schedule，有的是I/O相关封装的回调，非常统一。

主循环代码：

```python
# 去掉schedule的无效数据，如果太多无效数据，直接重新来过，这样子不会导致多次无效数据的heappop开销
sched_count = len(self._scheduled)
if (sched_count > _MIN_SCHEDULED_TIMER_HANDLES and
    self._timer_cancelled_count / sched_count >
        _MIN_CANCELLED_TIMER_HANDLES_FRACTION):
    # Remove delayed calls that were cancelled if their number
    # is too high
    new_scheduled = []
    for handle in self._scheduled:
        if handle._cancelled:
            handle._scheduled = False
        else:
            new_scheduled.append(handle)

    heapq.heapify(new_scheduled)
    self._scheduled = new_scheduled
    self._timer_cancelled_count = 0
else:
    # Remove delayed calls that were cancelled from head of queue.
    while self._scheduled and self._scheduled[0]._cancelled:
        self._timer_cancelled_count -= 1
        handle = heapq.heappop(self._scheduled)
        handle._scheduled = False

# 计算select的超时时间，如果有_ready，那么无超时，因为要计算_ready，否则超时时间为下一次schedule的时间间隔
timeout = None
if self._ready or self._stopping:
    timeout = 0
elif self._scheduled:
    # Compute the desired timeout.
    when = self._scheduled[0]._when
    timeout = max(0, when - self.time())

if self._debug and timeout != 0:
    t0 = self.time()
    event_list = self._selector.select(timeout)
    dt = self.time() - t0
    if dt >= 1.0:
        level = logging.INFO
    else:
        level = logging.DEBUG
    nevent = len(event_list)
    if timeout is None:
        logger.log(level, 'poll took %.3f ms: %s events',
                   dt * 1e3, nevent)
    elif nevent:
        logger.log(level,
                   'poll %.3f ms took %.3f ms: %s events',
                   timeout * 1e3, dt * 1e3, nevent)
    elif dt >= 1.0:
        logger.log(level,
                   'poll %.3f ms took %.3f ms: timeout',
                   timeout * 1e3, dt * 1e3)
else:
    event_list = self._selector.select(timeout)
self._process_events(event_list)

# 对schedule数据分析，取得有效schedule。@note 注意这里并不check是否canceled，可能因为下面运行时候会有统一的check
# 因为还有别的task是可以cancelled的，并不是只是schedule可以cancel，所以下面统一处理。
# Handle 'later' callbacks that are ready.
end_time = self.time() + self._clock_resolution
while self._scheduled:
    handle = self._scheduled[0]
    if handle._when >= end_time:
        break
    handle = heapq.heappop(self._scheduled)
    handle._scheduled = False
    self._ready.append(handle)

# This is the only place where callbacks are actually *called*.
# All other places just add them to ready.
# Note: We run all currently scheduled callbacks, but not any
# callbacks scheduled by callbacks run this time around --
# they will be run the next time (after another I/O poll).
# Use an idiom that is thread-safe without using locks.
ntodo = len(self._ready)
for i in range(ntodo):
    # 无锁实现的queue
    handle = self._ready.popleft()

    # 统一的check
    if handle._cancelled:
        continue

    # 其实就是调用handle的callback
    if self._debug:
        try:
            self._current_handle = handle
            t0 = self.time()
            handle._run()
            dt = self.time() - t0
            if dt >= self.slow_callback_duration:
                logger.warning('Executing %s took %.3f seconds',
                               _format_handle(handle), dt)
        finally:
            self._current_handle = None
    else:
        handle._run()
handle = None  # Needed to break cycles when an exception occurs.
```
