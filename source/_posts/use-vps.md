---
date: 2018/3/16 20:23:24
tags: [自写,network]
title: 使用vps
---

## 购买vps

之前用过一定时间的[vultr][1]日本vps，价格很便宜，但是总是感觉ssh上去会中断，索性没有继续使用，而是推荐都比较多人使用的[搬瓦工][2]这个老牌vps运行商上面。

折腾了一个美国的CN2电信直连线路的服务器，平均ping值在180ms左右，勉强够用，1G的月流量也是够我使用youtube看视频了。

## 部署服务器ssh

### 建立用户

建立用户的使用，一定要设置好密码，否则用户会因为locked状态导致后期ssh登陆的异常，可以[参考][3]。

设置用户的时候，最后加上`wheel`这个group，这样子`visudo`的时候，只需要将特定的组设置为高权限即可。所有创建用户使用命令：

    useradd -p xxxx -G wheel account_name
    
其中，使用`-G`参数加入secondary user group而不是将wheel作为主用户组更加好，这篇[文章][4]有说明其中的区别。

### 配置sshd

目标是无密码的登陆进入我的新用户账号，所以需要确保`/etc/ssh/sshd_config`中的相关配置开启（一般默认就是开启的）：

    RSAAuthentication yes
    PubkeyAuthentication yes
    
然后需要留意`StrictModes`参数的设置，默认是开启严格检测，就是默认要保证ssh的高安全性，这就需要我们用户的RSA验证key只可以自己访问到：

    chmod 700 ~/.ssh
    chmod 600 ~/.ssh/authorized_keys
    
然后我们重启`/etc/init.d/sshd restart`就可以直接无密码登陆。

如果需要调试ssh的状态，可以：

1. 使用debug模式：`sshd -d -p 12345`
2. 查看ssh的日志：`tail -f /var/log/secure`

参考：

- [记一次诡异的 ssh 互信免密码登录失败][5] 
- [Why am I still getting a password prompt with ssh with public key authentication?][6]


  [1]: https://my.vultr.com/%20vultr%20vps
  [2]: http://bwg.yiqimaila.com/bwg/buy.html "搬瓦工"
  [3]: http://www.golinuxhub.com/2014/08/how-to-check-lock-status-of-any-user.html
  [4]: https://www.cyberciti.biz/faq/howto-linux-add-user-to-group/
  [5]: https://my.oschina.net/leejun2005/blog/1527765
  [6]: https://unix.stackexchange.com/questions/36540/why-am-i-still-getting-a-password-prompt-with-ssh-with-public-key-authentication.html
  [4]: https://www.cyberciti.biz/faq/howto-linux-add-user-to-group/
  [5]: https://my.oschina.net/leejun2005/blog/1527765