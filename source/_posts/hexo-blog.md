---
title:  hexo-blog
date: 2016/1/31 02:40:08
tags: [blog,hexo]
toc: true
---

记录一下自己折腾[blog](http://whiledoing.github.io)的内容。

blog使用的是静态blog框架[hexo](https://hexo.io/zh-cn/)

<!--more-->

## hexo related

hexo内置了一些[Tag Plugins](https://hexo.io/zh-cn/docs/tag-plugins.html)可以方便的写特定的插件内容。

一种经常用到的内容是代码块，可以同时设置code的语言，标题，以及相关的link

```
<code-marker> [language] [title] [url] [link text] code snippet </code-marker>
```

@note 不过这个语法目前在cmd mardown支持不太好，所以就是mark一下，可能还不太会使用到。

## 主题


该主题中使用的模板语言是[ejs](http://ejs.co/)。`ejs`的全称就是`effective javascript templating`，在其中可以直接**内嵌js的代码**，这样子可加入非常多的逻辑语义，再进行`render`得到最终的页面。

> ejs tags
<% 'Scriptlet' tag, for control-flow, no output
<%= Outputs the value into the template (HTML escaped)
<%- Outputs the unescaped value into the template
<%# Comment tag, no execution, no output
<%% Outputs a literal '<%'
%> Plain ending tag
-%> Trim-mode ('newline slurp') tag, trims following newline

favicon是从[这里](http://www.favicon-generator.org/)搜索得到，然后放入到`source/favicon.ico`文件中即可。

footer加入了统计pv和uv的信息，使用的服务是[不蒜子](http://service.ibruce.info/)

另加入了[font-awesome](https://fortawesome.github.io/Font-Awesome/)加载额外的图标。

## 插件

### auto spacing

官方文档中说明使用`auto_spacing`参数进行中英文的自动空格，但是尝试了一下发现并无卵用。

然后安装了下官方插件[hexo-filter-auto-spacing](https://github.com/hexojs/hexo-filter-auto-spacing)，发现生效了。但是效果不佳，因为其使用的自动空格解析模块比较旧，所以就去掉了。

使用[pangu](https://github.com/vinta/pangu.js)这个模块分割，效果更好。参考官方插件写法，创建文件`scripts/after_post_render_auto_space.js`

```js
var pangu = require('pangu');
hexo.extend.filter.register('after_post_render', function(data) {
    data.title = pangu.spacing(data.title);
    data.content = pangu.spacing(data.content);

    /* for toc */
    data.excerpt = pangu.spacing(data.excerpt);
});
```

比较有意思的是作者的一段说明文字：

> 漢學家稱這個空白字元為「盤古之白」，因為它劈開了全形字和半形字之間的混沌。另有研究顯示，打字的時候不喜歡在中文和英文之間加空格的人，感情路都走得很辛苦，有七成的比例會在 34 歲的時候跟自己不愛的人結婚，而其餘三成的人最後只能把遺產留給自己的貓。畢竟愛情跟書寫都需要適時地留白。

> 與大家共勉之。
