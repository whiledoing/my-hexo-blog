---
date: 2018/3/25 16:25:23
tags: [自写,技术面试,算法]
title: leetcode解题记录
---

自己之前刷[leetcode][1]的解题报告。

<!--more-->

## 使用栈遍历二叉树
 
使用递归遍历二叉树(中序), 需要注意的是其中node为空的时候, 既然要得到上一个遍历的元素,
就一定要保证栈不为空(任何时候如果需要对栈进行操作, 需要判断是否满足操作的条件, 第一个想到
就是当前栈不为空)

```C++
vector<int> inorderTraversal(TreeNode *root) {
    // Start typing your C/C++ solution below
    // DO NOT write int main() function
    vector<int> res;

    // node节点表示当前访问的元素, s保存当前元素访问路径上一个元素, 如果当前元素是空, 表示
    // 必须回到上一个元素位置
    TreeNode* node = root;
    stack<TreeNode*> s;
    while(!(node == NULL && s.empty())) {
        if(node) {
            s.push(node);
            node = node->left;
        } else if(!s.empty()) { // 这个非常重要, 不为空才可以去除元素
            res.push_back(s.top()->val);
            node = s.top()->right;
            s.pop();
        }
    }
    return res;
}
```
 
注意C++中常用的结构的接口之间的区别
 
1. queue的接口使用front和push进行操作
2. stack的接口使用top和push的方式进行操作
 
## 搜索指定和值
 
题目定义为:
 
Given a set of candidate numbers (C) and a target number (T), find all unique combinations in C where the candidate numbers sums to T.
The same repeated number may be chosen from C unlimited number of times.

Note:
All numbers (including target) will be positive integers.
Elements in a combination (a1, a2, … , ak) must be in non-descending order. (ie, a1 ≤ a2 ≤ … ≤ ak). The solution set must not contain duplicate combinations. For example, given candidate set 2,3,6,7 and target 7,  A solution set is: 

```
[7] 
[2, 2, 3]
```

找到和值为target的所有元素组合, 每一个元素都可以被使用一次到多次.第一个被想到的办法是dp, 但是dp并不方便记录所有的元素, 实现起来也比较麻烦. 

这种取数值问题, 可以理解为多阶段的搜索问题, 从i元素开始的集合中, 找到总和为target的所有集合情况. 搜索可以使用dfs来实现, 这里给出了一个比较挫的写法. 

```C++
// 根据当前元素最多可以放置的个数, 放置背包
class Solution
{
public:
    vector<int> temp;
    vector<vector<int> > res;
    int t;
    vector<vector<int> > combinationSum(vector<int>& candidates, int target) {
        // Start typing your C/C++ solution below
        // DO NOT write int main() function
        res.clear();
        t = target;
        sort(candidates.begin(), candidates.end());
        com_sum_re(candidates, 0, 0);
        return res;
    }
 
    void com_sum_re(const vector<int>& candi, int start, int sum) {
        if(sum == t) {
            res.push_back(temp);
            return;
        }
 
        if(start >= candi.size())
            return;
 
        if(candi[start] + sum > t)
            return;
 
        int v = candi[start];
        int n = (t - sum) / v;
        for(int i = 0; i <= n; ++i) {
            for(int j = 0; j < i; ++j)
                temp.push_back(v);
            com_sum_re(candi, start + 1, sum + i * v);
            for(int j = 0; j < i; ++j)
                temp.pop_back();
        }
    }
};
```
 
 
```C++
// 另外一种理解, 就是取一个元素, 等价于使用 sum + v[i] 的已有和值继续从i元素开始选择起来
// 这就将取多个元素和一个元素的情况统一了起来

class Solution
{
public:
    vector<int> temp;
    vector<vector<int> > res;
    int t;
    vector<vector<int> > combinationSum(vector<int>& candidates, int target) {
        // Start typing your C/C++ solution below
        // DO NOT write int main() function
        res.clear();
        t = target;
        sort(candidates.begin(), candidates.end());
        com_sum_re(candidates, 0, 0);
        return res;
    }
 
    void com_sum_re(const vector<int>& candi, int start, int sum) {
        if(sum == t) {
            res.push_back(temp);
            return;
        }
 
        if(start >= candi.size())
            return;
 
        int v = candi[start];
        if(v + sum > t)
            return;
 
        // not taken
        com_sum_re(candi, start + 1, sum);
 
        // taken, but keep start index
        temp.push_back(v);
        com_sum_re(candi, start, sum + v);
        temp.pop_back();
    }
};
```
 
