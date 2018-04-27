---
date: 2018/4/21 14:21:29
tags: [ML,AI]
mathjax: true
title: Coursera - Andrew Ng - Deep Learning - 学习笔记
---

之前学完了[Coursera - Andrew Ng - Machine Learning][1]课程，受益匪浅，对machine learning的很多概念和实际应用有了更深入的理解。不过这个课程时间已经比较久了，那时ml的应用情况和现在应该有了天壤之别，所以内容上有些滞后。不过入门学习的话，还是推荐看一遍该课程。至少与我个人而言，觉得教的非常好，学习内容放在[博客][2]中。

Andrew老师最近创办了[deeplearning.ai][3]，主页上目前的内容是关于deep learning的课程。课程内容还是放在了[Coursera - Andrew Ng - Leep Learning][4]，所以继续学习，记录，总结。

又及，网易云课堂上有免费的[专业课][5]，一样的课程，而且上面字幕是中英对照的，看起来比较舒服，但我看了一会发现**没有课后问题，也没有编程作业**，所以还是转到coursera上学习。因为按我之前学习的经验，课后习题和编程作业非常重要，练习和编程实现可以极大地提高对知识的理解程度。（coursera上课程，7天免费，后面每月付费49刀）

又及，deep learning课程要求不可以公开作业代码，包括上传到github，所以不整理代码了。:laughing:

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

# Improving Deep Neural Networks

## Evaluation

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

## Regularization

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

另外一种regularization的方法是**dropout regularization**：计算节点时**随机去掉一些节点的结算结果**：

![image_1cboj4tcs2vhj1ekodkkb144j2j.png-105.4kB][22]

dropout regularization计算的想法是：不要依赖任何一个特征，降低权重的方差。也就是说，让权重分布的更加均匀，而不依赖于相对权重较大的特征。所以计算时，随机去掉一些节点的计算结果，让所有的节点都对最后的权值起到平均的效果。

<center>
<video width="620" height="440" src="/videos/dropout2_kiank.mp4" type="video/mp4" controls>
</video>
</center>

课程中说明，droupout的方法是一种regularization方法，只有在模型变得overfitting的时才考虑使用。在计算机视觉领域用droupout比较多，因为视觉领域特征非常多，所以在计算量有限的情况下，数据可能没有那么多，就需要dropout的方式来降低overfit，同时，也降低权值对特征的依赖。（特征多，不希望有主次）

其计算过程就是每次迭代计算的时候都随机选择节点，代码大致如下：

```python
# keep_prob参数表示保留的概率，如果是1，没有dropout，如果是0.8，0.2丢失。
# 所以随机选择数据，小于keep_prob的保留，设置为1，其余设为0
D = np.random.rand(A.shape[0], A.shape[1]) < keep_prob

# 将数据点乘Mask的矩阵D，然后除以keep_prob，这样子得到结果近似没有dropout结果
# 因为使用dropout数值变小，再除回来，近似原来数值，这个过程叫做**inverted dropout**
A *= D/keep_prob
```

同样，根据导数的级联特性，正向计算时候乘以了什么系数，反向计算时候导数也需要乘以什么系数，方向计算dropout大致代码：

```python
dA *= D/keep_prob
```

需要额外说明的是，dropout只用在training set，而不用在dev/test set，主要是用在改善训练的权重系数，而dev/test使用没有意义，反而导致输出结果的随机性。

## Optimization

所谓优化，就是用最少的计算得到最好的下降路径：

![image_1cbpf2kfiqv21cou13o018q61eeo9.png-411.3kB][23]

### Initialization

对数据进行normalization处理（中值为0，方差为1）可以提高算法运行速度：

![image_1cbojoo4b1alc1euu1om51i621l1c3d.png-195.9kB][24]

数据维度不同时，梯度下降的数值也变得不在一个级别上，进而影响下降速度。

---

初始化权重系数也有讲究，一个要求权重数值小，一个要求权重方差小。

如果初始权重数值比较大，那么计算的响应也会偏大，偏大的激活对应的导数比较小，梯度计算的时候下降比较慢，收敛慢。（考虑back-propagation时激活函数的导数越小，对应下降梯度越小）

另一个是方差要小，这点我的理解是：在深层网络模型中，如果权重之间差异大，那么经过L层网络的放大，不同节点输出参数也比较大，进而导致收敛的维度不一样，影响收敛速度（考虑上面说normalization时贴的图）。课程中形容这个现象叫做vanishing/exploding gradients，就是在激活数值极大和极小时，都会减低梯度的计算速度。

换一个启发的理解方式——如果一个人学习一个东西，上来其掌握了大多数知识（权重大）或者存在掌握程度差异大的知识（有些学的特别好，有些特别差），人再去学习的动力就会小很多。一方面可能觉得没啥进步，一方面觉得学习边际收益太低（因为有些学的太快，学的慢的就是影响情绪）。所以，还是从一张均匀的白纸的状态出发来学习效果更好。

经验的计算方法：

![image_1cbokft2i6nf62m2t1757g293q.png-206.4kB][25]

初始化权重时，数据按照$W^{[l]} \sim \mathcal{N}(0, \sqrt{2 \over n^{[l-1]} })$分布取值（激活函数为ReLu，这个方法叫做He Initialization）

### Mini-batch Gradient descent

关于mini-batch，在之前的[文章][26]中也整理过，其本质就是将数据分片进行训练，迭代。

![image_1cbpf5r8k1e2t24p1ejn1arv17eum.png-151.1kB][27]

![image_1cbpf7gsh14sg6jrarj95j1gmt1j.png-99.9kB][28]

如果只使用一个数据训练，叫做SGD，stochastic gradient descent，下降的噪声比较大。如果全局运算，叫做batch gradient descent，速度慢。所以mini-batch的效果居于两者之间。在大数据深度学习领域，基本都是mini-batch。

