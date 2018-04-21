---
date: 2018/4/21 14:21:29
tags: [ML,AI]
title: Coursera - Andrew Ng - Deep Learning - 学习笔记
---

之前学完了[Coursera - Andrew Ng - Machine Learning][1]课程，受益匪浅，对machine learning的很多概念和实际应用有了更深入的理解。不过这个课程时间已经比较久了，那时ml的应用情况和现在应该有了天壤之别，所以内容上有些滞后。不过入门学习的话，还是推荐看一遍该课程。至少与我个人而言，觉得教的非常好，学习内容放在[博客中][2]。

Andrew老师最近创办了[deeplearning.ai][3]，主页上目前的内容是关于deep learing的课程。课程内容还是放在了[Coursera - Andrew Ng - Leep Learning][4]，所以继续学习，记录，总结。

PS。网易云课堂上有免费的[专业课][5]，一样的课程，而且上面字幕是中英对照的，看起来比较舒服，但我看了一会发现**没有课后问题，也没有编程作业**，所以还是转到coursera上学习。因为按我之前学习的经验，课后习题和编程作业非常重要，练习和编程实现可以极大的提高对知识的理解程度。（coursera上课程，7天免费，后面每月付费，价格适中）

<!--more-->

# Neural Network

为什么deep learning这几年特别厉害？

![image_1cbjjlpbn131l5err5d1ipbh39.png-165.5kB][6]

主要归于：海量数据的采集；算法的创新；计算能力的提高。

数据到了一定量级时，神经网络相关算法相比于其它算法拥有统治级的表现。而计算神经网络，需要非常强大的计算能力。

模型的表示方法和之前学到的略有区别：

- 神经网络模型中将常量(bias node)从参数中去掉而使用新参数$b$，inter-spectrum。
- 单个误差函数记做$\mathcal{L}$，lost function，损失函数。

![image_1cbk9eq4khivnibo04st8o813.png-109.4kB][7]


上图体现了微分的级联性质（分级去思考微分确实更容易理解和推导），比如：

$$
da\text{(简写法)}={d\mathcal{L} \over da}=-{y\over a}+{1-y \over 1-a} \\
{da \over dz}=a(1-a)
$$

这样子两者一结合就可得到：

$$
dz={d\mathcal{L} \over da}{da \over dz}=a-y
$$

对logestic模型而言，基本上就是上面的公式，如果要再对具体参数求导，可进一步分层计算，就比较容易分析了。

---

python的numpy库进行矩阵运算时，会进行broadcasting扩展，就是将矩阵的维度进行自动扩展：

![image_1cbk4ja891dfi1c531s45bhc88km.png-147kB][8]

简洁是简洁了，但使用时候，需要更加明确矩阵的维度信息，不要用错了broadcasting。

使用numpy的array，需要留意，如果指定一个维度，那么不是矩阵，而是数组，比如`np.random.randn(5)`得到的不是向量（矩阵中的概念），而只是数组，如果需要使用向量，要明确指定维度，比如`np.random.randn(5, 1)`。我觉得这个设定更好，相比于octave/matlab专门用来矩阵运算语言，python使用面更广，区别好矩阵和普通数组显得有必要。同时，明确指定维度也符合python的设计原则：**Explicit is better than implicit.**













































































---


  [1]: https://www.coursera.org/learn/machine-learning
  [2]: /2018/04/11/ml/coursera-machine-learning-course-note/
  [3]: https://www.deeplearning.ai/
  [4]: https://www.coursera.org/learn/neural-networks-deep-learning
  [5]: http://mooc.study.163.com/learn/2001281002
  [6]: http://static.zybuluo.com/whiledoing/nujp3k3xxmomlbh5yfnqi57b/image_1cbjjlpbn131l5err5d1ipbh39.png
  [7]: http://static.zybuluo.com/whiledoing/qlupqb397psgao24at1y2b0b/image_1cbk9eq4khivnibo04st8o813.png
  [8]: http://static.zybuluo.com/whiledoing/tsy9tyd16bb78qzs462a4w74/image_1cbk4ja891dfi1c531s45bhc88km.png