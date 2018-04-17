---
date: 2018/3/24 10:27:54
tags: [算法,技术面试,读书笔记]
title: 《编程之美》读书笔记
---

2014年我研究生毕业找工作时候认认真真看了一遍[编程之美](https://book.douban.com/subject/3004255/)，刚好这段时间整理自己以前写的东西，就将当时的学习笔记整理成文。

<!--more-->

## 让CPU占用率曲线听你的指挥

1. 合理的使用win api来控制时间
2. 使用while循环不停的查询当前的时间，然后控制sleep的时间，从而达到
控制时间利用率的方式。

## 中国象棋将帅问题

1. 当一个问题的状态非常有限的时候，可以想到用编码的方式来表示所有的解。
2. 同时，使用位运算的方式来对所有的编码数据进行分析

比如这里下棋问题，将的位置只有9个，所以如果用4bit的数字就可以编码表示，
如果需要考虑两个状态，那么只需要8bit的数据就可以了。

如何使用位运算得到下一个状态，一个简单的方法：

```C++
// 得到b当前的数值，然后加一数据，用位运算或的方式，设置b的数值
set(b, get(b) + 1)
```

## 翻转烙饼问题

这是一个深度搜索的方法，重点在于如何有效的控制搜索的逻辑。

下面代码是一个搜索流程框架：

```C++
void search(int cur_step)
{
    if(finished()) {
        // 很关键，需要和当前最大的step比较，如果超过了当前最大的step
        // 那么不需要进行保存
        if(cur_step < max_step) {
            max_step = cur_step;
            保存当前状态；
            return;
        }
    }

    // 没有结束，但是当前已经不可能得到最好的结果了
    // 其中lower_bound表示当前搜索的下界
    if(cur_step + lower_bound() > max_step)
        return;

    for(当前所有的可能解) {
        执行当前的操作;
        search(cur_step + 1);
        反向执行当前的操作;
    }
}
```

max_step初始值表示为upper_bound表示搜索的上届，可以用一个最简单暴力的方式
的数值来表示.如果一个非常naive的方法可以得到的数值作为upper_bound，
那么深度搜索如果没有得到比naive更好的结果, 就不需要搜索了. (这是一种计算上
界的方式)

lower_bound也非常的关键，如果当前的一个格局下至少需要的step数目是知道的，那么
就可以在当前的状态下直接判断出是否可以达到最优解，否则的话直接剪枝操作。

这里给出的计算lower_bound的思路何有启示性：如果相邻的烙饼的数值不是相邻的，
那么表示至少需要一次翻转。对于排序的东西而言，就是将无序变为有序的过程，所以
相邻元素之间如果不是相邻的（大一个数值和小一个数值都算ok），那么至少需要
一次的翻转。

搜索还有一种提高速度的方法，就是将当前格局结果进行保存，如果需要保存格局:

1. 将格局按照进行编码，比如这里可以将当前格局下烙饼的序号表示成一个字符串作为map的key键值.
2. 代码也需要进行改变用来保存当前格局下**最好的**格局step数目.

```C++
// 需要加上一个返回值，表示当前search可以得到的最好结果。
int search(int cur_step)
{
    if（当前格局已经计算过了)
        return num;

    int step = 0;
    if(finished()) {
        // 很关键，需要和当前最大的step比较，如果超过了当前最大的step
        // 那么不需要进行保存
        if(cur_step < max_step) {
            max_step = cur_step;
            保存当前状态；
            step = 0;   // 表示当前的状态下只需要0次就可以完成任务
            goto end;
        }
    }

    // 没有结束，但是当前已经不可能得到最好的结果了
    // 其中lower_bound表示当前搜索的下界
    // 如果没有办法得到有效的结果，那么使用最大值表示没有任何价值的step
    if(cur_step + lower_bound() > max_step) {
        step = MAX_INT;
        goto end;
    }

    int max_sub_search = -1;
    for(当前所有的可能解) {
        执行当前的操作;
        int step = search(cur_step + 1);
        max_sub_search = min(step, max_sub_search);
        反向执行当前的操作;
    }

    // 表示比子节点的最好step加1表示成当前任务需要的step数据
    step = (max_sub_search == MAX_INT) ? MAX_INT : max_sub_search + 1;

    :end
    保存当前格局step数据为step变量
    return step;
}
```

## 买书问题

这里主要学习到的是: 如何进行动态规划的等价转换。

比如这里对于买不同的五种书问题，假设F(A1,A2,A3,A4,A5)表示为买第 `i` 种书 `Ai` 数量时候的最优价格，
那么由于不同的五种书的价格是一样的，所以在A1-A5出现的数量集合固定的时候，不论A1-A5如何进行排列，都是相同的数值，所以这里用到了第一种等价：

**所有的结果都可以等同于一种结果，用 A1>=A2>=A3>=A4>=A5 的形式来表示。**

第二个等价问题，如果出现了买4套书的情况，可能出现的各种选择中，也是等价的。
就是F(A1-1,A2-1,A3-1,A4-1,A5)等价于F(A1-1,A2-1,A3-1,A4,A5-1)，这个可以用
一种假设的方式证明：

如果出现了A的状况，那么可以通过适当的转换表示B和A可以得到同样的结果，那么
就可以说明，每次按照B的方式来获取都是通用的。


## 快速找出故障的机器

本质上属于寻找不变量的问题，在一堆的数据中寻找丢失的数字，那么这个数字可以用不变量的
思想来解决。

**预先计算好所有数据的总和，如果其中一个数据缺失了，那么用当前的总和和之前的
总和进行相减就得到了去掉的数值。**

如果有多个数值呢： **那么在加入一个不变量，比如可以保存所有数据的平方和。**


## 饮料供货问题

这是一个典型的DP问题，一个很重要的启示：

DP问题是有**排序**的概念，比如这里使用多个数据进行旋转，需要将买的物品进行排号，
按照次序的顺序选择，但选择第i个情况表示的是从第一个物品到第i个物品之间的所有
的情况，这样子就可以顺成的记录下所有的情况下物品旋转情况。

解决DP问题的两种思路：

1. 填表的方式，因为DP是按照一定的下表顺序进行，所以按照下表的方式来计算，只用循环
就可以得到正确的结果，甚至是使用滚动数组的方式来减小空间实用率。
2. 备忘录方法

这种方式本质上就是填表，但是使用递归的方式来实现，在递归调用的时候，填写表格，
同时更新表格的状态，如果以后的递归中发现表格已有数据，就直接返回。

一种大致的结构：

```C++
cal_max(int n) {

    if(当前状态已经存在)
        发回当前状态下最优值

    int max = -1;
    for(all_sub) {
        计算所有子递归，得到子递归的最优值max
        temp = cal_max(n+1);
        max = max(max, temp);
    }

    // 做了两个事情，一个保存当前状态，一个返回当前最优的数值
    return g_map[当前状态] = max;
}
```

但这里更加nb的地方在于直接使用题目的特殊条件：所有的饮料的容量都是2的幂数。
基于二进制的表示可以直接从二进制分解的角度来考虑。每一2的幂数的饮料都可以通过
别的低一阶的幂容量的饮料来混合。

### wrap up

1. 单纯的搜索dfs, 时间复杂度是指数级别.
2. 使用备忘录方法的搜索dfs, 需要:
    - 当前的dfs可以方便的保存当前的搜索状态.
    - dfs过程中子结构之间具有独立性. 比如给定一定的条件, 子结构计算结果是唯一的,
    不会因为当前dfs的选择而影响了计算子结构的最优结果. (比如有的计算, 当前决策选择
    了x, 那么其子结构的最优解也需要受到x的影响, 那么x也是影响子决策的, 这样子dfs不是
    独立的)

如果符合上面的要求, 一般就可以表示为DP的方法, 两者是同质的, 只是呈现的计算形式不同而已.

搜索, 最值的题目想到使用三种计算方式:

- DP
- 备忘录
- dfs

## 小飞的电梯调度算法

电梯的调度问题看似一个复杂的问题，但在其中包含了一层线性的关系。
可以先从分析两个楼层开始，如果选择楼层A和楼层B，那么可以比较出在什么情况下选择
楼层A，在什么情况下选择楼层B，而这种线性的选择又是顺序的，就是一旦确定了一种选择，
那么下一种的选择也同样可以线性的判断，**该问题具有连续性**

所以，算法就简单了，使用既定的准则依次判断，如果B优于A，将电梯不停向上走，否则停止。

## 高校的安排见面会

建立合适的图模型非常的nb，这里如果由一个同学需要同时看到两个见面会，那么对应的见面
会就不可以安排在一起，如果将见面会看做是两个顶点的话，那么顶点之间的连线就表示两个顶点
之间不能同时被安排，这就转换为了**最小着色问题**，最小着色问题的一种启发式解决方法：

尝试使用K中颜色，从K为1开始逐渐增大，直到一种可行解为止。

同时这里扩展问题中给出的时间安排是一系列的区间，区间的问题就比较特殊，当然也可以用
图模型求解，但是区间是一种线性概念，可以使用贪心的方式求解。

这里转化为了两个问题：

1.  如果需要知道什么场合安排在什么位置，就是使用什么颜色，按照贪心的策略，将开始的
时间从小到大排序，然后依次看使用什么颜色即可。
2.  如果只是需要知道需要安排多少的场合，就转换为多个区间时间求解最大overrlap数量
的问题，可以将所有的时间进行排序，如果进入了一个开始时间，那么ovverlap区域数量加一，
如果进入了一个结束时间，那么overlap数量减一。


## 多线程高效下载问题

使用两个线程，一个负责读取，一个负责写入，这里是一个典型的读写问题，需要使用到信号量，
一个表示是否还有空闲区间的信号量，一个表示是否还有读取空间的信号量，实现的时候几点：

1.  两个信号量交替这在一个线程中使用
2.  线程多写成while(true)的形式，在while循环中感觉一定的逻辑判断是否需要停止计算。
3.  缓冲区由于是使用"顺序写入顺序读取的方式",可以使用循环队列。
4.  信号量没有循环之说，只有信号数量之说。

大体的程序如下：

```C++
const int BUFFER_COUNT = 300;
block g_buffer[BUFFER_COUNT]

Thread g_threadA(ProcA);
Thread g_threadB(ProcB);

Semaphore g_seFull(0, BUFFER_COUNT);
Semaphore g_seEmpty(BUFFER_COUNT, BUFFER_COUNT);

bool g_complete = false;
int in_index = 0;
int out_index = 0;

void main() {
    g_complete = false;
    g_threadA.Start();
    g_threadB.Start();
    join_all(g_threadA, g_threadB);
}

// 写入进程
void ProcA() {
    while(true) {
        // 看是否有可以写入的empty信号量
        g_seEmpty.Unsignal();
        g_complete = GetBlockFromNet(g_buffer + in_index);

        // 改变读取数据位置的index
        in_index = (in_index + 1) % BUFFER_COUNT;

        // vip,说明当前写入了一个数据，可以读取了
        g_seFull.Signal();

        if(g_complete)
            return;
    }
}

// 读取进程
void procB() {
    while (true) {
        // 读取进程则是看是否还有buffer可以读取
        g_seFull.UnSignal();

        WriteBlockToFile(g_buffer + out_index);
        out_index = (out_index + 1) % BUFFER_COUNT;

        g_seEmpty.Signal();

        // vip : 判断如果下载结束，同时还需要说明将所有数据都读取了为止
        if(g_complete && in_index == out_index)
            return;
    }
}
```

## 拈石头游戏

### 题目1

两人的游戏考虑使用对称的想法，对称在数值上可以考虑使用**二进制的表示**，
因为单独的一个数据你看不到对称的东西，如果转换到**二进制上面，只有0和1**，
就可以方便的看到一个数据再某一个位置上面是否由其中一个数值。

这里有一个结论：

```python
1.  如果一堆数据xor(m1, m2, m3.., mn)==0 那么可以改变一个数字使得
xor(m1, m2, m3, ... mn) != 0
2.  如果一堆数据xor(m1, m2, m3.., mn) != 0 那么可以改变一个数字使得
xor(m1, m2, m3, ... mn) == 0
```

一旦得到xor为零的情况，那么先取的人不论选择什么，后选的人都可以对称的选择，
最后的结果就是后选的人必然在最后去光所有的元素。

这里如何计算使得xor!=0的情况变为xor==0的情况：

```python
1.  res = xor(m1, m2, m3... mn);
2.  计算最大值 m_max = max(m1, m2, ... mn);
3.  m_max = m_max ^ res
```

对于上面的计算，就是将res中对应1的部分在mi中的某一位上改变，可能是将mi中的某
一位的1变为了0（该二进制上1去掉，这个就是直接拿掉该元素即可），同时也可能将
mi中的某一位的0变为1。

比如：

```python
1001
0010
----
1011
```

那么需要将1001的第一个1变为0，第4个1变为0，同时第三个0变为1.
这就是直接和异或的结果再异或的结果，异或运算有表示减法的逻辑功能。

这里一定要选择最大的元素，因为去掉1是没有问题的，但是将0变为1却可能将数值变大。
如果选择最大的元素，那么res中最大位的1一定处在这个元素上，将最大的1去掉，后面
的0再变为1就不会导致最后的数字是增大的。

### 题目2

如果存在两堆的石头，每人每次只可以在两堆石头中各取出数量相同的石头，或者
仅从一堆石头中取出任意数量的石头，最后将石头一次拿光的人获胜。

这种格局问题都可以采用一种**选择**的方式来去掉那些不符合要求的格局：

```python
1.  假设一个格局(m,n)对于第一个选择的人而言必胜，那么叫做必胜的格局
2.  同理，如果一个格局(m,n)对于第一个选择的人而言必输，那么叫做必输的格局
3.  如果一个格局通过一种转换就可以得到一个必输的格局，那么该格局为必胜格局
4.  如果一个格局通过任何的转换都是得到必胜格局，那么该格局即使必输的格局。
```

从概率上来说，必胜格局更多一些，因为一旦得到一个必输的格局，那么所有可以一次转换
得到该格局的状态都叫做必胜的格局。但是一个必输格局，必须所有状态转换之后都是
胜利的格局才可以。

所以这里采用一种从简单分析的方法，首先所有的（n,n)状态都是必胜的格局，所以
可以去掉（1,1），（2,2），（3,3）等，下面的格局就是（1,2）这里用到一个假设，
由于相同的状态下没有顺序，所以 (a,b) 和 (b,a) 是一样的，所以一致假设a<b.

