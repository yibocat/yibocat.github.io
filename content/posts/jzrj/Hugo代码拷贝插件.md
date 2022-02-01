---
title: "[建站日记] Hugo代码拷贝插件"
date: 2022-01-30T17:26:21+08:00
author: "yibo"
description: ""
draft: false
math: true
tags: ["Hugo","copy","javascript","插件","拷贝","复制"]
categories: ["建站日记"]
---

博客是建好了，但是总是想添加一个代码一键复制的功能。一开始是想去 html 标签中直接添加一个 `button` ，但是发现好像并没有那么简单。查阅了 Hugo 的内置功能也没有发现，很幸运找到了一篇博客 [黄忠德的博客](https://huangzhongde.cn/)，正好解决了我的需求。所以也记录一下。

<!--more-->

### 思考

我们知道，代码片段是使用 markdown code fences 来编写的

````
``` jsx
import React from 'react';
```
````

以上代码在 Hugo 编译下的 Html 将展示成如下形式

```html
<div class="highlight">
  <pre style="background-color:#f0f0f0;tab-size:4">
  	<code class="language-jsx" data-lang="jsx">
  		<span style="color:#007020;font-weight:bold">import</span> React from <span style="color:#4070a0">'react'</span>;
  	</code>
  </pre>
</div>
```

我们要解决的问题是：

1. **搜索所有突出显示的代码块，特别是所有具有类 `highlight` 的元素；**
2. **如何创建按钮放在代码框中；**
3. **给按钮添加一个事件，用于将代码块中的代码复制到剪贴板。**

### 代码

#### 检查复制支持

进行复制之前，我们首先需要对浏览器是否可以使用 `document.execCommand('copy')` 这个功能，因为这段代码正是我们要使用的复制调用代码，我们需要一个命令来检查一下

```js
if(!document.queryCommandSupported('copy')) {
  return;
}
```

但是 `queryCommandSupported` 方法似乎已经弃用，所以其实是不用添加的。

<img src="/images/jzrj/jzrj-20220129-20.png" alt="jzrj-20220129-20" style="zoom:50%;" />

#### 选择突出显示的代码块

上文提到，突出显示的代码块是包含在类 `highlight` 中的，我们可以使用内置的 DOM API 来检查所有的在 `highlight` 内容

```js
var highlightBlocks = document.getElementsByClassName('highlight');
```

#### 添加按钮

由于 Hugo 的自动编译使得我们无法直接在 html 中添加按钮，这也是我一开始的疑问之处。但是可以使用 js 创建一个特定的函数来实现这个功能。然后在 `for` 循环中调用这个函数

```js
function addCopyButton(containerEl) {
  var copyBtn = document.createElement("button");
  copyBtn.className = "highlight-copy-btn";
  copyBtn.textContent = "Copy";

  containerEl.appendChild(copyBtn);
}
for (var i = 0; i < highlightBlocks.length; i++) {
  addCopyButton(highlightBlocks[i]);
}
```

#### 复制响应

点击按钮，使用 `document.execCommand()` 方法将代码复制到剪贴板，同时还要保持代码的格式。所以创建一个函数，用来选择给定的 html 中的所有文本

```js
function selectText(node) {
  var selection = window.getSelection();
  var range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}
```

因为代码节点是在 ` <pre>` 所以使用 `.firstElementChild` 来获取节点，选择文本后添加到剪贴板，然后删除所有选择

```js
var codeEl = containerEl.firstElementChild;
copyBtn.addEventListener('click', function() {
  var selection = selectText(codeEl);
  document.execCommand('copy');
  selection.removeAllRanges();
});
```

#### 添加样式

这部分是比较简单的，直接放代码了，之后可以自己调试代码按钮样式

```css
.highlight {
    position: relative;
}
.highlight pre {
    padding-right: 75px;
}
.highlight-copy-btn {
    position: absolute;
    top: 7px;
    right: 7px;
    border: 0;
    border-radius: 4px;
    padding: 1px;
    font-size: 0.7em;
    line-height: 1.8;
    color: #fff;
    background-color: #777;
    min-width: 55px;
    text-align: center;
}
.highlight-copy-btn:hover {
    background-color: #666;
}
```

我们可以看到在代码框的右上方添加了一个灰色的按钮。

#### 已复制响应

所有功能其实都已经完成了，为了更好的用户体验，在点击按钮后需要有一个已复制的响应返回。

```js
function flashCopyMessage(el, msg) {
  el.textContent = msg;
  setTimeout(function() {
    el.textContent = "Copy";
  }, 1000);
}

try {
  var selection = selectText(codeEl);
  document.execCommand('copy');
  selection.removeAllRanges();

  flashCopyMessage(copyBtn, 'Copied!')
} catch(e) {
  console && console.log(e);
  flashCopyMessage(copyBtn, 'Failed :\'(')
}
```

### 所有代码

`copy-to-clipboard.css` :

```css
.highlight {
    position: relative;
}
.highlight pre {
    padding-right: 75px;
}
.highlight-copy-btn {
    position: absolute;
    top: 7px;
    right: 7px;
    border: 0;
    border-radius: 4px;
    padding: 1px;
    font-size: 0.7em;
    line-height: 1.8;
    color: #fff;
    background-color: #777;
    min-width: 55px;
    text-align: center;
}
.highlight-copy-btn:hover {
    background-color: #666;
}
```

`copy-to-clipboard.js` :

```js
(function() {
  'use strict';

  if(!document.queryCommandSupported('copy')) {
    return;
  }

  function flashCopyMessage(el, msg) {
    el.textContent = msg;
    setTimeout(function() {
      el.textContent = "Copy";
    }, 1000);
  }

  function selectText(node) {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
    return selection;
  }

  function addCopyButton(containerEl) {
    var copyBtn = document.createElement("button");
    copyBtn.className = "highlight-copy-btn";
    copyBtn.textContent = "Copy";

    var codeEl = containerEl.firstElementChild;
    copyBtn.addEventListener('click', function() {
      try {
        var selection = selectText(codeEl);
        document.execCommand('copy');
        selection.removeAllRanges();

        flashCopyMessage(copyBtn, 'Copied!')
      } catch(e) {
        console && console.log(e);
        flashCopyMessage(copyBtn, 'Failed :\'(')
      }
    });

    containerEl.appendChild(copyBtn);
  }

  // Add copy button to code blocks
  var highlightBlocks = document.getElementsByClassName('highlight');
  Array.prototype.forEach.call(highlightBlocks, addCopyButton);
})();
```

将这两个文件分别放在 `assets/css` 和 `assets/js` 下，然后在配置文件 `config.toml` 中修改自定义 css 和 js，或者手动添加到 `head.html` 头文件中。

```toml
custom_css = ["css/copy-to-clipboard.css"]
custom_js = ["js/copy-to-clipboard.js"]
```

### 参考

1. https://huangzhongde.cn/post/2020-02-21-hugo-code-copy-to-clipboard/
2. https://www.tomspencer.dev/blog/2018/09/14/adding-click-to-copy-buttons-to-a-hugo-powered-blog/
