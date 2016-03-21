---
title: python学习 && 实践
tags: [self,python]
date: 2016-03-10 22:41:31
toc: true
---

本文档记录了写python代码时候的一些**技巧，实践，心得**等等。

组织的没有什么逻辑性，更多的就是看到好的整理记录的新式。

<!--more-->

### 使用for...else...

python的for...else...结构可以方便的表示for如果不是break结束情况下的逻辑，对于那种**for查找break的方式**很pythonic

```python
for x in range(1, 5):
    if find(x):
        print 'find'
        break
else:
    print 'not find'
```

### python的多重继承

```python
class A(object):
    def f(self):
        print 'A'

class B(A):
    def f(self):
        super(B, self).f()
        print 'B'

class C(A):
    def f(self):
        super(C, self).f()
        print 'C'

class D(B, C):
    def f(self):
        super(D, self).f()
        print 'D'

# A C B D
D().f()

# A B
B().f()
```

如上面代码，就是说，如果使用多继承的话，结构关系貌似就变为了`(D->B->C->A)`的继承关系。。。

没有仔细研究，但是这样子其实有好处，就是B，和C的逻辑对于A而言都是独立的，但是如果组合使用B和C的关系的话，相同的函数可以通过`super`调用的方式串联起来。

### python好的资料收集

写了`requests`库的大神的[github](https://github.com/kennethreitz)非常值得推荐去看看。大神还写了一个关于python最佳时间的[书籍](http://docs.python-guide.org/en/latest/)，mark下。

### for循环中，小心使用lambda

记录一个很隐藏的bug，在for循环中使用lambda需要小心：

```python
cur_week_str = get_current_week_str()
for dst, dst_info in self._flower_cache.iteritems():
    # 在lambda中为了区别不同的返回结果，将dst放入到lambda参数中
    GameAPI.find_and_modify(
        collection_name = 'box',
        query = { '_id' : str2id(dst) },
        update = { '$inc' : inc_value },
        fields = None,
        upsert = True,
        new = True,
        callback = lambda st, data : self._on_syn_cache_to_service_into_db_back(st, data, cur_week_str, dst)
    )
```

结果是什么，所有返回的lambda的callback中dst参数都是相同的，因为lambda其实只有一个，lambda是有闭包的，每次调用到这里，就将函数lambda中的闭包中参数更新（理解为有状态的成员对象被修改）。所以当异步callback调用的时候，还是相同的lambda，但是最后的dst参数全部都相同了。（还有一个本质原因是因为异步，如果同步，那么每次调用的都是最正确的参数）

解决方法，这里也可以看到查询的_id中用到了dst，返回的data参数一定是不同的，根据返回的data参数获取dst即可，如果实在不行 ，就想办法在一个更加全局的位置保存即可。

所以，本质上需要留意的就是lambda的非修改参数是保存状态的，而且（个人猜想）lambda不是每次都创建，一旦定义好了格式，就只有一个对象！！！，这个对象在for循环中持续改变！！！


