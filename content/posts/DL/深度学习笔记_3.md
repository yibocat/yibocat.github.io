---
title: "[深度学习笔记] 深度学习第 2 篇——多层感知机"
date: 2022-02-14T12:12:13+08:00
author: "yibo"
description: ""
draft: false
math: true
tags: ["机器学习","深度学习","神经网络","PyTorch","感知机","ReLU"]
categories: ["烂笔头之深度学习"]
---

其实感知机也就是上一篇所讲的最简单的单层神经网络，即简单线性回归模型，也是属于一个简单二分类或多分类模型。

<p style="text-align:center"><img src="/images/dl/dl-20220214-01.png" style="zoom:16%;" /></p>

### 模型设计

多层感知机就是在原本感知机的基础上增加了若干层隐藏层。由于输入层不参与到计算，所以下图展示的是一个二层的神经网络模型。

<p style="text-align:center"><img src="/images/dl/dl-20220214-02.png" style="zoom:50%;" /></p>

可以看到，该多层感知机包含 5 个隐藏单元，并且隐藏层中的每个单元和输入层的各个输入是全连接的，输出层的神经元和隐藏层中的各个单元也是全连接的，所以多层感知机中的隐藏层和输出层都是全连接层。

</br>

我们设一个小批量样本 $X\in \mathbb{R}^{n\times d}$ ，批量大小为 $n$ ，输入个数为 $d$ 。隐藏层层数为一层，隐层单元数为 $h$ ，隐藏层输出为 $H\in \mathbb{R}^{n\times h}$ （也可以记为隐藏层变量）。

设隐藏层**权重参数**和**偏差**分别为 $W_h\in\mathbb{R}^{d\times h}$ 和 $b_h\in\mathbb{R}^{l \times h}$，输出层**权重**和**偏差**分别为 $W_o\in\mathbb{R}^{h\times q}$ 和 $b_o\in\mathbb{R}^{l\times q}$ 。由线性回归的公式可以得到多层感知机的设计模型
$$
H=XW_h+b_h \newline
O=HW_o+b_o
$$
将两个式子联立起来，可以得到
$$
O = (XW_h+b_h)W_o+b_o = XW_hW_o+b_hW_o+b_o
$$
可以看到，多层感知机的模型其实和单层神经网络是等价的，只不过输出层权重变成了 $W_hW_o$ ，偏差变成了 $b_hW_o+b_o$ 。

### 激活函数

由上面的推导我们知道线性变换只是对数据进行了**仿射变换(affine transformation)** ，我们不能直接根据其仿射变换得到想要的输出分类，所以需要引入非线性变换——**激活函数**。

神经网络中有很多不同的激活函数

</br>

**ReLU函数**

ReLU 函数（Rectified Linear Unit，修正线性单元），也叫 Rectifier 函数，是目前深度神经网络中经常使用的激活函数，该函数定义为
$$
ReLU(x)=\max(0,x)
$$
其图像如下所示

<p style="text-align:center"><img src="/images/dl/dl-20220214-03.png" style="zoom:36%;border:none;"/></p>

可以看到，当输入为负数时导数为 0 ，当输入为正数时导数为 1。

</br>

**Sigmoid 函数**

Sigmoid 函数可以将元素的值变换到 0 和 1 之间，该函数如下定义：
$$
Sigmoid(x) = \frac{1}{1+\exp(-x)}
$$
其图像如下所示

<p style="text-align:center"><img src="/images/dl/dl-20220214-04.png" style="zoom:36%;border:none;"/></p>

</br>

**Tanh 函数**

Tanh 函数是一种 Sigmoid 型函数，也叫做双正切函数，其定义为
$$
tanh(x)=\frac{\exp(x)-\exp(-x)}{\exp(x)+\exp(-x)}
$$
Tanh 函数可以看成是放大并平移的 Sigmoid 函数，其形状和 Sigmoid 函数看起来很像，但是值域是 (-1,1)。

<p style="text-align:center"><img src="/images/dl/dl-20220214-06.png" style="zoom:36%;border:none;"/></p>

我们可以对比一下 Logistic 型 Sigmoid 函数和 Tanh 函数的图像

<p style="text-align:center"><img src="/images/dl/dl-20220214-05.png" style="zoom:32%;"/></p>

### 多层感知机加入激活函数

通过上文已经知道，多层感知机就是含有至少一个隐藏层的全连接神经网络，每个隐藏层的输出由激活函数进行变换，我们可以将激活函数定义为 $\phi(x)$ ，那么多层感知机的模型如下所示
$$
H=\phi(XW_h+b_h) \newline
O=HW_o+b_o
$$
</br>

### 手动实现

