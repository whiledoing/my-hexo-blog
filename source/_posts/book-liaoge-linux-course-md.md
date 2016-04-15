---
title: 《鸟哥的Linux私房菜》学习笔记
tags: [self, learn-note, unix/linux]
date: 2016-03-24 11:07:05
toc: true
---

这是学习[《鸟哥的Linux私房菜》](http://book.douban.com/subject/4889838/)的学习笔记。

很早就买的书，一直放在家中堆灰。。。终于有空拿出来仔细看了下，陆陆续续看了2周左右，记录一下便于后续参考。

<!--more-->

### 账号管理

用户的`uid`一般在500之后，500以内的账号是系统保留的。

一个用户可能隶属于多个组，使用命令`groups`命令可以查看到当前用户所在的所有组，在第一个显示的就是所谓的**有效用户组**，这个概念对于玩家创建新文件的时候有关系。

使用`newgrp xxxx`命令来切换有效用户组，调用该命令之后会建立一个新的shell，在该shell中玩家的有效用户组被改变，这样子新的创建的文件用户组就被改变了。

使用命令`/usr/sbin/useradd`命令来增加一个用户账号，有几个有趣的地方：

1. 使用命令`/usr/sbin/useradd -D`可以查看添加默认账号的默认设置。
2. 创建账号的默认主目录文件就是拷贝文件夹`/etc/skel`中的内容，所以如果需要修改默认的`.bashrc`数值，可以修改`/etc/skel/.bashrc`，然后所有新的账号就有相同的初始配置了。
3. @note 默认创建出来的账号，一定要设置密码，负责无法使用shell进行登录。（账号是被暂时封锁的），具体可以查看`/etc/shadow`中的数据，该用户的第二个字段是`!`，表示没有设置秘密。

只有设置密码之后才可以有效使用账号，设置密码使用命令`passwd`，可以从`stdin`中得到密码，但是这样子容易根据记录得到密码，一般是批量生成密码的时会这样子使用：

    echo xxxx | passwd --stdin test
    
使用`id`命令可以查看用户所在的`uid/gid`信息，非常有用。

账号切换有两种方式，一种是常规意义上的账号切换，使用`su`命令，su命令切换账号的时候需要输入的是被切换账号的密码，如果不指定名字的话，表示切换到`root`

    su - some-user
    
注意需要加入符号`-`，表示使用新的账号的用户环境，这点没有仔细研究，但是非常重要。

但是这样子切换存在问题，用户需要知道对方的密码，如果我们有时候需要使用`root`权限进行操作，但是又不希望告诉所有人`root`账号的密码，那么就使用`sudo`的方式。`sudo`的执行方式类似于：

1. 切换到特定账号的用户环境
2. 执行特定命令。

语法如下：

    sudo -u some-user do-something
    sudo -g some-group do-something
    
一般其实我们更多的使用：

    sudo do-something
    
表示使用`root`的权限做一些事情。

所有`sudo`的权限需要进行控制，控制文件在`/etc/sudoers`文件中，但是一般我们使用命令`visudo`进行编辑，因为保存的时候会进行语法检测。

该文件的语法如下；

    root ALL=(ALL:ALL) ALL
    %adm ALL=(ALL) ALL
    
第一个ALL`表示所有的host，第二个`（ALL:ALL)`表示**所有的用户/所有的组**，不具体制定的话，就表示只对`root`用户可以切换，最后的`ALL`表示具体的可以执行的命令。
使用`%group-name`表示的是对组进行设定。

如果我让某一个用户可以执行特定的指令，可以设置定：

    some-user ALL=(root) /usr/sbin/passwd
    
表示只可以执行`passwd`命令，注意需要使用绝对路径。

使用`sudo`的好处是，用户输入的是**用户自己的密码，而不是root的密码**，通过如下设置可以让用户不输入密码执行`sudo`：

    some-user ALL=(ALL) ALL NOPASSWD:ALL
    
一些使用`sudo`的技巧：

1.  使用`sudo !!`来执行刚才需要权限执行的命令。`!!`表示上一个执行的命令。
2.  `sudo -k`用来消除对于权限的不需要输入密码缓存时间。
3.  `sudo -l`列出当前用户可以使用`sudo`的权限说明。

如果需要限制一个玩家不可以登陆，可以使用特殊的`shell`，就是`/sbin/nologin`，所以可以设置：

    useradd -s /sbin/nologin test
    usermod -s /sbin/nologin test
    
### linux文件 && 目录

`ls -l`命令得到的结果中，第一列的数据格式是：

```bash
    # 第一个字符表示文件类型，常见的有
    # - 表示普通文件
    # d 表示文件夹
    # l 表示连接文件
    # b 表示存储的接口设备
    # s 表示套接字
    -rw-r--r--   1 whiledoing  staff    66K Sep 25 19:35 10001_party_reward.data
