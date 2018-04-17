---
title: 折腾vim
date: 2016-04-22 13:13:50
tags: [vim]
---

这是我的vim的折腾记录。

<!--more-->

## plugin

### [drawit](http://www.vim.org/scripts/script.php?script_id=40)

非常好玩的一个插件，用来绘制ascii的图形，比如下面这种:

```
+--------------+           +--------------------------+
|    DrawIt    |---------->|  <leader>di (begin draw) |
+--------------+           +--------------------------+
```

可以通过各种快捷键进行画图，通过移动方向键来进行单点的画图。

常见的一些功能备忘：

1.  开启画图之后，移动方向键，可以单点画图，使用space切换橡皮模式。
2.  ctrl-v区域选择之后，使用`<leader>b`画矩形，`<leader>e`椭圆，`<leader>l`画直线，`<leader>a`画箭头
3.  一个非常好用的功能是笔刷模式，区域选择后调用命令`:'<,'>SetBrash [a-z]`将图形记录到笔刷中，然后通过`<leader>p[a-z]`选择对应笔刷进行粘贴。也可以通过`shift-leftmouse`点击的形式对默认的笔刷a进行复制。

另外推荐一个[在线asciiflow编辑器](http://asciiflow.com/)