每一次迭代完所有的数据叫做epoch；使用2的倍数作为分片的大小。

### Gradient descent with Momentum

先介绍一种对时间序列数据去噪的方法Exponentially Weighted Avarages：

![image_1cbpfv6tq1ufrsklfmc1opdgoa20.png-213.7kB][29]

其中，$\theta_t$表示t时刻的数据，$v_t$表示t时刻**指数加权的数据**，参数$\beta$说明了加权的系数。稍加推导可以得到

$$\sum_{i=0}^{t}{\beta^{t-i}{(1-\beta)}\theta_i}$$

之所以叫做指数加权，是因为越远离t的数据影响系数指数递减。$v_t$约由前$1 \over {1-\beta}$个时刻的数据加权得到结果，因为到后面的影响就微乎其微了。故$\beta$越大，数据越平滑。

上述公式存在一个问题——初始计算的前几个节点因为没有之前数据可以加权，所以计算结果比较小。而一旦过了启动阶段，就没有问题。考虑图中紫色的线。解决方法是对数据进行校正：

$$v_t^{corrected} = {v_t \over {1-\beta^t}}$$

将这个概念引入梯度计算过程中，可以过滤掉因为mini-batch所导致的噪声：

![image_1cbph9agsv6g1obemg87bl1foa2d.png-217kB][30]

$$ \begin{cases}
v_{dW^{[l]}} = \beta v_{dW^{[l]}} + (1 - \beta) dW^{[l]} \\
W^{[l]} = W^{[l]} - \alpha v_{dW^{[l]}}
\end{cases}$$

$$\begin{cases}
v_{db^{[l]}} = \beta v_{db^{[l]}} + (1 - \beta) db^{[l]} \\
b^{[l]} = b^{[l]} - \alpha v_{db^{[l]}}
\end{cases}$$

可以用物理学的冲量概念来辅助理解，当施加一个新的加速度时，加速度不会瞬间改变速度方向而是和之前速度进行融合。

### Adam optimization algorithm

另外一个规约梯度的方法是对数据的平方进行指数加权，叫做RMSprop。

Adam算法将momentum和RMSprop结合起来一起优化：

$$\begin{cases}
v_{dW^{[l]}} = \beta_1 v_{dW^{[l]}} + (1 - \beta_1) \frac{\partial \mathcal{J} }{ \partial W^{[l]} } \\
v^{corrected}_{dW^{[l]}} = \frac{v_{dW^{[l]}}}{1 - (\beta_1)^t} \\
s_{dW^{[l]}} = \beta_2 s_{dW^{[l]}} + (1 - \beta_2) (\frac{\partial \mathcal{J} }{\partial W^{[l]} })^2 \\
s^{corrected}_{dW^{[l]}} = \frac{s_{dW^{[l]}}}{1 - (\beta_2)^t} \\
W^{[l]} = W^{[l]} - \alpha \frac{v^{corrected}_{dW^{[l]}}}{\sqrt{s^{corrected}_{dW^{[l]}}} + \varepsilon}
\end{cases}$$

经验上，设置$\beta1=0.9$，$\beta2=0.999$。参数$\epsilon$是为了保证分母不为0，一般设为1e-8。

直观上理解该算法就是对$dw$进行降噪，将数据变得平滑，同时对运动幅度进行修正。数学公式上看，又像是对数据进行normalization。

### Learning rate decay

$\lambda$是最主要调的hyperparameter之一。在开始阶段，梯度下降较快，但到了迭代后期，数据已经接近最优解，如果$\lambda$还是过大，可能影响收敛。基于这个思路，当迭代到后期时，缩小$\lambda$

$$\lambda = {1 \over {1+{decay\_rate}*{epoch\_num}}}$$

### Hyperparameter tuning

在数据量不多的情况下，对所有的hyperparameter进行grid search是可以接受的，因为单次运行时间并不多，可以对所有的参数进行扫地式搜索，但在大数据情况下不现实，而是使用**随机猜测**的方式训练模型。因为事先谁也不知道到底应该用什么参数，随机猜测可以更快用不同组合进行计算，进而可以更进一步缩小随机范围。

调整参数的时候，需要注意参数的scale策略。如果对$n^{[l]}$进行猜测，可能线性的随机函数就可以得到好的结果。但是对于$\lambda$系数，线性缩放很难取到0.01,0.001这类数值，但这些数值对结果是有影响的，所以使用指数缩放：

![image_1cbrb8m011brs1l0924j6s01kqr3k.png-150.5kB][31]

指数函数的输入越小，曲率越低，这就使得均匀采样的输入，对应的输出并不均匀。所以在数据比较小时，也可以保证输出数据范围较小，这就可以有效地取到0.01,0.001这样的数值。

## Batch Normalization

这个方法非常重要，可以有效的提高收敛速度，甚至改善模型效果。

课程中贴了一张图来说明Batch Normalization可以有效工作的原因：

![image_1cbrbln261n1t18qmdfpsve1sos41.png-333.9kB][32]

如果我们一直用黑猫来训练「是否是猫」的网络，并不能用来测试彩色猫。在一定程度上说，分割黑猫还是彩色猫的内部「逻辑」应该是一致的，只是因为数据的分布存在了一定的偏移，导致输出模型的偏移，这个叫做「Covariance Shift」。所以为了让模型的输出不依赖于具体的偏移，就需要对数据进行标准化。

其实在预处理环节就对输入数据进行了标准化，但这里是对输入手进行标准化，而Batch Normalization是对**隐藏节点的输出数据**进行标准化。换句话讲，是对模型输出的高阶信息进行标准化。

