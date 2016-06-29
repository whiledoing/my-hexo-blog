layout: learn-note-with-toc
title: mongo学习笔记
date: 2016-06-28 09:18:46
tags: [self,mongo]
toc: true
---

这是我学习[mongo](https://www.mongodb.com/)的笔记

<!--more-->

索引字段输出的sort排序是非常高效的，因为索引建立的时候已经考虑了sort需求，可以直接顺序或者逆序的将结果输出。

covered index表示覆盖索引，表示仅仅通过索引就可以得到所有的查询信息。

如果不使用`_id`作为索引，在返回结果的时候，可以将`_id`去掉。

隐式索引：如果建立了一个N个键构成的索引，也隐式的将N个键前缀构成的索引！

mongo中数组字段也可以建立索引，但是建立的索引是多键索引（multikey index），就是会将数组中的每个元素都变为一个键。如果一个索引数据的文档中有一个是数组，那么索引就会变为多键值索引，而且该过程不可逆！

## explain

1. cursor：表示使用的索引，如果没有使用索引，就是BasicCursor。
2. isMultiKey：是否是多键索引。
3. n：表示返回的文档数目。
4. nscanned：表示扫描索引数目。
5. nscannedObjects：表示扫描磁盘中文档数目。
6. scanAndOrder：如果返回结果不是索引直接就可以得到的排序，那么会在内存中排序。@note 数据多的时候最好不要有这个状态。
7. indexOnly：索引覆盖查询。
8. nYields：查询过程中中断的次数。mongo会定期释放查询的请求，以便数据可以顺利的写入。
9. millis：表示查询时间。

## 创建固定集合

1. 固定的大小（如果超过了大小，旧的文档会被自动删除）
2. 固定的文档数目（也是会将旧的数据进行替换）

    db.createCollection('capped', {'capped':true, 'size':100000, 'max':2})

固定集合还可以创建TTL索引（time-to-live index）表示一个文档可以存活的时间。

使用固定集合可以比较方便的实现LRU的文档保存和自动删除。

## 配置shell环境

在mongo的shell配置文件中`.mongorc.js`中设置：

```bash
EDITOR='vim'
```

就可以在shell中方便的使用vim进行编辑，比如设定变量的数值：

```bash
edit foo
```

编辑好之后，可以使用`foo`看到foo的数值，然后进行使用，比如：

```bash
db.test.aggregate(foo)
```

## aggregate

聚合操作可以方便的对mongo数据库数据进行有效性分析（一定程度上可以直接将数据提取出来，通过脚本进行分析），但是聚合在mongo数据库级别提供了统一的处理接口，可以应对大部分的数据分析任务。

聚合主要的构件有：

1. project
2. match
3. group
4. sort
5. limit
6. skip

比如一个简单的project任务：

```js
{'$project' : {'new-x' : '$x'}}
```

使用`$attrName`表示旧的属性数值，或者还是原始属性名字，直接使用：

```js
{'$project' : {'x' : 1}}
```

group将多个相同字段数值合并和一个，并进行统计：

```js
{
    '$group' : {
        '_id' : '$country',
        'total' : { '$sum' : 1}
    }
}
```
     
其中得到的total字段表示所有相同国家人的总数，使用`$sum`操作符来进行累加，value为1表示每次增加一个人。

## 副本集

一个数据库副本肯定是不安全的，至少安全容错性不高，这个时候可以考虑使用副本集的方式。副本集就是对主数据库进行备份，增加了总体的安全性。

副本集中通常有一组服务器，一个叫做主服务器(primary)，用于处理客户端请求，还有多个备份服务器(secondary)，用于保存主服务器的数据副本。

写操作一定要写入到主服务器上，然后mongo会负责将相关的写操作同步到不同的备份服务器中。但是读操作可以设定为：

- primary preferred. 主优先，优先使用主服务器。
- secondary preferred. 优先从备份服务器读写数据（平衡了负载，但是数据可能有延迟，对于数据的一致性要求不高的情况下使用）

主服务器可能会crash，这个时候服务器会自动的进行选举，获得多数投票的服务器将成为新的副本集合。

相关副本集的操作有很多，但是因为更多是对于SA的工作需求，所以相关内容在需要使用查询书籍即可。

## 分片

分片是将数据拆分，将其分散存放在不同的机器上的过程。有时用分区（partioning）来表示这个概念。将数据分散在不同的机器上，不需要功能最大的大型计算机就可以存储更多的数据，处理更大的负载。

开启分片功能需要设置：

```bash
# 在分片集合所在的数据库中启动分片功能
> sh.enableSharding('test')                                 

# 在集合中配置分片的索引
> db.users.ensureIndex({'username' : 1})                    

# 设定集合的片键
# 其中username后面的1表示索引类型，在ensuereIndex和shardCollection中需要保持一致。
> sh.shardCollection({'test.users', {'username' : 1})       
```
    
需要注意的是：**只有被索引过的键才能够成为片键**

启用分片的集群的时候，连接的`mongos`进程。

选择片键的时候，需要考虑到热点的问题，如果片键是升序的数值，那么可能每次插入数据都在最后的shard分片上面，这样子就造成了热点。

这个时候可以将使用散列片键：散列片键是将片键使用散列进行索引，该过程是自动的。好处是将升序的片键编程随机的片键，保证了数据的随机分发。

```bash
> db.users.ensureIndex({'username' : 'hashed'})
> sh.shardCollection('test.username', {'username' : 'hashed'})
```
    
也可以使用符合片键的策略，使用`<随机数据，升序key>`作为片键，这样子第一个随机数值保证数据可以比较均匀分散到不同的块中，然后再小块中升序排序，这样子热点的范围就只会局限再小块中。

集群相关的所有配置信息都保存在配置服务器的config数据库集合中，如果需要查看集群配置的话，到config数据库中进行查看。

## 工具

- `db.currentOp`查看当前正在进行的操作。
- `Object.bsonsize`查看一个文档的字节数目。
- `db.xxx.stats()`查看一个集合的状态。

## 安全验证

mongo启动的时候，如果不开启，就不使用安全检查，这个时候可以执行任何**系统管理员级别的操作**，可以进行下面的设置：

```bash
> use admin
> db.addUser('root', 'xxxxx')
```
    
在mongo中`admin`数据库中的所有用户都是管理员账号，可以对任何的数据库进行读写，同时可以执行某些只有管理员才可以执行的操作，比如**listDatabases**和**shutdown**

所以在进行mongo数据库登录的时候，使用管理员账号登陆是比较好的：

```bash
> mongo --port 27017 -u root -p xxxxx localhost/admin
```
    
表示使用`root`账号进行登陆，然后使用的是`admin`数据库下的账号。

可以理解`mongo`的账号系统是建立在数据库级别的（或者理解为名空间），如果建立了在`admin`数据库下的账号，就表示是系统管理员的账号。

同理，我们也可以在别的数据库中建立别的账号，只不过这个账号只能**特定数据库**进行操作。比如在系统管理员权限下的shell中调用：

```bash
> use test

# 最后一个参数表示是否是**只读的用户**。
> db.addUser('read_user', 'xxx', true)
> db.addUser('read_and_write_user', 'xxx')
```

如果在开启了`--auth`选择项之后，登陆到mongo的shell中，默认是连接到test数据库，如果希望使用管理员权限，需要进行auth验证：

```bash
> use admin
> db.auth('root', 'xxxxx')
```

这样子表示当前shell我进行了账号登陆，且是管理员账号。当然也可以在mongo连接的使用使用`-u -p`的方式直接使用特定账号进行登陆。 
