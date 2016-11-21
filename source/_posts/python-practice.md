---
title: python misc
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
    find_and_modify_in_mongodb(
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

### python的输出

以前使用的输出方式是使用`%`符合进行多个字符串的输出。另外一个好的方式（也是PEP3101）定义的使用format的格式：

```python
foo = 'foo'
bar = 'bar'
foobar = '%s%s' % (foo, bar) # It is OK 
foobar = '{0}{1}'.format(foo, bar) # It is better 
foobar = '{foo}{bar}'.format(foo=foo, bar=bar) # It is best
```

最后一个的方式可以定位变量，这样子调整参数顺序也不会有问题。

### python with

python一个非常有用的语法特性，就是可以将上下文进行管理，在出现错误的时候也可以保证上下文的正确析构。

有几种方式进行with语句的使用：

1.  就是已经支持with语句的API，比如open。

2.  自己实现，可以用类的方式，重载`__enter__`和`__exit__`方法。

    ```python
    class Context(object):
        def __init__(self, name):
            self.file = open(name)

        def __enter__(self):
            return self.file

        def __exit__(self, ctx_type, ctx_value, ctx_traceback):
            self.file.close()

    with Context('xxx') as f:
        pass
    ```

    调用with之后其实是**创建了一个对象**，这个对象构造之后通过`__enter__`方法返回给后面的as语句的变量，不论是否出现trace，都会再最后调用`__exit__`

3.  另外一个方式就是直接构造一个执行上下文的代码，通过`yield`方法来**切换执行流程**

    ```python
    import contextlib

    @contextlib.contextmanager
    def custom_open(filename):
        try:
            f = open(filename):
            yield f
        finally:
            f.close()

    with custom_open('file') as f:
        pass
    ```

    上面代码通过`contextmanager`将一个普通的函数变为了一个管理上下文的函数，执行到yield的时候会将变量返回，然后切回执行环境到with里面的语句，最后执行结束都执行finally的代码。

4.  还有一种简单方式，就是`context.closing`函数可以对有`close`接口的API对象进行上下文管理.

    ```python
    import contextlib
    import urllib

    with contextlib.closing(urllib.urlopen('http://xxx.org')) as page: 
        pass
    ```

    实现类似上面，对构造队形进行管理，然后`__exit__`的时候调用close方法。

总结下：

1.  如果复杂的场景使用class方式。
2.  简单的场景，使用contextmanager的方法更加直接。
3.  如果更加简单，只是析构方法需要进行管理，那么都统一定义为close接口。

参考文档：

1.  [pymotw contextlib](https://pymotw.com/2/contextlib/index.html)
2.  [the hitchhikeder's guide to python](http://docs.python-guide.org/en/latest/writing/structure/)

### python gotcha (python一些诡异的坑）

#### python的默认构造参数

注意python的默认构造参数是在函数定义的时候进行构造，而不是每次执行都构造一个默认对象（这个和ruby不一样，可能是考虑到效率的问题）

所以一定要注意不要在python的默认参数中定义可变变量，这将非常的危险。

#### python函数的lazy binding closures

```python
def create_multipliers(): 
    return [lambda x : i * x for i in range(5)]

>>> for m in create_multipliers():
>>>     print m(2)
>>> 
>>> 8 8 8 8 8
```

上面的输出居然所有的i都是4，这是为什么呢？

这是因为python的函数闭包是延迟绑定的，也就是函数定义之后，只是定义了函数的实际执行体，而没有将对应闭包的参数绑定到闭包中（猜想也是为了保持效率，因为很多函数定义之后并不一定被执行）而是在执行的时候才进行绑定，所以这个时候i绑定都是4.

而且这个问题并不只是lambda的问题，而是所有的函数都这样子，即使使用def定义的函数，如下（也一样有问题）：

```python
def create_multipliers(): 
    for i in range(5): 
        def multiplier(x): 
            return i * x 
        multipliers.append(multiplier) 
    return multipliers
```

一个比较hack的解决方案就是，通过上面提到的**构造默认参数的时候会构造出默认数据**，所以修改为下面就ok了。

```python
# 因为i=i会将默认值的i直接绑定到闭包中
def create_multipliers(): 
    return [lambda x, i=i : i * x for i in range(5)]

>>> for m in create_multipliers():
>>>     print m(2)
>>> 
>>> 0 2 4 6 8
```

或者使用系统的partial函数进行参数绑定：

```python
def create_multipliers(): 
    from operator import mul
    from functools import partial
    return [partial(mul, i) for i in range(5)]
```

参考文档: [common gotach from reitz python guide](http://docs.python-guide.org/en/latest/writing/gotchas/)

### python不输出pyc文件

如果非常讨厌pyc文件的话，可以定义变量，那么系统运行时候就不输出pyc了，nice：

```bash
export PYTHONDONTWRITEBYTECODE=1
```

### python yield

python的yield也绝对是一个杀手级别的语法糖，虽然看起来非常的不直观。

有几个概念：

1.  迭代器(iterator)，python中的迭代器的概念是需要实现接口`next`，如果遇到没有数据的时候，返回`raise StopIteration`。这样子的迭代器就可以和各种的系统接口进行融合。
2.  生成器(generator)，生成器其实就是保存了一些列序列的实例，通过`__iter__`接口得到访问序列的迭代器。（有时候大多数情况下generator和iterator可以混在一起来谈，因为generator也实现了`next`迭代访问的接口）

所以一个基本的生成器构造方式如下：

```python
class Iterator(object):
    def __init__(self):
        self.count = 0

    def __iter__(self):
        return self

    def next(self):
        if self.count < 4:
            self.count += 1
            return self.count
        else:
            raise StopIteration

>>> for i in Iterator():
>>>     print i
>>>
>>> 1 2 3 4
```

所以for代码的执行流程就是：

1.  通过for后面的生成器的`__iter__`得到一个迭代器。
2.  然后不停调用`next`方式得到下一个数据，直到遇到`StopIteration`异常

大体代码类似：

```python
try:
    iter = Iteration().__iter__()
    while True:
        i = iter.next()
        print i
except StopIteration:
    pass
```

---

上面的代码还是显得非常麻烦，有没有方便的构造生成器的方式呢？有，就是**yield**关键字。

一个函数(generator funcion)如果定义了**yield**那么这个函数就是一个**生成器函数**，其返回值就是**生成器**，且接口兼容迭代的接口。 比如下面的代码：

```python
def get_prime_start_from(start_num):
    num = start_num
    while True:
        if is_prime(num):
            yield num
        num += 1

gene = get_prime_start_from(3)

>>> type(gene)
>>> 'generator'
>>> next(gene)
>>> 3
>>> gene.next
>>> 5
```

生成器函数神奇的地方在于，可以：

1.  执行函数逻辑，但是可以从函数执行处(yield)跳出到caller的地方。并且保存了++所有的上下文执行环境，局部变量**等信息
2.  caller执行，caller执行完成之后，可以通过`next`方式++切换到刚才的函数中继续执行++

---

生成器函数还有一种语法是`send_v = yield return_v`，其逻辑是：

1.  通过`generator.send(send_v)`的方式将数值幅值到send_v.
2.  同时上面的语句返回**下一次yield运行的retrun_v**

所以第一次运行的，需要下将代码运行到**第一次yield所在的位置**

[一个例子](https://jeffknupp.com/blog/2013/04/07/improve-your-python-yield-and-generators-explained)：

```python
import random

def get_data():
    """Return 3 random integers between 0 and 9"""
    return random.sample(range(10), 3)

def consume():
    """Displays a running average across lists of integers sent to it"""
    running_sum = 0
    data_items_seen = 0

    while True:
        data = yield
        data_items_seen += len(data)
        running_sum += sum(data)
        print('The running average is {}'.format(running_sum / float(data_items_seen)))

def produce(consumer):
    """Produces a set of values and forwards them to the pre-defined consumer
    function"""
    while True:
        data = get_data()
        print('Produced {}'.format(data))
        consumer.send(data)
        yield

if __name__ == '__main__':
    consumer = consume()
    consumer.send(None)
    producer = produce(consumer)

    for _ in range(10): 
        print('Producing...') 
        next(producer)
```

所以概念上这个语法就是提供了**修改生成器内部数据的外部(caller)修改方式**。

比如上面的代码，其实consume就是一个不停消化数据的容器，每次调用一次next运行就消化一批数据（不一定yield就需要发挥数据，也可以不返回数据，而这样子更多是用来控制流程的概念），通过send的方式来给其喂数据。同理，对于produce而言，通过yield来实现**一次次生成数据，发送数据的功能**

需要注意的是，第一次启动的时候需要调用`send(None)`, 否则开始的时候没有等待结果的`yield`，从而导致报错。之后就可以调用`send(xxx)`将上一次的`yield`返回结果。

当然也可以调用`next`，调用next等价于`next = send(None)`就是说`next`会得到yield的结果，但同时会告诉返回值是None，所以一路调用`next`是肯定没有问题的（第一次就是需要None）

---

所以可以将生成器函数扩展理解为==保存了所有状态的实例: 这个实例每次通过next切换到原环境中运行，运行结束后保存运行状态，等待下一次运行，并可以和caller交互数据。==

扩展来看，生成器并不一定就是完全用来生成数据，而也可以被用来实现控制程序执行流程的逻辑。比如[tornaod coroutine](http://www.tornadoweb.org/en/stable/guide/coroutines.html)， 其概念就是执行一个异步的代码像写同步代码的方式。

比如下面的执行逻辑：

```python
from tornado import gen

@gen.coroutine
def fetch_coroutine(url):
    http_client = AsyncHTTPClient()
    response = yield http_client.fetch(url)

    # In Python versions prior to 3.3, returning a value from # a generator is not allowed and you must use raise gen.Return(response.body) instead.
    return response.body
```

`fetch`代码是一个异步调用的代码，其返回值是一个叫做`Future`的东西，这个东西被tornado的ioLoop进行管理，一旦完成调用，通过callback的方式通知完成体。

使用coroutine的方式将future和callback的方式写成了同步的方式，大致实现逻辑为：

```python
# Simplified inner loop of tornado.gen.Runner
def run(self):
    # send(x) makes the current yield return x. It returns when the next yield is reached 
    future = self.gen.send(self.next)
    def callback(f):
        self.next = f.result()
        self.run()
    future.add_done_callback(callback)
```

流程大致是：

1.  运行gen，得到yield结果，这个结果加入callback。
2.  yield结果运行完成之后，callback调用，将结果通过send发送会yield处继续运行。
3.  循环，同理又运行结束，调用callback，继续下一个yield的运行，知道运行结束。

好NB的hook，直接将异步代码写成了同步的感觉，利用yield的切换运行逻辑和保存上下文的特性。

---

参考文档：

1.  [stackoverflow - yield in python](http://stackoverflow.com/questions/231767/what-does-the-yield-keyword-do-in-python)
2.  [great blog - improve your python yield and generators explained](https://jeffknupp.com/blog/2013/04/07/improve-your-python-yield-and-generators-explained/)
3.  [网易云阅读 - writing idiomatic python](http://yuedu.163.com/source/cl_dc23b96c2df84533957ffb1089e90604_4)
4.  [tornado - coroutines](http://www.tornadoweb.org/en/stable/guide/coroutines.html)

### python logging

python的log模块系统自带，用起来也非常的方便。log模块主要有四个类支撑：

1.  log
2.  handler
3.  filter
4.  format

log就是定义正常的log进行输出，而handler表示将log输出到什么位置，比如stream表示流，file表示文件等，filter表示输出的过滤规则，而format表示具体的输出数据的格式。几个类配合起来进行组合使用。

log是有层级关系的，最上层的log就是root，这是一个logging模块的模块变量，通过调用代码`logger.getLogger()`得到，如果指定logger的名字就是`logger.getLogger(log_name)`使用相同的`log_name`就会得到相同的log，这点也是logging模块自己维护了一个log的映射dict实现的。

一个log的输出先**经过子类的handler输出，之后再经过父类handler，依次传递。**。名字可以体现父子关系，比如`base`就是`base.test`的父类。

这样的层级关系好处体现在：

1.  层级的输出控制。
2.  通过定义root的handler，等价于定义了最基本的handler，后面生成的log都可以复用这个handler，起了复用的作用。

简单的调用log的方式，就是直接使用logging模块提供的几个全局方法：

1.  basicConfig : 会对root log进行简单的定义。
2.  error/info/debug : 直接就是使用root log，同时如果root log没有定义的话，会使用basicConfig进行定义初始化。

注意的是，root默认的`debug_level`是WARNING。

`debug_level`有几个维度的定义方式：

1.  log层级，如果不符合log层级的log不会输出。
2.  父log层级，如果自己没有定义log层级，那么会使用父类的，依次找上去，直到root的level。
3.  handler层级，如果log层级符合，还需要符合handler层级，才会输出到handler中。比如log层级是info，所有info数据都会进入log后续系统，但是一个handler的层级（比如需要输出所有的错误信息到文件），那么就将handler的级别设置error，这样子info的数据都会输出，但是能到文件中的只有error级别数据。

---

参考文档：

1.  [一个比较好的说明log的文章](https://app.yinxiang.com/shard/s61/nl/2147483647/fd86874d-ae64-4f20-bc8f-c45b76f87125/)
2.  [python-motw-logger](https://pymotw.com/2/logging/index.html)

### python functools wraps

python的decorator是一个强大的东西，可以给一个既定的函数或者类进行修饰，达到「一键扩展」功能的效果。

但是装饰之后的函数（或者类）的很多原信息，比如`__name__ __doc__ __module__`都变为了修饰之后的函数，而不是被修饰的原函数，这样子有时候会造成很多的奇异的地方。所有python系统库中引入了工具`functools.wraps functools.update_wrapper`，这两个工具函数的作用就是将将修饰器（wrapper）的属性修改为被修饰的属性（wrappered），这样子修饰之后的东西看起来和原来一模一样：

```python example-from-python-doc https://docs.python.org/2/library/functools.html
>>> from functools import wraps
>>> def my_decorator(f):
...     @wraps(f)
...     def wrapper(*args, **kwds):
...         print 'Calling decorated function'
...         return f(*args, **kwds)
...     return wrapper
...
>>> @my_decorator
... def example():
...     """Docstring"""
...     print 'Called example function'
...
>>> example()
Calling decorated function
Called example function
>>> example.__name__
'example'
>>> example.__doc__
'Docstring'
```

其实原理就是，`wraps`调用了`update_wrapper`，将wrapped的原信息都拷贝到wrapper中，从而实现看起来都一样的效果，贴一下源代码：

```python
WRAPPER_ASSIGNMENTS = ('__module__', '__name__', '__doc__')
WRAPPER_UPDATES = ('__dict__',)
def update_wrapper(wrapper,
                   wrapped,
                   assigned = WRAPPER_ASSIGNMENTS,
                   updated = WRAPPER_UPDATES):
    """Update a wrapper function to look like the wrapped function

       wrapper is the function to be updated
       wrapped is the original function
       assigned is a tuple naming the attributes assigned directly
       from the wrapped function to the wrapper function (defaults to
       functools.WRAPPER_ASSIGNMENTS)
       updated is a tuple naming the attributes of the wrapper that
       are updated with the corresponding attribute from the wrapped
       function (defaults to functools.WRAPPER_UPDATES)
    """
    for attr in assigned:
        setattr(wrapper, attr, getattr(wrapped, attr))
    for attr in updated:
        getattr(wrapper, attr).update(getattr(wrapped, attr, {}))
    # Return the wrapper so this can be used as a decorator via partial()
    return wrapper

def wraps(wrapped,
          assigned = WRAPPER_ASSIGNMENTS,
          updated = WRAPPER_UPDATES):
    """Decorator factory to apply update_wrapper() to a wrapper function

       Returns a decorator that invokes update_wrapper() with the decorated
       function as the wrapper argument and the arguments to wraps() as the
       remaining arguments. Default arguments are as for update_wrapper().
       This is a convenience function to simplify applying partial() to
       update_wrapper().
    """
    return partial(update_wrapper, wrapped=wrapped,
                   assigned=assigned, updated=updated)
```

### metaclass

1. 如果说类是object-factory的话，那么元类就是class-factory
2. metaclass的话构造出来的是一个对象，所以metaclass中的所有方法都可以任务是class-object的类方法。
3. 原来可以控制类的构造，如果需要对类生成的过程，成员函数进行控制。

```python
class Meta(type):
    def __call__(self):
        print 'Enter Meta.__call__: ', self
        obj = type.__call__(self)
        print 'Exit Meta.__call__: ', obj
        return obj

    def __new__(metacls, name, bases, dictionary):
        print 'Enter Meta.__new__:', metacls, name, bases, dictionary
        newClass = type.__new__(metacls, name, bases, dictionary)
        print 'Exit Meta.__new__: ', newClass
        return newClass

    def __init__(cls, name, bases, dictionary):
        print 'Enter Meta.__init__: ', cls, name, bases, dictionary
        super(Meta, cls).__init__(name, bases, dictionary)
        print 'Exit Meta.__init__'

class A(object):
    __metaclass__ = Meta
print 'Create instance of class A'
A()

# Create class A
# Enter Meta.__new__: <class '__main__.Meta'> A (<type 'object'>,) {}
# Exit Meta.__new__:  <class '__main__.A'>
# Enter Meta.__init__:  <class '__main__.A'> A (<type 'object'>,) {}
# Exit Meta.__init__
# Create instance of class A
# Enter Meta.__call__:  <class '__main__.A'>
# Exit Meta.__call__:  <__main__.A object at 0xb76a9ccc>
```

上面的代码有几个可以说明的地方：

1. 类也是一个**对象**，类这个对象构造的实际是类定义结束的时候
2. python定义类对象的时候，是看下当前是否有定义`__metaclass__`，如果有的话，使用该元类构造类（如果没有，找父类，还是没有，找当前moudle），如果没有，使用默认的元类`type`
3. 别的过程就对照起来了，`__new__`方法是一个类方法，第一个参数是类本身，用来构造一个类对象，而`__init__`方法是在生成了对象之后进行初始化，所以第一个对象是cls（也就是类自己）
4. 元类的其他方法，可以看成是成员方法，而成员就是构造出来的对象，也就是**类对象本身**，所以hook了`__call__`方法，就是hook了构造类成员的构造方法。

ORM的实现可能就需要使用metaclass，因为ORM需要根据当前类中的类变量定义知道当前类操作数据的格式要求，使用metaclass就可以将该格式要求转变为有效的后续操作。

几个参考文章

- [示例来源文章](http://xiaocong.github.io/blog/2012/06/12/python-metaclass/)
- [实现ORM](http://www.liaoxuefeng.com/wiki/001374738125095c955c1e6d8bb493182103fac9270762a000/001386820064557c69858840b4c48d2b8411bc2ea9099ba00)
- [stackoverflow上的回答](http://blog.jobbole.com/21351/)

### pythonic way

#### list的dict，按照dict的特定subkey进行排序

```python
>>> a=[{'a':1}, {'a':0}]
>>> import operator

# 其中sort时候的key表示每一个item按照什么key进行比较，itemgetter刚好将subkey的字段取出来
>>> a.sort(key=operator.itemgetter('a'))
```

---

参考文档：

- [python-functools-doc](https://docs.python.org/2/library/functools.html)
- [segmentfault-blog](https://segmentfault.com/a/1190000000599084)
- [stackoverflow-what-does-functools.wrap-do](http://stackoverflow.com/questions/308999/what-does-functools-wraps-do)