将每个隐藏层节点的输出看成一个随机变量，对其进行统计分析，得到其标准差和方差，然后归一化对应节点，这就是Batch Normalization的计算原理：

![image_1cbrcd71v6fv3ve1sra1niq1c0g4e.png-95.5kB][33]

其计算过程：

- 对m个数据（mini-batchsize）计算得到的$z$统计均值和方差。
- 对数据进行标准化处理。
- 再将数据的均值扩展到$\beta$，方差扩展到$\gamma$。只所以还需要扩展是因为数据的「内部逻辑」本身是有一个分布存在；另外，从激励函数角度考虑，如果数据都是$\mathcal{N}(0, 1)$分布，激励的范围太有限，甚至退化为线性模型。
- 将参数$\gamma$和$\beta$放到计算流程中，看做和$W$一样的参数进行求解（注意这里的$\gamma$和momentum中的参数不一样）

放到神经网络计算流程中就是：

![image_1cbrdinvm65ofmn1k9e1jbq9j65o.png-253.8kB][34]

我个人理解，其计算本质就是在拟合高阶信息(知识)的核心逻辑，而去掉了外在的干扰。比如，黑猫彩猫问题，分辨猫这件事情不应该让颜色作为干扰因素，所以将高阶节点进行标准化，拟合出一种不依赖外在干扰因素的模型。本质上，normalization就是去噪，统一标准，透过「现象看本质」。

## Softmax Regression

对多类别回归问题，使用softmax函数作为最后一层的激励函数。其计算过程是对最后一层的数据进行指数运算，$exp(z^{[l]})$，然后除以总和得到加权比例：

![image_1cbrdsdke9rn10s01ki8tcb1fcj65.png-171.7kB][35]

之所以叫做softmax是因为其计算的是经过规约化后的概率最大值，而不是实际的max运算（hard max）。也可以看出logestic是softmax在二元判定时的特例。

softmax的输出结果就是$\hat{y}$，用来统计最后的loss：

![image_1cbre3l0716i076214ectchkja6i.png-204.1kB][36]

# Structuring Machine Learning Projects

## ML Strategy

这里说的很多内容和之前课程中学到的[内容][37]差不多，就是如何评估你的模型，如何进行模型的比较和结果的分析。

一个大的指导原则是：正交化（orthogonalization）。每次调整方法只影响结果的一个方面，而不是一次调整多个。

另外就是要建立评估矩阵（evaluation matrics），将相关影响的指标都列出来，但最重要的是建立one single value的评价指标，该指标可以综合所有评价因素的权重。单一的指标的目的是可以更直观和快速的比较出结果好坏。

dev和test的集合需要分布同源。这点上文提到过，同源才可以保证目标一致。用dev调整的目标和test是一样的，否则用dev优化了半天，到test发现目标就错了。dev/test数据集合还需要包含可预估到的未来实际应用场景数据，这样子训练的模型才能更好的扩展到真实应用场景。

另外说到很多的一点就是评估人类的表现（human-level performance），这点对于分析模型的结果有很大的意义。

先说明一个概念——模型所能达到的理论最低误差叫做Bayes (optimal) error，我们训练模型的误差不可能低于Bayes error，但却有可能高于human error。但一般而言，在我们的模型没有超过人类之前，会将人类误差近似认为成Bayes error来进行模型分析：

![image_1cbrpccuh7i52sm1m81790hct7c.png-158.1kB][38]

考虑猫识别问题，如果人类识别猫的误差是1%，那么8%的training error明显就比较大，两者的差值叫做「avoidable bias」。因为有7%的avoidable error，所以需要先解决bias的问题，因为我们的模型离人类的标准都还差不少。但如果hunman error是7.5%，那么虽然training eror有8%，但我们更应该优先解决variance。human error是误差分析的基准。

下图说明了消除相关误差(bias/variance)的主要方法：

![image_1cbrqgrnq7pr1j76fep8cts3p86.png-46.6kB][39]

最后需要说明的是，在deep ml的一些领域（尤其是数据更加结构化的问题领域），机器学习已经超过了人类。:cry:

## Error Analysis

错误分析的本质是要重点问题重点分析，对于NN网络而言，一个比较好的方法是对错误计算的数据进行统计:

![image_1cbt9ov0tcv6fai1ks21h981oavag.png-66.2kB][40]

对不同种类的错误进行统计分析，优先修复比例大的问题。比如这里图像模糊会很大的影响识别效果，就可以考虑**合成一些模糊图像**到训练集合中。

额外说明的是，错误标识的数据是很有可能存在的。对于训练集合而言，错误标识数据如果由随机误差导致，问题不大（系统性的错误标识就有问题），可以不着急修复。而dev/test训练集合出现错误标识可以考虑处理，因为一定程度上影响了误差分析（比如和human-level进行比较）

## Arrangement for dev/test set

分配dev/test集合的数据其实很有讲究。一方面我们要保证dev/test数据同源，另一方面要保证dev/test的目标有实际意义，可以更好的体现核心场景，核心数据的拟合效果。

比如考虑识别猫猫的应用，如果有200,000图片是高清网络图片，10,000是用户拍摄的模糊的噪声大的图片，应该如何分配：

![image_1cbt9nvqk1l3j9vq1guubmhudg8j.png-245.8kB][41]

课程给出的建议是将5,000用户数据放到训练结合，另外5,000用户数据平均分到dev/test上。这样子可以保证dev/test有足够明确的目标：用户模糊图片的识别。而如果将所有数据shuffle再分配到dev/test，存在的问题是dev/test上数据很大一部分是高清数据，进而减小了拟合目标的明确性。

## Data Mismatch

如果training error是1%，而dev error是10%，是不是就可以说明模型overfitting呢？
i
按照之前的理解看起来是的，但这需要一个前提：training和dev数据同源。如果training和dev数据分布差别很大，就不能够说明问题。使用控制变量法进行分析，从training中提取一小部分做为training-dev集合，用其来验证是否有overfitting：