wrap up:
 
1. 搜索问题的bfs一般比基于dp的方法更容易实现, 同时使用合理的剪枝和备忘录方法可以达到非常高的效率.
2. 明确搜索问题的状态空间是什么, 这里就是在i位置和值为sum, 这两个情况, 其实和DP中的变量是一直的.
 
## 求和问题2
 
Given a collection of candidate numbers (C) and a target number (T), find all unique combinations in C where the candidate numbers sums to T.
 
Each number in C may only be used once in the combination.
 
Note:
 
•All numbers (including target) will be positive integers.
•Elements in a combination (a1, a2, … , ak) must be in non-descending order. (ie, a1 ≤ a2 ≤ … ≤ ak).
•The solution set must not contain duplicate combinations.
 
 
For example, given candidate set 10,1,2,7,6,1,5 and target 8,
A solution set is:

```
[1, 7]
[1, 2, 5]
[2, 6]
[1, 1, 6]
```
 
题目的要求就是说, 只可以取得一个元素最多一次, 但是注意!! : 不可以有重复的对.
 
什么叫不可以有重复的对, 比如在 {1, 1} 中找到1, 那么结果只有一种就是{1}, 不会因为出现了两个1, 而有两个1的结果.
 
搜索的时候, 同样上面的计算方法, 但是如何保证元素不重复呢?
 
我们可以将所有相同的元素看成一个block进行分析 (类似与多个背包的问题)
 
假设我们dfs搜索了当前元素为a情况下的所有情况, 下一个元素也是a, 那么所有i位置之后的target-a大小的内容都被分析过(当选用了第一个元素为a的元素之后), 如果第一个a不取,而后面的a取的结果等价于取了第一个a的所有情况(因为a取的结果假设已经知道了), 结果上一样, 所以如果当前数值和前面元素数值相同, 且前面元素没有取.那么不可以取当前元素, 因为前面元素取情况下的结果和取这个元素再计算的结果就重复了.
 
为了使用这个结构, 将递归的方法进行了重写, 之前的逻辑是取一个元素, 不取一个元素, 并不知道上一个不取元素在哪里?
 
改为这样子的结构, 一个循环写所有不取当前元素的情况, 然后循环内部为取当前i元素的情况, 这样就知道了之前不取元素的位置, 所有相同的元素, 只计算一次.
 
```C++
class Solution
{
public:
    vector<int> temp;
    vector<vector<int> > res;
    vector<int> select;
    int t;
    vector<vector<int> > combinationSum2(vector<int>& candidates, int target) {
        // Start typing your C/C++ solution below
        // DO NOT write int main() function
        res.clear();
        t = target;
        sort(candidates.begin(), candidates.end());
 
        select.resize(candidates.size(), 0);
        com_sum_re(candidates, 0, 0);
        return res;
    }
 
    void com_sum_re(const vector<int>& candi, int start, int sum) {
        if(sum == t) {
            res.push_back(temp);
            return;
        }
 
        if(start >= candi.size()) {
            return;
        }
 
        // 如果可以取得当前元素, 取得当前元素, 然后递归计算得到当前i元素的所有情况
        // 同时循环中, 还计算了不取当前元素的所有情况, 如果知道当前元素为x, 那么之前
        // 如果存在元素也是x, 一定等价于之前取了x的结果, 所以最后将所有相同元素直接消掉即可.
        for(int i = start; i < candi.size() && candi[i] + sum <= t; ++i) {
            temp.push_back(candi[i]);
            com_sum_re(candi, i+1, sum + candi[i]);
            temp.pop_back();
            
            // 如果不取i元素, 后面几个相同的元素也都不需要计算了, 因为取了i元素的所有内容都计算过了
            while(i < candi.size() - 1 && candi[i+1] == candi[i]) ++i;
        }
    }
};
```
 
另外一种写法就是保存上一个元素的取值, 然后判断是不是出现, 上一个相同元素没有选择的情况, 该结果不选择
 