那么分析（1,2）是一种必输的格局，从而引出了(1,n)(2,n)(1+n,2+n)都是必胜的格局（因为都可以
通过一次操作得到（1,2）的格局），那么分析下一个没有被选择掉的格局就是（3,5），
分析得到这个也是一个必输的格局（没有被选择掉的都是必输的格局），于是（3,n)(5,n)(3+n,5+n)
的所有状态都是安全的，下一个就是（4,7）

(对称的考虑, 在还原到具体情况下也需要变为对称)

这样可以得到一个结论，如果一个局面（a,b)可以由下面的定义得到，那么就是一个必输格局，否则必胜。

```python
1.  a1 = 1, b1= 2
2.  如果a1,a2,..an-1,bn-1都已经求得，则定义an为这2n-2个数中最小的整数。
3.  bn = an + n
```

也可以看到（a,b) 构成的所有集合是一个对于2n个数的划分，使用下面的数学方法：

```python
1.  如果无理数  1/a + 1/b = 1，则 [a*n] 和 [b*n] 构成N的划分，其中n=1,2,3...N，[x]表示对x向下取整。
2.  因为 bn = an + n，所以有 [b*n] = [a*n] + n = [(a+1)*n]，因为对于所有
的n都成立，所以b=a+1
3.  求解
    1/a + 1/b = 1
    b = a + 1
得到a和b，代入计算就可以得到所有的危险格局了。
```

## 连连看游戏

本质是求解如何计算相同图像之间的最短路径。不同在于，这里的最短路径使用最短转弯
数目来表示。

使用广度优先搜索的方法来计算：

```C++
1.  将从A节点可以一次转弯到达的节点放入队列Q中
2.  从Q中取出所有元素，将其二次转弯可以得到的节点放入Q中，同时去掉已经处理过的节点
3.  重复2的过程直到找到节点，或者判定为没有办法可达为止（比如连连看最多是3次转弯）
```

去掉处理过的节点有两种方式：

```C++
1.  使用节点访问表格，如果一个节点已经到达过了，那么记录该节点已经使用，
在放入到Q中的时候，如果已经达到，那么就不用放入。

2.  还有一种通过距离最小的方式来判断的过程。如果一个格子在之前的判断中
已经处理过，假设最小crossing为1，那么之后在处理到该格子的时候，比如crossing是
要更大的，那么只需要通过设置crossing为最小值就可以：

    // 初始设置min_crossing为无穷大
    // 如果当前的数值比当前最小的要小，说明当前的计算更好，也说明这个数据没有
    // 在之前处理过，才会将数据放入。
    if(cur_crossing < min_crossing(cur_point)) {
        min_crossing(cur_point) = cur_crossing;
        Q.enqueue(cur_point);
    }

3.  通过这样子的逻辑判断，就不会出现同一个元素处理多次的情况。为如果一个元素
在较早的crossing数值的时候放入到Q中，那么之后再转到该元素的时候，crossing
一定是更大了，一比较，就知道之前遇到了，所以不会关心最小的crossing，而是
直接加入到Q中。
```

还有一个关键问题，在同样的crossing的情况下，如何保证最小的连线路径，这里
使用同样的方式，使用两个数据来记录最小值，一个是表示最小的crossing数值，
一个表示最小的dist数值：

```C++
// 这里假设当前的节点从X一次连线到Y
// 如果从X出发更加的好于Y之前得到的crossing结果，那么更新crossing数据
// 这里相等的情况下也考虑，因为相同还需要考虑min_dist
if(min_crossing(X) + 1 <= min_crossing(Y)) {
    min_crossing(Y) = min_crossing(X) + 1;
    if(min_dist(X) + dist(X, Y) <　min_dist(Y)) {
        min_dist(Y) = min_dist(X) + dist(X, Y);
    }
}
```

这种动态更新记录的方式表示: 遍历到第i次最多通过i节点的连接可达的最小距离.

## 构造数独

构造数独使用**深度优先搜索的方法**来解决。

1.  首先对第一个可能的位置的所有情况遍历，如果当前点还有任何的可以放置的数字，
那么选择该数字，同时进行下一个点的放置。
2.  如果当前点没有任何可以放置的数字，那么取消当前点的所有内容（比如清空
当前放置数字），然后回溯到上一个节点上继续进行处理。
3.  直到所有数字都处理完成为止。

深度优先搜索比较直观的方式使用递归加以实现：

```C++
bool f(int n) {
    for(所有可能情况） {
        if(f(n+1))
            return;
    }

    // 如果没有一种情况可以成立
    clear_cur_state();

    // 表示当前无法得到有效结果，回溯到上一层处理流程
    return false;
}
```

一般使用递归的地方方便在于，如果当前的状态不可以得到有效结果，直接返回，
程序就返回到上一层处理逻辑中，达到回溯的效果。

如果我们可以直接知道第n层和第n+1层处理之间的关系，就可以不适用递归，而是直接
使用循环的方式，比如这里计算n+1层就是表示处理下一个点，对于9*9的数独而言，就是
按照行排序的方式计算下一个点，但下一个点不能处理的时候，可以得到上一个计算
点的位置（这个是重点，回溯可以直接计算出第n层计算的信息，这样子就不用使用递归
的栈来保存信息，提高了速度和内存使用）

比如这里的一个控制代码：

```C++
bool build()
{
    init();

    int cur_x = 0, cur_y = 0;
    while (true)
    {
        int num = get_next_valid_number(cur_x, cur_y);
        if (num == INVALID)
        {
            get_previous_point(cur_x, cur_y);   //可以直接回到之前处理的状态
            if (cur_x < 0 || cur_y < 0)
                return false;
            continue;
        }

        matrix[cur_x][cur_y] = num;
        if (cur_x == MAX_SIZE - 1 && cur_y == MAX_SIZE - 1)
            return true;

        get_next_point(cur_x, cur_y);
    }

    return false;
}
```

这里需要注意的是，需要手动的回到之前的状态，以及处理好当前的状态。

一个完整的代码：

```C++
const int MAX_SIZE = 9;
const int INVALID = -1;
int matrix[MAX_SIZE][MAX_SIZE];
vector<bool> value_list[MAX_SIZE][MAX_SIZE];

void clear_select(vector<bool> &v) {
    v.resize(9);
    for (int i = 0; i < 9; ++i)
    {
        v[i] = true;
    }
}

void init()
{
    std::vector<bool> v;
    clear_select(v);

    for (int i = 0; i < MAX_SIZE; ++i)
    {
        for (int j = 0; j < MAX_SIZE; ++j)
        {
            matrix[i][j] = INVALID;
            value_list[i][j] = v;
        }
    }
}

int get_next_valid_number(int cur_x, int cur_y)
{
    auto& vec = value_list[cur_x][cur_y];
    for (int i = 0; i < cur_y; ++i)
    {
        vec[matrix[cur_x][i]] = false;
    }

    for (int i = 0; i < cur_x; ++i)
    {
        vec[matrix[i][cur_y]] = false;
    }

    int row = cur_x/3*3, col = cur_y/3*3;

    for (int i = row; i < cur_x; ++i)
    {
        vec[matrix[i][col]] = false;
        vec[matrix[i][col+1]] = false;
        vec[matrix[i][col+2]] = false;
    }

    for (int i = col; i < cur_y; ++i)
    {
        vec[matrix[cur_x][i]] = false;
    }

    vector<int> good_selection;
    for (int i = 0; i < vec.size(); ++i)
    {
        if(vec[i]) {
            good_selection.push_back(i);
        }
    }

    if(good_selection.size() > 0)
        return good_selection[rand() % good_selection.size()];

    return INVALID;
}

void get_next_point(int& cur_x, int& cur_y) {
    int num = matrix[cur_x][cur_y];
    value_list[cur_x][cur_y][num] = false;

    ++cur_y;
    if(cur_y == MAX_SIZE) {
        ++cur_x;
        cur_y = 0;
    }
}

void get_previous_point(int& cur_x, int& cur_y) {
    matrix[cur_x][cur_y] = INVALID;
    clear_select(value_list[cur_x][cur_y]);

    --cur_y;
    if(cur_y == -1) {
        cur_y = MAX_SIZE-1;
        --cur_x;
    }
}

bool build()
{
    init();

    int cur_x = 0, cur_y = 0;
    while (true)
    {
        int num = get_next_valid_number(cur_x, cur_y);
        if (num == INVALID)
        {
            get_previous_point(cur_x, cur_y);
            if (cur_x < 0 || cur_y < 0)
                return false;
            continue;
        }

        matrix[cur_x][cur_y] = num;
        if (cur_x == MAX_SIZE - 1 && cur_y == MAX_SIZE - 1)
            return true;

        get_next_point(cur_x, cur_y);
    }

    return false;
}

void print_matrix() {
    for (int i = 0; i < MAX_SIZE; ++i)
    {
        for (int j = 0; j < MAX_SIZE; ++j)
        {
            cout << matrix[i][j] << " ";
        }
        cout << endl;
    }
}

int main()
{
    srand(time(NULL));
    if(build())
        print_matrix();
    return 0;
}
```

