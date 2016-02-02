---
title:  mac折腾记录
tags: [self,mac,osx]
date: 2016/1/25 10:01:20
toc: true
---

本文档记录了自己**折腾**mac的相关记录。

<!--more-->

## mac-soft

### iterm

xxx

dddd

#### 默认启动特定的tmux session

在iterm中可以设定启动的命令（profiles -> command -> send text as start)中设定:

```bash
# 如果存在work的session就attach，否则创建一个新的
tmux attach -t work || tmux new -s work
```

## misc

### 无法umount

使用`sshfs`加载远程服务器目录进行开发，如果`ssh`重新连接，需要先将原来的mount卸载掉。但是经常有时候提示说，无法卸载，当前目录正忙，解决方法是[ref][1]:

```bash
# 找到打开文件的进程，然后kill掉即可
# 使用sudo是为了保证一些特权进程占用
sudo lsof | grep /xxx-busy-dir

# 或者使用
disutil unmount (force) /xxx-busy-dir
```

  [1]: http://apple.stackexchange.com/questions/104842/the-volume-cant-be-ejected-because-its-currently-in-use
