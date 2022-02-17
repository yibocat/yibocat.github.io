---
title: "[深度学习笔记] 深度学习第 5 篇——正向传播与反向传播"
date: 2022-02-17T21:48:32+08:00
author: "yibo"
description: ""
draft: false
math: true
tags: ["深度学习","神经网络","反向传播"]
categories: ["烂笔头之深度学习"]
---

什么是正向传播？正向传播是按照神经网络的输入到输出的顺序，依次计算从模型中间变量的过程。而反向传播则是计算神经网络的参数梯度的过程。在训练神经网络时，正向传播与反向传播是相互依赖的。正向传播依次计算模型中间变量，反向传播再根据变量对参数进行梯度求导。所以可以这么理解，在参数进行初始化之后对模型进行交替的正向传播与反向传播，并根据反向传播计算的梯度迭代模型参数。

</br>

### 正向传播

前几篇文章讲的基本上都是正向传播，这里我们简单地再推导一下。

假设输入为 $x\in \mathbb{R}^d$ ，不考虑偏差，中间变量为 $z\in\mathbb{R}^h$，$\pmb{W}^{(1)}\in\mathbb{R}^{h\times d}$ 为隐藏层的权重参数。设 $\phi()$ 为激活函数，则有 
$$
z=\pmb{W}^{(1)}x,\newline
\pmb{h} = \phi(z)
$$
这里 $\pmb{h}$ 表示得到的隐藏层变量，也就是中间变量。

假设输出层参数为 $\pmb{W}^{(2)}\in\mathbb{R}^{q\times h}$ ，则得到的向量长度为 $q$ 的输出层变量为
$$
\pmb{o}=\pmb{W}^{(2)}\pmb{h}
$$
我们假设损失函数为 $\ell$ ，样本标签为 $y$ ，则样本损失项为
$$
L=\ell(\pmb{o},y)
$$
引入正则化项 $s$ 
$$
s=\frac{\lambda}{2}(\vert\vert\pmb{W}^{(1)}\vert\vert^2_F+\vert\vert\pmb{W}^{(2)}\vert\vert^2_F)
$$
得到模型在给定样本上的损失为 $J = L+s$ ，我们称 $J$ 为给定样本的**目标函数**。



</br>

### 反向传播

我们说反向传播是计算神经网络参数梯度的方法，其基本原理是微积分中的链式法则。

</br>

**链式法则**

假设 $y=g(x)，z=f(y)$，则 $z=h(x)=f(g(x))$ 。对这两个函数分别求导有
$$
\frac{dy}{dx}=g'(x) \newline
\frac{dz}{dy}=f'(y)
$$
根据链式法则，有
$$
h'(x)=\frac{dz}{dx}=\frac{dz}{dy}\cdot\frac{dy}{dx}
$$
即复合函数求导使用**乘法法则**，或称为**链式法则**。在反向传播中我们可以完美地使用这个法则。

</br>

**反向传播**