![image_1cbtb1qm61c51g807ko1hphiv5ba.png-66.7kB][42]

如果这时training-dev error是9%，说明没有训练的同源数据都没有拟合好，这才说明overfitting了。如果training-dev error是1.5%，那说明更多的误差是因为training和dev数据之前不同分布导致，这个误差叫做「data mismatch」。

下图是一个更全面的分析误差的矩阵，将数据分为general和user-case两个维度，将误差分为human-level、训练到数据、没有训练到的数据三个维度：

![image_1cbtb3gpchb7d191cll174cu0c4.png-76.3kB][43]

那么如何解决data-mismatch呢？没有特别系统的解决方法，但有一些策略可以参考：

- error analysis。具体问题具体分析，看看哪些点导致了问题。
- 将识别错误的用例加入到训练集合中。
- 人工合成法扩展错误用例。

比如考虑合成有噪声的语音：

![image_1cbtbnipgnocm83set1ef01100ch.png-106.8kB][44]

课程中说，合成方法在实际工程中真的可以解决问题！但也存在一定的风险：如果噪声数据规模很小，而需要合成的数据很多，模型的训练结果可能会对噪声数据overfitting。对于人而言，用不多的噪声数据合成就可以欺骗耳朵，但这点上，机器却更不容易欺骗。

## Learning from multiple tasks

神经网络之所以很有用，其中一个原因是因为可以**迁移学习**（课程中有一个视频是采访[Yoshua Bengio][45]，其中有一个问题是问他为什么坚持研究神经网络。Bengio的回答是，他觉得造物逻辑一定是非常简单的公式就可以描述的，就像流体动力方程，麦克斯韦方程，正态分布，有着极其简单的形式和数学的美。AI的模型应该是足够简单且通用的，可以自我学习。从这点上看，神经网络确实是目前最体现简单和通用之概念的模型）。

迁移学习的概念是可以将一个领域的网络迁移到另外一个领域：

![image_1cbteou5l47env11fal1uajjhdeu.png-149.8kB][46]

比如上图，在最后的输出环节进行「fine-tuning」，复用之前「pre-training」的模型。图中提到的例子是将识别猫的网络迁移到识别狗中；将通用语音识别迁移到trigger语音的识别中（唤醒设备「hi Siri」）

什么情况下从任务A转移到任务B是有效的：

- 任务A和B有相同的输入。
- 任务A的数据比任务B多。
- 任务A的低维度数据对学习任务B是有意义的。

另外一个维度的学习是多任务学习，一个网络同时学习多个任务：

![image_1cbtfs2p5uragnk17mb5gi1mepfb.png-155.1kB][47]

这和多类别识别不一样，多任务的输出结果中可能同时有多个1。比如上图的输出就有：是否有行人、汽车、停止标志、红绿灯。所以多任务识别不使用softmax进行最后的loss函数计算，而是直接统计所有任务的logestic数值。

什么情况下多任务学习是有效的：

1. 所有训练的任务都有共性的低阶特性。
2. （通常而言）每个任务的训练数据量相似。（如果有些任务数据特别多，训练可能对该任务过度拟合，进而影响了其他任务的识别）
3. 需要非常大的训练网络。（多任务学习网络在足够大时，效果并不会比单独训练任务模型得到的结果差。）

## End-to-end deep learning

end-to-end learning是指直接将输入和输出建立映射关系的学习，而不是需要将问题分解为多个步骤。

考虑语音识别系统：在没有dl之前的研究是将语音进行特征分割，词法分析，语义分析等环节，然后对输出结果进行翻译，但最后发现效果反而不入直接end-to-end学习效果好：

![image_1cbto7ltdnou4nm1iic2dplui8.png-52.6kB][48]

考虑另外一个引用场景，人脸识别，该问题却不是end-to-end效果更好：

![image_1cbtof8191d5bpe91p0h1ts1uc6k5.png-235kB][49]

人脸识别分为两个过程：1）找到人脸 2）将人脸图片缩放，匹配人员信息。

只所以分而治之更适用于人脸识别，有几个原因：

- 每个单独的问题都有很多的数据。比如第一个问题，可以很快的利用现有数据和研究成果得到不错的结果。
- 人类领域知识体现了更明显的步骤。（相比于语音识别构造的理解模式，人脸识别构造的步骤更有把握）
- end-to-end的数据不多。（考虑直接从图片训练识别人员信息，需要识别人员在各种角度上凹造型，数据采集成本高）

所以，总结一下end-to-end模式的优缺点：

|Pro|Con|
|:-:|:-:|
|数据自我表达内部逻辑。| 更少人为设计的步骤。|
|需要足够多的数据才有更好效果。| 缺少可能有用的人类领域经验知识。 |

换个角度考虑，机器学习的本质是通过数据获取知识。一种知识是无行为模式的，通过足够多的数以训练得到；另外一种知识是有行为模式的，是人类经验的延伸，利用这种知识可以加速机器学习的过程。所以综合而言，关键问题是**是否有足够多的数据**。

其实在复杂的ml领域，都是混合使用end-to-end和hand-designing components两种模式。

# Convolutional Neural Networks

## Concept of CNN

卷积操作在计算机视觉领域用的非常多，其核心是用一个$f \times f$大小的方块filter/kernel对图像块状区域进行加权运算，进而提取图像高阶特征：

![Convolution_schematic.gif-63.6kB][50]

卷积操作中有一个控制参数：

- $f$表示卷积大小，一般是奇数
- $p$表示填充大小，不填充数据的话，卷积会越算越小，同时去掉了边缘的信息。
- $s$表示每次操作移动大小，默认为1。
- 卷积操作之后的长度为$\lfloor{\frac {n+2p-f}{s}}\rfloor + 1$