```C++
class Solution
{
public:
    vector<int> temp;
    vector<vector<int> > res;
    vector<int> select;
    int t;
    vector<vector<int> > combinationSum2(vector<int>& candidates, int target) {
        // Start typing your C/C++ solution below
        // DO NOT write int main() function
        res.clear();
        t = target;
        sort(candidates.begin(), candidates.end());
 
        select.resize(candidates.size(), 0);
        com_sum_re(candidates, 0, 0);
        return res;
    }
 
    void com_sum_re(const vector<int>& candi, int start, int sum) {
        if(sum == t) {
            res.push_back(temp);
            return;
        }
 
        if(start >= candi.size()) {
            return;
        }
 
        if(sum + candi[start] > t) {
            return;
        }
 
        select[start] = 0;
        com_sum_re(candi, start + 1, sum);
 
        if(start > 0 && candi[start] == candi[start - 1] && select[start - 1] == 0)
            return;
 
        select[start] = 1;
        temp.push_back(candi[start]);
        com_sum_re(candi, start + 1, sum + candi[start]);
        temp.pop_back();
    }
};
```
 
wrap up (真心有点难理解):
 
1. 相同的元素选择对最后结果影响相同的情况下, 进行排序, 按照block的思想对数据进行选择组合.
2. 搜索的时候, 可以结果状态空间数来分析, 有了空间树可以更好的理解递归解决好所有问题的含义.
3. 前面的元素的选择好的情况下, 递归就会计算出之后所有的结果, 所以如果前面一个元素没有使用, 而当前元素使用了, 且两者数值相同, 结果是等价的.
 
## 最好的获得股票3
 
Say you have an array for which the ith element is the price of a given stock on day i.
 
Design an algorithm to find the maximum profit. You may complete at most two transactions.
 
Note:
You may not engage in multiple transactions at the same time (ie, you must sell the stock before you buy again).
 
 
表示说得到两个最多的股票交易信息.
 
这里直接给出算法:
 
如果只可以得到一个股票, 如何计算:
 
1. 既然得到的一个数值必须要在左边找到一个比本身小的元素(不可以左边存在一个最小值, 而右边存在一个最大值).
2. 既然有时序关系, 我们在从左边遍历的时候, 可以同时保存当前最小的元素, 从[0, i]区间的最大值一定是
当前元素和最小值的差值, 以及更新当前最小值.
 
同样, 我们可以使用DP的思想, 得到一个range区间的最值, 也可以保存从[i, end)区间的所有元素最大值.
 
那么可以选择遍历其中一个元素, 然后两个子range的和值最大!!!
 
```C++
class Solution {
public:
    int maxProfit(vector<int> &prices) {
        // Start typing your C/C++ solution below
        // DO NOT write int main() function
 
        int n = prices.size();
        if(n <= 0)
            return 0;
 
        vector<int> x(n, 0); // 保存从[0, i]之间的最大值
        vector<int> y(n, 0); // 保存从(i, end)之间的最大值, 这样当前i的两边和值才可以表示为 [0, i] 和(i,end)之间的两个最大值.
 
        int min_v = prices[0];
        for(int i = 1; i < n; ++i) {
            min_v = min(min_v, prices[i]);
            x[i] = max(x[i-1], prices[i] - min_v);
        }
 
        int max_v = prices[n-1];
        for(int i = n-2; i >= 0; --i) {
            max_v = max(max_v, prices[i+1]);
            y[i] = max(y[i+1], max_v - prices[i+1]);
        }
 
        // check for max value between two range
        max_v = -1;
        for(int i = 0; i < n; ++i) {
            max_v = max(max_v, x[i]+y[i]);
        }
        return max_v;
    }
};
```
 
wrap up：
 
1. 记录最大值, 想到使用DP的思想, 得到当前一个子range的最大值.
2. 找到两个, 可以理解为在两个区间, 区间就想到了DP来构造.
 
## 最大沉水问题
 
Container With Most Water
 
Given n non-negative integers a1, a2, ..., an, where each represents a point at coordinate (i, ai). n vertical lines are drawn such that the two endpoints of line i is at (i, ai) and (i, 0). Find two lines, which together with x-axis forms a container, such that the container contains the most water.
 
Note: You may not slant the container.
 
题目描述, 给定一堆的高度, 寻找两个点, 使得面积最大:
 
