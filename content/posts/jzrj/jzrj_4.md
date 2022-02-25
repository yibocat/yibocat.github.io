---
title: "[建站日记] Hugo 添加文章日期热力图"
date: 2022-02-25T20:11:23+08:00
author: "yibo"
description: ""
draft: false
math: false
tags: ["热力图","javascript","ECharts","AntV","Github"]
categories: ["建站日记"]
---

每次看到 Github 上的代码贡献图时，总想自己搞一个。但是直接搞似乎很麻烦，于是上网一搜，嘿，有两个开源图表库正好满足我的需求，果断开搞。

这两个图图表库如下：

蚂蚁数据可视化 AntV [https://antv-2018.alipay.com/zh-cn/index.html](https://antv-2018.alipay.com/zh-cn/index.html)

Apache ECharts [https://echarts.apache.org/zh/index.html](https://echarts.apache.org/zh/index.html)

这两个都是非常好的图表库，而我使用的 ECharts（只是因为第一个找到的是 ECharts）。不过有一些功能还是没能实现，有机会尝试用 AntV 再实现一下。

改造后最后的效果图如下

<p style="text-align:center"><img src="/images/jzrj/jzrj-20220225-01.png" style="width:80%" /></p>

</br>

### 获取

ECharts 官方给的安装方式有三种： Github 获取、npm 安装和 CDN 获取，官方建议使用 npm 安装，这里直接使用 CDN 获取：

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5.3.0/dist/echarts.min.js"></script>
```

而下载网址是在 [https://www.jsdelivr.com/package/npm/echarts](https://www.jsdelivr.com/package/npm/echarts)。

npm 下载如下：

```shell
npm install echarts --save
```

另外，官网还提供在线构建，具体可以前往 [https://echarts.apache.org/zh/builder.html](https://echarts.apache.org/zh/builder.html)。

</br>

### 配置文章数据

首先配置生成热力图的模块

```html
<div id="heatmap"></div>
```

然后编写 javascript 脚本。

初始化图标并绑定到热力图模块，并设定图表响应容器的大小变化

```javascript
var myChart = echarts.init(document.getElementById('heatmap'));
window.onresize = function() {
    myChart.resize();
};
```

</br>

### 生成文章数据

生成热力图的 option 结构在 [https://echarts.apache.org/zh/option.html#calendar](https://echarts.apache.org/zh/option.html#calendar)。这里我们主要要解决的是两个问题：

> 1.如何将日历的日期设置为去年今日到今日日期区间
>
> 2.将文章的日期和字数传入 ECharts

日历时间在 `series` 的 `data` 中设置，支持 `data([day,number])` 的列表形式，我们的目的则是将所有发布的文章的数字作统计，然后传入列表 `data` 中。

好消息是 Hugo 支持在 `html` 中写入代码，随后 Hugo 会自动对其进行编码。接着上面代码

```js
var data = [];
{{ range.Site.RegularPages }}
data.push(
    [
        {{ .PublishDate.Format "2006-01-02" }},
        {{ .WordCount }},
    ],
);
{{- end -}}
```

这里我们将所有发布文章的数据保存在了 `data` 中（注意：该段代码需要写在 html 中，若单独编写 js 文件，最后并不会奏效，因为 Hugo 并不会去编译 js 文件）。

</br>

### 设置日期时间

官方给出的日期设置时间非常简单，从当前一年的一月一日开始，随机生成 365 个数据。而 javascript 中有一段代码可以获取当前时间和当前时间前推任意时间

```js
var sdtime2=new Date().setHours(sdtime1.getHours() -1)//小时
var sdtime3=new Date().setDate((new Date().getDate()-7))//7天
var sdtime4=new Date().setMonth((new Date().getMonth()-1))//一个月
var sdtime5=new Date().setFullYear((new Date().getFullYear()-1))//一年
console.log(new Date(sdtime2).Format("yyyy-MM-dd HH:mm:ss"));
```

我们可以下一个函数，生成当前时间推至前若干个月的日历区间

```js
function heatmap_width(months){             // 计算转换日期
    var startDate = new Date();
    var mill = startDate.setMonth((startDate.getMonth() - months));
    var endDate = +new Date();
    startDate = +new Date(mill);

    endDate = echarts.format.formatTime('yyyy-MM-dd', endDate);
    startDate = echarts.format.formatTime('yyyy-MM-dd', startDate);

    var showmonth = [];
    showmonth.push([
        startDate,
        endDate
    ]);
    return showmonth
};
```

该函数返回一个 `[startDate,endDate]` 数据，表示日历的开始日期和结束日期。

</br>

### 图表配置

上文已经提到过，日历的配置在 [https://echarts.apache.org/zh/option.html#calendar](https://echarts.apache.org/zh/option.html#calendar) 有非常详细的说明，我们可以直接使用官网样例给出的配置

```js
option = {
    title: {
        top: 30,
        left: 'center',
        text: '数数敲了几个字？'
    },
    tooltip: {},
    visualMap: {
        min: 0,
        max: 5000,
        type: 'piecewise',
        orient: 'horizontal',
        left: 'center',
        top: 65
    },
    calendar: {
        top: 120,
        left: 30,
        right: 30,
        cellSize: ['auto', 12],
        range: heatmap_width(12),				// 设置转换的日历日期区间
        itemStyle: {
            borderWidth: 0.5
        },
        yearLabel: { show: false }
    },
    series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data								// 加载文章数据
    }
};
myChart.setOption(option);
```

大功告成！日历贡献图就完成了！所有代码 [https://shared.snipper.app/snippet/D67FD48F-2089-4A13-9A2B-37E6B48D3F06](https://shared.snipper.app/snippet/D67FD48F-2089-4A13-9A2B-37E6B48D3F06) 或者下面的未设置 hugo 获取文章数据的代码，转而使用随机数据

```html
<div id="ttt" style="
  width: 600px;
  height: 300px;
  margin-top: 15px;
  margin-bottom: 10px;
  padding: 2px;
  border: 1px solid;
  border-radius: 10px;
  border-width: 0.5px;
  text-align: center;"
></div>
<script src="https://cdn.jsdelivr.net/npm/echarts@5.3.0/dist/echarts.min.js"></script>
<script type="text/javascript">
    var chartDom = document.getElementById('ttt');
    var myChart = echarts.init(chartDom);
    var option;

    // 计算日期并转换格式
    var startDate = new Date();
    var year_Mill = startDate.setFullYear((startDate.getFullYear() - 1));
    var startDate = +new Date(year_Mill);
    var endDate = +new Date();

    var dayTime = 3600 * 24 * 1000;
    var data = [];
    for (var time = startDate; time < endDate; time += dayTime) {
        data.push([
          echarts.format.formatTime('yyyy-MM-dd',time),
          Math.floor(Math.random() * 10000)
        ]);
      }
    startDate = echarts.format.formatTime('yyyy-MM-dd', startDate);
    endDate = echarts.format.formatTime('yyyy-MM-dd', endDate);
    var rangeArr = [startDate,endDate];

option = {
  title: {
    top: 30,
    left: 'center',
    text: 'Daily Step Count'
  },
  tooltip: {},
  visualMap: {
    min: 0,
    max: 10000,
    type: 'piecewise',
    orient: 'horizontal',
    left: 'center',
    top: 65
  },
  calendar: {
    top: 120,
    left: 30,
    right: 30,
    cellSize: ['auto', 13],
    range: rangeArr,
    itemStyle: {
      borderWidth: 0.5
    },
    yearLabel: { show: false }
  },
  series: {
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: data
  }
};

option && myChart.setOption(option);
</script>
```

</br>

但是，但是！等等...这样配置的热力图似乎并不完美，在不同屏幕宽度下的展示效果会非常差，所以要设置一下适配屏幕宽度的热力图。

</br>

### 优化

我们分别设置在不同屏幕宽度下要显示的日期区间，将如下代码放至 `heatmap_width` 函数下面，`option` 上面(javascript 并不是特别拿手，只能使用最笨的方法了😥)

```js
if(window.matchMedia('(max-width: 320px)').matches){
    var rangeArr = heatmap_width(3);
}else if(window.matchMedia('(max-width: 400px)').matches){
    var rangeArr = heatmap_width(5);
}else if(window.matchMedia('(max-width: 550px)').matches){
    var rangeArr = heatmap_width(6);
}else if(window.matchMedia('(max-width: 1021px)').matches){
    var rangeArr = heatmap_width(12);
}else if(window.matchMedia('(max-width: 1400px)').matches){
    var rangeArr = heatmap_width(9);
}else if(window.matchMedia('(max-width: 1920px)').matches){
    var rangeArr = heatmap_width(12);
}else if(window.matchMedia('(max-width: 2560px)').matches){
    var rangeArr = heatmap_width(24);
}
```

</br>

### 暗模式

该图表其实本身自带暗模式，但是为了和本网站相匹配，所以决定自己动手实现暗模式。

为此我分别写了两个函数

```js
function LightOption()
function DarkOption()
```

将 `option` 配置分别放入两个函数中，再单独进行颜色配置

然后使用 `(window.matchMedia('(prefers-color-scheme: dark)').matches)` 获取当前系统的暗模式方法

```js
if(window.matchMedia('(prefers-color-scheme: dark)').matches){          // 暗模式
    DarkOption()
}
else{                                                                   // 亮模式
    LightOption()
}
```

</br>

**加入屏幕监听功能**

当我们切换明暗模式时，以上代码对于网站并不会直接生效，需要刷新一遍才可以生效。所以加入监听功能使得网站一旦切换明暗模式则理科生效

```js
var listeners={                                                         // 模式监听
    dark:(mediaQueryList )=>{                                           // 暗模式
      if(mediaQueryList.matches){
        DarkOption()
      }
    },
    light:(mediaQueryList)=>{                                           // 亮模式
      if(mediaQueryList.matches){
        LightOption()
      }
    },
  }
window.matchMedia('(prefers-color-scheme: dark)').addListener(listeners.dark)
window.matchMedia('(prefers-color-scheme: light)').addListener(listeners.light)
```

</br>

至此，总算完成了。

</br>

### 总结

ECharts 功能很强大，但是却并不能生成如同 Github 代码贡献图的样子，对于每一天的小方块不能设置更好的样式。不知道 AntV 行不行。总之，以后有时间再研究研究。