将卷积操作做为提取特征的核心操作，类比到神经网络模型中，就得到了卷积神经网络。

在CNN中，filter是有第三维度的，加做channel，该channel的大小就等于上一层输入的节点数（类比于NN中的$W$第一维度是上层节点个数），然后将各个channel的filter和上一层节点数据依次运算，最后加权统一，得到本层的**一个特征**。比如下图就是对原始输入矩阵(R,G,B三个通道)数据进行一次卷积操作，得到新的特征：

![image_1cbuidcbbscnep8ujgj351mc2lv.png-150.5kB][51]

如果使用多个filter，就可以得到本层的N个特征：

![image_1cbuidmfb1b3k1ucu1qu21p3l1bsfmc.png-151.9kB][52]

其操作过程动画展示如下：

<center><video width="620" height="440" src="/videos/conv_kiank.mp4" type="video/mp4" controls></video></center>

CNN中符号说明（试用了一下印象笔记的文档扫描功能，很赞）：

![Evernote Snapshot 20180425 215537.png-212.5kB][53]

上面介绍的网络在CNN中叫做Convolutional Layer（卷积网络）。另外还有两种形式的Layer，一个叫做Pooling Layer：

![image_1cbui79q97m4iuk15cfsid16l9li.png-107.7kB][54]

Pooling Layer对每一个channel数据分别处理，提取最大值（均值，用的比较少），或者换个理解，提取最大特征，同时降维数据。所以pool layer和conv layer不一样，没有参数（只有hypterparameter，卷积用的filter/padding/stride size），同时，是对每一个channel单独处理，不改变输入数据的个数。

还有一个layer叫做Fully Connected layer(FC)，就是原来的神经网络模型，没有卷积运算，直接的权重矩阵W进行映射，一般用在网络的最后阶段，使用softmax输出类别。

所以，综合起来，一个CNN模型的例子：

![image_1cbujeov31q2m1bn87g913fte7pn6.png-165.5kB][55]
![image_1cbujllnsen81r4mom164b13kjnj.png-121.3kB][56]

一般而言，CNN的模式是在前几层将图像维度缩小（提取更抽象信息），同时，提高特征个数（高阶特征）。

至于为啥CNN有效，课程中说是有两点：1）parameter sharing，如果一个filter对图像的局部有效，可能也对全局有效 2）sparsity of connections，权重矩阵变小了很多，比NN节点之间连接矩阵小太多。

而我个人理解，可能CNN更好得模拟了大脑处理视觉的模式（个人理解）：

- 大脑对图像是扫描分析的，一块一块扫描，然后得到全局信息。
- 扫描完成后，对图像的点，线，面进行拆分，组装，定位目标。
- 定位后然后识别，理解。

我理解CNN就是在模拟这个过程。最有趣的部分就是将filter变成参数求解，相比于以前的视觉算法都是**手工调教**参数。人脑对于模式的识别，应该是非常灵活的，目标导向且自适应的，可后期训练的。所以CNN的模式确实更像人类一些。

## CNN Architecture

抽象来说，NN学习的就是知识。知识分两种：一种来自于数据，一种来自于人类经验模型。理论上说，在数据足够多（相对于问题的复杂程度），计算能力足够大时，最好的模型不需要人为干预，直接通过数据获得知识。但在数据不多，计算能力不够时，就需要人为干预模型来提高学习速度，提高学习效果。

### VGG - 16

![image_1cc0mqv8dra51nql16831jlq83i4g.png-167.8kB][57]

这个模型比较早，比价有意思的是，每一层计算后，图像长和宽都缩小一倍，但特征多了一倍，有非常统一的模型结构。

### ResNet

在ResNet出现之前，训练深层次网络存在一个巨大的问题：vanishing gradients。就是随着数据的迭代，权重越来越小，backprop计算时，梯度会越来越小（梯度需要乘以权重，而权重越来越小，在经过多层网络的计算后，梯度呈指数缩小），梯度缩小就会导致训练越来越慢：

![image_1cc0ola5e1efq199e1qsvnp1rbhl.png-225.4kB][58]

ResNet核心思路是构造「skip connection」，在原有的连接基础上，构造短路（shortcut）的连接：

![Evernote Snapshot 20180426 182650.png-498kB][59]

短路之后有个特性，如果中间节点的权重系数为0，那么L+2层的输出就是L层的输出，这几个网络构成了一个Identity Layer。

我个人理解ResNet可以有效工作的原因画在了上图中。特征的抽象层次肯定不会完全相同，有的特征维度高，有的维度低。如果网络特别深，会导致低维度特征还没运行到最后一层就已经最优收敛，之后再计算反而导致overfitting。但如果网络不深，高维度特征又不收敛。所以我觉得ResNet干的就是这个事情：**让低纬度特征计算放缓，等着高纬度特征一起收敛。**（shortcut导致中间的计算都没有用，等价于放缓速度。）

### Inception network

Inception网络如其字面意思，可以自我「感知」计算，就是自动计算出hypoparameters。既然模型的filter尺寸需要人为设定，存在不确定性。那么干脆直接遍历几个常用尺寸得到的结果，都将其放到网络中计算，让系统自动「感知」。

![image_1cc096epo1bj61qe91o651ub419sp.png-115.1kB][60]

越自动，越需要数据，越需要计算量。inception用了一个方法（调整网络模型）来降低计算复杂度：

![image_1cc09lq78c4je7a1h2mdoa162g16.png-76.7kB][61]
![image_1cc09n7101dfh5qp142b1joj16i933.png-108.7kB][62]