```
    
之后的内容表示**文件/文件夹**对于**自己/组/其他**的权限。

使用`chown`可以修改所有者或者组，比如：

    chown user:test xxx
    chown :test xxx
    
使用`user:group`的同时修改**所有者和所在的组**信息。
    
使用`chmod`可以修改文件的权限，有两种方式：

1.  使用数字的方式：

    ```bash
    chmod 744 xxx.data
    ```

2.  使用控制格式，其中有**u/g/o/a**分别表示**自己/组/其他人/所有**的标识，有几种控制方式：

    ```bash
    chmod u=rwx,go=rx xxx
    chmod g=rx xxx
    chmod u+x xxx
    chmod a+x xxx
    
    # 如果不说明控制域，那么默认是对a进行控制
    chmod -x xxx
    chmod +x xxx
    ```

#### 文件和目录的权限说明

文件的权限说明对于该文件进行操作的权限，r表示可以cat出来，w表示可以进行修改，x表示可以对文件进行运行。有文件的w权限不代表可以删除该文件，因为这个权限是和**目录**的权限一致的。

但是对于目录而言，有些区别：

1. r表示可以使用`ls`得到目录中文件的**文件名**，但是**得不到文件的具体信息，就是ls -l的内容看不到**
2. w表示可以对目录进行修改，比如删除，修改，重命名等。
3. x表示可以进入到目录，就是使用`cd`的方式进入目录，同时可以得到目录文件的详细信息。@note 另外说明的是，如果没有x权限，那么即使文件有x权限也不可以运行文件，所以文件可以执行**必须有目录和文件的x权限才可以**（这个可以理解为，如果要运行命令，需要进入到对应的目录运行才可以）

所以一般而言，对于目录而言**rx的权限一般一起给，但是w的全选不经常给**

#### FHS

**FHS**表示**Filesystem Hierarchy Standard**就是表示文件的目录结构标准，一般linux distribution都会遵循。

有几个可以说明的目录结构：

1. `/bin /sbin` 目录表示系统常用的命令，以及系统**系统时候需要使用到的命令**，`sbin`比`bin`而言，不同在于前者是系统级别的命令，需要root权限。
2. `/usr`目录表示`UNIX Software Resource`表示系统的资源目录，一般存在系统的资源，类似于win下的`Program files`
3. `/usr/bin /usr/sbin`就是一般而言不是特别用到的，也不是启动时候需要用到的命令存在的地方。
4. `/usr/local`目录是系统管理员本机自行安装的软件（非distribution所带）安装的目录，所以其接口形式**和/usr目录基本一致，只不过是自行管理的软件所在位置**
5. `/etc`不需要说明了，配置位置。`/etc/init.d`是所有服务的默认启动脚本都在这里。
6. `/var`记录系统运行时候产生的cache，log，程序记录，lock等信息。

#### 文件，目录相关命令

为什么不在PATH变量中加入当前目录：

1. 可以执行的命令是变动的，不稳定。
2. 安全考虑。因为有些目录大家都可以写入，比如`/tmp`目录，那么如果有人在该目录中加入了常用命令同名的代码，那么用户很有可能就会在目录中运行，从而造成风险。

ls命令有几个参数了解：

1. -t 表示按照时间排序
2. -S 表示按照大小排序
3. -r 表示reverse结果
4. -R 表示递归解析结果

使用cp命令可以进行连接：

1. cp -l x x_hard_link
2. cp -s x x_soft_link

使用`basename`得到一个文件的最后文件名，使用`dirname`得到目录名。

在使用命令`less/more`的时候，使用**:f 可以得到当前流观看形式下文件名和所在的行号。**
    
文件记录的时间主要有下面几种：

1. atime：(access）文件被读取的时间。
2. ctime:（create,status）文件创建出来或者使用chmod改变文件权限时候的时间。
3. mtime: (modify)，修改的时间。

默认ls命令显示的是`mtime`，如果需要显示别的时间，使用：

    ls --time=atime
    ls --time=ctime
    
使用`touch`命令操作一个已经有的文件，会将文件的`mtime/atime`都进行修改，默认是修改为当前的时间。

文件的默认权限使用`umask`指令进行控制，默认的话很多系统的`umask`设置为`0022`，这个`umsk`数值表示的**不给的权限，或者理解为补运算**，也可以使用`umask -S`查看可以给的权限的形式。

需要注意的是，对于文件而言，默认是不给`x`权限的，对于文件夹而言，默认是给`x`权限的，这个和`umask`如何设置没有关系。比如`umask`设置的数值就是`0022`，那么对于文件而言，就是对于组和其他人都是只读，不可以写和运行。

文件还有一些特殊的属性，可以使用命令`chattr`指令进行修改，使用`lsattr`指令进行查看。
比如一个很屌的操作，将一个文件设置为**不能被修改，删除，链接**：
    
    # 其中i状态表示上面说到的功能。
    chattr +i xxx_file

使用`file`命令可以查看一个文件的信息，比如这个文件是数据文件，还是二进制文件，有没有使用到什么动态链接库之类。

查询一个可执行文件，使用`which`命令，这个命令会在**PATH变量中的可执行程序中**进行搜索。
所以有些情况下一些在`/usr/sbin`下面的内容就搜索不到，这个使用`whereis`指令，这个指令会在`updatedb`指令生成的数据库中查找**源代码，可执行程序，文档**的内容，这个时候就将搜索范围扩大了，如果只是希望查看源文件，使用：

    # -b表示搜索二进制文件
    whereis -b ls
    
和`whereis`类似的使用`locate`，但是`locate`是什么东西都查找的。

#### 文件和文件系统的压缩与打包

使用`tar`命令就几个注意点记住就可以了：

1. 压缩格式先设定：j表示bzip2，z表示gzip
2. 命令参数：c表示打包，x表示解包，t表示查看
3. 控制参数：v表示额外的信息显示，p表示保留原始数据的权限与属性，P表示保留据对路径（一般不要轻易设置），C表示设定解压缩的目录。
4. 如果需要解压缩特定的文件或者目录，将文件的描述信息放在命令的最后即可。

打个比分，使用`-C`参数设定解压缩的目录，如果这个目录不存在，需要提前设定，所以另外一个方式就是进入这个目录，然后执行解压缩的命令。

比如只将`etc/shadow`解压缩出来：

    tar -jxvf xxx.tar.bz2 etc/shadow

使用`--exclude`将某些文件不打包。

### 学习bash

#### bash的基本知识

最早的shell叫做`Bourne Shell(sh)`，linux中默认发行使用的是`bash`是`sh`的增强版本，也是基于GNU架构发展出来的。

shell中有很多的内置命令，使用`type`指令可以查看一个命令是不是内置的，还是alias，还是普通的执行指令。一定程度上这个`type`指令可以用作`which`来使用。

shell中如果是多行的命令，最后需要加入`\`指令，这个其实是对最后的Enter字符进行转义处理。

shell中的变量：

1. 变量中不能直接设置空格，如果有，需要使用引号括起来。
2. 使用`$name`，或者`${name}`的方式得到变量数值。
3. 使用**双引号**括起来的内容可以进行变量的解析，比如`test="my name is $name"`，但是使用单引号的就做不到变量的解析。
4. 使用`export`将变量的有效性扩展到子进程
5. 使用`unset`来删除一个变量。

使用`$(uname -r)`来得到指令的执行结果，当然也可以适应单「`」的方式来得到程序执行结果。

