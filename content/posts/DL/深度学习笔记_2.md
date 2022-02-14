---
title: "[深度学习笔记] 深度学习第 1 篇——简单线性回归"
date: 2022-02-08T22:06:10+08:00
author: "yibo"
description: ""
draft: false
math: true
tags: ["线性回归","PyTorch","深度学习"]
categories: ["烂笔头之深度学习"]
---

线性模型（Linear Model）是机器学习中应用最广泛的模型，指通过样本特征的线性组合来进行预测的模型。线性回归是单层神经网络，其涉及的概念和技术适用于大多数深度学习模型。

</br>

### 线性回归

**模型定义**

给定一个 $ D $ 维样本 $ x=[x_1,x_2,\cdots,x_D]^T $ 其线性组合函数为
$$
f(x;\omega)=\omega^Tx+b
$$
我们说 $ \omega $ 是一个权重矩阵（可以理解为斜率）， $ b $ 为偏差（可以理解为截距），其均为标量。这两个参数称为线性回归模型的参数，而我们的目的就是通过训练模型，得到最佳的参数估计。

</br>

**损失函数**

模型训练出的预测值通常需要和真实值进行比对，这种比对也就是**误差**。在机器学习里把衡量误差的函数称为**损失函数（loss function）**。这里我们使用平方误差函数，单个样本的平方损失函数可以如下表示
$$
l^{(i)}(\omega,b) = \frac{1}{2}(\hat{y}-y)^2
$$
这里 $ \hat{y} $ 表示训练的预测值，$ y $ 表示真实值，$ \frac{1}{2} $ 是为了在求导时方便化简。训练集中所有样本的误差的平均来衡量模型预测的质量，即
$$
l(\omega,b)=\frac{1}{n}\sum_{i=1}^nl^{(i)}(\omega,b)
$$
正如上文提到的，深度学习的任务就是找到一组模型参数，使得训练样本的损失最小。

</br>

**算法优化**

求解数值解的优化算法中，**小批量随机梯度下降法（mini-batch stochastic gradient descent** 在深度学习中被广泛使用。

> 当模型和损失函数形式较为简单时，上面的误差最小化问题的解可以直接用公式表达出来。这类解叫作解析解（analytical solution）。本节使用的线性回归和平方误差刚好属于这个范畴。然而，大多数深度学习模型并没有解析解，只能通过优化算法有限次迭代模型参数来尽可能降低损失函数的值。这类解叫作数值解（numerical solution）。

在线性回归模型中，模型的每个参数的迭代如下所示:
$$
\omega \gets \omega-\frac{\eta}{|\mathcal{B}|}\sum_{i\in\mathcal{B}}\frac{\partial l^{(i)}(\omega,b)}{\partial \omega} \newline
b\gets b-\frac{\eta}{|\mathcal{B}|}\sum_{i\in\mathcal{B}}\frac{\partial l^{(i)}(\omega,b)}{\partial b}
$$
这里 $ |\mathcal{B}| $ 表示每个小批量的样本个数，$\eta$ 为学习率。而这里的小批量样本数和学习率是人为设定的而不是学习得来的，所以被称为超参数（hyperparameter）。

</br>

### 线性回归实现

</br>

线性回归的实现总体上分为以下几个步骤：

1. 数据集的准备
2. 初始化模型参数
3. 定义模型
4. 定义损失函数
5. 定义优化算法、
6. 训练模型

在此之前，我们可以定义一个函数，生成特征标签的散点图，这样可以更直接地观察两者间的线性关系。

```python
def use_svg_display():
    # 用矢量图显示
    display.set_matplotlib_formats('svg')

def set_figsize(figsize=(3.5, 2.5)):
    use_svg_display()
    # 设置图的尺寸
    plt.rcParams['figure.figsize'] = figsize

#打印散点图
set_figsize()
plt.scatter(features[:, 1].numpy(), labels.numpy(), 1);
```

</br>

**读取数据**

训练模型的时候需要不断读取小批量数据样本，所以可以定义一个函数来返回小批量的随机样本的特征和标签

```python
def data_iter(batch_size, features, labels):
    # batch_size 表示批量大小
    num_examples = len(features)
    indices = list(range(num_examples))
    random.shuffle(indices)  # 样本的读取顺序是随机的
    for i in range(0, num_examples, batch_size):
        j = torch.LongTensor(indices[i: min(i + batch_size, num_examples)]) # 最后一次可能不足一个batch
        yield  features.index_select(0, j), labels.index_select(0, j)

batch_size = 10

for X, y in data_iter(batch_size, features, labels):
    # 打印
    print(X, y)
    break
```

</br>

**初始化模型参数**

权重初始化成均值为 0 ，标准差为 0.01 的正太随机数，偏差初始化为 0。然后因为参数需要求梯度来迭代，所以设置 `requires_grad=True`。

```python
w = torch.tensor(np.random.normal(0, 0.01, (num_inputs, 1)), dtype=torch.float32)
b = torch.zeros(1, dtype=torch.float32)
w.requires_grad_(requires_grad=True)
b.requires_grad_(requires_grad=True) 
```

</br>

**定义模型**

我们已经知道了线性回归的模型表达式，使用 `torch.mm` 进行矩阵乘法运算

```python
def linreg(X, w, b):
    return torch.mm(X, w) + b
```

</br>

**定义损失函数**

损失函数我们使用平方损失函数。注意：由于 $\hat{y}-y$ 中，$\hat{y}$ 和 $y$ 的形状是不一样的，所以需要使用 `y.view` 将 $y$ 的形状变成预测值 $\hat{y}$ 的形状。