其核心就是将数据先经过一个$1\times1$的卷积网络，降低channel深度，然后在执行后续运算。我个人理解$1\times1$的卷积目的就是对原始数据进行**整理，归档**，将类似的数据整理归类到更小的类别中，然后降低计算量。

学完这节课，我的感受就是，这些模型用到的magical number简直就是科学的艺术，艺术的科学，神奇的1b.

更多模型框架可参考[Keras Applications Doc][63]

## Detection

这节课基本就见了一个算法：[YOLO - you look only once][64]。有些内容我也想的不是很清楚，所以先记录一下，以后觉得想的不对的，还需要进一步修正。@TODO

最开始的目标检测算法基于「滑动窗口」来扫描图像，但这存在计算量大，不确定窗口大小的问题。为此，提出了一种全卷积的扫描窗口算法：

![image_1cc2n0fuj1rpt1k4l1pi4288k6a9.png-308.2kB][65]

如果之前的操作是扫描一块区域图片，用操作C进行卷积运算，得到N个结果。那现在的方式是直接在原始图像上进行C操作，也可以得到N个结果，该运算和之前方式等价。我个人理解时候觉得反着看运算便于理解。反着看，就会发现其实计算的映射关系是一致的。如果将卷积操作看成是将信息进行「浓缩」的数学工具，那么从全局上看，全卷积的扫描方式就是将区域信息进行了浓缩。

YOLO算法的一次扫描其实就是一次全卷积运算，将运算得到的结果分成小块，每一块等价于对原始图像一篇区域的内容浓缩，然后让网络学习的内容是**该小块是否存在物体中心，如果存在，标识出物体的包围盒，类别，包围盒形状**

![image_1cc2ne2kr1pbl3h04711ikg1d7hm.png-239.8kB][66]

之所有有包围盒形状维度（anchor boxes），是因为可能一个小格子中检测到多个物体，所以预先对可能检测到不同形状的物体进行标定，导致输出向量多了一个维度。最多一个小格子同时检测出number of anchor boxes的包围盒。

至于优化方程，课程中没有细说，大致是对不同的数据进行区别对待。比如$P_c$（probability of class）使用logestic权值，权重肯定也最高；包围盒使用均方差；类型判定使用softmax等。

系统检测出盒子之后，需要评估出哪些盒子才是有效的，这里有两个步骤：一个是去掉置信度不高的。另一个是，去掉重复的盒子。

置信度可以评估为$P_c$和具体最大类别的概率$c_{max}$的乘积：

![image_1cc2nnme377g8ok14kd1ll91oas13.png-61.4kB][67]

按照置信度对盒子进行颜色填充得到结果：

![image_1cc2nqja5kfm152h1tqp3bp90b1g.png-65.8kB][68]

对盒子进行去重的算法叫做Non-max suppression，其本质是一种greedy算法：

![image_1cc2o00fen7a5ik1ad71n2k1km41t.png-252.8kB][69]

算法过程是：

1. 去掉置信度不高的盒子
2. 选择最大置信度盒子做为有效检测，盒子即为B
3. 所有剩余盒子和B计算IOU，去掉IOU过高（一般为0.5）的盒子，表示重复判定。
4. 重复2过程，直到没有盒子。

## Neural Style Transfer

之前看到的网络都是训练网络参数，但网络的用法远远不止这一种，还有一种反向思维——求解输入数据。

NST就是其中一种有趣的网络：

![image_1cc327onq6pd7891tqnnucddk2a.png-247.2kB][70]

如果从模型本质上理解，只要提供了运算逻辑，以及运算好坏的评价体系（最值得创造性扩展的建模环节），网络就可以自我求解。NST就是将生成的图片看做求解参数，并构造如下评价函数：

$$J(G) = \alpha J_{content}(C,G) + \beta J_{style}(S,G)$$

其中$J_{content}(C,G)$表示原始图片和生成图片**内容相似程度**。而$J_{style}(S,G)$表示样式图片和生成图片的**样式相似程度**。

CNN对图片的处理其实是在不停的提取图像的**高阶特征**，所以将C,G放入CNN，分别计算其高阶特征，然后求解两者相似度：

![image_1cc32i1t41ti314upprc88l4bq2n.png-201.1kB][71]

计算时，先将数据unroll，简化后续操作（将图像2D变为1D）：

![image_1cc32jbci185svgn1qk76901j2634.png-392.7kB][72]

做作业的时，这个操作着实让我想了好一会。最主要是考虑清楚数据的排列，如果需要将$n_c$作为第一维度，需要先将原始数据按照$n_c$所在维度transpose后再reshape（文字不是很好描述），贴代码：

```python
# 将n_c放到第一维度，在reshape，后面使用-1就可以压平数据
unrolled_data = tf.reshape(tf.transpose(data, perm=[2, 1, 0]), [n_c, -1])
```

style的代价计算非常有意思，简直就是艺术的数学化。在线性代数中有一个矩阵叫做「Gram matrix」，其描述了两两向量的相似度，扩展到这里：

![image_1cc330608ofo88o1oq3i2h1fe14h.png-365kB][73]

这里就知道将数据压平的好处了。将低纬公式用到多维，首先将多维压缩，然后两两相乘等价为矩阵相乘，简直是美学！换个理解，该方法就是将NN输出的特征之间的相似程度（或者是关系）作为「样式」的量化。

样式的代价就是两种的代价的距离：

$$J_{style}^{[l]}(S,G) = \frac{1}{4 \times {n_C}^2 \times (n_H \times n_W)^2} \sum _{i=1}^{n_C}\sum_{j=1}^{n_C}(G^{(S)}_{ij} - G^{(G)}_{ij})^2$$

实际计算代价时候，会考虑多个层的输出（这点和内容不一样）：

$$J_{style}(S,G) = \sum_{l} \lambda^{[l]} J^{[l]}_{style}(S,G)$$