$$max(min(heigth[i], height[j])*(j-i))$$
 
所有面积决定于两个部分:
 
1.    最小的高度.
2.    两者之间的长度信息.
 
如果我们在缩小高度范围的同时, 不断提高数据的高度, 是不是可以一直维持最大的可行解呢?
 
```C++
class Solution {
public:
    int maxArea(vector<int> &height) {
        if (height.size() < 2) return 0;
        int i = 0, j = height.size() - 1;
        int maxarea = 0;
        while(i < j) {
            int area = 0;
            if(height[i] < height[j]) {
                area = height[i] * (j-i);
                //Since i is lower than j,
                //so there will be no jj < j that make the area from i,jj
                //is greater than area from i,j
                //so the maximum area that can benefit from i is already recorded.
                //thus, we move i forward.
                //因为i是短板，所以如果无论j往前移动到什么位置，都不可能产生比area更大的面积
                //换句话所，i能形成的最大面积已经找到了，所以可以将i向前移。
                ++i;
            } else {
                area = height[j] * (j-i);
                //the same reason as above
                //同理
                --j;
            }
            if(maxarea < area) maxarea = area;
        }
        return maxarea;
    }
};
```
 
设置两个游标, 一个从头, 一个从尾巴. 根据短板效应, 如果一个板短, 其后面的所有元素都不可能超过当前
的最大值(因为高度值是不断变小的), 计算后面高度一直变大, 使用i作为开始板的高度最大就是height[i].
 
所以但记录可能最大值之后, 就排除了所有从i开始的元素, 直接让i变大.
 
所以算法一直在朝这最优路径进行计算:
 
1. 将长度设为最大.
2. 不停去掉当前可能最大的高度的所有值, 同时降低长度
 
这样, 即使长度降低, 但是高度不停增大, 也会操作最优的方向计算.
 
