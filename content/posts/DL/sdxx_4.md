---
title: "[深度学习笔记] 深度学习第 4 篇——权重衰减与丢弃法"
date: 2022-02-15T14:26:12+08:00
author: "yibo"
description: ""
draft: false
math: true
tags: ["神经网络","权重衰减","丢弃法","正则化","PyTorch"]
categories: ["烂笔头之深度学习"]
---

权重衰减与丢弃法是常用的正则化方法，本篇文章我们尝试手动实现权重衰减与丢弃法，并且对其进行评估。

</br>

### 权重衰减

我们知道高复杂度模型与样本数据不匹配时会发生过拟合与欠拟合现象，而应对过拟合的方法，一方面是增大训练样本数据量，另外一种方法是限制模型复杂度。一般来说增大样本数据量来匹配神经网络模型复杂度的方法并不是一个好方法，而使用正则化手段对模型添加正则化项可以有效地限制模型复杂度从而防止过拟合。**权重衰减（Weight Decay）** 就是一种有效的正则化方法，即在每次参数更新时，引入一个衰减系数。

在标准的随机梯度下降中，权重衰减正则化与 $L2$ 范数正则化等价，但是在一些较复杂的优化方法中（Adam）并不等价。这里回顾一下 $L2$ 范数正则化。

</br>

**$L2$ 范数正则化**

$L2$ 范数正则化在模型原损失函数的基础上增加了 $L2$ 范数正则化项，以此来限制参数从而使得模型复杂度尽可能简单。$L2$ 范数正则化项指的是模型权重参数每个元素的平方和与一个正的常数的乘积。

我们看线性回归损失函数为
$$
\ell(\pmb{\omega},b)=\frac{1}{N}\sum_{i=1}^N\frac{1}{2}(\pmb{x}^{(i)}\pmb{\omega}+b-\pmb{y}^{(i)})^2
$$
其中 $\pmb{\omega}$ 为权重参数向量，$b$ 为偏差参数，样本 $i $ 的输入为 $\pmb{x}^{(i)}$ ，该样本标签为 $\pmb{y}^{(i)}$ ，样本数目为 $N$ 。则带有 $L2$ 范数正则化项的损失函数为
$$
\ell(\pmb{\omega},b)+\frac{\lambda}{2N}\vert\vert\pmb{\omega}\vert\vert^2
$$
这里 $\lambda>0$ 为超参数。当 $\lambda$ 接近 0 时，正则化项对损失函数的影响将逐渐降低。

$L2$ 范数平方 $\vert\vert\pmb{\omega}\vert\vert^2$ 展开后得到 $\sum_{i=1}^N\omega_i^2$ 。我们在小批量随机梯度下降中将线性回归中的权重 $\pmb{\omega}$ 的迭代方式
$$
\omega \gets \omega-\frac{\eta}{|\mathcal{B}|}\sum_{i\in\mathcal{B}}\frac{\partial \ell^{(i)}(\omega,b)}{\partial \omega}
$$
更改为如下方式
$$
\omega\gets(1-\frac{\eta\lambda}{\vert \mathcal{B}\vert})\omega-\frac{\eta}{\vert \mathcal{B}\vert}\sum_{i\in\mathcal{B}}\frac{\partial \ell^{(i)}(\omega,b)}{\partial \omega}
$$
可以看到， $L2$ 范数正则化将权重乘以一个小于 1 的数后再减去不含正则化项的梯度。所以 $L2$ 范数正则化也叫做权重衰减。

</br>

### 权重衰减手动编码实验

**生成数据集**

设样本数据集特征的维度为 $p$ ，对于数据集中的样本使用如下线性模型
$$
y = \sum_{i=1}^p0.01x_i+0.05+\epsilon
$$
这里权重为 0.01，$\epsilon$ 为噪声项，其服从均值为 0，标准差为0.01 的高斯分布。同时，我们为了更好的显示过拟合效果，设置维度 $p$ 为 200，训练数据集数量设置为 20。

导入必须包

```python
%matplotlib inline
import torch
import torch.nn as nn
import numpy as np
import sys
import d2lzh_pytorch as d2l
```

生成数据集

