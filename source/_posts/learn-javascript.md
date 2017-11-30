---
title: javascript学习笔记
date: 2016-12-03 22:34:24
tags: [自写,javascript]
---

记录一下自己学习javascript的笔记和总结.

<!--more-->

## 类的实现

### new语义

正常我们使用new操作符创建对象的时候, 其实底层是怎么做的呢, 看下面的代码:

```javascript
var Foo = function(xxx) {
    this.xxx = xxx
}
f = new Foo();
```

使用new就等价解释器帮我们做了这样子的事情

```javascript
var Foo = function(xxx) {
    var obj = new Object(Foo.prototype);
    this = obj;
    this.xxx = xxx;
    return obj
}
```

也就是说, 使用new的时候, 会创建一个对象, 切换到对象的执行环境初始化并返回. 注意的是, 该对象的prototype就是当前构造类(函数)的prototype. 这样子得到的对象foo是一个使用Foo类的prototype创建的实例.

### 类的实现

prototype进行实现就等价于类的实现. 有一点注意的是, 如果将prototype进行直接的赋值, 需要设定constructor属性. 因为如果我们将代码写成下面的形式, 系统会自动在prototype创建出来的时候, 帮我们如下设定`Foo.prototype.constructor=Foo`, 而使用覆盖的话, 就没有这个设定了.

```javascript
//自动设定出来constructor的关系
Foo.prototype.func = function() {
}

//这样子设定的话, 需要手动进行指定
Foo.prototype = {
    constructor: Foo,

    func: function() {
    }
}
```

### 继承的实现方式

js对象的找属性的方式是, 如果自己身上有属性直接返回, 否则使用prototyp的对象进行查找. 所以如果我们将一个类的prototype设定为一个新的对象, 且这个对象prototype和父类是一致, 那么找不到的方法其实就可以到父类中查找.

```javascript
var Base = function(xxx) {
    this.xxx = xxx;
}

var Derived = function(xxx, yyy) {
    // 这个很重要, 等价于调用父类的构造方法了
    Base.call(this, xxx);
    this.yyy = yyy;
}
Derived.prototype = new Object(Base.prototype);
Derived.prototype.constructor = Derived;
```

为什么不直设置`Derived.prototype = Base.prototype`? 这样子设定的话, 对子类的prototype修改就会**导致父类prototype也被错误的修改**, 所以需要**加入一个中间层**, 这里就是一个新的对象. js里面规定, 如果自己设定了属性, 且prototype中也有, 那么prototype中的属性被隐藏. 所以这样子设定, 在Derived.prototype中加入新的属性, 完全是ok的, 因为不会影响到Base.prototype, 且新的属性会隐藏掉父类的属性.

### 参考文档

