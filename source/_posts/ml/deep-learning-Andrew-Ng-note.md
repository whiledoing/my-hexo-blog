---
date: 2018/4/21 14:21:29
tags: [ML,AI]
mathjax: true
title: Coursera - Andrew Ng - Deep Learning - 学习笔记
---

之前学完了[Coursera - Andrew Ng - Machine Learning][1]课程，受益匪浅，对machine learning的很多概念和实际应用有了更深入的理解。不过这个课程时间已经比较久了，那时ml的应用情况和现在应该有了天壤之别，所以内容上有些滞后。不过入门学习的话，还是推荐看一遍该课程。至少与我个人而言，觉得教的非常好，学习内容放在[博客中][2]。

Andrew老师最近创办了[deeplearning.ai][3]，主页上目前的内容是关于deep learning的课程。课程内容还是放在了[Coursera - Andrew Ng - Leep Learning][4]，所以继续学习，记录，总结。

PS。网易云课堂上有免费的[专业课][5]，一样的课程，而且上面字幕是中英对照的，看起来比较舒服，但我看了一会发现**没有课后问题，也没有编程作业**，所以还是转到coursera上学习。因为按我之前学习的经验，课后习题和编程作业非常重要，练习和编程实现可以极大地提高对知识的理解程度。（coursera上课程，7天免费，后面每月付费，价格适中）

<!--more-->

# Neural Network and Deep Learning

为什么deep learning这几年特别厉害？

![image_1cbjjlpbn131l5err5d1ipbh39.png-165.5kB][6]

主要归于：海量数据的采集；算法的创新；计算能力的提高。

数据到了一定量级时，神经网络相关算法相比于其它算法拥有统治级的表现。而计算神经网络，需要非常强大的计算能力。

模型的表示方法和之前学到的略有区别：

- 神经网络模型中将常量(bias node)从参数中去掉而使用新参数$b$，inter-spectrum。
- 单个误差函数记做$\mathcal{L}$，lost function，损失函数。

![image_1cbk9eq4khivnibo04st8o813.png-109.4kB][7]


上图体现了微分的级联性质（分级去思考微分确实更容易理解和推导），比如：

$$ da={d\mathcal{L} \over da}=-{y\over a}+{1-y \over 1-a} $$
$$ {da \over dz}=a(1-a) $$

这样子两者一结合就可得到：

$$ dz={d\mathcal{L} \over da}{da \over dz}=a-y $$

对logestic模型而言，基本上就是上面的公式，如果要再对具体参数求导，可进一步分层计算，就比较容易分析了。

---

python的numpy库进行矩阵运算时，会进行broadcasting扩展，就是将矩阵的维度进行自动扩展：

![image_1cbk4ja891dfi1c531s45bhc88km.png-147kB][8]

简洁是简洁了，但使用时候，需要更加明确矩阵的维度信息，不要用错了broadcasting。

使用numpy的array，需要留意，如果指定一个维度，那么不是矩阵，而是数组，比如`np.random.randn(5)`得到的不是向量（矩阵中的概念），而只是数组，如果需要使用向量，要明确指定维度，比如`np.random.randn(5, 1)`。我觉得这个设定更好，相比于octave/matlab专门用来矩阵运算语言，python使用面更广，区别好矩阵和普通数组显得有必要。同时，明确指定维度也符合python的设计原则：**Explicit is better than implicit.**

---

神经网络的模型表示方法也略微变化了一些：

![image_1cblv2ga614fe1oeglfi17k91sng1t.png-119.1kB][9]

使用**中括号表示层级**，而**小括号中内容表示不同数据**，这样子统一了表示。同样，使用常量参数$b$的表现形式更简洁。

activation function有几种形式：

![image_1cbm0mlpgi4v2nu11sd1jsrii2q.png-53.9kB][10]

之前主要使用的sigmoid函数只有在二元判定问题上可能使用，大多数时候使用tanh和ReLu。tanh其实是sigmoid的移位函数，但是引入了负数，中值为0，效果更好。而ReLu（rectified linear unit，线性整流函数）是业界使用最多的，兼具了效果和计算效率。最后一种叫做Leaky ReLu，变种，使用也不多。