## 24点游戏

题目描述：给出四个数字，计算是否可以得到一种运算方式使得最后的运算结果为24

对于解空间搜索问题，有几种思路：

1.  暴力搜索，将所有可能的情况都分析一遍
2.  将解空间划分为更小的解空间，然后在分析完更小的解空间之后，将子空间的结果
和当前空间结果联合考虑。
3.  为了减小搜索的效率，需要将搜索的空间进行保存，一旦一个空间状态之前运算过，
那么直接取得结果即可。一般使用hash或者编码的方式对空间状态进行保存。

这里，使用一种划分的方式，其实划分搜索也是一种暴力的解空间搜索，但是通过划分
的方式比暴力的方式更加容易写出递归的代码，而暴力的方式需要写循环需要对所有
情况进行考虑，不一定非常好写。

类似于归并排序的思想，计算一个集合的所有可能运算结果可以表示为两个子集
各自的结果，然后合并两个集合的结果，过程为：

1.  考虑一个集合S，如果将当前集合分解为两个真子集S1和S2，S1和S2构成S的一个划分。
2.  分别计算S1和S2可以得到的所有运算结果的集合。
3.  对S1和S2中每一个元素分别进行运算（通过加减乘除），得到集合S中可以得到的所有
运算结果集合。

最最VIP的地方来了，如何来表示集合和子集合的概念。这里使用编码的方式，因为对应
的4个数字最多的组合方式也就是2^4种，而一旦表示为二进制编码的方式，集合的概念显得
非常方便。

比如考虑`1011`，表示取第一个，第二个，和第四个元素对应集合，那么其真子集的编码为
`0001 0010 0011 1000 1001 1010 1011`，发现下面规律：

1.  所有真子集的编码都比当前编码要小。
2.  所有的子集编码表示为 `j`，当前集合表示为 `i`，有 `i & j == j`，同时对应的划分的另外
一个集合为`（i-j）` (这个真心nb!)

因为子集的编码更小，所以计算过程直接从小到大的计算，当前编码对应集合的所有子集
在之前的计算过程中都计算过了。

这个二进制表示的编码强大就在此。一方面可以直接计算得到当前的编码，一方面将搜索结果进行了保存。

为了表示对应的表达式结果，在集合的归并过程中，同时保存一份字符串形式的结果表达式，代码如下：

```C++
const int N = 4;
const int NumOfResult = 24;
int g_source[N];
const int TotalCount = (1 << N);

/**
 * 1.   double表示key的键值可以计算出小数，比如9*(2+6/9)，如果使用int就得不到该结果
 * 2.   ResStr的比较使用了string的结果，这样一个集合中只有不同的结果表达式，但可得到多个相同结果
 * 下不同表达式
 * 3.   如果使用key来比较，那么一个集合中只有一个对应key的表达式
 */
struct ResStr
{
    double key;
    string res;

    ResStr(double _key, string _res) : key(_key), res(_res) {}

    friend bool operator< (const ResStr &lhs, const ResStr &rhs)
    {
        // return lhs.key < rhs.key;
        return lhs.res < rhs.res;
    }
};

/**
 * 用来表示结果的集合类型
 */
typedef set<ResStr> ResStrCollection;
ResStrCollection g_result[TotalCount];

bool input_data(ifstream &fin)
{
    for (int i = 0; i < N; ++i)
    {
        fin >> g_source[i];
    }

    return fin.good();
}

inline string int2str(int i)
{
    static char buffer[64];
    _itoa_s(i, buffer, 64, 10);
    return string(buffer);
}

void init()
{
    for (int i = 0; i < TotalCount; ++i)
    {
        g_result[i].clear();
    }

    for (int i = 0; i < N; ++i)
    {
        g_result[1 << i].insert(ResStr(g_source[i], int2str(g_source[i])));
    }
}

bool find_plus_or_minus(const string &str)
{
    for (int i = 0; i < str.size(); ++i)
    {
        if (str[i] == '-' || str[i] == '+')
            return true;
    }

    return false;
}

ResStrCollection get_merge_res(const ResStrCollection a, const ResStrCollection b)
{
    ResStrCollection res;
    for (auto aa : a)
    {
        double a_key = aa.key;
        string a_str = aa.res;

        for (auto bb : b)
        {
            double b_key = bb.key;
            string b_str = bb.res;

            /**
             * 这里使用了一些优化结果样式的技巧
             * 1.   如果是相加，那么不会影响结果的样式，不需要括号也可以得到结果
             * 2.   对于相减，相乘，相除在结合的时候都可能改变结合性，而改变结合性的条件
             * 都是当表达式中有'+-'的时候
             * 减对于结果的影响在于，会改变子表达式中的正负号：
             *  9-(3-6) 如果不加括号，变为了9-3-6
             *  乘法除法改变在于改变了结合性：
             *  (1+2)*3 如果不加括号，变为 1+2*3
             */
            res.insert(ResStr(a_key + b_key, a_str + '+' + b_str));

            string wrap_a = a_str, wrap_b = b_str;
            if (find_plus_or_minus(a_str))
                wrap_a = '(' + wrap_a + ')';
            if (find_plus_or_minus(b_str))
                wrap_b = '(' + wrap_b + ')';

            res.insert(ResStr(a_key - b_key, wrap_a + '-' + wrap_b));
            res.insert(ResStr(b_key - a_key, wrap_b + '-' + wrap_a));
            res.insert(ResStr(a_key * b_key, wrap_a + '*' + wrap_b));

            if (b_key != 0)
                res.insert(ResStr(a_key / b_key, wrap_a  + '/' + wrap_b));
            if (a_key != 0)
                res.insert(ResStr(b_key / a_key, wrap_b + '/' + wrap_a));
        }
    }

    return res;
}

int main(int argc, char const *argv[])
{
    ifstream fin("input.txt");
    if (!fin.is_open())
        return EXIT_FAILURE;

    while (input_data(fin))
    {
        init();

        for (int i = 1; i < (1 << N); i++)
        {
            // 集合具有对称的性质，所以只需要取到i/2之前的j和对应的i-j即可
            // 如果取超过i/2的j也是可以的，但是会重复计算
            // 比如1011表示的j可以取得 `1010 0001` `1001 0010` `1000 0011`
            // 如果j取得小于i/2得到就是0001 1010之类和上面重复
            for (int j = i - 1; j >= (i / 2); --j)
            {
                if ((j & i) == j)  // is a subset
                {
                    auto res = get_merge_res(g_result[j], g_result[i - j]);
                    g_result[i].insert(res.begin(), res.end());
                }
            }
        }

        // check result
        int count = 0;
        for (auto ite = g_result[15].begin(); ite != g_result[15].end(); ++ite)
        {
            if (ite->key == NumOfResult)
            {
                cout << "result is : " << ite->res << endl;
                ++count;
            }
        }

        if (count == 0)
            cerr << "can't find a solution to " << NumOfResult << endl;
    }

    return EXIT_FAILURE;
}
```


## 不要被阶层吓到

### 判断N!中末尾0的个数

从分析哪些数字出现会导致0这个角度来分析。对于大数的考虑则可以想到使用质因数分解：

```
一个数值n = 2^n1 * 3^n2 * 5^n3 ...
```

如果可以在尾巴出现0，那么一定是出现了2和5，不难分析出一定是5的个数小于2的个数。
所以结果变为分析出n!中5的个数。

从1到n，每5个数就会出现一个5，同样没25个数字，由于存在了5^5的情况，所以没25个
数又会在之前计算的基础上增加一个5，所以n!中所有5的个数为：

```
sum of 5 = [n/5] + [n/25] + [n/125] + ..[n/5^m]
```

所以代码非常简单，每次计算出除以5的结果，然后在将n除掉5作为下一次循环的初值

```
// [n/25] = [n/5] / 5
int ret = 0;
while(n) {
    ret += (n /= 5);
}
return ret;
```

### 判断N!最后一个二进制1所在的位置

假设一个数为m，可以表示为：

```
m = 2^n * m'
```

那么m的二进制就是表示为：

```
m = (m'的二进制) << n
```

显然m'是个奇数，如果m'是个偶数，那么其中的2一定都在2^n中间去了，所以m'的最后
一个二进制位一定是为1，所以题目转化为，一个数值m的最后一个二进制为的位置等价于
数值m中质因数2的个数：

```C++
int ret = 0;
while(n) {
    ret += (n >>= 1);
}
return ret;
```


## 寻找发帖的水王

题目描述：在所有帖子ID的列表中，有一个ID发的帖子比所有帖子数量的一半还要多，
求出该ID

如果每次删除两个不同ID的帖子（不管是不是包含水王的ID），那么剩下所有ID的帖子
中水王的帖子也还是占超过一半的数量。

```
1.  如果删除的ID包含水王的，那么所有帖子数目变为n-2，水王的数目变为了m-1.
保持了性质： m-1 > (n-2)/2 => m> n/2
2.  如果删除的不包括水王的，那么更加是超过一半数目了。
```

不断的从所有ID的列表中取出不同ID的帖子，最后剩下的就是水王的ID了。

这个题目体现了一个很重要的思想：降维。一堆数据，如何进行分解化为更小的问题，或者
通过排除去掉没有价值的数据，从而将问题在更小的维度上解决是问题的关键所在。