```python
def squared_loss(y_hat, y):
    # 注意这里返回的是向量, 另外, pytorch里的MSELoss并没有除以 2
    return (y_hat - y.view(y_hat.size())) ** 2 / 2
```

</br>

**定义优化算法**

优化算法根据上文提到的使用小批量随机梯度下降算法，其通过不断迭代模型参数来优化损失函数。这里 `lr` 为迭代步长。

```python
def sgd(params, lr, batch_size):
    for param in params:
        param.data -= lr * param.grad / batch_size # 注意这里更改param时用的param.data
```

</br>

**训练模型**

```python
lr = 0.03												# 迭代步长
num_epochs = 3											# 迭代周期
net = linreg											# 使用线性模型
loss = squared_loss										# 损失函数

for epoch in range(num_epochs):  						# 训练模型一共需要num_epochs个迭代周期
    # 在每一个迭代周期中，会使用训练数据集中所有样本一次（假设样本数能够被批量大小整除）。X
    # 和y分别是小批量样本的特征和标签
    for X, y in data_iter(batch_size, features, labels):
        l = loss(net(X, w, b), y).sum()  				# l是有关小批量X和y的损失
        l.backward()  									# 小批量的损失对模型参数求梯度
        sgd([w, b], lr, batch_size)  					# 使用小批量随机梯度下降迭代模型参数

        # 不要忘了梯度清零
        w.grad.data.zero_()
        b.grad.data.zero_()
    train_l = loss(net(features, w, b), labels)
    print('epoch %d, loss %f' % (epoch + 1, train_l.mean().item()))
```

这里我们设置迭代步长为 0.03，迭代周期为 3，每次迭代周期中都会通过 `data_iter` 读取小批量数据样本，然后设置损失函数时，由于 `l` 并不是标量，所以需要通过 `sum()` 方法求和得到标量，再使用 `l.backward()` 得到模型参数的梯度，然后使用小批量随机梯度下降法迭代模型参数。注意：每次迭代完需要对梯度清零。

</br>

以上就是全人工实现了一个简单的线性回归模型。当然，`PyTorch` 提供了简便的模型构造方法和多种损失函数。

</br>

### 线性回归简洁实现

</br>

**读取数据**

`PyTorch` 提供了 `data` 包读取数据。

```python
import torch.utils.data as Data

batch_size = 10
# 将训练数据的特征和标签组合
dataset = Data.TensorDataset(features, labels)
# 随机读取小批量
data_iter = Data.DataLoader(dataset, batch_size, shuffle=True)

for X, y in data_iter:
    # 打印
    print(X, y)
    break
```

</br>

**定义模型**

`PyTorch` 提供了大量预定义的层，这使得我们可以很简洁的实现模型的构造。

导入 `torch.nn` 模块，`nn`的核心数据结构是 `Module` 。`Module` 是一个抽象概念，既可以表示一个层，又可以表示一个很多层的神经网络，其实它本身就是所有层的一个基类。

```python
class LinearNet(nn.Module):
    def __init__(self, n_feature):
        super(LinearNet, self).__init__()
        self.linear = nn.Linear(n_feature, 1)
    # forward 定义前向传播
    def forward(self, x):
        y = self.linear(x)
        return y

net = LinearNet(num_inputs)
print(net) # 使用print可以打印出网络的结构
```

`forward()` 定义了模型的前向传播计算方式。

其实 `PyTorch` 还有更加简便的网络搭建方法，如 `nn.Sequential`, 这里不再赘述。

```python
net = nn.Sequential(
    nn.Linear(num_inputs, 1)
    # 此处还可以传入其他层
    )
```

</br>

**初始化模型参数**

`PyTorch` 在 `init` 模块中提供了很多参数初始化的方法，这里可以通过 `init.normal_` 将权重参数每个元素初始化为随机采样于均值为0、标准差为0.01的正态分布，偏差会初始化为零。

```python
from torch.nn import init

init.normal_(net[0].weight, mean=0, std=0.01)
init.constant_(net[0].bias, val=0)  # 也可以直接修改bias的data: net[0].bias.data.fill_(0)
```

</br>

**定义损失函数**

```python
loss = nn.MSELoss()
```

</br>

**定义优化算法**

`torch.optim`模块提供了很多常用的优化算法比如SGD、Adam和RMSProp等，所以不用再自己实现小批量梯度下降算法了。

```python
import torch.optim as optim

optimizer = optim.SGD(net.parameters(), lr=0.03)
print(optimizer)
```

输出：

```python
SGD (
Parameter Group 0
    dampening: 0
    lr: 0.03
    momentum: 0
    nesterov: False
    weight_decay: 0
)
```

</br>

**训练模型**

```python
num_epochs = 3
for epoch in range(1, num_epochs + 1):
    for X, y in data_iter:
        output = net(X)
        l = loss(output, y.view(-1, 1))
        optimizer.zero_grad() # 梯度清零，等价于net.zero_grad()
        l.backward()
        optimizer.step()
    print('epoch %d, loss: %f' % (epoch, l.item()))
```

</br>

以上就是关于简单线性模型的实现，包括所有代码的手工实现以及使用 `PyTorch` 提供的模块的实现。内容基本上都是根据《动手学深度学习》（PyTorch版）来编写的，代码也是。需要注意的是，应该尽可能采用矢量计算，以提升计算效率。`torch.utils.data`模块提供了有关数据处理的工具，`torch.nn`模块定义了大量神经网络的层，`torch.nn.init`模块定义了各种初始化方法，`torch.optim`模块提供了很多常用的优化算法。

</br>

### 参考

[《动手学深度学习》(PyTorch)](https://tangshusen.me/Dive-into-DL-PyTorch/#/chapter03_DL-basics/3.1_linear-regression)