理解神经网络最难的部分就是反向传播的计算，最好的理解方式是按照偏导数的链接性来理解：

![image_1cbm44tnu76l1o8o15lbul37q37.png-138kB][11]

从图中可以看出，计算参数的导数是反着计算的（图中的相应函数是sigmoid）。为了求最开始参数对损失函数$\mathcal{L}$的导数，就需要计算其前一个参数的导数，依次推导，反向求解。

最先推理过程时，先不考虑数据维度，而只考虑特征维度和层维度（去掉小括号，不考虑有$m$个数据，只考虑一个数据向量），然后矩阵方程推导完成后，可以无缝的添加到数据维度。添加时，只需要将特征向量横向扩展，不改变之前推导公式的矩阵运算方式（计算结果对$m$求平均）。这样子降维分析降低了推导的难度，也可以想的更清楚。(这需要数据的表达模式统一，数据向量都按照列表示，多数据，就是多列，所以中间结果都按照这个框架统一）

对于两层的神经网络，计算公式整理如下（图片截取于课程作业）：

![image_1cbm7fkfdjvq6uab5pt29bd3k.png-219.8kB][12]

一定要注意上面激活函数的区别，在最后一层是sigmoid函数，所以才有$dz^{[2]}=a^{[2]}-y$（二元判定才使用），但在中间的函数使用的是$tanh$，其导数是$g^{[1]'}(z)=1-a^2$。

如果考虑多层，其计算模型可以抽象为下图（图片截取于课程作业）

![image_1cbn03ohnh10vcv11of12rfq6q5l.png-283.7kB][13]

正向计算单元的任务是根据$a^{L-1}$计算得到$a^{L}$，而反向计算的过程是根据$da^{[l]}$计算得到$da^{[l-1]}$。正向计算过程中，将$z,W,$缓存，便于后续反向计算导数。

实现的技巧是将每个计算函数（正向和方向）都**抽象为一个函数/模块**：

```python
# 反向计算核心代码
# relu_backward是将当前层的A和当前层的Z（activation_cache）做为输入，根据导数计算出dZ。
# 再级联考虑，将当前层的dZ和原始数据W, b, A_prev（linear_cache）作为输入，推出dA_prev作为下一个迭代的输入数据。
dZ = relu_backward(dA, activation_cache)
dA_prev, dW, db = linear_backward(dZ, linear_cache)
```

实现NN模型的注意点和[之前整理][14]的差不多。

---

其实所谓的Deep neural network就是神经网络的层数高。为什么层数高相对效果也更好？

![image_1cbmp7t75mqa10v1141p1cm576141.png-157.3kB][15]

上图给出一个启发性的说明。神经网络的每个节点都可以看做一种抽象信息处理单元。比如考虑人脸识别的模型，最开始的节点提取「线段」信息，后面节点提取「组件信息」，最后组合起来提取出「面部」信息。脑科学的研究也表明，人脑的识别过程也是分层的，点线面的识别方式。所以层数越多越能更好的拟合实际模型。

---

hyperparameters vs parameters

![image_1cbmplc331tad1uh315nj1md81ph44e.png-61.5kB][16]

相比于$W$这种直接计算的参数而言，另外需要给出假设值的参数叫做hyperparameters（超参数）。超参数决定了普通参数的最终结果。一般超参数比较依赖于经验设定，常见的方法是多测试集中参数，比较得到比较好的数值。

---

# Improving Deep Neural Networks: Hyperparameter tuning, Regularization and Optimization

模型评估的方法和[之前的整理][17]的差不多，下面整理内容主要是之前没有总结过或者知识结构有些变化的内容。

cross validation set也叫做dev set。在数据量不多时，可以按照60/20/20的比例来分配train/dev/test集合的数据比例。但在数据很多时，比如一百万，百分之一就是一万，可以按照98/1/1来分配，并不需要那么多的dev/test。

采集数据时候的经验法则：

1. train数据需要比较精确，准确度高。
2. dev/test数据可以相对不精确（这样才可以测试出学习的效果）
3. dev/test数据要保证同概率分布（我理解就是同源的意思，这样子用dev调教的结果才可以更好的用来验证test，如果两个不同分布，dev的调教结果就没有太大意义。）

面对bias/variance时的处理流程：

- 先少量数据看是否有high bias，如果有，可以提高神经网络的层级，引入更多复杂的特征，或者调整神经网络的架构。（might help）
- 解决了bias，看有没有variance，如果有，可以引入更多的数据，regularization，或者调整神经网络架构（might help）

![image_1cbo6rtme19a5m631qdf18ga1oo362.png-82.6kB][18]

以前ml算法会讨论「bias and variance tradeoff」，因为以前的算法总是无法兼顾两者的数值。但是随着现在deep learning算法的兴起，在大数据和大网络的情况下，是可以兼顾bias和variance，所以现在也就不怎么提tradeoff的事情。

---

regularization计算模型中引入两个术语：

![image_1cbo78s3ro0g1a7k1cdjur51l287f.png-110.4kB][19]

- Frobenius norm：费罗贝尼乌斯范式，其实就是一个矩阵所有元素的L2距离求和。
- weight decay: regularization的计算其实就是一种weight decay，原来的weight加入regularization就等于先自减一个比例$1-{\alpha\lambda \over m}$

为什么regularization可以降低overfitting。

从网络计算复杂度角度来理解：

![image_1cbo7mg97rvj4qdtv216mo1p9.png-114.8kB][20]

如果$\lambda$越大，规约越强，权重矩阵数值越小，越接近0，这就等于**去掉了神经网络的复杂节点**，模型越简单，越接近于线性模型。

另一个角度可以从激活函数（非线性）角度分析：

![image_1cbo7uit316egjs39kr3jq17oa1m.png-80.2kB][21]

如果$\lambda$越大，规约越强，权重矩阵数值越小，越接近0，$z$就越小，激活函数的计算集中在**线性导数区间段**，也就是说，模型的非线性模型退化成线性模型。

当然regularization的作用不是将模型降维线性，而是找到中间值，去掉overfitting的成分，让结果just right

另外一种regularization的方法是dropout regularization：计算节点的时候**随机去掉一些节点的结算结果**：

![image_1cboj4tcs2vhj1ekodkkb144j2j.png-105.4kB][22]

dropout regularization计算的想法是：不要依赖任何一个特征，降低权重的方差。也就是说，让权重分布的更加均匀，而不依赖于相对权重较大的特征。所以计算时，随机去掉一些节点的计算结果，让所有的节点都对最后的权值起到平均的效果。

课程中说明，droupout的方法是一种regularization方法，只有在模型变得overfitting的时才考虑使用。在计算机视觉领域用droupout比较多，因为视觉领域特征非常多，所以在计算量有限的情况下，数据可能没有那么多，就需要dropout的方式来降低计算量，同时，降低权值对特征的依赖。（特征多，不希望有主次）

---

对数据进行normalization处理（中值为0，方差为1）可以提高算法运行速度：

![image_1cbojoo4b1alc1euu1om51i621l1c3d.png-195.9kB][23]

数据维度不同时，梯度下降的数值也变得不在一个级别上，进而影响下降速度。

---

初始化权重系数也有讲究，一个要求权重数值小，一个要求权重方差小。

如果初始权重数值比较大，那么计算的响应也会偏大，偏大的激活对应的导数比较小，梯度计算的时候下降比较慢，收敛慢。（考虑back-propagation时激活函数的导数越小，对应下降梯度越小）

另一个是方差要小，这点我的理解是：在深层网络模型中，如果权重之间差异大，那么经过L层网络的放大，不同节点输出参数也比较大，进而导致收敛的维度不一样，影响收敛速度（考虑上面说normalization时贴的图）。

换一个启发的理解方式——如果一个人学习一个东西，上来其掌握了大多数知识（权重大）或者存在掌握程度差异大的知识（有些学的特别好，有些特别差），人再去学习的动力就会小很多。一方面可能觉得没啥进步，一方面觉得学习边际收益太低（因为有些学的太快，学的慢的就是影响情绪）。所以，还是从一张均匀的白纸的状态出发来学习效果更好。

经验的计算方法：

![image_1cbokft2i6nf62m2t1757g293q.png-206.4kB][24]

初始化权重时，数据按照$W^{[l]} \sim \mathcal{N}(0, \sqrt{2 \over n^{[l-1]} })$分布取值（激活函数为ReLu）





---


  [1]: https://www.coursera.org/learn/machine-learning
  [2]: /2018/04/11/ml/coursera-machine-learning-course-note/
  [3]: https://www.deeplearning.ai/
  [4]: https://www.coursera.org/learn/neural-networks-deep-learning
  [5]: http://mooc.study.163.com/learn/2001281002
  [6]: http://static.zybuluo.com/whiledoing/nujp3k3xxmomlbh5yfnqi57b/image_1cbjjlpbn131l5err5d1ipbh39.png
  [7]: http://static.zybuluo.com/whiledoing/qlupqb397psgao24at1y2b0b/image_1cbk9eq4khivnibo04st8o813.png
  [8]: http://static.zybuluo.com/whiledoing/tsy9tyd16bb78qzs462a4w74/image_1cbk4ja891dfi1c531s45bhc88km.png
  [9]: http://static.zybuluo.com/whiledoing/josxxrwtnd5cewwwgad8z9mw/image_1cblv2ga614fe1oeglfi17k91sng1t.png
  [10]: http://static.zybuluo.com/whiledoing/ksm5x616y4q7m3jvci8ps42n/image_1cbm0mlpgi4v2nu11sd1jsrii2q.png
  [11]: http://static.zybuluo.com/whiledoing/tezg7kf2ebpu6awzhw56ed4y/image_1cbm44tnu76l1o8o15lbul37q37.png
  [12]: http://static.zybuluo.com/whiledoing/a1xqv39ll11q8zpdplklhf9h/image_1cbm7fkfdjvq6uab5pt29bd3k.png
  [13]: http://static.zybuluo.com/whiledoing/8tza12fxrvvgu0glzyyb00gn/image_1cbn03ohnh10vcv11of12rfq6q5l.png
  [14]: /2018/04/11/ml/coursera-machine-learning-course-note/#implementation
  [15]: http://static.zybuluo.com/whiledoing/5bn1jsvadh6nsbeyw3iytfq7/image_1cbmp7t75mqa10v1141p1cm576141.png
  [16]: http://static.zybuluo.com/whiledoing/ugtt5xbnt8kazzzmzqpezprq/image_1cbmplc331tad1uh315nj1md81ph44e.png
  [17]: /2018/04/11/ml/coursera-machine-learning-course-note/#evaluating-improve
  [18]: http://static.zybuluo.com/whiledoing/2ae226uv5760sv1iii8wyowh/image_1cbo6rtme19a5m631qdf18ga1oo362.png
  [19]: http://static.zybuluo.com/whiledoing/wo7w0355gastpm2z03rva319/image_1cbo78s3ro0g1a7k1cdjur51l287f.png
  [20]: http://static.zybuluo.com/whiledoing/9jaijdjoi2e9k5s7lyzpb9ql/image_1cbo7mg97rvj4qdtv216mo1p9.png
  [21]: http://static.zybuluo.com/whiledoing/gaqcg9cfx6pea3eyn4c4mnqo/image_1cbo7uit316egjs39kr3jq17oa1m.png
  [22]: http://static.zybuluo.com/whiledoing/d88fwrw4a8ucigfzh16mh3sm/image_1cboj4tcs2vhj1ekodkkb144j2j.png
  [23]: http://static.zybuluo.com/whiledoing/scgnkz6swme7ugekusawb04p/image_1cbojoo4b1alc1euu1om51i621l1c3d.png
  [24]: http://static.zybuluo.com/whiledoing/ojeb0o2fk6ebol3foacrjy5f/image_1cbokft2i6nf62m2t1757g293q.png