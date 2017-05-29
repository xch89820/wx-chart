# wx-chart
[![NPM version][npm-version-image]][npm-url]
[![MIT License][license-image]][license-url]

跨平台微信小程序图形库

## 介绍
wx-chart是一个跨平台的图形库，可在普通站点以及微信小程序中使用。

### 特点
* 跨平台：可以使用在AMD,CMD,微信小程序,React等环境中使用
* 封装性：基于自有开发的Canvas兼容层，支持W3C的Canvas标准。
* 自动化：图形绘画参数简单，颜色填充和布局分发可以自动化
* 扩展性：组件化设计，支持图形扩展（接口待开放）

当前持续更新中，有任何问题欢迎在 [Issues](https://github.com/xch89820/wx-chart/issues) 中讨论。

### 支持图表
* 线状图
  单维度/多维度曲线图(Line)，单维度/多维度区域曲线图(Area Line)
* 饼状图
  单维度饼状图(Pie)，单维度多纳圈图(Doughnut)
* 柱状图
  单维度/多维度柱状图(Bar)，多维度堆叠柱状图(Stacked Bar)

##### 待计划支持图表
* 泡状图
* 雷达图

## 实际效果以及Demo
![pie](https://cloud.githubusercontent.com/assets/4920540/26517971/893602c2-42d7-11e7-9009-3cdfebf16f63.JPG)
![bar](https://cloud.githubusercontent.com/assets/4920540/26517970/8933f522-42d7-11e7-8e78-a93c567f3bc0.JPG)
![stacked](https://cloud.githubusercontent.com/assets/4920540/26517972/8937459c-42d7-11e7-9fe9-eaf8acc2e852.JPG)
![line](https://cloud.githubusercontent.com/assets/4920540/26517973/89460140-42d7-11e7-8576-e1503e7cf4df.JPG)
![doughnut](https://cloud.githubusercontent.com/assets/4920540/26517974/894c57a2-42d7-11e7-9856-a300fa72a2c8.JPG)

微信小程序实例，请参见：
https://github.com/xch89820/wx-chart-demo

## 文档
https://www.gitbook.com/book/xch89820/wx-chart/details

## License

wx-chart 遵循 [MIT license](http://opensource.org/licenses/MIT)

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: http://opensource.org/licenses/MIT

[npm-url]: https://www.npmjs.com/package/wx-chart
[npm-version-image]: http://img.shields.io/npm/v/wx-chart.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/wx-chart.svg?style=flat