```python
n_train, n_test, num_imputs = 20, 100, 200
true_w, true_b = torch.ones(num_imputs, 1) * 0.01, 0.05

# 生成数据集
features = torch.rand((n_train + n_test, num_imputs))
labels = torch.matmul(features, true_w) + true_b

labels += torch.tensor(np.random.normal(0, 0.01, size=labels.size()), dtype=torch.float)
train_features, test_features = features[:n_train, :], features[n_train:, :]
train_labels, test_labels = labels[:n_train], labels[n_train:]
```

</br>

**初始化模型参数**

定义一个初始化模型参数的函数

```python
def init_params():
    # 随机初始化参数
    w = torch.randn((num_inputs, 1), requires_grad=True)
    b = torch.zeros(1, requires_grad=True)
    return [w, b]
```

</br>

**$L2$ 范数正则化项**

```python
def l2_penalty(w):
    return (w**2).sum() / 2
```

</br>

**定义和训练模型**

```python
batch_size, num_epochs, lr = 1, 100, 0.003			# 小批量为 1，迭代周期 100
net, loss = d2l.linreg, d2l.squared_loss			# net 使用线性回归，损失函数使用平方差损失

dataset = torch.utils.data.TensorDataset(train_features, train_labels)
train_iter = torch.utils.data.DataLoader(dataset, batch_size, shuffle=True)

def fit_and_plot(lambd):
    w, b = init_params()
    train_ls, test_ls = [], []
    for _ in range(num_epochs):
        for X, y in train_iter:
            # 添加了L2范数惩罚项
            l = loss(net(X, w, b), y) + lambd * l2_penalty(w) 	# 增加正则化项的损失函数
            l = l.sum()

            if w.grad is not None:					# 梯度清零
                w.grad.data.zero_()
                b.grad.data.zero_()
            l.backward()							# 反向传播计算
            d2l.sgd([w, b], lr, batch_size)			# 随机梯度下降法
        train_ls.append(loss(net(train_features, w, b), train_labels).mean().item())
        test_ls.append(loss(net(test_features, w, b), test_labels).mean().item())
    d2l.semilogy(range(1, num_epochs + 1), train_ls, 'epochs', 'loss',
                 range(1, num_epochs + 1), test_ls, ['train', 'test'])	# 画图
    print('L2 norm of w:', w.norm().item())
```

</br>

**观察过拟合**

首先我们让 $\lambda=0.005$ ，因为 $\lambda$  接近 0，所以正则化项的影响非常小。

```python
fit_and_plot(lambd=0.005)
```

输出

```
L2 norm of w: 12.12175464630127
```

<p style="text-align:center"><img src="/images/dl/dl-20220215-06.svg" style="width:50%;border:none;" /></p>

我们可以看到训练误差远远小于测试误差，这是很明显的过拟合。

然后我们增大 $\lambda$ ，设置为 $\lambda=4$

```python
fit_and_plot(lambd=4)
```

输出

```
L2 norm of w: 0.07619155943393707
```

<p style="text-align:center"><img src="/images/dl/dl-20220215-07.svg" style="width:50%;border:none;" /></p>

可以明显的看到测试误差有所下降，过拟合现象有所缓解。另外，权重参数的L2L_2*L*2范数比不使用权重衰减时的更小，此时的权重参数更接近0。

</br>

### 丢弃法

<p style="text-align:center"><img src="/images/dl/dl-20220215-08.png" style="width:50%;" /></p>

我们假设一个模型，其输入个数为 4 个，隐藏单元为 5，则隐藏单元 $h_i$ 的计算表达式为
$$
h_i=\phi(x_1\omega_{1i}+x_2\omega_{2i}+x_3\omega_{3i}+x_4\omega_{4i}+b_i)
$$
这里 $\phi$ 表示激活函数。当我们对隐藏层使用丢弃法时，该层的隐藏单元会有一定的概率被丢弃掉，我们设丢弃概率为 $p$ ，则一个隐藏单元有 $p$ 概率会被清零，有 $1-p$ 的概率该隐藏单元除以 $1-p$ 进行拉伸。而丢弃概率是超参数。