在shell中使用变量`?`表示最后一个程序执行的结果。

在shell中`环境变量`和`局部变量`的区别，如果是`环境变量`，那么就是全局的变量，就是在当前shell环境中有效的变量。

使用`env`命令可以得到当前的环境变量，使用`set`可以得到除了环境变量之外，还可以得到**用户自定义的变量**以及**bash系统自己用到的变量**

使用`export`可以将当前的变量变为环境变量。单独使用`export`指令就是显示当前的所有`环境变量`

使用`declare`可以定义变量，有几种有用的用法：

```bash
# 定义了一个全局变量，等价于调用export
declare -x sum

# 定义了一个int变量
declare -i sum=100+300+400

# 定义了一个readonly变量
declare -r sum=0
```
    
使用`dd`命令可以进行设备之间的拷贝，比如经常用来生成一个空的指定大小的文件:
    
    dd if=/dev/zero of=new_file bs=1M count=20
    
使用`ulimit`可以得到当前用户使用shell时候的限制，比如最大文件容量，最大进程数目，最大CPU时间等。

```bash
# 得到所有限制信息
ulimit -a 

# 得到最大文件大小
ulimit -f

# 设置最大文件大小
ulimit -f 100
```
    
在shell中使用逻辑表达式：（这些逻辑表达式还是很有用的简化了代码的编写，编写脚本的时候可以想到去使用这些组合逻辑）

