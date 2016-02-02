---
title: git学习记录
date: 2016/1/31 22:16:46
tags: [self,git]
toc: true
---

这个文档记录了自己学习和折腾`git`的内容。

<!--more-->

## git submodule

很多情况下，在一个proj需要依赖另外的几个库（repo），简单的办法就是使用`git clone`一个个的down下来，然后单独去管理。

git提供了一种更加简单的方式submodule的方式，将依赖的`git repo`当成submodule，将其以**引用**的方式在当前版本库中进行管理。

首先，需要加入别的submodule:

```bash
# 将别的repo放到特定的目录中
git submodule add git@xxx.repo submodule/lib-xxx
```

加入成功之后，本地的状态是修改了`.gitmodule`和`submodule/lib-xxx`，前者表示了当前submodule所管理的所有模块的信息，后者表示**当前维护lib-xxx的commit指针变化了**。将两个修改提交之后，其它人在clone当前版本库时候，就知道了：**奥，当前我依赖了xxx

 1. 列表项
库，同时我依赖库的head在某某commit上面**。

其过程是：

```bash
git clone has-submoudle-repo
cd has-submodule-repo

# 建立当前版本库和submodule的引用关系
git submodule init

# 拉取最新的submodule数据到本地
git submodule update
```

其实我本来折腾submodule的本意是希望：

1. 可以clone多个别人的版本库。
2. 可以在别人clone的版本库基础上，进行commit，且该commit可以提交到**当前版本库**，不影响**clone的版本库**（fork的方式）

但是发现貌似submodule（还待以后仔细研究）做不到上面的第二点。因为使用submodule的版本库中，根本没有你管理的子模块库的fork版本库，而只是记录了**引用的关系**。所以如果你修改了submodule中内容，然后本地提交，push的位置还是**原先的版本库**。

所以如果你先在submodule中进行了修改，在当前repo中调用`git diff`会有如下的输出：

```diff
diff --git a/libs/lib-1 b/libs/lib-1
index e8e7dd3..20d7a7f 160000
--- a/libs/lib-1
+++ b/libs/lib-1
@@ -1 +1 @@
-Subproject commit e8e7dd3ce4a52d83f8bffdfab7b29d6c65d34317
+Subproject commit 20d7a7fcb3229c8a15e8d58a153ae0fec7832c14-dirty
```
就是说，我们对本地的submodule进行了修改。当前状态是dirty的。

然后我们在submodule中提交修改，在当前repo中调用`git diff`得到结果：

```diff
diff --git a/libs/lib-1 b/libs/lib-1
index e8e7dd3..17ff0b8 160000
--- a/libs/lib-1
+++ b/libs/lib-1
@@ -1 +1 @@
-Subproject commit e8e7dd3ce4a52d83f8bffdfab7b29d6c65d34317
+Subproject commit 17ff0b829872f8e436c740be2660fc09d1f3aac1
```

说明当前我们的子模块已经有了最新的提交，我们需要将**更新主repo对子模块commit的引用指针**：

```bash
git add libs/lib-1
git commit -m "update master repo submodule lib-1 to new commit"
```

这样看起来，如果我要实现之前自己提到的需求，可能需要单独对自己需要hook的版本库进行fork，然后将fork之后的版本库放到submodule中。这样子我自己随便怎么修改都可以，然后也可以通过update源头的版本库来保持主开发版本的一致。

so wrap up:

1. submodule提供了方便的管理多个repo的方式，这样子在既保持各个repo版本库独立的前提下，也提高了灵活性。
2. 这个方式不是fork的方式，而是「引用指针」的方式。有点类似动态链接库的味道。
