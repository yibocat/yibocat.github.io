---
title: "[建站日记] 动态打字特效"
date: 2022-02-19T00:32:35+08:00
author: "yibo"
description: ""
draft: false
math: true
tags: ["Hugo","javascript","插件"]
categories: ["建站日记"]
---

在网站上有一个动态打字特效当然是一件很酷的事啊。无意之间找到了一个动态打字特效插件 [Typed-js](https://mattboldt.com/demos/typed-js/)。该插件还实现了各种自定义满足不同的需求。可以说是非常非常好用了，而且安装使用也是非常的简单。

该插件的作者是 Matt Boldt，这是他的主页：[https://mattboldt.com/](https://mattboldt.com/)。

Typed-js 的 Github：[https://github.com/mattboldt/typed.js/](https://github.com/mattboldt/typed.js/)。

该插件的自定义 Demo 如下：[http://mattboldt.github.io/typed.js/](http://mattboldt.github.io/typed.js/)。

下面我们大概讲一下该插件的使用方法。

</br>

### 安装方法

官方提供了三种安装方法：

```shell
npm install typed.js
yarn add typed.js
bower install typed.js
```

或者使用 `script` CDN 导入

```html
<script src="https://cdn.jsdelivr.net/npm/typed.js@2.0.12"></script>
```

</br>

### 使用

从官方给出的例子来看

This is really all you need to get going.

```js
// Can also be included with a regular script tag
import Typed from 'typed.js';

var options = {
  strings: ['<i>First</i> sentence.', '&amp; a second sentence.'],
  typeSpeed: 40
};

var typed = new Typed('.element', options);
```

上面这个例子展示了基本的使用方法。我们再来看一个更具体的例子

<script>
  var typed = new Typed('#typed', {
    stringsElement: '#typed-strings'
  });
</script>

```html
<script src="https://cdn.jsdelivr.net/npm/typed.js@2.0.12"></script>
<script>
  var typed = new Typed('#typed', {
    stringsElement: '#typed-strings'
  });
</script>

<div id="typed-strings">
  <p>Typed.js is a <strong>JavaScript</strong> library.</p>
  <p>It <em>types</em> out sentences.</p>
</div>
<span id="typed"></span>
```

`stringElement` 为定义的外部动态打字文字，这里也可以直接使用 `strings:[]` 来替代。 `typed-strings` 表示要插入动态打字特效的模块。一般的自定义则在 `new Typed()` 中设置。

</br>

### 样式设置

`css` 动画是基于 `javascript` 初始化构建的，所以可以在 `css` 中设置各种样式

```css
/* 光标 */
.typed-cursor {
}

/* 如果设置了淡出选项 */
.typed-fade-out {
}
```

</br>

### 自定义

```js
var typed = new Typed('.element', {
  /**
   * @property {array} strings 要输入的字符
   * @property {string} stringsElement 包含字符串 children 的元素的 ID 
   */
  strings: [
    'These are the default values...',
    'You know what you should do?',
    'Use your own!',
    'Have a great day!'
  ],
  stringsElement: null,

  /**
   * @property {number} typeSpeed 类型速度，单位：毫秒
   */
  typeSpeed: 0,

  /**
   * @property {number} startDelay 输入开始前的时间，单位：毫秒
   */
  startDelay: 0,

  /**
   * @property {number} backSpeed 退格速度，单位：毫秒
   */
  backSpeed: 0,

  /**
   * @property {boolean} smartBackspace 只退格与前一个字符串不匹配的内容
   */
  smartBackspace: true,

  /**
   * @property {boolean} shuffle 随机播放字符串
   */
  shuffle: false,

  /**
   * @property {number} backDelay 退格前的延迟时间，单位：毫秒
   */
  backDelay: 700,

  /**
   * @property {boolean} fadeOut 用淡出替代退格
   * @property {string} fadeOutClass 淡出动画
   * @property {boolean} fadeOutDelay 淡出延迟，单位：毫秒
   */
  fadeOut: false,
  fadeOutClass: 'typed-fade-out',
  fadeOutDelay: 500,

  /**
   * @property {boolean} loop 进行循环播放
   * @property {number} loopCount 循环播放次数
   */
  loop: false,
  loopCount: Infinity,

  /**
   * @property {boolean} showCursor 显示光标
   * @property {string} cursorChar 光标字符串，一般为'|'，我个人比较喜欢设置为背景定宽
   * @property {boolean} autoInsertCss 插入 CSS 光标并淡出到 HTML <head> 
   */
  showCursor: true,
  cursorChar: '|',
  autoInsertCss: true,

  /**
   * @property {string} attr 输出的字符串属性
   * Ex: input placeholder, value, or just HTML text
   */
  attr: null,

  /**
   * @property {boolean} bindInputFocusEvents 如果 el 是文本输入的话则绑定到焦点和模糊
   */
  bindInputFocusEvents: false,

  /**
   * @property {string} contentType 内容类型为 html 或者 null
   */
  contentType: 'html',

  /**
   * 开始输入之前执行
   * @param {Typed} self
   */
  onBegin: (self) => {},

  /**
   * 所有输入完成执行
   * @param {Typed} self
   */
  onComplete: (self) => {},

  /**
   * 每个字符串输入之前执行
   * @param {number} arrayPos
   * @param {Typed} self
   */
  preStringTyped: (arrayPos, self) => {},

  /**
   * 每个字符串输入之后执行
   * @param {number} arrayPos
   * @param {Typed} self
   */
  onStringTyped: (arrayPos, self) => {},

  /**
   * 循环过程中输入最后一个字符串后执行
   * @param {Typed} self
   */
  onLastStringBackspaced: (self) => {},

  /**
   * 输入停止执行
   * @param {number} arrayPos
   * @param {Typed} self
   */
  onTypingPaused: (arrayPos, self) => {},

  /**
   * Typing has been started after being stopped
   * @param {number} arrayPos
   * @param {Typed} self
   */
  onTypingResumed: (arrayPos, self) => {},

  /**
   * 重置之后执行
   * @param {Typed} self
   */
  onReset: (self) => {},

  /**
   * 停止之后执行
   * @param {number} arrayPos
   * @param {Typed} self
   */
  onStop: (arrayPos, self) => {},

  /**
   * 开始之后执行
   * @param {number} arrayPos
   * @param {Typed} self
   */
  onStart: (arrayPos, self) => {},

  /**
   * 销毁之后
   * @param {Typed} self
   */
  onDestroy: (self) => {}
});
```

</br>

### 举例

[http://mattboldt.github.io/typed.js/](http://mattboldt.github.io/typed.js/)

</br>











































