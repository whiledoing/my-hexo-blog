---
title: linux-course-from-linux-foundation学习记录
tags: [self,unix/linux]
date: 2016-03-24 09:58:20
toc: true
---

linux foundation 提供了一个不错的[在线linux教程](https://courses.edx.org/courses/course-v1:LinuxFoundationX+LFS101x.2+1T2015/info)，里面介绍了linux很多基本的概念，历史，操作和使用习惯等知识。

<!--more-->

使用文件描述法进行重定向：

```bash
some_exc > file 2 >& 1 
```

另外一个简写是：

```bash
some_exc &> file
```

这样会将`stdout`和`stderr`都写入到文件中。

使用`which`和`whereis`来定位可执行程序，更推荐`whereis`搜索范围更加大，`which`只在当前用户目录中搜索。

使用`locate`命令可以搜索文件，但是该文件使用`updatedb`进行构建，不是实时的。

使用`find`命令更加灵活。

显示当前目录所有文件：

```bash
find dire
```

搜索文件名：

```bash
find dire -name "*.tmp"
```

运行命令

```bash
find dire -name "*.tmp" -exec rm {} \;
```

或者使用 `';'`形式作为结尾（应该是正常的;表示命令的分割符号，而不是find命令的执行结束符号，所以需要转义，两种形式都可以）

```bash
find dire -name "*.tmp" -exec rm {} ';'
```

使用`-ok`用来用户确认之后再操作

```bash
find dire -name "*.tmp" -ok rm {} \;
```

Debian系统中使用 `apt`系列 (advanced packaging tool)命令进行包管理，而在Fedora中使用`yum`命令(yellowdog updater modifier)。

压缩，解压缩命令：

- gzip, gunzip (gzip -d）是对文件进行操作，即使使用 `-r`参数对文件夹进行操作，也是对文件夹下面的单个文件进行操作。
- bzip2，bunzip2 也一样，对文件进行操作。
- zip 是对包进行操作，和tar命令类似，需要先指定输出名称，再指定输入文件filter。
- tar命令可以使用 `-C` 来改变输入或者输出的目录。这样可以将解压出来的文件放入到特定目录中。

通过`mount`命令可以将设备加入到当前文件系统中，默认的mount配置在`/etc/fstab` (file system table)

`/proc`目录叫做 「pseudo filesystem」，因为这里是内存数据的映射。

使用`sudo /usr/sbin/useradd`加入一个用户。

使用 `chmod`来改变文件的读写权限，权限分为：

1. u 用户
2. g 群
3. o 其余的人（所有人）

比如下面方式：

```bash
chmod uo+x,g-w xxx-file
```

简写的形式是编码的权限：

1. r 是4
2. w 是2
3. x 是1

rwx 对应7
rw 对应6

简写的方式：

```bash
chmod 766 xxx-file
```

使用chown改变一个文件的文件拥有者。chgrp改变文件的group内容。

```bash
chown new-user file
chgrp new-group file
```

使用 `cat << EOF > a.txt` 可以输入多行数据到文件中，使用EOF结尾。

`last`命令可以查看最后登陆系统的用户信息。

用户可以执行的`sudo`命令是可以控制权限的，在文件 `/etc/sudoers`进行设置，使用 `visudo` 进行编辑可以获得更好的安全保证。

网络工具：

1.    使用`host`查看域名的ip地址，默认使用`/etc/resolv.conf`中配置进行DNS解析。
2.    使用`route`查看路由表
3.    使用`traceroute`查看到一个目的地的路由表
4.    使用`nmap`进行端口扫描
5.    使用`wget`下载网页
6.    使用`curl`比`wget`更加方便，可以直接答应出url对应内容，也可以下载文件。

文本编辑工具：

`sed`是`stream editor`的简称。

比如替换字符串:

```bash
sed s/abc/def/g file1 > file2
```

`awk`用来提取文件中特定pattern的信息，名称是由三个发明者的last name的首字母构成。

`awk`对于分析表格数据很在行，比如得到`/etc/passwd`中的用户名:

```bash
# -F set delimiters
awk -F : '{ print $1 }' /etc/passwd
```

文件操作命令：

1.  sort/uniq 排序和消重。`sort -u file` 就等于 `sort file | uniq`

2.  paste将多个文件使用分隔符号合并

    ```bash
    # file1和file2的对应行连接一行，并使用tab分割
    paste -d '\t' file1 file2        

    # file1的所有行变为一行，并使用':'分割
    paste -d ':' -s file1
    ```

3.  join命令可以将有相同列信息的数据进行合并（类似于多个表有相同的key，根据key合并数据）

4.  tee命令见输入一方面输出到文件，另外一方面输出到标准输出中。

5.  cut也可以得到分割之后的的特定列：

    ```bash
    # 得到第一列
    cut -d ':' -f 1 /etc/passwd
    ```

6.  strings命令用来得到一个文本中可读文本

    ```bash
    strings xxx.xls | grep xxx
    ```

pdftk是对pdf进行操作的非常好用的工具，可以进行分割，合并，提取文件等操作，pdfinfo可以提取pdf文件内容。

系统命令的返回值记录在环境变量`?`中，也就是可以得到上一次返回值：

```bash
echo $?
```

使用shift可以将当前输入参数的第一个去掉，所以执行特定命令次数可以写成

```bash
run() {
    number=$1
    shift
    for i in `seq $number`; do
        $@
    done
}
```

使用`$@`表示后面所有的参数和`$*`是一个含义。

使用`ls`方式或者`$(ls)`方式得到命令的结果。

`if`的语法为：

```bash
if condition; then do-something; fi

if condition; then
    do-something
else
    do-xxx
fi
```

if的判断使用`[]`包裹起来

```bash
if [ -e xxx-file ]; then
    echo xxx-file exist!
fi
```

使用`-e`判断文件是否存在，`-f`判断是否是普通文件，`-d`判断是否是目录。

bash中执行数学运算，有三中方式：

1. 使用`expr`指令 `a = $(expr 1 + 2)`
2. 使用`let`，`let a=(1 + 2)`
3. 使用`$(())`语法，`a = $((1 + 2))`

获取字符串变量的长度：

```bash
echo ${#str}
```

循环的语法：

```bash
for i in list; do
    ...
done

while [ condition ]; do
    ...
done

until [ condition ]; do
    ...
done
```

运行bash使用debug模式 `bash -x xxx.sh`，debug模式下，在运行命令之前都会输出命令内容。在bash中可以使用`set -x`来开启调试功能，使用`set +x`来关闭调试功能。

使用`mktemp`命令生成随机的临时文件或者临时目录：

```bash
# 使用X表示随机字符，使用 `|| exit 1`的方式来判断，如果没有成功，直接返回。
TEMP=$(mktemp /tmp/tempfile.XXXXXX) || exit 1

# `-d`表示生成目录
TEMPDIR=$(mktemp -d /tmp/tempdir.XXXXX) || exit 1
```

输出重定向到`/dev/null`可以见输出全部屏蔽掉：

```bash
cat xxx-file > /dev/null
```

使用系统环境变量`$RANDOM`得到随机数字。

使用`w`命令显示当前登陆人信息，以及做了什么事情。而`uptime`现实当前已经运行了多久。

cpu load avarages有三个参数，分别表示前**1min/5min/15min**系统CPU平均运行负载率。

在命令的后面加入`&`表示讲命令放在后台运行：

```bash
(date; sleep 10; date; sleep 1000; date) > date.out &
```

运行上面命令后，会在后台运行操作，使用`jobs`可以看到当前后台运行的程序，使用`fg`见程序放到前台运行

```bash
# 第一个后台操作为%1，默认fg等于fg %1
fg %1
```

然后用`Ctrl+Z`暂停该任务，如果想继续该任务使用

```bash
bg %1
```

任务又会在后台运行，使用`kill %1`杀死该后台程序。