还有一个有意思的点，这里的RNN网络是复用了已经训练的网络，等价于是一种transfer learning。

![image_1cc337p8o105r1ogk1jg18iisre5r.png-177.3kB][74]

## Face Recognition

Face Recognition和Face Varification不一样。后者是已知判定信息情况下判断是否是本人，而前者需要从K个人中选择一个。这个问题不同于K分类，因为K的数量可能非常大，而且不确定。

考虑另外一个模式，NN网络可以输出图像的特征，如果输出的特征可以有效的表征人脸的信息，进而进行识别，就可以让网络自己去学习。所以，模型优化的重点是**NN计算的特征可以足够区别不同的人**，类似于下图的特征提取：

![image_1cc36ue35le4189n1bd71eka4oi6o.png-53kB][75]

训练的过程叫做triplet loss，每次输出3张图片：anchor、positie、negative。要求negative和anchor足够相似，这样才可以**push网络训练得到更好的特征，以便分辨这些相似的人**（我理解该点是该方法的核心，如果不考虑对比的因素，完全可以两两训练，没有必要三个放到一起）。其优化方程如下：

![image_1cc36uou0nm4131qdnuetn21h75.png-162.1kB][76]
![image_1cc3782spoc1ltsogc1941lml8f.png-9.7kB][77]

意思是让A和P之间相似程度高于A和N的相似程度，$\alpha$参数表示边界值，越大，网络区分阈值就越高。

识别图像的过程就是将NN的输出和已有的人员进行对比，如果满足阈值就认定匹配。NN方法之所以这样子设定，在这里也体现出优势：人员的特征信息可以pre-trained，这样子匹配就很快。

还有一种方式是匹配也加入NN训练，输入就是两个图片的特征向量，输出就是0/1的logestic regression：

![image_1cc37d4uo1kbu1hih1n6t1kfi1p9c8s.png-169.1kB][78]

