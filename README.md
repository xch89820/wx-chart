# wx-chart  [![NPM version][npm-version-image]][npm-url]   [![MIT License][license-image]][license-url]    [![NPM downloads][npm-downloads-image]][npm-url]

wx-chart是一个跨平台的图形库，可在普通站点，React环境以及微信小程序中部署

### 特点
* 跨平台：可以使用在AMD,CMD,微信小程序,React等环境中使用
* 封装性：基于自有开发的Canvas兼容层，支持W3C的Canvas标准。
* 自动化：图形绘画参数简单，颜色填充和布局分发可以自动化
* 扩展性：组件化设计，支持图形扩展（接口待开放）

当前持续更新中，有任何问题欢迎在 [Issues](https://github.com/xch89820/wx-chart/issues) 中讨论。

### 支持图表
* 线状图
  单维度/多维度曲线图(Line)，单维度/多维度区域曲线图(Area Line)，栈式线形图(Stacked Line)
* 饼状图
  单维度饼状图(Pie)，单维度多纳圈图(Doughnut)
* 柱状图
  单维度/多维度柱状图(Bar)，多维度堆叠柱状图(Stacked Bar)

##### 近期计划支持图表
- [x] 增加动画效果
- [x] Canvas中间层优化
- [x] 增加bar，line点展示
- [ ] 增加Tooltip
- [ ] 雷达图
- [ ] 泡状图
- [ ] 支持Vue
- [ ] 支持React Native

## 实际效果以及Demo
#### PC场景下
![all](https://user-images.githubusercontent.com/4920540/31314620-66222d5a-ac37-11e7-836f-82b346bae3c2.gif)

#### 微信场景下

<img src="https://user-images.githubusercontent.com/4920540/31314633-8c5d9b76-ac37-11e7-8be6-95ef3113c143.gif" width="500">
<img src="https://user-images.githubusercontent.com/4920540/31167947-56dc348a-a926-11e7-959a-bb9aed012ccc.gif" width="500">
<img src="https://user-images.githubusercontent.com/4920540/31167946-56d7f41a-a926-11e7-9918-d30666ce0874.gif" width="500">
<img src="https://user-images.githubusercontent.com/4920540/31167948-56dd334e-a926-11e7-962b-1d68e4d08ff3.gif" width="500">


## 快速使用

### 安装
使用npm下载： `npm install wx-chart --save-dev`

使用bower下载：`bower install wx-chart`

### 声明节点

```html
<canvas id="myCanvas" style="width:600px; height:400px; border: 1px solid #ffffff;"></canvas>
```

### 引用库 & 使用

```js
import { WxLiner } from 'wx-chart';

// 实例化一个线状图
var wxLiner = new .WxLiner('myCanvas', { //myCanvas 为节点的ID值
  width: 600,
  height: 400,
  title: '销售量',
  legends: [{
	text: '巧克力'
  }]
});

// 更新数据
wxLiner.update([{
  value: 10,
  label: '一月'
}, {
  value: 40,
  label: '二月'
}, {
  value: 35,
  label: '三月'
}, {
  value: 56,
  label: '四月'
}, {
  value: 71,
  label: '五月'
}]);
```

搞定，一个简单的线图诞生了。可以看到在我们引用wx-chart后，全局变量 `WxChart` 中就包含的我们所需的图形库类。在进行初始化后，使用 `update` 方法便可以更新我们的数据部分，从而触发图形渲染。

如果你想查看更详细的使用，请参见文档链接

### 微信小程序

当前微信小程序不支持从npm等包管理器下载js库，因此你需要手动拷贝 `dist/wx-chart.min.js` 到你的程序工程中，而后手动引用。

微信小程序中，首先在 view 声明一个Canvas节点,请注意需要声明 canvas-id
```
<view class="container">
   <canvas canvas-id="myCanvas" style="width:600px; height:400px; border: 1px solid #ffffff;"></canvas>
</view>
```

而后将wx-chart的工程文件加入小程序工程，并引用
```
let WxChart = require("you/path/wx-chart.min.js");

// 初始化
let options = {...};
let myChart = new WxChart.WxLiner('myCanvas', options);
```

完整的例子请见：
https://github.com/xch89820/wx-chart-demo

### React环境

请参见wx-chart react插件：
https://github.com/xch89820/wx-chart-react

## 文档
https://www.kancloud.cn/xchhhh/wx-chart

## ChangeLog
v0.3.3
增加bar，line点展示

v0.3.2
增加动画效果

v0.3.1
更新ReadME

v0.3
更新文档到看云：https://www.kancloud.cn/xchhhh/wx-chart

v0.2.2
[react插件](https://github.com/xch89820/wx-chart-react) 独立工程，解除主工程的依赖
增加栈式线形图
修复若干BUG

## License

wx-chart 遵循 [MIT license](http://opensource.org/licenses/MIT)

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: http://opensource.org/licenses/MIT

[npm-url]: https://www.npmjs.com/package/wx-chart
[npm-version-image]: http://img.shields.io/npm/v/wx-chart.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/wx-chart.svg?style=flat