```bash
# if A then B else C
A && B || C

# if A then C else B -> C
A || B && C
```
    
#### login shell | none-login shell | interactive shell | none-interactive shell

如果我们使用`用户名，密码`登陆系统的shell，那么得到的是`login shell`，或者使用`su -`得到的就是一个`login shell`，另外方式得到的是非login的形式。

其中，`login`的形式是比较完备的形式，表示用户是登陆之后得到的shell，设置的变量和环境也相对比较复杂和有效，启动顺序是：

1. 读取`/etc/profile`文件
2. 读取`/etc/profile.d/*.sh`中的所有文件
3. 读取用户自己的profile配置，顺序是`~/.bash_profile` > `~/.bash_login` > `~/.profile`
4. 现在系统的`~/.bash_profile`都是转而调用`~/.bashrc`
5. 现在系统的`~/.bashrc`中会调用`/etc/bashrc`

然后在退出的时候，会调用`~/.bash_logout`进行退出的脚本调用。

而非`login`的启动，则为：

1. 读取`~/.bashrc`，然后读取`/etc/bashrc`
2. 读取`/etc/profile.d/*.sh`中的内容。

所以有时候发现，在使用`su xxx`切换用户的时候，bash的`PS1`变量经常是不对的，就是因为这个时候读取的`none-login`的配置。

同时，默认情况下使用`bash`得到的是一个`none-login`的shell，而使用`bash --login`得到的就是`login`的。