```C++
Type find(Type* id, int N) {
    Type candidate;
    int nTimes, i;

    for(i = nTimes = 0; i < N; ++i) {
        if(nTimes == 0) {   // 如果当前比较的没有内容，那么选择一个作为比较id
            candidate = id[i];
            nTimes = 1;
        } else {
            if(candidate == id[i])  // 如果相同累加
                ++nTimes;
            else  // 如果不相同，和之前比较的id数目少一，表示去掉了不同的id
                --nTimes;
        }
    }
}
```

如果这个题目进行了扩展，在N个帖子中，有m个水王，每一个帖子占据了帖子总数目的
1/(m+1)，那么如何找出这些水王。

同上面的分析，如何降维：每次去掉m+1个不同ID的帖子，那么剩下帖子中一样可以得到
m个水王的帖子占据了总数目的1/(m+1)

开辟一个m长度的数组保存可能是水王的id内容，向数组中填充内容，当遇到了一个id和
保存了m个id的数组都不同的时候，将所有的id的数目都减少一。

```C++
vector<Type> find(Type* id, int N, int M) {
    vector<Type> candidate(M);
    vector<int> count(M, 0);

    for(int i = 0; i < N; ++i) {
        int zero_count_index = -1;

        int j = 0;
        for(; j < M; ++j) {
            if(count[j] == 0) {
                zero_count_index = j;    // record zero index
            } else if(candidate[j] == id[i]) {
                ++count[j];
                break;
            }
        }

        // find a candidate in the buffer
        if(j < M) continue;

        // exist any zero count value, then buffer current id
        if(zero_count_index != -1)
            count[zero_count_index] = 1, candidate[zero_count_index] = id[i];
        else
            for(int j = 0; j < M; ++j)
                --count[j];
    }

    return candidate;
}
```

如何有效的降低问题的维度，如何有效的化为更小的子问题，如何去排除不需要的元素，
同时将问题进行等价是正确解答问题的关键。

## 1的个数

题目：从1到N之间，出现所有1的个数（十进制）

不要一口考虑所有的问题，将题目分解到考虑一到N之间每一位出现1的数目。

(将问题分解为一个一个独立的子问题, 会将问题变得简单许多)

对于一个数abcde而言，在百位上出现1的个数讨论如下；

```
1.  如果c为0，那么就会有`ab * 100`个可能你个在c的位置上出现1
2.  如果c为1，那么不仅前面的ab对结果由影响，在最后一次累加到ab1xx的时候，
还会再出现`de + 1`个1
3.  那么如果c>1，那么最后一次的c可以取满所有的100个数，所以为`(ab+1) * 100`
```

算法如下：

```C++
int factor = 10;
int cur_f = 1;
int count = 0;
while(n / cur_f != 0) {
    int cur_num = (n / cur_f) % factor;
    int low_num = n - (n / cur_f) * cur_f
    int high_num = n / (cur_f * factor);

    if(cur_num = 0)
        count += high_num * cur_f;
    else if(cur_num = 1)
        count += high_num * cur_f + (low_num + 1);
    else
        count += (high_num + 1) * cur_f;

    cur_f *= factor;
}
```

很多问题，如果从全局的角度考虑非常的麻烦，通过将一个问题分解为多个小问题，
各个击破是一种好的想法。

## 寻找最大的K个数

### 基于快速排序的思想

1.  寻找一个pivot
2.  划分两个集合A和B，B中元素都大于A，那么递归取得B中的k个最大数和A中最大的`K-len(B)`个最大数的合集
3.  一些边界的情况，如果一个集合中没有K个数，那么直接最大的K个数就是集合本身。

```C++
void partition(const V& vec, V& v_big, V& v_small) {
    int value = vec[rand() % vec.size()];
    for (int i = 0; i < vec.size(); ++i)
    {
        (vec[i] < value) ? v_small.push_back(vec[i]) : v_big.push_back(vec[i]);
    }
}

V max_n_elem(const V& vec, int k) {
    if(k <= 0)
        return V();
    if(k >= vec.size())
        return vec;

    V v_big, v_min;
    partition(vec, v_big, v_min);

    // 取得两者的合集
    auto v_merge_one = max_n_elem(v_big, k);
    auto v_merge = max_n_elem(v_min, k - v_merge_one.size());
    v_merge_one.insert(v_merge_one.end(), v_merge.begin(), v_merge.end());

    return v_merge_one;
}
```

本质上这种方法等价于拷贝一个原有数据，然后在在该数据上进行partition，直到取得第K个数的pivot为止，这种基于快排的算法理论上的时间复杂度为O(n), 最坏时间复杂度为O(n^2).

上面的算法由于每次使用都缩小了集合的范围，所以相比于直接拷贝原来数据的方法更加适用于特大数据（可以用来保存在文件中，同时不断瘦小范围到一定范围以后，可以load到内存中). 如果直接in place的对原有数据进行处理，会改变数据的内容，需要明确算法使用的场景。

这里特别要说明的是stl中nth_element的解法：

```
1.  nth_element用来in place的得到第n个元素，同时将数据进行划分，类似于partion

    /* a+6的元素表示最小的第7个数，该nth element之前的元素都小于它，
    之后的元素都大于它。如果需要得到最小的第n个数，需要写成nth_element(a, a+n-1)
    */
    nth_element(a, a+6)

2.  nth_element基于快排的思想，但是进行了改进

    1.  基于二分的方式，对数据进行pivot分割，如果pivot小于K，那first=pivot
    如果pivot大于K，那么last = pivot
    2.  直到找到K的pivot或者last-first小于一个阈值位置（vc中为32）
    3.  在last-first区间做插入排序

    该算法好处在于，首先使用二分进行区间比较大范围的缩小（二分在数据很多
    的时候效率最高），在二分区间较小的时候，改用插入排序。因为二分较小
    的时候，范围缩小变得不高效（可能只是缩小了一个区间单位，却需要对
    整个[first, last)区间做partition的操作，而在范围比较小的时候，使用
    快排或者partition效率不高）， 改用直接的插入排序效率则更好。

    该算法平均时间复杂度为O(n)，最差为O(n^2)
```

### 基于count的方式

任何一种可能的算法都可以考虑使用hash的方式，如果数值的范围有限，那么直接
使用hash表映射数字的count，得到第一个大于K的位置。

需要时间复杂度和空间复杂度O(n)

### 基于二分范围的方式

如果我们知道数据的范围为[vmin, vmax]，那么可以而二分的方式计算，直到计算
出第k个数的值为止，再将所有大于K的元素选择出来。

如果vmin和vmax的范围非常大，那么可以进行多分的方式，但是需要更多的空间。
但是想法很有启发意义！

将vmax到vmin等分为m份，然后建立一个表格记录在n个区间中元素个数个数，找到
第k个元素所在的区间，然后在小区间中再次等分为m份或者别的分数，直到找到
第k个数为止。

如果每次都是等分为m份，那么时间复杂度为O(n * log_m^(vmax - vmin))
类似于二分就是log_2^(vmax-vmin)，但是分的m越多，需要更多的额外空间，
如果分为m份，需要额外空间O(m)

#### wrap up

1. 对数值考虑的题目, 总是可以从两个角度来考虑. 第一个是从数组中数字本身考虑,
比如这里直接考虑使用快排的方式确定pivot点进行降维. 第二个是从值域的角度, 数组
中的数据范围是有限的, 值域角度也是一种有效思路(如果数据很多, 但是范围有限的时候)
2. 如果数据量很大, 更不好从数值本身来考虑, 这时候更应该考虑值域角度. 可以一次扫描
进行桶排序, 或者统计, 缩小数值的范围.

### 基于堆的方式

基于堆的方式应该是最好的方式，不论是处理大数据，还是时间复杂度和空间复杂度。

在实现过程中，推荐使用priority_queue的方式，直接push和pop操作来调整堆元素个数。

注意这里逻辑上是相反的，如果需要得到最大的元素，需要建立最小堆。最小堆保存了
目前最大的元素，如果一个元素比最小堆中最小的元素还小就忽略了，就是这个原理
可以直接排除掉一些元素有，而如果大的话，就需要加入新的元素同时调整堆了。

详细的一个比较代码可以参考 ： test_nth_element.cpp [一个博客](http://www.cppblog.com/flyinghearts/archive/2010/08/16/123538.html)

### wrap up

实际测试过程中，使用mulitiset的实现方式和直接基于堆的还是有不小差距，建议使用priority_queue。

在n很大，且m/n很大的时候，nth_element更加快一些，因为该方法对m参数不敏感，但是对n敏感（需要多次遍历数组），但是当m很大的时候，该方法就比基于堆的O(nlog(m))的方法体现出了优势。

stl还有一种算法叫partial_sort和partial_copy_sort, 该算法的核心就是堆和堆排序：

1.  该算法是inpalce的
2.  partial_sort(beg, mid, end)将[beg,mid)范围排序
3.  计算方法，对beg到mid建堆，然后遍历[mid,end)的所有元素来调整堆，得到最小
的mid-beg个元素，然后使用sort_heap来排序
4.  本质上使用堆得到最小的K个元素，但同时最后进行了排序，所以时间上会差一些。

一个非常重要的思想是可以从值域角度考虑, 使用桶对数据的分布信息进行统计. 当数值是int类型的时候, 最多只需要2次桶进行统计(使用256kB的内存)就可以得到第k个数所在的位置, 在进行一次扫描将所有大于k的个数得到. 所以只需要3次扫描就可以得到前k个大的元素, 也是一种非常有竞争力的方法.

## 精确表达浮点数

对于一个无线循环的小数，我们需要使用变量代换的方式来处理：

考虑一个小数无限循环：

```
Y = 0.(b1b2..bm)
```

那么：

```
10^m * Y = b1b2...bm + Y
Y = (b1b2..bm) / (10^m - 1)
```

对于那些难于表示的内容，使用一个变量进行统一表示，最后通过运算
得到一个解析的解，这是一种化抽象为具体的好方法。

## 最大公约数问题

1.  辗转相除法

```python
gcd(x, y) == gcd(y, x % y)  (x > y)
```

本质上是这样子的推导，如果最大公约数为k

```python
x = nk
y = mk
x%y = (x - tm)k //其中 x = ty + (x % y)
```

所以对于`y`和`x%y`而言，两者最后都是含有最大的公约数k，可以证明这样子
的形式下的两个数的最大公约数也是k

2.  除法和取模运算是非常耗费时间的操作，对于大整数而言性能就较差。

本质上，一个除法等价于不停的减法，所以可以转换为减法操作，如果x>y，那么

```
gcd(x, x-y) = gcd(x, y)
```

不停的计算，直到较小的那个数为0为止（取模的本质上就是减去t个y之后的结果）

3.  2)中的方法不好在于，可能运算的次数非常的多，比如两个数`1 和 10000000` (减法的效率太低)

本质上，上面的方法都是降维，通过除法和减法降低维度。既然完全的减法还是非常的
不靠谱，还是需要祭出除法这个杀器。如何可以一方面使用除法来快速的降维，一方面
有可以提高除法的效率。

最后学习计算机的而言，一定会想到了最快的除法：**移位操作**

可不可以通过除二的方式来降低计算的维度呢，答案是有的：(计算机上最快的除法是不停的除以2)