这部分可以参考原书[https://tangshusen.me/Dive-into-DL-PyTorch/#/chapter03_DL-basics/3.9_mlp-scratch](https://tangshusen.me/Dive-into-DL-PyTorch/#/chapter03_DL-basics/3.9_mlp-scratch) 或者 Github [https://github.com/ShusenTang/Dive-into-DL-PyTorch/blob/master/code/chapter03_DL-basics/3.9_mlp-scratch.ipynb](https://github.com/ShusenTang/Dive-into-DL-PyTorch/blob/master/code/chapter03_DL-basics/3.9_mlp-scratch.ipynb) 。

获取数据和读取数据直接使用原书中所给的 Fashion-MNIST 数据集，这是一个图像多分类问题，我们假设小批量数据集的数量为 `batch_size = 256` ，并且通过 `d2l.load_data_fashion_mnist()` 方法得到了训练数据集合测试数据集，该函数是原书中图像多分类问题的读取数据集的函数 。代码如下

```python
batch_size = 256
train_iter, test_iter = d2l.load_data_fashion_mnist(batch_size)
```

</br>

**定义参数模型**

原数据集中的图像形状为 28$\times$28 ，一共有 10 个类别，所以可以用 $28\times 28=784$ 向量长度来表示一个图像。所以 输入个数为 784，输出个数为 10。因为我们的数据集的小批量数据数为 256，所以我们可以设置隐藏单元数为 256。注意：隐藏单元数是超参数。

然后对参数进行初始化。

```python
num_inputs, num_outputs, num_hiddens = 784, 10, 256

W1 = torch.tensor(np.random.normal(0, 0.01, (num_inputs, num_hiddens)), dtype=torch.float)
b1 = torch.zeros(num_hiddens, dtype=torch.float)
W2 = torch.tensor(np.random.normal(0, 0.01, (num_hiddens, num_outputs)), dtype=torch.float)
b2 = torch.zeros(num_outputs, dtype=torch.float)

params = [W1, b1, W2, b2]
for param in params:
    param.requires_grad_(requires_grad=True)
```

</br>

**定义激活函数**

`PyTorch` 已经有了 ReLU 函数，实现起来很简单。在手动实现时我们最好自己写。

```python
def relu(X):
    return torch.max(input=X, other=torch.tensor(0.0))
```

</br>

**定义模型**

定义模型的第一步需要将每张图像的形状改为长度为 `num_inputs` 的向量，以方便将其导入到输入层，然后根据上文中的表达式建立模型

```python
def net(X):
    X = X.view((-1, num_inputs))
    H = relu(torch.matmul(X, W1) + b1)
    return torch.matmul(H, W2) + b2
```

 `.view()` 函数表示重塑形状，这个函数和 `sklearn` 中的 `reshape()` 的功能是一样的，而 `view(-1,1)` 表示重塑成列向量。同理，`view(1,-1)` 表示重塑成行向量。 而 `torch.matmul()` 是矩阵相乘方法。

</br>

**定义损失函数**

损失函数直接使用 `PyTorch` 中的交叉熵损失函数

```python
loss = torch.nn.CrossEntropyLoss()
```

</br>

**训练模型**

我们设置两个超参数，迭代周期和学习率，分别为 5 和 100.0

```python
num_epochs, lr = 5, 100.0

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
```

```python
train_ch3(net, train_iter, test_iter, loss, num_epochs, batch_size, params, lr)
```

最后得到输出如下

```
epoch 1, loss 0.0030, train acc 0.714, test acc 0.753
epoch 2, loss 0.0019, train acc 0.821, test acc 0.777
epoch 3, loss 0.0017, train acc 0.842, test acc 0.834
epoch 4, loss 0.0015, train acc 0.857, test acc 0.839
epoch 5, loss 0.0014, train acc 0.865, test acc 0.845
```

</br>

全部手工实现多层感知机如上所示，但是这样手动实现其实很容易出现错误，且效率不高。我们可以使用 `PyTorch` 更简洁地实现多层感知机。

</br>

### 简洁实现

**模型定义**

模型定义可以直接使用 `PyTorch` 中的 `nn.Sequential` 来实现。

```python
num_inputs, num_outputs, num_hiddens = 784, 10, 256

net = nn.Sequential(
        d2l.FlattenLayer(),
        nn.Linear(num_inputs, num_hiddens),		# 输入层
        nn.ReLU(),								# 激活函数
        nn.Linear(num_hiddens, num_outputs), 	# 输出层
        )

for params in net.parameters():					# 初始化参数
    init.normal_(params, mean=0, std=0.01)
```

模型从上往下为输入层，激活函数，输出层。

</br>

**读取数据训练模型**

这里优化直接使用 `Pytorch` 中的 `SGD` 梯度下降算法

```python
batch_size = 256													# 小批量大小\隐藏单元数量
train_iter, test_iter = d2l.load_data_fashion_mnist(batch_size)		# 读取数据
loss = torch.nn.CrossEntropyLoss()									# 损失函数

optimizer = torch.optim.SGD(net.parameters(), lr=0.5)				# 优化方法

num_epochs = 5														# 迭代周期
train_ch3(net, train_iter, test_iter, loss, num_epochs, batch_size, None, None, optimizer)# 训练模型
```

最后输出

```
epoch 1, loss 0.0030, train acc 0.712, test acc 0.744
epoch 2, loss 0.0019, train acc 0.823, test acc 0.821
epoch 3, loss 0.0017, train acc 0.844, test acc 0.842
epoch 4, loss 0.0015, train acc 0.856, test acc 0.842
epoch 5, loss 0.0014, train acc 0.864, test acc 0.818
```

</br>

### 参考

[《动手学深度学习》PyTorch 版](https://tangshusen.me/Dive-into-DL-PyTorch/#/)

[《神经网络与深度学习》邱锡鹏教授](https://nndl.github.io)