我们将链式法则应用到反向传播中。在上文中，我们的模型参数为 $\pmb{W}^{(1)}$ 和 $\pmb{W}^{(2)}$ ，因此反向传播所要作的计算是 $\frac{\partial J}{\partial\pmb{W}^{(1)}}$ 和 $\frac{\partial J}{\partial\pmb{W}^{(2)}}$，反向传播的计算次序与正向传播计算次序恰恰相反。我们求目标函数关于 $L$ 和 $s$ 的梯度，有
$$
\frac{\partial J}{\partial L}=1,\quad \frac{\partial J}{\partial s}=1
$$
然后根据链式法则计算目标函数对于输出层变量的梯度
$$
\frac{\partial J}{\partial o}=\frac{\partial J}{\partial L}\cdot\frac{\partial L}{\partial o}=\frac{\partial L}{\partial o}
$$
接着计算正则化项对于两个参数的梯度
$$
\frac{\partial s}{\partial\pmb{W}^{(1)}}=\lambda\pmb{W}^{(1)},\quad 
\frac{\partial s}{\partial\pmb{W}^{(2)}}=\lambda\pmb{W}^{(2)}
$$
然后先计算靠近输出层参数的梯度 $\frac{\partial J}{\partial\pmb{W}^{(2)}}\in\mathbb{R}^{q\times h}$
$$
\begin{aligned}
\frac{\partial J}{\partial\pmb{W}^{(2)}} & = \frac{\partial J}{\partial o}\centerdot\frac{\partial o}{\partial\pmb{W}^{(2)}}+\frac{\partial J}{\partial s}\centerdot\frac{\partial s}{\partial \pmb{W}^{(2)}} \newline
& = \frac{\partial J}{\partial o}\pmb{h}^{\top}+\lambda\pmb{W}^{(2)}
\end{aligned}
$$
然后继续沿着输出层向隐藏层反向传播，隐藏层变量的梯度为
$$
\frac{\partial J}{\partial \pmb{h}} = \frac{\partial J}{\partial o}\centerdot\frac{\partial o}{\partial\pmb{h}}={\pmb{W}^{(2)}}^{\top}\frac{\partial J}{\partial o}
$$
由于激活函数 $\phi$ 按元素运算，中间变量 $z$ 的梯度 $\frac{\partial J}{\partial z}$ 的计算需要使用**按元素乘法** ，符号位 $\odot$
$$
\frac{\partial J}{\partial z}=\frac{\partial J}{\partial \pmb{h}}\cdot\frac{\partial \pmb{h}}{\partial z}=\frac{\partial J}{\partial\pmb{h}}\odot\phi'(z)
$$
最后我们得到靠近输入层的模型参数的梯度 $\frac{\partial J}{\partial\pmb{W}^{(1)}}$
$$
\begin{aligned}
\frac{\partial J}{\partial \pmb{W}^{(1)}} &= \frac{\partial J}{\partial z}\cdot\frac{\partial z}{\partial\pmb{W}^{(1)}}+\frac{\partial J}{\partial s}\cdot\frac{\partial s}{\partial \pmb{W}^{(1)}} \newline
& = \frac{\partial J}{\partial z}x^{\top}+\lambda\pmb{W}^{(1)}
\end{aligned}
$$
</br>

### **深度学习模型训练**

看了这么些公式可能都忘记我们最初是要干什么的，我们为什么要算这么些公式？我们来回顾一下。

我们训练模型的目的是为了得到最优的参数以满足我们的模型，那么什么样的模型最优呢？可以认为是损失函数最小的模型就是最优的。那么如何降低损失函数呢，我们知道模型在给定样本上的损失函数为 $J$ ，我们要让损失函数最小化，所以通过梯度下降法迭代最接近的参数，使用梯度下降法进行迭代就要通过反向传播算法计算参数梯度。我们回忆一下带有 $L2$ 参数正则化项的参数迭代公式
$$
\omega\gets(1-\frac{\eta\lambda}{\vert \mathcal{B}\vert})\omega-\frac{\eta}{\vert \mathcal{B}\vert}\sum_{i\in\mathcal{B}}\frac{\partial \ell^{(i)}(\omega,b)}{\partial \omega}
$$
这么一看，后面的一项正是我们所推导的参数迭代公式。这就是反向传播！

</br>

一方面，正向传播的计算可能依赖于模型参数的当前值，而这些模型参数是在反向传播的梯度计算后通过优化算法迭代的。另一方面，反向传播的梯度计算可能依赖于各变量的当前值，而这些变量的当前值是通过正向传播计算得到的。

所以，模型参数初始化之后，我们交替地进行正向传播和反向传播，并根据反向传播计算的梯度迭代模型参数。而正是由于神经网络的特殊性，正向传播结束后不能立即释放变量内存，从而导致神经网络的训练往往占用很大的内存的原因。





</br>

### 参考

[Back Propagation（梯度反向传播）实例讲解 - HexUp的文章](https://zhuanlan.zhihu.com/p/40378224)

[《动手学深度学习》PyTorch 版，阿斯顿·张、李沐](https://tangshusen.me/Dive-into-DL-PyTorch/#/)

