```
1.  如果x和y都是偶数，那么有 `gcd(x,y) = 2 * gcd(x/2, y/2)`
2.  如果x和y一个是偶数一个是奇数，那么最大公约数一定是个奇数，
所以将偶数的2去掉不会影响结果，假设这里x是偶数
    gcd(x,y) = gcd(x/2, y)
3.  如果x和y都是奇数，那么使用
    gcd(x, y) = gcd(x, x-y)
```

下一次操作一定可以使得一个数为偶数，那么计算的范围将变的更小了。不好做除法的就使用减法来代替.
时间复杂度为`O(log(max(x,y))`

### wrap up

1.    在计算机的世界里，很多问题都需要降维，然后通过自底向上的方式来重新构建。
2.    降维最好的方式就是二分，一方面是因为二分的逻辑比较好控制，另外一方面就是
二分可以用更加快速有效的方式来表示(二进制)


## 找符合条件的整数

题目：任意给定正整数N，求一个最小的整数M，使得N*M的十进制表示中只含有1和0

1.  最直观的想法，遍历M看什么情况下 `N*M` 最小
2.  **换位思考**，考虑 `N*M` 的所有可能形式，判断哪一个最小的数对N取模结果为0

为什么考虑2的方式，因为N*M可能非常大，那么M的遍历就非常大。但是对于只有1
和0的十进制数值而言，这个数据的内容不会非常的大，遍历起来也比较方便。

vip：一个题目，经过一定的转换，将结果转换为条件也是一种好的思路

下面的重点是如果遍历所有只含有0和1的十进制数字，并且方便计算对N的取模操作。

取模的性质决定了这个问题可以使用小问题推导大问题的方式：

    (a+b) % n = (a%n + b%n) % n
    (a*b) % n = (a*(b%n)) % n

所以在遍历的过程中，并不是需要计算所有数对N的取模结果，而是可以更小问题上的解答
得到更大规模问题上的结果。

这里重点变化如何分解小问题：

1.  书中的方式：一个n位的数，最高位为1（如果为0，那么就不是N位，还是N-1位），
那么其结果表示：

    1abcd...m = (1*10^n % N + abcd..m % N) % N;

就是表示为最高位的1对N的取模结果，加上剩余n-1位取模结果。
同时注意，计算10^n % N的过程也是迭代的，计算了10^(n-1) % N 的结果之后，
将该结果乘上10，在对N取模就得到了。

2.  另外一种状态树结构组织的方式。`一个N位的数 = 所有N-1位数 << 1 + 放置0或者1`
就是，N位的数是上一层结果放置在高位上的结果，最后一位进行遍历放置数据。

这种方式的好处是所有的状态空间按照树形结构进行了保存。一种减枝的方式是在遍历
某一层的时候，如果有相同的两个状态对应的模数相同，从该节点引申出来的节点的结果
也一定相同，所以选择最小的那个即可。