我们在比较一下`interactive`的形式，如果我们在`GUI`的形式中启动shell，那么就是交互的。而在脚本中调用的`bash`则是`none-interactive`。两者区别就在于`interactive`的形式会分析`~/.bashrc`，而后者不会。(所以这就是为什么如果你需要使用bash执行一些定义在`.bashrc`中定义的alias的时候需要调用代码`bash -ic some-alias-defined-in-bashrc`，因为需要启动交互的bash模式）

至于为什么会有这些类型，个人认为就是**灵活**，不同的情况下需要的配置和设置是不一样的，进而影响了启动速度和运行速度。

[对于几种类型的说明][1]
[对于login和none-login分析的比较好][2]

使用`echo $0`可以看到当前是不是`login`的shell，如果是`-sh`表是是`login`的，如果是`sh`表示不是`login`的。

所以一般而言，我们主要是修改`~/.bashrc`文件，以及全局的脚本控制放在`/etc/profile.d/*.sh`中。

总结一下就是：

1. 如果默认的GUI登陆，是login的shell，那么会读取profile（包括系统的，和自己定义的），加上bashrc
2. 如果是直接调用bash得到的就是non-login的登陆，那么只会读取bashrc
3. GUI形式下都是interactive的形式（就是读取bashrc）
3. 如果是使用bash直接运行命令或者是脚本，那么就什么都不读

#### 数据流的重定向

我们`>`输出数据的时候是将其「正确的」数据放入到文件中，但是错误的数据还是在屏幕中，所以我们可以这样子设置：

    # 将2重定向到1，默认>就是表示1>
    find /home -name .bashrc > xxx.data 2>&1
    
    # 或者将所有的数据都定向到文件中
    find /home -name .bashrc &> xxx.data
    
同样的对于`>和>>`的区别在错误处理中也一样子使用`>> xxx.data 2>&1`

同样的，使用`<`可以用来将文件中内容放入到标注输入流中。

    cat > xxx.data < from.data
    
而使用`<<`表示结束输入标志：

    cat > xxx.data << "eof"
    
这样子在输入`eof`之后，输入就完成了。

使用`tee`命令可以有效的将数据流重定向到文件中，同时将流继续保持在标准输出中。

    last | tee last.list | cut -d " " -f1
    
有些情况下，一些命令输入的参数其实是「文件名」，但是我们可以使用`-`来使用**标准的输入输出流**来代替文件名。

    tar -jcvf - test/ | tar -xvf - -C newtest/
    
等价于将数据压缩然后输出到标准输出中，然后从标准输入中得到数据再解压缩到特定文件中（cp）
    
#### 使用正则表达式与文件的格式化处理

正则表达式这里不多介绍了，主要介绍在grep中的相关使用：

1. grep中默认是支持正则的，但是支持的有限，一些扩展的正则用法是不支持的。

2. 基础的正则包括：

    *   `^ $ . [list]`
    *   `[n1-n2] \{n, m\}`
    
3. 在bash中`()和{}`都有特殊的语义（解析表达式，已经解析变量），所以在使用的使用需要`\`进行转意。

4. 扩展的正则有：

    *   `+ ?`
    *   `逻辑或|`
    *   `逻辑组()`
    
5. 如果使用扩展的正则，需要使用`-E`参数，或者使用`egrep`来进行处理。

下面介绍一个非常NB的流编辑器`sed(stream editor)`。sed可以在字符流中对文件进行处理，包括增加，替换，删除等，主要在自动化的时候使用非常方便，试想你每次配置一个conf文件都需要使用`vim`来编辑一下是多么的痛苦，所以如果可以将相关的文本编辑操作编程特定的命令行可以自动执行就非常的方便了。

一般`sed`的处理流程是，读取一行，输出到屏幕中，然后处理一行，根据控制参数决定是否输出处理结果。

有几个主要的控制参数：

```bash
# -n 表示不输出匹配的行的默认输出，经常和p处理动作一起
sed -n 'p' /etc/passwd

# -i 对文件直接生效
# i动作表示插入，这里表示在第二行插入
sed -i '2i\hello world' test.data

# -e 表示使用多个操作使用
# a动作表示在添加，c表示修改
sed -e '2a\hello world' -e '3,$c\delete' test.data

# -r 表示使用原始的正则表达形式，比如`()`不需要转义处理
# 这里表示匹配到开头为test的行都替换为test，区别使用`-r`和不适用的区别
sed -r 's/^(test).*/\1/' test.data
sed 's/^\(test\).*/\1/' test.data

# 当然还有删除的动作
# 这里使用`/repr/`中表示匹配的行的正则，然后使用`d`动作进行删除，所以这里删除了所有开头为`#`的行
sed '/^#.*/d' test.data
```

更好的使用正则可以有效的在脚本中进行自动化处理，一个实例可以参考[sed的实例使用视频][3]

另外一个常用的工具是`awk`，这个工具主要用来进行字符的分割和处理。

如果我们使用`cut`来进行分割，只能得到特定的字段数据，但是如果将字段数据进行组合得到更加复杂的输出结果就可以使用`awk`了。

大致使用用法如下：

```bash
# 使用-F表示分隔符
# 这里使用了空格或者:进行分割
awk -F '[ :]' '{print $1}' /etc/passwd 

# 特定的变量，NF表示当前的字段总数，NR表示当前的行号，FS表示当前的分隔符
# 在`{}`中间记录当前的动作，如果是字符串使用双引号括起来
last -n 5 | awk '{print $1 "\t lines:" NR "\t columns:" NF}'

# awk有条件判断，语法为 awk '条件类型{动作1} 条件类型{动作2}'
# 这样子会将第三列小于10的行进行分割处理
awk '$3 < 10 {print $1 "\t" $3}' /etc/passwd

# 这样子只会处理第一行
awk 'NR==1 {print $1}' /etc/passwd
```

### shell script

如果是数值的运算，使用`$$(运算式)$$`的方式计算，比如`res=$(($a*$b))`.

script的执行方式有两种，一种使用子进程的方式，即使使用`bash`的方式进行执行，另外一种在当前进程中执行，使用`source`的方式。
所以每次使用`source .bashrc`的时候，会将当前设置直接有效在当前bash中。

在shell中可以使用`test`命令进行判断，有几个常用的判断：

```bash
# 是不是存在文件
test -e xxx.file

# 是不是有效的文件
test -f xxx.file

# 是不是目录
test -d xxx

# 数值的比较
test a -eq -ne -gt -ge -lt -le b

# 判断字符串是不是空
test -z string

# 逻辑表达式
test cond_a -a cond_b
test cond_a -o cond_b
test ! cond_a
```

另外一种使用`test`的方式就是使用`[]`方式，因为**中括号在很多地方，比如正则表达式中使用**，所以这里的语法是`[ cond_a ]`，在两边都留有**空格**

    [ -f xxxx ] && echo "file exist" || echo "file not exist"
    
在判断语句中，最好将**所有的变量都使用双引号括起来（标准写法）**，因为如果不使用，变量是使用**宏替换**的机制代入代码中，会导致**空格分隔问题**，比如：

    # 会报错，因为$a解析出来之后有空格
    a="a b"
    [ $a == "c" ]
    
    # right
    a="a b"
    [ "$a" == "c" ]

在bash编程中，对于变量的操作有几点：

1. 使用`$0`表示当前执行**程序名**，使用`$1 $2 $3`来表示后面的参数。
2. `$#`表示参数的个数。
3. `$@`表示所有参数的列表。
4. 使用`shift n`命令可以将`$@`中的参数进行左移动（就是pop掉n个参数）

#### 逻辑表达式 

##### if

需要留意语法中的`then`和结束`fi`

```bash
if [ -f xxxx ]; then
    echo "xxxx file exist"
fi

if [ -f xxxx ]; then
    echo "xxxx file exist"
elif [ -f other ]; then
    echo "other file exist"
fi
```

##### case

在`/etc/init.d/*.sh`中经常使用，我贴一个其中的代码：

```bash
# 几个注意的地方
# 1. 使用in的方式进行选择
# 2. 使用option）的方式进行参数选择
# 3. ;;进行结束
# 4. *) 表示最后的选择
# 5. esac 表示结束（case反过来）

case "$1" in
  start)
    load_modules || true
    log_begin_msg "Starting ACPI services..."
    start-stop-daemon --start --quiet --oknodo --exec "$ACPID" -- $OPTIONS
    log_end_msg $?
    ;;
  stop)
    log_begin_msg "Stopping ACPI services..."
    start-stop-daemon --stop --quiet --oknodo --retry 2 --exec "$ACPID"
    log_end_msg $?
    ;;
  restart)
    $0 stop
    sleep 1
    $0 start
    ;;
  reload|force-reload) 
    log_begin_msg "Reloading ACPI services..."
    start-stop-daemon --stop --signal 1 --exec "$ACPID"
    log_end_msg $?
    ;;
  status)
    status_of_proc "$ACPID" acpid
    ;;
  *)
    log_success_msg "Usage: /etc/init.d/acpid {start|stop|restart|reload|force-reload|status}"
    exit 1
esac
```

##### while

语法大致几个地方注意：

1. 使用`while do done`结构
2. 使用`[]`进行控制

```bash
s=0
i=0
while [ "$i" != 100 ]; do
    $i=$(($i+1))
    $s=$(($s+$i))
done
```

##### for

这个用法就有点多了，具体可以参考文档：[bash for example][4]

几个常见的用法：

```bash
# in的模式
# 将一个列表中元素得到
# id可以得到用户的id信息，finger可以得到用户shell，主目录等信息
for user in $(awk -F ':' '{print $1}' /etc/passwd); do
    id $user
    finger $user
done

# 可以直接对目录中文件和目录进行操作
cd ~
for file in *; do
    echo $file
done

# 指令目录（类似ls的语法）
for file in /etc/conf/[abcd]*.conf; do
    echo $file
done
    
# 范围还可以这样子玩
# 1 2 3 4 5 6 7 8 9 10
for i in $(seq 10);
    ...
done

# 1 2 3 4 5 6 7 8 9 10
for i in {1..10}; do
    ...
done

# 1 3 5 7 9 
for i in {1..10..2}; do
    ...
done
```

#### 调试

shell的调试可以使用`bash`的控制参数：

1. `-x` 运行命令的结果显示。
2. `-v` 同时显示命令。
3. `-n` 进行语法检测。

多数时候使用`-xv`进行调试分析。

### 例行性工作

例行性工作有两种：1）at  2）cron

前者是在特定的时间点下执行特定的命令，后者是定期执行特定的命令。

#### at

启动`at`需要启动`atd`服务，可以使用启动：

    /etc/init.d/atd restart
    
设置好之后就可以设置`at`命令了，大概用法有：

    # 显示当前的所有at命令
    at -l
    
    # 在特定时间执行特定的命令
    # 这里时间格式大致是：（时分）（月日）
    at 12:30 xxxx
    at 12:30 2015-09-30 xxx
    at 04pm March 17 xxx
    at 04pm + 5 minutes
    at now + 5 minutes/hours/days/weeks

对于用于的权限控制是通过文件`/etc/at.allow`和`/etc/at.deny`决定，如果前者文件有，只有在其中的用户可以执行，否则使用后者文件，将不再其中的去掉。默认是只有`/etc/at.deny`文件，这样开始时候所有用户都可以执行。

#### cron

执行例行性的工作，可以在特定的时间一直运行的任务。

控制权限类似`at`，使用`/etc/cron.allow`和`/etc/cron.deny`进行控制。

自己的例行任务使用`crontab`命令进行编辑（个人艺人cron表示例行任务，tab表示使用tab分割的任务语法，所以使用tab来命名吧），执行命令`crontab -e`就会打开编辑器编辑例行运行的命令：

      # 分    时  日  月  周  命令
      0     12  *   *   1   mail dmtasi -s "at 12:00"
      
      */5   *   *   *   *   xxxxx
      
      *     8-12    *   *   *   xxx
      
      *     8,9     *   *   *   xxx
      
上面的语法就是：

1. 在每个周一的12点发送邮件。
2. 使用`*`表示任意的时间。
3. 周1到周7分别使用[1-7]来表示。
4. 第二个命令表示每隔5min进行任务，使用语法`/x`的形式。
5. 也可以使用[a-b]的方式表示一段区间，或者使用[a,b]的方式表示可选的两个时间点。

若是希望在系统级别设置任务，就是编辑文件`/etc/crontab`，默认的该文件会在下面是几个目录中执行所有的脚本任务：

1. `/etc/cron.hourly`
2. `/etc/cron.daily`
3. `/etc/cron.weekly`
4. `/etc/cron.monthly`

当然含义就是在这些目录中的所有脚本会定期的执行，这个非常有用。比如系统会在每天的晚上的时候运行`/etc/cron.daily`的脚本，会定期将log进行rotate，会执行updatedb等等操作。

### 程序管理

#### 工作管理

在命令后面加入`&`可以将命令放入后台执行，但是注意，这个时候标准的输出还是在当前终端中，所以需要使用重定向，将输出的信息都重定向到别的地方。

    tar -zcvf xxx.tgz xxx/ > /dev/null 2>&1 &
    
使用`ctrl-z`可以将工作放入到后台进行**暂停**，然后使用`jobs`看到当前在后台的操作。我们可以将最新的后台命令放到前台来执行`fg`，当然然后可以继续使用`ctrl-z`放到后台暂停，如果希望将在后台的指令继续运行，使用`bg`指令。注意这里和`fg`的区别，`fg`是将后台指令放到前台执行，而`bg`是将后台指令在**后台**继续运行，所以有些命令没有将输出重定向的

后台的指令都有一个编号，可以使用`%n`的方式得到后台的任务，在`jobs`得到的结果中，可以看到有`+和-`的两个描述符，最新的使用使用`+`表示，也是默认使用`fg/bg`调用的任务，也可以使用`fg -`来调用倒数第二个任务。

使用kill任务可以删除后台任务，比如使用：

    kill -9 %1
    
一般的signal有下面几种：

    1）1：表示重新读取一次参数的配置文件。
    2）9：立刻强制删除一个工作。
    3）15：正常的方式结束。
    
参数15表示比较正常的结束。

当然如果希望程序在logout之后也可以继续运行，就是使用`nohup`命令了

    nohup xxx > xxx.txt 2>&1 &
    
#### 进程管理

ps命令主要使用的两个命令：

1. `ps aux`
2. `ps -lA`
3. `pstree -Aup` 如果希望得到进程树的信息，使用`pstree`命令。
    
参看当前运行的动态信息，使用`top`指令：

    # 得到当前的进程
    top -p 12345
    
    # 得到特定用户
    top -u hzjiangjinzheng
    
    # 得到详细的参数信息
    top -c
    
在top命令中，需要注意的是：

1. `load average` 记录了cpu在1，5，15分钟的平均运行进程数目，这里需要CPU的个数进行对比分析。
2. `PR` 表示进程的执行优先级，数值越小优先级越高。
3. `NI` 表示系统的nice数据，用户可以动态调整的，同样当前进程的优先级计算等于`PR + NI`方式，`NI`的数值范围是`[-20, 19]`。可以通过`renice`指令进行调整。

如果需要更多的关注当前内存的使用情况，使用命令：

    free -m
    
使用`k|m|g`来调整内存的计算单位。

使用`uname`可以当前系统的各种信息。

使用`uptime`可以得到当前系统**1）已经启动运行的时间 2）当前的load average**

使用`netstat`进行网络监控信息，比较常用的命令是：

    # t表示tcp的连接
    # n表示列出端口号码
    # l表示正在listen的服务
    # p表示列出进程的PID
    netstat -ntlp
    
使用`lsof`列出被进程所打开的文件名。

### misc

几个有意思的命令：

1.  bc   计算器
2.  date 得到当前的日期

    使用`date --date='@123456`可以得到将ts转换为日期的格式（mac中好像没有改效果）
    
3.  cal  显示日历

使用`man`指令，有几个别称
    
    # 查询xxx指令，等价于`whatis xxx`
    man -f xxx
    
    # 查询**包含xxx**的指令，等价于`aprpos xxx`
    man -k xxx
    
关机有几种方式：

    # 10min之后关机
    shutdown -h +10 
    
    # 特定时间
    shutdown -h 20:25
    
    # 立刻关机
    shutdown -h now
    
    # 切换执行等级，0表示关机，6表示重启
    init 0
    init 6

使用`paste`命令可以将多个字段合并为一个，有点类似vim中的`J`命令：

    # 使用-d表示分隔符，最后得到结果是所有用户名都变为一行，然后使用逗号进行分割
    cat /etc/passwd | cut -d ':' -f1 | paste -s -d ','

变量可以进行**default**的语义操作，比如：

    # 如果test进行设置，那么test就是test，否则使用default_value代替
    test=${test-default_value}
    
    # 如果空字符串也认为没有定义的话
    test=${test:-default_value}
    
--------

  [1]: http://www.cnblogs.com/qcly/p/3273373.html
  [2]: http://howtolamp.com/articles/difference-between-login-and-non-login-shell/
  [3]: http://www.jikexueyuan.com/course/2020_5.html?ss=2
  [4]: http://www.thegeekstuff.com/2011/07/bash-for-loop-examples/
