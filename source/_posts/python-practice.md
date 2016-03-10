---
title: python-practice
tags: [self,python]
date: 2016-03-10 22:41:31
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
