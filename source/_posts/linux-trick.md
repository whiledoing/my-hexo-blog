---
title: linux-trick
date: 2016-12-16 11:07:15
tags: [linux]
---

主要记录一下自己平常使用linux命令, 操作, bash等工具的一些技巧, 以备忘.

<!--more-->

### top只看指定的进程

1. 使用`pgrep`得到指定的进程pid, 使用`pgrep -f`搜索的时候, 是根据完成命令行名称进行搜索, 而不是只是程序名称
2. 使用`pgrep -d`等价于使用paste将得到的pid list进行合并

```bash top-sepcific-name-process http://stackoverflow.com/questions/12075591/top-c-command-in-linux-to-filter-processes-listed-based-on-processname#
top -c -p $(pgrep -d',' -f string_to_match_in_cmd_line) -u $(whoami)
```

### 得到当前bash script的目录

主要是参考[stackoverflow回答](http://stackoverflow.com/questions/59895/getting-the-current-present-working-directory-of-a-bash-script-from-within-the-s#comment37025314_179231)中给出的结果:

1. 得到当前调用脚本的变量是`$0`, 但是使用这个方式得到的路径是当前第一层调用脚本路径, 而被嵌套调用脚本的路径还是第一层调用脚本路径.
2. 使用`$BASH_SOURCE`变量得到结果就即使是嵌套的调用脚本也是ok的.
3. 默认情况下, `BASH_SOURCE`和`$0`得到的文件路径会根据调用地点产生变化, 如果是在文件所在路径调用, 那么其结果就是`./file_name`而不是绝对路径. 所以使用`dirname $BASH_SOURCE`得到的结果可能就是`.`, 而不是绝对路径.
4. 如果希望得到绝对路径, 可以考虑使用`dirname $(readlink -f $BASH_SOURCE)`, 其中`readlink`会递归将所有链接的路径都得到, 但是mac没有这个命令, 所以通用的方式是`$(cd $(dirname $BASH_SOURCE); pwd)`, 通过cd得到当前路径, 然后`pwd`得到结果就是绝对路径.

总结起来:

1. 如果希望得到完全当前脚本的位置, 使用`$BASH_SOURCE`, 如果是希望得到调用脚本的路径, 使用`$0`.
2. 得到的脚本路径, 如果不是用来给别的变量(比如export传递到子进程中), 那么完全用`PWD=$(dirname $BASH_SOURCE)`即可, 虽然可能得到相对路径, 但是在当前调用脚本和路径情况下是完全ok的.
3. 但是如果是希望被别人使用, 那么需要绝对路径, 使用`PWD=$(cd $(dirname $BASH_SOURCE); pwd))`
