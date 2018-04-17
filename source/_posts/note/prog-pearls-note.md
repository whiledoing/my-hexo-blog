---
date: 2018/3/24 23:27:46
tags: [技术面试,算法,读书笔记]
title: 《编程珠玑》读书笔记
---

最早看[编程珠玑](https://book.douban.com/subject/3227098/)是由于上研时一位大牛同学的推荐，书很薄，但是却用了很长时间看完，因为书中写的内容确实非常好，对得起「珠玑」二字。将当时的读书笔记整理如下。

<!--more-->

## 第十三章 : 搜索
 
该章节解决的问题是使用集合来构造从n个数值里面选择m个数值的问题.
 
构造了下面几种set:
 
1.  线性表的set
2.  链表的set
3.  二分搜索树BST的set
4.  位图的set
5.  箱序列的set
 
链表和线性表比较起来, 可以不用话时间来调整元素上, 因为数据都是线性存放的, 所以使用
链表直接查找, 不需要进行移位操作.
 
二分搜索就是类似于STL实现的set, 基于O(logm*m)的算法来实现.
 
位图的set就是根据整数的位图特性来判断一个元素是否存在, 但是在初始化, 以及获取所有元素
的情况下需要遍历所有的元素个数(要一个一个判断是否被取得了), 所以时间是O(n).
 
最nb的来了. 考虑到数据具有如下特点:
 
1.  取得m个数值, 每一个数值是均匀采样的.
2.  数据最都只有m个.
 
如果我们将n的数值范围分为m个箱子, 每一个箱子表示一个range的数值, 那么因为是等概率采样,
所以每一个箱子中的数据冲突不会很多, 在每一个箱子中使用一个链表来表示所有的冲突元素即可.
 
但m比较小的时候, 可以认为每一个箱子只有一个元素, 所有时间复杂度和空间都是O(m).
 
插入元素: O(1)
查找元素: O(1)
遍历元素: O(m)
 
本质上这是一种hash, 但是通用的hash算法, 没有这么好的时间和空间. 另外一种思想, 就是缩小
范围, 一个数据在n范围内, 如果我们知道数据将被均匀处理, 我们将空间范围n化为更小的处理单元,
这样子处理起来范围更小, 速度更快.
 
下面的代码实现了上面所有的数据结构, 另外需要注明在实现中的几个细节点:
 
1.  使用 `reverse recursive insert` 的方式插入元素, 这个方法可以用在链表中, 也可以用在
BST中.
 
    原理是一个插入操作当前元素的下一个节点(或者是左右子树)等于其子元素执行完成了
    插入操作之后的返回值, 当前的返回值就是执行完成了插入操作之后, 最上层的节点.
 
    因为链表在插入和BST的插入都有一个特点, 需要保存上一个元素的数值, 这样子插入一个元素
    之后才可以建立和之前的联系, 维持数据结构特性, 如果使用循环写就比较麻烦, 需要保存上一个
    元素的数值, 而使用递归, 上一个元素就是当前递归的元素, 而其子节点通过返回值返回.
 
2.  另外一种非常nb的方法来进行插入的实现: 使用指针的指针, 狸猫换太子.
 
    既然我们遍历的时候需要保存在一个指针的数值, 然后改变这个指针实现元素的数值, 那么
    我们可以直接保存指向上一个元素指针的指针, 然后直接改变该指针指向元素的数值, 就变相
    的建立了和之前元素的联系.
 
    比如我们知道想一个元素的地址为0x1234, 但是我们保存的是上一个元素中指向0x1234的指针的
    地址为0x4567, 那么我们直接改变0x4567指向的内容, 就改变了前一个节点和后一个节点的
    对应关系!!!
 
3.  哨兵节点非常有用
 
    这里因为知道当前的选择元素的范围一定是小于n的, 所以所有的搜索都可以加入一个哨兵节点.
    这样子在循环的时候不需要溢出的判断, 因为最后一个元素一定是结束了循环(和哨兵的比较是
    会结束搜索的), 这样子降低了代码的维护以及更快.
 
4.  更高效的运算.
 
    对于分箱操作, 或者是bitset中每一个运算单元长度的选择, 尽量使用2的幂, 这样子除法更加快!
 
5.  减少内存的分配.
 
    由于我们知道最多需要多少个节点, 所以一次性的分配节点, 然后需要使用使用可以大大提高速度!!
 
代码:
 
```C++
#include <iostream>
#include <string>
#include <vector>
#include <cstring>
#include <cstdlib>
#include <map>
#include <ctime>
#include <set>
#include <typeinfo>
using namespace std;

/* 链表实现 */
class ListSet
{
public:
    ListSet(int max_value, int max_size) : m_max_value(max_value),
        m_size(max_size) {
        all_nodes = new node[max_size + 1];
        head = sentinel = &all_nodes[0];
        head->val = max_value;
        head->next = NULL;
        n = 0;
    }

    ~ListSet() {
        delete[] all_nodes;
    }

    void insert(int t);
    int size() {
        return n;
    }
    void report(int* v);

private:
    int m_max_value;
    int m_size;

    struct node {
        int val;
        node* next;
        node() {}
        node(int v, node* p) : val(v), next(p) {}
    };

    int n;
    node* all_nodes;    // 预先分配了所有内存空间
    node* head;
    node* sentinel;
};

// 使用循环的方式加入一个节点
void ListSet::insert(int t)
{
    /* 两种实现方式, 第一种, 保存pre和p的方式, 进行链表的插入 */

    /* 第一种
    node* p = head;
    node* pre = NULL;
    while(p->val < t) {
        pre = p;
        p = p->next;
    }

    if(p->val > t) {
        node* new_node = &all_nodes[++n];   // 从内存池中得到一个新的节点
        new_node->val = t;
        new_node->next = p;
        if(pre == NULL)
            head = new_node;
        else
            pre->next = new_node;
    }
    */

    /* 第二种, 使用直接改变前一个指针next指针的内容 */
    node** p = &head;
    /* 找到第一个不小于的节点 */
    for(; (*p)->val < t; p = &((*p)->next));

    /* 如果当前节点大, 那么在这个节点之前插入一个节点, 明确*p就是直接对应了pre的next对应地址中的内容, 直接修改 */
    if((*p)->val > t) {
        node* new_node = &all_nodes[++n];
        new_node->val = t;
        new_node->next = *p;
        *p = new_node;

        /* 如果不使用内存池的方式, 代码更加简单 */
        /* *p = node(t, *p); */
    }
}

void ListSet::report(int* v)
{
    int j = -1;
    for(node* p = head; p != sentinel; p = p->next)
        v[++j] = p->val;
}

class BSTSet
{
public:
    BSTSet(int maxv, int maxs) : max_val(maxv), max_size(maxs), n(0), root(0) {}
    void insert(int t) {
        /* 第一种使用, reverse insert 的递归形式 */
        // root = rinsert(root, t);

        /* 第二种使用, 直接调用循环的方式, 这里就体现出使用指向指针的指针方法的好处, 不需要保存
        pre指针, 以及到底是走了左子树还是右子树, 甚至是如果root为空, 也可以直接的修改 */
        node** p = &root;
        while(*p) {
            if((*p)->val == t)  return;

            if(t < (*p)->val)
                p = &((*p)->left);
            else
                p = &((*p)->right);
        }

        *p = new node(t);
        ++n;
    }

    int size() const {
        return n;
    }

    void report(int* d) {
        output_p = d;
        output_count = -1;
        travse(root);
    }

private:
    struct node {
        node(int t, node* l = NULL, node* r = NULL) : val(t), left(l), right(r) {}
        int val;
        node* left;
        node* right;
    };

private:
    void travse(node* p) {
        if(p == NULL)   return;

        travse(p->left);
        output_p[++output_count] = p->val;
        travse(p->right);
    }

    node* rinsert(node* p, int t) {
        if(p == NULL) {
            p = new node(t);
            ++n;
        } else if(p->val > t) {
            p->left = rinsert(p->left, t);
        } else if(p->val < t) {
            p->right = rinsert(p->right, t);
        }

        return p;
    }

    int* output_p;
    int output_count;
    node* root;

    int n ;
    int max_val;
    int max_size;
};

class BitSet
{
public:
    BitSet(int maxv, int maxs) : max_val(maxv), max_size(maxs), n(0) {
        int size = 1 + (maxv >> SHIFT);
        x = new int32_t[size];
        memset(x, 0, sizeof(int32_t)*size);
    }

    enum { BITSPERWORD = 32, SHIFT = 5, MASK = 0x1f };
    void insert(int t) {
        if(test(t)) return;
        set(t);
        ++n;
    }

    void report(int* d) {
        int c = -1;
        for(int i = 0; i < max_val; ++i)
            if(test(i))
                d[++c] = i;
    }

    int size() const {
        return n;
    }

private:
    bool test(int i) {
        return x[i >> SHIFT] & (1u << (i & MASK));
    }

    void clr(int i) {
        x[i >> SHIFT] &= ~(1u << (i & MASK));
    }

    void set(int i) {
        x[i >> SHIFT] |= (1u << (i & MASK));
    }

private:
    int max_val, max_size;
    int* x;
    int n;
};

/* 使用2的整数秘表示bin的大小 */
#define USING_2_N_SIZE_NUM_PER_BIN
class BinSet
{
public:
    BinSet(int maxv, int maxs) : max_val(maxv), max_size(maxs), n(0) {
        bins = new node*[max_size];
        sentinel = new node(max_val, NULL);

        /* 所有链表的尾节点都是一个sentinel */
        for(int i = 0; i < max_size; ++i)
            bins[i] = sentinel;

        int less_num_per_bin = max_val / max_size;
#ifdef USING_2_N_SIZE_NUM_PER_BIN
        /* 转换为2^bin_shift >= less_num_per_bin的最小值 */
        for(bin_shift = 0; less_num_per_bin; less_num_per_bin >>= 1, ++bin_shift);
        num_per_bin = 1 << bin_shift;
#else
        num_per_bin = 1 + less_num_per_bin;
#endif
    }

    void insert(int t) {
#ifdef USING_2_N_SIZE_NUM_PER_BIN
        int index = t >> bin_shift;
#else
        int index = t / num_per_bin;
#endif
        bins[index] = rinsert(bins[index], t);
    }

    int size() const {
        return n;
    }

    void report(int* d) {
        int c = -1;
        for(int i = 0; i < max_size; ++i)
            for(node* p = bins[i]; p != sentinel; p = p->next)
                d[++c] = p->val;
    }

private:
    struct node {
        node(int v, node* p) : val(v), next(p) {}
        int val;
        node* next;
    };
    node** bins;
    node* sentinel;

    node* rinsert(node* p, int t) {
        if(t > p->val) {
            p->next = rinsert(p->next, t);
        } else if(t < p->val) {
            p = new node(t, p);
            ++n;
        }

        return p;
    }

#ifdef USING_2_N_SIZE_NUM_PER_BIN
    int bin_shift;
#endif
    int num_per_bin;
    int max_val, max_size;
    int n;
};

template<typename SetType>
void gen_n_m(int n, int m)
{
    cout << "calling type : " << typeid(SetType).name() << endl;
    SetType s(n, m);
    while(s.size() != m)
        s.insert(rand() % n);

    int* d = new int[m];
    s.report(d);

    for(int i = 0; i < m; ++i)
        cout << d[i] << " ";
    cout << endl;

    delete[] d;
}

/* 使用floyd算法取样 */
template<typename SetType>
void gen_n_m_using_floyd(int n, int m)
{
    cout << "calling floyd algorithm using type : "
         << typeid(SetType).name() << endl;

    SetType s(n, m);
    for(int i = n - m; i < n; ++i) {
        int t = rand() % (n - m + 1);
        int old_size = s.size();
        s.insert(t);
        if(old_size == s.size())
            s.insert(i);
    }

    int* d = new int[m];
    s.report(d);

    for(int i = 0; i < m; ++i)
        cout << d[i] << " ";
    cout << endl;

    delete[] d;
}

#include <boost/format.hpp>
int main(int argc, char const* argv[])
{
    srand(time(NULL));

    {
        int n = 10, m = 2;
        boost::format fmt("select %1% from %2%");
        cout << (fmt % m % n) << endl;

        gen_n_m<ListSet>(n, m);
        gen_n_m<BSTSet>(n, m);
        gen_n_m<BitSet>(n, m);
        gen_n_m<BinSet>(n, m);

        gen_n_m_using_floyd<ListSet>(n, m);
        gen_n_m_using_floyd<BSTSet>(n, m);
        gen_n_m_using_floyd<BitSet>(n, m);
        gen_n_m_using_floyd<BinSet>(n, m);
    }

    {
        int n = 100, m = 99;
        boost::format fmt("select %1% from %2%");
        cout << (fmt % m % n) << endl;

        gen_n_m<ListSet>(n, m);
        gen_n_m<BSTSet>(n, m);
        gen_n_m<BitSet>(n, m);
        gen_n_m<BinSet>(n, m);

        gen_n_m_using_floyd<ListSet>(n, m);
        gen_n_m_using_floyd<BSTSet>(n, m);
        gen_n_m_using_floyd<BitSet>(n, m);
        gen_n_m_using_floyd<BinSet>(n, m);
    }
}
```
 
## 第十四章 : heap
 
书中给出的heap实现代码确实是很美妙, 简单, 有效.
 
1.  浪费了data[0]的空间用来保存sentinel, 在上调堆的时候, 将sentinel设置为最小值(如果为最小堆), 这样子
在上调堆的过程中, 不会超过该元素
 
2.  使用从1开始下边对heap进行操作, 特别的方便, 不需要考虑+1和-1的问题.
 
3.  上调堆和下调堆都是基于一个for循环, 不断的和父亲节点和子节点进行比较, 同时, for的结束条件也是
当前的父节点或者子节点是否还存在, 以及是不是不需要交换了, 因为已经符合heap的要求了.
 
4.  在for实现的过程中, 一边幅值子节点的数值(或者父节点), 一边就行比较, 代码真心简洁!
 
代码如下:
 
```C++
#include <limits>
class PriorityQueue
{
public:
    PriorityQueue(int max_size) : m_max_size(max_size) {
        data = new int[m_max_size + 1];
        /* 第一个元素不使用, 作为sentinel, 保证第一个元素最小, 那么所有向上调整堆不会越过第一个元素 */
        data[0] = numeric_limits<int>::min();
        n = 0;
    }

    void shift_up(int start_index) {
        for(int i = start_index, p = i; data[p = i/2] > data[i]; i = p)
            swap(data[i], data[p]);
    }

    void shift_down(int max_index) {
        for(int i = 1, c = i; (c = 2 * i) <= max_index; i = c) {
            /* 取得两者的最小值 */
            if(c + 1 <= max_index && data[c + 1] < data[c])
                ++c;
            if(data[i] < data[c])
                return;

            swap(data[i], data[c]);
        }
    }

    void insert(int t) {
        if(n == m_max_size)  return;

        data[++n] = t;
        shift_up(n);
    }

    int extract_min() {
        int t = data[1]; data[1] = data[n--];
        shift_down(n);
        return t;
    }

private:
    int m_max_size;
    int* data;
    int n;
};

#include <algorithm>
class STLMethodPriorityQueue
{
public:
    STLMethodPriorityQueue(int max_size) {}

    void insert(int t) {
        data.push_back(t);
        push_heap(data.begin(), data.end(), greater<int>());
    }

    int extract_min() {
        pop_heap(data.begin(), data.end(), greater<int>());
        int t = data.back();
        data.pop_back();
        return t;
    }

private:
    std::vector<int> data;
};

template<typename QueueType>
void test_priority_queue()
{
    int max_size = 100;
    QueueType q(max_size);

    int test_size = 20;
    for(int i = 0; i < test_size; ++i)
        q.insert(rand() % (2 * max_size));

    for(int i = 0; i < test_size; ++i)
        cout << q.extract_min() << " ";

    cout << endl;
}
```
 
## 第十五章 : 字符串
 
基于编程珠玑第15章节的随机文本生成算法:
 
实现的细节说明:
 
1.  使用后缀树保存所有 `k相邻连续单词` 为基本单元的后缀树.
2.  初始时刻每一个后缀数组都是保存一个单词的开始地址指针.
3.  以每一个单词为单位, 如果k个单词完全相同, 那么任何两个子串相同.
4.  这样子规则排序得到的单元具有 `k相邻连续单词` 的性质, 在后缀数组中相邻的元素, 具有相似的k个单词性质
5.  使用k阶单词生成方法, 表示使用前面k个单词来推导后面的第(k+1)的生成单词.
6.  假设随机的k个单词作为前缀, 然后生成第k+1个单词, 下一个的前缀是在之前前缀的基础上移动一个单元格距离, 直到
无法生成新的k+1单元格为止.
7.  产生新的k+1单词使用了随机生成算法, 每次找到一个相同的k前缀, 就随机的选择其中一个数值.
8.  使用传统的二分不能够找到第一个相同的元素, 自己体会代码中的二分写法.
 
nb的代码实现啊!!!! :

```C++
/* 保存当前所有输入的字符 */
char inputchars[50000];

/* 保存所有的 `k相邻单词` 排序后的后缀指针位置 */
vector<char*> words;

/* 单词个数 */
int word_count = 0;

/* 计算的阶数 */
const int k = 2;

void load_data(const char* file_name)
{
    if(!freopen(file_name, "r", stdin)) {
        puts("error: load file");
        return;
    }

    words.resize(10000, 0);
    memset(inputchars, sizeof(inputchars), 0);
    words[0] = inputchars;

    int i = 0;
    while(scanf("%s", words[i]) != EOF) {
        words[i + 1] = words[i] + strlen(words[i]) + 1;
        ++i;
    }
    word_count = i;
}

/* 比较最多k个单词字符串的大小, 注意在inputchars中末尾的数据都是0, 所以最后的一个元素处理时候不需要担心溢出 */
int wordncmp(const char* p, const char* q)
{
    int n = k;
    for(; *p == *q; ++p, ++q) {
        if(*p == 0 && --n == 0)
            return 0;
    }

    return *p - *q;
}

/* 输出排序在第i位置的(k+1)单词的内容 */
void print_index_word(int i)
{
    char* p = words[i];
    char* q = NULL;
    vector<char*> back_up;

    /* attention : 使用前k个单词, 等价于要输入 (k+1) 个元素, 最后一个元素就是根据k个元素
     * 推导的元素, 所以需要k个间隔, 执行k次
     */
    for(int j = 0; j < k; ++j) {
        while(*p) ++p;
        q = p++; *q = ' ';
        back_up.push_back(q);
    }
    cout << words[i] << endl;
    for(int i = 0; i < back_up.size(); ++i)
        *back_up[i] = 0;
}

void print_k_plus_one_word()
{
    for(int i = 0; i < word_count; ++i) {
        print_index_word(i);
    }
}

/* 转换为小于逻辑的比较操作 */
void sort_k_word()
{
    sort(words.begin(), words.begin() + word_count, [](const char * p,
    const char * q) {
        return wordncmp(p, q) < 0;
    });
}

/* 将当前p指向位置的字符串移动num个单词, 并且返回移动之后的新的单词位置 */
const char* skip(const char* p, int num)
{
    while(num--) {
        while(*p++);
    }

    return p;
}

/* 产生num个随机单词 */
void gene_rand_words(int num)
{
    /* 使用文本的前k个单词作为初始计算的种子 */
    const char* phrase = inputchars;
    while(num--) {

        /* 这里由于所有的计算串一定在数组中, 所以所有数值 target <= data[high] */
        int low = -1, high = word_count - 1;
        while(low + 1 != high) {
            int m = (low + high) / 2;
            if(wordncmp(words[m], phrase) < 0)
                low = m;
            else
                high = m;
        }

        /* 一定存在一个串是相同的 */
        assert(wordncmp(words[high], phrase) == 0);

        /* 找到所有相同的k前缀, 得到随机的下一个元素 */
        const char* select_p = NULL;
        for(int i = 0; wordncmp(words[high + i], phrase) == 0; ++i) {
            if((rand() % (i + 1)) == 0)
                select_p = words[high + i];
        }

        /* 判断是否生成的k+1个元素存在 */
        if(strlen(skip(select_p, k)) == 0) break;

        /* 输出 */
        cout << skip(select_p, k) << " ";

        /* 得到右移一个单词之后需要计算的phrase */
        phrase = skip(select_p, 1);
    }

    cout << endl;
}

int main(int argc, char const* argv[])
{
    srand(time(NULL));
    load_data("gene_rand_words.txt");
    sort_k_word();
    gene_rand_words(100);
}
```
