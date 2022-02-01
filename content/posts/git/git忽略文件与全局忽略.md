---
title: "[Git 日记] Git 忽略 .DS_Store 与全局忽略"
date: 2022-02-01T10:53:07+08:00
author: "yibo"
description: ""
draft: false
math: true
tags: ["Git","Mac OS",".DS_Store",".gitignore"]
categories: ["Git 日记"]
---

Mac OS 的每个文件夹下都有一个隐藏文件 .DS_Store，该文件保存的是当前文件夹的属性，如图标位置、背景等。

<!--more-->

但是每次使用 Git 提交更改时，都会自动生成 .DS_Store 更改，所以每次提交到版本库和 `push` 到 Github 总是很麻烦。所以 .DS_Store 是没有必要提交到版本库的，这时可以使用 git.gitignore 来忽略此类文件。

### 忽略当前目录下的 .DS_Store

我们在所要忽略 .DS_Store 的目录下创建一个 `.gitignore` 文件，然后将要忽略的文件名写入进去

```shell
touch .gitignore
```

<img src="/images/git/git-20220201-1.png" alt="jzrj-20220129-20" style="zoom:50%;" />

每次忽略任何文件只需将要忽略的文件添加到 `.gitignore` 文件就可以了。

但是每次更改完 `.gitignore` 文件之后，都需要运行以下代码，否则 `.gitignore` 是不生效的

```shell
git rm -r --cached .
git add .
git commit -m 'update .gitignore'
```

### git 全局忽略

首先在终端输入如下代码查看 git 现有的全局配置

```shell
git config --list
```

git 全局配置都在一个 `.gitconfig` 文件中，所以可以使用 git 全局配置进行全局忽略 .DS_Store 。

具体步骤是在根目录创建一个 `.gitignore_global` 文件，把要忽略的文件直接添加到该文件中，和上文中的当前目录添加是一样的

然后在终端输入

```shell
git config --global core.excludesfile/Users/reon/.gitignore_global
```

或者直接在 `.gitconfig` 中添加如下内容

```shell
[core]
    excludefile = /Users/xiaqunfeng/.gitignore_global
```

然后同样，同样执行代码

```shell
git rm --cached filename
git commit -m "rm filename"
```

然后 `push` 到 `Github` 就可以了。

### 参考

1. http://xiaqunfeng.cc/2018/04/24/git-ignore-ds-store/#%E5%88%A0%E9%99%A4github%E4%B8%8A%E6%96%87%E4%BB%B6
2. https://blog.csdn.net/allanGold/article/details/73132606























