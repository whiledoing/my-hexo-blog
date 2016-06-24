---
title: python tornado 源码学习记录
tags: [self,python,tornado,learn-note]
toc: true
---

本文档记录了学习python框架[tornado](https://github.com/tornadoweb/tornado)源码的学习心得。

<!--more-->

## coroutine

### queue

tornado实现了一个基于其ioLoop的queue结构，并且和coroutine结构完美结合。

1.  如果`yield Quene.get`那么有数据的时候就会返回（理解为一个异步的callback）
2.  如果`yield Queue.put`那么当队列不满的时候就会返回

那么可以方便的实现生产者，消费者模型，参考[官方提供的教程](http://www.tornadoweb.org/en/stable/guide/queues.html)，贴一下其中关键的代码：

```python
@gen.coroutine
def main():
    q = queues.Queue()
    start = time.time()
    fetching, fetched = set(), set()

    @gen.coroutine
    def fetch_url():
        # get操作是得到一个数据
        current_url = yield q.get()
        try:
            # 防止别人已经运行了
            if current_url in fetching:
                return

            print('fetching %s' % current_url)
            fetching.add(current_url)
            urls = yield get_links_from_url(current_url)
            fetched.add(current_url)

            for new_url in urls:
                # Only follow links beneath the base URL
                 if new_url.startswith(base_url):
                    # put操作就是放入一个数据, 同时计数加1
                    yield q.put(new_url)

        finally:
            # task_done表示数据次数少一
            q.task_done()

    @gen.coroutine
    def worker():
        # corouting运行逻辑为：等待运行到yield，跳出，等到yield完成任务，继续执行，直到下一个运行结束（下一次yield）。
        # 所以其实corouting的代码不会**一直执行的**，虽然看起来是是`while True`的结构，但是因为结构会定期跳出，并且是
        # **等待完成通知的模型（类型epoll）的感觉**所以其实也是非常的高效。
        
        # 程序的逻辑角度看，corouting可以理解为平行的扩展业务，类似于线程了。
        while True:
            yield fetch_url()

    q.put(base_url)

    # Start workers, then wait for the work queue to be empty.
    for _ in range(concurrency):

        # @note 这里就已经开始实际执行任务了，`gen.coroutine` 返回的是一个 `Future` 对象，所以和
        # 实际的generator function返回的generator对象不一样，`gen.corouting` 返回的对象，会调用
        # **一次实际generator的next**方法，所以调用之后，这个函数就实际运行了
        worker()

    # join的语义就是等到q的技术为0，那么函数返回
    yield q.join(timeout=timedelta(seconds=300))
    assert fetching == fetched
    print('Done in %d seconds, fetched %s URLs.' % (
        time.time() - start, len(fetched)))


if __name__ == '__main__':
    import logging
    logging.basicConfig()

    # run_sync 表示执行一次future任务，然后完成任务之后，程序退出，而不是一直执行
    io_loop = ioloop.IOLoop.current()
    io_loop.run_sync(main)
```

## ioloop

### __slots__

在ioloop中有一个类型叫做`_Timeout`这个类型主要用来比较timer的时间先后关系，在类定义的时候使用`__slots__`来定义数据格式，这样子可以有效的减少内存。

如果我们明确的知道一个类（而且可能会创建非常多的对象的）的成员情况的时候，定义`__slots__`可以去掉默认一个对象保存实例的字典类型。[Saving 9 GB of RAM with Python’s \_\_slots\_\_](http://tech.oyster.com/save-ram-with-python-slots/)

```python
class _Timeout(object):
    """An IOLoop timeout, a UNIX timestamp and a callback"""

    # Reduce memory overhead when there are lots of pending callbacks
    __slots__ = ['deadline', 'callback', 'tiebreaker']

    def __init__(self, deadline, callback, io_loop):
        if not isinstance(deadline, numbers.Real):
            raise TypeError("Unsupported deadline %r" % deadline)
        self.deadline = deadline
        self.callback = callback
        self.tiebreaker = next(io_loop._timeout_counter)
```

## 参考资料

一个好的学习材料[python和tornado源码分析](http://www.nowamagic.net/academy/part/13/325/)
