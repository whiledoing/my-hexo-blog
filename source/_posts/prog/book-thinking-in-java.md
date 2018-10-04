---
date: 2018/10/1 15:50:22
tags: [java,学习笔记]
title: 《Java编程思想》学习笔记
---

学习[Java编程思想](https://book.douban.com/subject/2061172/)的笔记。

<!--more-->

## 内部类

java的内部类并不只是类似于C++的命名空间的包裹，而是一种和外部类进行组合的设计模式。在内部类中可以访问外围对象的**所有成员**，而不需要任何特殊条件，就像自己的成员变量一样。所以内部类的对象创建必须依托于一个外部类构建的对象。一种方式是在外部类的接口中提供生成内部类的对象（this被自动的包裹到内部类中），一种是通过外部类对象构造内部类对象：

```java
public class Outer {
    public class Inter {
        void getOuterObject() {
            // 这个语法来得到外部类的对象
            return Outer.this;
        }
    }

    public getInterObject() { return new Inter(); }
    public static void main(String[] args) {
        Outer out = new Outer();

        // 注意这个语法，使用外部的对象构建，因为两者是组合的关系
        Inter in = out.new Inter();
    }
}
```

所以从设计上说，内部类是对外部类逻辑的重新划分。比如设计类的时候，发现部分逻辑可以提取出来自成单元，就可以通过内部类的方式来组织。比如Iterator经常这么搞：

```java
public class SomeCollection<T> {
    public Iterator<T> iterator() {
        return new Itr();
    }

    // 注意这里使用private来修饰内部类，不对外可见，值对外提供接口的实现服务，解耦逻辑
    private class Itr implements Iterator<T> {
        @Override
        public boolean hasNext() { ... }
        @Override
        public T next() { return ... }
    }
}

另外一种内部类叫做嵌套类，使用static修饰，类似于C++中的内部类，是一种类的命名空间管理方式。（不同地方在于C++的内部类不能访问外部类的private方法，而java可以，认为是外部类的内部空间，进而调用private方法）：

```java
public class Outer {
    public static class Test {
        public static void main(String[] args) {
            Outer out = new Outer();
            out.test();
        }
    }
}

上面用法将测试代码委托到单独的内部嵌套类中进行，这样子发布代码时可以将`Outer$Test.class`删除，而不会将测试代码发布出去。调用测试，执行`java Outer$Test`即可。

## enum

java中的enum非常有意思，声明enum的类会默认继承系统提供的`Enum`基类，提供基本的操作枚举的方法。同时，enum中声明的常量会变成类似public static final的enum类变量：

```java
enum Fruit {
    // 等价于定义了 public static final APPLE = new Fruit()
    APPLE,
    BANNA
}

```

每一个定义的常量还对应了一个数值，使用`APPLE.ordinal()`获取，通过接口`Fruit.values()`得到当前所有常量对象。

enum有趣的的地方是可以定义常量对象的方法，很方便实现类似状态机的设计模式：

```java
enum Handler {
    // 这里等价于是 public static final A = new Handler() { ... }
    A {
        void handle() {
            System.out.println("precess by " + this);
            B.handle();
        }
    },
    B {
        void handle() {
            System.out.println("precess by " + this);
            C.handle();
        }
    },
    C {
        void handle() {
            System.out.println("precess by " + this);
            System.out.println("finish process");
        }
    };
    abstract void handle();
}
```

比如，上面的类中定义了一个抽象方法，而每一个`Handler`中的常量都重新定义了具体的接口。配合容器`EnumSet`和`EnumMap`可以对状态进行配置。（内部使用bitset结构高效索引，只对EnumMap类型有效）。

## 注解

本来以为注解类似于python的修饰器，学习了一下发现根本不是一回事。java的注解并不会修改被修饰内容的运行逻辑，只是在被修饰物体上加入了标签信息。这些标签信息需要被额外的APT（Anonotation Processing Tool）组件所处理才可以hook生效运行效果。

定义一个注解类似于定义一个接口，只是使用关键字`@interface`。同时还可以加入一些**元注解**（用来修饰注解的注解），常用的有 `@Target`表示当前注解用在什么地方，而`@Retention`表示注解的生命周期：

- SOURCE：只保留在源代码中，编译器编译时，直接丢弃这种注解，不记录在.class文件中。
- CLASS：编译器把注解记录在class文件中。当运行Java程序时，JVM中不可获取该注解信息，这是默认值。
- RUNTIME：编译器把注解记录在class文件中。当运行Java程序时，JVM可获取该注解信息，程序可以通过反射获取该注解的信息。

注解也可以有属性，而且可以在调用时候指定。如果注解只有一个属性叫`value`，调用的时候可以不指定属性名而直接调用，这是一个默认的规则。

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Test {
    long value() default 0;
}

class TestClss {
    // 集中调用都可以，因为使用了默认的定义规则。
    @Test(value = 100)
    @Test(100)
    @Test
    void testMethod() {}
}
```

很多类库使用注解来对代码逻辑进行hook，以便提供简单快捷的框架调用。java编程思想书中提到了一个简单的测试框架，使用RUNTIME级别的注解配合反射机制来动态的运行测试，并反映测试结果。大致执行代码如下：

```java
void <T> process(Class<T> testClass) {
    for(Method m : testClass.getDeclaredMethods()) {
        // 检测当前的方法是否被Test Annotation所修饰
        if(!m.isAnnotationPresent(Test.class)) continue;

        // invoke调用成员方法
        if(!m.invoke(testCalss.newInstance())) {
            System.out.println("somethin wrong");
        }
    }
}
```

参考资料：

- [java注解的理解和应用](http://blinkfox.com/javazhu-jie-de-li-jie-he-ying-yong/)
- [秒懂java Annotation](https://blog.csdn.net/briblue/article/details/73824058)

## 容器

java的容器的用下面这张图可以完美的展示：

![](https://www.linuxtopia.org/online_books/programming_books/thinking_in_java/TIJ325.png)

其中没有说明的是`Queue`接口，`Queue`接口有两个实现类，一个是`LinkedList`，一个是`PriorityQueue`。注意`Queue`只是一个接口。

继承体系中，其实只有四种接口容器：Map、List、Set和Queue，它们各自有对应的实现版本。除了Map，其余的实现体都是Collection类型，Map和Collection的主要区别在于管理的元素是一维的还是一个tuple。也因此，Map类型单独构造了一个独立于Collection外的继承体系，虽然两者提供的操作语义非常相似。

java的容器结构中，除了定义基本的接口，还定义了以Abstract为前缀的抽象类，这些类提供了结构的部分实现，如果需要自定义的容器，可以继承这些抽象类进行再定义处理。

使用`Arrays.asList`接口可以给数组提供一个list的视图，但是注意，不可以增加或者删除元素，如果修改了list的内容，也会导致底层的数组元素的修改。

这篇文章对容器的api进行了更加详细的说明：[参考](http://jiangjun.name/thinking-in-java/chapter17)

## 异常

java的异常说明是一种自上而下强制执行异常的机制，在编译器就可以提供一定的异常检测。

一个方法可以声明将抛出特定的异常A，但实际上并不抛出这个异常。这样子做是提前给可能将来出现的异常占个坑，这样子调用端必须提前对该异常进行处理。

`Throwable`是java的异常基类，继承体系中有两种类型：

- `Error`表示编译器和系统错误，一般不需要关心。
- `Exception`表示可以被抛出的基本类型。

从`Exception`中继承出的`RuntimeExceptoin`表示运行时异常，比如`NullPointerException`异常。这类异常不需要在**异常说明中列出来，也被叫做『不受检查的异常』**。

`RuntimeException`异常如果一直传递到main函数，会导致程序退出，并在`System.err`中打印异常堆栈信息，所以最好再某一个上层上进行统一处理。

继承体系中，如果基类接口定义了A，B两个异常，那么子类覆盖基类的接口**只可以缩小异常范围，而不可以增加**。比如只声明会抛出A异常，但是不可以声明抛出C异常。

---

作者在书中分析了java异常说明的优缺点：

- 异常设计的本意是将代码的调用和错误处理分开，这样子不必将错误处理代码散落在各处，可以统一处理。（如果有相同类型的错误处理逻辑，异常是非常方便的统一聚合点）
- 异常说明设计之初参考了C++的异常说明机制，只是C++的异常说明（throws语句）并不会在编译器强制要求调用者对异常进行处理，而只会在运行时检测抛出异常和异常说明是否一致。而java需要非常严格的编译器异常说明检测。
- java的强制异常说明导致需要写更多的错误处理代码，这违背了异常的本意，也会导致程序员为了偷工省事而直接吞噬异常。

所以作者推荐处理java异常的方法有：

- 只在你知道如何处理的情况下才捕获异常。如果不知道，就重新抛出。
- 将不知道如何处理的异常包裹成RunTimeException抛出。

```java
class WrapCheckedException {
    void throwRuntimeException(int type) {
        try {
            switch(type) {
                case 1: throw new FileNotFoundException();
                case 2: throw new IOException();
                case 3: throw new RunTimeException("Where am I?");
                default: return;
            }
        } catch (Exception e) {
            // 通过java的异常链，将当前的异常e包裹到RuntimeException中
            throw new RuntimeException(e);
        }
    }
}

class TurnOffChecking {
    WrapCheckedException wce = new WrapCheckedException();
    try {
        wce.throwRuntimeException(1);
        wce.throwRuntimeException(2);
        wce.throwRuntimeException(3);
    } catch (RunTimeException e) {
        // 将原来的错误还原
        try {
            throw e.getCause()
        } catch (FileNotFoundException e) {
            print("I can handle this exception " + e);
        } catch (Throwable e) {
            print("I can not handle, move forward " + e);
            throw new RunTimeException(e);
        }
    }
}
```

上面的代码提供了一种思路，将受检测的异常包裹到不受检异常中，这样子异常不受检，也不会导致被无故吞噬。同时，利用异常调用链将原始异常保存起来，再可以处理异常的diff，取出不受检异常中的原始异常进行处理，或者在不知道如何处理的情况下，继续抛出。

## 反射

java的反射主要通过Object系统和对应的类型对象`Class`来实现。Class对象中提供了当前对象的方法，字段，构造函数，继承关系，标记等信息，程序可以根据该信息来做一些动态hook。

获取Class对象有两种方法：

```java
// 使用forName需要使用全限定类名，java会自动加载该类，并提供类对象（当然已经加载就不需要初始化类了，而是直接提供类对象）
// 使用?表示泛型类型，表示『任何事物』的概念，其等价于没有泛型，也就是 Class 等同于 Class<?>，只不过后者更能说明目的：我们是明确知道表示一个任意类型的，而不是疏忽了类型。
Class<?> c = Class.forName("me.whiledoing.test.TestReflection");

// 或者直接使用类对象的class对象
Class<TestReflection> cRef = TestReflection.class;
```

如果两个类型是继承关系，可以通过向上转型，使用父类类型来引用子类类型的对象。但如果将类型用到泛型参数中，不再继续符合对应的继承关系：

```java
public class Derived extends Base {}

// 报错，放到泛型参数中，并不是父子关系
Class<Base> baseClass = Derived.class;

// 使用java提供的extends参数来提示编译器，这里保存的泛型类型是继承于Base类型
Class<? extends Base> baseClass = Derived.class;

// 同样报错，这里编译器并不支持编译阶段得到具体调用方法的返回结果（虽然可以看出方法是为了得到基类，但编译阶段，java并不分析运行期的函数调用结果）
Class<Base> baseClass = Derived.class.getSuperclass();

// 需要写成，提示编译器大致的类型范围。
// 换个理解，编译阶段Derived.class.getSuperclass()的类型就是Class<? super Derived>，而运行期，才会变成Class<Base>
Class<? super Derived> baseClass = Derived.class.getSuperclass();
```

---

动态代理机制比较有意思，可以生成一个对**特定接口**进行代理的对象，该对象可以调用接口的方法，但实际执行内容我们可以动态hook。比如下面的代码，为所有代码调用都加入了输出：

```java
// 实际执行的对象
Interface obj = new RealObject();

// 包装的执行对象proxy，提供三个参数：1）类加载对象（貌似随便指定一个即可） 2）proxy提供的接口Class数组 3）执行hook的InvocationHandler，这里使用lambda替换了匿名对象
Interface proxy = (Interface) Proxy.newProxyInstance(
        Interface.class.getClassLoader(),
        new Class<?>[] {Interface.class},
        (proxy1, method, args1) -> {
            System.out.println(String.format("calling method %s with args %s", method.getName(), args1));
            return method.invoke(obj, args1);
        }
);

// 直接调用obj.doSomething(1)
proxy.doSomething(1);
```