说白了，就是去掉阈值的手动调教过程，而是计算机自己去拟合。

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
  [23]: http://static.zybuluo.com/whiledoing/lsyvu3ql36syfsit9gfjappb/image_1cbpf2kfiqv21cou13o018q61eeo9.png
  [24]: http://static.zybuluo.com/whiledoing/scgnkz6swme7ugekusawb04p/image_1cbojoo4b1alc1euu1om51i621l1c3d.png
  [25]: http://static.zybuluo.com/whiledoing/ojeb0o2fk6ebol3foacrjy5f/image_1cbokft2i6nf62m2t1757g293q.png
  [26]: /2018/04/11/ml/coursera-machine-learning-course-note/#using-large-datasets
  [27]: http://static.zybuluo.com/whiledoing/uubv2at389otlp95lcp8omi0/image_1cbpf5r8k1e2t24p1ejn1arv17eum.png
  [28]: http://static.zybuluo.com/whiledoing/rog7tie0r5ymolgjxjlzlg72/image_1cbpf7gsh14sg6jrarj95j1gmt1j.png
  [29]: http://static.zybuluo.com/whiledoing/wfudzoancvtvzc4rl123kwsk/image_1cbpfv6tq1ufrsklfmc1opdgoa20.png
  [30]: http://static.zybuluo.com/whiledoing/iy6ghf6kwpf4ba6s9hcc4go4/image_1cbph9agsv6g1obemg87bl1foa2d.png
  [31]: http://static.zybuluo.com/whiledoing/2dqw9wx3gud2xct8wd7evdms/image_1cbrb8m011brs1l0924j6s01kqr3k.png
  [32]: http://static.zybuluo.com/whiledoing/m2uuwm2e0y23s7mf0r8wlp69/image_1cbrbln261n1t18qmdfpsve1sos41.png
  [33]: http://static.zybuluo.com/whiledoing/gwrbd2icv4cbilvtma8izk1k/image_1cbrcd71v6fv3ve1sra1niq1c0g4e.png
  [34]: http://static.zybuluo.com/whiledoing/p42t7kxescioq84t6j04ns2x/image_1cbrdinvm65ofmn1k9e1jbq9j65o.png
  [35]: http://static.zybuluo.com/whiledoing/js89ocqevam5joxvy47uljog/image_1cbrdsdke9rn10s01ki8tcb1fcj65.png
  [36]: http://static.zybuluo.com/whiledoing/z7gdskms5rfou8secimvh1tj/image_1cbre3l0716i076214ectchkja6i.png
  [37]: /2018/04/11/ml/coursera-machine-learning-course-note/#evaluating-improve
  [38]: http://static.zybuluo.com/whiledoing/1qlldsme3u36md0vwvo2uaxv/image_1cbrpccuh7i52sm1m81790hct7c.png
  [39]: http://static.zybuluo.com/whiledoing/4nls7jr0b0ahis0uhmjzywm9/image_1cbrqgrnq7pr1j76fep8cts3p86.png
  [40]: http://static.zybuluo.com/whiledoing/2k2is644wg48ayfiq85d7td2/image_1cbt9ov0tcv6fai1ks21h981oavag.png
  [41]: http://static.zybuluo.com/whiledoing/olewzuab8292vne4wsyb538v/image_1cbt9nvqk1l3j9vq1guubmhudg8j.png
  [42]: http://static.zybuluo.com/whiledoing/wlto9zkoxotoqqp9ly2vmrf5/image_1cbtb1qm61c51g807ko1hphiv5ba.png
  [43]: http://static.zybuluo.com/whiledoing/xucwkbirvxbobsst8oybmath/image_1cbtb3gpchb7d191cll174cu0c4.png
  [44]: http://static.zybuluo.com/whiledoing/a1vqdiys08sh65gqzfjiav3q/image_1cbtbnipgnocm83set1ef01100ch.png
  [45]: https://www.wikiwand.com/zh-cn/%E7%BA%A6%E4%B9%A6%E4%BA%9A%C2%B7%E6%9C%AC%E5%B8%8C%E5%A5%A5
  [46]: http://static.zybuluo.com/whiledoing/wfglt8uyucz9wpwcouq53kjt/image_1cbteou5l47env11fal1uajjhdeu.png
  [47]: http://static.zybuluo.com/whiledoing/16djj0l616meyhnm0c1eysqb/image_1cbtfs2p5uragnk17mb5gi1mepfb.png
  [48]: http://static.zybuluo.com/whiledoing/jxjk5itor79t4706ugd05py6/image_1cbto7ltdnou4nm1iic2dplui8.png
  [49]: http://static.zybuluo.com/whiledoing/3qepvni8isycba1c4w8yd5bf/image_1cbtof8191d5bpe91p0h1ts1uc6k5.png
  [50]: http://static.zybuluo.com/whiledoing/bcdat9ykomleqmkfrng9k2oo/Convolution_schematic.gif
  [51]: http://static.zybuluo.com/whiledoing/4zqe8tl59egq5qx74t44pn3p/image_1cbuidcbbscnep8ujgj351mc2lv.png
  [52]: http://static.zybuluo.com/whiledoing/zb3erz2whbhro9us203vjadz/image_1cbuidmfb1b3k1ucu1qu21p3l1bsfmc.png
  [53]: http://static.zybuluo.com/whiledoing/zzo14jmcel00rqhqdorlug5k/Evernote%20Snapshot%2020180425%20215537.png
  [54]: http://static.zybuluo.com/whiledoing/7vy9tpz380uuu1tzkm9j6279/image_1cbui79q97m4iuk15cfsid16l9li.png
  [55]: http://static.zybuluo.com/whiledoing/a83u3qjo7hd16h7p1z4ajhe2/image_1cbujeov31q2m1bn87g913fte7pn6.png
  [56]: http://static.zybuluo.com/whiledoing/ndc8gbxsy0rcel10vysh82j2/image_1cbujllnsen81r4mom164b13kjnj.png
  [57]: http://static.zybuluo.com/whiledoing/0kkhajr4yadwtrae03ax6axa/image_1cc0mqv8dra51nql16831jlq83i4g.png
  [58]: http://static.zybuluo.com/whiledoing/0p9kqjd9sl5dvpni3lbdj33a/image_1cc0ola5e1efq199e1qsvnp1rbhl.png
  [59]: http://static.zybuluo.com/whiledoing/sirtthyilcuv3cx0mjzqh6of/Evernote%20Snapshot%2020180426%20182650.png
  [60]: http://static.zybuluo.com/whiledoing/a6nxvjxtv7xhmfd1xrolc9h2/image_1cc096epo1bj61qe91o651ub419sp.png
  [61]: http://static.zybuluo.com/whiledoing/ycm4g46twno8ee444loelecp/image_1cc09lq78c4je7a1h2mdoa162g16.png
  [62]: http://static.zybuluo.com/whiledoing/x0r3gmk84oj7t1ntf5bgivp4/image_1cc09n7101dfh5qp142b1joj16i933.png
  [63]: https://keras.io/applications/
  [64]: https://pjreddie.com/darknet/yolo/
  [65]: http://static.zybuluo.com/whiledoing/fdx0qi7q645h9sxydbrpkdau/image_1cc2n0fuj1rpt1k4l1pi4288k6a9.png
  [66]: http://static.zybuluo.com/whiledoing/nw6xvb1t5jdaighs5m9fspfm/image_1cc2ne2kr1pbl3h04711ikg1d7hm.png
  [67]: http://static.zybuluo.com/whiledoing/flp1a6vppczwwglah3a42emz/image_1cc2nnme377g8ok14kd1ll91oas13.png
  [68]: http://static.zybuluo.com/whiledoing/jnpir4rqocjyr7ip6gud1pmv/image_1cc2nqja5kfm152h1tqp3bp90b1g.png
  [69]: http://static.zybuluo.com/whiledoing/8gdhpc3silhw88sy98is26zy/image_1cc2o00fen7a5ik1ad71n2k1km41t.png
  [70]: http://static.zybuluo.com/whiledoing/rh32s3du6w12oynt0rh2svjz/image_1cc327onq6pd7891tqnnucddk2a.png
  [71]: http://static.zybuluo.com/whiledoing/k70jg3hi8zel8ms906wt52sx/image_1cc32i1t41ti314upprc88l4bq2n.png
  [72]: http://static.zybuluo.com/whiledoing/whz05yzphu7lwn8q69em9p6f/image_1cc32jbci185svgn1qk76901j2634.png
  [73]: http://static.zybuluo.com/whiledoing/o6veijl97a6h7f3leqzcel0v/image_1cc330608ofo88o1oq3i2h1fe14h.png
  [74]: http://static.zybuluo.com/whiledoing/f0t9lffuhpzpzpu2agammqof/image_1cc337p8o105r1ogk1jg18iisre5r.png
  [75]: http://static.zybuluo.com/whiledoing/gm0lhco2qw5ff62da3a1nfd9/image_1cc36ue35le4189n1bd71eka4oi6o.png
  [76]: http://static.zybuluo.com/whiledoing/4zhopfbpic3szeerr6pj8xne/image_1cc36uou0nm4131qdnuetn21h75.png
  [77]: http://static.zybuluo.com/whiledoing/w8500thg7jxeoasvh9ll70e5/image_1cc3782spoc1ltsogc1941lml8f.png
  [78]: http://static.zybuluo.com/whiledoing/p63ronbesl9fqmmf2d57ptl9/image_1cc37d4uo1kbu1hih1n6t1kfi1p9c8s.png