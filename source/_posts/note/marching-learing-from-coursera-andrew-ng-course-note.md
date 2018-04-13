---
date: 2018/4/11 16:04:47
tags: [自写,ML,AI]
title: Coursera - Andrew Ng - Maching Learning - study notes
---

非常好的机器学习入门教程 [Coursera - Andrew Ng - Marching Learning](https://www.coursera.org/learn/machine-learning)。记录一下我的学习笔记。

课后编程作业非常有意思：[实现代码](https://github.com/whiledoing/coursera-maching-learning-course-homework)

<!--more-->

- supervised learning(监督学习):  使用已经标注的数据计算出模型，regression/classification 
- unsupervised learning(无监督学习): 使用没有具体标记信息的数据，计算机分类得到模型，cluster(聚类) 

# Regression

## Linear Regression

回归模型的定义如下，其中h表示hypothesis，是一个术语符号：

![火狐截图_2018-04-11T08-30-58.856Z.png-12.9kB][1]

cost function, squared error function, 其中1/2是因而计算机计算方便而引入（求导的时候会乘以2）:

![image_1captt1gopjiis51rakjacfvj2e.png-9.5kB][2]

计算多元函数的最小值使用「梯度下降算法」(Gradient Descent)

算法的直观印象就是：从一个点开始，找到当前位置最好的下降方向前进一小步，然后持续迭代。

![image_1capvr0ld1gciudg1paegrb1frt5q.png-124.8kB][3]

算法计算时需要**同步计算**，每一阶段计算数值是基于上一个阶段：

![image_1capvvu2110aeot311ctsmvukk67.png-58.2kB][4]

所以代入公式可以计算得到「线性回归」构成的方程式的梯度下降计算公式：

![image_1caq1hvla18ehb161jq611l61fm76k.png-31.6kB][5]
![image_1caq1ibh61me21q5jsa0qc41l2d71.png-16.7kB][6]

上面公式的$i$表示数据的编号，而$j$表示特征的编号，$m$表示数据编号的个数，$n$表示特征的个数（脑子中应该有一个二维矩阵了）

计算之前需要将数据进行标准化，否则，如果数据范围太不规范，会导致算法很难收敛。一种有效方式是均值标准化(mean normalization)

![image_1caq69k9q1cli1vjgqtm16521vpt7e.png-18.6kB][7]

实际计算过程中，需要选择合理的$\alpha$，如果不收敛，多数是因为$\alpha$**太大了**

![image_1caq6spqd1fdpeh8pug12qvfuf7r.png-86.1kB][8]

特征也可按照多项式方式进行选择(polynomial regression)：

![image_1caq7bgt91o16e3718vcjaq1e588.png-87.2kB][9]

对于线性方程而言，有解析解，就是$J(\theta)$直接对$\theta$求导，得到的结果是$(X^T X)^{-1} X^T y$，用解析和算法解有不同的应用场景：

![image_1caq9h54ksun19vjlm7391qus8l.png-39.6kB][10]

当然还有一种情况就是根本无法求$(X^T X)^{-1}$

实际计算的时候，我们不是用循环来实现代码，而是要转换为矩阵的形式，比如考虑上面的梯度计算公式，矩阵化的计算公式改为：

$$\theta = \theta - \alpha {1 \over m} X^T(X \theta - y)$$

转化的点有：

1. 将求和看做矩阵相乘。
2. 求和坐标就是矩阵相乘中间的维度（规约）。
3. 根据矩阵维度调整顺序，比如公式中$X$放在右边，计算矩阵时调到左边，且调为$X^T$。

## Logistic Regression

分类问题的假设函数(hypothesis)是概率函数，将原来任意数值规约到$[0, 1]$之间，所以裹了一层sigmoid/logistic函数：

![image_1cas7fbcqv3ghirfqm1jiekau9.png-45.5kB][11]

进而认定$h_\theta(x)$的含义是输出结果为1的概率：

![image_1cas7i2uo110f6qa6h1htg1t6fm.png-9kB][12]

根据公式，决策的依据变成$(\theta>0) => (P(y)>0.5)$，判定的边界叫做decision boundaries，在图形上可以表示出来：

![image_1cas8bc9s1cov1hc0l5l6gs1tql13.png-266.2kB][13]

接下来考虑代价函数，肯定不能是线性拟合中的直接计算均方差的方式，因为直接计算的方式代价函数不是凸函数，不好优化计算。

考虑数据特点，$h(\theta) \in [0, 1]$，在这个基础上，如果$y=0$，那么$h(\theta)$如果也靠近0（注意是概率），那么代价小；反之，如果靠近1，说明分类结果是A类，但假设函数得到B类，代价要特别大。直观上特性符合log：

![image_1cas9ehqv1trp1fhi1acg1dl11bek1g.png-82.6kB][14]

分段函数不好计算，所以采用融合形式：

![image_1casb4ula1fri1fov53bf4f98f1o.png-7.3kB][15]

然后神奇的事情出现了，递归下降求解的数学形式和线性拟合居然一模一样，真是math magic:

![image_1casb90m87ls1fs94e0l9ij2t25.png-24kB][16]

拓展到多元的分类问题思路就是：将多元分类器看成N个一元分类器，然后选择概率最大的作为分类结果（数学的类比思维真重要）：

![image_1casc9kn5104b105muvv97r19vm2i.png-59.2kB][17]

我想这也是为啥分类的算法叫做logistic regression，而不是xxx classification的原因，因为最底层的优化函数被统一了，只是hypothesis函数定位不同而已：

1. 本质上都是优化问题，只是代价函数不同。
2. 通过数学的方式，将分类转换为概率，然后转换为代价，然后转化为优化问题。

## Overfitting

数据特征太多（远多于数据量），或者数据特征选择不当（高阶特征太多），就可能出现过拟合：测试集合拟合的非常好，但是预测函数并不能有效预测未知数据。

![image_1casg99be3kh6qjstc1grc181q3p.png-182.1kB][18]

为此，提出了一个方法叫做regularization parameter：将控制参数$\theta$变得尽量小，这样子不容易出现overfitting（不是很好解释，直观感受就是如果高阶特征的$\theta$过大，更容易导致拟合函数更高阶化）:

![image_1casejkoi1ian1joj1afraq0h232v.png-86.1kB][19]

其中参数$\alpha$叫做规约化参数，如果$\alpha$过大，会使所有$\theta$都被抑制到非常小，近乎于0，完全没有高阶特征，导致underfit。

代入到linear regression公式中，变成：

![image_1casfp2op1psq7lo1gm8qj21vgv3c.png-33.6kB][20]

注意，其中$j$的讨论有两种格式，习惯上，不对$\theta_0$进行规则化（可能会有细微的差别）。

# Neural Networks

考虑线性模型没有办法解决下面的问题：

1. 特征太多，无法进行计算。线性模型如果考虑多阶数据，计算量成次方级数增长。
2. 现实世界大多数问题不是线性。

## Concept

神经网络模型模拟大脑的神经元构造方式：

1. 引入层的概念。
2. 每一层的数据是上一层数据传导之后的激励(activation)
3. 最后一层输出结果。

![image_1casojudk1e89pm31sp0l051eo946.png-143kB][21]

![image_1casos2oe1m381cql120e1ge76au4j.png-80.4kB][22]

其中，有几点说明:

1. 中间叫做隐藏层(hidden layer), 两边叫做输入层和输出层。
2. 每一层的第一个数据$a_0^j = 1$，叫做bias nodes
3. $z^j = \Theta^{j-1} a^{j-1}$ 表示每一层的$z$数值是上一层数据传导到新一层的结果。实际结果还需要logestic，就是$a^{(i)} = g(z^i)$
4. $\Theta^j$表示权重矩阵(weights matrix)，第$j$层的维度是$s_{j+1} \times (s_j + 1)$，计算方式是右乘数据，且要注意0号数据的存在。

启发性的说明神经网络可以有效工作的示例：

![image_1castem9c10mn12prnu61duf1tdo50.png-103.5kB][23]

通过不同的逻辑组合构造更加复杂的逻辑。神经网络工作原理大致如此：后一层的信息是对前一层信息的再加工和升华，组合起来得到更有效信息。

多元分类的过程就是将输出层设定为N个节点：

![image_1casua3r31e82vc73787hp15ga5d.png-138.4kB][24]

为了进行优化，首先需要定义代价函数，其实从regularized logistic regression的代价函数中延伸展开，将最终的hypothesis probablity和y加权统一，别切考虑所有的权重参数：

![image_1caufonua13118vd11boll915ql5q.png-13.3kB][25]

其中：

![image_1caufp55q1om0gjd15pnn2mmkd67.png-10.7kB][26]

需要说明的是：规约参数的时候，不考虑bias nodes，所以计算$\Theta_{j,i}$的时候，其实际维度是$s_{l+1} \times s_l$.

## BP

计算优化的问题核心主要是计算$\Theta$对于$J$的偏导数，这里直接给出计算方法（想了几遍也不是完全明白，只有一个直观上的认识）：

反向传播算法：

![image_1cauodm9a19c7t29oamtniom26k.png-182.2kB][27]

![image_1cauoesss148q1r1t17kev3ggtv71.png-158.5kB][28]

![image_1cauofts5pi0rt01kn0gb3p4d7e.png-212.5kB][29]

其中，主要引入了一个中间变量$\delta^{(l)}_j$

- 表示第$l$层第$j$元素的「误差」，这个误差实际含义是第$l$层的$cost(l)$对第$l-1$层没有logestic的$z^{(j-1)}$求导。
- 或者再换一个说法，表示前一层的$z^{(l-1)}$如何变化，第$l$层的偏差越小。

这是一种逆向思维，如果你需要得到最后的结果最小，就必须上一层的元素符合某种优化原则，依次递归分析上去。

## Implementation

实现神经网络算法的时候有一些注意点：

- rolling/unrolling parameters

    优化函数计算时，传入的$\theta$参数都是列数据，而我们这里的$\Theta$是多个矩阵构成的大数据，所以计算的时候，需要将矩阵压缩成向量。但是计算cost的时，再将矩阵还原回来，计算代价。
    
    ![image_1cauphph8beg1gibka1aug1idq9o.png-84.5kB][30]

- grandient checking。

    为了验证BP算法实现正确，重点是求导函数计算正确，可以用数值计算方式求导，然后验证是否计算正确。注意，实际计算BP时需要去掉验证，因为性能代价大。之所以用解析方式求导就是因为数值计算方式太耗性能。

    ![image_1cauphf96123f37gl5916hc19509b.png-6.9kB][31]

- random initialization

    初始参数**不可以对称**，如果对称，计算的中间结果都相同，得不到好效果。

    ![image_1cauplcbcr2h1oft1b7fbabrhsa5.png-76kB][32]

    课后作业中提到的一种比较好计算随机数范围的经验公式：
    
    ![image_1cauu23j2270lf1rovk7i4keav.png-36kB][33]
    
- network architecture

    隐藏层的节点个数要都一样，理论上隐藏层越多，效果越好，计算越多。

- wrap up

    ![image_1caupt47jv2a1bgrkua1cov1jmdai.png-38.8kB][34]

    not easy task.

后来我自己代码实现了一下，觉得有几个重点：

1. 要经常想着维度的概念，脑子里面要知道维度是多少，然后才可以有效地计算矩阵相乘。
2. 和logestic regression计算形式不一样，logestic的多元判定是计算K次结果，每一次判定的目标向量y是一个m元的向量`y == target_type`。但神经网络计算时候没有多次计算，这要求每一行数据计算得到的y就是一个向量，且其中只有一个数据是1，逻辑是`y = zeros(m, 1); y(target_type) = 0;`
3. 一定要小心bias node。

    计算反向误差$\delta$时，反向的结果考虑了bias node（正向计算输入层多一个节点，所以反向计算回来时也多一个），但这个数据并不用到，要小心。
    
    还有就是计算regularization时不考虑bias node，也需要去掉：
    
    ![image_1cav9fg8j1cttfov1im54021qoic6.png-179.4kB][35]

[代码实现][36]

# Evaluating & Improve 

已经实现了算法，那么如何评定一个算法是好是坏？如何确定特定的参数效果更好？如果确定了算法存在问题，应该如何改进？

课程中介绍了几种直观性的观测方法，以及对应不同情况的解决方式。

## Evaluating

使用交叉验证的方式来确定最好的参数，然后使用测试集合来确定模型的好坏：

![image_1cavhlhnvmrt106tb4fon6rolcj.png-52.3kB][37]

为什么不直接使用test测试集验证参数，并且评估好坏呢？

如果只有两个集合，那么test测试集合得到的参数只是在当前所有情况中找到最好的参数，但是**并不能说明对于未知数据评估的好坏**，直观理解上有点**矮子里挑将军的味道**，就是可能训练集合算出的参数都不好，但是还是在不好的参数堆中选了一个最好的，这并不能说明训练模型的好坏。

## Bias vs Variance

上面就说到了，过大的偏差对应underfit，过大的方差对应overfit。

通过交叉验证的结果可以大致判断当前模型是underfit还是overfit：

![image_1cavi2hi8nvu1kpt134t1mg068td0.png-41.6kB][38]

随着训练特征参数维度的提高，训练误差是会减少的，但是不代表可以预测数据，这就要看交叉验证训练集的误差。

- 当$J_{train}^{(\Theta)}$和$J_{CV}^{(\Theta)}$都很高，且数值接近时，underfit。这时候你训练的结果既不能拟合数据，也不能预测未知数据。
- 当$J_{train}^{(\Theta)}$很小，但$J_{CV}^{(\Theta)}$很大，且远大于$J_{train}^{(\Theta)}$的时候，overfit。这时候你训练的结果可以拟合数据，但不能预测未知数据。

换另外一个形式的解读：对于regularization的参数$\lambda$进行遍历交叉验证，可以得到大致图形：

![image_1cavii2q91uea1rb1dlit7kaordd.png-96.4kB][39]

可以看到随着$\lambda$的增大，高阶特性抑制越大，容易underfit，相反，容易overfit，从图中可以清晰看到大致情况。

另外一种判断当前拟合信息的方式是对训练集合的个数进行交叉验证，画出来的图形叫做**Learning Curves**。

两种情况：

![image_1caviqlo2jpfa6pfrljc3cdvdq.png-59.8kB][40]

![image_1cavir0hksdsodp1u9l1t0lag3e7.png-66kB][41]

总结就是：

1. 如果underfit，两个集合的误差都很大，数值也接近，数据越多并不能得到更好效果（因为压根没有办法拟合）
2. 如果overfit，两个结合的误差间隔较大，数据越多，效果会越好（因为高阶特性能更好的得到整体考虑，进而拟合出更好的模型。）

所以，总结一下，面对问题的解决方法：

| method | fix |
| :-: | :-: |
| Get more training examples | fix overfit |
| Try smaller sets of features | fix overfit |
| Try geJng addiDonal features | fix underfit |
| Try adding polynomial features | fix underfit |
| Try increase $\lambda $ | fix overfit |
| Try decrease $\lambda $ | fix underfit |









---


  [1]: http://static.zybuluo.com/whiledoing/h4dot4gnlp41hl8g5s8ll7n9/%E7%81%AB%E7%8B%90%E6%88%AA%E5%9B%BE_2018-04-11T08-30-58.856Z.png
  [2]: http://static.zybuluo.com/whiledoing/yhkfa3xclr5fnxh62yavmhdc/image_1captt1gopjiis51rakjacfvj2e.png
  [3]: http://static.zybuluo.com/whiledoing/elswofruwx3pltr18x4a8g3i/image_1capvr0ld1gciudg1paegrb1frt5q.png
  [4]: http://static.zybuluo.com/whiledoing/n1916iam7625rhhqxerv8227/image_1capvvu2110aeot311ctsmvukk67.png
  [5]: http://static.zybuluo.com/whiledoing/d61w9aluor048gr3hiduekbg/image_1caq1hvla18ehb161jq611l61fm76k.png
  [6]: http://static.zybuluo.com/whiledoing/fmdsy5tfia3j2t9798rx8zyp/image_1caq1ibh61me21q5jsa0qc41l2d71.png
  [7]: http://static.zybuluo.com/whiledoing/3xwerje3loudzwf435dexuts/image_1caq69k9q1cli1vjgqtm16521vpt7e.png
  [8]: http://static.zybuluo.com/whiledoing/j2loy86mul64eph6ikpwr5kh/image_1caq6spqd1fdpeh8pug12qvfuf7r.png
  [9]: http://static.zybuluo.com/whiledoing/2se7bvxkuuuxzfcs5uqzlksn/image_1caq7bgt91o16e3718vcjaq1e588.png
  [10]: http://static.zybuluo.com/whiledoing/doo906jrekp2fgillh3ptddc/image_1caq9h54ksun19vjlm7391qus8l.png
  [11]: http://static.zybuluo.com/whiledoing/omomzjmkyknip8yql4m8nimi/image_1cas7fbcqv3ghirfqm1jiekau9.png
  [12]: http://static.zybuluo.com/whiledoing/397uebk9hejll47d92iypfki/image_1cas7i2uo110f6qa6h1htg1t6fm.png
  [13]: http://static.zybuluo.com/whiledoing/d5xdfad9jl17nlwj13gwb5xq/image_1cas8bc9s1cov1hc0l5l6gs1tql13.png
  [14]: http://static.zybuluo.com/whiledoing/l8gyfb4dbvqt7fdih5j3ifbu/image_1cas9ehqv1trp1fhi1acg1dl11bek1g.png
  [15]: http://static.zybuluo.com/whiledoing/4yc5wz5c4kojvjwlzazgb0kf/image_1casb4ula1fri1fov53bf4f98f1o.png
  [16]: http://static.zybuluo.com/whiledoing/nxbrap94xk2zocmrtq4xpxzg/image_1casb90m87ls1fs94e0l9ij2t25.png
  [17]: http://static.zybuluo.com/whiledoing/2xzw42bqcteahe1r9nx2td4w/image_1casc9kn5104b105muvv97r19vm2i.png
  [18]: http://static.zybuluo.com/whiledoing/2ndvr6uunzzo20yv4dk0czgt/image_1casg99be3kh6qjstc1grc181q3p.png
  [19]: http://static.zybuluo.com/whiledoing/4kaoldaqwvex2shgcxwsps2j/image_1casejkoi1ian1joj1afraq0h232v.png
  [20]: http://static.zybuluo.com/whiledoing/6fjgrd5uwpifcfz0bbzh76ul/image_1casfp2op1psq7lo1gm8qj21vgv3c.png
  [21]: http://static.zybuluo.com/whiledoing/2k99j77cmcbz8mehpax6wm9d/image_1casojudk1e89pm31sp0l051eo946.png
  [22]: http://static.zybuluo.com/whiledoing/xx5332qha71ptyuslw9qa5g3/image_1casos2oe1m381cql120e1ge76au4j.png
  [23]: http://static.zybuluo.com/whiledoing/ut72ua7zcbg3bf8e1koxrpmw/image_1castem9c10mn12prnu61duf1tdo50.png
  [24]: http://static.zybuluo.com/whiledoing/tsuqbyzohvdfywoib5b4eyvf/image_1casua3r31e82vc73787hp15ga5d.png
  [25]: http://static.zybuluo.com/whiledoing/5mdm4tti708icrez79kp0x0d/image_1caufonua13118vd11boll915ql5q.png
  [26]: http://static.zybuluo.com/whiledoing/xp6pxd39d7d1ro6akbqj78yy/image_1caufp55q1om0gjd15pnn2mmkd67.png
  [27]: http://static.zybuluo.com/whiledoing/c91mea7ub6qqcl3uiwyjb5c6/image_1cauodm9a19c7t29oamtniom26k.png
  [28]: http://static.zybuluo.com/whiledoing/vogzgvqrmex1up2q2pjd6lsw/image_1cauoesss148q1r1t17kev3ggtv71.png
  [29]: http://static.zybuluo.com/whiledoing/6xi74jatu3dn5q5dfh9ase36/image_1cauofts5pi0rt01kn0gb3p4d7e.png
  [30]: http://static.zybuluo.com/whiledoing/i28tn1384j6nz6btfeadpce5/image_1cauphph8beg1gibka1aug1idq9o.png
  [31]: http://static.zybuluo.com/whiledoing/ekyp60amv94m0cdgo60so901/image_1cauphf96123f37gl5916hc19509b.png
  [32]: http://static.zybuluo.com/whiledoing/rh11nf55kdb9xflbyo7gxa2r/image_1cauplcbcr2h1oft1b7fbabrhsa5.png
  [33]: http://static.zybuluo.com/whiledoing/z095dc1biq8h5ahmkk2574zj/image_1cauu23j2270lf1rovk7i4keav.png
  [34]: http://static.zybuluo.com/whiledoing/v5t940jns8jpjnfem97ak2dt/image_1caupt47jv2a1bgrkua1cov1jmdai.png
  [35]: http://static.zybuluo.com/whiledoing/51mmgkes0n4d5jf0dk5e0bh1/image_1cav9fg8j1cttfov1im54021qoic6.png
  [36]: https://github.com/whiledoing/coursera-maching-learning-course-homework/tree/master/machine-learning-ex4
  [37]: http://static.zybuluo.com/whiledoing/wpymxc8jvao4dtd5q2jq4y57/image_1cavhlhnvmrt106tb4fon6rolcj.png
  [38]: http://static.zybuluo.com/whiledoing/6ondcdeov6h315sx6do5yead/image_1cavi2hi8nvu1kpt134t1mg068td0.png
  [39]: http://static.zybuluo.com/whiledoing/w5thsatfxf2ixladuv3k95ya/image_1cavii2q91uea1rb1dlit7kaordd.png
  [40]: http://static.zybuluo.com/whiledoing/eqph28ol1tsuos5s08tciork/image_1caviqlo2jpfa6pfrljc3cdvdq.png
  [41]: http://static.zybuluo.com/whiledoing/9dm51b7iejeuztwf6itjkrh6/image_1cavir0hksdsodp1u9l1t0lag3e7.png