/* global module, wx, window: false, document: false */
'use strict';

import WxCanvas from '../util/wxCanvas';
import WxChart from './wxChart';
import WxTitle from '../core/title';
import WxScale from '../core/scale';
import WxLinerScale from '../scale/scale.liner';
import WxCrossScale from '../scale/scale.crosshelp';
import WxCategoryScale from '../scale/scale.category';
import WxLegend from '../core/legend';
import WxLayout, {BoxInstance} from '../core/layout';
import {extend, is, splineCurve, shadeBlendConvert} from '../util/helper';
import tinycolor from '../util/tinycolor';
import randomColor from '../util/randomColor';

// Bar legend's default config
const WX_BAR_LEGEND_DEFAULT_CONFIG = {
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
const WX_BAR_DEFAULT_CONFIG = {
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
        xMargin: function(xBox, yBox, area, xScale, yScale, xScaleDatasets) {
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

const WX_BAR_ITEM_DEFAULT_CONFIG = {
    //borderWidth: 1,
    //fillArea: true,
    //fillAlpha: 0.5,
    //strokeStyle: '#ffffff',
    display: true
};


export default class WxBar extends WxChart {
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
    constructor(id, config) {
        super(id, config);

        let me = this;
        me.chartConfig = extend({}, WX_BAR_DEFAULT_CONFIG, config);

        me.title = null;
        // Initialize title and legend
        if (me.chartConfig.title) {
            me.title = new WxTitle(me, is.PureObject(me.chartConfig.title)
                ? me.chartConfig.title
                : null);
            me.titleText = is.String(me.chartConfig.title)
                ? me.chartConfig.title
                : me.chartConfig.title.text;
        }

        // Initialize legend
        me.legend = new WxLegend(me, me.chartConfig.legendOptions);

        // Initialize x,y Scale
        me.yAxis = new WxLinerScale(me, me.chartConfig.yScaleOptions);
        me.xAxis = new WxCategoryScale(me, me.chartConfig.xScaleOptions);
        me.wxCrossScale = new WxCrossScale(me.xAxis, me.yAxis, me.chartConfig.crossScaleOptions);
        me.wxLayout = new WxLayout(me);
    }

    // Get/Set labels
    get labels() {
        let me = this,
            tmp;
        if (me._labels) {
            return me._labels;
        } else if (tmp = me.chartConfig.labels) {
            if (is.Array(tmp)) {
                return tmp;
            }
        }
        me._labels = me.visDatasets.map(dataset => dataset.label);
        return me._labels;
    }

    get legends() {
        let me = this;
        if (!me._legends) {
            me._legends = me._getLegendConfig();
        }
        return me._legends;
    }

    set legends(value) {
        this._legends = value;
    }

    /**
     * Build legends config
     * @private
     */
    _getLegendConfig() {
        let me = this,
            defaultKey = me.chartConfig.defaultKey || 'value',
            legendsConfig = me.chartConfig.legends;
        if (!legendsConfig) {
            if (me.labels && me.labels.length) {
                legendsConfig = me.labels.map(label => {
                    return {'text': label, 'key': defaultKey};
                })
            } else {
                throw new Error('Can not get legend config!');
            }
        } else {
            legendsConfig = legendsConfig.map(legend => {
                return extend(true, {
                    'key': defaultKey
                }, legend);
            })
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
    update(datasets) {
        let me = this;
        me._labels = null;
        me._legends = null;
        super.update(datasets, WX_BAR_ITEM_DEFAULT_CONFIG);
        me.wxLayout.removeAllBox();
        return me.draw();
    }
    /**
     * Draw chart
     */
    draw() {
        let box,
            me = this,
            ctx = me.ctx,
            wxLayout = me.wxLayout;
        let {pointPercentage, minBetweenPixel, stacked, color, zeroLine} = me.chartConfig;

        // First, we draw title
        box = wxLayout.adjustBox();
        if (me.title) {
            me.title.update(me.titleText, box);
            wxLayout.addBox(me.title.box);
        }

        // Second, random color and get legend datasets
        box = wxLayout.adjustBox();
        let rColors = randomColor(extend(true, {}, color, {count: me.legends.length}));

        me.legends = me.legends.map(function(legend, index) {
            if (!legend.strokeStyle) {
                legend.strokeStyle = legend.borderColor ||
                    tinycolor(rColors[index]).darken(10).toString();
            }

            return extend(true, {
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
        let hasNeg = false;
        let barConfigs = me.legends.map(function(legend, legendIndex) {
            let config = {
                legend: legend
            };
            let key = legend.key;
            config.dataset = me.visDatasets.map((data, index) => {
                hasNeg = hasNeg || data[key]<0;
                return {
                    value: data[key],
                    data: data,
                    point: me.calculateBarRect(index, legendIndex)
                }
            });
            return config;
        });

        barConfigs.forEach(bar => me._drawBar(bar, hasNeg));

        // zero line
        if (zeroLine) {
            ctx.save();
            ctx.fillStyle = me.xAxis.config.color;
            ctx.lineWidth = me.xAxis.config.lineWidth;

            let baseY = me.yAxis.getPoint(0).y;
            let beginPoint = [me.xAxis.getPoint(-1).x, baseY],
                endPoint = [me.xAxis.box.ex, baseY];
            ctx.beginPath();
            ctx.moveTo(...beginPoint);
            ctx.lineTo(...endPoint);
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
    _drawBar(barData, hasNeg) {
        let me = this,
            stacked = me.chartConfig.stacked,
            ctx = me.ctx;
        let {legend, dataset} = barData;
        let {
            display,
            borderWidth,
            fillStyle,
            strokeStyle,
            fillArea,
            fillAlpha
        } = legend;

        if (!display) {
            return;
        }

        ctx.save();
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = borderWidth;

        dataset.forEach(d => {
            ctx.beginPath();
            let { value, data, point } = d;
            if (stacked && hasNeg) {
                ctx.rect(point.x ,point.y ,point.barWidth, point.barHeight);
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
                let points = [
                    [point.x, point.y + point.barHeight],
                    [point.x, point.y],
                    [point.x + point.barWidth, point.y],
                    [point.x + point.barWidth, point.y + point.barHeight]
                ];

                ctx.moveTo(...points[0]);
                ctx.lineTo(...points[1]);
                ctx.lineTo(...points[2]);
                ctx.lineTo(...points[3]);

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
    calculateBarRuler(scale = this.xAxis) {
        let me = this;
        let globalBarWidth, globalBarPercentage = me.chartConfig.barPercentage,
            pointPercentage = me.chartConfig.pointPercentage,
            stacked = me.chartConfig.stacked,
            legends = me.legends;
        let legendLen = legends.length;

        let tickWidth = scale.calculateTickWidth();
        // One scale's point space
        let pointWidth = tickWidth * pointPercentage;
        let pointIntervalWidth = (tickWidth - pointWidth) / 2;

        // Standardization every bar's percentage
        let totalStandardPercentage = 0;
        if (!globalBarPercentage) {
            globalBarPercentage = stacked ?
                Math.max(...legends.map(x => x.barPercentage||0.8)) || 0.8 :
                0.8;
        }
        globalBarWidth = Math.max(...[globalBarPercentage*pointWidth].concat(
                legends.map(x => { return is.Number(x.barWidth) ? x.barWidth : 0;})
            )
        );

        legends.forEach(legend => {
            if (stacked) {
                legend.barWidth = globalBarWidth;
                legend.barPercentage = globalBarPercentage;
                legend._standardPercentage = globalBarPercentage / legendLen;
            } else {
                let standardPercentage;
                let barPercentage = legend.barPercentage ?
                    (legend.barPercentage>1?1.0:legend.barPercentage) :
                    globalBarPercentage;

                if (legend.barWidth) {
                    // Bar fixed width...
                    standardPercentage = legend.barWidth / tickWidth;
                } else {
                    standardPercentage  = barPercentage / legendLen;
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

        let barIntervalWidth = legendLen > 1 ?
            pointWidth * (1-totalStandardPercentage) / (legendLen-1) :
            pointWidth * (1-totalStandardPercentage);

        return {tickWidth, pointPercentage, pointWidth, pointIntervalWidth, legends, barIntervalWidth};
    }

    /**
     * Calculate the box of one "rect"
     * @param {number} index - The index of item
     * @param {number} legendIndex - The index of legend
     * @param {WxScale} [xScale=this.xAxis] - Bar's x-axis
     * @param {WxScale} [yScale=this.yAxis] - Bar's x-axis
     */
    calculateBarRect(index, legendIndex, xScale = this.xAxis, yScale = this.yAxis) {
        let me = this,
            stacked = me.chartConfig.stacked,
            barRuler = me.barRuler || me.calculateBarRuler(xScale);

        let legendOpt = me.legends[legendIndex];
        if (!legendOpt) {
            return;
        }
        // Calculate the bar's width in front of this legend
        let frontBarWidth = me.legends.slice(0, legendIndex).reduce((acc, cur) => acc + cur.barWidth, 0);
        let datas = me.visDatasets[index];
        let value = legendOpt.key && typeof datas[legendOpt.key] !== 'undefined' ?　
            datas[legendOpt.key] :
            null;
        if (is.Null(value) || is.Undefined(value)) {
            return;
        }

        let xPoint, yPoint, barWidth, barHeight;
        let xPointInstance = xScale.getPoint(index);
        if (stacked) {
            xPoint = xPointInstance.x - barRuler.pointWidth/2 + barRuler.barIntervalWidth/2;
            yPoint = me._getStackPoint(index, legendIndex, barRuler).y;
            barWidth = legendOpt.barWidth;

            let baseY = yScale.getPoint(0).y;
            barHeight = value < 0 ?
            (value / legendOpt.sumNeg) * (yScale.getPoint(legendOpt.sumNeg).y - baseY) :
            (value / legendOpt.sumPos) * (baseY - yScale.getPoint(legendOpt.sumPos).y)
        } else {
            xPoint = xPointInstance.x - barRuler.pointWidth/2 +
                frontBarWidth + barRuler.barIntervalWidth/2*(legendIndex+1);
            yPoint = yScale.getPoint(value).y;
            barWidth = legendOpt.barWidth;
            barHeight = xPointInstance.y - yPoint;
        }

        return {x: xPoint, y: yPoint, barWidth, barHeight};
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
    _getStackPoint(index, legendIndex, barRuler, yScale = this.yAxis) {
        let me = this,
            data = me.visDatasets[index],
            value = data[me.legends[legendIndex].key];

        let stackedVal, sumNeg = 0, sumPos = 0;
        for (let j = 0; j < legendIndex; j++) {
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

        return value < 0 ? yScale.getPoint(sumNeg) : yScale.getPoint(sumPos + value) ;
    }

    /**
     * Draw the scale of chart
     *
     * @private
     */
    _drawScale() {
        let box,
            me = this,
            wxLayout = me.wxLayout;

        box = wxLayout.adjustBox();
        let xDatasets = me.xScaleAxisDatas(),
            yDatasets = me.yScaleAxisDatas(box);
        let {xBox, yBox} = me.wxCrossScale.draw(box, xDatasets, yDatasets);
        wxLayout.addBox(xBox);
        wxLayout.addBox(yBox);
    }

    /**
     * Build the yAxis datasets
     * @param {BoxInstance} area - The area of chart
     */
    yScaleAxisDatas(area) {
        let me = this,
            stacked = me.chartConfig.stacked,
            ctx = me.ctx;
        let yScaleItemOptions = me.chartConfig.yScaleItemOptions;
        let tickLimits = me.yAxis.calculateTickLimit(area, ctx);

        if (stacked) {
            let min = 0, max = 0;
            me.legends.forEach(function(legend) {
                let key = legend.key;
                let sumNeg = 0, sumPos = 0;
                me.visDatasets.forEach(function (data) {
                    let stackedVal = data[key];
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
            return me.yAxis.buildDatasets(max, min, tickLimits, undefined, yScaleItemOptions);
        } else {
            // First, get all available values and calculate the max/min value
            let {max, min} = this.visDatasets.reduce((pre, cur) => {
                let {max, min} = pre;
                if (cur.display) {
                    let curValue = me.legends.map((legend) => {
                        if (legend.key) {
                            return cur[legend.key] || 0
                        }
                    }).concat(max, min);
                    max = Math.max(...curValue);
                    min = Math.min(...curValue);
                }
                return {max, min};
            }, {
                max: 0,
                min: 0
            });
            return me.yAxis.buildDatasets(max, min, tickLimits, undefined, yScaleItemOptions);
        }
    }

    /**
     * Build the xAxis datasets
     */
    xScaleAxisDatas() {
        let me = this;
        let xScaleItemOptions = me.chartConfig.xScaleItemOptions;
        let xScaleConfig = me.labels.map(label => {
            let item = {
                'text': label
            };
            if (typeof xScaleItemOptions !== 'undefined') {
                item = extend(item, xScaleItemOptions);
            }
            return item;
        });

        return me.xAxis.buildDatasets(xScaleConfig);
    }
}
