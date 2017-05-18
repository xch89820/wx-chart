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
import {extend, is, splineCurve} from '../util/helper'
import randomColor from '../util/randomColor';

// Line legend's default config
const WX_LINE_LEGEND_DEFAULT_CONFIG = {
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
const WX_LINER_DEFAULT_CONFIG = {
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

const WX_LINER_ITEM_DEFAULT_CONFIG = {
    pointRadius: 4,
    pointStyle: 'circle', // Support triangle, rect and Image object
    pointBorderWidth: 1.5,
    pointBorderColor: '#ffffff',
    tension: 0.4,
    display: true
};

export default class WxLiner extends WxChart {
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
    constructor(id, config) {
        super(id, config);

        let me = this;
        me.chartConfig = extend({}, WX_LINER_DEFAULT_CONFIG, config);

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
     * @param {number} [datasets[].fillStyle] - Point fill color. The default color will randomly assigned by 'color' option.
     * @param {string} [datasets[].strokeStyle='#ffffff'] - Point's border color
     * @param {string} [datasets[].pointStyle='circle'] - Point style, support triangle, rect and Image object
     * @param {number} [datasets[].pointRadius=3] - Point radius if style is circle
     * @param {number} [datasets[].pointBorderWidth=0] - Point border width
     * @param {string} [datasets[].pointBorderColor='auto'] - Point border color. If not set, will same as lineColor(luminosity+50%)
     * @param {number} [datasets[].display=true] - display the point or not
     * @returns {*}
     */
    update(datasets) {
        let me = this;
        me._labels = null;
        me._legends = null;
        super.update(datasets, WX_LINER_ITEM_DEFAULT_CONFIG);
        return me.draw();
    }

    /**
     * Draw chart
     */
    draw() {
        let box,
            me = this,
            wxLayout = me.wxLayout;
        let {cutoutPercentage, rotation, color, borderWidth, padding} = me.chartConfig;

        // First, we draw title
        box = wxLayout.adjustBox();
        if (me.title) {
            me.title.update(me.titleText, box);
            wxLayout.addBox(me.title.box);
        }

        // Second, random color and get legend datasets
        box = wxLayout.adjustBox();
        let rColors = randomColor(extend(true, {}, color, {count: me.legends.length}));

        me.legends = me.legends.map(function (legend, index) {
            if (!legend.strokeStyle) {
                legend.strokeStyle = me.chartConfig.backgroundColor || legend.borderColor || rColors[index];
            }

            return extend(true, {
                fillStyle: rColors[index]
            }, WX_LINE_LEGEND_DEFAULT_CONFIG, legend);
        });
        me.legend.update(me.legends, box);
        wxLayout.addBox(me.legend.box);

        // Thirdly, draw scale
        me._drawScale();

        // Finally, draw line
        let lineConfigs = me.legends.map(function (legend) {
            let config = {
                legend: legend
            };
            let key = legend.key;
            // config.dataset = me.visDatasets.map(data => {return {value: data[key], data: data}});
            config.dataset = me.visDatasets.map((data, index) => {
                let value = data[key],
                    point;

                if (value) {
                    let xAxisPoint = me.xAxis.getPoint(index);
                    let yAxisPoint = me.yAxis.getPoint(value);
                    point = {
                        x: xAxisPoint.x,
                        y: yAxisPoint.y
                    };
                }

                return {value, point, data};
            });
            return config;
        });

        lineConfigs.forEach(line => me._drawLine(line));
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
     * Draw one line
     * @param {Object} lineData - Line dataset
     * @param {Object} lineData.legend - Legend's config
     * @param {Object[]} lineData[].value - Data of each line point
     * @param {Object[]} lineData[].data - The data object
     * @param {Object[]} lineData[].point - The point for rending.
     * @private
     */
    _drawLine(lineData) {
        let me = this,
            ctx = me.ctx;
        let {legend, dataset} = lineData;
        let {
            display,
            spanGaps,
            tension,
            lineWidth,
            lineJoin,
            fillStyle,
            strokeStyle,
            fillArea,
            fillAlpha
        } = legend;

        if (!display) {
            return;
        }

        ctx.save();
        let lineToPoint = function (pre, p, next) {
            if (!tension || tension === 0) {
                ctx.lineTo(p.x, p.y);
            } else {
                let controlPoints = splineCurve(pre, p, next, tension);
                if (!pre) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.bezierCurveTo(pre.controlPoints.next.x, pre.controlPoints.next.y, controlPoints.previous.x, controlPoints.previous.y, p.x, p.y);
                }
                p.controlPoints = controlPoints;
            }
        };
        let getNextPoint = function (dataset, index, spanGaps) {
            // The end
            if (index >= dataset.length - 1) {
                return;
            }
            let nextDate = dataset[index + 1];
            if (!nextDate.point) {
                if (!!spanGaps)
                    return getNextPoint(dataset, index + 1, spanGaps);
                else
                    return;
            }
            return nextDate.point;
        };
        // Draw fill area
        if (fillArea) {
            let firstPoint,
                currPoint,
                xAxisY = me.xAxis.getPoint(0).y;
            let fillInHere = function () {
                ctx.globalAlpha = fillAlpha;
                ctx.fill();
                ctx.globalAlpha = 1;
            };
            ctx.beginPath();
            ctx.lineWidth = 0;
            ctx.fillStyle = fillStyle;
            dataset.forEach((d, index) => {
                let {point} = d;
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
        }

        // Draw line
        let currPoint,
            pointStack = [];
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = lineJoin;
        ctx.strokeStyle = strokeStyle;
        dataset.forEach((d, index) => {
            let {value, point, data} = d;
            let {pointBorderColor, pointBorderWidth, pointRadius, pointStyle, label} = data;

            pointStack.push({point, pointBorderColor, pointBorderWidth, pointRadius, pointStyle});

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
        pointStack.forEach(p => {
            let {point, pointBorderColor, pointBorderWidth, pointRadius, pointStyle} = p;
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
    yScaleAxisDatas(area) {
        let me = this,
            ctx = me.ctx;
        let yScaleItemOptions = me.chartConfig.yScaleItemOptions;

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

        let tickLimits = me.yAxis.calculateTickLimit(area, ctx);
        return me.yAxis.buildDatasets(max, min, tickLimits);
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