具体的可以参考文章：
[文章1](http://blog.csdn.net/jcwkyl/article/details/3859155)
[文章2](http://www.cnblogs.com/pangxiaodong/archive/2011/09/30/2196177.html)

贴出自己写的代码，注意其中思想的一些小技巧：

```C++
    struct Data {
        vector<int> value;    /** 当前大整数的结果 */
        int remainder;        /** 当前的余数 */

        Data(int v, int rem) {
            value.push_back(v);
            remainder = rem;
        }

        Data(const Data& d, int v, int rem) : value(d.value), remainder(rem) {
            value.push_back(v);
        }

        void push_back(int v) {
            value.push_back(v);
        }
    };

    /*
     *    实现上的几个技巧：
     *
     *    1.    使用size来控制上一层搜索树对应节点的数目，这样子不会和不停的新加入节点的push
     *    相冲突
     *
     *    2.    如果相同一层有多个节点的结果取模是相同的，那么只需要取最小的一个，因为别的节点
     *    之后的数据都不会产生更多的结果。
     *
     *    3.    这里实现上使用一个bool变量，表示一个结果是否被取过，一个队列是按照大小顺序放置
     *    的，在取得过程中，如果之前有一个结果已经得到了结果，那么后面就不需要在push放置了。
     */
    vector<int> get_m(int N)
    {
        queue<Data> q;
        q.emplace(1, 1);

        vector<int> res;

        int rem = 0;
        int size = 0;
        while(!q.empty()) {
            size = q.size() + 1;
            vector<bool> has_find(N, false);

            while(--size) {
                Data d = q.front();
                q.pop();

                rem = (10*d.remainder) % N;
                if(rem == 0) {
                    res = d.value;
                    res.push_back(0);
                    goto ok;
                }

                if(!has_find[rem]) {
                    has_find[rem] = true;
                    q.emplace(d, 0, rem);
                }

                rem = (10*d.remainder + 1) % N;
                if(rem == 0) {
                    res = d.value;
                    res.push_back(1);
                    goto ok;
                }

                if(!has_find[rem]) {
                    has_find[rem] = true;
                    q.emplace(d, 1, rem);
                }
            }
        }

    ok:
        return res;
    }

    void print_data(vector<int> const& vec) {
        for(auto v : vec)
            cout << v;
        cout << endl;
    }

    void create_find_n_m()
    {
        int N;
        while(cin >> N && N != -1) {
            auto vec = get_m(N);
            print_data(vec);
        }

        //TODO : 得到了M*N的结果，需要实现大整数的除法，从而得到M的数值
    }
```

### wrap up:

1.    本质上属于bfs的搜索, 每一层都是上一层基础上得到更多数据进行计算.
2.    很重要一点在于如何确定搜索的规则 : 每一层之间如何变化以及如何进行剪枝. 在这里,
如果一个数值得到的模数已经存在, 那么后面所有在此基础上的变化都将相同, 可以剪枝.
3.    bfs的搜索想到用树形结构来帮助理解.

## 斐波那契数列

1.  google一下特征方程是什么，对于F(n) = f(n-1) + f(n-2)的递归公式存在一种直接计算通项的计算公式。
2.  vip：对于递归数列，都可以转换为矩阵相乘的形式，比如这里：

```
(Fn, Fn-1)T = (Fn-1, Fn-2)T * A
A = [ 1 1 ]
    [ 1 0 ]
```

推导的方式就是：递归公式的第一项需要的内容就是矩阵相乘第一项的内容，然后下面的各项都表示为一个[0 0 1 0 ..]类似的形式。

表示为矩阵的好处在于可以优化计算的速度, 计算一个矩阵A的n次幂，可以将n化为2进制的形式：

```C++
Mat tmp = A;
Mat res = Identity;
while(n) {
    if(n & 1)
        res *= tmp;

    tmp *= tmp;
    n >>= 1;
}
```

计算的时间复杂度为O(logN)，算法中的tmp每次都是乘以2的变化，只在二进制为1的
位子上才会在最后结果上乘上这个tmp

## 寻找数组中的最大值和最小值

1.  最简单办法，遍历，同时比较两次，需要O(2N)
2.  分支，学会分析公式

```
f(n) = 2*f(n/2) + 2     // 其中2表示合并过程中，只需要最小和最小的比较，最大最大比较
```

总体的时间为O(1.5N)

分别计算两个N/2规模的最大值和最小值，然后在合并。

不说多的，任何问题都可以想到分支，合并的时间复杂度非常关键。如果是：

```
f(n) = 2*f(n/2) + n
```

那么时间复杂度就是O(nlogn)级别

## 寻找最近点对

题目描述：给定2D平面上N个点，求出最近的两个点之间距离。

1.  最简单方法：O(N^2)的遍历搜索
2.  分解问题为更小的问题，二分的方法：

如果将所有点进行X轴排序，在中间的位置二分，左边是所有X轴的数值小于K的，右边
是所有X轴的数值到大于K的。

那么最小的距离：

1.  要么在两个半边之间出现的最小值。
2.  要么一个点在左边，一个点在右边得到的最小值

合并的过程是优化的关键，这里假设得到了左边和右边的最小值的最小值，记为M。
那么在X轴为K的地方画一条竖直线，出现上(2)的情况的只可能在范围[x-k, x+k]之间。

将出现在[x-k, x+k]之间的所有数据取出来叫做集合S，将S中所有点按照y轴进行排序。
如果两个点的距离小于M，那么假设一个较小的点的y坐标为ym，那么其可能的出现
的最小距离匹配点一定出现在[ym + M]的y坐标范围内部。

所以一种方式就是对S集合中的元素进行遍历，从最小的y开始，取得其上面的元素，
找到所有和当前点距离y距离小于M的元素计算距离。可能你认为这个时间复杂度是O(N^2).
但是其中是O(N)，因为可以比较点的个数是有限的。

根据抽屉原理，一个M*M的正方形区域内最多可以放置4个点，如果放置5个点的话，必有
两个点放置在同一个(m/2 * m/2)的正方形区域内，那么该两个点的距离一定是小于M的，
这个和之间假设两侧都最小值为M相矛盾。

所以在遍历的时候，只需要看其上面的3个点就可以，如果上面的3个点中都没有满足的，
第4个点一定不再[ym + M]的范围内！(自己本身也算一个点)

有一点不明确的在于，寻找到了集合S最后的排序时间按复杂度如何计算，书中直接
说明合并的时间复杂度为O(n)，那么递归公式就是合并排序的方法，总体时间复杂度
为O(nlogn).

分解问题，然后合并是一种非常有效的套路，这种思想的重点在于**更小规模的问题
求解的结果是记录下来的（通过递归累计的方式）**，从底向上构建最终问题的答案。

## 子数组最大乘积

题目描述：一个长度N的整数数组，计算任意N-1个数的组合中乘积最大的一个

1.  每次不取一个数得到别的计算结果的乘积。

一个数i不取的别的结果可以分为两个部分，一个是i之前的所有数乘积，一个是i之后所有数的乘积，建立两个数组，s[i]表示i之间所有部分的乘积，t[i]表示i+1到数组结束处所有数的乘积，那么遍历的时候，只需要看`s[i] * t[i]`哪个数值最大。但是这种方法有溢出的危险。

2.  既然只是需要去掉一个数字。是不是可以从分析的角度来考虑呢?

如果统计出数组中正数，负数和零的个数可知道：

1.  如果0的个数大于等于2，那么结果必然为0
2.  如果只有一个零，那么剩下的结果中的乘积为正数（看正数和负数的个数就可以判断）
那么去掉零，如果为负数，那么最大值一定就是0，随便去掉一个即可。
3.  如果没有零，那么就根据正负性去掉绝对值最小的正数或者负数。

### wrap up:

1.  一个问题当有很多重复计算的时候，建立表格保存结果。需要注意的是如何去总结出
计算的模式，一旦模式有了，那么建立表格就很方便。这里就是将计算乘积分为了两个
部分，然后再分别计算。
2.  特殊情况下的问题，可以考虑使用分析的思路去考虑。判断乘积的正负，并不一定
就是需要乘起来看结果，只需要考虑正数，负数的个数就可以了。

## 数组的子数组之和最大值

题目描述：给定一个数组，求出子数组和值的最大值。一个子数组表示连续的任意数目
的数组元素。

比如：`[0 -2 3 5 -1 2]` 返回 `9`，子数组表示为`[3 5 -1 2]`

1.  想到二分的方式降维，这种思想应该是常住思想。

分为两个数组，那么子数组最大的一定出现在左边或者右边，或者出现在两个数组连接的地方。
假设分开位置的元素为A[i]，那么找到连接位置的最大就是找到从i开始到右侧的最大值
加上从i开始到左侧的最大值，直接遍历一遍数组即可。

所以：f(n) = 2*f(n/2) + n，时间复杂度为O(NlogN)

2.  有的题目具有线性最优化结构，就是当前结果可以直接用f(N-1)规模的结果来最优表示。

当分析到当前元素 `i` 的时候，最大的子数组有三种可能:

这个很重要, 分析一个元素的时候分析出最优子结构和上一层所有计算的关系.

*    直接取A[i]
*    一种是之前不连接i元素的最大值
*    一种是之前连接到i-1的最大值 + A[i]

这里为什么要分连接和不连接呢：因为如果不分且知道f(N-1)规模下的最值， 如果这个
最值是可以连接i的，那么最值的结果可以加上A[i]，如果不可以连接，最值
就是f(N-1)情况下的数值，这个非常重要。由于事情的发展可能存在多种的情况，最优
的结构是一种，别的可能构成最优的分支同样需要保存，因为这些可能的分支也许
在某一次运算中就逆袭成为最优分支了。

所以递归公式可以写成：

```
succe(i) = max { A(i), succe(i-1) + A(i) }
all(i-1) = max { A(i), succe(i-1) + A(i), all(i-1) }
```

实现过程中：

1.  连续最优子结构可以先求解，这样考虑到了A(i)的数值，然后和全局最优的比较.
2.  最优的数据比较只和上一层的数值有关，所以没有必要使用数组保存，一个元素
就可以表示当前的数值和最新的数值.

代码如下：

```C++
int find_max_sub_array(int* data, int size) {
    int succe_max = data[0];
    int all_max = data[0];
    int last_index = 0; // 保存连续子数组最后的位置
    for(int i = 1; i < size; ++i) {
        succe_max = (succe_max > 0) ? succe_max + data[i] : data[i];
        if(succe_max > all_max) {
            all_max = succe_max;
            last_index = i;
        }
    }

    // 得到连续的所有数字，不过是倒着输出，需要用一个stack来保存
    cout << "the sub range is (reversed order) : ";
    int sum = all_max;

    // 使用do-while是因为可能sum就是0，而当前的data[last_index]也是0，
    // 那么就没有输出了，至少last_index必须要输出的，所以用do-while结构
    do {
        cout << data[last_index] << " ";
        sum -= data[last_index];
        --last_index;
    } while(sum != 0);
    cout << endl;

    return all_max;
}
```

[一个不错的在线参考](http://blog.csdn.net/linyunzju/article/details/7723730)

## 求数组中最长递增子序列

题目: 给定一个长度N的数组, 找到其中最长的递增子序列, 序列不一定连续, 但是序列中
的数值一定是递增的. 比如 `1,-1,2,-3,4,-5,6,-7` 中最长为 `1,2,4,6`

1.  考虑当前节点为n,如果单独考虑n-1情况,其最长的子序列不一定可以直接和第n个
元素构成更长的子序列.如果单独考虑一种情况不可以,那么当前结果可能需要之前很多的
子结果进行比较才可以得到.

(最优结构不一定每次只保存一个结果, 而是可能保存多个可能的结果, 每次都更新所有
可能的结果, 因为你不知道哪一天这个可能的结果就逆袭成为最好的结果了)

比如这里,需要和n-1的最长比较,和n-2的最长比较直到一个数字为止.同时还需要
考虑**本身默认就可以构成一个1长度的子串**. (本身自成一个体系不要忘记)

假设LIS[i]表示前i个元素中最长递增子序列的长度.

```
LIS[i] = max(LIS[k], 1) {k <= i  &&  array[k] < array[i]}
```

如果当前元素比第k个元素要大,那么就可以串联到第k个元素的后面.

时间复杂度为O(N*N)

2.  第一种方法考虑之前子结构的连接情况(最长的子序列的长度),如果换一种角度考虑,
分析之前所有子结构的结果(不是单看单一子结构的情况,而是从全局计算结果的角度考虑,
类比于**计算最大连续子数组和**的题目,一个数组保存之前数据连续起来的最大值,还有
一个数组保存全局最大值一样).但是这里不同的是,需要保存所有不同长度递增子序列的
**目前**最大元素的最小值.

如果当前长度为k的递增子序列的最大值为MaxV[k],那么当前元素如果大于k,就可以
在k的基础上得到更长的子串,那么该子串可以构成k+1长度的子串,如果MaxV[k+1]大于
当前元素的话,那么使用当前元素替换MaxV[k+1](因为在同样的长度下,数值越小后面的
数据越可能构成更大的串)

代码如下:

```C++
typedef vector<int> Data;
int max_length_increase_array(Data const& data) {
    vector<Data> res(1);    // 只是用来保存子串的结果
    Data min_value_increase;

    min_value_increase.push_back(data[0]);
    res[0].push_back(data[0]);

    for(int i = 1; i < data.size(); ++i) {
        // 加入新的最长子串长度
        if(data[i] > min_value_increase.back()) {
            min_value_increase.push_back(data[i]);
            res.push_back(res.back());
            res.back().push_back(data[i]);
        }
        else {
            int cur_value = data[i];
            // 找到一个比当前元素大,但是小于小于下一个元素的位置进行替换
            // 这里可以优化为二分查找
            for(int j = min_value_increase.size() - 2; j >= 0; --j) {
                if(data[i] > min_value_increase[j] && data[i] < min_value_increase[j+1]) {
                    min_value_increase[j+1] = data[i];
                    res[j+1] = res[j];
                    res[j+1].push_back(data[i]);
                }
            }

            // 第一个数据特殊处理,只要比当前数字小就更新
            if(cur_value < min_value_increase[0]) {
                min_value_increase[0] = cur_value;
                res.front().front() = cur_value;
            }
        }
    }

    print_data(res.back());
    return min_value_increase.size();
}
```

这里优化的地方在于, `min_value_increase` 结构的数据是递增的(保存了不同长度下的目前
最大值,如果不是递增,那么不可能在之前的结构中成功的连接成更长的串),所以可以使用
二分.复杂度O(N*logN)

总结:

1.  DP的状态不是只考虑 **之前的一个状态**, 而是之前的多个状态中进行决策
2.  考虑角度转换! 一种从问题的直接问题进行考虑, 一种从所有可能得到的子结果
(可以得到多长的子串)计算过程中, 动态更新目前计算的所有结果.

## 数组分割

题目描述：在长度为2N的正数数组中，将数组分割为长度为N的两个数组，且这两个数组的
和最接近。

等价于：2N个数中找到N个数，该数的和与Sum/2最为接近。

既然分为两个数组，必然一个小于Sum/2一个大于Sum/2，所以只需要考虑找到N个数，其
和值小于Sum/2的最大值。

乍一看很像背包问题，不同的是背包问题只是决定于取或者不取，没有限制个数，之多
就是限制呢最大容量，但是这里的容量是必须为N。

正是这个区别，决定了在DP的时候决策需要考虑更多的情况 :

假设现在考虑第 `i` 个元素，最直接想法是，如果这 `i` 元素和之前采集的 `N-1` 个元素进行
加和，可以得到新的 `N` 个元素的集合结果，麻烦就在于你不能保证这个 `i` 元素就是取得N
个元素最后的那个，新的i个元素还可以和N-2，N-3。。的集合构成新的N-1，N-2的集合。

1.  一个新的元素过来必须要从最上层到最底层的元素都进行更新。注意用词，是最上层到最底层。
如果从最底层开始累加，新的元素加到上一层之后，下一次的遍历就使用了新加入的结果，
这必然是不对的。
2.  一种考虑的方式是使用集合，每次有新的元素过来就放入到一个set中。这种方式本质上
是遍历。将所有可能的元素相加结果进行保存，就是`C_2N^N`的结果，是一种`O(2^n)`的时间复杂度。
3.  另外一种考虑的方式不是从得到的集合角度，而是从可以得到的数值角度。（如果可以
记录的数值是有范围的，比如这里最大记录Sum/2个元素），那么直接建立一个hash表格
表示当前元素是否去到了，少掉了在set中查找的时间。每个元素都需要和之前的所有的
N-1个元素进行更新，这是N^2，每次更新需要遍历Sum/2个元素是否可以更新，需要Sum，
时间复杂度为O(N^2 * Sum)

实现的时候需要注意，第i个元素更新的时候，也要记住本身i个元素本身就可以构成
一个只有一个元素的集合，而且是特殊情况需要额外的逻辑判断。

代码如下：

```C++
// 是否是一个还没有被取过的元素
static inline bool valid(int data) {
    return data != -1;
}

int split_array(Data const& data)
{
    int sum = get_sum(data);
    int row = data.size()/2;
    int col = sum/2 + 1;

    /* sum_value[i][j] 说明取得i个数值和值为j的最后一个数值。
        * 表示了两层的含义，一个用来说明当前数值是否可以取到，
        * 一个用来说明最后一个取得数字的数值
        */
    vector<vector<int>> sum_value(row);
    for(int i = 0; i < row; ++i)
        sum_value[i].resize(col, -1);

    for(int i = 0; i < data.size(); ++i) {
        int max_row = min(i-1, row-2);
        for(int j = max_row; j >= 0; --j) {
            for(int k = 0; k < col; ++k)
                if(valid(sum_value[j][k]) && (k + data[i] < col))
                    sum_value[j+1][k+data[i]] = data[i];
        }

        // 第一行额外处理
        sum_value[0][data[i]] = data[i];
    }

    int max_value = col-1;
    for(; max_value >= 0; --max_value)
        if(valid(sum_value.back().at(max_value)))
            break;

    int res = max_value;

    /* 倒退回去看取了那些数字 */
    Data half_array;
    for(int i = row-1; i >=0; --i) {
        half_array.push_back(max_value);
        max_value -= sum_value[i][max_value];
    }

    BOOST_ASSERT(max_value == 0);
    reverse(half_array.begin(), half_array.end());
    print_data(half_array, "half array is");

    BOOST_ASSERT(get_sum(half_array), res);
    return res;
}
```

### wrap up

1.  一个新的元素过来在分析和之前子结构关系的时候, 考虑需要保存多种的状态的情况,
比如这里, 一个新的元素可能给所有之前i个元素总和的结果都构成了影响. 一方面需要
从之前的所有情况中计算结果, 另外一方面还要对所有可能改变的分支进行
2.  如果元素的范围有限，那么从值域的角度考虑更加方便，其实就是使用hash表格
和查找的区别。hash在不知道元素范围的时候就很头疼，所以如果元素的范围很大，
那么使用集合set的方法更加合适
3.  如果题目改为取得N个元素的和值最小，那么不需要建立这么大的表格。
有这样子的性质：如果取得的第N个元素最小，一定是从最小的N-1个
元素中取得的，所以只需要一个向量保存取N个元素的当前最小值，每次一个元素过来
同样进行从上到下的结构更新，只要出现通过当前的第i个元素取值可以比之前的更小
的情况就更新。

```C++
/*
    *    分割数组使得N个元素的和值最小，不同于最大和值（小于Sum/2），DP
    *    过程中只需要保存最小的元素结果就可以，而计算最大就不行，因为最大值
    *    很可能超过Sum/2，无法回到到上一个位置，所以需要保存所有的结果。
    */
int split_array_with_min_sum(Data const& data)
{
    int sum = get_sum(data);
    int row = data.size()/2;
    int col = sum/2 + 1;

    vector<int> min_value(row, INT_MAX);

    for(int i = 0; i < data.size(); ++i) {
        int max_row = min(i-1, row-2);
        for(int j = max_row; j >= 0; --j) {
            if(min_value[j] + data[i] < min_value[j+1])
                min_value[j+1] = min_value[j] + data[i];
        }

        // 第一行额外处理
        if(data[i] < min_value[0])
            min_value[0] = data[i];
    }

    return min_value.back();
}
```

## 区间重复判断

题目描述：给定一个源区间，和N个无序的目标区间，判断源区间是否可以在目标区间内。
等价于判断这个源区间是不是在N个目标区间构成的集合区间中。

一种思路就是遍历所有的目标区间，将目标区间上所有的范围映射到源区间上，最后看
源区间是不是所有的区间都被映射完成，时间需要O(n^2)

第二种思路：排序！

区间的题目基本都可以通过排序来打开思路之门。一堆的无序区间，如果按照开始位置
或者结束位置排序之后，区间就变得有序。比如这里按照开始位置进行排序，排序完成之后，
可以判断出哪些的区间可以进行合并（只要一次线性判断排序好的数组即可）。

合并好的区间就是哪些原来N个无序区间更加紧密表示区间集合。最重要的数据有序了，
有序的东西的查找就可以使用二分的方式.

总体时间复杂度O(n*log(n))

### wrap up

1.  区间的问题都想到用排序。
2.  排序好的东西都可以想到用二分。或者为了使用二分而考虑使用某种排序。

## 只考加法的面试题

题目描述：给定一个正整数N，问该正整数是否可以分解为下面的形式：

$$
N = m + (m+1) + (m+2) ... + (m+k-1)
$$

即是表示为k个连续正整数的和。

化解之后得到:

$$
N = ((2m+k-1) * k)) / 2
$$

有：

$$
2N = (2m+k-1) * k
$$

一个非常NB的结论：**2N可以表示为一个奇数和偶数的乘积。**

因为一个数加上一个偶数不改变该数字的奇偶性，所以(k-1)和(k)一个是偶数一个是奇数, 那么(2m+k-1)和k也是一个奇数一个偶数.

将2N中所有偶数的部分去掉, 就是去掉2N中所有的2, 可以化为:

$$
2N = 2^t * a * b
$$

其中a和b表示去掉2之后剩下数字的分解(这个剩下的数一定是奇数,所以a和b也都是奇数)
所以对应的上面两个数可以表示为(2^t * a, b)或者(2^t * b, a),因为k是小于(2m+k-1)
的,所以上面的组合中较小的数字表示k,这样子m也可以得到.

所以一个数N可以分解为连续正整数和的个数 == N中去掉2余值的因式分解个数.

[参考](http://www.cnblogs.com/flyinghearts/archive/2011/03/22/1992003.html)

### wrap up

1.  对于数字性质考察的内容, 想到从数字的奇偶性角度来分析.
2.  偶数就要想到2, 想到2就要想到如何去掉2还可以保持题目的性质(降维才是核心).
为什么这么喜欢分析2呢, 因为计算机中2的表示非常方便高效.
3.  降维,首先考虑如何降2,数值的东西就是优先考虑如何进行偶数上的分解.


## 字符串移位包含问题

题目描述:  给定两个字符串s1和s2,判断s2是否是s1通过循环移位得到的子字符串.

一个字符串循环移位等价于一个字符串结尾的下一个数字在array[0],考虑:

$$
ABCD -> BCDA -> CDAB -> DABC -> ABCD
$$

一个循环移位之后的字符串可以表示为s1s1,将原来的字符串进行了扩展,这样子符合
首尾相连的形态.转换为判断s2是否在s1s1中.

如果不使用额外的空间分配,可以直接使用取模运算的方式匹配子串,就是当字符串处理
到最后一个字符的时候,下一个字符取模取到第一个即可.

wrap up:

1.  移位问题,本质上是一种对原有空间的假相扩展,使用取模运算表示了逻辑上的首尾相连.
2.  如果不追究最终的形式,使用假的空间扩展移位后的空间会更加的方便.

## 计算字符串的相似度

题目描述: 计算两个字符串之间的相似度.相似度可以描述为"距离+1"的倒数.

两个字符串的距离可以描述为下面三种动作:

1.  修改一个字符
2.  增加一个字符
3.  删除一个字符

如果通过N次上面动作可以将两个字符串变得一样,那么距离就是N

字符串的相似度,就是求编辑距离(edit distance)

假设考虑一个字符串a1a2a3.. 和 b1b2b3...

如果:

1.  a1 == b1 那么相似度距离等价于 dist(a2a3.., b2b3..)
2.  a1 != b1 那么,可以通过增加,或者删除得到变化的效果,子问题等价为求$min(dist([a2-an], [b2-bn]), dist([a1-an][b2-bn]), dist([a2-an],[b2-bn]))$

这是明显的一个递归子结构优化问题.

### 递归

递归的方式很简单了,一次判断两个字符串,缩小子范围,递归求解.

### DP

本题存在动态规划优化的方程, 实现的时候有几点需要注意:

1.  边界条件,这里的边界条件有点特殊,如果一个数据全部去掉了,那么剩下的串的
长度就是为两者都距离
2.  理解方式的不同导致实现方式的不同.

动态规划的建模是有顺序的,比如这里,如果考虑D(i,j)表示从i和j开始的两个子串
的距离,那么递归方程就为:

```
D(i,j) = D(i+1, j+1) a[i] == a[j]
            min(D(i+1, j), D(i, j+1), D(i+1, j+1)) a[i] != a[j]

D(i, 0) = len(a) - i;
D(0, j) = len(b) - i;
```

但是顺序这个东西是可以反向考虑的,如果考虑 `D(i,j)` 表示从开始到 第一个串的`i` 和 第二个串`j`位置
作为**结束**的两个字符串的距离:

```
D(i,j) = D(i-1, j-1) a[i] == a[j]
        ...
D(i, 0) = i
D(0, j) = j
```

那么计算也方便,遍历也方便.因为如果按照第一种方法考虑,需要从最下面开始建立.
如果倒着考虑,那么就需要考虑之前的情况,就变为从第一行开始遍历,各方面都方便了许多.

动态规划的这种顺序性有的时候需要一些 **mind hack**, 比如背包问题, 取东西就是从一个固定
的开始坐标(设为0)开始取, 所以建模的顺序性就在于 `D(i)` 表示前 `i` 个元素的数值. 这里也是,
对于一个范围的字符串, 按照一定的顺序(不论是向左还是向右), 都产生一定的顺序. 比如这里
D(i)表示前i个元素的字符串就比较方便, 第一种考虑就是向左发展, D(i)表示从i开始到最后
的字符串.

[参考](http://www.cnblogs.com/flyinghearts/archive/2011/03/22/1991988.html)

所以对于DP顺序性wrap up:

1.  一个范围的事物,如果获取的方法是按照从头到尾或者从尾到头,那么表示这个范围的index
不是二维,而是一维!!,因为相同的规则下,另外一个位置的index都是相同的(不是头就是尾巴了)
2.  DP的表示就需要这种顺序表示的思维, 具有用一维表示"伪造二维"的慧眼. 同时还知道
不同方式下建模的不同,选择较好的方式来分析.还有需要有**反向思考的**能力,如果发现
一个递归表示为D(i) = D(i+1),那么可以改变取值的方法,那么递归就变为了D(i) = D(i-1)

### 备忘录法

*   递归是自顶向上的,使用分治法解决问题.
*   DP是自底向上的,记录每一个小问题的解,最后构成了大问题的解
*   递归是可能存在冗余计算的,一个小问题可能被多个上层的大问题所调用.所以这里出现
了备忘录方法.

备忘录方法在递归的过程中表示递归计算过程中的子结果.如果某一次计算计算过了该数值,
那么以后就不在计算.

使用动态规划的复杂度为`O(lenA+1）*（lenB+1))`。递归并做备忘录的方法**最坏情况**下复杂度为`O(lenA+1）*（lenB+1)`。

因为备忘录方法并不是所有情况下的直接过都是需要计算的，而DP则是所有子结果都需要计算.

[参考](http://www.cnblogs.com/yujunyong/articles/2004724.html)

### 几种方法比较

1.  递归最直接,如果问题很难通过建立表格的方式,或者表格维度很大(这里只有2维),那么只能使用递归.

2.  如果可以用表, 那么使用DP方法可以求解所有的子结果, 同时通过合理的设置表格
的存取模式, 可以使用很小的内存来计算.

3.  如果一个问题在计算过程中,并不是所有的子问题都需要计算, 比如如果递归方程为: `D(i) = D(i-3)`

    这种模式, 使用DP就会将所有行都计算,那么时间比较浪费.但是使用备忘录,就可以按照
    3的行单位下降计算,时间更少,但是也不要忘记递归的时间消耗.同时,备忘录方法需要
    的内存不好优化,是多大就要建立多大.

4.  总结一下,使用DP是在那种需要row-by-row的计算形式上,一个问题几乎需要计算所有的子问题,
那么使用DP.如果不是使用备忘录.不一定很准确,但是比较通用的一个想法.(如果递归
的代价很高需要综合考虑）

## 编程判断两个链表是否相交

题目表述: 判断两个无环链表是否有公共交点.

1.  如果两个链表相交,可以通过将一个链表链接到另外一个链表的方式构成一个环状
链表.只需要判断另外一个链表是不是可以回到起点就可以.

    vip: 通过改变链表的方式构造特殊的结构.扩展开来,一些结构可以通过临时的组合方式
    构造新的结构,在这个新的结构上进行分析.同时,最后记得需要将结构进行逆变换.

2.  分析问题的本质.对于无环链表,如果相交,一定在某一个位置以后就开始变得相同.
那么最本质的就是最后一个节点相同,只需要分别扫描两个链表,看最后一个节点是否相同
就可以.

    vip: 分析得到最本质的东西,最本质的东西很容易出现在开始或者结束的边界位置.

### 分层遍历二叉树

题目的难点在于输出每一层的二叉树需要输出最后的换行符号,这个需要额外的判断.

一种思路是每次遍历完成一个层次记录下次遍历的count个数

```C++
q.push(a[0]);
size = 1;
while(!q.empty()) {
    while(num--) {
        // process data q.top();
        // push all the subdata
        q.pop();
    }
    num = q.size();
    cout << endl;   // end of a level
}
```

还有一种思路是加入一个哨兵节点,比如每一层结束的时候加入一个NULL节点.
在读取到NULL的节点时候,说明一层结束了,做两件事情:

1.  输入换行
2.  新加入一个NULL节点到队列q中(说明之前一层的节点处理完成,新的下一层节点的结束标志)

这种思想很重要, 判断结束位置可以通过加入特殊的节点, 或者分割点来标识.

## 程序改错

任何时候都考虑是否可能溢出的问题,这个问题比较的隐蔽,在面试的时候,都试着
去询问一句,是否数据是非常大的,是否当前的表示会溢出.需要明确数据的范围,
使用不同数据类型来表示.

比如二分查找计算mid的计算: `mid = (low + high)/2`

如果low和high都较大,那么可能溢出,但是即使low和high都很大,但是中值不是溢出的(
除非low和high本身就是溢出的)

使用差值计算的方式比直接两个数字相加要好的多 `mid = low + (high - low)/2`

VIP: 溢出的问题,如果可以,尽量将范围缩小以后在计算.而不是将数据放到很很大以后
在缩小,因为放大就代表可能的溢出,溢出之后就无法还原.


## 桶中取黑白球

### 状态空间法

问题描述:

有一个桶, 其中白球,黑球各100个, 按照下面规则取球:

1.  每次取出两个球
2.  如果两个球颜色相同, 就再放入一个黑球到桶中
3.  如果两个球颜色不同, 就再放入一个白球到桶中

问: 最后桶中只剩下一个黑球都概率是多少?

如果从概率推导的角度来分析, 太复杂了, 没有办法写出概率递归推导的办法.

那么换一种思路: 找规律.(或者叫分析的方式, 从简单到复杂)

从简单的情况找起, 从(2,2)个球开始, 注意下面的表示方式(一个问题一定要找到一种有效
的表示状态空间的办法) : 这里有两个颜色球, 就使用两个长度的序列来表示解空间.

那么状态变化为, 如果取两个黑球:

$$
(-2, 0) + (1, 0) = (-1, 0)
$$

如果取两个白球:

$$
(0, -2) + (1, 0) = (1, -2)
$$

如果取一个白球一个黑球:

$$
(-1, -1) + (0, 1) = (-1, 0)
$$

这样子表示状态变化很方便.也可以得到一个结论, 不论怎么取球,
白球变化的个数一定是按照2变化的, 所有如果有100个白球, 那么最后
的状态一定不可能是(0,1), 而是(1,0),所以最后一个一定是黑球.

#### wrap up

1.  多种选择方式的题目, 使用多维的元组来表示空间状态. 有一个好的空间状态
表示方法就可以更好的对空间进行建模.
2.  分析过程, 分析状态之间转换的规则, 进行分析. 概率的东西不一定就是
递归的推导, 可能找到规律之后发现其中特定的逻辑.
3.  从简单的情况入手.

### 编码

第二种想法考虑使用异或的思想.
其实看到取出同色, 取出异色, 应该可以想到使用异或.

很重要一个思想是对物体进行编码, 从总体上考虑(不用于上面对状态空间考虑), 那么
黑色表示为0的话(白色表示为1):

1.  那么取出两个0, 还是放入0, 不改变异或. 如果取出两个1, 那么放入0, 也不改变.
2.  取出一个0, 一个1, 还是放入1, 不改变异或(之后取出或者放入1才会改变异或结果)

所以这样的规则, 最后的异或值不改变. 如果有100个红和黑, 最后的异或结果一定是0,
所以最后不可能出现一个红球的情况.

#### wrap up

1. 从总体考虑, 使用编码的方式来表述整体的解空间(不同于之间状态表示法主要用来
表示状态的改变)
2. 将问题状态进行编码就和计算机的二进制表示建立了联系.
2. 看到什么异或的东西要有条件反射. 异或的性质: 改变奇数个1才会改变异或的数值

## 蚂蚁爬杆

题目描述: 有一根27cm的细木杆, 在3cm, 7cm, 11cm, 17cm,
23cm这五个位置上各有一只蚂蚁. 木杆很细, 不能同时通过两只蚂蚁.
开始时,蚂蚁的头朝左还是右是任意的, 它们只会朝前或者调头, 但不会后退.
当任意两只蚂蚁碰头时, 它们会同时调头朝反方向走. 假设蚂蚁们每秒钟可以走一厘米的距离.
编写程序, 求所有蚂蚁都离开木杆的最短时间和最长时间.

考虑问题的集中思路:

1.  降低规模方法. 找到更大规模和更小规模的关系, 建立递归的方程. 发现这里
很难有递归的性质.
2.  状态空间表示方法. 将运动的状态和运动的过程用编码的方式表现出来, 最后寻找
编码状态的变化规则. 这里虽然状态有变化, 但是很难表示清楚状态的变化.
3.  分析/归纳的方法. 从小规模分析, 总结规律. 这里也没有办法得到什么规律, 看来
还是需要从总体角度考虑.
4.  暴力搜索. 这个当然可以, 模拟所有蚂蚁的运动, 挺麻烦.
5.  问题的转化与等价. 将一个问题或者条件进行转化, 在不影响解的条件下, 将问题
重新建模可以得到更好的效果.

这里很NB!, 考虑两个蚂蚁相遇后再分离的过程, 虽然每一个蚂蚁的个体在调头, 但从
总体上, 就好像两个蚂蚁"穿过"了对方, 沿着原来的路线继续前进. 或者另外一种等价,
每一个蚂蚁身上都有一个id信息, 在相遇的时候, 不会改变运动方向, 只是交换了两个的id信息而已.

这样的等价, 就将最复杂的"调头"逻辑给去掉了, 最小和最长时间就是每一个蚂蚁"一直朝着"
一个方向行走时间的最值.

wrap up： 复杂问题的等价. 需要有一个将复杂条件, 复杂问题进行等价简化的思维.

## 数字哑谜和回文

题目描述: 神奇的9位数, 能不能找到符合条件的9位数:

这个数包括1-9这9个数字.
这个9位数的前n位都能被n整除, 若这个数是abcdefghi, 那么ab可以整除2,
abc可以整除3, etc.

### 方法一：搜索

搜索如果用纯循环的方式来写, 非常麻烦. **搜索就想到使用dfs或者bfs
来搜索**, 如果不是一定那种需要使用bfs的题目(比如需要知道每一层结果), 那么重点
使用dfs.

使用dfs的搜索可以抽象为下面几个要素:

1.  有n个决策
2.  每一个决策有k种取值方式
3.  每一个决策可能的取值只受到之前决策的影响. 换句话说, 每一个决策不会受到未知决策的影响.

这样子才可以保证搜索的过程中, 当前阶段i的所有可能决策都是确定的.

比如这里的决策就是每一个数值取得什么数值, 取值范围为1-9, 但也有限制,
第 `i` 个决策可以取得的数字受到之前决策的影响(不可以重复), 同时第 `i` 个决策
得到的数值可以被i整除.

使用dfs还有一个需要分析的是: 哪些中间计算信息需要被传递到下一层的搜索过程中.

对应这个题目, 第i层的搜索需要下面的信息:

1.  当前搜索的层次i
2.  之前搜索得到数值的结果(用来计算当前决策之后的前i个数值结果)

所有的递归都需要分析一个东西: 什么时候结束, 这里就是可以搜索完成最后一个数字.

得到下面代码:

```C++
void dfs(int i = 1, int v_last = 0)
{
    if(i == 10) {
        // 输入结果
    }

    for(int k = 1; k <= 9; ++k) {
        if(is_used[k]) continue;    // 这些都是剪枝
        int cur_v = v_last*10 + k;
        if(cur_v % i != 0) continue;

        data[i] = k;
        is_used[k] = true;      // 调用下一层需要保存和还原状态
        dfs(i+1, cur_v);
        is_used[k] = false;
    }
}
```

#### wrap up

1.  n步决策, 有限选择, 求解一个特定选择方式的题目都可以想到dfs.
2.  dfs的实现重点:
    1.  每一步决策的限制条件是什么.
    2.  用来传递给下一层搜索的中间信息是什么.
    3.  每一次决策之后改变了什么状态, 记得在递归之后, 需要还原状态进行新的搜索.
    4   如何在第i层中进行剪枝优化.

### 方法二: 分析的方式

考虑一些基本的性质, 如果一个数可以被3整除, 那么数字之和一定是3的倍数, 就是:

1.  (a+b+c) 是3的倍数
2.  (a+b+c+d+e+f)是3的倍数, 且g是偶数

如果可以被5整除, 那么最后一个数一定是5, 所以e一定是5.

还有一些考虑将整除问题进行分解, 将一个大数分解为更小同解的数, 比如abcd如果
可以被4整除, 那么cd需要被4整除, 因为abcd = 100ab + cd, 而100ab就可以被
4整除, 所以只需要cd可以被4整除就可以了

## 计算N位回文数的个数

N位回文数表示数据总共有N位, 且数字构成了回文数.

这个问题由于各个数字之间没有约束关系(比如取了一个数值就不可以取另外一个数值),
所以每一个数字位上的数值可以独立的取值, 这点为我们考虑提供了思路:

1.  考虑每一个位置上可以取得的数值范围.
2.  考虑哪些位置上是独立分布的.

对于N位数字, 最高位的取值范围为1-9(注意第一位不可以为0), 其余都是0-9.
同时, 对于回文数而言, 如果一个部分确定了, 另外一个部分就是确定的, 所以如果
N为偶数:

$$
abcdef //bc取得任何的数值都可以得到对应的回文得到解数目为: 9*10^{N/2-1}
$$

如果N为奇数:

$$
abcde  //那么bc也是取得任何的数值, 只是c的数值对结果没有影响, b的数值被用来进行对称取值得到解的数目为: 9*10^{N/2}
$$

所以综合一下结果为: `9*10^(N/2} + N&1 - 1)`

### wrap up

1.  对于排列组合的问题, 明确可以独立分布的变量个数.
2.  明确每一个变量可以有的数值范围, 再进行排列组合.

## 扫雷游戏的概率

这个题目需要明确一个概念, 计算概率的问题, 都需要首先想明白, 样本空间是什么.

比如对于本体, 先从总体上考虑, 样本空间是: 在这3*5的区域中, 一共有2个雷情况下,
分配得到A,B,C三点有雷的概率. 另外一个可能的情况是在有3个雷的情况下, etc..

因为样本空间不一样, 所以这是一个条件概率, 首先分析的是, 在这3*15个区间中,
有2个雷的概率, 有3个雷的概率分别是多少, 再分析在样本确定条件下, 各个子节点
有雷的概率.

### wrap up

1.  概率和分布问题先要从总体上考虑该分布下样本空间是什么.
2.  如果有多个可能的样本空间, 先计算样本空间在不同情况下的概率, 再计算在样本空间
确定条件下对应的概率.