wrap up:
 
 这种最优, 想到排除可能的方法, 控制一个变量, 然后在缩小范围的时候, 总是朝着最优的可能路径进行搜索. [ref]( http://blog.unieagle.net/2012/09/16/leetcode%E9%A2%98%E7%9B%AE%EF%BC%9Acontainer-with-most-water/)
 
## Convert Sorted List to Balanced Binary Search Tree 
 
从一个有序的链表中转换为一个平衡二叉树.
 
最简单的方法, 找到链表的中点, 然后将左边和右边递归构造, 但是时间上是O(nlogn), 因为需要O(n)时间的查找复杂度.
 
递归的东西, 如果不可以从top-bottom中得到好的想法, 可以试试bottom-up的方式.!!!!
 
比如这里, 如果我们先从底上建立关系, 然后递归向上(就是先进行递归, 递归好了之后在考虑当前元素, 这里对应着先递归建立左子树, 然后得到跟节点的信息, 然后在递归建立右子树, 先将左子树bottom-up建立好), 建立左子树的过程中, 由于是中序建立, 访问节点的顺序就是链表中元素的顺序(这个太nb了), 所以使用一个变量来保存当前访问节点, 可以使用引用的方式, 不停跟踪当前被访问节点的顺序, 就可以起到顺序遍历链表进行构造的O(n)算法.
 
该递归做了两个事情:
 
1.    建立了从root开始len长度的树, 返回根节点
2.    链表扫描到当前节点的位置的下一个元素.
 
[参考](http://leetcode.com/2010/11/convert-sorted-list-to-balanced-binary.html)
 
```C++
/**
* Definition for singly-linked list.
* struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
* };
*/
/**
* Definition for binary tree
* struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
* };
*/
class Solution {
public:
    TreeNode *sortedListToBST(ListNode *head) {
        // Start typing your C/C++ solution below
        // DO NOT write int main() function
        return build_re(head, get_list_len(head));
    }
 
    TreeNode* build_re(ListNode*& root, int len) {
        if(len == 0) return NULL;
 
        int mid = len/2;
        TreeNode* left = build_re(root, mid);
        TreeNode* node = new TreeNode(root->val);
        TreeNode* right = build_re(root->next, len - mid - 1);
 
        node->left = left;
        node->right = right;
        root = root->next;
 
        return node;
    }
 
    int get_list_len(ListNode* head) {
        int count = 0;
        while(head) {
            ++count;
            head = head->next;
        }
        return count;
    }
};
```


## 寻找一个字符串中最长没有重复字符的子串
 
Given a string, find the length of the longest substring without repeating characters. For example, the longest substring without repeating letters for "abcabcbb" is "abc", which the length is 3. For "bbbbb" the longest substring is "b", with the length of 1.
 
分析:
 
1. 如果使用dp的思想来分析, 当前i位置到0位置之前区间中所有子串最大值, 一定是之前子串
的最大值, 和当前可以达到i位置子串最大值的最大值.
2. 进而发现分析i子串的时候需要知道从i回走, 第一个相同字符的位置, 这个之间的距离就是当前到i的最大不重复子串长度, 所以想到使用一个hash保存当前元素的位置, 或者存在性.
3. 类似于区间算法, 使用两个游标不停的控制当前遍历的范围, 如果找到了一个右边界, 和一个左边界,就确定了一个范围, 但找到右边和之前重复的元素之后, 移动左边界到不重复的位置之后的元素. 

这里实现的算法很巧妙:
 
1. 尽量使用简单的结构, 既然是对与字符进行hash, 使用一个256的数组即可.
2. 基本操作的分析: 基本操作是如果当前右边界不存在, 不停加入新的右边界, 如果右边界存在, 不停减小左边界, 一定在某一个位置, 左边界将右边界的元素去掉了, 这个时候右边界就可以移动了!!!
3. 使用了一定的剪枝, 如果当前back+res >= size 不可能出现更好的结果了, 同时, 这样子的 对范围遍历, 在最后结束循环的时候, 可能出现最后的一个range,没有被考虑到的情况, 需要补上一个 判断.
 
```C++ 
class Solution {
public:
    int lengthOfLongestSubstring(string str) {
        // Start typing your C/C++ solution below
        // DO NOT write int main() function
 
        bool exist[256] = {false};
        int front = 0, back = 0, size = str.size(), res = 0;
        while(front < size && back + res < size) {
            if(exist[str[front]]) {
                res = max(front - back, res);
                exist[str[back++]] = false;
            } else {
                exist[str[front++]] = true;
            }
        }
 
        res = max(front - back, res);
        return res;
    }
};
```
 
warp up:
 
1. 使用简单的类型比负责的更方便有效
2. 分析基本的操作, 将过多的操作提取成简单的基本操作模式.
 
 
## Valid Palindrome Total
 
Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.
 
For example,
"A man, a plan, a canal: Panama" is a palindrome.
"race a car" is not a palindrome.
 
Note:
Have you consider that the string might be empty? This is a good question to ask during an interview.
 
For the purpose of this problem, we define empty string as valid palindrome.
 
其实题目很简单，一种方式就是不挺的在首尾搜索，进行搜索，我的第一个想法是类似于quicksort的方式，写两个while循环，
然后不听的搜索到符合条件的位置，但是这样子的写法需要很多的范围判断：
 
```C++
while(i < j) {
    while(i < j && !isalnum(a[i])) ++i;
    while(i < j && !isalnum(a[j])) --j;
    if(i < j && tolower(a[i++]) != tolower(a[j--])) return false;
}
```
 
虽然看起来没有太多影响，但是很多的范围判断还是不爽。 一定程度上而言，这样子的while循环方式还有一种一个一个元素进行操作的方式，比如这里，完全可以固定一个位置，如果i位置不合适，就移动i，如果j位置不合适就移动j，直到某个位置都合适位置： 

```C++
class Solution {
public:
    bool isPalindrome(string s) {
        // IMPORTANT: Please reset any member data you declared, as
        // the same Solution instance will be reused for each test case.
        int i = 0, j = s.size() - 1;
        while(i < j) {
            if(!isalnum(s[i])) ++i;
            else if(!isalnum(s[j])) --j;
            else if(tolower(s[i++]) != tolower(s[j--])) return false;
        }
        return true;
    }
};
```
 
## Binary Tree Maximum Path Sum

Given a binary tree, find the maximum path sum.
 
The path may start and end at any node in the tree.
 
For example:
Given the below binary tree,
 
       1
      / \
     2   3
 
结果为6.
 
这个题目的关键点在于，有几种最优的情况。
 
1. 一旦一个路径从左子树穿过了跟节点到了右子树，这个根节点就是最上层节点，负责结果无意义。（试着想一下^形状，倒着的V字）
2. 所以递归可以得到的最佳路径，一定是要么是根节点本身，要么是穿过一个子树。
3. 但是全局上，一定是存在一个节点，即可以走过左子树也可以走过右子树，同时包含了当前节点，所以对于全局而言，记录该节点的位置即可，但是dfs的时候不需要返回。

```C++
class Solution {
public:
    int res;
    int maxPathSum(TreeNode *root) {
        // IMPORTANT: Please reset any member data you declared, as
        // the same Solution instance will be reused for each test case.
        res = INT_MIN;
        dfs(root);
        return res;
    }
 
    int dfs(TreeNode* root) {
        if(!root) return 0;
 
        int l = dfs(root->left);
        int r = dfs(root->right);
 
        int sum = max(root->val, max(l,r) + root->val);
        res = max(max(res, sum), root->val + l + r);
        return sum;
    }
};
```
 
 
## Best Time to Buy and Sell Stock II
 
Say you have an array for which the ith element is the price of a given stock on day i.
 
Design an algorithm to find the maximum profit. You may complete as many transactions as you like (ie, buy one and sell one share of the stock multiple times). However, you may not engage in multiple transactions at the same time (ie, you must sell the stock before you buy again).
 
这个题目的逻辑在于，需要得到所有递增的区间，每一个区间都是可以购买的。一个方式是while循环找到所有递增的区间，然后计算差值。
 
但是更好的方式在于：只计算每一个小段的和值。
 
逻辑在于我只需要累加计算即可，整体上的考虑可以化为更小unit的累加，和上上题目一样，几个大while的循环可以变为更小单位计算：
 
```C++
class Solution {
public:
    int maxProfit(vector<int> &prices) {
        // IMPORTANT: Please reset any member data you declared, as
        // the same Solution instance will be reused for each test case.
        int res = 0;
        for(int i = 0; i < prices.size() - 1; ++i) {
            if(prices[i+1] > prices[i])
                res += (prices[i+1] - prices[i]);
        }
        return res;
    }
};
```
 
但是上面的代码存在bug， size()方法返回值是unsigned,所以size()-1变为了一个最大的正数！！！
使用size()的时候一定要非常小心，换成另外一种方式：
 
```C++
class Solution {
public:
    int maxProfit(vector<int> &prices) {
        // IMPORTANT: Please reset any member data you declared, as
        // the same Solution instance will be reused for each test case.
        int res = 0;
        for(int i = 1; i < prices.size(); ++i) {
            if(prices[i] > prices[i-1])
                res += (prices[i] - prices[i-1]);
        }
        return res;
    }
};
```
 
## Given s1, s2, s3, find whether s3 is formed by the interleaving of s1 and s2.
 
For example,
Given:
s1 = "aabcc",
s2 = "dbbca",
 
When s3 = "aadbbcbcac", return true.
When s3 = "aadbbbaccc", return false.
 
重点在于DP，但是本来以为计算是二维的，以为计算了i，和j位置对应的两个子串，以及k对应的s3子串位置的格局。
但是其实不需要三维，以为第三维k一定是等于i+j的，不然怎么叫做通过s1[0..i]和s2[0..j]拼接成为了s3[0..k]呢？

```C++ 
class Solution {
public:
    string s1, s2, s3;
    vector<vector<int>> res;
    bool isInterleave(string s1, string s2, string s3) {
        // IMPORTANT: Please reset any member data you declared, as
        // the same Solution instance will be reused for each test case.   
        this->s1 = s1, this->s2 = s2, this->s3 = s3;
 
        res.clear();
        res.resize(s1.size() + 1, vector<int>(s2.size() + 1, -1));
        if(s1.size() + s2.size() != s3.size()) return false;
 
        return dfs(0, 0, 0) == 1;
    }
 
    bool dfs(int i, int j, int k) {
        if(k == s3.size())
            return true;
 
        if(res[i][j] != -1) return res[i][j];
 
        if(i < s1.size() && s3[k] == s1[i] && dfs(i+1, j, k+1)) return res[i][j] = true;
        if(j < s2.size() && s3[k] == s2[j] && dfs(i, j+1, k+1)) return res[i][j] = true;
 
        return res[i][j] = false;
    }
};
```


  [1]: https://leetcode.com/