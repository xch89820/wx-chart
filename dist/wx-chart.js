/*!
 * wx-chart.js
 * Chart for WeiXin application
 * Version: 0.1.1
 *
 * Copyright 2016 Jone Casper
 * Released under the MIT license
 * https://github.com/xch89820/wx-chart/blob/master/LICENSE.md
 */
"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (f) {
    if ((typeof exports === "undefined" ? "undefined" : _typeof2(exports)) === "object" && typeof module !== "undefined") {
        module.exports = f();
    } else if (typeof define === "function" && define.amd) {
        define([], f);
    } else {
        var g;if (typeof window !== "undefined") {
            g = window;
        } else if (typeof global !== "undefined") {
            g = global;
        } else if (typeof self !== "undefined") {
            g = self;
        } else {
            g = this;
        }g.WxChart = f();
    }
})(function () {
    var define, module, exports;return function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
                }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
                    var n = t[o][1][e];return s(n ? n : e);
                }, l, l.exports, e, t, n, r);
            }return n[o].exports;
        }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
            s(r[o]);
        }return s;
    }({ 1: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
                return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
            } : function (obj) {
                return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
            };

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _get = function get(object, property, receiver) {
                if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
                    var parent = Object.getPrototypeOf(object);if (parent === null) {
                        return undefined;
                    } else {
                        return get(parent, property, receiver);
                    }
                } else if ("value" in desc) {
                    return desc.value;
                } else {
                    var getter = desc.get;if (getter === undefined) {
                        return undefined;
                    }return getter.call(receiver);
                }
            };

            var _wxCanvas = require('../util/wxCanvas');

            var _wxCanvas2 = _interopRequireDefault(_wxCanvas);

            var _wxChart = require('./wxChart');

            var _wxChart2 = _interopRequireDefault(_wxChart);

            var _title = require('../core/title');

            var _title2 = _interopRequireDefault(_title);

            var _scale = require('../core/scale');

            var _scale2 = _interopRequireDefault(_scale);

            var _scale3 = require('../scale/scale.liner');

            var _scale4 = _interopRequireDefault(_scale3);

            var _scale5 = require('../scale/scale.crosshelp');

            var _scale6 = _interopRequireDefault(_scale5);

            var _scale7 = require('../scale/scale.category');

            var _scale8 = _interopRequireDefault(_scale7);

            var _legend = require('../core/legend');

            var _legend2 = _interopRequireDefault(_legend);

            var _layout = require('../core/layout');

            var _layout2 = _interopRequireDefault(_layout);

            var _helper = require('../util/helper');

            var _tinycolor = require('../util/tinycolor');

            var _tinycolor2 = _interopRequireDefault(_tinycolor);

            var _randomColor = require('../util/randomColor');

            var _randomColor2 = _interopRequireDefault(_randomColor);

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            function _toConsumableArray(arr) {
                if (Array.isArray(arr)) {
                    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                        arr2[i] = arr[i];
                    }return arr2;
                } else {
                    return Array.from(arr);
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                }return call && ((typeof call === "undefined" ? "undefined" : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
            }

            function _inherits(subClass, superClass) {
                if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof2(superClass)));
                }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
            }

            // Bar legend's default config
            var WX_BAR_LEGEND_DEFAULT_CONFIG = {
                borderWidth: 1,
                fillArea: true,
                fillAlpha: 0.5,
                display: true,
                // barWidth: 'auto' //Set each bar's width. If not set, the bars are sized automatically.
                barPercentage: 0.8 // Percent (0-1) of the available width each bar should be within the data point space,like the flexible layout~
                // fillStyle
                // strokeStyle
            };
            // Bar default config
            var WX_BAR_DEFAULT_CONFIG = {
                minBetweenPixel: 5, // The minisize space between each bar.
                pointPercentage: 0.8, // Percent (0-1) of the space for each data point
                stacked: false, // If true, bars are stacked on the x-axis
                zeroLine: false,
                // barPercentage: 0.8 // If stacked is true, global "barPercentage" setting will be effective. Otherwise, legend's setting priorities.
                // Scale options
                xScaleOptions: {
                    position: 'bottom'
                },
                xScaleItemOptions: undefined,
                yScaleOptions: {
                    position: 'left'
                },
                yScaleItemOptions: undefined,
                crossScaleOptions: {
                    xMargin: function xMargin(xBox, yBox, area, xScale, yScale, xScaleDatasets) {
                        return xScale.calculateTickWidth(xScaleDatasets, xBox);
                    },
                    xFirstPointSpace: 0
                },
                // The title text or a title config object
                title: undefined,

                // The legend of line chart
                legends: [], // borderWidth, fillArea, fillAlpha can be set in here
                legendOptions: {
                    'position': 'bottom'
                },

                // The randomColor scheme
                // See https://github.com/davidmerfield/randomColor
                color: {
                    hue: 'red',
                    luminosity: 'light'
                },

                // The dataset's default key
                defaultKey: 'value'
            };

            var WX_BAR_ITEM_DEFAULT_CONFIG = {
                //borderWidth: 1,
                //fillArea: true,
                //fillAlpha: 0.5,
                //strokeStyle: '#ffffff',
                display: true
            };

            var WxBar = function (_WxChart) {
                _inherits(WxBar, _WxChart);

                /**
                * WxBar chart
                * @constructor
                * @param {string} id - The canvas element's id
                * @param {Object} config
                * @param {number} [config.width=300] - The width of canvas.
                * @param {number} [config.height=200] - The height of canvas.
                * @param {number} [config.padding=] - The padding of canvas.
                * @param {string} [config.display=block] - The display style of chart.
                *
                * @param {Object} config.legendOptions=[] - The legend & label options.You should set 'key' to bind the attribute in datasets which is the value of the point.
                * @param {(string|Object)} [config.title=] - The title text or title options of chart.
                * @example
                *datasets:[{
                *  valueA: 30,
                *  valueB: 40,
                *  label: '一月'
                * }, {
                *  valueA: 20,
                *  valueB: 50,
                *  pointRadius: 2,
                *  label: '二月'
                *},...]
                *
                * legends: [{
                *   'text': 'valueA Text',
                *   'key': 'valueA',
                *   'strokeStyle': '#3385ff',
                *   'barPercentage': 0.8
                * }, {
                *   text: 'valueB Text',
                *   key: 'valueB'
                * }]
                */
                function WxBar(id, config) {
                    _classCallCheck(this, WxBar);

                    var _this = _possibleConstructorReturn(this, (WxBar.__proto__ || Object.getPrototypeOf(WxBar)).call(this, id, config));

                    var me = _this;
                    me.chartConfig = (0, _helper.extend)({}, WX_BAR_DEFAULT_CONFIG, config);

                    me.title = null;
                    // Initialize title and legend
                    if (me.chartConfig.title) {
                        me.title = new _title2.default(me, _helper.is.PureObject(me.chartConfig.title) ? me.chartConfig.title : null);
                        me.titleText = _helper.is.String(me.chartConfig.title) ? me.chartConfig.title : me.chartConfig.title.text;
                    }

                    // Initialize legend
                    me.legend = new _legend2.default(me, me.chartConfig.legendOptions);

                    // Initialize x,y Scale
                    me.yAxis = new _scale4.default(me, me.chartConfig.yScaleOptions);
                    me.xAxis = new _scale8.default(me, me.chartConfig.xScaleOptions);
                    me.wxCrossScale = new _scale6.default(me.xAxis, me.yAxis, me.chartConfig.crossScaleOptions);
                    me.wxLayout = new _layout2.default(me);
                    return _this;
                }

                // Get/Set labels


                _createClass(WxBar, [{
                    key: '_getLegendConfig',

                    /**
                     * Build legends config
                     * @private
                     */
                    value: function _getLegendConfig() {
                        var me = this,
                            defaultKey = me.chartConfig.defaultKey || 'value',
                            legendsConfig = me.chartConfig.legends;
                        if (!legendsConfig) {
                            if (me.labels && me.labels.length) {
                                legendsConfig = me.labels.map(function (label) {
                                    return { 'text': label, 'key': defaultKey };
                                });
                            } else {
                                throw new Error('Can not get legend config!');
                            }
                        } else {
                            legendsConfig = legendsConfig.map(function (legend) {
                                return (0, _helper.extend)(true, {
                                    'key': defaultKey
                                }, legend);
                            });
                        }
                        return legendsConfig;
                    }
                    /**
                     * Update a datesets of chart and reDraw
                     * @param {Object} datasets - data sets
                     * @param {string} [datasets[].display] - Disaply the bar or not
                     * @param {string} [datasets[].borderWidth=1] - Bar's border width
                     * @param {string} [datasets[].strokeStyle] - Bar's border color
                     * @param {number} [datasets[].fillArea=true] - Fill color or not
                     * @param {number} [datasets[].fillAlpha=0.6] - Fill color Alpha
                     * @param {number} [datasets[].fillStyle] - Fill color. The default color will randomly assigned by 'color' option.
                     * @returns {*}
                     */

                }, {
                    key: 'update',
                    value: function update(datasets) {
                        var me = this;
                        me._labels = null;
                        me._legends = null;
                        _get(WxBar.prototype.__proto__ || Object.getPrototypeOf(WxBar.prototype), 'update', this).call(this, datasets, WX_BAR_ITEM_DEFAULT_CONFIG);
                        me.wxLayout.removeAllBox();
                        return me.draw();
                    }
                    /**
                     * Draw chart
                     */

                }, {
                    key: 'draw',
                    value: function draw() {
                        var box = void 0,
                            me = this,
                            ctx = me.ctx,
                            wxLayout = me.wxLayout;
                        var _me$chartConfig = me.chartConfig,
                            pointPercentage = _me$chartConfig.pointPercentage,
                            minBetweenPixel = _me$chartConfig.minBetweenPixel,
                            stacked = _me$chartConfig.stacked,
                            color = _me$chartConfig.color,
                            zeroLine = _me$chartConfig.zeroLine;

                        // First, we draw title

                        box = wxLayout.adjustBox();
                        if (me.title) {
                            me.title.update(me.titleText, box);
                            wxLayout.addBox(me.title.box);
                        }

                        // Second, random color and get legend datasets
                        box = wxLayout.adjustBox();
                        var rColors = (0, _randomColor2.default)((0, _helper.extend)(true, {}, color, { count: me.legends.length }));

                        me.legends = me.legends.map(function (legend, index) {
                            if (!legend.strokeStyle) {
                                legend.strokeStyle = legend.borderColor || (0, _tinycolor2.default)(rColors[index]).darken(10).toString();
                            }

                            return (0, _helper.extend)(true, {
                                fillStyle: rColors[index]
                            }, WX_BAR_LEGEND_DEFAULT_CONFIG, legend);
                        });
                        me.legend.update(me.legends, box);
                        wxLayout.addBox(me.legend.box);

                        // Thirdly, draw scale
                        me._drawScale();

                        // Calculate bar ruler
                        me.barRuler = me.calculateBarRuler();
                        // Finally, draw bar
                        var hasNeg = false;
                        var barConfigs = me.legends.map(function (legend, legendIndex) {
                            var config = {
                                legend: legend
                            };
                            var key = legend.key;
                            config.dataset = me.visDatasets.map(function (data, index) {
                                hasNeg = hasNeg || data[key] < 0;
                                return {
                                    value: data[key],
                                    data: data,
                                    point: me.calculateBarRect(index, legendIndex)
                                };
                            });
                            return config;
                        });

                        barConfigs.forEach(function (bar) {
                            return me._drawBar(bar, hasNeg);
                        });

                        // zero line
                        if (zeroLine) {
                            ctx.save();
                            ctx.fillStyle = me.xAxis.config.color;
                            ctx.lineWidth = me.xAxis.config.lineWidth;

                            var baseY = me.yAxis.getPoint(0).y;
                            var beginPoint = [me.xAxis.getPoint(-1).x, baseY],
                                endPoint = [me.xAxis.box.ex, baseY];
                            ctx.beginPath();
                            ctx.moveTo.apply(ctx, beginPoint);
                            ctx.lineTo.apply(ctx, endPoint);
                            ctx.stroke();
                            ctx.restore();
                        }
                    }

                    /**
                     * Draw one line
                     * @param {Object} barData - Line dataset
                     * @param {Object} barData.legend - Legend's config
                     * @param {Object[]} barData[].value - Data of each line point
                     * @param {Object[]} barData[].data - The data object
                     * @param {Object[]} barData[].point - The point for rending.
                     * @private
                     */

                }, {
                    key: '_drawBar',
                    value: function _drawBar(barData, hasNeg) {
                        var me = this,
                            stacked = me.chartConfig.stacked,
                            ctx = me.ctx;
                        var legend = barData.legend,
                            dataset = barData.dataset;
                        var display = legend.display,
                            borderWidth = legend.borderWidth,
                            fillStyle = legend.fillStyle,
                            strokeStyle = legend.strokeStyle,
                            fillArea = legend.fillArea,
                            fillAlpha = legend.fillAlpha;

                        if (!display) {
                            return;
                        }

                        ctx.save();
                        ctx.fillStyle = fillStyle;
                        ctx.strokeStyle = strokeStyle;
                        ctx.lineWidth = borderWidth;

                        dataset.forEach(function (d) {
                            ctx.beginPath();
                            var value = d.value,
                                data = d.data,
                                point = d.point;

                            if (stacked && hasNeg) {
                                ctx.rect(point.x, point.y, point.barWidth, point.barHeight);
                                if (borderWidth) {
                                    ctx.stroke();
                                }
                                if (fillArea) {
                                    ctx.globalAlpha = fillAlpha;
                                    ctx.fill();
                                    ctx.globalAlpha = 1;
                                }
                            } else {
                                // | 1 2 |
                                // | 0 3 |
                                var points = [[point.x, point.y + point.barHeight], [point.x, point.y], [point.x + point.barWidth, point.y], [point.x + point.barWidth, point.y + point.barHeight]];

                                ctx.moveTo.apply(ctx, _toConsumableArray(points[0]));
                                ctx.lineTo.apply(ctx, _toConsumableArray(points[1]));
                                ctx.lineTo.apply(ctx, _toConsumableArray(points[2]));
                                ctx.lineTo.apply(ctx, _toConsumableArray(points[3]));

                                if (borderWidth) {
                                    ctx.stroke();
                                }
                                if (fillArea) {
                                    ctx.globalAlpha = fillAlpha;
                                    ctx.fill();
                                    ctx.globalAlpha = 1;
                                }
                            }
                        });

                        ctx.draw();
                        ctx.restore();
                    }

                    /**
                     * Bar's render ruler
                     * @typedef {Object} BarRuler
                     * @property {number} tickWidth - The width of one ticket.
                     * @property {number} pointPercentage - Percent (0-1) of the space for each data point
                     * @property {number} pointWidth - The width of each data point
                     * @property {number} pointIntervalWidth - The remaining width of the space for each data point
                     * @property {number} barIntervalWidth - The remaining width of each bar
                     * @property {Object[]} legends - legends's setting
                     * @property {number} legends.barPercentage - Percent (0-1) of the available width each bar should be within the data point space
                     * @property {number} legends._standardPercentage - The real percent of the available with at each point scope
                     * @property {number} legends.barWidth - The width of bar
                     */

                    /**
                     * Calculate the bar's base ruler
                     * @param {WxScale} [scale=this.xAxis] - Bar's scale
                     * @return {BarRuler} Bar ruler
                     */

                }, {
                    key: 'calculateBarRuler',
                    value: function calculateBarRuler() {
                        var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.xAxis;

                        var me = this;
                        var globalBarWidth = void 0,
                            globalBarPercentage = me.chartConfig.barPercentage,
                            pointPercentage = me.chartConfig.pointPercentage,
                            stacked = me.chartConfig.stacked,
                            legends = me.legends;
                        var legendLen = legends.length;

                        var tickWidth = scale.calculateTickWidth();
                        // One scale's point space
                        var pointWidth = tickWidth * pointPercentage;
                        var pointIntervalWidth = (tickWidth - pointWidth) / 2;

                        // Standardization every bar's percentage
                        var totalStandardPercentage = 0;
                        if (!globalBarPercentage) {
                            globalBarPercentage = stacked ? Math.max.apply(Math, _toConsumableArray(legends.map(function (x) {
                                return x.barPercentage || 0.8;
                            }))) || 0.8 : 0.8;
                        }
                        globalBarWidth = Math.max.apply(Math, _toConsumableArray([globalBarPercentage * pointWidth].concat(legends.map(function (x) {
                            return _helper.is.Number(x.barWidth) ? x.barWidth : 0;
                        }))));

                        legends.forEach(function (legend) {
                            if (stacked) {
                                legend.barWidth = globalBarWidth;
                                legend.barPercentage = globalBarPercentage;
                                legend._standardPercentage = globalBarPercentage / legendLen;
                            } else {
                                var standardPercentage = void 0;
                                var barPercentage = legend.barPercentage ? legend.barPercentage > 1 ? 1.0 : legend.barPercentage : globalBarPercentage;

                                if (legend.barWidth) {
                                    // Bar fixed width...
                                    standardPercentage = legend.barWidth / tickWidth;
                                } else {
                                    standardPercentage = barPercentage / legendLen;
                                    legend.barWidth = pointWidth * standardPercentage;
                                }
                                totalStandardPercentage += standardPercentage;
                                legend._standardPercentage = standardPercentage;
                            }
                        });

                        // Check total percentage
                        if (totalStandardPercentage > 1) {
                            throw Error('Bar\'s width too large!');
                        } else if (stacked) {
                            totalStandardPercentage = globalBarPercentage;
                        }

                        var barIntervalWidth = legendLen > 1 ? pointWidth * (1 - totalStandardPercentage) / (legendLen - 1) : pointWidth * (1 - totalStandardPercentage);

                        return { tickWidth: tickWidth, pointPercentage: pointPercentage, pointWidth: pointWidth, pointIntervalWidth: pointIntervalWidth, legends: legends, barIntervalWidth: barIntervalWidth };
                    }

                    /**
                     * Calculate the box of one "rect"
                     * @param {number} index - The index of item
                     * @param {number} legendIndex - The index of legend
                     * @param {WxScale} [xScale=this.xAxis] - Bar's x-axis
                     * @param {WxScale} [yScale=this.yAxis] - Bar's x-axis
                     */

                }, {
                    key: 'calculateBarRect',
                    value: function calculateBarRect(index, legendIndex) {
                        var xScale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.xAxis;
                        var yScale = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.yAxis;

                        var me = this,
                            stacked = me.chartConfig.stacked,
                            barRuler = me.barRuler || me.calculateBarRuler(xScale);

                        var legendOpt = me.legends[legendIndex];
                        if (!legendOpt) {
                            return;
                        }
                        // Calculate the bar's width in front of this legend
                        var frontBarWidth = me.legends.slice(0, legendIndex).reduce(function (acc, cur) {
                            return acc + cur.barWidth;
                        }, 0);
                        var datas = me.visDatasets[index];
                        var value = legendOpt.key && typeof datas[legendOpt.key] !== 'undefined' ? datas[legendOpt.key] : null;
                        if (_helper.is.Null(value) || _helper.is.Undefined(value)) {
                            return;
                        }

                        var xPoint = void 0,
                            yPoint = void 0,
                            barWidth = void 0,
                            barHeight = void 0;
                        var xPointInstance = xScale.getPoint(index);
                        if (stacked) {
                            xPoint = xPointInstance.x - barRuler.pointWidth / 2 + barRuler.barIntervalWidth / 2;
                            yPoint = me._getStackPoint(index, legendIndex, barRuler).y;
                            barWidth = legendOpt.barWidth;

                            var baseY = yScale.getPoint(0).y;
                            barHeight = value < 0 ? value / legendOpt.sumNeg * (yScale.getPoint(legendOpt.sumNeg).y - baseY) : value / legendOpt.sumPos * (baseY - yScale.getPoint(legendOpt.sumPos).y);
                        } else {
                            xPoint = xPointInstance.x - barRuler.pointWidth / 2 + frontBarWidth + barRuler.barIntervalWidth / 2 * (legendIndex + 1);
                            yPoint = yScale.getPoint(value).y;
                            barWidth = legendOpt.barWidth;
                            barHeight = xPointInstance.y - yPoint;
                        }

                        return { x: xPoint, y: yPoint, barWidth: barWidth, barHeight: barHeight };
                    }

                    /**
                     * Calculate the stack bar
                     * @param {number} index - The index of item
                     * @param {Object} legendIndex - The index of legend
                     * @param {BarRuler} barRuler
                     * @param {WxScale} [yScale=this.yAxis] - Y-Axis instance
                     * @retrun {Object}
                     * @private
                     */

                }, {
                    key: '_getStackPoint',
                    value: function _getStackPoint(index, legendIndex, barRuler) {
                        var yScale = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.yAxis;

                        var me = this,
                            data = me.visDatasets[index],
                            value = data[me.legends[legendIndex].key];

                        var stackedVal = void 0,
                            sumNeg = 0,
                            sumPos = 0;
                        for (var j = 0; j < legendIndex; j++) {
                            stackedVal = data[me.legends[j].key];
                            if (stackedVal < 0) {
                                sumNeg += stackedVal || 0;
                            } else {
                                sumPos += stackedVal || 0;
                            }
                        }
                        // let stackedVal, sumNeg = 0, sumPos = 0;
                        // for (let i = 0; i < index; i++) {
                        //     let data = me.visDatasets[i];
                        //     for (let j = 0; j < legendIndex; j++) {
                        //         stackedVal = data[me.legends[j].key];
                        //         if (stackedVal < 0) {
                        //             sumNeg += stackedVal || 0;
                        //         } else {
                        //             sumPos += stackedVal || 0;
                        //         }
                        //     }
                        // }

                        return value < 0 ? yScale.getPoint(sumNeg) : yScale.getPoint(sumPos + value);
                    }

                    /**
                     * Draw the scale of chart
                     *
                     * @private
                     */

                }, {
                    key: '_drawScale',
                    value: function _drawScale() {
                        var box = void 0,
                            me = this,
                            wxLayout = me.wxLayout;

                        box = wxLayout.adjustBox();
                        var xDatasets = me.xScaleAxisDatas(),
                            yDatasets = me.yScaleAxisDatas(box);

                        var _me$wxCrossScale$draw = me.wxCrossScale.draw(box, xDatasets, yDatasets),
                            xBox = _me$wxCrossScale$draw.xBox,
                            yBox = _me$wxCrossScale$draw.yBox;

                        wxLayout.addBox(xBox);
                        wxLayout.addBox(yBox);
                    }

                    /**
                     * Build the yAxis datasets
                     * @param {BoxInstance} area - The area of chart
                     */

                }, {
                    key: 'yScaleAxisDatas',
                    value: function yScaleAxisDatas(area) {
                        var me = this,
                            stacked = me.chartConfig.stacked,
                            ctx = me.ctx;
                        var yScaleItemOptions = me.chartConfig.yScaleItemOptions;
                        var tickLimits = me.yAxis.calculateTickLimit(area, ctx);

                        if (stacked) {
                            var _ret = function () {
                                var min = 0,
                                    max = 0;
                                me.legends.forEach(function (legend) {
                                    var key = legend.key;
                                    var sumNeg = 0,
                                        sumPos = 0;
                                    me.visDatasets.forEach(function (data) {
                                        var stackedVal = data[key];
                                        if (stackedVal < 0) {
                                            sumNeg += stackedVal || 0;
                                        } else {
                                            sumPos += stackedVal || 0;
                                        }
                                    });
                                    if (sumNeg < min) min = sumNeg;
                                    if (sumPos > max) max = sumPos;
                                    legend.sumNeg = sumNeg;
                                    legend.sumPos = sumPos;
                                });
                                return {
                                    v: me.yAxis.buildDatasets(max, min, tickLimits, undefined, yScaleItemOptions)
                                };
                            }();

                            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                        } else {
                            // First, get all available values and calculate the max/min value
                            var _visDatasets$reduce = this.visDatasets.reduce(function (pre, cur) {
                                var max = pre.max,
                                    min = pre.min;

                                if (cur.display) {
                                    var curValue = me.legends.map(function (legend) {
                                        if (legend.key) {
                                            return cur[legend.key] || 0;
                                        }
                                    }).concat(max, min);
                                    max = Math.max.apply(Math, _toConsumableArray(curValue));
                                    min = Math.min.apply(Math, _toConsumableArray(curValue));
                                }
                                return { max: max, min: min };
                            }, {
                                max: 0,
                                min: 0
                            }),
                                max = _visDatasets$reduce.max,
                                min = _visDatasets$reduce.min;

                            return me.yAxis.buildDatasets(max, min, tickLimits, undefined, yScaleItemOptions);
                        }
                    }

                    /**
                     * Build the xAxis datasets
                     */

                }, {
                    key: 'xScaleAxisDatas',
                    value: function xScaleAxisDatas() {
                        var me = this;
                        var xScaleItemOptions = me.chartConfig.xScaleItemOptions;
                        var xScaleConfig = me.labels.map(function (label) {
                            var item = {
                                'text': label
                            };
                            if (typeof xScaleItemOptions !== 'undefined') {
                                item = (0, _helper.extend)(item, xScaleItemOptions);
                            }
                            return item;
                        });

                        return me.xAxis.buildDatasets(xScaleConfig);
                    }
                }, {
                    key: 'labels',
                    get: function get() {
                        var me = this,
                            tmp = void 0;
                        if (me._labels) {
                            return me._labels;
                        } else if (tmp = me.chartConfig.labels) {
                            if (_helper.is.Array(tmp)) {
                                return tmp;
                            }
                        }
                        me._labels = me.visDatasets.map(function (dataset) {
                            return dataset.label;
                        });
                        return me._labels;
                    }
                }, {
                    key: 'legends',
                    get: function get() {
                        var me = this;
                        if (!me._legends) {
                            me._legends = me._getLegendConfig();
                        }
                        return me._legends;
                    },
                    set: function set(value) {
                        this._legends = value;
                    }
                }]);

                return WxBar;
            }(_wxChart2.default);

            exports.default = WxBar;
        }, { "../core/layout": 6, "../core/legend": 7, "../core/scale": 8, "../core/title": 9, "../scale/scale.category": 10, "../scale/scale.crosshelp": 11, "../scale/scale.liner": 12, "../util/helper": 13, "../util/randomColor": 14, "../util/tinycolor": 15, "../util/wxCanvas": 16, "./wxChart": 4 }], 2: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _get = function get(object, property, receiver) {
                if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
                    var parent = Object.getPrototypeOf(object);if (parent === null) {
                        return undefined;
                    } else {
                        return get(parent, property, receiver);
                    }
                } else if ("value" in desc) {
                    return desc.value;
                } else {
                    var getter = desc.get;if (getter === undefined) {
                        return undefined;
                    }return getter.call(receiver);
                }
            };

            var _wxCanvas = require('../util/wxCanvas');

            var _wxCanvas2 = _interopRequireDefault(_wxCanvas);

            var _wxChart = require('./wxChart');

            var _wxChart2 = _interopRequireDefault(_wxChart);

            var _title = require('../core/title');

            var _title2 = _interopRequireDefault(_title);

            var _layout = require('../core/layout');

            var _layout2 = _interopRequireDefault(_layout);

            var _legend = require('../core/legend');

            var _legend2 = _interopRequireDefault(_legend);

            var _randomColor = require('../util/randomColor');

            var _randomColor2 = _interopRequireDefault(_randomColor);

            var _helper = require('../util/helper');

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                }return call && ((typeof call === "undefined" ? "undefined" : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
            }

            function _inherits(subClass, superClass) {
                if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof2(superClass)));
                }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
            }

            // Doughnut default config
            var WX_DOUGHNUT_DEFAULT_CONFIG = {
                legendOptions: {
                    'position': 'bottom'
                },
                // The percentage of the chart that we cut out of the middle.
                cutoutPercentage: 50,

                // The rotation of the chart, where the first data arc begins.
                rotation: Math.PI * -0.5,

                // The randomColor scheme
                // See https://github.com/davidmerfield/randomColor
                color: {
                    hue: 'red',
                    luminosity: 'light'
                },

                // The title text or a title config object
                title: undefined,

                // The borderWidth
                borderWidth: 2,

                // Chart padding, default auto set
                padding: undefined,

                labelDistancePercentage: 0.15
            };

            /**
             * Doughnut item config
             *
             * value: The value of chart
             * label: The legend text
             * color: The color of item ,by default we use the randomColour scheme to create color
             * radius: The percentage of radius, default is '100'
             * legend: [Object] legend options
             */
            var WX_DOUGHNUT_ITEM_DEFAULT_CONFIG = {
                display: true,
                fontSize: 11,
                percentage: 100
            };

            var WxDoughnut = function (_WxChart) {
                _inherits(WxDoughnut, _WxChart);

                /**
                 * WxDoughnut chart
                 * @constructor
                 * @param {string} id - The canvas element's id
                 * @param {Object} config
                 * @param {number} [config.width=300] - The width of canvas.
                 * @param {number} [config.height=200] - The height of canvas.
                 * @param {number} [config.padding=] - The padding of canvas.
                 * @param {string} [config.display=block] - The display style of chart.
                 *
                 * @param {number} [config.cutoutPercentage=50] - The percentage of the chart that we cut out of the middle.
                 * @param {number} [config.rotation=Math.PI * -0.5] - The rotation of the chart, where the first data arc begins.
                 * @param {Object} [config.color=red] - The randomColor options.
                 * @param {(string|Object)} [config.title=] - The title text or title options of chart.
                 * @param {Object} [config.legendOptions=] - The legend options of chart.
                 */
                function WxDoughnut(id, config) {
                    _classCallCheck(this, WxDoughnut);

                    var _this = _possibleConstructorReturn(this, (WxDoughnut.__proto__ || Object.getPrototypeOf(WxDoughnut)).call(this, id, config));

                    var me = _this;
                    me.chartConfig = (0, _helper.extend)({}, WX_DOUGHNUT_DEFAULT_CONFIG, config);

                    me.title = null;
                    // Initialize title and legend
                    if (me.chartConfig.title) {
                        me.title = new _title2.default(me, _helper.is.PureObject(me.chartConfig.title) ? me.chartConfig.title : null);
                        me.titleText = _helper.is.String(me.chartConfig.title) ? me.chartConfig.title : me.chartConfig.title.text;
                    }

                    me.legend = new _legend2.default(me, me.chartConfig.legendOptions);
                    me.wxLayout = new _layout2.default(me);
                    return _this;
                }

                /**
                 * Update a datesets of chart and reDraw
                 * @param {Object[]} datasets
                 * @param {string} [datasets[].hidden=false] - Display or not.
                 * @param {string} datasets[].label - The label text of an dataset.
                 * @param {function} datasets[].format - The label text format function.
                 * @param {number} datasets[].value - The value of an dataset.
                 * @param {string} [datasets[].color] - The color of an dataset.
                 * @param {string} [datasets[].borderColor]- The border color of an dataset.
                 * @param {string} [datasets[].percentage=100] - The percentage of radius, default is '100'
                 * @param {string} [datasets[].legend] - The legend option of an dataset. We will set legend text as same as label text.
                 *
                 */

                _createClass(WxDoughnut, [{
                    key: 'update',
                    value: function update(datasets) {
                        var me = this;
                        _get(WxDoughnut.prototype.__proto__ || Object.getPrototypeOf(WxDoughnut.prototype), 'update', this).call(this, datasets, WX_DOUGHNUT_ITEM_DEFAULT_CONFIG);
                        me.wxLayout.removeAllBox();
                        return me.draw();
                    }

                    /**
                     * Draw chart
                     */

                }, {
                    key: 'draw',
                    value: function draw() {
                        var box = void 0,
                            me = this,
                            labelDistancePercentage = me.chartConfig.labelDistancePercentage,
                            wxLayout = me.wxLayout;
                        var _me$chartConfig = me.chartConfig,
                            cutoutPercentage = _me$chartConfig.cutoutPercentage,
                            rotation = _me$chartConfig.rotation,
                            color = _me$chartConfig.color,
                            title = _me$chartConfig.title,
                            borderWidth = _me$chartConfig.borderWidth,
                            padding = _me$chartConfig.padding;

                        box = wxLayout.adjustBox();
                        // First, we draw title
                        if (me.title) {
                            me.title.update(me.titleText, box);
                            wxLayout.addBox(me.title.box);
                        }

                        box = wxLayout.adjustBox();
                        // Second, random color and get legend datasets
                        var rColors = (0, _randomColor2.default)((0, _helper.extend)(true, {}, color, { count: me.visDatasets.length }));
                        var rBorderColor = (0, _randomColor2.default)({
                            hue: color.hue || 'black',
                            luminosity: 'dark',
                            count: 1
                        });
                        var legendDatasets = [];
                        me.visDatasets.forEach(function (dataset, index) {
                            if (!dataset.color) {
                                dataset.color = rColors[index];
                            }
                            if (!dataset.borderColor) {
                                dataset.borderColor = me.config.backgroundColor || "#ffffff";
                            }

                            var legend = dataset.legend;
                            if (!legend || _helper.is.String(legend)) {
                                legendDatasets.push({
                                    hidden: dataset.hidden || false,
                                    text: _helper.is.String(legend) ? legend : dataset.label,
                                    fillStyle: dataset.color,
                                    strokeStyle: rBorderColor[0]
                                });
                            } else if (_helper.is.PureObject(legend)) {
                                legendDatasets.push((0, _helper.extend)({
                                    hidden: dataset.hidden
                                }, legend));
                            }
                        });
                        me.legend.update(legendDatasets, box);
                        wxLayout.addBox(me.legend.box);

                        box = wxLayout.adjustBox();
                        padding = padding || box.width * 0.1;
                        box.width -= padding;
                        box.height -= padding;
                        me.box = box;

                        var _box = box,
                            x = _box.x,
                            y = _box.y,
                            width = _box.width,
                            height = _box.height,
                            outerWidth = _box.outerWidth,
                            outerHeight = _box.outerHeight;

                        var minSize = Math.min(width, height);
                        var outerRadius = Math.max((minSize - borderWidth * 2) / 2, 0) - 10;
                        var totalValue = me.calculateTotal(),
                            longestLabelWidth = me._longestLabel(totalValue),
                            maximalFontSize = me._maximalLabelFontSize(),
                            shouldSpace = longestLabelWidth + maximalFontSize + outerRadius * labelDistancePercentage;

                        // Calculate the space between pie's border and margin of chart
                        var widthSpace = (width - (outerRadius + borderWidth) * 2) / 2;
                        if (widthSpace < shouldSpace) {
                            outerRadius -= shouldSpace - widthSpace;
                        }

                        var innerRadius = cutoutPercentage ? outerRadius / 100 * cutoutPercentage : 0,
                            innerRadiusColor = me.config.backgroundColor || "#ffffff";
                        var pointX = x + outerWidth / 2,
                            pointY = y + outerHeight / 2;

                        var drawAngle = rotation;
                        me.initAvoidCollision();
                        me.visDatasets.forEach(function (dataset, index) {
                            var startAngle = drawAngle,
                                endAngle = startAngle + Math.PI * 2.0 * (dataset.value / totalValue);
                            var opt = {
                                pointX: pointX,
                                pointY: pointY,
                                startAngle: startAngle,
                                endAngle: endAngle,
                                innerRadius: innerRadius,
                                outerRadius: outerRadius,
                                totalValue: totalValue,
                                borderWidth: borderWidth
                            };
                            me.drawData(dataset, opt);
                            me.drawLabel(dataset, opt);

                            drawAngle = endAngle;
                        });
                        wxLayout.addBox(me.box);
                    }
                }, {
                    key: 'drawData',
                    value: function drawData(dataset, options) {
                        var me = this,
                            ctx = me.ctx;
                        var pointX = options.pointX,
                            pointY = options.pointY,
                            startAngle = options.startAngle,
                            endAngle = options.endAngle,
                            outerRadius = options.outerRadius,
                            innerRadius = options.innerRadius,
                            totalValue = options.totalValue,
                            borderWidth = options.borderWidth;
                        var label = dataset.label,
                            value = dataset.value,
                            color = dataset.color,
                            borderColor = dataset.borderColor,
                            percentage = dataset.percentage,
                            hidden = dataset.hidden;

                        if (!!hidden) {
                            return endAngle;
                        }

                        var centerAngle = startAngle + (endAngle - startAngle) / 2;
                        var currentRadius = outerRadius / 100 * percentage;

                        ctx.save();
                        ctx.beginPath();

                        ctx.arc(pointX, pointY, currentRadius, startAngle, endAngle);
                        ctx.arc(pointX, pointY, innerRadius, endAngle, startAngle, true);

                        ctx.closePath();
                        ctx.strokeStyle = borderColor;
                        ctx.lineWidth = borderWidth || 0;
                        ctx.fillStyle = color;

                        ctx.fill();
                        ctx.lineJoin = 'bevel';

                        if (borderWidth) {
                            ctx.stroke();
                        }
                        ctx.draw();
                        ctx.restore();
                        return endAngle;
                    }
                }, {
                    key: 'drawLabel',
                    value: function drawLabel(dataset, options) {
                        var me = this,
                            ctx = me.ctx;
                        var labelDistancePercentage = me.chartConfig.labelDistancePercentage || 0.2;
                        var pointX = options.pointX,
                            pointY = options.pointY,
                            startAngle = options.startAngle,
                            endAngle = options.endAngle,
                            outerRadius = options.outerRadius,
                            innerRadius = options.innerRadius,
                            totalValue = options.totalValue,
                            borderWidth = options.borderWidth;
                        var label = dataset.label,
                            value = dataset.value,
                            color = dataset.color,
                            borderColor = dataset.borderColor,
                            fontSize = dataset.fontSize,
                            percentage = dataset.percentage,
                            format = dataset.format,
                            hidden = dataset.hidden;

                        if (!!hidden) {
                            return;
                        }

                        var centerAngle = startAngle + (endAngle - startAngle) / 2;
                        var currentRadius = outerRadius / 100 * percentage;
                        label = _helper.is.Function(format) ? format.call(me, label, value, totalValue, currentRadius, dataset, options) : label;

                        // Line start point
                        var startX = Math.cos(centerAngle) * currentRadius + pointX;
                        var startY = Math.sin(centerAngle) * currentRadius + pointY;

                        // Line turn around point
                        var offsetRadius = currentRadius * labelDistancePercentage,
                            turnRadius = currentRadius + offsetRadius;
                        var turnX = Math.cos(centerAngle) * turnRadius + pointX;
                        var turnY = Math.sin(centerAngle) * turnRadius + pointY;

                        // Avoid Collision
                        var adjustPoint = me.avoidCollision({
                            x: turnX,
                            y: turnY
                        }, {
                            x: pointX,
                            y: pointY
                        });
                        turnX = adjustPoint.x;
                        turnY = adjustPoint.y;

                        var textLen = ctx.measureText(label).width;
                        var endX = turnX + (turnX - pointX > 0 ? offsetRadius : -offsetRadius),
                            endY = turnY;
                        var textX = turnX - pointX > 0 ? endX + 4 : endX - 4 - textLen,
                            textY = endY + ctx.fontSize / 2;

                        ctx.save();
                        ctx.beginPath();
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = color;
                        ctx.fillStyle = color;
                        ctx.fontSize = fontSize;
                        ctx.fontSize = ctx.moveTo(startX, startY);
                        ctx.lineTo(turnX, turnY);
                        ctx.lineTo(endX, endY);
                        ctx.stroke();
                        ctx.fillText(label, textX, textY);
                        ctx.draw();
                        ctx.restore();
                    }
                }, {
                    key: '_longestLabel',

                    // Get longest label
                    value: function _longestLabel(totalValue) {
                        var me = this,
                            visDatasets = me.visDatasets,
                            ctx = me.ctx;
                        var maxLabelWidth = 0;
                        visDatasets.forEach(function (dataset) {
                            var label = dataset.label,
                                value = dataset.value,
                                format = dataset.format;

                            label = _helper.is.Function(format) ? format.call(me, label, value, totalValue, 0, dataset) : label;
                            var textLen = ctx.measureText(label).width;

                            maxLabelWidth = textLen > maxLabelWidth ? textLen : maxLabelWidth;
                        });
                        return maxLabelWidth;
                    }
                    // Get maximal font size of label

                }, {
                    key: '_maximalLabelFontSize',
                    value: function _maximalLabelFontSize() {
                        var me = this,
                            visDatasets = me.visDatasets;
                        var max = 0;
                        visDatasets.forEach(function (dataset) {
                            var fontSize = dataset.fontSize;

                            max = fontSize > max ? fontSize : max;
                        });
                        return max;
                    }
                    // Avoid Collision

                }, {
                    key: 'initAvoidCollision',
                    value: function initAvoidCollision() {
                        this._lastPoint = null;
                    }
                }, {
                    key: 'avoidCollision',
                    value: function avoidCollision(newPoint, centerPoint) {
                        var avoidUnit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.ctx.fontSize + 4;

                        var me = this,
                            box = me.box;
                        var cpx = centerPoint.x,
                            cpy = centerPoint.y;
                        if (me._lastPoint) {
                            var lpx = me._lastPoint.x,
                                lpy = me._lastPoint.y;
                            var npx = newPoint.x,
                                npy = newPoint.y;
                            if ((npx - cpx) * (lpx - cpx) > 0 && Math.abs(lpy - npy) < avoidUnit) {
                                var ny = npx - cpx > 0 ? lpy + avoidUnit : lpy - avoidUnit;
                                newPoint.y = ny;
                            }
                        }
                        this._lastPoint = newPoint;
                        return newPoint;
                    }
                }]);

                return WxDoughnut;
            }(_wxChart2.default);

            exports.default = WxDoughnut;
        }, { "../core/layout": 6, "../core/legend": 7, "../core/title": 9, "../util/helper": 13, "../util/randomColor": 14, "../util/wxCanvas": 16, "./wxChart": 4 }], 3: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _get = function get(object, property, receiver) {
                if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
                    var parent = Object.getPrototypeOf(object);if (parent === null) {
                        return undefined;
                    } else {
                        return get(parent, property, receiver);
                    }
                } else if ("value" in desc) {
                    return desc.value;
                } else {
                    var getter = desc.get;if (getter === undefined) {
                        return undefined;
                    }return getter.call(receiver);
                }
            };

            var _wxCanvas = require('../util/wxCanvas');

            var _wxCanvas2 = _interopRequireDefault(_wxCanvas);

            var _wxChart = require('./wxChart');

            var _wxChart2 = _interopRequireDefault(_wxChart);

            var _title = require('../core/title');

            var _title2 = _interopRequireDefault(_title);

            var _scale = require('../core/scale');

            var _scale2 = _interopRequireDefault(_scale);

            var _scale3 = require('../scale/scale.liner');

            var _scale4 = _interopRequireDefault(_scale3);

            var _scale5 = require('../scale/scale.crosshelp');

            var _scale6 = _interopRequireDefault(_scale5);

            var _scale7 = require('../scale/scale.category');

            var _scale8 = _interopRequireDefault(_scale7);

            var _legend = require('../core/legend');

            var _legend2 = _interopRequireDefault(_legend);

            var _layout = require('../core/layout');

            var _layout2 = _interopRequireDefault(_layout);

            var _helper = require('../util/helper');

            var _randomColor = require('../util/randomColor');

            var _randomColor2 = _interopRequireDefault(_randomColor);

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            function _toConsumableArray(arr) {
                if (Array.isArray(arr)) {
                    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                        arr2[i] = arr[i];
                    }return arr2;
                } else {
                    return Array.from(arr);
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                }return call && ((typeof call === "undefined" ? "undefined" : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
            }

            function _inherits(subClass, superClass) {
                if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof2(superClass)));
                }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
            }

            // Line legend's default config
            var WX_LINE_LEGEND_DEFAULT_CONFIG = {
                lineWidth: 2,
                // 'capStyle': 'butt', //Default line cap is cap,
                lineJoin: 'miter',
                fillArea: false,
                fillAlpha: 0.5,
                display: true,
                spanGaps: false, // If set true, will draw line between the point
                tension: 0.4 // Default bezier curve tension. Set to 0 for no bezier curves.
            };
            // Line default config
            var WX_LINER_DEFAULT_CONFIG = {
                // Scale options
                xScaleOptions: {
                    position: 'bottom'
                },
                xScaleItemOptions: undefined,
                yScaleOptions: {
                    position: 'left'
                },
                yScaleItemOptions: undefined,
                crossScaleOptions: {},
                // The title text or a title config object
                title: undefined,

                // The legend of line chart
                legends: [], // lineWidth, lineJoin, fillStyle, strokeStyle, fillArea can be set in here
                legendOptions: {
                    'position': 'bottom'
                },

                // The randomColor scheme
                // See https://github.com/davidmerfield/randomColor
                color: {
                    hue: 'red',
                    luminosity: 'light'
                },

                // The dataset's default key
                defaultKey: 'value'
            };

            var WX_LINER_ITEM_DEFAULT_CONFIG = {
                pointRadius: 4,
                pointStyle: 'circle', // Support triangle, rect and Image object
                pointBorderWidth: 1.5,
                pointBorderColor: '#ffffff',
                tension: 0.4,
                display: true
            };

            var WxLiner = function (_WxChart) {
                _inherits(WxLiner, _WxChart);

                /**
                 * WxLiner chart
                 * @constructor
                 * @param {string} id - The canvas element's id
                 * @param {Object} config
                 * @param {number} [config.width=300] - The width of canvas.
                 * @param {number} [config.height=200] - The height of canvas.
                 * @param {number} [config.padding=] - The padding of canvas.
                 * @param {string} [config.display=block] - The display style of chart.
                 *
                 * @param {Object} config.legendOptions=[] - The legend & label options.You should set 'key' to bind the attribute in datasets which is the value of the point.
                 * @param {(string|Object)} [config.title=] - The title text or title options of chart.
                 * @example
                 * datasets:[{
                 *  valueA: 30,
                 *  valueB: 40,
                 *  label: '一月'
                 * }, {
                 *  valueA: 20,
                 *  valueB: 50,
                 *  pointRadius: 2,
                 *  label: '二月'
                  * },...]
                 *
                 * legends: [{
                 *   'text': 'valueA Text',
                 *   'key': 'valueA',
                 *   'strokeStyle': '#3385ff'
                 * }, {
                 *   text: 'valueB Text',
                 *   key: 'valueB'
                 * }]
                 */
                function WxLiner(id, config) {
                    _classCallCheck(this, WxLiner);

                    var _this = _possibleConstructorReturn(this, (WxLiner.__proto__ || Object.getPrototypeOf(WxLiner)).call(this, id, config));

                    var me = _this;
                    me.chartConfig = (0, _helper.extend)({}, WX_LINER_DEFAULT_CONFIG, config);

                    me.title = null;
                    // Initialize title and legend
                    if (me.chartConfig.title) {
                        me.title = new _title2.default(me, _helper.is.PureObject(me.chartConfig.title) ? me.chartConfig.title : null);
                        me.titleText = _helper.is.String(me.chartConfig.title) ? me.chartConfig.title : me.chartConfig.title.text;
                    }

                    // Initialize legend
                    me.legend = new _legend2.default(me, me.chartConfig.legendOptions);

                    // Initialize x,y Scale
                    me.yAxis = new _scale4.default(me, me.chartConfig.yScaleOptions);
                    me.xAxis = new _scale8.default(me, me.chartConfig.xScaleOptions);
                    me.wxCrossScale = new _scale6.default(me.xAxis, me.yAxis, me.chartConfig.crossScaleOptions);
                    me.wxLayout = new _layout2.default(me);
                    return _this;
                }

                // Get/Set labels


                _createClass(WxLiner, [{
                    key: '_getLegendConfig',

                    /**
                     * Build legends config
                     * @private
                     */
                    value: function _getLegendConfig() {
                        var me = this,
                            defaultKey = me.chartConfig.defaultKey || 'value',
                            legendsConfig = me.chartConfig.legends;
                        if (!legendsConfig) {
                            if (me.labels && me.labels.length) {
                                legendsConfig = me.labels.map(function (label) {
                                    return { 'text': label, 'key': defaultKey };
                                });
                            } else {
                                throw new Error('Can not get legend config!');
                            }
                        } else {
                            legendsConfig = legendsConfig.map(function (legend) {
                                return (0, _helper.extend)(true, {
                                    'key': defaultKey
                                }, legend);
                            });
                        }
                        return legendsConfig;
                    }

                    /**
                     * Update a datesets of chart and reDraw
                     * @param {Object} datasets - data sets
                     * @param {string} [datasets[].display] - Disaply the bar or not
                     * @param {number} [datasets[].fillStyle] - Point fill color. The default color will randomly assigned by 'color' option.
                     * @param {string} [datasets[].strokeStyle='#ffffff'] - Point's border color
                     * @param {string} [datasets[].pointStyle='circle'] - Point style, support triangle, rect and Image object
                     * @param {number} [datasets[].pointRadius=3] - Point radius if style is circle
                     * @param {number} [datasets[].pointBorderWidth=0] - Point border width
                     * @param {string} [datasets[].pointBorderColor='auto'] - Point border color. If not set, will same as lineColor(luminosity+50%)
                     * @param {number} [datasets[].display=true] - display the point or not
                     * @returns {*}
                     */

                }, {
                    key: 'update',
                    value: function update(datasets) {
                        var me = this;
                        me._labels = null;
                        me._legends = null;
                        _get(WxLiner.prototype.__proto__ || Object.getPrototypeOf(WxLiner.prototype), 'update', this).call(this, datasets, WX_LINER_ITEM_DEFAULT_CONFIG);
                        me.wxLayout.removeAllBox();
                        return me.draw();
                    }

                    /**
                     * Draw chart
                     */

                }, {
                    key: 'draw',
                    value: function draw() {
                        var box = void 0,
                            me = this,
                            wxLayout = me.wxLayout;
                        var _me$chartConfig = me.chartConfig,
                            cutoutPercentage = _me$chartConfig.cutoutPercentage,
                            rotation = _me$chartConfig.rotation,
                            color = _me$chartConfig.color,
                            borderWidth = _me$chartConfig.borderWidth,
                            padding = _me$chartConfig.padding;

                        // First, we draw title

                        box = wxLayout.adjustBox();
                        if (me.title) {
                            me.title.update(me.titleText, box);
                            wxLayout.addBox(me.title.box);
                        }

                        // Second, random color and get legend datasets
                        box = wxLayout.adjustBox();
                        var rColors = (0, _randomColor2.default)((0, _helper.extend)(true, {}, color, { count: me.legends.length }));

                        me.legends = me.legends.map(function (legend, index) {
                            if (!legend.strokeStyle) {
                                legend.strokeStyle = me.chartConfig.backgroundColor || legend.borderColor || rColors[index];
                            }

                            return (0, _helper.extend)(true, {
                                fillStyle: rColors[index]
                            }, WX_LINE_LEGEND_DEFAULT_CONFIG, legend);
                        });
                        me.legend.update(me.legends, box);
                        wxLayout.addBox(me.legend.box);

                        // Thirdly, draw scale
                        me._drawScale();

                        // Finally, draw line
                        var lineConfigs = me.legends.map(function (legend) {
                            var config = {
                                legend: legend
                            };
                            var key = legend.key;
                            // config.dataset = me.visDatasets.map(data => {return {value: data[key], data: data}});
                            config.dataset = me.visDatasets.map(function (data, index) {
                                var value = data[key],
                                    point = void 0;

                                if (value) {
                                    var xAxisPoint = me.xAxis.getPoint(index);
                                    var yAxisPoint = me.yAxis.getPoint(value);
                                    point = {
                                        x: xAxisPoint.x,
                                        y: yAxisPoint.y
                                    };
                                }

                                return { value: value, point: point, data: data };
                            });
                            return config;
                        });

                        lineConfigs.forEach(function (line) {
                            return me._drawLine(line);
                        });
                    }

                    /**
                     * Draw the scale of chart
                     *
                     * @private
                     */

                }, {
                    key: '_drawScale',
                    value: function _drawScale() {
                        var box = void 0,
                            me = this,
                            wxLayout = me.wxLayout;

                        box = wxLayout.adjustBox();
                        var xDatasets = me.xScaleAxisDatas(),
                            yDatasets = me.yScaleAxisDatas(box);

                        var _me$wxCrossScale$draw = me.wxCrossScale.draw(box, xDatasets, yDatasets),
                            xBox = _me$wxCrossScale$draw.xBox,
                            yBox = _me$wxCrossScale$draw.yBox;

                        wxLayout.addBox(xBox);
                        wxLayout.addBox(yBox);
                    }

                    /**
                     * Draw one line
                     * @param {Object} lineData - Line dataset
                     * @param {Object} lineData.legend - Legend's config
                     * @param {Object[]} lineData[].value - Data of each line point
                     * @param {Object[]} lineData[].data - The data object
                     * @param {Object[]} lineData[].point - The point for rending.
                     * @private
                     */

                }, {
                    key: '_drawLine',
                    value: function _drawLine(lineData) {
                        var me = this,
                            ctx = me.ctx;
                        var legend = lineData.legend,
                            dataset = lineData.dataset;
                        var display = legend.display,
                            spanGaps = legend.spanGaps,
                            tension = legend.tension,
                            lineWidth = legend.lineWidth,
                            lineJoin = legend.lineJoin,
                            fillStyle = legend.fillStyle,
                            strokeStyle = legend.strokeStyle,
                            fillArea = legend.fillArea,
                            fillAlpha = legend.fillAlpha;

                        if (!display) {
                            return;
                        }

                        ctx.save();
                        var lineToPoint = function lineToPoint(pre, p, next) {
                            if (!tension || tension === 0) {
                                ctx.lineTo(p.x, p.y);
                            } else {
                                var controlPoints = (0, _helper.splineCurve)(pre, p, next, tension);
                                if (!pre) {
                                    ctx.moveTo(p.x, p.y);
                                } else {
                                    ctx.bezierCurveTo(pre.controlPoints.next.x, pre.controlPoints.next.y, controlPoints.previous.x, controlPoints.previous.y, p.x, p.y);
                                }
                                p.controlPoints = controlPoints;
                            }
                        };
                        var getNextPoint = function getNextPoint(dataset, index, spanGaps) {
                            // The end
                            if (index >= dataset.length - 1) {
                                return;
                            }
                            var nextDate = dataset[index + 1];
                            if (!nextDate.point) {
                                if (!!spanGaps) return getNextPoint(dataset, index + 1, spanGaps);else return;
                            }
                            return nextDate.point;
                        };
                        // Draw fill area
                        if (fillArea) {
                            (function () {
                                var firstPoint = void 0,
                                    currPoint = void 0,
                                    xAxisY = me.xAxis.getPoint(0).y;
                                var fillInHere = function fillInHere() {
                                    ctx.globalAlpha = fillAlpha;
                                    ctx.fill();
                                    ctx.globalAlpha = 1;
                                };
                                ctx.beginPath();
                                ctx.lineWidth = 0;
                                ctx.fillStyle = fillStyle;
                                dataset.forEach(function (d, index) {
                                    var point = d.point;

                                    if (!!currPoint) {
                                        if (point) {
                                            //ctx.lineTo(point.x, point.y);
                                            lineToPoint(currPoint, point, getNextPoint(dataset, index, spanGaps));
                                        } else if (!spanGaps) {
                                            // Not spanGap, close path and fill
                                            ctx.lineTo(currPoint.x, xAxisY);
                                            ctx.lineTo(firstPoint.x, xAxisY);
                                            fillInHere();
                                            // First point reset
                                            firstPoint = undefined;
                                            ctx.beginPath();
                                        } else {
                                            // SpanGap, not record this point.
                                            return;
                                        }
                                    } else {
                                        if (point) {
                                            //ctx.moveTo(point.x, point.y);
                                            lineToPoint(currPoint, point, getNextPoint(dataset, index, spanGaps));
                                            firstPoint = point;
                                        }
                                    }
                                    currPoint = point;
                                });
                                if (currPoint && firstPoint) {
                                    ctx.lineTo(currPoint.x, xAxisY);
                                    ctx.lineTo(firstPoint.x, xAxisY);
                                    fillInHere();
                                }
                            })();
                        }

                        // Draw line
                        var currPoint = void 0,
                            pointStack = [];
                        ctx.beginPath();
                        ctx.lineWidth = lineWidth;
                        ctx.lineJoin = lineJoin;
                        ctx.strokeStyle = strokeStyle;
                        dataset.forEach(function (d, index) {
                            var value = d.value,
                                point = d.point,
                                data = d.data;
                            var pointBorderColor = data.pointBorderColor,
                                pointBorderWidth = data.pointBorderWidth,
                                pointRadius = data.pointRadius,
                                pointStyle = data.pointStyle,
                                label = data.label;

                            pointStack.push({ point: point, pointBorderColor: pointBorderColor, pointBorderWidth: pointBorderWidth, pointRadius: pointRadius, pointStyle: pointStyle });

                            if (point) {
                                lineToPoint(currPoint, point, getNextPoint(dataset, index, spanGaps));
                                //!!currPoint ? ctx.lineTo(point.x, point.y): ctx.moveTo(point.x, point.y);
                                // !!currPoint ?
                                //     lineToPoint(currPoint, point, getNextPoint(dataset, index, spanGaps)):
                                //     ctx.moveTo(point.x, point.y);
                            } else if (spanGaps) {
                                // SpanGap, not record this point.
                                return;
                            }
                            currPoint = point;
                        });
                        ctx.stroke();

                        // Draw Point
                        ctx.fillStyle = fillStyle;
                        pointStack.forEach(function (p) {
                            var point = p.point,
                                pointBorderColor = p.pointBorderColor,
                                pointBorderWidth = p.pointBorderWidth,
                                pointRadius = p.pointRadius,
                                pointStyle = p.pointStyle;

                            if (!point) {
                                return;
                            }

                            ctx.beginPath();
                            // TODO: pointStyle NOT IMPLEMENT, Only can render line
                            if (pointRadius) {
                                ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
                                ctx.fill();
                            }

                            if (pointBorderWidth) {
                                ctx.lineWidth = pointBorderWidth;
                                ctx.strokeStyle = pointBorderColor || legend.strokeStyle;
                                ctx.stroke();
                            }
                            ////
                        });

                        ctx.draw();
                        ctx.restore();
                    }

                    /**
                     * Build the yAxis datasets
                     * @param {BoxInstance} area - The area of chart
                     */

                }, {
                    key: 'yScaleAxisDatas',
                    value: function yScaleAxisDatas(area) {
                        var me = this,
                            ctx = me.ctx;
                        var yScaleItemOptions = me.chartConfig.yScaleItemOptions;

                        // First, get all available values and calculate the max/min value

                        var _visDatasets$reduce = this.visDatasets.reduce(function (pre, cur) {
                            var max = pre.max,
                                min = pre.min;

                            if (cur.display) {
                                var curValue = me.legends.map(function (legend) {
                                    if (legend.key) {
                                        return cur[legend.key] || 0;
                                    }
                                }).concat(max, min);
                                max = Math.max.apply(Math, _toConsumableArray(curValue));
                                min = Math.min.apply(Math, _toConsumableArray(curValue));
                            }
                            return { max: max, min: min };
                        }, {
                            max: 0,
                            min: 0
                        }),
                            max = _visDatasets$reduce.max,
                            min = _visDatasets$reduce.min;

                        var tickLimits = me.yAxis.calculateTickLimit(area, ctx);
                        return me.yAxis.buildDatasets(max, min, tickLimits);
                    }

                    /**
                     * Build the xAxis datasets
                     */

                }, {
                    key: 'xScaleAxisDatas',
                    value: function xScaleAxisDatas() {
                        var me = this;
                        var xScaleItemOptions = me.chartConfig.xScaleItemOptions;
                        var xScaleConfig = me.labels.map(function (label) {
                            var item = {
                                'text': label
                            };
                            if (typeof xScaleItemOptions !== 'undefined') {
                                item = (0, _helper.extend)(item, xScaleItemOptions);
                            }
                            return item;
                        });

                        return me.xAxis.buildDatasets(xScaleConfig);
                    }
                }, {
                    key: 'labels',
                    get: function get() {
                        var me = this,
                            tmp = void 0;
                        if (me._labels) {
                            return me._labels;
                        } else if (tmp = me.chartConfig.labels) {
                            if (_helper.is.Array(tmp)) {
                                return tmp;
                            }
                        }
                        me._labels = me.visDatasets.map(function (dataset) {
                            return dataset.label;
                        });
                        return me._labels;
                    }
                }, {
                    key: 'legends',
                    get: function get() {
                        var me = this;
                        if (!me._legends) {
                            me._legends = me._getLegendConfig();
                        }
                        return me._legends;
                    },
                    set: function set(value) {
                        this._legends = value;
                    }
                }]);

                return WxLiner;
            }(_wxChart2.default);

            exports.default = WxLiner;
        }, { "../core/layout": 6, "../core/legend": 7, "../core/scale": 8, "../core/title": 9, "../scale/scale.category": 10, "../scale/scale.crosshelp": 11, "../scale/scale.liner": 12, "../util/helper": 13, "../util/randomColor": 14, "../util/wxCanvas": 16, "./wxChart": 4 }], 4: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.wxChartInstances = undefined;

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _helper = require('../util/helper');

            var _wxCanvas = require('../util/wxCanvas');

            var _wxCanvas2 = _interopRequireDefault(_wxCanvas);

            var _layout = require('../core/layout');

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            // Chart default config
            var wxChartDefaultConfig = {
                fontSize: 10,
                width: 300,
                height: 200,
                display: 'block',
                padding: 0,
                backgroundColor: null
            };

            // Store all references of 'WxChart' instances - allowing us to globally resize chart instances on window resize.
            var wxChartInstances = exports.wxChartInstances = {};
            // The basic class of WeiXin chart

            var WxChart = function () {
                /**
                 * @constructor
                 * @param {string} id - Canvas id ,DOM ID or HTMLElement
                 * @param {Object|number} [config] - The config of Canvas or the width of chart.
                 * @param {number} [config.width] - The width of canvas.
                 * @param {number} [config.height] - The height of canvas.
                 * @param {number} [config.padding] - The padding of canvas.
                 * @param {string} [config.display] - The display style of chart.
                 */
                function WxChart(id, config) {
                    _classCallCheck(this, WxChart);

                    var me = this;

                    // Arguments parse...
                    var chartConf = void 0;
                    if (_helper.is.PureObject(config)) {
                        chartConf = (0, _helper.extend)({}, wxChartDefaultConfig, config);
                    } else if (_helper.is.Number(config) || _helper.is.String(config)) {
                        // WxChart(id, width, height, display, ...options)
                        chartConf = {
                            'width': arguments[1],
                            'height': 2 in arguments ? arguments[2] : wxChartDefaultConfig.height,
                            'display': 3 in arguments ? arguments[3] : wxChartDefaultConfig.display
                        };
                        if (4 in arguments && _helper.is.PureObject(arguments[4])) {
                            (0, _helper.extend)({}, wxChartDefaultConfig, chartConf, arguments[4]);
                        } else {
                            (0, _helper.extend)({}, wxChartDefaultConfig, chartConf);
                        }
                    }

                    me.canvas = new _wxCanvas2.default(id, chartConf);
                    me.ctx = me.canvas.getContext('2d');
                    me.isWeiXinAPP = (0, _helper.checkWX)();
                    me.id = (0, _helper.uid)();

                    me._config = me.initConfig(chartConf);
                    me.initContext();

                    // Append to wxChartInstances
                    wxChartInstances[me.id + ''] = me;

                    return me;
                }

                _createClass(WxChart, [{
                    key: 'initConfig',
                    value: function initConfig(config) {
                        var me = this;
                        if (!me.canvas) {
                            console.error("Failed to create WxChart: can't acquire context!");
                        }

                        var canvas = me.canvas,
                            cvWidth = canvas.width,
                            cvHeight = canvas.height;
                        config.width = cvWidth;
                        config.height = cvHeight;
                        config.aspectRatio = config.aspectRatio ? config.aspectRatio : !_helper.is.Undefined(cvHeight) && !_helper.is.Undefined(cvWidth) ? (cvWidth / cvWidth).toFixed(2) : null;
                        config.display = config.display || 'block';
                        return config;
                    }
                }, {
                    key: 'initContext',
                    value: function initContext() {
                        var me = this;
                        if (!me.canvas) {
                            console.error("Failed to create WxChart: can't acquire context!");
                            return me;
                        }
                        // Set scale of canvas
                        (0, _helper.retinaScale)(me.ctx, me.canvas.width, me.canvas.height);

                        // Set font size
                        if (me.config.fontSize) {
                            me.ctx.fontSize = me.config.fontSize;
                        }

                        // calculate box
                        var padding = me.config.padding || 0;
                        me.innerBox = new _layout.BoxInstance('top', 0, 0, me.config.width - padding * 2, me.config.height - padding * 2, me.config.width, me.config.height);
                    }
                }, {
                    key: 'clear',
                    value: function clear() {
                        var me = this;
                        me.ctx.clearRect(0, 0, me.canvas.width, me.canvas.height);
                        if (me.config.backgroundColor) {
                            me.ctx.save();
                            me.ctx.fillStyle = me.config.backgroundColor;
                            me.ctx.fillRect(0, 0, me.canvas.width, me.canvas.height);
                            me.ctx.restore();
                            me.ctx.draw();
                        }
                    }
                }, {
                    key: 'destroy',
                    value: function destroy() {
                        var me = this;

                        me.clear();
                        me.canvas.releaseContext();

                        if (me.id && me.id in wxChartInstances) {
                            delete wxChartInstances[me.id];
                        }

                        me.id = null;
                        me.canvas = null;
                        me.ctx = null;
                        me._config = null;
                        me.innerBox = null;
                    }
                    // The 'config' property

                }, {
                    key: 'draw',
                    value: function draw() {
                        // Do nothing...
                    }
                }, {
                    key: 'update',
                    value: function update(datasets, defaultItemOpt) {
                        var me = this;
                        if (_helper.is.Undefined(datasets)) {
                            return;
                        }
                        if (!_helper.is.Array(datasets)) {
                            datasets = [datasets];
                        }

                        datasets = datasets.map(function (dataset) {
                            return (0, _helper.extend)({}, defaultItemOpt, dataset);
                        });
                        // Fill default Options
                        me.clear();
                        me._datasets = datasets;
                        me._visDatasets = null;
                        return me._datasets;
                    }
                }, {
                    key: 'calculateTotal',
                    value: function calculateTotal() {
                        var datasets = this.datasets;
                        var total = 0;
                        var value = void 0;

                        datasets.forEach(function (dataset, index) {
                            value = parseFloat(dataset.value);
                            if (!_helper.is.NaN(value) && !dataset.hidden) {
                                total += Math.abs(value);
                            }
                        });

                        return total;
                    }
                }, {
                    key: 'config',
                    get: function get() {
                        if (!this._config) {
                            this._config = (0, _helper.extend)({}, wxChartDefaultConfig);
                        }
                        return this._config;
                    },
                    set: function set(chartConf) {
                        var me = this;
                        // Update chart config
                        me.initConfig(chartConf);
                        me.initContext();
                        // Clear canvas
                        me.clear();
                        // Call redraw
                        me.draw();
                    }
                }, {
                    key: 'datasets',
                    get: function get() {
                        return this._datasets;
                    },
                    set: function set(datasets) {
                        return this.update(datasets);
                    }

                    /**
                     * Get visible ticks
                     */

                }, {
                    key: 'visDatasets',
                    get: function get() {
                        return this._visDatasets ? this._visDatasets : this._visDatasets = this.datasets.filter(function (v) {
                            return !!v.display;
                        });
                    }
                    // Can not reset

                    , set: function set(val) {}
                }]);

                return WxChart;
            }();

            exports.default = WxChart;
        }, { "../core/layout": 6, "../util/helper": 13, "../util/wxCanvas": 16 }], 5: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _helper = require('../util/helper');

            var _layout = require('./layout');

            var _wxChart = require('../charts/wxChart');

            var _wxChart2 = _interopRequireDefault(_wxChart);

            var _wxCanvas = require('../util/wxCanvas');

            var _wxCanvas2 = _interopRequireDefault(_wxCanvas);

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            // The basic component
            var WxBaseComponent = function () {
                function WxBaseComponent(wxChart, config) {
                    _classCallCheck(this, WxBaseComponent);

                    var me = this;

                    if (!wxChart || !wxChart instanceof _wxChart2.default) {
                        throw new Error('Should be an WxChart instance');
                    }
                    me.wxChart = wxChart;

                    // scale set options
                    this._datasets = [];

                    return me;
                }

                /**
                 * Initialize datasets and options
                 * @param {Object[]} datasets
                 * @param {Object} [defaultOptions]
                 * @returns {Array|*}
                 */

                _createClass(WxBaseComponent, [{
                    key: 'init',
                    value: function init(datasets) {
                        var defaultOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                        var me = this;

                        if (_helper.is.Undefined(datasets) || _helper.is.Null(datasets)) {
                            datasets = me.datasets;
                            if (!datasets) {
                                throw new Error('Datasets is null');
                            }
                        }

                        if (!_helper.is.Array(datasets)) {
                            datasets = [datasets];
                        }

                        datasets = datasets.map(function (dataset) {
                            return (0, _helper.extend)({}, defaultOptions, dataset);
                        });

                        me._datasets = datasets;
                        me._visDatasets = null;
                        return me._datasets;
                    }

                    /**
                     * Update data and re-draw
                     * @param {Object[]} datasets
                     * @param {BoxInstance} [area]
                     * @param {Object} [config]
                     */

                }, {
                    key: 'update',
                    value: function update(datasets, area) {
                        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config;

                        var me = this;

                        me.clear();
                        if (!datasets) {
                            return;
                        }
                        datasets = me.init(datasets);

                        if (area && area instanceof _layout.BoxInstance) {
                            area = me.box = me.calculateBox(area, datasets, config);
                        } else if (me.box) {
                            area = me.box;
                        } else {
                            return;
                        }

                        if (me.isVisiable()) {
                            me.draw(datasets, area, config);
                        }
                    }

                    /**
                     * Calculate occupied space
                     * @param {Object[]} [datasets] - datasets
                     * @param {BoxInstance} [area] - Current box area
                     * @param {Object} [config]
                     * @returns {BoxInstance}
                     */

                }, {
                    key: 'calculateBox',
                    value: function calculateBox(area) {
                        var datasets = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.datasets;
                        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config;

                        return area;
                    }

                    /**
                     * Set an occupied space for component
                     * @param {BoxInstance} box - New box
                     * @param {Boolean} [redraw=true] - Re-draw the component
                     */

                }, {
                    key: 'setBox',
                    value: function setBox(box) {
                        var redraw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                        var me = this;
                        if (redraw) {
                            me.clear();
                        }
                        if (box && box instanceof _layout.BoxInstance) {
                            me.box = box;
                        }
                        if (redraw && me.isVisiable()) {
                            me.draw();
                        }
                    }

                    /**
                     * Draw the component
                     *
                     * @param {Object[]} [datasets] - datasets
                     * @param {BoxInstance} [box] - Current box area
                     * @param {Object} [config]
                     */

                }, {
                    key: 'draw',
                    value: function draw() {
                        var datasets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.datasets;
                        var box = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.box;
                        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config;
                    }
                    /**
                     * Clear canvas in component's box
                     */

                }, {
                    key: 'clear',
                    value: function clear() {
                        var me = this;
                        if (me.box) {
                            me.wxChart.ctx.clearRect(me.box.x, me.box.y, me.box.outerWidth, me.box.outerHeight);
                            me.wxChart.ctx.draw();
                        }
                    }
                }, {
                    key: 'isVisiable',
                    value: function isVisiable() {
                        return !!this.config.display;
                    }
                }, {
                    key: 'isHorizontal',
                    value: function isHorizontal() {
                        return this.position == 'top' || this.position == 'bottom';
                    }
                }, {
                    key: 'datasets',
                    get: function get() {
                        return this._datasets;
                    },
                    set: function set(datasets) {
                        return this.update(datasets);
                    }

                    /**
                     * Get visible ticks
                     */

                }, {
                    key: 'visDatasets',
                    get: function get() {
                        return this._visDatasets ? this._visDatasets : this._visDatasets = this.datasets.filter(function (v) {
                            return !!v.display;
                        });
                    }
                    // Can not reset

                    , set: function set(val) {}
                }, {
                    key: 'position',
                    get: function get() {
                        return this.config.position;
                    },
                    set: function set(value) {
                        this.config.position = value;
                        return this.update();
                    }
                }]);

                return WxBaseComponent;
            }();

            exports.default = WxBaseComponent;
        }, { "../charts/wxChart": 4, "../util/helper": 13, "../util/wxCanvas": 16, "./layout": 6 }], 6: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.BoxInstance = undefined;

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _base = require('./base');

            var _base2 = _interopRequireDefault(_base);

            var _helper = require('../util/helper');

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            /**
             * A box model description
             * @typedef {Object} BoxInstance
             * @property {number} x - The x point.
             * @property {number} y - The y point.
             * @property {number} width - Inner width (context only, not calculate padding and margin)
             * @property {number} height - Inner height (context only, not calculate padding and margin)
             * @property {number} outerWidth - Outer width
             * @property {number} outerHeight - Outer height
             *
             * @description
             * (x,y) -------------------------- (ex, y)
             *   |                                 |
             *   |    (lx,ly)-------------(rx,ly)  |
             *   |      |                    |     |
             *   |      |                    |     |
             *   |    (lx,ry)-------------(rx,ry)  |
             *   |                                 |
             * (x,ey) ------------------------- (ex, ey)
             */
            var BoxInstance = exports.BoxInstance = function () {
                function BoxInstance(position, x, y, width, height, outerWidth, outerHeight) {
                    _classCallCheck(this, BoxInstance);

                    var me = this;
                    if (_helper.is.PureObject(position)) {
                        var opt = position;

                        position = opt.position;
                        x = opt.x;
                        y = opt.y;
                        width = opt.width;
                        height = opt.height;

                        var padding = opt.padding,
                            margin = opt.margin;
                        if (_helper.is.Number(padding) && _helper.is.Number(margin)) {
                            outerWidth = width + padding * 2 + margin * 2;
                            outerHeight = height + padding * 2 + margin * 2;
                        } else {
                            outerWidth = opt.outerWidth;
                            outerHeight = opt.outerHeight;
                        }
                    }

                    me.position = position;
                    me.width = width;
                    me.height = height;
                    me.outerWidth = outerWidth;
                    me.outerHeight = outerHeight;

                    Object.defineProperty(this, 'x', {
                        get: function get() {
                            return x;
                        },
                        set: function set(value) {
                            me.width += x - value;
                            me.outerWidth += x - value;
                            x = value;
                        }
                    });

                    Object.defineProperty(this, 'y', {
                        get: function get() {
                            return y;
                        },
                        set: function set(value) {
                            me.height += y - value;
                            me.outerHeight += y - value;
                            y = value;
                        }
                    });
                }

                /**
                 * The x,y in right-bottom
                 */

                _createClass(BoxInstance, [{
                    key: 'clone',

                    /**
                     * Clone this box and return an new Instance
                     * @returns {BoxInstance}
                     */
                    value: function clone() {
                        var me = this;
                        return new BoxInstance(me.position, me.x, me.y, me.width, me.height, me.outerWidth, me.outerHeight);
                    }

                    /**
                     * Check whether intersect with other BoxInstance
                     */

                }, {
                    key: 'isIntersect',
                    value: function isIntersect(boxInstance) {
                        var me = this;
                        return !(me.ex < boxInstance.x || me.x > boxInstance.ex || me.ey < boxInstance.y || me.y < boxInstance.ey);
                    }
                }, {
                    key: 'toObject',
                    value: function toObject() {
                        return {
                            position: this.position,
                            x: this.x,
                            y: this.y,
                            ex: this.ex,
                            ey: this.ey,
                            lx: this.lx,
                            ly: this.ly,
                            rx: this.rx,
                            ry: this.ry,
                            width: this.width,
                            height: this.height,
                            outerHeight: this.outerHeight,
                            outerWidth: this.outerWidth
                        };
                    }
                }, {
                    key: 'ex',
                    get: function get() {
                        return this.x + this.outerWidth;
                    }
                }, {
                    key: 'ey',
                    get: function get() {
                        return this.y + this.outerHeight;
                    }
                    /**
                     * The x,y in content
                     */

                }, {
                    key: 'lx',
                    get: function get() {
                        return this.x + this.marginLR;
                    }
                }, {
                    key: 'ly',
                    get: function get() {
                        return this.y + this.marginTB;
                    }
                }, {
                    key: 'rx',
                    get: function get() {
                        return this.x + this.width + this.marginLR;
                    }
                }, {
                    key: 'ry',
                    get: function get() {
                        return this.y + this.height + this.marginTB;
                    }
                }, {
                    key: 'marginLR',
                    get: function get() {
                        return (this.outerWidth - this.width) / 2;
                    },
                    set: function set(value) {
                        if (_helper.is.Number(value)) {
                            this.width -= value * 2;
                        }
                    }
                }, {
                    key: 'marginTB',
                    get: function get() {
                        return (this.outerHeight - this.height) / 2;
                    },
                    set: function set(value) {
                        if (_helper.is.Number(value)) {
                            this.height -= value * 2;
                        }
                    }
                }]);

                return BoxInstance;
            }();
            /**
             * @class WxLayout
             * Find the best box area of items
             */

            var WxLayout = function () {
                function WxLayout(wxChart) {
                    _classCallCheck(this, WxLayout);

                    var me = this;

                    if (!wxChart || !wxChart instanceof _base2.default) {
                        throw new Error('Should be an WxChart instance');
                    }
                    me.wxChart = wxChart;
                    //me.initBox = wx.wxChart.innerBox.clone();
                    me._boxs = [];
                }

                /**
                 * Add an boxInstance
                 * @param {BoxInstance} boxInstance
                 * @returns {number} The box id
                 */

                _createClass(WxLayout, [{
                    key: 'addBox',
                    value: function addBox(boxInstance) {
                        var me = this;
                        if (!boxInstance instanceof BoxInstance) {
                            throw new Error('Please add an BoxInstance Object');
                        }
                        return parseInt(me._boxs.push(boxInstance)) - 1;
                    }

                    /**
                     * Remove an boxInstance
                     * @param {(BoxInstance|number)} boxId - The box id
                     */

                }, {
                    key: 'removeBox',
                    value: function removeBox(boxId) {
                        var me = this;
                        if (_helper.is.Number(boxId)) {
                            me._boxs.splice(boxId, 1);
                        } else if (boxId instanceof BoxInstance) {
                            me._boxs.splice(me._boxs.indexOf(boxId), 1);
                        }
                    }
                }, {
                    key: 'removeAllBox',
                    value: function removeAllBox() {
                        this._boxs = [];
                    }
                }, {
                    key: 'adjustBox',
                    value: function adjustBox() {
                        var me = this;
                        var box = me.wxChart.innerBox.clone();
                        me._boxs.forEach(function (boxInstance) {
                            var position = boxInstance.position,
                                x = boxInstance.x,
                                y = boxInstance.y,
                                height = boxInstance.height,
                                width = boxInstance.width,
                                outerWidth = boxInstance.outerWidth,
                                outerHeight = boxInstance.outerHeight;

                            switch (position) {
                                case 'top':
                                    box.y += outerHeight;
                                    break;
                                case 'bottom':
                                    box.outerHeight -= outerHeight;
                                    box.height -= outerHeight;
                                    break;
                                case 'left':
                                    box.x += outerWidth;
                                    break;
                                case 'right':
                                    box.outerWidth -= outerWidth;
                                    box.width -= outerWidth;
                                    break;
                            }
                        });
                        return box;
                    }
                }]);

                return WxLayout;
            }();

            exports.default = WxLayout;
        }, { "../util/helper": 13, "./base": 5 }], 7: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
                return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
            } : function (obj) {
                return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
            };

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _get = function get(object, property, receiver) {
                if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
                    var parent = Object.getPrototypeOf(object);if (parent === null) {
                        return undefined;
                    } else {
                        return get(parent, property, receiver);
                    }
                } else if ("value" in desc) {
                    return desc.value;
                } else {
                    var getter = desc.get;if (getter === undefined) {
                        return undefined;
                    }return getter.call(receiver);
                }
            };

            var _base = require('./base');

            var _base2 = _interopRequireDefault(_base);

            var _helper = require('../util/helper');

            var _layout = require('./layout');

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                }return call && ((typeof call === "undefined" ? "undefined" : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
            }

            function _inherits(subClass, superClass) {
                if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof2(superClass)));
                }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
            }

            // Legend default config
            var WX_LEGEND_DEFAULT_CONFIG = {
                display: true,
                /**
                 * position can set to :top, bottom, left(same as left bottom), right(same as right bottom), left top, left bottom, right top, right bottom
                 */
                position: 'top',
                fullWidth: true, // if the fullWidth is false, the 'width' property should be existed.
                labels: {
                    boxWidth: 30,
                    fontSize: 11,
                    padding: 10 // Padding width between legend items
                }
            };

            //
            // The datasets is an empty array at the first time
            // When you set 'data' attribute, the legend items will draw on Canvas
            // Format
            // {
            //    text: 'Displayed Text String',
            //    fillAlpha: 1, // Global fill alpha
            //    fillStyle: 'Color', // Fill style of the legend box
            //    display: Boolean, // If true, this item represents a hidden datasets. Label will be rendered with a strike-through effect,
            //    strokeStyle: 'Color'
            //    lineCap: String,
            //    lineJoin: String,
            //    lineWidth: Number
            // }
            var WX_LEGEND_DEFAULT_ITEM_CONFIG = {
                'lineWidth': 1,
                'display': true
            };

            var WxLegend = function (_WxBaseComponent) {
                _inherits(WxLegend, _WxBaseComponent);

                function WxLegend(wxChart, config) {
                    _classCallCheck(this, WxLegend);

                    var _this = _possibleConstructorReturn(this, (WxLegend.__proto__ || Object.getPrototypeOf(WxLegend)).call(this, wxChart, config));

                    _this.config = (0, _helper.extend)(true, {}, WX_LEGEND_DEFAULT_CONFIG, config);
                    return _this;
                }

                _createClass(WxLegend, [{
                    key: 'init',
                    value: function init(datasets) {
                        var defaultOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : WX_LEGEND_DEFAULT_ITEM_CONFIG;

                        var me = this;
                        var config = me.config;

                        datasets = _get(WxLegend.prototype.__proto__ || Object.getPrototypeOf(WxLegend.prototype), 'init', this).call(this, datasets, defaultOptions);
                        // Reset legendBox
                        // Calculate the legend items
                        datasets = me.calculateLegendItem(datasets, config);

                        me._datasets = datasets;

                        return datasets;
                    }
                }, {
                    key: 'calculateLegendItem',
                    value: function calculateLegendItem(datasets, config) {
                        var me = this;
                        var labelsConfig = config.labels || {};

                        var ctx = me.wxChart.ctx;
                        var boxWidth = labelsConfig.boxWidth;
                        var fontSize = labelsConfig.fontSize;
                        if (!_helper.is.Array(datasets) && _helper.is.PureObject(datasets)) {
                            datasets = [datasets];
                        }

                        datasets = datasets.map(function (dataset) {
                            var textWidth = ctx.measureText(dataset.text).width;

                            var width = boxWidth + fontSize / 2 + textWidth;
                            dataset._prop = {
                                'fontSize': fontSize,
                                'boxHeight': fontSize,
                                'boxWidth': boxWidth,
                                'textWidth': textWidth,
                                'width': width
                            };
                            return dataset;
                        });

                        return datasets;
                    }
                }, {
                    key: 'calculateBox',
                    value: function calculateBox(area) {
                        var datasets = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.datasets;
                        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config;

                        var me = this;
                        var outerWidth = void 0,
                            outerHeight = void 0,
                            width = void 0,
                            height = void 0;
                        var wxChart = me.wxChart,
                            ctx = wxChart.ctx,
                            fontSize = ctx.fontSize;
                        var x = area.x,
                            y = area.y;
                        var padding = config.labels.padding || 10;

                        if (me.isHorizontal()) {
                            (function () {
                                width = !!config.fullWidth ? area.width - padding * 2 : config.width;
                                outerWidth = !!config.fullWidth ? area.width : config.width;
                                height = fontSize;
                                outerHeight = height + padding * 2;

                                // Calculate all items
                                var lineNum = 0,
                                    currentLineWidth = 0,
                                    maxLineWidth = 0;
                                datasets.forEach(function (dataset) {
                                    var prop = dataset._prop,
                                        outerWidth = prop.width + padding;
                                    var lineWidth = currentLineWidth + outerWidth;
                                    if (lineWidth > width) {
                                        // The previous line width
                                        maxLineWidth = maxLineWidth < currentLineWidth ? currentLineWidth : maxLineWidth;
                                        // We should take a new line
                                        lineNum++;
                                        // Set currentLineWidth = 0
                                        currentLineWidth = outerWidth;

                                        // The first item width insufficient..
                                        if (outerWidth > width) {
                                            // The width options is tooooo small!
                                            console.warn('The width options is too small! width=', width, '.The chart will set to ', lineWidth);
                                            width = outerWidth;
                                        }
                                    } else {
                                        currentLineWidth += outerWidth;
                                    }

                                    prop.padding = padding;
                                    prop.lineNum = lineNum;
                                    prop.outerWidth = outerWidth;
                                });
                                maxLineWidth = maxLineWidth < currentLineWidth ? currentLineWidth : maxLineWidth;

                                // Re calculate the height of legend
                                if (lineNum > 0) {
                                    height = fontSize * (lineNum + 1) + lineNum * fontSize / 2;
                                    outerHeight = height + padding * 2;
                                }

                                x += (width - maxLineWidth) / 2;
                                if (me.position == 'bottom') {
                                    y = area.ry - outerHeight;
                                    y = y < area.y ? area.y : y;
                                }
                            })();
                        } else {
                            var _ret2 = function () {
                                var position = me.position.match(/left/) ? 'left' : 'right';
                                var align = me.position.match(/top/) ? 'top' : 'bottom';
                                var width = 0,
                                    lineNum = 0;
                                datasets.forEach(function (dataset) {
                                    var wh = dataset._prop.width;
                                    width = width < wh ? wh : width;

                                    dataset._prop.padding = padding;
                                    dataset._prop.lineNum = lineNum;
                                    // not use to set prop.outerWidth
                                    dataset._prop.outerWidth = null;
                                    lineNum++;
                                });
                                outerWidth = width + padding * 2;
                                height = fontSize * (lineNum + 1) + lineNum * padding / 2;
                                outerHeight = height + padding * 2;

                                if (align == 'bottom') {
                                    y = area.ry - outerHeight;
                                    y = y < area.y ? area.y : y;
                                }
                                if (position == 'right') {
                                    x = area.rx - outerWidth;
                                    x = x < 0 ? 0 : x;
                                }
                                return {
                                    v: new _layout.BoxInstance({
                                        position: position,
                                        x: x,
                                        y: y,
                                        width: width,
                                        outerWidth: outerWidth,
                                        height: height,
                                        outerHeight: outerHeight
                                    })
                                };
                            }();

                            if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
                        }

                        return new _layout.BoxInstance({
                            position: config.position,
                            x: x,
                            y: y,
                            width: width,
                            outerWidth: outerWidth,
                            height: height,
                            outerHeight: outerHeight
                        });
                    }
                }, {
                    key: 'draw',
                    value: function draw() {
                        var datasets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.datasets;
                        var box = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.box;
                        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config;

                        var me = this,
                            ctx = me.wxChart.ctx;
                        var x = box.x,
                            y = box.y,
                            width = box.width,
                            outerWidth = box.outerWidth,
                            height = box.height,
                            outerHeight = box.outerHeight;

                        // Clear the area of legend

                        me.clear();

                        // Begin a new sub-context
                        ctx.save();
                        // Draw all items
                        var currentLineNum = -1;
                        var currentX = x,
                            currentY = y;
                        datasets.forEach(function (dataset) {
                            var text = dataset.text,
                                display = dataset.display,
                                fillStyle = dataset.fillStyle,
                                fillAlpha = dataset.fillAlpha,
                                strokeStyle = dataset.strokeStyle,
                                lineCap = dataset.lineCap,
                                lineJoin = dataset.lineJoin,
                                lineWidth = dataset.lineWidth;
                            var _dataset$_prop = dataset._prop,
                                width = _dataset$_prop.width,
                                fontSize = _dataset$_prop.fontSize,
                                textWidth = _dataset$_prop.textWidth,
                                padding = _dataset$_prop.padding,
                                lineNum = _dataset$_prop.lineNum,
                                boxWidth = _dataset$_prop.boxWidth,
                                boxHeight = _dataset$_prop.boxHeight,
                                outerWidth = _dataset$_prop.outerWidth;

                            if (!width) {
                                // No need to draw
                                return;
                            }

                            // Set style
                            ctx.textBaseline = 'top';
                            ctx.textAlign = 'start';
                            ctx.fillStyle = fillStyle;
                            ctx.fontSize = fontSize;
                            ctx.strokeStyle = strokeStyle;
                            ctx.lineCap = lineCap;
                            ctx.lineJoin = lineJoin;
                            ctx.lineWidth = lineWidth;

                            if (currentLineNum < lineNum) {
                                currentLineNum = lineNum;
                                currentX = x + padding;
                                currentY = y + lineNum * fontSize * 1.5 + padding;
                            }
                            var thisX = currentX;
                            // draw rect
                            if (ctx.lineWidth != 0) {
                                ctx.strokeRect(currentX, currentY, boxWidth, boxHeight);
                            }
                            ctx.globalAlpha = fillAlpha;
                            ctx.fillRect(currentX, currentY, boxWidth, boxHeight);
                            ctx.globalAlpha = 1;

                            // draw text
                            currentX += boxWidth + fontSize / 2;
                            ctx.fillText(text, currentX, currentY);

                            // draw hidden strike through
                            if (!display) {
                                ctx.save();
                                // Strike through the text if hidden
                                ctx.beginPath();
                                ctx.lineWidth = 1;
                                ctx.moveTo(currentX, currentY + fontSize / 2);
                                ctx.lineTo(currentX + textWidth, currentY + fontSize / 2);
                                ctx.stroke();
                                ctx.restore();
                            }

                            currentX = thisX + outerWidth;
                        });
                        ctx.restore();

                        ctx.draw();
                    }
                }]);

                return WxLegend;
            }(_base2.default);

            exports.default = WxLegend;
        }, { "../util/helper": 13, "./base": 5, "./layout": 6 }], 8: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _get = function get(object, property, receiver) {
                if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
                    var parent = Object.getPrototypeOf(object);if (parent === null) {
                        return undefined;
                    } else {
                        return get(parent, property, receiver);
                    }
                } else if ("value" in desc) {
                    return desc.value;
                } else {
                    var getter = desc.get;if (getter === undefined) {
                        return undefined;
                    }return getter.call(receiver);
                }
            };

            var _helper = require('../util/helper');

            var _wxCanvas = require('../util/wxCanvas');

            var _wxCanvas2 = _interopRequireDefault(_wxCanvas);

            var _layout = require('./layout');

            var _base = require('./base');

            var _base2 = _interopRequireDefault(_base);

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                }return call && ((typeof call === "undefined" ? "undefined" : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
            }

            function _inherits(subClass, superClass) {
                if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof2(superClass)));
                }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
            }

            // Scale default config
            var WX_SCALE_DEFAULT_CONFIG = {
                display: true,
                position: 'top', // left, bottom, right, top
                extendLeft: 0,
                extendTop: 0,
                title: undefined,
                titleFontSize: 12,
                titleFontColor: '#4c4d4d',
                //'lineSpace' = fontSize * 0.5'
                color: '#000000', // Line color
                lineWidth: 1,

                gridLines: {
                    display: true,
                    color: '#e0e0e0', // Line color
                    lineWidth: 1
                },

                ticks: {
                    display: true,
                    autoSkip: true,
                    lineWidth: 1,
                    fontColor: '#000000',
                    fontSize: 11,
                    minRotation: 0,
                    maxRotation: 90

                    //maxTicksLimit: null,
                }
            };

            var WX_SCALE_DEFAULT_ITEM_CONFIG = {
                display: true,
                // text: '',
                lineWidth: 1,
                fontColor: '#000000'
            };

            // The WeinXin APP scale

            var WxScale = function (_WxBaseComponent) {
                _inherits(WxScale, _WxBaseComponent);

                function WxScale(wxChart, config) {
                    _classCallCheck(this, WxScale);

                    var _this = _possibleConstructorReturn(this, (WxScale.__proto__ || Object.getPrototypeOf(WxScale)).call(this, wxChart, config));

                    _this.config = (0, _helper.extend)(true, {}, WX_SCALE_DEFAULT_CONFIG, config);
                    return _this;
                }

                /**
                 * Get visible tick's text data
                 */

                _createClass(WxScale, [{
                    key: 'getTicksText',
                    value: function getTicksText(tick) {
                        if (!!tick && !!tick.text) {
                            return tick.format ? tick.format.call(tick, tick.text, tick) : tick.text;
                        }
                        return null;
                    }

                    /**
                     * Get lineSpace
                     * @returns {*|number}
                     */

                }, {
                    key: 'longestText',

                    /**
                     * Get longest text
                     */
                    value: function longestText() {
                        var ctx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.wxChart.ctx;
                        var datasets = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.datasets;

                        var me = this;
                        var maxTextLen = 0;
                        datasets.forEach(function (dataset) {
                            if (!!dataset.display) {
                                var textWidth = void 0;
                                if (dataset.textWidth) {
                                    textWidth = dataset.textWidth;
                                } else {
                                    var text = me.getTicksText(dataset);
                                    textWidth = ctx.measureText(text).width;
                                    dataset.textWidth = textWidth;
                                }
                                maxTextLen = maxTextLen < textWidth ? textWidth : maxTextLen;
                            }
                        });
                        return maxTextLen;
                    }
                }, {
                    key: 'calculateFixPadding',
                    value: function calculateFixPadding(datasets, config) {
                        var me = this,
                            ctx = me.wxChart.ctx;
                        if (config.fixPadding) {
                            return config.fixPadding;
                        }
                        if (me.isHorizontal()) {
                            var visTicks = me.visDatasets;
                            var firstTickText = me.getTicksText(visTicks[0]),
                                lastTickText = me.getTicksText(visTicks[visTicks.length - 1]);
                            return Math.max(ctx.measureText(firstTickText).width, ctx.measureText(lastTickText).width);
                        } else {
                            return ctx.fontSize;
                        }
                    }
                }, {
                    key: 'init',
                    value: function init(datasets) {
                        var defaultOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : WX_SCALE_DEFAULT_ITEM_CONFIG;

                        var me = this;
                        var config = me.config;

                        datasets = _get(WxScale.prototype.__proto__ || Object.getPrototypeOf(WxScale.prototype), 'init', this).call(this, datasets, defaultOptions);
                        me.visDatasets = null;
                        me._datasets = datasets;
                        me.fixPadding = me.calculateFixPadding(datasets, config);

                        return datasets;
                    }
                }, {
                    key: 'calculateBox',
                    value: function calculateBox(area) {
                        var datasets = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.datasets;
                        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config;

                        var me = this,
                            ctx = me.wxChart.ctx;
                        var fontSize = ctx.fontSize;
                        var tickWidth = me.calculateTickWidth(datasets, area, config);
                        var x = void 0,
                            y = void 0,
                            minWidth = void 0,
                            minHeight = void 0,
                            maxWidth = void 0,
                            maxHeight = void 0;
                        var minFontRotation = (0, _helper.toRadians)(config.ticks.minRotation || 0),
                            maxFontRotation = (0, _helper.toRadians)(config.ticks.maxRotation || 90),
                            fontRadians = minFontRotation;
                        var lineSpace = me.lineSpace;
                        var lineWidth = 1;

                        var longestText = me.longestText();
                        if (me.isHorizontal()) {
                            if (longestText > tickWidth) {
                                // Ticket's width not satisfied with the longest text's width
                                if (tickWidth <= ctx.fontSize) {
                                    fontRadians = maxFontRotation;
                                } else {
                                    fontRadians = Math.acos(tickWidth / longestText);
                                    minHeight = Math.sin(fontRadians) * longestText + lineWidth + lineSpace + fontSize / 2;
                                    if (minHeight > area.height) {
                                        minHeight = area.height;
                                        fontRadians = Math.asin((minHeight - lineWidth - lineSpace - fontSize / 2) / longestText);
                                    } else if (fontRadians > maxFontRotation) {
                                        fontRadians = maxFontRotation;
                                        minHeight = Math.sin(fontRadians) * longestText + lineWidth + lineSpace + fontSize / 2;
                                    }
                                }
                            } else {
                                minHeight = fontSize * 1.5 + lineWidth + lineSpace;
                            }
                            minWidth = area.width;
                            maxWidth = area.outerWidth;
                            maxHeight = minHeight;
                        } else {
                            var titleWidth = 0;
                            if (config.title) {
                                titleWidth = ctx.measureText(config.title, config.titleFontSize).width - lineWidth - lineSpace - fontSize / 2;
                            }
                            minWidth = longestText + lineWidth + lineSpace + fontSize / 2;
                            minWidth = minWidth > titleWidth ? minWidth : titleWidth;
                            if (minWidth > area.width) {
                                minWidth = area.width;
                                fontRadians = Math.acos((minWidth - lineWidth - lineSpace - fontSize / 2) / longestText);
                                fontRadians = fontRadians > maxFontRotation ? maxFontRotation : fontRadians;
                            }
                            minHeight = area.height;
                            maxWidth = minWidth;
                            maxHeight = area.outerHeight;
                        }
                        switch (me.position) {
                            case 'left':
                            case 'top':
                                x = area.x;
                                y = area.y;
                                break;
                            case 'right':
                                x = area.x + area.width - maxWidth;
                                y = area.y;
                                break;
                            case 'bottom':
                                x = area.x;
                                y = area.y + area.height - maxHeight;
                                break;
                        }

                        me.fontRadians = fontRadians;
                        return new _layout.BoxInstance(me.position, x, y, minWidth, minHeight, maxWidth, maxHeight);
                    }
                }, {
                    key: 'calculateTickWidth',

                    /**
                     * Calculate ticks' separation distance
                     * @param {BoxInstance} [area=this.box]
                     *
                     *
                     * Horizontal Scale:
                     * x------------------------------------.--x(first tick)--------------------------.--x(last tick)--margin--x
                     * x------------------------------------.--x(first tick)-----x(last tick)--margin-.--x--titleWidth+padding--
                     * |---extendLeft---|(box.x)---margin---|-----------area.width----------------------|---------margin------|
                     *                  |----------------------------area box-------------------------------------------------|
                     * Vertical Scale:
                     * x----------------------------------------.--x--------(first tick)----------.--x(last tick)-x
                     * x------------------titleHeight+padding---.--x---margin-x-------(first tick).--x(last tick)-x
                     * |---extendTop----|(box.y)---margin-------|-----------area.height--------------|---margin---|
                     *                  |----------------------------area box-------------------------------------|
                     */
                    value: function calculateTickWidth() {
                        var datasets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.datasets;
                        var area = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.box;
                        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config;

                        var me = this,
                            ticketWidth = void 0;
                        var visTicks = me.visDatasets;
                        var defaultLineWidth = config.ticks.lineWidth;
                        // total line width
                        var totalLineWidth = _helper.sum.apply(null, visTicks.map(function (v) {
                            return v.lineWidth || defaultLineWidth;
                        }));
                        var fixPadding = me.fixPadding;

                        if (me.isHorizontal()) {
                            var innerWidth = area.width,
                                marginLR = area.marginLR;
                            var titleWidth = me.calculateTitleWidth();
                            var extendLeft = me.config.extendLeft;
                            if (marginLR !== 0) {
                                totalLineWidth += defaultLineWidth * 2;
                            } else if (extendLeft !== 0) {
                                totalLineWidth += defaultLineWidth;
                            }
                            ticketWidth = (innerWidth - titleWidth - totalLineWidth - fixPadding) / (visTicks.length - 1);
                        } else {
                            var innerHeight = area.height,
                                marginTB = area.marginTB;
                            var titleHeight = me.calculateTitleWidth();
                            var extendTop = config.extendTop;
                            if (marginTB !== 0) {
                                totalLineWidth += defaultLineWidth * 2;
                            } else if (extendTop !== 0) {
                                totalLineWidth += defaultLineWidth;
                            }
                            ticketWidth = (innerHeight - titleHeight - totalLineWidth - fixPadding) / (visTicks.length - 1);
                        }
                        return ticketWidth;
                    }
                }, {
                    key: 'calculateTitleWidth',
                    value: function calculateTitleWidth() {
                        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.config;

                        var titleWidth = void 0,
                            me = this,
                            ctx = me.wxChart.ctx;
                        if (me.isHorizontal()) {
                            titleWidth = config.title ? ctx.measureText(config.title, config.titleFontSize).width : 0;
                        } else {
                            titleWidth = config.title ? config.titleFontSize : 0;
                        }
                        return titleWidth;
                    }
                }, {
                    key: '_getTicksLineWidthOffset',
                    value: function _getTicksLineWidthOffset(index, visTicks) {
                        var offset = 0,
                            me = this;
                        if (!visTicks) {
                            visTicks = me.visDatasets;
                        }
                        var defaultLineWidth = this.config.ticks.lineWidth;
                        visTicks.map(function (tick, i) {
                            if (index >= i) {
                                offset += tick.lineWidth || defaultLineWidth;
                            }
                        });
                        return offset;
                    }

                    /**
                     * Get position of ticket
                     * @param {number} index - Begin from zero. If set -1, the function will return the actual x,y included extendLeft or extendTop
                     * @param {number} [ticketWidth=this.ticketWidth]
                     * @param {BoxInstance} [area=this.box]
                     */

                }, {
                    key: 'getTicksPosition',
                    value: function getTicksPosition(index, ticketWidth) {
                        var area = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.box;

                        var me = this,
                            ctx = me.wxChart.ctx;
                        var fixPadding = me.fixPadding;
                        if (!ticketWidth) {
                            ticketWidth = me.calculateTickWidth();
                        }
                        var visTicks = me.visDatasets;

                        var baseX = void 0,
                            baseY = void 0;
                        if (me.isHorizontal()) {
                            baseX = index === -1 ? area.x - me.config.extendLeft + fixPadding / 2 + (me.config.extendLeft ? me.config.ticks.lineWidth : 0) : area.lx + me._getTicksLineWidthOffset(index, visTicks) + ticketWidth * index + fixPadding / 2;
                            baseY = me.position === 'top' ? area.ry - me.lineSpace : area.ly + me.lineSpace;
                        } else {
                            baseY = index === -1 ? area.y - me.config.extendTop + fixPadding / 2 + (me.config.extendTop ? me.config.ticks.lineWidth : 0) : area.ly + me.calculateTitleWidth() + me._getTicksLineWidthOffset(index, visTicks) + ticketWidth * index + fixPadding / 2;
                            baseX = me.position === 'left' ? area.rx - me.lineSpace : area.lx + me.lineSpace;
                        }
                        return { x: baseX, y: baseY };
                    }
                }, {
                    key: '_initDrawATickText',
                    value: function _initDrawATickText() {
                        var me = this,
                            ctx = me.wxChart.ctx;
                        switch (me.position) {
                            case 'left':
                                ctx.textAlign = 'end';
                                ctx.textBaseline = 'middle';
                                break;
                            case 'right':
                                ctx.textAlign = 'start';
                                ctx.textBaseline = 'middle';
                                break;
                            case 'top':
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'alphabetic';
                                break;
                            case 'bottom':
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'top';
                                break;
                        }
                    }
                }, {
                    key: '_drawATickLine',
                    value: function _drawATickLine(x, y, fontSize) {
                        var tick = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

                        var me = this,
                            ctx = me.wxChart.ctx;
                        var lineSpace = me.lineSpace;
                        var sx = x;
                        var sy = y;
                        switch (me.position) {
                            case 'left':
                                sx += lineSpace;
                                break;
                            case 'right':
                                sx -= lineSpace;
                                break;
                            case 'top':
                                sy += lineSpace;
                                break;
                            case 'bottom':
                                sy -= lineSpace;
                                break;
                        }
                        ctx.beginPath();
                        ctx.moveTo(sx, sy);
                        ctx.lineTo(x, y);
                        ctx.stroke();

                        // Draw text
                        var text = void 0;
                        if (tick && tick.text && _helper.is.String(tick.text)) {
                            ctx.save();
                            me._initDrawATickText();
                            text = tick.format ? tick.format.call(me, tick.text, tick, x, y, me.fontRadians) : tick.text;
                            var textWidth = tick.textWidth ? tick.textWidth : ctx.measureText(text).width;
                            switch (me.position) {
                                case 'left':
                                    ctx.translate(x - fontSize / 2, y + Math.sin(me.fontRadians) * textWidth / 2);
                                    ctx.rotate(me.fontRadians);
                                    //ctx.fillText(text, x - ctx.fontSize/2, y);
                                    break;
                                case 'right':
                                    ctx.translate(x + fontSize / 2, y + Math.sin(me.fontRadians) * textWidth / 2);
                                    ctx.rotate(-me.fontRadians);
                                    // ctx.fillText(text, x + ctx.fontSize/2, y);
                                    break;
                                case 'top':
                                    ctx.translate(x, y - fontSize / 2);
                                    ctx.rotate(-me.fontRadians);
                                    break;
                                case 'bottom':
                                    ctx.translate(x, y + fontSize / 2);
                                    ctx.rotate(me.fontRadians);
                                    break;
                            }
                            ctx.fillText(text, 0, 0);

                            ctx.restore();
                        }
                    }
                }, {
                    key: 'draw',
                    value: function draw() {
                        var datasets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.datasets;
                        var box = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.box;
                        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config;

                        var me = this,
                            ctx = me.wxChart.ctx;
                        var fontSize = ctx.fontSize;
                        var fixPadding = me.fixPadding,
                            tickWidth = me.calculateTickWidth(datasets, box, config);
                        var tickConfig = config.ticks;
                        var x = box.x,
                            y = box.y,
                            width = box.width,
                            outerWidth = box.outerWidth,
                            height = box.height,
                            outerHeight = box.outerHeight;

                        var visTicks = me.visDatasets;

                        var _me$getTicksPosition = me.getTicksPosition(-1, tickWidth),
                            currX = _me$getTicksPosition.x,
                            currY = _me$getTicksPosition.y,
                            baseX = _me$getTicksPosition.x,
                            baseY = _me$getTicksPosition.y;

                        ctx.save();
                        ctx.fillStyle = tickConfig.fontColor;
                        ctx.fontSize = tickConfig.fontSize;
                        ctx.lineWidth = tickConfig.lineWidth;
                        var titleWidth = me.calculateTitleWidth();

                        if (me.isHorizontal()) {
                            // Draw the first point
                            if (me.box.marginLR || config.extendLeft) {
                                me._drawATickLine(currX, currY, fontSize);
                            }
                            // Move to first tick
                            currX = me.box.lx + fixPadding / 2;
                            // Draw ticks
                            visTicks.map(function (tick) {
                                currX += tick.lineWidth;
                                ctx.fillStyle = tick.fontColor;
                                ctx.lineWidth = tick.lineWidth;
                                ctx.fontSize = tick.fontSize || ctx.fontSize;
                                me._drawATickLine(currX, currY, fontSize, tick);
                                currX += tickWidth;
                            });
                            // Draw the last point
                            currX = me.box.ex - fixPadding / 2 - titleWidth;
                            if (me.box.marginLR) {
                                me._drawATickLine(currX, currY, fontSize);
                            }

                            ctx.fillStyle = tickConfig.fontColor;
                            ctx.lineWidth = config.lineWidth;
                            // draw axis line
                            ctx.beginPath();
                            ctx.moveTo(baseX, currY);
                            ctx.lineTo(currX, currY);
                            ctx.stroke();

                            if (config.title) {
                                ctx.save();
                                currX += fontSize / 2;
                                ctx.fontSize = config.titleFontSize;
                                ctx.textAlign = 'start';
                                ctx.textBaseline = 'bottom';
                                ctx.fillStyle = config.titleFontColor;
                                ctx.fillText(config.title, currX, currY);
                                ctx.restore();
                            }
                        } else {
                            if (config.title) {
                                ctx.save();
                                ctx.fontSize = config.titleFontSize;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';
                                ctx.fillStyle = config.titleFontColor;
                                ctx.fillText(config.title, currX, currY);
                                ctx.restore();
                            }

                            // Draw the first point
                            if (me.box.marginTB || config.extendTop) {
                                currY += titleWidth;
                                me._drawATickLine(currX, currY, fontSize);
                            }
                            currY = me.box.ly + fixPadding / 2 + titleWidth;
                            // Draw ticks
                            visTicks.map(function (tick) {
                                currY += tick.lineWidth;
                                ctx.fillStyle = tick.fontColor;
                                ctx.lineWidth = tick.lineWidth;
                                ctx.fontSize = tick.fontSize || ctx.fontSize;
                                me._drawATickLine(currX, currY, fontSize, tick);
                                currY += tickWidth;
                            });
                            // Draw the last point
                            currY = me.box.ey - fixPadding / 2;
                            if (me.box.marginTB) {
                                me._drawATickLine(currX, currY, fontSize);
                            }

                            ctx.fillStyle = tickConfig.fontColor;
                            ctx.lineWidth = config.lineWidth;
                            // draw axis line
                            ctx.beginPath();
                            ctx.moveTo(currX, baseY + titleWidth);
                            ctx.lineTo(currX, currY);
                            ctx.stroke();
                        }
                        ctx.draw();
                        ctx.restore();
                    }

                    // Empty interface
                    /**
                     * Get one point by a value
                     * @param {number} index - The index of category
                     */

                }, {
                    key: 'getPoint',
                    value: function getPoint(index) {
                        return null;
                    }
                }, {
                    key: 'lineSpace',
                    get: function get() {
                        var me = this;
                        if (me._lineSpace) {
                            return me._lineSpace;
                        }
                        me._lineSpace = this.config.lineSpace || this.wxChart.ctx.fontSize * 0.5;
                        return me._lineSpace;
                    }
                }]);

                return WxScale;
            }(_base2.default);

            exports.default = WxScale;
        }, { "../util/helper": 13, "../util/wxCanvas": 16, "./base": 5, "./layout": 6 }], 9: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _base = require('./base');

            var _base2 = _interopRequireDefault(_base);

            var _helper = require('../util/helper');

            var _layout = require('./layout');

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                }return call && ((typeof call === "undefined" ? "undefined" : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
            }

            function _inherits(subClass, superClass) {
                if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof2(superClass)));
                }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
            }

            // Legend default config
            var WX_TITLE_DEFAULT_CONFIG = {
                display: true,
                position: 'top', // top, bottom
                fullWidth: true, // if the fullWidth is false, the 'width' property should be existed.
                fontSize: 16,
                fontColor: '#666666',
                padding: 10
            };

            var WxTitle = function (_WxBaseComponent) {
                _inherits(WxTitle, _WxBaseComponent);

                function WxTitle(wxChart, config) {
                    _classCallCheck(this, WxTitle);

                    var _this = _possibleConstructorReturn(this, (WxTitle.__proto__ || Object.getPrototypeOf(WxTitle)).call(this, wxChart, config));

                    _this.config = (0, _helper.extend)(true, {}, WX_TITLE_DEFAULT_CONFIG, config);
                    return _this;
                }

                /**
                 * Update data and re-draw
                 * @param {Object[]} text
                 * @param {Object} [defaultOptions]
                 * @returns {string} text
                 */

                _createClass(WxTitle, [{
                    key: 'init',
                    value: function init(text) {
                        var defaultOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                        var me = this;
                        var config = me.config;

                        text = text ? text : config.text;
                        if (_helper.is.Undefined(text) || _helper.is.Null(text)) {
                            throw new Error('Text is null');
                        }

                        me._datasets = text;
                        return text;
                    }
                }, {
                    key: 'calculateBox',
                    value: function calculateBox(area) {
                        var datasets = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.config.text;
                        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config;

                        var me = this;
                        var wxChart = me.wxChart,
                            ctx = wxChart.ctx,
                            fontSize = config.fontSize || 16;
                        var x = area.x,
                            y = area.y;
                        var padding = config.padding || 10;

                        var width = !!config.fullWidth ? area.width - padding * 2 : config.width,
                            outerWidth = !!config.fullWidth ? area.width : config.width,
                            height = fontSize,
                            outerHeight = height + padding * 2;

                        if (config.position == 'bottom') {
                            y = area.ry - outerHeight;
                            y = y < area.y ? area.y : y;
                        }

                        return new _layout.BoxInstance({
                            position: config.position,
                            x: x,
                            y: y,
                            width: width,
                            height: height,
                            outerWidth: outerWidth,
                            outerHeight: outerHeight
                        });
                    }
                }, {
                    key: 'draw',
                    value: function draw() {
                        var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.config.text;
                        var box = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.box;
                        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config;

                        var me = this,
                            ctx = me.wxChart.ctx;
                        var x = box.x,
                            y = box.y,
                            width = box.width,
                            outerWidth = box.outerWidth,
                            height = box.height,
                            outerHeight = box.outerHeight;

                        if (_helper.is.Undefined(text) || _helper.is.Null(text)) {
                            throw new Error('Text is null');
                        }

                        var fontColor = config.fontColor,
                            fontSize = config.fontSize;
                        // Clear the area of legend

                        me.clear();
                        // Begin a new sub-context
                        ctx.save();

                        ctx.textBaseline = 'top';
                        ctx.textAlign = 'start';
                        ctx.fillStyle = fontColor;
                        ctx.fontSize = fontSize;

                        var textLen = ctx.measureText(text).width;
                        x += (width - textLen) / 2;
                        ctx.fillText(text, x, y);

                        ctx.restore();
                        ctx.draw();
                    }
                }]);

                return WxTitle;
            }(_base2.default);

            exports.default = WxTitle;
            ;
        }, { "../util/helper": 13, "./base": 5, "./layout": 6 }], 10: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _scale = require('../core/scale');

            var _scale2 = _interopRequireDefault(_scale);

            var _helper = require('../util/helper');

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                }return call && ((typeof call === "undefined" ? "undefined" : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
            }

            function _inherits(subClass, superClass) {
                if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof2(superClass)));
                }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
            }

            /**
             * @class Liner scale
             */
            var WxCategoryScale = function (_WxScale) {
                _inherits(WxCategoryScale, _WxScale);

                function WxCategoryScale() {
                    _classCallCheck(this, WxCategoryScale);

                    return _possibleConstructorReturn(this, (WxCategoryScale.__proto__ || Object.getPrototypeOf(WxCategoryScale)).apply(this, arguments));
                }

                _createClass(WxCategoryScale, [{
                    key: 'buildTicks',

                    /**
                     * Build a ticks array by minIndex or maxIndex
                     * Use to generator category scale ticks
                     *
                     * @param {Array} legends - The legend config of chart
                     * @param {number} maxIndex - Max index
                     * @param {number} minIndex - Min index
                     *
                     * @return {Array} The ticks data
                     */
                    value: function buildTicks(legends, maxIndex, minIndex) {
                        if (!legends || !_helper.is.Array(legends)) {
                            return legends;
                        }
                        minIndex = minIndex || 0;
                        maxIndex = maxIndex || legends.length;

                        return legends.slice(minIndex, maxIndex);
                    }
                }, {
                    key: 'buildDatasets',
                    value: function buildDatasets(legends, maxIndex, minIndex) {
                        return this.buildTicks.apply(this, arguments);
                    }

                    /**
                     * Get one point by a value
                     * @param {number} index - The index of category
                     */

                }, {
                    key: 'getPoint',
                    value: function getPoint(index) {
                        return this.getTicksPosition(index);
                    }
                }]);

                return WxCategoryScale;
            }(_scale2.default);

            exports.default = WxCategoryScale;
        }, { "../core/scale": 8, "../util/helper": 13 }], 11: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _scale = require('../core/scale');

            var _scale2 = _interopRequireDefault(_scale);

            var _layout = require('../core/layout');

            var _layout2 = _interopRequireDefault(_layout);

            var _helper = require('../util/helper');

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            var WX_CROSSSCALE_CONFIG = {
                xMargin: undefined, // undefined, a number or a function
                xFirstPointSpace: 'auto' };
            /**
             * An cross scale helper
             */

            var WxCrossScale = function () {
                /**
                 * @constructor
                 * @param {WxScale} xScale - x-Axis instance
                 * @param {WxScale} yScale - y-Axis instance
                 * @param {Object} [config]
                 */
                function WxCrossScale(xScale, yScale, config) {
                    _classCallCheck(this, WxCrossScale);

                    if (!xScale instanceof _scale2.default && !yScale instanceof _scale2.default) {
                        throw new Error('Should be an WxScale instance');
                    }

                    var me = this;
                    me.xScale = xScale;
                    me.yScale = yScale;

                    me.config = (0, _helper.extend)(true, {}, WX_CROSSSCALE_CONFIG, config);
                }

                /**
                 * Draw a cross scale
                 */

                _createClass(WxCrossScale, [{
                    key: 'draw',
                    value: function draw(area, xScaleDatasets, yScaleDatasets) {
                        var me = this,
                            _me$config = me.config,
                            xMargin = _me$config.xMargin,
                            xFirstPointSpace = _me$config.xFirstPointSpace;

                        me.yScale.init(yScaleDatasets);
                        var yBox = me.yScale.calculateBox(area, yScaleDatasets);
                        me.xScale.init(xScaleDatasets);
                        var xBox = me.xScale.calculateBox(area, xScaleDatasets);

                        // Y-Base
                        var yMHeight = xBox.outerHeight - xBox.marginTB - me.xScale.lineSpace;
                        //yBox.y = yBox.y + yMHeight*2;
                        me.yScale.config.fixPadding = yMHeight * 2;

                        // Adjust X-BOX
                        var xMWidth = yBox.outerWidth - yBox.marginLR - me.yScale.lineSpace;
                        var xOffset = xMWidth - me.xScale.fixPadding / 2;
                        var xExtendLeft = void 0;
                        if (xFirstPointSpace === 'auto') {
                            xExtendLeft = me.xScale.config.extendLeft || Math.min(xBox.width / 10, me.xScale.calculateTickWidth(xScaleDatasets, xBox) / xScaleDatasets.length);
                        } else if (xFirstPointSpace === 0) {
                            // Zero y-space; The first point of Y will overlap the last point of X, so remove the last point of X
                            yScaleDatasets[yScaleDatasets.length - 1].text = '';
                            xExtendLeft = 0;
                        } else if (_helper.is.Function(xFirstPointSpace)) {
                            xExtendLeft = xFirstPointSpace(xBox, yBox, area, me.xScale, me.yScale, xScaleDatasets, yScaleDatasets);
                        } else {
                            xExtendLeft = parseFloat(xFirstPointSpace);
                        }
                        if (xExtendLeft) {
                            xOffset -= me.xScale.config.ticks.lineWidth || 1;
                        }
                        xOffset += xExtendLeft;

                        var xAxisXPoint = area.x + xOffset;
                        if (_helper.is.Function(xMargin)) {
                            xMargin = xMargin(xBox, yBox, area, me.xScale, me.yScale, xScaleDatasets, yScaleDatasets);
                        } else if (!xMargin || !_helper.is.Number(xMargin)) {
                            xMargin = 0;
                        }

                        var calXbox = new _layout.BoxInstance(xBox.position, xAxisXPoint, xBox.y, xBox.width - xOffset - xMargin, xBox.height, xBox.outerWidth - xOffset, xBox.outerHeight);

                        me.yScale.setBox(yBox, false);
                        me.yScale.update(yScaleDatasets);

                        me.xScale.setBox(calXbox, false);
                        me.xScale.config.extendLeft = xExtendLeft;
                        me.xScale.update(xScaleDatasets);

                        return { xBox: calXbox, yBox: yBox };
                    }
                }]);

                return WxCrossScale;
            }();

            exports.default = WxCrossScale;
        }, { "../core/layout": 6, "../core/scale": 8, "../util/helper": 13 }], 12: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _scale = require('../core/scale');

            var _scale2 = _interopRequireDefault(_scale);

            var _helper = require('../util/helper');

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                }return call && ((typeof call === "undefined" ? "undefined" : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
            }

            function _inherits(subClass, superClass) {
                if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof2(superClass)));
                }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
            }

            /**
             * @class Liner scale
             */
            var WxLinerScale = function (_WxScale) {
                _inherits(WxLinerScale, _WxScale);

                function WxLinerScale() {
                    _classCallCheck(this, WxLinerScale);

                    return _possibleConstructorReturn(this, (WxLinerScale.__proto__ || Object.getPrototypeOf(WxLinerScale)).apply(this, arguments));
                }

                _createClass(WxLinerScale, [{
                    key: 'buildTicks',

                    /**
                     * Build a ticks array by max/min value
                     * Use to generator liner scale ticks
                     *
                     * @param {number} max - Max value
                     * @param {number} min - Min value
                     * @param {number} maxTicks - The maxinum number of ticks
                     * @param {number} [stepSize] - Special space size
                     *
                     * @return {Array} The ticks data
                     */
                    value: function buildTicks(max, min, maxTicks, stepSize) {
                        var spacing = void 0,
                            ticks = [];
                        if (!!stepSize && stepSize > 0) {
                            spacing = stepSize;
                        } else {
                            var niceRange = (0, _helper.niceNum)(max - min, false);
                            spacing = (0, _helper.niceNum)(niceRange / (maxTicks - 1), true);
                        }

                        var niceMin = Math.floor(min / spacing) * spacing;
                        var niceMax = Math.ceil(max / spacing) * spacing;
                        var numSpaces = (niceMax - niceMin) / spacing;

                        if ((0, _helper.almostEquals)(numSpaces, Math.round(numSpaces), spacing / 1000)) {
                            numSpaces = Math.round(numSpaces);
                        } else {
                            numSpaces = Math.ceil(numSpaces);
                        }

                        for (var j = 0; j < numSpaces; j++) {
                            ticks.push(niceMin + j * spacing);
                        }
                        ticks.push(niceMax);

                        return ticks;
                    }

                    /**
                     * Build a datasets base on buildTicks
                     *
                     * @param {number} max - Max value
                     * @param {number} min - Min value
                     * @param {number} maxTicks - The maximum number of ticks
                     * @param {number} [stepSize] - Assign the space size
                     * @param {Object} [scaleOptions] - Assign the dataset item's options
                     *
                     * @return {Array} The ticks data
                     */

                }, {
                    key: 'buildDatasets',
                    value: function buildDatasets(max, min, maxTicks, stepSize, scaleOptions) {
                        var me = this;
                        var ticks = me.buildTicks(max, min, maxTicks, stepSize);
                        if (!me.isHorizontal()) ticks.reverse();
                        return ticks.map(function (val) {
                            return (0, _helper.extend)({
                                text: val + '',
                                value: val
                            }, scaleOptions);
                        });
                    }

                    /**
                     * Calculate the maximum ticks of scale
                     *
                     * @param {BoxInstance} area - area of chart
                     * @param {WxCanvasRenderingContext2D} ctx - Content of chart
                     * @returns {number} maxTicks
                     */

                }, {
                    key: 'calculateTickLimit',
                    value: function calculateTickLimit(area, ctx) {
                        var me = this,
                            fontSize = ctx.fontSize;
                        var maxTicks = void 0;
                        var tickOpts = me.config.ticks;

                        if (me.isHorizontal()) {
                            maxTicks = Math.min(tickOpts.maxTicksLimit ? tickOpts.maxTicksLimit : 11, Math.ceil(area.width / 50));
                        } else {
                            // The factor of 2 used to scale the font size has been experimentally determined.
                            maxTicks = Math.min(tickOpts.maxTicksLimit ? tickOpts.maxTicksLimit : 11, Math.ceil(area.height / (2 * fontSize)));
                        }

                        return maxTicks;
                    }

                    /**
                     * Get one point by a value
                     * **Must** run after 'setBox' or 'update'
                     * @param {number} value
                     * @returns {object} point
                     *
                     */

                }, {
                    key: 'getPoint',
                    value: function getPoint(value) {
                        var me = this,
                            box = this.box;
                        var pointX = void 0,
                            pointY = void 0;

                        var startVal = parseInt(me.visDatasets[0].value),
                            endVal = parseInt(me.visDatasets[me.visDatasets.length - 1].value);
                        // if (!me.isHorizontal()) {
                        //     [startVal,endVal] = [endVal,startVal];
                        // }
                        var range = endVal - startVal;

                        if (me.isHorizontal()) {
                            var realWidth = me.getTicksPosition(me.visDatasets.length - 1).x - me.getTicksPosition(0).x;
                            pointX = me.getTicksPosition(0).x + realWidth / range * (value - startVal);
                            pointY = me.position === 'top' ? box.ry - me.lineSpace : box.ly + me.lineSpace;
                        } else {
                            var realHeight = me.getTicksPosition(me.visDatasets.length - 1).y - me.getTicksPosition(0).y;
                            pointX = me.position === 'left' ? box.rx - me.lineSpace : box.lx + me.lineSpace;
                            pointY = me.getTicksPosition(0).y + realHeight / range * (value - startVal);
                        }
                        return { x: Math.round(pointX), y: Math.round(pointY) };
                    }
                }]);

                return WxLinerScale;
            }(_scale2.default);

            exports.default = WxLinerScale;
        }, { "../core/scale": 8, "../util/helper": 13 }], 13: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
                return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
            } : function (obj) {
                return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
            };

            exports.sum = sum;
            exports.checkWX = checkWX;
            exports.wxConverToPx = wxConverToPx;
            exports.toRadians = toRadians;
            exports.toDegrees = toDegrees;
            exports.getWindowSize = getWindowSize;
            exports.getDPR = getDPR;
            exports.niceNum = niceNum;
            exports.almostEquals = almostEquals;
            exports.splineCurve = splineCurve;
            exports.getStyle = getStyle;
            exports.readUsedSize = readUsedSize;
            exports.retinaScale = retinaScale;

            function _toConsumableArray(arr) {
                if (Array.isArray(arr)) {
                    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                        arr2[i] = arr[i];
                    }return arr2;
                } else {
                    return Array.from(arr);
                }
            }

            var ObjProto = Object.prototype;

            // IS function, check variable's type
            var is = exports.is = {};

            ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'].forEach(function (name) {
                is[name] = function (obj) {
                    return ObjProto.toString.call(obj) === '[object ' + name + ']';
                };
            });

            // Is a given value an array?
            // Delegates to ECMA5's native Array.isArray
            is['Array'] = Array.isArray || function (obj) {
                return ObjProto.toString.call(obj) === '[object Array]';
            };

            // Is a given variable an object?
            is['Object'] = function (obj) {
                var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
                return type === 'function' || type === 'object' && !!obj;
            };

            var class2type = {};
            var toString = class2type.toString;
            var hasOwn = class2type.hasOwnProperty;
            var fnToString = hasOwn.toString;
            var ObjectFunctionString = fnToString.call(Object);
            // Is a given variable an object?
            is['PureObject'] = function (obj) {
                var proto = void 0,
                    Ctor = void 0;

                // Detect obvious negatives
                // Use toString instead of jQuery.type to catch host objects
                if (!obj || ObjProto.toString.call(obj) !== "[object Object]") {
                    return false;
                }

                proto = Object.getPrototypeOf(obj);
                // Objects with no prototype (e.g., `Object.create( null )`) are plain
                if (!proto) {
                    return true;
                }
                // Objects with prototype are plain iff they were constructed by a global Object function
                Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
                return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
            };

            is['Boolean'] = function (obj) {
                return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
            };

            // Is a given value equal to null?
            is['Null'] = function (obj) {
                return obj === null;
            };

            // Is a given variable undefined?
            is['Undefined'] = function (obj) {
                return obj === void 0;
            };

            // Is the given value `NaN`? (NaN is the only number which does not equal itself).
            is['NaN'] = function (obj) {
                return is.Number(obj) && obj !== +obj;
            };

            // Some helper function
            function sum() {
                var args = Array.from(arguments);
                var res = 0;
                return args.reduce(function (a, b) {
                    return a + b;
                }, 0);
            }

            // Some regex
            var REG_HANZI = exports.REG_HANZI = /[\u4e00-\u9fa5]/;
            var REG_ALPHABET = exports.REG_ALPHABET = /[a-zA-Z]/;
            var REG_NUMBER = exports.REG_NUMBER = /[0-9]/;
            var REG_ALPHABET_NUMBER = exports.REG_ALPHABET_NUMBER = /[0-9a-zA-Z]/;

            // Assign function generator
            function _assignGenerator(own) {
                var _copy = function _copy(target) {
                    var deep = true;

                    for (var _len = arguments.length, source = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                        source[_key - 1] = arguments[_key];
                    }

                    if (is.Boolean(target)) {
                        deep = target;
                        target = 0 in source ? source.shift() : null;
                    }

                    if (is.Array(target)) {
                        source.forEach(function (sc) {
                            var _target;

                            (_target = target).push.apply(_target, _toConsumableArray(sc));
                        });
                    } else if (is.Object(target)) {
                        source.forEach(function (sc) {
                            for (var key in sc) {
                                if (own && !sc.hasOwnProperty(key)) continue;
                                var so = sc[key],
                                    to = target[key];
                                if (is.PureObject(so)) {
                                    target[key] = deep ? extend(true, is.PureObject(to) ? to : {}, so) : so;
                                } else if (is.Array(so)) {
                                    target[key] = deep ? extend(true, is.Array(to) ? to : [], so) : so;
                                } else {
                                    target[key] = so;
                                }
                            }
                        });
                    }
                    // Do nothing
                    return target;
                };
                return _copy;
            }

            /**
             *
             * Extend a given object
             * @param {Boolean|Object|Array} target - target object or deep mark (default is true)
             * @param {Array|Object} source - target object if the first argument represent the deep mark, otherwise the source for merging
             * @returns {*}
             */
            var extend = exports.extend = _assignGenerator(false);
            var extendOwn = exports.extendOwn = _assignGenerator(true);
            /**
             * Check WeiXin environment
             */
            function checkWX() {
                return false === true || typeof wx != 'undefined' && (typeof wx === 'undefined' ? 'undefined' : _typeof(wx)) === 'object';
            }

            var isWeiXinAPP = exports.isWeiXinAPP = checkWX();
            /**
             * Convert (rpx/rem) to px
             * @param unit
             */
            var rpxReg = /([\d.]+)rpx/,
                remReg = /([\d.]+)rem/;
            function wxConverToPx(val) {
                if (!isWeiXinAPP) {
                    return Number.parseInt(val);
                }

                var windowSize = getWindowSize();
                if (is.String(val)) {
                    var m = val.match(rpxReg);
                    if (!!m) {
                        return +m[1] * windowSize.windowWidth / 750;
                    }

                    m = val.match(remReg);
                    if (!!m) {
                        return +m[1] * windowSize.windowWidth / 20;
                    }

                    return Number.parseInt(val);
                } else if (is.Number(val)) {
                    return val;
                } else {
                    throw new Error('Convert px error');
                }
            }

            function toRadians(degrees) {
                return degrees * (Math.PI / 180);
            }
            function toDegrees(radians) {
                return radians * (180 / Math.PI);
            }
            /**
             * Get window size (px)
             * @returns {*}
             */
            function getWindowSize() {
                var windowHeight = void 0,
                    windowWidth = void 0;
                if (isWeiXinAPP) {
                    var ret = wx.getSystemInfoSync();
                    windowWidth = ret.windowWidth;
                    windowHeight = ret.windowHeight;
                } else {
                    windowWidth = window.innerWidth;
                    windowHeight = window.innerHeight;
                }
                return { windowWidth: windowWidth, windowHeight: windowHeight };
            };

            /**
             * Get window's Device Pixel Ratio
             */
            function getDPR() {
                if (isWeiXinAPP) {
                    var ret = wx.getSystemInfoSync();
                    return ret.pixelRatio;
                } else {
                    return window.devicePixelRatio || 1;
                }
            };

            var uid = exports.uid = function () {
                var id = 0;
                return function () {
                    id++;
                    return 'u' + id;
                };
            }();

            function niceNum(range, round) {
                var exponent = Math.floor(Math.log10(range));
                var fraction = range / Math.pow(10, exponent);
                var niceFraction = void 0;

                if (round) {
                    if (fraction < 1.5) {
                        niceFraction = 1;
                    } else if (fraction < 3) {
                        niceFraction = 2;
                    } else if (fraction < 7) {
                        niceFraction = 5;
                    } else {
                        niceFraction = 10;
                    }
                } else if (fraction <= 1.0) {
                    niceFraction = 1;
                } else if (fraction <= 2) {
                    niceFraction = 2;
                } else if (fraction <= 5) {
                    niceFraction = 5;
                } else {
                    niceFraction = 10;
                }

                return niceFraction * Math.pow(10, exponent);
            }

            function almostEquals(a, b, epsilon) {
                return Math.abs(a - b) < epsilon;
            }

            function splineCurve(firstPoint, middlePoint, afterPoint) {
                var t = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.4;

                // Props to Rob Spencer at scaled innovation for his post on splining between points
                // http://scaledinnovation.com/analytics/splines/aboutSplines.html

                // This function must also respect "skipped" points

                var previous = !firstPoint ? middlePoint : firstPoint,
                    current = middlePoint,
                    next = !afterPoint ? middlePoint : afterPoint;

                var d01 = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2));
                var d12 = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));

                var s01 = d01 / (d01 + d12);
                var s12 = d12 / (d01 + d12);

                // If all points are the same, s01 & s02 will be inf
                s01 = isNaN(s01) ? 0 : s01;
                s12 = isNaN(s12) ? 0 : s12;

                var fa = t * s01; // scaling factor for triangle Ta
                var fb = t * s12;

                return {
                    previous: {
                        x: current.x - fa * (next.x - previous.x),
                        y: current.y - fa * (next.y - previous.y)
                    },
                    next: {
                        x: current.x + fb * (next.x - previous.x),
                        y: current.y + fb * (next.y - previous.y)
                    }
                };
            }

            /**
             * Get element style
             * @param element
             */
            function getStyle(element, property) {
                return element.currentStyle ? element.currentStyle[property] : document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
            }
            /**
             * The 'used' size is the final value of a dimension property after all calculations have
             * been performed. This method uses the computed style of `element` but returns undefined
             * if the computed style is not expressed in pixels. That can happen in some cases where
             * `element` has a size relative to its parent and this last one is not yet displayed,
             * for example because of `display: none` on a parent node.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
             * @param element
             * @param property
             * @returns {Number} Size in pixels or undefined if unknown.
             */
            function readUsedSize(element, property) {
                var value = getStyle(element, property);
                var matches = value && value.match(/(\d+)px/);
                return matches ? Number(matches[1]) : undefined;
            }
            /**
             * For retina screen
             * @param ctx
             * @param width
             * @param height
             */
            function retinaScale(ctx, width, height) {
                var pixelRatio = getDPR();
                if (pixelRatio === 1) {
                    return;
                }

                var canvas = ctx.canvas;
                if (isWeiXinAPP) {
                    // Do I resize the height or width?
                } else {
                    canvas.height = canvas.height * pixelRatio;
                    canvas.width = canvas.width * pixelRatio;
                    ctx.scale(pixelRatio, pixelRatio);

                    // If no style has been set on the canvas, the render size is used as display size,
                    // making the chart visually bigger, so let's enforce it to the 'correct' values.
                    // See https://github.com/chartjs/Chart.js/issues/3575
                    canvas.style.height = height + 'px';
                    canvas.style.width = width + 'px';
                }
            }
        }, {}], 14: [function (require, module, exports) {
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            // Modified from randomColor by David Merfield under the CC0 license
            // https://github.com/davidmerfield/randomColor/

            var seed = null;

            // Shared color dictionary
            var colorDictionary = {};

            // Populate the color dictionary
            loadColorBounds();

            var randomColor = function randomColor(options) {

                options = options || {};

                // Check if there is a seed and ensure it's an
                // integer. Otherwise, reset the seed value.
                if (options.seed !== undefined && options.seed !== null && options.seed === parseInt(options.seed, 10)) {
                    seed = options.seed;

                    // A string was passed as a seed
                } else if (typeof options.seed === 'string') {
                    seed = stringToInteger(options.seed);

                    // Something was passed as a seed but it wasn't an integer or string
                } else if (options.seed !== undefined && options.seed !== null) {
                    throw new TypeError('The seed value must be an integer or string');

                    // No seed, reset the value outside.
                } else {
                    seed = null;
                }

                var H = void 0,
                    S = void 0,
                    B = void 0;

                // Check if we need to generate multiple colors
                if (options.count !== null && options.count !== undefined) {

                    var totalColors = options.count,
                        colors = [];

                    options.count = null;

                    while (totalColors > colors.length) {

                        // Since we're generating multiple colors,
                        // incremement the seed. Otherwise we'd just
                        // generate the same color each time...
                        if (seed && options.seed) options.seed += 1;

                        colors.push(randomColor(options));
                    }

                    options.count = totalColors;

                    return colors;
                }

                // First we pick a hue (H)
                H = pickHue(options);

                // Then use H to determine saturation (S)
                S = pickSaturation(H, options);

                // Then use S and H to determine brightness (B).
                B = pickBrightness(H, S, options);

                // Then we return the HSB color in the desired format
                return setFormat([H, S, B], options);
            };

            function pickHue(options) {

                var hueRange = getHueRange(options.hue),
                    hue = randomWithin(hueRange);

                // Instead of storing red as two seperate ranges,
                // we group them, using negative numbers
                if (hue < 0) {
                    hue = 360 + hue;
                }

                return hue;
            }

            function pickSaturation(hue, options) {

                if (options.luminosity === 'random') {
                    return randomWithin([0, 100]);
                }

                if (options.hue === 'monochrome') {
                    return 0;
                }

                var saturationRange = getSaturationRange(hue);

                var sMin = saturationRange[0],
                    sMax = saturationRange[1];

                switch (options.luminosity) {

                    case 'bright':
                        sMin = 55;
                        break;

                    case 'dark':
                        sMin = sMax - 10;
                        break;

                    case 'light':
                        sMax = 55;
                        break;
                }

                return randomWithin([sMin, sMax]);
            }

            function pickBrightness(H, S, options) {

                var bMin = getMinimumBrightness(H, S),
                    bMax = 100;

                switch (options.luminosity) {

                    case 'dark':
                        bMax = bMin + 20;
                        break;

                    case 'light':
                        bMin = (bMax + bMin) / 2;
                        break;

                    case 'random':
                        bMin = 0;
                        bMax = 100;
                        break;
                }

                return randomWithin([bMin, bMax]);
            }

            function setFormat(hsv, options) {

                switch (options.format) {

                    case 'hsvArray':
                        return hsv;

                    case 'hslArray':
                        return HSVtoHSL(hsv);

                    case 'hsl':
                        var hsl = HSVtoHSL(hsv);
                        return 'hsl(' + hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%)';

                    case 'hsla':
                        var hslColor = HSVtoHSL(hsv);
                        var alpha = options.alpha || Math.random();
                        return 'hsla(' + hslColor[0] + ', ' + hslColor[1] + '%, ' + hslColor[2] + '%, ' + alpha + ')';

                    case 'rgbArray':
                        return HSVtoRGB(hsv);

                    case 'rgb':
                        var rgb = HSVtoRGB(hsv);
                        return 'rgb(' + rgb.join(', ') + ')';

                    case 'rgba':
                        var rgbColor = HSVtoRGB(hsv);
                        var alpha = options.alpha || Math.random();
                        return 'rgba(' + rgbColor.join(', ') + ', ' + alpha + ')';

                    default:
                        return HSVtoHex(hsv);
                }
            }

            function getMinimumBrightness(H, S) {

                var lowerBounds = getColorInfo(H).lowerBounds;

                for (var i = 0; i < lowerBounds.length - 1; i++) {

                    var s1 = lowerBounds[i][0],
                        v1 = lowerBounds[i][1];

                    var s2 = lowerBounds[i + 1][0],
                        v2 = lowerBounds[i + 1][1];

                    if (S >= s1 && S <= s2) {

                        var m = (v2 - v1) / (s2 - s1),
                            b = v1 - m * s1;

                        return m * S + b;
                    }
                }

                return 0;
            }

            function getHueRange(colorInput) {

                if (typeof parseInt(colorInput) === 'number') {

                    var number = parseInt(colorInput);

                    if (number < 360 && number > 0) {
                        return [number, number];
                    }
                }

                if (typeof colorInput === 'string') {

                    if (colorDictionary[colorInput]) {
                        var color = colorDictionary[colorInput];
                        if (color.hueRange) {
                            return color.hueRange;
                        }
                    }
                }

                return [0, 360];
            }

            function getSaturationRange(hue) {
                return getColorInfo(hue).saturationRange;
            }

            function getColorInfo(hue) {

                // Maps red colors to make picking hue easier
                if (hue >= 334 && hue <= 360) {
                    hue -= 360;
                }

                for (var colorName in colorDictionary) {
                    var color = colorDictionary[colorName];
                    if (color.hueRange && hue >= color.hueRange[0] && hue <= color.hueRange[1]) {
                        return colorDictionary[colorName];
                    }
                }
                return 'Color not found';
            }

            function randomWithin(range) {
                if (seed === null) {
                    return Math.floor(range[0] + Math.random() * (range[1] + 1 - range[0]));
                } else {
                    //Seeded random algorithm from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
                    var max = range[1] || 1;
                    var min = range[0] || 0;
                    seed = (seed * 9301 + 49297) % 233280;
                    var rnd = seed / 233280.0;
                    return Math.floor(min + rnd * (max - min));
                }
            }

            function HSVtoHex(hsv) {

                var rgb = HSVtoRGB(hsv);

                function componentToHex(c) {
                    var hex = c.toString(16);
                    return hex.length == 1 ? '0' + hex : hex;
                }

                var hex = '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);

                return hex;
            }

            function defineColor(name, hueRange, lowerBounds) {

                var sMin = lowerBounds[0][0],
                    sMax = lowerBounds[lowerBounds.length - 1][0],
                    bMin = lowerBounds[lowerBounds.length - 1][1],
                    bMax = lowerBounds[0][1];

                colorDictionary[name] = {
                    hueRange: hueRange,
                    lowerBounds: lowerBounds,
                    saturationRange: [sMin, sMax],
                    brightnessRange: [bMin, bMax]
                };
            }

            function loadColorBounds() {

                defineColor('monochrome', null, [[0, 0], [100, 0]]);

                defineColor('red', [-26, 18], [[20, 100], [30, 92], [40, 89], [50, 85], [60, 78], [70, 70], [80, 60], [90, 55], [100, 50]]);

                defineColor('orange', [19, 46], [[20, 100], [30, 93], [40, 88], [50, 86], [60, 85], [70, 70], [100, 70]]);

                defineColor('yellow', [47, 62], [[25, 100], [40, 94], [50, 89], [60, 86], [70, 84], [80, 82], [90, 80], [100, 75]]);

                defineColor('green', [63, 178], [[30, 100], [40, 90], [50, 85], [60, 81], [70, 74], [80, 64], [90, 50], [100, 40]]);

                defineColor('blue', [179, 257], [[20, 100], [30, 86], [40, 80], [50, 74], [60, 60], [70, 52], [80, 44], [90, 39], [100, 35]]);

                defineColor('purple', [258, 282], [[20, 100], [30, 87], [40, 79], [50, 70], [60, 65], [70, 59], [80, 52], [90, 45], [100, 42]]);

                defineColor('pink', [283, 334], [[20, 100], [30, 90], [40, 86], [60, 84], [80, 80], [90, 75], [100, 73]]);
            }

            function HSVtoRGB(hsv) {

                // this doesn't work for the values of 0 and 360
                // here's the hacky fix
                var h = hsv[0];
                if (h === 0) {
                    h = 1;
                }
                if (h === 360) {
                    h = 359;
                }

                // Rebase the h,s,v values
                h = h / 360;
                var s = hsv[1] / 100,
                    v = hsv[2] / 100;

                var h_i = Math.floor(h * 6),
                    f = h * 6 - h_i,
                    p = v * (1 - s),
                    q = v * (1 - f * s),
                    t = v * (1 - (1 - f) * s),
                    r = 256,
                    g = 256,
                    b = 256;

                switch (h_i) {
                    case 0:
                        r = v;
                        g = t;
                        b = p;
                        break;
                    case 1:
                        r = q;
                        g = v;
                        b = p;
                        break;
                    case 2:
                        r = p;
                        g = v;
                        b = t;
                        break;
                    case 3:
                        r = p;
                        g = q;
                        b = v;
                        break;
                    case 4:
                        r = t;
                        g = p;
                        b = v;
                        break;
                    case 5:
                        r = v;
                        g = p;
                        b = q;
                        break;
                }

                var result = [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
                return result;
            }

            function HSVtoHSL(hsv) {
                var h = hsv[0],
                    s = hsv[1] / 100,
                    v = hsv[2] / 100,
                    k = (2 - s) * v;

                return [h, Math.round(s * v / (k < 1 ? k : 2 - k) * 10000) / 100, k / 2 * 100];
            }

            function stringToInteger(string) {
                var total = 0;
                for (var i = 0; i !== string.length; i++) {
                    if (total >= Number.MAX_SAFE_INTEGER) break;
                    total += string.charCodeAt(i);
                }
                return total;
            }

            exports.default = randomColor;
        }, {}], 15: [function (require, module, exports) {
            "use strict";

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
                return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
            } : function (obj) {
                return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
            };

            // TinyColor v1.4.1
            // https://github.com/bgrins/TinyColor
            // Brian Grinstead, MIT License


            var trimLeft = /^\s+/,
                trimRight = /\s+$/,
                tinyCounter = 0,
                mathRound = Math.round,
                mathMin = Math.min,
                mathMax = Math.max,
                mathRandom = Math.random;

            function tinycolor(color, opts) {

                color = color ? color : '';
                opts = opts || {};

                // If input is already a tinycolor, return itself
                if (color instanceof tinycolor) {
                    return color;
                }
                // If we are called as a function, call using new instead
                if (!(this instanceof tinycolor)) {
                    return new tinycolor(color, opts);
                }

                var rgb = inputToRGB(color);
                this._originalInput = color, this._r = rgb.r, this._g = rgb.g, this._b = rgb.b, this._a = rgb.a, this._roundA = mathRound(100 * this._a) / 100, this._format = opts.format || rgb.format;
                this._gradientType = opts.gradientType;

                // Don't let the range of [0,255] come back in [0,1].
                // Potentially lose a little bit of precision here, but will fix issues where
                // .5 gets interpreted as half of the total, instead of half of 1
                // If it was supposed to be 128, this was already taken care of by `inputToRgb`
                if (this._r < 1) {
                    this._r = mathRound(this._r);
                }
                if (this._g < 1) {
                    this._g = mathRound(this._g);
                }
                if (this._b < 1) {
                    this._b = mathRound(this._b);
                }

                this._ok = rgb.ok;
                this._tc_id = tinyCounter++;
            }

            tinycolor.prototype = {
                isDark: function isDark() {
                    return this.getBrightness() < 128;
                },
                isLight: function isLight() {
                    return !this.isDark();
                },
                isValid: function isValid() {
                    return this._ok;
                },
                getOriginalInput: function getOriginalInput() {
                    return this._originalInput;
                },
                getFormat: function getFormat() {
                    return this._format;
                },
                getAlpha: function getAlpha() {
                    return this._a;
                },
                getBrightness: function getBrightness() {
                    //http://www.w3.org/TR/AERT#color-contrast
                    var rgb = this.toRgb();
                    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                },
                getLuminance: function getLuminance() {
                    //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
                    var rgb = this.toRgb();
                    var RsRGB, GsRGB, BsRGB, R, G, B;
                    RsRGB = rgb.r / 255;
                    GsRGB = rgb.g / 255;
                    BsRGB = rgb.b / 255;

                    if (RsRGB <= 0.03928) {
                        R = RsRGB / 12.92;
                    } else {
                        R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
                    }
                    if (GsRGB <= 0.03928) {
                        G = GsRGB / 12.92;
                    } else {
                        G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
                    }
                    if (BsRGB <= 0.03928) {
                        B = BsRGB / 12.92;
                    } else {
                        B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
                    }
                    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
                },
                setAlpha: function setAlpha(value) {
                    this._a = boundAlpha(value);
                    this._roundA = mathRound(100 * this._a) / 100;
                    return this;
                },
                toHsv: function toHsv() {
                    var hsv = rgbToHsv(this._r, this._g, this._b);
                    return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
                },
                toHsvString: function toHsvString() {
                    var hsv = rgbToHsv(this._r, this._g, this._b);
                    var h = mathRound(hsv.h * 360),
                        s = mathRound(hsv.s * 100),
                        v = mathRound(hsv.v * 100);
                    return this._a == 1 ? "hsv(" + h + ", " + s + "%, " + v + "%)" : "hsva(" + h + ", " + s + "%, " + v + "%, " + this._roundA + ")";
                },
                toHsl: function toHsl() {
                    var hsl = rgbToHsl(this._r, this._g, this._b);
                    return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
                },
                toHslString: function toHslString() {
                    var hsl = rgbToHsl(this._r, this._g, this._b);
                    var h = mathRound(hsl.h * 360),
                        s = mathRound(hsl.s * 100),
                        l = mathRound(hsl.l * 100);
                    return this._a == 1 ? "hsl(" + h + ", " + s + "%, " + l + "%)" : "hsla(" + h + ", " + s + "%, " + l + "%, " + this._roundA + ")";
                },
                toHex: function toHex(allow3Char) {
                    return rgbToHex(this._r, this._g, this._b, allow3Char);
                },
                toHexString: function toHexString(allow3Char) {
                    return '#' + this.toHex(allow3Char);
                },
                toHex8: function toHex8(allow4Char) {
                    return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
                },
                toHex8String: function toHex8String(allow4Char) {
                    return '#' + this.toHex8(allow4Char);
                },
                toRgb: function toRgb() {
                    return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
                },
                toRgbString: function toRgbString() {
                    return this._a == 1 ? "rgb(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" : "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
                },
                toPercentageRgb: function toPercentageRgb() {
                    return {
                        r: mathRound(bound01(this._r, 255) * 100) + "%",
                        g: mathRound(bound01(this._g, 255) * 100) + "%",
                        b: mathRound(bound01(this._b, 255) * 100) + "%",
                        a: this._a
                    };
                },
                toPercentageRgbString: function toPercentageRgbString() {
                    return this._a == 1 ? "rgb(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" : "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
                },
                toName: function toName() {
                    if (this._a === 0) {
                        return "transparent";
                    }

                    if (this._a < 1) {
                        return false;
                    }

                    return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
                },
                toFilter: function toFilter(secondColor) {
                    var hex8String = '#' + rgbaToArgbHex(this._r, this._g, this._b, this._a);
                    var secondHex8String = hex8String;
                    var gradientType = this._gradientType ? "GradientType = 1, " : "";

                    if (secondColor) {
                        var s = tinycolor(secondColor);
                        secondHex8String = '#' + rgbaToArgbHex(s._r, s._g, s._b, s._a);
                    }

                    return "progid:DXImageTransform.Microsoft.gradient(" + gradientType + "startColorstr=" + hex8String + ",endColorstr=" + secondHex8String + ")";
                },
                toString: function toString(format) {
                    var formatSet = !!format;
                    format = format || this._format;

                    var formattedString = false;
                    var hasAlpha = this._a < 1 && this._a >= 0;
                    var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "hex4" || format === "hex8" || format === "name");

                    if (needsAlphaFormat) {
                        // Special case for "transparent", all other non-alpha formats
                        // will return rgba when there is transparency.
                        if (format === "name" && this._a === 0) {
                            return this.toName();
                        }
                        return this.toRgbString();
                    }
                    if (format === "rgb") {
                        formattedString = this.toRgbString();
                    }
                    if (format === "prgb") {
                        formattedString = this.toPercentageRgbString();
                    }
                    if (format === "hex" || format === "hex6") {
                        formattedString = this.toHexString();
                    }
                    if (format === "hex3") {
                        formattedString = this.toHexString(true);
                    }
                    if (format === "hex4") {
                        formattedString = this.toHex8String(true);
                    }
                    if (format === "hex8") {
                        formattedString = this.toHex8String();
                    }
                    if (format === "name") {
                        formattedString = this.toName();
                    }
                    if (format === "hsl") {
                        formattedString = this.toHslString();
                    }
                    if (format === "hsv") {
                        formattedString = this.toHsvString();
                    }

                    return formattedString || this.toHexString();
                },
                clone: function clone() {
                    return tinycolor(this.toString());
                },

                _applyModification: function _applyModification(fn, args) {
                    var color = fn.apply(null, [this].concat([].slice.call(args)));
                    this._r = color._r;
                    this._g = color._g;
                    this._b = color._b;
                    this.setAlpha(color._a);
                    return this;
                },
                lighten: function lighten() {
                    return this._applyModification(_lighten, arguments);
                },
                brighten: function brighten() {
                    return this._applyModification(_brighten, arguments);
                },
                darken: function darken() {
                    return this._applyModification(_darken, arguments);
                },
                desaturate: function desaturate() {
                    return this._applyModification(_desaturate, arguments);
                },
                saturate: function saturate() {
                    return this._applyModification(_saturate, arguments);
                },
                greyscale: function greyscale() {
                    return this._applyModification(_greyscale, arguments);
                },
                spin: function spin() {
                    return this._applyModification(_spin, arguments);
                },

                _applyCombination: function _applyCombination(fn, args) {
                    return fn.apply(null, [this].concat([].slice.call(args)));
                },
                analogous: function analogous() {
                    return this._applyCombination(_analogous, arguments);
                },
                complement: function complement() {
                    return this._applyCombination(_complement, arguments);
                },
                monochromatic: function monochromatic() {
                    return this._applyCombination(_monochromatic, arguments);
                },
                splitcomplement: function splitcomplement() {
                    return this._applyCombination(_splitcomplement, arguments);
                },
                triad: function triad() {
                    return this._applyCombination(_triad, arguments);
                },
                tetrad: function tetrad() {
                    return this._applyCombination(_tetrad, arguments);
                }
            };

            // If input is an object, force 1 into "1.0" to handle ratios properly
            // String input requires "1.0" as input, so 1 will be treated as 1
            tinycolor.fromRatio = function (color, opts) {
                if ((typeof color === "undefined" ? "undefined" : _typeof(color)) == "object") {
                    var newColor = {};
                    for (var i in color) {
                        if (color.hasOwnProperty(i)) {
                            if (i === "a") {
                                newColor[i] = color[i];
                            } else {
                                newColor[i] = convertToPercentage(color[i]);
                            }
                        }
                    }
                    color = newColor;
                }

                return tinycolor(color, opts);
            };

            // Given a string or object, convert that input to RGB
            // Possible string inputs:
            //
            //     "red"
            //     "#f00" or "f00"
            //     "#ff0000" or "ff0000"
            //     "#ff000000" or "ff000000"
            //     "rgb 255 0 0" or "rgb (255, 0, 0)"
            //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
            //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
            //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
            //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
            //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
            //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
            //
            function inputToRGB(color) {

                var rgb = { r: 0, g: 0, b: 0 };
                var a = 1;
                var s = null;
                var v = null;
                var l = null;
                var ok = false;
                var format = false;

                if (typeof color == "string") {
                    color = stringInputToObject(color);
                }

                if ((typeof color === "undefined" ? "undefined" : _typeof(color)) == "object") {
                    if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
                        rgb = rgbToRgb(color.r, color.g, color.b);
                        ok = true;
                        format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
                    } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
                        s = convertToPercentage(color.s);
                        v = convertToPercentage(color.v);
                        rgb = hsvToRgb(color.h, s, v);
                        ok = true;
                        format = "hsv";
                    } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
                        s = convertToPercentage(color.s);
                        l = convertToPercentage(color.l);
                        rgb = hslToRgb(color.h, s, l);
                        ok = true;
                        format = "hsl";
                    }

                    if (color.hasOwnProperty("a")) {
                        a = color.a;
                    }
                }

                a = boundAlpha(a);

                return {
                    ok: ok,
                    format: color.format || format,
                    r: mathMin(255, mathMax(rgb.r, 0)),
                    g: mathMin(255, mathMax(rgb.g, 0)),
                    b: mathMin(255, mathMax(rgb.b, 0)),
                    a: a
                };
            }

            // Conversion Functions
            // --------------------

            // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
            // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

            // `rgbToRgb`
            // Handle bounds / percentage checking to conform to CSS color spec
            // <http://www.w3.org/TR/css3-color/>
            // *Assumes:* r, g, b in [0, 255] or [0, 1]
            // *Returns:* { r, g, b } in [0, 255]
            function rgbToRgb(r, g, b) {
                return {
                    r: bound01(r, 255) * 255,
                    g: bound01(g, 255) * 255,
                    b: bound01(b, 255) * 255
                };
            }

            // `rgbToHsl`
            // Converts an RGB color value to HSL.
            // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
            // *Returns:* { h, s, l } in [0,1]
            function rgbToHsl(r, g, b) {

                r = bound01(r, 255);
                g = bound01(g, 255);
                b = bound01(b, 255);

                var max = mathMax(r, g, b),
                    min = mathMin(r, g, b);
                var h,
                    s,
                    l = (max + min) / 2;

                if (max == min) {
                    h = s = 0; // achromatic
                } else {
                    var d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                        case r:
                            h = (g - b) / d + (g < b ? 6 : 0);
                            break;
                        case g:
                            h = (b - r) / d + 2;
                            break;
                        case b:
                            h = (r - g) / d + 4;
                            break;
                    }

                    h /= 6;
                }

                return { h: h, s: s, l: l };
            }

            // `hslToRgb`
            // Converts an HSL color value to RGB.
            // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
            // *Returns:* { r, g, b } in the set [0, 255]
            function hslToRgb(h, s, l) {
                var r, g, b;

                h = bound01(h, 360);
                s = bound01(s, 100);
                l = bound01(l, 100);

                function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }

                if (s === 0) {
                    r = g = b = l; // achromatic
                } else {
                    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    var p = 2 * l - q;
                    r = hue2rgb(p, q, h + 1 / 3);
                    g = hue2rgb(p, q, h);
                    b = hue2rgb(p, q, h - 1 / 3);
                }

                return { r: r * 255, g: g * 255, b: b * 255 };
            }

            // `rgbToHsv`
            // Converts an RGB color value to HSV
            // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
            // *Returns:* { h, s, v } in [0,1]
            function rgbToHsv(r, g, b) {

                r = bound01(r, 255);
                g = bound01(g, 255);
                b = bound01(b, 255);

                var max = mathMax(r, g, b),
                    min = mathMin(r, g, b);
                var h,
                    s,
                    v = max;

                var d = max - min;
                s = max === 0 ? 0 : d / max;

                if (max == min) {
                    h = 0; // achromatic
                } else {
                    switch (max) {
                        case r:
                            h = (g - b) / d + (g < b ? 6 : 0);
                            break;
                        case g:
                            h = (b - r) / d + 2;
                            break;
                        case b:
                            h = (r - g) / d + 4;
                            break;
                    }
                    h /= 6;
                }
                return { h: h, s: s, v: v };
            }

            // `hsvToRgb`
            // Converts an HSV color value to RGB.
            // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
            // *Returns:* { r, g, b } in the set [0, 255]
            function hsvToRgb(h, s, v) {

                h = bound01(h, 360) * 6;
                s = bound01(s, 100);
                v = bound01(v, 100);

                var i = Math.floor(h),
                    f = h - i,
                    p = v * (1 - s),
                    q = v * (1 - f * s),
                    t = v * (1 - (1 - f) * s),
                    mod = i % 6,
                    r = [v, q, p, p, t, v][mod],
                    g = [t, v, v, q, p, p][mod],
                    b = [p, p, t, v, v, q][mod];

                return { r: r * 255, g: g * 255, b: b * 255 };
            }

            // `rgbToHex`
            // Converts an RGB color to hex
            // Assumes r, g, and b are contained in the set [0, 255]
            // Returns a 3 or 6 character hex
            function rgbToHex(r, g, b, allow3Char) {

                var hex = [pad2(mathRound(r).toString(16)), pad2(mathRound(g).toString(16)), pad2(mathRound(b).toString(16))];

                // Return a 3 character hex if possible
                if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
                    return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
                }

                return hex.join("");
            }

            // `rgbaToHex`
            // Converts an RGBA color plus alpha transparency to hex
            // Assumes r, g, b are contained in the set [0, 255] and
            // a in [0, 1]. Returns a 4 or 8 character rgba hex
            function rgbaToHex(r, g, b, a, allow4Char) {

                var hex = [pad2(mathRound(r).toString(16)), pad2(mathRound(g).toString(16)), pad2(mathRound(b).toString(16)), pad2(convertDecimalToHex(a))];

                // Return a 4 character hex if possible
                if (allow4Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1) && hex[3].charAt(0) == hex[3].charAt(1)) {
                    return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
                }

                return hex.join("");
            }

            // `rgbaToArgbHex`
            // Converts an RGBA color to an ARGB Hex8 string
            // Rarely used, but required for "toFilter()"
            function rgbaToArgbHex(r, g, b, a) {

                var hex = [pad2(convertDecimalToHex(a)), pad2(mathRound(r).toString(16)), pad2(mathRound(g).toString(16)), pad2(mathRound(b).toString(16))];

                return hex.join("");
            }

            // `equals`
            // Can be called with any tinycolor input
            tinycolor.equals = function (color1, color2) {
                if (!color1 || !color2) {
                    return false;
                }
                return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
            };

            tinycolor.random = function () {
                return tinycolor.fromRatio({
                    r: mathRandom(),
                    g: mathRandom(),
                    b: mathRandom()
                });
            };

            // Modification Functions
            // ----------------------
            // Thanks to less.js for some of the basics here
            // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

            function _desaturate(color, amount) {
                amount = amount === 0 ? 0 : amount || 10;
                var hsl = tinycolor(color).toHsl();
                hsl.s -= amount / 100;
                hsl.s = clamp01(hsl.s);
                return tinycolor(hsl);
            }

            function _saturate(color, amount) {
                amount = amount === 0 ? 0 : amount || 10;
                var hsl = tinycolor(color).toHsl();
                hsl.s += amount / 100;
                hsl.s = clamp01(hsl.s);
                return tinycolor(hsl);
            }

            function _greyscale(color) {
                return tinycolor(color).desaturate(100);
            }

            function _lighten(color, amount) {
                amount = amount === 0 ? 0 : amount || 10;
                var hsl = tinycolor(color).toHsl();
                hsl.l += amount / 100;
                hsl.l = clamp01(hsl.l);
                return tinycolor(hsl);
            }

            function _brighten(color, amount) {
                amount = amount === 0 ? 0 : amount || 10;
                var rgb = tinycolor(color).toRgb();
                rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * -(amount / 100))));
                rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * -(amount / 100))));
                rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * -(amount / 100))));
                return tinycolor(rgb);
            }

            function _darken(color, amount) {
                amount = amount === 0 ? 0 : amount || 10;
                var hsl = tinycolor(color).toHsl();
                hsl.l -= amount / 100;
                hsl.l = clamp01(hsl.l);
                return tinycolor(hsl);
            }

            // Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
            // Values outside of this range will be wrapped into this range.
            function _spin(color, amount) {
                var hsl = tinycolor(color).toHsl();
                var hue = (hsl.h + amount) % 360;
                hsl.h = hue < 0 ? 360 + hue : hue;
                return tinycolor(hsl);
            }

            // Combination Functions
            // ---------------------
            // Thanks to jQuery xColor for some of the ideas behind these
            // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

            function _complement(color) {
                var hsl = tinycolor(color).toHsl();
                hsl.h = (hsl.h + 180) % 360;
                return tinycolor(hsl);
            }

            function _triad(color) {
                var hsl = tinycolor(color).toHsl();
                var h = hsl.h;
                return [tinycolor(color), tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }), tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })];
            }

            function _tetrad(color) {
                var hsl = tinycolor(color).toHsl();
                var h = hsl.h;
                return [tinycolor(color), tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }), tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }), tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })];
            }

            function _splitcomplement(color) {
                var hsl = tinycolor(color).toHsl();
                var h = hsl.h;
                return [tinycolor(color), tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l }), tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l })];
            }

            function _analogous(color, results, slices) {
                results = results || 6;
                slices = slices || 30;

                var hsl = tinycolor(color).toHsl();
                var part = 360 / slices;
                var ret = [tinycolor(color)];

                for (hsl.h = (hsl.h - (part * results >> 1) + 720) % 360; --results;) {
                    hsl.h = (hsl.h + part) % 360;
                    ret.push(tinycolor(hsl));
                }
                return ret;
            }

            function _monochromatic(color, results) {
                results = results || 6;
                var hsv = tinycolor(color).toHsv();
                var h = hsv.h,
                    s = hsv.s,
                    v = hsv.v;
                var ret = [];
                var modification = 1 / results;

                while (results--) {
                    ret.push(tinycolor({ h: h, s: s, v: v }));
                    v = (v + modification) % 1;
                }

                return ret;
            }

            // Utility Functions
            // ---------------------

            tinycolor.mix = function (color1, color2, amount) {
                amount = amount === 0 ? 0 : amount || 50;

                var rgb1 = tinycolor(color1).toRgb();
                var rgb2 = tinycolor(color2).toRgb();

                var p = amount / 100;

                var rgba = {
                    r: (rgb2.r - rgb1.r) * p + rgb1.r,
                    g: (rgb2.g - rgb1.g) * p + rgb1.g,
                    b: (rgb2.b - rgb1.b) * p + rgb1.b,
                    a: (rgb2.a - rgb1.a) * p + rgb1.a
                };

                return tinycolor(rgba);
            };

            // Readability Functions
            // ---------------------
            // <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

            // `contrast`
            // Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
            tinycolor.readability = function (color1, color2) {
                var c1 = tinycolor(color1);
                var c2 = tinycolor(color2);
                return (Math.max(c1.getLuminance(), c2.getLuminance()) + 0.05) / (Math.min(c1.getLuminance(), c2.getLuminance()) + 0.05);
            };

            // `isReadable`
            // Ensure that foreground and background color combinations meet WCAG2 guidelines.
            // The third argument is an optional Object.
            //      the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
            //      the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
            // If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.

            // *Example*
            //    tinycolor.isReadable("#000", "#111") => false
            //    tinycolor.isReadable("#000", "#111",{level:"AA",size:"large"}) => false
            tinycolor.isReadable = function (color1, color2, wcag2) {
                var readability = tinycolor.readability(color1, color2);
                var wcag2Parms, out;

                out = false;

                wcag2Parms = validateWCAG2Parms(wcag2);
                switch (wcag2Parms.level + wcag2Parms.size) {
                    case "AAsmall":
                    case "AAAlarge":
                        out = readability >= 4.5;
                        break;
                    case "AAlarge":
                        out = readability >= 3;
                        break;
                    case "AAAsmall":
                        out = readability >= 7;
                        break;
                }
                return out;
            };

            // `mostReadable`
            // Given a base color and a list of possible foreground or background
            // colors for that base, returns the most readable color.
            // Optionally returns Black or White if the most readable color is unreadable.
            // *Example*
            //    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:false}).toHexString(); // "#112255"
            //    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:true}).toHexString();  // "#ffffff"
            //    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"large"}).toHexString(); // "#faf3f3"
            //    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"small"}).toHexString(); // "#ffffff"
            tinycolor.mostReadable = function (baseColor, colorList, args) {
                var bestColor = null;
                var bestScore = 0;
                var readability;
                var includeFallbackColors, level, size;
                args = args || {};
                includeFallbackColors = args.includeFallbackColors;
                level = args.level;
                size = args.size;

                for (var i = 0; i < colorList.length; i++) {
                    readability = tinycolor.readability(baseColor, colorList[i]);
                    if (readability > bestScore) {
                        bestScore = readability;
                        bestColor = tinycolor(colorList[i]);
                    }
                }

                if (tinycolor.isReadable(baseColor, bestColor, { "level": level, "size": size }) || !includeFallbackColors) {
                    return bestColor;
                } else {
                    args.includeFallbackColors = false;
                    return tinycolor.mostReadable(baseColor, ["#fff", "#000"], args);
                }
            };

            // Big List of Colors
            // ------------------
            // <http://www.w3.org/TR/css3-color/#svg-color>
            var names = tinycolor.names = {
                aliceblue: "f0f8ff",
                antiquewhite: "faebd7",
                aqua: "0ff",
                aquamarine: "7fffd4",
                azure: "f0ffff",
                beige: "f5f5dc",
                bisque: "ffe4c4",
                black: "000",
                blanchedalmond: "ffebcd",
                blue: "00f",
                blueviolet: "8a2be2",
                brown: "a52a2a",
                burlywood: "deb887",
                burntsienna: "ea7e5d",
                cadetblue: "5f9ea0",
                chartreuse: "7fff00",
                chocolate: "d2691e",
                coral: "ff7f50",
                cornflowerblue: "6495ed",
                cornsilk: "fff8dc",
                crimson: "dc143c",
                cyan: "0ff",
                darkblue: "00008b",
                darkcyan: "008b8b",
                darkgoldenrod: "b8860b",
                darkgray: "a9a9a9",
                darkgreen: "006400",
                darkgrey: "a9a9a9",
                darkkhaki: "bdb76b",
                darkmagenta: "8b008b",
                darkolivegreen: "556b2f",
                darkorange: "ff8c00",
                darkorchid: "9932cc",
                darkred: "8b0000",
                darksalmon: "e9967a",
                darkseagreen: "8fbc8f",
                darkslateblue: "483d8b",
                darkslategray: "2f4f4f",
                darkslategrey: "2f4f4f",
                darkturquoise: "00ced1",
                darkviolet: "9400d3",
                deeppink: "ff1493",
                deepskyblue: "00bfff",
                dimgray: "696969",
                dimgrey: "696969",
                dodgerblue: "1e90ff",
                firebrick: "b22222",
                floralwhite: "fffaf0",
                forestgreen: "228b22",
                fuchsia: "f0f",
                gainsboro: "dcdcdc",
                ghostwhite: "f8f8ff",
                gold: "ffd700",
                goldenrod: "daa520",
                gray: "808080",
                green: "008000",
                greenyellow: "adff2f",
                grey: "808080",
                honeydew: "f0fff0",
                hotpink: "ff69b4",
                indianred: "cd5c5c",
                indigo: "4b0082",
                ivory: "fffff0",
                khaki: "f0e68c",
                lavender: "e6e6fa",
                lavenderblush: "fff0f5",
                lawngreen: "7cfc00",
                lemonchiffon: "fffacd",
                lightblue: "add8e6",
                lightcoral: "f08080",
                lightcyan: "e0ffff",
                lightgoldenrodyellow: "fafad2",
                lightgray: "d3d3d3",
                lightgreen: "90ee90",
                lightgrey: "d3d3d3",
                lightpink: "ffb6c1",
                lightsalmon: "ffa07a",
                lightseagreen: "20b2aa",
                lightskyblue: "87cefa",
                lightslategray: "789",
                lightslategrey: "789",
                lightsteelblue: "b0c4de",
                lightyellow: "ffffe0",
                lime: "0f0",
                limegreen: "32cd32",
                linen: "faf0e6",
                magenta: "f0f",
                maroon: "800000",
                mediumaquamarine: "66cdaa",
                mediumblue: "0000cd",
                mediumorchid: "ba55d3",
                mediumpurple: "9370db",
                mediumseagreen: "3cb371",
                mediumslateblue: "7b68ee",
                mediumspringgreen: "00fa9a",
                mediumturquoise: "48d1cc",
                mediumvioletred: "c71585",
                midnightblue: "191970",
                mintcream: "f5fffa",
                mistyrose: "ffe4e1",
                moccasin: "ffe4b5",
                navajowhite: "ffdead",
                navy: "000080",
                oldlace: "fdf5e6",
                olive: "808000",
                olivedrab: "6b8e23",
                orange: "ffa500",
                orangered: "ff4500",
                orchid: "da70d6",
                palegoldenrod: "eee8aa",
                palegreen: "98fb98",
                paleturquoise: "afeeee",
                palevioletred: "db7093",
                papayawhip: "ffefd5",
                peachpuff: "ffdab9",
                peru: "cd853f",
                pink: "ffc0cb",
                plum: "dda0dd",
                powderblue: "b0e0e6",
                purple: "800080",
                rebeccapurple: "663399",
                red: "f00",
                rosybrown: "bc8f8f",
                royalblue: "4169e1",
                saddlebrown: "8b4513",
                salmon: "fa8072",
                sandybrown: "f4a460",
                seagreen: "2e8b57",
                seashell: "fff5ee",
                sienna: "a0522d",
                silver: "c0c0c0",
                skyblue: "87ceeb",
                slateblue: "6a5acd",
                slategray: "708090",
                slategrey: "708090",
                snow: "fffafa",
                springgreen: "00ff7f",
                steelblue: "4682b4",
                tan: "d2b48c",
                teal: "008080",
                thistle: "d8bfd8",
                tomato: "ff6347",
                turquoise: "40e0d0",
                violet: "ee82ee",
                wheat: "f5deb3",
                white: "fff",
                whitesmoke: "f5f5f5",
                yellow: "ff0",
                yellowgreen: "9acd32"
            };

            // Make it easy to access colors via `hexNames[hex]`
            var hexNames = tinycolor.hexNames = flip(names);

            // Utilities
            // ---------

            // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
            function flip(o) {
                var flipped = {};
                for (var i in o) {
                    if (o.hasOwnProperty(i)) {
                        flipped[o[i]] = i;
                    }
                }
                return flipped;
            }

            // Return a valid alpha value [0,1] with all invalid values being set to 1
            function boundAlpha(a) {
                a = parseFloat(a);

                if (isNaN(a) || a < 0 || a > 1) {
                    a = 1;
                }

                return a;
            }

            // Take input from [0, n] and return it as [0, 1]
            function bound01(n, max) {
                if (isOnePointZero(n)) {
                    n = "100%";
                }

                var processPercent = isPercentage(n);
                n = mathMin(max, mathMax(0, parseFloat(n)));

                // Automatically convert percentage into number
                if (processPercent) {
                    n = parseInt(n * max, 10) / 100;
                }

                // Handle floating point rounding errors
                if (Math.abs(n - max) < 0.000001) {
                    return 1;
                }

                // Convert into [0, 1] range if it isn't already
                return n % max / parseFloat(max);
            }

            // Force a number between 0 and 1
            function clamp01(val) {
                return mathMin(1, mathMax(0, val));
            }

            // Parse a base-16 hex value into a base-10 integer
            function parseIntFromHex(val) {
                return parseInt(val, 16);
            }

            // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
            // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
            function isOnePointZero(n) {
                return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
            }

            // Check to see if string passed in is a percentage
            function isPercentage(n) {
                return typeof n === "string" && n.indexOf('%') != -1;
            }

            // Force a hex value to have 2 characters
            function pad2(c) {
                return c.length == 1 ? '0' + c : '' + c;
            }

            // Replace a decimal with it's percentage value
            function convertToPercentage(n) {
                if (n <= 1) {
                    n = n * 100 + "%";
                }

                return n;
            }

            // Converts a decimal to a hex value
            function convertDecimalToHex(d) {
                return Math.round(parseFloat(d) * 255).toString(16);
            }
            // Converts a hex value to a decimal
            function convertHexToDecimal(h) {
                return parseIntFromHex(h) / 255;
            }

            var matchers = function () {

                // <http://www.w3.org/TR/css3-values/#integers>
                var CSS_INTEGER = "[-\\+]?\\d+%?";

                // <http://www.w3.org/TR/css3-values/#number-value>
                var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

                // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
                var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

                // Actual matching.
                // Parentheses and commas are optional, but not required.
                // Whitespace can take the place of commas or opening paren
                var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
                var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

                return {
                    CSS_UNIT: new RegExp(CSS_UNIT),
                    rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
                    rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
                    hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
                    hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
                    hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
                    hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
                    hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
                    hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
                    hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
                    hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
                };
            }();

            // `isValidCSSUnit`
            // Take in a single string / number and check to see if it looks like a CSS unit
            // (see `matchers` above for definition).
            function isValidCSSUnit(color) {
                return !!matchers.CSS_UNIT.exec(color);
            }

            // `stringInputToObject`
            // Permissive string parsing.  Take in a number of formats, and output an object
            // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
            function stringInputToObject(color) {

                color = color.replace(trimLeft, '').replace(trimRight, '').toLowerCase();
                var named = false;
                if (names[color]) {
                    color = names[color];
                    named = true;
                } else if (color == 'transparent') {
                    return { r: 0, g: 0, b: 0, a: 0, format: "name" };
                }

                // Try to match string input using regular expressions.
                // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
                // Just return an object and let the conversion functions handle that.
                // This way the result will be the same whether the tinycolor is initialized with string or object.
                var match;
                if (match = matchers.rgb.exec(color)) {
                    return { r: match[1], g: match[2], b: match[3] };
                }
                if (match = matchers.rgba.exec(color)) {
                    return { r: match[1], g: match[2], b: match[3], a: match[4] };
                }
                if (match = matchers.hsl.exec(color)) {
                    return { h: match[1], s: match[2], l: match[3] };
                }
                if (match = matchers.hsla.exec(color)) {
                    return { h: match[1], s: match[2], l: match[3], a: match[4] };
                }
                if (match = matchers.hsv.exec(color)) {
                    return { h: match[1], s: match[2], v: match[3] };
                }
                if (match = matchers.hsva.exec(color)) {
                    return { h: match[1], s: match[2], v: match[3], a: match[4] };
                }
                if (match = matchers.hex8.exec(color)) {
                    return {
                        r: parseIntFromHex(match[1]),
                        g: parseIntFromHex(match[2]),
                        b: parseIntFromHex(match[3]),
                        a: convertHexToDecimal(match[4]),
                        format: named ? "name" : "hex8"
                    };
                }
                if (match = matchers.hex6.exec(color)) {
                    return {
                        r: parseIntFromHex(match[1]),
                        g: parseIntFromHex(match[2]),
                        b: parseIntFromHex(match[3]),
                        format: named ? "name" : "hex"
                    };
                }
                if (match = matchers.hex4.exec(color)) {
                    return {
                        r: parseIntFromHex(match[1] + '' + match[1]),
                        g: parseIntFromHex(match[2] + '' + match[2]),
                        b: parseIntFromHex(match[3] + '' + match[3]),
                        a: convertHexToDecimal(match[4] + '' + match[4]),
                        format: named ? "name" : "hex8"
                    };
                }
                if (match = matchers.hex3.exec(color)) {
                    return {
                        r: parseIntFromHex(match[1] + '' + match[1]),
                        g: parseIntFromHex(match[2] + '' + match[2]),
                        b: parseIntFromHex(match[3] + '' + match[3]),
                        format: named ? "name" : "hex"
                    };
                }

                return false;
            }

            function validateWCAG2Parms(parms) {
                // return valid WCAG2 parms for isReadable.
                // If input parms are invalid, return {"level":"AA", "size":"small"}
                var level, size;
                parms = parms || { "level": "AA", "size": "small" };
                level = (parms.level || "AA").toUpperCase();
                size = (parms.size || "small").toLowerCase();
                if (level !== "AA" && level !== "AAA") {
                    level = "AA";
                }
                if (size !== "small" && size !== "large") {
                    size = "small";
                }
                return { "level": level, "size": size };
            }

            exports.default = tinycolor;
        }, {}], 16: [function (require, module, exports) {
            /* global module, wx, window: false, document: false */
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.WxCanvasRenderingContext2D = undefined;

            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
                };
            }();

            var _helper = require('./helper');

            function _toConsumableArray(arr) {
                if (Array.isArray(arr)) {
                    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                        arr2[i] = arr[i];
                    }return arr2;
                } else {
                    return Array.from(arr);
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            // Chart default config
            var WX_CANVAS_DEFAULT_PROPERTY = {
                width: 300,
                height: 200
            };
            var WX_CANVAS_CTX_DEFAULT_PROPERTY = {
                fillStyle: '#000000',
                lineCap: 'butt',
                lineJoin: 'miter',
                miterLimit: 10,
                lineWidth: 1,
                strokeStyle: '#000000',
                shadowBlur: 0,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowColor: '#000000',
                font: '10px',
                textBaseline: 'alphabetic', // only support top, middle and alphabetic
                textAlign: 'start' // only support start, end and center
            };

            // Base text size
            var WX_BASE_TEXT_SIZE = 9;

            var pxReg = /([\d.]+)px/;
            /**
             * Compatible canvas object
             */

            var WxCanvas = function () {
                function WxCanvas(id, config, contextOptions) {
                    _classCallCheck(this, WxCanvas);

                    var me = this;

                    me.isWeiXinAPP = (0, _helper.checkWX)();
                    me._config = (0, _helper.extend)({}, WX_CANVAS_DEFAULT_PROPERTY, me.initConfig(config));

                    // Acquire canvas context

                    var _acquireContext = this.acquireContext(id, config),
                        canvas = _acquireContext.canvas,
                        context = _acquireContext.context;

                    me._canvas = canvas;
                    me._ctx = context;
                    me.wxCanvasRenderingContext2D = new WxCanvasRenderingContext2D(canvas, context, contextOptions);

                    return me;
                }

                /**
                 * Initialization WxCanvas config
                 * @param {Object} config
                 * @returns {boolean}
                 */

                _createClass(WxCanvas, [{
                    key: 'initConfig',
                    value: function initConfig(config) {
                        if (!config) {
                            return;
                        }

                        if (typeof config.width != 'undefined') {
                            config.width = (0, _helper.wxConverToPx)(config.width);
                        }
                        if (typeof config.height != 'undefined') {
                            config.height = (0, _helper.wxConverToPx)(config.height);
                        }
                        return config;
                    }

                    /**
                     * Create Canvas context
                     * @param {String} id
                     * @param {Object} config
                     * @returns {*}
                     */

                }, {
                    key: 'acquireContext',
                    value: function acquireContext(id, config) {
                        var me = this,
                            canvas = void 0,
                            context = void 0;
                        if (_helper.is.String(id)) {
                            canvas = me.isWeiXinAPP ? context = wx.createCanvasContext(id) : document.getElementById(id);
                        } else if (me.isWeiXinAPP) {
                            throw new Error('Should set an id');
                        }

                        if (typeof HTMLCanvasElement != 'undefined' && canvas instanceof HTMLCanvasElement) {
                            context = canvas.getContext && canvas.getContext('2d');
                        }

                        if (!canvas || !context) {
                            console.error("Failed to create WxCanvas: can't acquire context!");
                        }

                        this.initCanvas(canvas);
                        return { canvas: canvas, context: context };
                    }

                    /**
                     * Initializes the HTMLCanvasElement style and render size without modifying the canvas display size
                     */

                }, {
                    key: 'initCanvas',
                    value: function initCanvas(canvas) {
                        var config = this._config,
                            renderHeight = void 0,
                            renderWidth = void 0,
                            display = void 0,
                            height = void 0,
                            width = void 0;
                        if (this.isWeiXinAPP) {
                            renderHeight = height = config.height;
                            renderWidth = width = config.width;
                            display = config.display;
                        } else {
                            var style = canvas.style;

                            // NOTE(SB) canvas.getAttribute('width') !== canvas.width: in the first case it
                            // returns null or '' if no explicit value has been set to the canvas attribute.
                            renderHeight = canvas.getAttribute('height');
                            renderWidth = canvas.getAttribute('width');

                            // Force canvas to display as block to avoid extra space caused by inline
                            // elements, which would interfere with the responsive resize process.
                            // https://github.com/chartjs/Chart.js/issues/2538
                            style.display = style.display || 'block';

                            if (renderWidth === null || renderWidth === '') {
                                var displayWidth = (0, _helper.readUsedSize)(canvas, 'width');
                                if (displayWidth !== undefined) {
                                    canvas.width = displayWidth;
                                    width = displayWidth;
                                }
                            }

                            if (renderHeight === null || renderHeight === '') {
                                if (canvas.style.height === '') {
                                    // If no explicit render height and style height, let's apply the aspect ratio,
                                    // which one can be specified by the user but also by charts as default option
                                    // (i.e. options.aspectRatio). If not specified, use canvas aspect ratio of 2.
                                    canvas.height = height = canvas.width / (config.options.aspectRatio || 2);
                                } else {
                                    var displayHeight = (0, _helper.readUsedSize)(canvas, 'height');
                                    if (displayWidth !== undefined) {
                                        canvas.height = displayHeight;
                                        height = displayHeight;
                                    }
                                }
                            }
                        }

                        // Chart.js modifies some canvas values that we want to restore on destroy
                        config._wxChart = {
                            initial: {
                                height: renderHeight,
                                width: renderWidth,
                                style: {
                                    display: display,
                                    height: height,
                                    width: width
                                }
                            }
                        };

                        return canvas;
                    }

                    /**
                     * Restores the canvas initial state, such as render/display sizes and style.
                     */

                }, {
                    key: 'releaseContext',
                    value: function releaseContext() {
                        var canvas = this._canvas,
                            config = this._config;
                        if (!config._wxChart) {
                            return;
                        }

                        var initial = config._wxChart.initial;
                        if (this.isWeiXinAPP) {
                            // Do nothing
                        } else {
                            ['height', 'width'].forEach(function (prop) {
                                var value = initial[prop];
                                if (value === undefined || value === null) {
                                    canvas.removeAttribute(prop);
                                } else {
                                    canvas.setAttribute(prop, value);
                                }
                            });

                            var _iteratorNormalCompletion = true;
                            var _didIteratorError = false;
                            var _iteratorError = undefined;

                            try {
                                for (var _iterator = initial.style[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    var key = _step.value;

                                    canvas.style[key] = initial.style[key];
                                }

                                // The canvas render size might have been changed (and thus the state stack discarded),
                                // we can't use save() and restore() to restore the initial state. So make sure that at
                                // least the canvas context is reset to the default state by setting the canvas width.
                                // https://www.w3.org/TR/2011/WD-html5-20110525/the-canvas-element.html
                            } catch (err) {
                                _didIteratorError = true;
                                _iteratorError = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion && _iterator.return) {
                                        _iterator.return();
                                    }
                                } finally {
                                    if (_didIteratorError) {
                                        throw _iteratorError;
                                    }
                                }
                            }

                            canvas.width = canvas.width;
                        }

                        delete config._wxChart;
                    }
                }, {
                    key: 'getContext',
                    value: function getContext(str) {
                        if (str === '2d') {
                            return this.wxCanvasRenderingContext2D;
                        }
                    }

                    // Property

                }, {
                    key: 'height',
                    get: function get() {
                        if (this.isWeiXinAPP) {
                            return this._config.height;
                        } else {
                            var renderHeight = (0, _helper.wxConverToPx)(this._canvas.getAttribute('height'));
                            if (renderHeight === null || renderHeight === '') {
                                return (0, _helper.readUsedSize)(canvas, 'height');
                            }
                            return renderHeight;
                        }
                    },
                    set: function set(val) {
                        if (this.isWeiXinAPP) {
                            // Can not set WeiXin app height
                        } else {
                            this._canvas.height = val;
                        }
                    }
                }, {
                    key: 'width',
                    get: function get() {
                        if (this.isWeiXinAPP) {
                            return this._config.width;
                        } else {
                            var renderWidth = (0, _helper.wxConverToPx)(this._canvas.getAttribute('width'));
                            if (renderWidth === null || renderWidth === '') {
                                return (0, _helper.readUsedSize)(canvas, 'width');
                            }
                            return renderWidth;
                        }
                    },
                    set: function set(val) {
                        if (this.isWeiXinAPP) {
                            // Can not set WeiXin app height
                        } else {
                            this._canvas.width = val;
                        }
                    }
                }]);

                return WxCanvas;
            }();

            exports.default = WxCanvas;

            var WxCanvasRenderingContext2D = exports.WxCanvasRenderingContext2D = function () {
                function WxCanvasRenderingContext2D(canvas, context, options) {
                    _classCallCheck(this, WxCanvasRenderingContext2D);

                    var me = this;

                    me.canvas = canvas;
                    me._ctx = context;
                    me.isWeiXinAPP = (0, _helper.checkWX)();

                    // Canvas property cache stack
                    me._ctxOptions = options;
                    me._propertyCache = [(0, _helper.extend)({}, WX_CANVAS_CTX_DEFAULT_PROPERTY, options)];
                    me.cp = me._propertyCache[0];

                    me.createStyleProperty();
                    me.createShadowsProperty();
                    me.createTextProperty();
                    me.createLineProperty();
                    me.createRectProperty();
                    me.createGradientProperty();
                    me.createPathProperty();
                    me.createTransformationProperty();
                    me.createGlobalAlphaProperty();
                    return me;
                }

                // Save function


                _createClass(WxCanvasRenderingContext2D, [{
                    key: 'save',
                    value: function save() {
                        var me = this;
                        me._ctx.save();
                        var nProperty = (0, _helper.extend)({}, WX_CANVAS_CTX_DEFAULT_PROPERTY, me._ctxOptions);
                        me._propertyCache.push(nProperty);
                        me.cp = nProperty;
                        return me.cp;
                    }

                    // Restore function

                }, {
                    key: 'restore',
                    value: function restore() {
                        var me = this;
                        me._ctx.restore();
                        if (me.cp != null && me._propertyCache.length > 1) {
                            me._propertyCache.pop();
                            me.cp = me._propertyCache[me._propertyCache.length - 1];
                        }
                        return me.cp;
                    }

                    // Property

                }, {
                    key: '_wxSetPropertyCallable',
                    value: function _wxSetPropertyCallable(value, propertyName) {
                        var wxSetName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'set' + propertyName.replace(/(\w)/, function (v) {
                            return v.toUpperCase();
                        });

                        var me = this;

                        if (_helper.is.Null(value) || _helper.is.Undefined(value)) {
                            return value;
                        }
                        if (me.isWeiXinAPP) {
                            me._ctx[wxSetName](value);
                            me.cp[propertyName] = value;
                        } else {
                            me._ctx[propertyName] = value;
                            me.cp[propertyName] = me._ctx[propertyName];
                        }
                        return value;
                    }

                    // Normally property weixin app not support

                }, {
                    key: '_wxSetProperty',
                    value: function _wxSetProperty(value, propertyName) {
                        var setWX = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

                        var me = this;

                        if (_helper.is.Null(value) || _helper.is.Undefined(value)) {
                            return value;
                        }
                        if (me.isWeiXinAPP) {
                            me.cp[propertyName] = value;
                            setWX ? me._ctx[propertyName] = value : null;
                        } else {
                            me._ctx[propertyName] = value;
                            me.cp[propertyName] = me._ctx[propertyName];
                        }
                        return value;
                    }
                }, {
                    key: 'createStyleProperty',
                    value: function createStyleProperty() {
                        var me = this;

                        var styleProperty = ['fillStyle', 'strokeStyle'];
                        styleProperty.forEach(function (p) {
                            Object.defineProperty(me, p, {
                                get: function get() {
                                    return me.cp[p];
                                },
                                set: function set(value) {
                                    if (value) {
                                        return me._wxSetPropertyCallable(value.toLowerCase(), p);
                                    }
                                }
                            });
                        });
                    }
                }, {
                    key: 'createShadowsProperty',
                    value: function createShadowsProperty() {
                        var _this = this;

                        var me = this;
                        // Shadow property
                        ['shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'shadowColor'].forEach(function (p) {
                            Object.defineProperty(me, p, {
                                get: function get() {
                                    return me.cp[p];
                                },
                                set: function set(value) {
                                    var me = _this;
                                    if (me.isWeiXinAPP) {
                                        me.cp[p] = value;
                                        me._ctx.setShadow(me.cp['shadowOffsetX'] || 0, me.cp['shadowOffsetY'] || 0, me.cp['shadowBlur'] || 0, me.cp['shadowColor'] || '#000000');
                                    } else if (!_helper.is.Null(value) && !_helper.is.Undefined(value)) {
                                        me._ctx[p] = value;
                                        me.cp[p] = me._ctx[p];
                                    }
                                    return value;
                                }
                            });
                        });
                    }

                    // Text property

                }, {
                    key: 'createTextProperty',
                    value: function createTextProperty() {
                        var me = this;

                        ['textAlign', 'textBaseline'].forEach(function (p) {
                            Object.defineProperty(me, p, {
                                get: function get() {
                                    return me.cp[p];
                                },
                                set: function set(value) {
                                    return me._wxSetProperty(value, p);
                                }
                            });
                        });

                        Object.defineProperty(me, 'font', {
                            get: function get() {
                                return me.cp.font;
                            },
                            set: function set(value) {
                                if (me.isWeiXinAPP) {
                                    var m = value.match(pxReg);
                                    if (!!m) {
                                        var fontSize = +m[1];
                                        me._ctx.setFontSize(fontSize);
                                        me.cp.font = value;
                                    }
                                } else {
                                    me._ctx.font = value;
                                    me.cp.font = me._ctx.font;
                                }
                                return me.cp.font;
                            }
                        });

                        Object.defineProperty(me, 'fontSize', {
                            get: function get() {
                                return parseInt(me.cp.font);
                            },
                            set: function set(value) {
                                var fontSize = parseInt(value);
                                if (_helper.is.NaN(fontSize)) {
                                    return;
                                }

                                var currentFont = me.isWeiXinAPP ? me.cp.font : me._ctx.font;
                                currentFont = currentFont.replace(pxReg, fontSize + 'px');
                                if (me.isWeiXinAPP) {
                                    me._ctx.setFontSize(fontSize);
                                    me.cp.font = currentFont;
                                } else {
                                    me._ctx.font = currentFont;
                                    me.cp.font = me._ctx.font;
                                }
                                return me.cp.font;
                            }
                        });
                    }
                    // Wrapper 'measureText' function for WeiXin APP

                }, {
                    key: 'measureText',
                    value: function measureText(text) {
                        var fontSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.fontSize;

                        var me = this;
                        if (me.isWeiXinAPP) {
                            if (!text) {
                                return 0;
                            }
                            var textLen = text.length;
                            var hanzi = text.match(new RegExp(_helper.REG_HANZI, 'g'));
                            var hanziNum = !!hanzi ? hanzi.length : 0;
                            var otherNum = textLen - hanziNum;

                            return {
                                'width': fontSize * (otherNum + hanziNum * 2) / 2 + fontSize / 4
                            };
                        } else {
                            return me._ctx.measureText(text);
                        }
                    }
                }, {
                    key: '_calculateYForTextBaseline',
                    value: function _calculateYForTextBaseline(y, text) {
                        var baseNum = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : WX_BASE_TEXT_SIZE;

                        var me = this,
                            culY = y;

                        if (!me.isWeiXinAPP) {
                            return culY;
                        }

                        var fontSize = me.fontSize;
                        var textBaseline = me.textBaseline;
                        switch (textBaseline) {
                            case 'top':
                                culY = fontSize * baseNum / 10 + y;
                                break;
                            case 'middle':
                                culY = fontSize * baseNum / 20 + y;
                                break;
                            case 'alphabetic':
                                break;
                        }
                        return culY;
                    }
                }, {
                    key: '_calculateXFortextAlign',
                    value: function _calculateXFortextAlign(x, text) {
                        var baseNum = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : WX_BASE_TEXT_SIZE;

                        var me = this,
                            culX = x;
                        if (!me.isWeiXinAPP) {
                            return culX;
                        }

                        var textAlign = me.textAlign;
                        switch (textAlign) {
                            case 'end':
                                culX = x - me.measureText(text).width;
                                break;
                            case 'center':
                                culX = x - me.measureText(text).width / 2;
                                break;
                            case 'start':
                                break;
                        }
                        return culX;
                    }
                    /**
                     * Overwrite fillText
                     * Weixin 0.12 not support 'textBaseline', 'textAlign' attribute, so we should figure out it.
                     * @param text
                     * @param x
                     * @param y
                     * @param options - [maxWidth, baseNum = WX_BASE_TEXT_SIZE]
                     * @returns {*}
                     */

                }, {
                    key: 'fillText',
                    value: function fillText(text, x, y) {
                        for (var _len = arguments.length, options = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
                            options[_key - 3] = arguments[_key];
                        }

                        var me = this,
                            maxWidth = 0 in options ? options[0] : undefined,
                            baseNum = 1 in options ? options[1] : WX_BASE_TEXT_SIZE;
                        if (me.isWeiXinAPP) {
                            var culX = void 0,
                                culY = void 0;
                            culY = me._calculateYForTextBaseline(y, text, baseNum);
                            culX = me._calculateXFortextAlign(x, text, baseNum);
                            return me._ctx.fillText(text, culX, culY);
                        } else {
                            return me._ctx.fillText(text, x, y, maxWidth);
                        }
                    }
                }, {
                    key: 'strokeText',
                    value: function strokeText(text, x, y) {
                        var me = this;

                        for (var _len2 = arguments.length, options = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
                            options[_key2 - 3] = arguments[_key2];
                        }

                        if (me.isWeiXinAPP) {
                            return me.fillText.apply(me, [text, x, y].concat(options));
                        } else {
                            var _me$_ctx;

                            return (_me$_ctx = me._ctx).strokeText.apply(_me$_ctx, [text, x, y].concat(options));
                        }
                    }

                    // Line property

                }, {
                    key: 'createLineProperty',
                    value: function createLineProperty() {
                        var me = this;
                        var smProperty = ['lineCap', 'lineJoin', 'miterLimit', 'lineWidth'];
                        smProperty.forEach(function (p) {
                            Object.defineProperty(me, p, {
                                get: function get() {
                                    return me.cp[p];
                                },
                                set: function set(value) {
                                    return me._wxSetPropertyCallable(value, p);
                                }
                            });
                        });

                        ['lineDashOffset'].forEach(function (p) {
                            Object.defineProperty(me, p, {
                                get: function get() {
                                    return me.cp[p];
                                },
                                set: function set(value) {
                                    return me._wxSetProperty(value, p);
                                }
                            });
                        });
                    }
                }, {
                    key: 'setLineDash',
                    value: function setLineDash() {}
                }, {
                    key: 'getLineDash',
                    value: function getLineDash() {}

                    // Drawing rectangles

                }, {
                    key: 'createRectProperty',
                    value: function createRectProperty() {
                        var me = this;
                        ['clearRect', 'fillRect', 'strokeRect'].forEach(function (functionName) {
                            me[functionName] = function () {
                                var _me$_ctx2;

                                return (_me$_ctx2 = me._ctx)[functionName].apply(_me$_ctx2, arguments);
                            };
                        });
                    }

                    // Gradient

                }, {
                    key: 'createGradientProperty',
                    value: function createGradientProperty() {
                        var me = this;
                        ['createLinearGradient'].forEach(function (functionName) {
                            me[functionName] = function () {
                                var _me$_ctx3;

                                return (_me$_ctx3 = me._ctx)[functionName].apply(_me$_ctx3, arguments);
                            };
                        });
                    }
                }, {
                    key: 'createRadialGradient',
                    value: function createRadialGradient(x0, y0, r0, x1, y1, r1) {
                        var me = this;
                        if (me.isWeiXinAPP) {
                            return me._ctx.createCircularGradient(x0, y0, r0);
                        } else {
                            return me._ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
                        }
                    }

                    // Paths and Drawing paths

                }, {
                    key: 'createPathProperty',
                    value: function createPathProperty() {
                        var me = this;
                        ['beginPath', 'closePath', 'moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'arc', 'rect'].forEach(function (functionName) {
                            me[functionName] = function () {
                                var _me$_ctx4;

                                return (_me$_ctx4 = me._ctx)[functionName].apply(_me$_ctx4, arguments);
                            };
                        });

                        ['fill', 'stroke'].forEach(function (functionName) {
                            me[functionName] = function () {
                                var _me$_ctx5;

                                return (_me$_ctx5 = me._ctx)[functionName].apply(_me$_ctx5, arguments);
                            };
                        });
                    }
                }, {
                    key: 'clip',
                    value: function clip() {
                        var me = this;
                        if (me.isWeiXinAPP) {
                            throw new Error('WeiXin APP not support "clip" function yet!');
                        } else {
                            var _me$_ctx6;

                            return (_me$_ctx6 = me._ctx).clip.apply(_me$_ctx6, arguments);
                        }
                    }

                    // Transformations

                }, {
                    key: 'createTransformationProperty',
                    value: function createTransformationProperty() {
                        var me = this;
                        ['rotate', 'scale', 'translate'].forEach(function (functionName) {
                            me[functionName] = function () {
                                var _me$_ctx7;

                                return (_me$_ctx7 = me._ctx)[functionName].apply(_me$_ctx7, arguments);
                            };
                        });
                    }
                }, {
                    key: 'transform',
                    value: function transform() {
                        var me = this;
                        if (me.isWeiXinAPP) {
                            throw new Error('WeiXin APP not support "transform" function yet!');
                        } else {
                            var _me$_ctx8;

                            return (_me$_ctx8 = me._ctx).transform.apply(_me$_ctx8, _toConsumableArray(args));
                        }
                    }

                    // globalAlpha

                }, {
                    key: 'createGlobalAlphaProperty',
                    value: function createGlobalAlphaProperty() {
                        var me = this;
                        ['globalAlpha'].forEach(function (p) {
                            Object.defineProperty(me, p, {
                                get: function get() {
                                    return me.cp[p];
                                },
                                set: function set(value) {
                                    return me._wxSetPropertyCallable(value, p);
                                }
                            });
                        });
                    }
                    // Draw function

                }, {
                    key: 'draw',
                    value: function draw() {
                        var ctu = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

                        if (this.isWeiXinAPP) {
                            this._ctx.draw(ctu);
                        }
                    }
                }]);

                return WxCanvasRenderingContext2D;
            }();
        }, { "./helper": 13 }], 17: [function (require, module, exports) {
            "use strict";

            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.WxBar = exports.WxLiner = exports.WxDoughnut = exports.WxChart = undefined;

            var _wxChart = require('./charts/wxChart');

            var _wxChart2 = _interopRequireDefault(_wxChart);

            var _doughnut = require('../src/charts/doughnut');

            var _doughnut2 = _interopRequireDefault(_doughnut);

            var _liner = require('../src/charts/liner');

            var _liner2 = _interopRequireDefault(_liner);

            var _bar = require('../src/charts/bar');

            var _bar2 = _interopRequireDefault(_bar);

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            exports.WxChart = _wxChart2.default;
            exports.WxDoughnut = _doughnut2.default;
            exports.WxLiner = _liner2.default;
            exports.WxBar = _bar2.default;
        }, { "../src/charts/bar": 1, "../src/charts/doughnut": 2, "../src/charts/liner": 3, "./charts/wxChart": 4 }] }, {}, [17])(17);
});