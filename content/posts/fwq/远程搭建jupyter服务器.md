---
title: "[Python 笔记本] 远程搭建 jupyter 服务器"
date: 2022-02-02T21:47:35+08:00
author: "yibo"
description: ""
draft: false
math: true
tags: ["Jupyter","python","服务器"]
categories: ["Python 笔记本"]
---

本文通过搭建一个简单的远程 `Jupyter` 服务端，可以实现不分场合与时间运行代码，或者说是展示代码，这提供了极大的方便。

<!--more-->

### 搭建 `Jupyter` 服务器

`ssh` 远程登录服务器

```shell
ssh root@xxx.xxx.xxx.xxx
```

下载并安装 `miniconda` 

```shell
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
```

然后设置虚拟 `conda` 环境，这里我们的环境使用 `python 3.9`

```shell
conda create -n myenvname python=3.9
```

切换环境与停用环境

```shell
conda activate myenvname
conda deactivate
```

### 安装 `Jupyter` 和配置

安装 `jupyter`

```shell
conda install -c conda-forge jupyterlab
```

生成配置文件

```shell
jupyter notebook --generate-config
```

进入 `IPython` ，设置记住哈希密码（这里会将登录密码转换为哈希密码）

```shell
Ipython
```

```python
In[1]: from notebook.auth import passwd

In[2]: passwd()
Enter password:
Verify password:
Out[2]: 'argon2:$argon2id$v=19$m=10240,t=10,p=8$1Hk7hXkmqH0KUC3JswHy8A$W2Ya'
In[3]: exit
```

### 修改配置文件

通过 FTP 登录到服务器，找到配置文件 `jupyter_notebook_config.py` ，添加以下内容到文件末尾

```python
c.NotebookApp.password = u'argon2:$argon2id$v=19$m=10240,t=10,p=8$1Hk7hXkmqH0KUC3JswHy8A$W2Ya'
#就是刚才需要记下的哈希密码

c.NotebookApp.port = 9999  
#指定jupyter lab 运行端口，写一个不冲突的端口即可  

c.NotebookApp.allow_remote_access = True
# 允许远程访问 

c.NotebookApp.ip='*'  
# 就是设置所有ip皆可访问  

c.NotebookApp.open_browser = False
# 禁止自动打开浏览器  
```

> 注意：这里需要将端口放行，否则无法连接登录
>

### 服务器开启 `Jupyterlab`

输入代码打开 `Jupyterlab`

```shell
jupyter lab --allow-root
```

此时已经可以在浏览器上查看远程 `Jupyterlab` 了，但是当关闭终端时 `Jupyter` 也会相应关闭，所以我们需要让 `Jupyter` 保持在后台运行

后台运行，并将标准输出写入到 `jupyter.log` 中

```shell
nohup jupyter notebook --allow-root > jupyter.log 2>&1 &

nohup jupyter lab --allow-root > jupyter.log 2>&1 &
```

`nobup` 表示 `no hang up`，就是不挂起，退出终端后依然可以运行。

然后找到 `jupyter` 进程，终止该进程

```shell
ps -a
kill -9 pid
```

浏览器中输入 `xxx.xxx.xxx.xxx:9999` 进入 `jupyter notebook` 

浏览器中输入 `xxx.xxx.xxx.xxx:9999/lab` 进入 `jupyterlab` 

### 日常登陆 `Jupyter` 及服务器操作

远程登录服务器

```shell
ssh root@xxx.xxx.xxx.xxx
```

切换环境

```shell
conda activate myenvname
```

运行 `jupyterlab`

```shell
jupyter lab --allow-root
```

非挂起运行 `JupyterLab` （可关闭终端）

```shell
nohup jupyter notebook --allow-root > jupyter.log 2>&1 &
nohup jupyter lab --allow-root > jupyter.log 2>&1 &
```

查看运行进程，并杀死进程

```shell
ps -a
kill 1000
```

浏览器中输入 `xxx.xxx.xxx.xxx:9999` 进入 `jupyter notebook` 

浏览器中输入 `xxx.xxx.xxx.xxx:9999/lab` 进入 `jupyterlab` 