- [javascript高级程序设计](https://book.douban.com/subject/10546125/)
- [javascript object oriented programming - udacity online course](https://cn.udacity.com/course/object-oriented-javascript--ud015)

## BOM

BOM表示浏览器对象模型(Browser Object Module), 使用BOM可以控制开发人员访问浏览器相关的内容, 比如操作窗口, 得到当前页面信息等等。

BOM模型以windows对象为依托, 表示浏览器窗口和页面可见区域. 同时, 非常需要留意的是, windows对象也是默认的ECMAScript中的Global对象, 所有的全局变量和函数都是它的属性, 且所有的原生构造函数都存在于他的命名空间下面.

比如常用的windows接口有几个:

- innerHeight/innerWidth/outerWidth/outerHeight表示窗口的信息

- open打开新的窗口

- setTimeout/setInterval用来设定定时器

- alert/confirm/prompt用来弹出对话框

`location`对象比较特殊, 既可以访问于`window.location`也可以访问于`document.location`, 两者是完全一致的.

其中`locatoin.href`对象表示当前页面完全的地址, 如果设置该参数, 就会修改当前窗口的地址(跳转), 比如设定`location.href="http://xxxx.com"`

调用`location.href`切换地址会让浏览器认定当前是切换了场景, 如果不保留当前调用堆栈信息, 使用`location.replace`方法.

也可以使用`location.reload`来重新刷新当前的页面.

### jQuery

**jQuery is just a javascript framework**

jQuery简化了我们操作DOM的方式, 其中最经典的`$`符号就是表示jQuery本身, 本质上是一个函数, 也是一个入口点.

进行查询的一些方式, 和CSS的选择器是一样的

```javascript
$('tag')
$('.class')
$('#id')
```

还可以方便的进行相关元素的获取

```javascript
$('tag').parent()
$('tag').parents()

// 得到一层的孩子
$('tag').children()

// 所有的孩子节点
$('tag').find()
$('tag').siblings()

// 非常方便的是, 可以继续在查找域中继续查找
$('tag').find('#somebody')
```

使用`toggle`方法可以切换一个节点的可见性, 同理使用`toggleClass`可以修改一个节点是否有一个类.

使用`text`方法用来设置元素的内部文本数值.

使用`append`用来加入一个节点到最后一个孩子节点上, 相反, 使用`prepend`方法加入节点到第一个孩子节点上.

对应的, 如果是兄弟之间的插入的话, 就是使用`before`和相反的`after`

使用`css`方法可以设置css, 当然也可以得到css属性, 如果说明的是, 这里设置的css相当于是设置了style属性, 而不是修改了css文件, 所以你需要权衡一下是否应该直接用css实现, 而不是使用jQuery.

jQuery返回的对象还是可以使用`each`方法对当前的的节点进行遍历:

```javascript
$(.node).each(function(index) {
    // this会被设置为当前选择的DOM element
    this.style.color = "red";

    // 如果使用$(this), 那么得到的就是jQuery object, 当然推荐这种形式了
    $(this).css("color", "red")
})
```

加载脚本的实际也很重要, 一般, 可以将script放在head标签中, 这样子开始的时候就加载或者下载脚本, 但是这样子有个问题, 如果脚本运行的早, 可能DOM还没有创建出来, 那么操作DOM的代码就会无效.

但是如果将脚本放在body的后面, 那么下载的过程就会滞后, 也会导致整个页面加载速度变慢. 所以一种有效的方式是, 在`document.ready`事件后处理相应的逻辑.

jQurty提供了相应的方法:

```javascript
$(function() {
    // Do interesting things here will only make effect after document.ready
})
```

#### jQuery监控事件

在chrome中提供了监控一个node事件的方式, 使用`monitorEvents(node)`来监控一个节点的所有时间信息. (需要注意的是, 只可以在chrome的终端中使用)

使用`on`方法可以监控节点的事件:

```javascript
$('#my-input').on('keypress', function() {
    $('body').css('background-color', '#2727FF');
})
```

使用`on`方法时候需要注意, 如果对多个元素设置`on`方法的监控, 在回调函数中将无法使用`$(this)`, 因为`$(this)`得到的是所有的查询到的元素, 所以我们需要使用别的方式, 索性event对象可以有效解决

```javascript
$( 'article' ).on( 'click', function( evt ) {
    // 使用evt.target可以定位当前点击的对象
    $( evt.target ).css( 'background', 'red' );
});
```

别的几个有用的event数据信息有:

- `preventDefault()`屏蔽掉默认的处理行为, 比如click事件的点击效果.

- `keyCode()`得到输入的key信息

- `pageX`点击位置的坐标

- `type`事件类型, 分析多个时间的时候有效

jQuery还有几个简写的方式, 比如`keypress(cb)`就是等价于`on('keypress, cb)`, 基本上所有基本事件都有对应的简写形式, 使用的时候需要留意, 怎么简单怎么来.

加入事件的时候可能存在一个问题, 如果加入时间的节点在开始时候还没有, 那么加入就无效怎么办. 这种情况很有可能发生, 比如给一个ul中的li加入事件, 但是后来又新添加了新的li项目, 这个项目因为在设置event之后调用, 所以没有设置成功.

为此, 使用`Event Delegation`的概念, 将event设置到父节点上. `on`方法的第二个参数用来设置当前时间关注着是自己的什么子节点.

```javascript
// 这样子, 点击ul的时候, 会check一下是不是点击了自己的li子节点
$( '#rooms-ul' ).on( 'click', 'li', function() {
});
```

### 使用严格模式

严格模式是为了规范js的使用方式, 将一些tricky和errorprone的地方都规约掉.

使用方式是在文件的开头写上`"use strict";`, 或者是在函数开头第一句的地方输入相同的内容, 那么规约的就是函数作用域而已.

具体的说明可以[参考文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode), 总计几点大概是:

1. 不予许定义全局的定义变量.
2. 禁止使用with.
3. eval和argument的时候更加规范. 大致是, eval不会将引入的代码放到全局, argument的参数修改不会改变argument的数值.
4. 更加安全. 不会自动将this变为object对象, 不会提供arguments.callee等特性.
5. 为未来ECMAScript铺路, 将来版本预留的关键字也不允许使用.

### 参考文档

- [javascript高级程序设计](https://book.douban.com/subject/10546125/)
- [jQuery introduction - udacity online course](https://cn.udacity.com/course/intro-to-jquery--ud245)
- [MDN - strict mode](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode), 总计几点大概是:

## Immediately-Invoked Function Expression(IIFE)

js里面函数是有执行环境的概念的, 所以有的时候, 我们需要将一些私有东西放在函数中进行包裹, 然后有希望立刻进行执行得到运行结果(很多时候也是会定义一个匿名的函数, 这样子更加简洁). [参考文档](http://benalman.com/news/2010/11/immediately-invoked-function-expression/)

但是js里面调用这种立刻运行函数的时候需要消息一些坑. 如果是函数声明的话, js中理解是一种语句, 是不可以直接运行的. 但是如果是函数表达式的话, 那么可以运行:

```javascript
// error, 这是function declaration
function test() { /* code */ }();

// ok, 这是function expression
var test = function() { /* code */ }();
```

有没有办法绕开js判定一个函数逻辑意义的概念的方式呢? 有的, 就是使用`()`. 因为在js中规定, 括号中不可以包含语句, 而只能是表达式. 所以在括号中调用函数, js引擎知道这是一个表达式, 所以调用ok.

```javascript
// 两种都是ok的, 推荐使用上面一种
(function(){ /* code */ }()); // Crockford recommends this one
(function(){ /* code */ })(); // But this one works just as well

// 在语境中, 系统已经判断出来是一个表达式的话, 那么可以去掉括号, 虽然不推荐这样子, 因为不直观
// 使用括号的方式也是提醒看到代码的话, 这里表示返回调用函数的返回值, 而不是返回函数
var i = function(){ return 10; }();
true && function(){ /* code */ }();
0, function(){ /* code */ }();

// 还有一种tricky的方式是使用new直接调用, 而且不需要最后的括号, 如果有参数的调用, 需要指定参数
new function(){ /* code */ }
new function(){ /* code */ }() // Only need parens if passing arguments
```

这种使用方式, 还可以用来解决一个经典的闭包延迟解析的问题.

```javascript
// 解析的时候i都是最后的数值, 因为闭包调用的时候是分析当前i的数值, 而不是将i存到环境中
var elems = document.getElementsByTagName( 'a' );
for ( var i = 0; i < elems.length; i++ ) {
    elems[ i ].addEventListener( 'click', function(e){
        e.preventDefault();
        alert( 'I am link #' + i );
    }, 'false' );
}
```

解决的方式, 就是想办法将i放入到执行环境中, 多一个间接层, 自然想到加入一个函数调用(包裹执行环境):

```javascript
var elems = document.getElementsByTagName( 'a' );
for ( var i = 0; i < elems.length; i++ ) {
    (function(i_v) {
        elems[ i_v ].addEventListener( 'click', function(e){
            e.preventDefault();
            alert( 'I am link #' + i_v );
        }, 'false' );
    }(i))
}
```

可以将这种模式理解为, 使用函数立刻调用的方式创建出来一个新的执行环境, 这个执行环境会将i参数进行保存, 进而不同的循环运行中使用不同的运行环境, 也就是不同的i参数了.

还有一个有意思的实现模式, 叫做Module Pattern, 个人理解就是进行数据的private修饰. js里面是没有直接语言上的private类成员变量的概念. 所以我们思路也是加入一个中间层:

1. 构造一个执行环境, 对外访问不到执行环境中的变量.
2. 执行环境返回的对象中值有我们提供的接口, 而没有执行环境中的不对外暴露的接口.
3. 使用函数构造一个执行环节, 相当于一个工厂方法, 但是立刻调用.

```javascript
var count = (function() {
    var i = 0;
    return {
        get : function() { return i; },
        set : function(v) { i = v },
        increment : function() { return ++i;}
    }
}())

count.increment();
count.set(111);

// 报错, 访问不到
count.i
```

## MVC模式

MVC模式在web开发中用的比较多. 考虑一下, 我们的数据就是model, 可能从DB中得到, 可能是一些固定的值, 需要渲染成为html, 那么html相关的操作就是view, 但是如果用户需要操作渲染的elem进而改变数据, 就需要view和model进行交互, 这就产生了偶尔. 所以引入controller的这一层级.

原则上: model和view之前不可以产生之间的调用关系, 所有的接口应该使用controller进行中转和封装. 这样子结构更加灵活. 我们可以改变接口定义来改变view的效果.

### 标准实现

直接贴一下我实现的代码:

```html
<!DOCTYPE html>
<head>
<meta charset='utf-8'>
</head>
<body>
    <ul id="cat-list"></ul>
    <div id="cat-show">
        <h2 id="cat-name"></h2>
        <img src="" alt="" id="cat-img">
        <p id="cat-click-num"></p>
    </div>
    <script src='app.js'></script>
</body>
```

```javascript
window.onload = function () {
    var model = {
        init : function() {
            this.currentCat = this.cats[0];
        },

        cats: [ { clickCount: 0, name: 'Tabby', imgSrc: 'img/434164568_fea0ad4013_z.jpg', imgAttribution: 'https://www.flickr.com/photos/bigtallguy/434164568' }, { clickCount: 0, name: 'Tiger', imgSrc: 'img/4154543904_6e2428c421_z.jpg', imgAttribution: 'https://www.flickr.com/photos/xshamx/4154543904' }, { clickCount: 0, name: 'Scaredy', imgSrc: 'img/22252709_010df3379e_z.jpg', imgAttribution: 'https://www.flickr.com/photos/kpjas/22252709' }, { clickCount: 0, name: 'Shadow', imgSrc: 'img/1413379559_412a540d29_z.jpg', imgAttribution: 'https://www.flickr.com/photos/malfet/1413379559' }, { clickCount: 0, name: 'Sleepy', imgSrc: 'img/9648464288_2516b35537_z.jpg', imgAttribution: 'https://www.flickr.com/photos/onesharp/9648464288' } ]
    };

    var octopus = {
        init: function () {
            model.init();
            catView.init();
            catListView.init();
        },

        getCats: function () {
            return model.cats;
        },

        setCurrentCat: function (cat) {
            model.currentCat = cat;
        },

        getCurrentCat: function () {
            return model.currentCat;
        },

        incCatCount: function () {
            model.currentCat.clickCount++;
            catView.render();
        }
    }

    var catListView = {
        init: function () {
            this.catListElem = document.getElementById('cat-list');
            this.render();
        },

        render: function () {
            var cats = octopus.getCats();
            this.catListElem.innerHTML = '';

            for (var i = 0; i < cats.length; ++i) {
                var cat = cats[i];
                var elem = document.createElement('li');
                elem.innerText = cat.name;
                elem.addEventListener('click', (function (cat) {
                    return function () {
                        octopus.setCurrentCat(cat);
                        catView.render();
                    };
                })(cat));
                this.catListElem.appendChild(elem);
            }
        }
    }

    var catView = {
        init: function () {
            this.catNameElem = document.getElementById('cat-name');
            this.catImgElem = document.getElementById('cat-img');
            this.catClickNumElem = document.getElementById('cat-click-num');

            this.catImgElem.addEventListener('click', function () {
                octopus.incCatCount();
            });

            this.render();
        },

        render: function () {
            var cat = octopus.getCurrentCat();
            this.catNameElem.innerText = cat.name;
            this.catImgElem.src = cat.imgSrc;
            this.catImgElem.alt = cat.imgAttribution;
            this.catClickNumElem.innerText = cat.clickCount;
        }
    }

    octopus.init();
}
```

这里更多是实现view的接口, view的接口根据当前`octopus(controller)`提供的接口计算出所有的需要显示的list数据. 而`catView`就是根据当前`currrentCat`的数据来渲染出当前需要显示的cat信息. 这里一个比较好的实现是:

- 用`init`方法进行初始化, 比如进行元素选择, 构造相应方法等逻辑, 然后调用render进行渲染.

- 将所有的数据看成一个Object的List组织, 当前的数据就是一个指针数据的改变.

### 使用[KnockOutJS](http://knockoutjs.com/index.html)实现MVVM

上面的实现还是有些麻烦, 比如要在`octopus`中定义很多的函数来连接view和model的关系, 比如一个model数据变化了, 需要加入函数, 修改数据, 通知view进行重新渲染. 如果逻辑复杂, 需要写很多的这种方法.

可以使用[KnockOutJS](http://knockoutjs.com/index.html)库来改进. 这个库主要的功能就是使用observer模式建立view和model的关系. 在html中给特定的标签加入特定的描述信息, 该信息和对应的`ViewModel`(controller的变种, 反正就是连接用的)的数据建立关系, 一旦对象数据变化, 那么html就会重新渲染(框架帮我做了这些事情). 这样子的好处就是:

- 基本不用写view的代码了. 因为view的代码都嵌套到html中进行描述, nice! 本身html就是一种render的描述方式, 通过扩展和对应的数据建立关系.

- 数据的修改会通知对应观察者的html进行修改, 相当于自动进行re-render.

修改后的代码为:

```html
<!DOCTYPE html>
<head>
<meta charset='utf-8'>
<script src="https://cdnjs.cloudflare.com/ajax/libs/knockout/3.4.1/knockout-min.js"></script>
<script src='app.js'></script>
</head>
<body>
    <!-- 这里表示将catList变量进行循环分解, 然后将里面的内容重复进行替换添加到ul中, 这里就是一个li对象的重复添加-->
    <!-- li中的执行环境是当前得到的catList遍历到的cat子对象, 而setCurrentCat方法在父亲方法中, 也就是VM中, 所以使用$parent修饰 -->
    <!-- 每一个li对象的执行环境是一个cat子对象, 点击时候得到的对象就是当前执行环境 -->
    <ul id="cat-list" data-bind="foreach: catList">
        <li data-bind="text: name, click: $parent.setCurrentCat"></li>
    </ul>

    <!-- 使用with语句可以设定当前执行环境, 否则代码都需要写成data-bind=currentCat().name -->
    <div id="cat-show" data-bind="with: currentCat">
        <h2 id="cat-name" data-bind="text: name"></h2>
        <img src="" alt="" id="cat-img" data-bind="attr: {src: imgSrc}, click: $parent.catImgOnClick">
        <p id="cat-click-num" data-bind="text: clickCount"></p>
    </div>
</body>
```

```javascript
window.onload = function () {
    var initcatsData = [ { clickCount: 0, name: 'Tabby', imgSrc: 'img/434164568_fea0ad4013_z.jpg', imgAttribution: 'https://www.flickr.com/photos/bigtallguy/434164568' }, { clickCount: 0, name: 'Tiger', imgSrc: 'img/4154543904_6e2428c421_z.jpg', imgAttribution: 'https://www.flickr.com/photos/xshamx/4154543904' }, { clickCount: 0, name: 'Scaredy', imgSrc: 'img/22252709_010df3379e_z.jpg', imgAttribution: 'https://www.flickr.com/photos/kpjas/22252709' }, { clickCount: 0, name: 'Shadow', imgSrc: 'img/1413379559_412a540d29_z.jpg', imgAttribution: 'https://www.flickr.com/photos/malfet/1413379559' }, { clickCount: 0, name: 'Sleepy', imgSrc: 'img/9648464288_2516b35537_z.jpg', imgAttribution: 'https://www.flickr.com/photos/onesharp/9648464288' } ];

    var Cat = function(data) {
        this.clickCount = ko.observable(data.clickCount);
        this.name = ko.observable(data.name);
        this.imgSrc = ko.observable(data.imgSrc);
        this.imgAttribution = ko.observable(data.imgAttribution);
    };

    var AppViewModel = function() {
        var self = this;

        this.catList = ko.observableArray();
        initcatsData.forEach(function(data) {
            self.catList.push(new Cat(data));
        });

        // 将方法放在这里而不是放在Cat类中, 应该是为了减少当前构造的次数, 因为共性的方法不需要每一个cat都构造一次, 有点像prototype的味道
        this.catImgOnClick = function() {
            // 注意这里使用的是self, 因为调用的地方将当前环境设置为currentCat了
            // self.currentCat().clickCount(self.currentCat().clickCount()+1);

            // 当然也可以将代码写成这样子, 因为当前执行环境就是当前的Cat对象
            this.clickCount(this.clickCount()+1);
        };

        // ko会将当前执行环境中的变量取出来放到第一个参数中
        this.setCurrentCat = function(cat) {
            // 使用obserable变量的时候, 一定要注意使用方式, 因为需要跟踪一个变量的修改, 所以使用方法的形式.
            self.currentCat(cat);
        };

        this.currentCat = ko.observable(this.catList()[0]);
    };

    ko.applyBindings(new AppViewModel());
}
```

代码明显简洁了很多, 个人总结的几个要点(目前该库掌握还处于基础阶段, 可能总结的范式不是非常准确):

- 在html中定义了需要监听改变的tag, 可以监听改变的变量使用`ko.observable`类型生成.

- 将`Cat`抽象成一个对象, 其中的数据都是可以监听修改的, 这样子的好处是, 如果这个对象内容被变化, 那么所有成员数据如果是`ko.observable`的, 都认为变化, 体现了整体动全局动的概念. 而单体属性, 比如`clickCount`也设置为`ko.observable`是为了可以单独控制这个变量的修改, 对特定的html产生变化.

- 可以将`ko.observable`看做一个proxy, 就是一个变量的代理. 不同的就是接口层面上, 因为要知道数据修改, 只能使用调用函数的方式通过set语义进行修改.

- 对于`ko.observableArray`类型的`catList`对象就好理解了, 本身是一个需要监听改变的数据(可能加入新的cat), 然后其保存的数据**就是普通的cat对象(并不是观察的对象)**, 只是一个集合而已. 而我们的`currentCat`对象是一个指向当前的`Cat`指针变量, 因为需要监听这个指针变化, 所以也是一个`ko.observable`类型的变量.

<script async src="//jsfiddle.net/bycsjp9f/embed/js,html,css,result/dark/"></script>

### AngularJS

更加强大的框架AngularJS, 提供了更加强大的MVC功能.

大致学习了一下, AngularJS和KnockOut挺相似, 都是使用扩展html的方式来实现view和数据的自动binding:

- view就是一个html, 使用template的方式来组合相应的变量数据.

- controller是一个用来和view组合使用的概念, 比如代码`  <div ng-include="'views/cat_list.html'" ng-controller="CatControllerCtrl as cat"></div>`就可以将一个view和对应的controller进行组合, 所有view中的teamplate的变量获取都是从controller中进行获取.

- service是隶属于controller中的, 更多的是表示**纯数据**的包装类, controller可以共用多个service, 这种组合关系一下就让controller变得强大, 因为不同的controller可以共用不同的service.

- module又是一个更加上层的概念, 所有的view, controller, service, routing可以构成一个组件, 这个组件可以共用, 也就是说我们的app是一个moudle, 同时我可以利用别的写好的moudle进行扩展.

- 感觉AngularJS强大的地方在于非常的灵活, template机制也非常强大(不需要想KnockOut那样子定义observable), 组合的使用方式非常便于扩展.

重新实现了一下`CatList`的程序, 因为不是很熟悉, 所以实现比较低端, 只是一个概念.

```html
<!-- cat_list.html view -->
<div class="row">
  <ul>
    <li ng-repeat="cat_item in cat.catDat" style="list-style: disc">
      <button ng_click="cat.on_click(cat_item)">{{cat_item.name}}</button>
    </li>
  </ul>
</div>

<div class="row">
  <h3>{{cat.cur_cat.name}}</h3>
  <p>{{cat.cur_cat.clickCount}}</p>
  <img src="" alt="" ng-src="{{cat.cur_cat.imgSrc}}" ng-click="cat.cat_click(cat.cur_cat)">
</div>
```

```javascript
// cat_controller.js controller
angular.module('testYeomanAngularApp')
  .controller('CatControllerCtrl', ['catData', function (catData) {
    this.catDat = catData.catDat;
    this.cur_cat = catData.cur_cat;

    this.on_click = function(cat_data) {
      this.catDat.cur_cat = cat_data;
      this.cur_cat = cat_data;
    };

    this.cat_click = function(cat_data) {
      cat_data.clickCount++;
    }
  }]);

// service for data
angular.module('testYeomanAngularApp')
  .service('catData', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.catDat = [ ...  ];

    this.cur_cat = this.catDat[0];
  });
```

## 使用js来操作dom

html加载完成的时候, 会调用系统的`window.onload`方法, 通过链式添加更多的函数到相应方法中:

```javascript
function addLoadEvent(func) {
	if(typeof windows.onload != 'function') {
		window.onload = func;
	} else {
		var oldonload = window.onload
		window.onload = function() {
			oldonload();
			func();
		}
	}
}
```

这样子就可以多次调用当前方法来加载多个load函数.

### 参考文档

- [mvc example - github repo](https://github.com/udacity/ud989-cat-clicker-premium-vanilla)
- [javascript design pattern - udacity online course](https://cn.udacity.com/course/javascript-design-patterns--ud989)
- [Knockout document](http://knockoutjs.com/documentation/introduction.html)
- [TodoMVC.com - to do app with different MV* framework or library](http://todomvc.com/)
- [AngularJS](https://angularjs.org/)
- [yeoman - the web's scaffolding tool for modern webapps](http://yeoman.io)
- [yeoman angular generator](https://github.com/yeoman/generator-angular#readme)
- [front-end framework - udactiy online course](https://cn.udacity.com/course/front-end-frameworks--ud894)