设随机变量 $\xi_i$ 为 0 和 1 的概率为 $p$ 和 $1-p$ ，则该随机变量服从伯努利分布。我们设隐藏单元 $h'_i$ 为
$$
h'_i=\frac{\xi_i}{1-p}h_i
$$
因为 $\xi_i$ 服从伯努利分布，所以其期望为 $E(\xi_i)=1-p$ ，所以
$$
E(h'_i)=\frac{E(\xi_i)}{1-p}h_i=h_i
$$
得到结论：**丢弃法不改变输入的期望值**！

我们看一下上述模型使用丢弃法后的神经网络结构

<p style="text-align:center"><img src="/images/dl/dl-20220215-09.svg" style="width:50%;border:none;" /></p>

可以看到 $h_2$ 和 $h_5$ 都被清零，因此反向传播时与 $h_2$ 和 $h_5$ 相关的权重的梯度为 0。

为什么丢弃法起到正则化的作用？和正则化一样，丢弃法也是为了从减小模型复杂度出发来防止过拟合的，因为随机减少隐藏单元和缩小维度是一样的道理。邱锡鹏教授的《神经网络与深度学习》中给出了两种解释：**集成学习角度**的解释和**贝叶斯学习角度**的解释。

</br>

**集成学习角度的解释**

每做一次丢弃，相当于从原始的网络中采样得到一个子网络，若一个神经网络有 $n$ 个神经元，那么总共可以采样出 $2^n$ 个子网络。每次迭代都相当于训练一个不同的子网络，这些子网络都共享原始网络的参数，所以最终的网络可以近似看作是集成了指数级个不同网络的组合模型。

</br>

**贝叶斯学习角度的解释**（不是太明白......）

丢弃法可以解释为一种贝叶斯学习的近似，用 $y=f(\pmb{x};\theta)$ 来表示要学习的神经网络，贝叶斯学习时假设参数 $\theta$ 为随机向量，并且先验分布为 $q(\theta)$ ，贝叶斯方法的预测为
$$
\mathbb{E}_{q(\theta)}[y]=\int_qf(\pmb{x};\theta)q(\theta)d\theta\approx\frac{1}{M} \sum^M f(\pmb{x},\theta_i)
$$
其中 $f(\pmb{x},\theta_i)$ 为第 $i$ 次使用丢弃法后的网络，其参数 $\theta_i$ 为对全部参数 $\theta$ 的一次采样。

</br>

### 手动实现丢弃法

定义 `dropout()` 函数以 `drop_prob` 的概率丢弃。

```python
def dropout(X, drop_prob):
    X = X.float()
    assert 0 <= drop_prob <= 1
    keep_prob = 1 - drop_prob
    # 这种情况下把全部元素都丢弃
    if keep_prob == 0:
        return torch.zeros_like(X)
    mask = (torch.rand(X.shape) < keep_prob).float()

    return mask * X / keep_prob
```

</br>

**定义模型参数**

这里继续使用原书中的 Fashion-MNIST 数据集。然后定义一个包含两个隐藏层的多层感知机，且两个隐藏层的输出个数均为 256。

```python
num_inputs, num_outputs, num_hiddens1, num_hiddens2 = 784, 10, 256, 256

W1 = torch.tensor(np.random.normal(0, 0.01, size=(num_inputs, num_hiddens1)), dtype=torch.float, requires_grad=True)
b1 = torch.zeros(num_hiddens1, requires_grad=True)
W2 = torch.tensor(np.random.normal(0, 0.01, size=(num_hiddens1, num_hiddens2)), dtype=torch.float, requires_grad=True)
b2 = torch.zeros(num_hiddens2, requires_grad=True)
W3 = torch.tensor(np.random.normal(0, 0.01, size=(num_hiddens2, num_outputs)), dtype=torch.float, requires_grad=True)
b3 = torch.zeros(num_outputs, requires_grad=True)

params = [W1, b1, W2, b2, W3, b3]
```

</br>

**定义模型**

模型定义部分使用 `ReLU` 激活函数，然后对每个激活函数的输出使用丢弃法。这里我们将第一个隐藏层的丢弃概率设置为 0.1，第二个隐藏层的丢弃概率设为 0.6，然后通过参数 `is_training` 来判断运行模式是训练还是测试，并在训练模式中使用丢弃法。

```python
drop_prob1, drop_prob2 = 0.1, 0.6

def net(X, is_training=True):
    X = X.view(-1, num_inputs)
    H1 = (torch.matmul(X, W1) + b1).relu()
    if is_training:  					# 只在训练模型时使用丢弃法
        H1 = dropout(H1, drop_prob1)  	# 在第一层全连接后添加丢弃层
    H2 = (torch.matmul(H1, W2) + b2).relu()
    if is_training:
        H2 = dropout(H2, drop_prob2)  	# 在第二层全连接后添加丢弃层
    return torch.matmul(H2, W3) + b3
```

</br>

**模型评估**

在对模型进行评估的时候不应该使用丢弃法

```python
# 本函数已保存在d2lzh_pytorch
def evaluate_accuracy(data_iter, net):
    acc_sum, n = 0.0, 0
    for X, y in data_iter:
        if isinstance(net, torch.nn.Module):
            net.eval() 					# 评估模式, 这会关闭dropout
            acc_sum += (net(X).argmax(dim=1) == y).float().sum().item()
            net.train() 				# 改回训练模式
        else: 							# 自定义的模型
            if('is_training' in net.__code__.co_varnames): 
                # 如果有is_training这个参数
                # 将is_training设置成False
                acc_sum += (net(X, is_training=False).argmax(dim=1) == y).float().sum().item() 
            else:
                acc_sum += (net(X).argmax(dim=1) == y).float().sum().item() 
        n += y.shape[0]
    return acc_sum / n
```

</br>

**训练和测试**

模型训练 `train_ch3()` 使用和多层感知机里一样的方法

```python
num_epochs, lr = 5, 0.1

# 本函数已保存在d2lzh包中方便以后使用
def train_ch3(net, train_iter, test_iter, loss, num_epochs, batch_size,
              params=None, lr=None, optimizer=None):
    for epoch in range(num_epochs):
        train_l_sum, train_acc_sum, n = 0.0, 0.0, 0
        for X, y in train_iter:
            y_hat = net(X)
            l = loss(y_hat, y).sum()

            # 梯度清零
            if optimizer is not None:
                optimizer.zero_grad()
            elif params is not None and params[0].grad is not None:
                for param in params:
                    param.grad.data.zero_()

            l.backward()
            if optimizer is None:
                d2l.sgd(params, lr, batch_size)
            else:
                optimizer.step()  # “softmax回归的简洁实现”一节将用到


            train_l_sum += l.item()
            train_acc_sum += (y_hat.argmax(dim=1) == y).sum().item()
            n += y.shape[0]
        test_acc = evaluate_accuracy(test_iter, net)
        print('epoch %d, loss %.4f, train acc %.3f, test acc %.3f'
              % (epoch + 1, train_l_sum / n, train_acc_sum / n, test_acc))

train_ch3(net, train_iter, test_iter, cross_entropy, num_epochs, batch_size, [W, b], lr)
```

```python
num_epochs, lr, batch_size = 5, 100.0, 256
loss = torch.nn.CrossEntropyLoss()
train_iter, test_iter = d2l.load_data_fashion_mnist(batch_size)
d2l.train_ch3(net, train_iter, test_iter, loss, num_epochs, batch_size, params, lr)
```

输出

```
epoch 1, loss 0.0047, train acc 0.538, test acc 0.763
epoch 2, loss 0.0024, train acc 0.777, test acc 0.773
epoch 3, loss 0.0020, train acc 0.817, test acc 0.792
epoch 4, loss 0.0018, train acc 0.839, test acc 0.802
epoch 5, loss 0.0017, train acc 0.845, test acc 0.831
```

</br>

最后，原书中还有两种方法的简洁实现，这里不再写了。

</br>

### 参考

1. 《动手学深度学习》PyTorch 版，阿斯顿·张、李沐 [https://tangshusen.me/Dive-into-DL-PyTorch/#/](https://tangshusen.me/Dive-into-DL-PyTorch/#/)

2. 《神经网络与深度学习》邱锡鹏 [https://nndl.github.io](https://nndl.github.io/)





