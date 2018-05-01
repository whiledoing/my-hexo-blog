---
date: 2018/5/1 18:36:11
tags: [ML,AL,Coursera]
mathjax: true
title: Coursera - Andrew Ng - Deep Learning - 2 - Improving Deep Neural Networks - 学习记录
---

深度学习[第二门课程: Improving Deep Neural Networks](https://www.coursera.org/learn/neural-networks-deep-learning)的学习笔记。

<!--more-->

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

---

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
