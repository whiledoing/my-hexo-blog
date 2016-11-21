---
title:  mac折腾记录
tags: [self,mac,osx]
date: 2016/1/25 10:01:20
toc: true
---

本文档记录了自己**折腾**mac的相关记录。

<!--more-->

## iterm

### 默认启动特定的tmux session

在iterm中可以设定启动的命令（profiles -> command -> send text as start)中设定:

```bash
# 如果存在work的session就attach，否则创建一个新的
tmux attach -t work || tmux new -s work
```

### 通过iterm给tmux发送hex code

iterm可以直接配置快捷键对应的hex code，这对于tmux而言实在是太幸福了，这样子可以直接设置iterm的快捷键来控制tmux的行为，具体参考[blog](http://cenalulu.github.io/linux/professional-tmux-skills/)

我现在主要控制的就是pane的移动，以及window的移动：（通过直接使用cmd来控制，非常的麻溜）

<center>
![iterm hex code config for tmux](http://7xqoay.com1.z0.glb.clouddn.com/16-2-3/83294465.jpg)
</center>

## misc

### 无法umount

使用`sshfs`加载远程服务器目录进行开发，如果`ssh`重新连接，需要先将原来的mount卸载掉。但是经常有时候提示说，无法卸载，当前目录正忙，解决方法是[点击](http://apple.stackexchange.com/questions/104842/the-volume-cant-be-ejected-because-its-currently-in-use):

```bash
# 找到打开文件的进程，然后kill掉即可
# 使用sudo是为了保证一些特权进程占用
sudo lsof | grep /xxx-busy-dir

# 或者使用
disutil unmount (force) /xxx-busy-dir
```

### 尝试使用`Caps Lock`作为新的切换输入法的快捷键

之前一直都是使用`Shift`作为切换中英输入的快捷键，好处当然就是使用方便，坏处很多的炒作快捷键都需要`Shift`进行配合，如果不小心，就会导致配合的快捷键切换了中英状态非常蛋疼。

所以根据[网上建议](https://www.zhihu.com/question/19611143)使用`Caps Lock`作为新的切换方式，因为我**重来就不用大写按键**，直接将大写按键改为了`Ctrl`来使用。更好的是，我们的`Sierra`更新之后，直接可以使用[这个功能](http://newping.cn/9452)，perfect！

为了方便使用，我将右边的command键位修成了大写（[使用了软件Karabiner-Elements](https://github.com/tekezo/Karabiner-Elements)进行修改，这样子我每次切换输入法只需要使用右边的大拇指轻轻的点击一下即可，效果非常nice。

# tmux
    
mux绝对是开发人员的神器，尤其是我这种需要连接很多服务器进行开发的来说，使用tmux绝对是神之利器。

tmux中有很多非常好用的插件：
 
 1. [tmux-yank](https://github.com/tmux-plugins/tmux-yank)，方便的拷贝当前的命令和工作目录，使用`prefix + y/Y'的方式
 2. [tmux-open](https://github.com/tmux-plugins/tmux-open)，是不是经常说看到tmux的缓冲区的文件或者目录可以打开，在缓冲区模式中，使用`o/ctrl+o`的方式，可以方便的打开，或者调用**$EDITOR进行编辑**

在vim中操作tmux的[plugin](https://github.com/benmills/vimux)，非常有用的插件。

经常在写vim的时候，需要去调用相关的代码，然后需要切换到iterm，到tmux中操作指令。为什么不可以在vim中直接给tmux发送指令呢，反正tmux就是一个client-server结构嘛。所以搜索到这个插件。

其中有一个配置`VimuxUseNearest`，如果设置为1的话，那么会使用当前最小编号的pane运行指令。如果设置0的话，就会第一次调用指令的pane下面创建一个pane执行代码，后续都在这个位置执行。

个人喜欢开启这个变量，这样子在多个window操作的时候，都可以利用当前操作环境的第一个pane进行操作。不方便在于需要自己准备一个pane（或者用已有的），一般这个不是什么麻烦事情。而且布局的东西可以保存，可以单独为一个工作环境下的（window）下设置一个特定的pane执行命令（与vim交互），也很方便。

## auto rsync in mac

在mac上可以通过「OS X's FSEvents API」监控一个文件夹下面文件系统的改变。

所以这里找到一个[应用](https://github.com/ggreer/fsevents-tools)，可以监控mac下文件系统的改变，然后执行特定的命令。（如果是在linux系统中可以[使用这个应用](https://github.com/drunomics/syncd)）

目前我的一个应用方式是，在本地修改代码，但是运行代码在**实际开发环境的服务器**上面！同步代码当然使用强大的`rsync`了命令了。

比如一个应用环境的配置就是写了一个同步的命令的脚本`syndev.sh`

```bash syndev.sh
#!/bin/bash
rsync -avhz -e 'ssh -p xxxx' --progress --exclude='*.pyc' ${src_syn_dir} ${dst_user}@${dst_host}:${dst_path}
```

然后通过命令进行监控：

```bash autosyndev.sh
notifyloop $src_syn_dir ./syndev.sh
```

一般的流程是，代码同步到远端之后，需要远端服务器进行重启，或者热更新来运行上最新的代码，一般我们都会在远端放置一些类似**start, stop, reload**之类的脚本。

我还喜欢设置一些alias用来方便的操作服务器的运行。然后我们也可以在本地机器运行远端服务器上面的**alias**:

```bash
ssh -p xxxx user@host 'bash -ic your-alias-here'
```

上面脚本比较有意思的地方是使用`bash -ic`来[运行alias](http://stackoverflow.com/questions/1198378/ssh-command-execution-doesnt-consider-bashrc-bash-login-ssh-rc)，其中i参数表示使用interactive mode，这样才可以解析alias。c参数表示运行后面的命令，而不是文件。

## pycharm

一般自己开发喜欢在熟悉代码之后使用vim进行开发，但是在不熟悉代码或者需要进行代码浏览的时候，就会切换到IDE进行开发（因为看代码的tag跳转是在是方便的很）。

pycharm绝对是python开发IDE中的战斗机，各种方便，而且还有免费的教育版本，实在是业界良心。

### pycharm使用svn版本的问题

pycharm中可以集成svn（git etc）版本管理系统，使用的时候注意（尤其是svn），会使用到错误的svn版本，导致不兼容的问题（原谅mac系统自带的svn总是很旧）。mac的svn使用brew进行管理，但是brew管理的svn并不会被pycharm所用到，所以需要在pycharm的配置中手动定义svn的地址，一般为`/usr/local/bin/svn`地址，之后才可以正确使用。

还有一点提醒就是，svn的大版本之间不兼容的。比如你开发环境的svn服务器的svn使用1.7版本，但是你本地使用1.8版本就可能出现你可以checkout下来版本，但是不能提交（因为1.7不知道1.8搞了什么别的东西），然后会报错**This client is too old to work with working copy**。所以使用之前最好切换到相同的svn版本，使用brew管理的话，就很方便了，只用`brew switch svn 1.7`即可（brew其实是管理了多个版本，但是使用软连接的方式来控制实际用的版本，很nice）。

## hammerspoon

mac上窗口管理的神器。（功能完全不局限在窗口管理上面）

最早的管理神器是[Slate](https://github.com/jigish/slate/wiki/Global-Configs)，该软件的设计实现就是可以通过配置的方式管理所有的窗口的操作，其中有一个非常好用的功能**hint**，类似于vim的**easymotion**插件，这个非常的nice。而且支持配置文件的方式也是非常的推荐。

但是Slate已经很久不再更新了，所以继续根据上文tutorial博文的推荐找到了新的神器[HammerSpoon](https://github.com/Hammerspoon/hammerspoon)。这个项目其实很多思想类似于Slate，但是更加的强大。因为其本质操作方式就是定于了一个操作系统和lua解析配置（加逻辑运行代码）的解释器。我们可以直接写配置以及写代码来实现非常多的操作功能，非常的强大！

然后就是各种的折腾了，折腾的配置主要参考了[别人的配置](https://github.com/songchenwen/dotfiles/tree/master/hammerspoon)。

把玩了一下，列一下主要的使用特性：

1. configurable.
2. hint.
3. hotkey.
4. undo.
5. split window mode。(神一样的功能，就是在当前窗口中进行split，然后调整是哪两个窗口进行split，还可以调整split窗口的大小。谁用谁知道。)

附上参考文档：

- [HammerSpoon tutorial](http://thume.ca/howto/2014/12/02/using-mjolnir-an-extensible-osx-window-manager/)
- [Slate tutorial](http://thume.ca/howto/2012/11/19/using-slate/)
- [国人写的HammerSpoon介绍](https://songchenwen.com/tech/2015/04/02/hammerspoon-mac-window-manager/)
