---
date: 2018/5/1 18:39:11
tags: [ML,AL,Coursera]
mathjax: true
title: Coursera - Andrew Ng - Deep Learning - 5 - Sequence Models - 学习记录
---

深度学习[第五门课程: Sequence Models](https://www.coursera.org/learn/nlp-sequence-models)的学习笔记。

 <!--more-->

## Recurrent Neural Networks

RNN是一种处理时序数据的网络模型。考虑之前学到的网络都是一次性输入所有数据，最后得到结果。但对于时序数据而言，每次输入的数据甚至都不能一次性获得（考虑语音识别，不可能等话说完再去识别），而是连续的数据流，且数据之间有很想的时序相关性。RNN模型本身就体现了一种连续的时序概念，一个基本的RNN模型如下：

![image_1cc58cvfccpl13gj14le1gep40699.png-32.6kB][79]

其特点：

- 数据按照时间坐标$t$切片
- 数据按照时间顺序多次输入
- 上一层的输出结果会传递到下一层，用来拟合数据之间时序相关性。
- 每一层都可以有输出预估（根据引用场景具体会不同）

一个最基本的RNN Cell单元构造如下：

![image_1cc58ievt4u31og410cl1ahjvft9m.png-30.7kB][80]

其本质就是将当前的输入和上一层的响应加权，然后计算得到本层响应和预估。（当然$\hat y^{<t>}$的输出不一定就是softmax，根据应用场景而定）

级联的RNN Cell结构如图：

![image_1cc58qcofhme1v8h1f9llmid5nag.png-116kB][82]

一般计算时，对$T_x$时间切片进行遍历，每一次循环处理一个时刻数据和预估（因为每一次有预估就会有cost的计算），然后将数据结果cache到下一层。

基本的RNN Cell存在两个问题：

- 容易导致gradient valishing
- 时间靠后的数据很难被时间靠前的影响（层级相差很大）

时间序列的夸时间影响还是有实际意义的。比如我们说下面的句子：

> The cat, which ...., was ...
> The cats, which ....., were...

语义上，后面数据要受到很久之前数据的影响。Long Short-Term Memoery(LSTM) network用来解决这个问题（不是很懂，简单整理。 @TODO）：

![image_1cc58svl481re28bhsla3hvfat.png-30.7kB][83]
![image_1cc58t81i1ndr1mnc76m91frh1ba.png-102.9kB][84]

我理解本质是引入了$c^{<t>}$这个通路（类似于ResNet的通路），将很久的数据按照逻辑保存下来，进而可以对后续节点产生可观的影响。

推荐一个[介绍RNN非常好的博文][85]。

## Application of RNN

这里主要记录课后作业的两个项目：作曲和作文章。

计算机学习编曲其实就是让计算机建立一种乐感，这个乐感就是在听了一个key之后（当然实际建模需要考虑很多因素，比如时值，和弦等，这里简化说明），再联系之前的key list，根据概率计算出下一个key。

这里有两个过程，一个是训练，一个是Sampling。

![image_1cc5a96f0qmb1hjouqvcrc1gipbn.png-139.3kB][86]

上图说明了Sampling的过程。初始输入类似于音乐中确定「调式」，然后计算机算出下一个音符（softmax的最大值，或者按照概率采样，这样子作曲更随机），然后将**该音符作为下一层的输入**，依次连续谱曲。interesting。

训练的过程就是反向思考上述过程，将一段音乐放入到输入位置，而每次比较的$y$其实是错位的$x$，也就是$y^{<t-1>} = x^{<t>}$，最后一层的$y=end tag$，表示结束标识。学习的目的就是在知道输入后推算出下一个输出是啥。这就是对「乐感」建模了。

贴一下生成的结果，其实听起来怪怪的，不过挺有意思：

<center>
<audio src="/music/rnn_improvise_jazz.mp3" controls> </audio>
<p>rnn_improvise_jazz.mp3</p>
</center>

参考项目: [deepjazz][87]    [keras-example: lstm_text_generation][88]

## Word Embeddings

在NLP领域，使用Word Embedding对单词语义进行建模：

![image_1cccv7c0g3tf1bh18nc1eag12fqch.png-164.5kB][89]

上图中，单词Men可以有几个维度的解读：是否是Gender、Age、Food、Size等相关属性单词。就像是一个向量嵌入到单词的语义中，所以叫做word embedding。

其实该模型和人脸识别问题中用到的模型有些相似。人脸识别问题中，为了更好得定义人脸特性，使用CNN对人脸进行训练，得到可表示人脸信息的特征，并用triple-loss方法训练特征。这里也类似，为了更好地处理NLP问题，就需要更好地理解单词的属性，该属性就是一种特征向量。

![image_1cccvf6crqns1rhpliq1u1l10nkcu.png-114.9kB][90]

计算Word Embedding的逻辑在于找出单词之间的联系。一种方法叫做Skip-grams方法，其逻辑是提取出一个单词作为content，然后随机选取相邻单词作为target，再放到NN网络中训练：

![image_1cccvjggf196sdohv591le31543do.png-130.5kB][91]

该方法存在的问题非常明显：参数居多，训练计算量太大。另一个算法叫做Negative Sampling，该算法从反面思考求解：给出content/target pair来预测是否是一个有效的关系组合。该方法类似triple-loss，将相似的有联系的放在一起进行训练：

![image_1cccvv0qmfdrm2j2n1nkh18tre5.png-131.4kB][92]

每次训练除了放入一个有效content/target训练对外，还放入K个无效的训练对。这样子问题变成了二元回归问题，计算量大大减小。另外一个方法叫做Glove方法，该方法从单词出现概率的角度进行全局分析：

![image_1ccd12l4g1nf31ear1h141674fveei.png-90.5kB][93]
![image_1ccd144o13cb3i018pqmnbqaev.png-97.5kB][94]

计算求解的过程就是让相互联系的单词越相似。

Word Embedding模型的一个好处是transfer learning，你完全不需要从0开始计算出特征向量，而是复用已经训练好的模型参数转移处理新的NLP领域问题。比如课程中提到的一个使用案例Sentiment Classification——根据上下文语句，判断说话人的心情：

![image_1ccd1n6e11jga13494ccfq01cijfs.png-47.2kB][95]

上图模型对特征进行加权放入到NN中进行回归。存在的问题时，不能理解语言的上下文，如果出现「not feeling happy」，模型还是会认为happy，这就需要理解上下文的模型LSTM：

![image_1ccd1no1017lg1fpmnqaoj7133pgp.png-55.6kB][96]

## Sequence to Sequence Architectures

Sequence to Sequence的RNN标准模型定义如下：

![image_1ccdhi1dv1ic2l8avdr11hc5vdh6.png-102.7kB][97]

类似于之前学到的[做文章问题][98]，只是这里的输入不是0，而是已知数据综合得到的特征数据。其输入和输出都是序列数据，其应用场景有翻译和图片取标题等：

![image_1ccdhpj7s6fbrf51nc6e1s598hj.png-133.9kB][99]

模型可以看做有两部分：encode和decode。在decode部分，算法输出的是**全局最大概率**的翻译结果。一种求解近似全局最优解的方法叫做Beam Search，这是一种近似最优的贪婪算法，每次只计算当前最优K个数值而不是全局最优：

![image_1ccdi06041pvl1vclei41pnre2fig.png-158.6kB][100]
![image_1ccdi10l2i71bib1g5km411i6vit.png-139.4kB][101]

在实际计算时，如果decode的输出较深，连续相乘小于1的小数会导致结果溢出，解决方法是对数据进行log标准化。

在数据很多时，标准模型得不到好结果：

![image_1ccdi3ur8n2ilps1v9dte2cbhja.png-156.6kB][102]

原因在于decode部分输入数据过于抽象（考虑输入是原始数据的综合，被过度简化）。而人类实际地翻译过程是每次读入一个句快，然后一块一块翻译。根据这个启发，提出了新算法Attention Model:

![image_1ccdibnbg17jb18tn13hmklc1d87jn.png-209.7kB][103]

模型的核心概念attention表示每一个输出单词和当前所有输入的**关系权重**。权重的计算模型也是一个NN网络，输入数据为前一个输出结果和原始数据的特征（经过一层Bi-LSTM提取出来）。注意，计算attention的模型对所有t时刻数据进行计算，而不是单独计算。（权重系数也可以被理解为当前输出和输入的哪个单词最相关，进而进行类似于「直译」的处理。）

如果从模型拓扑结构上分析，主要区别在于每一次输出不仅参考前一个输出结果，也综合考虑当前加权的attention数据，起到了一种类似于人类翻译的感觉：需要不停和原始句子进行对照翻译。

课程中也简单提到了如何将Sequence to Sequence模型应用到语音识别问题上。其计算模型和上述翻译问题并不大异，最大区别在于数据建模和理解上：

- 将音频进行傅里叶变化。用频谱表征数据。
- 合理采样时间。比如以1ms为单位对输出数据进行采样，翻译的精度就可以控制到1ms。
- 理解y的输出。将翻译结果进行合并。

---

  [79]: http://static.zybuluo.com/whiledoing/w1u3vrakbnxf92ne2555o7r7/image_1cc58cvfccpl13gj14le1gep40699.png
  [80]: http://static.zybuluo.com/whiledoing/nywse57lcoer3yjquqsu0wet/image_1cc58ievt4u31og410cl1ahjvft9m.png
  [81]: http://static.zybuluo.com/whiledoing/t5bcx44ajmpl73cdrheiyjww/image_1cc58oaf51fvta8kkra1nmpbhga3.png
  [82]: http://static.zybuluo.com/whiledoing/zidn4q12yq86tbzok6tmk6or/image_1cc58qcofhme1v8h1f9llmid5nag.png
  [83]: http://static.zybuluo.com/whiledoing/262sbwv4fclcyh3zv56mb0zm/image_1cc58svl481re28bhsla3hvfat.png
  [84]: http://static.zybuluo.com/whiledoing/ql0qf7kxvvacjo0mmv8csd77/image_1cc58t81i1ndr1mnc76m91frh1ba.png
  [85]: http://karpathy.github.io/2015/05/21/rnn-effectiveness/
  [86]: http://static.zybuluo.com/whiledoing/7pxzofkzzwj3ga9tq6m9erv4/image_1cc5a96f0qmb1hjouqvcrc1gipbn.png
  [87]: https://github.com/jisungk/deepjazz
  [88]: https://github.com/keras-team/keras/blob/master/examples/lstm_text_generation.py
  [89]: http://static.zybuluo.com/whiledoing/dqupjf4v8qlnwarkhvpzd6f3/image_1cccv7c0g3tf1bh18nc1eag12fqch.png
  [90]: http://static.zybuluo.com/whiledoing/k6rk2r6gqniiaw46hg1avnqn/image_1cccvf6crqns1rhpliq1u1l10nkcu.png
  [91]: http://static.zybuluo.com/whiledoing/9woe3gujbg4022iv65219fjj/image_1cccvjggf196sdohv591le31543do.png
  [92]: http://static.zybuluo.com/whiledoing/kjf9tzs606nbefvs76nu9td7/image_1cccvv0qmfdrm2j2n1nkh18tre5.png
  [93]: http://static.zybuluo.com/whiledoing/godrw461iibhia0cnykqlxsw/image_1ccd12l4g1nf31ear1h141674fveei.png
  [94]: http://static.zybuluo.com/whiledoing/g1wmp9ut7of1gots7o5tx112/image_1ccd144o13cb3i018pqmnbqaev.png
  [95]: http://static.zybuluo.com/whiledoing/v6mvmiktxtouklzwg4f8m387/image_1ccd1n6e11jga13494ccfq01cijfs.png
  [96]: http://static.zybuluo.com/whiledoing/qslsbb2bvidmv1lojtiraud0/image_1ccd1no1017lg1fpmnqaoj7133pgp.png
  [97]: http://static.zybuluo.com/whiledoing/pme45ole7355a7thu4v6ns27/image_1ccdhi1dv1ic2l8avdr11hc5vdh6.png
  [98]: #application-of-rnn
  [99]: http://static.zybuluo.com/whiledoing/b7arszdg3vz499rnodkrovyy/image_1ccdhpj7s6fbrf51nc6e1s598hj.png
  [100]: http://static.zybuluo.com/whiledoing/r7hrpcoxhbj7601m3j53kc6c/image_1ccdi06041pvl1vclei41pnre2fig.png
  [101]: http://static.zybuluo.com/whiledoing/ekcw0uekb063eh2l6to66wq0/image_1ccdi10l2i71bib1g5km411i6vit.png
  [102]: http://static.zybuluo.com/whiledoing/yta6hwizd6z707rxdfruf5wc/image_1ccdi3ur8n2ilps1v9dte2cbhja.png
  [103]: http://static.zybuluo.com/whiledoing/s2zyozu95khaee29fe3irtok/image_1ccdibnbg17jb18tn13hmklc1d87jn.png

