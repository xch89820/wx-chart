/* global module, wx, window: false, document: false */
'use strict';

import mixins from 'es6-mixins';
import {extend, is, splineCurve} from '../util/helper'
import randomColor from '../util/randomColor';

import WxCanvas from '../util/wxCanvas';
import WxChart from './wxChart';
import WxTitle from '../core/title';
import WxScale from '../core/scale';
import WxLinerScale from '../scale/scale.liner';
import WxCrossScale from '../scale/scale.crosshelp';
import WxStackMixin from '../scale/scale.stackhelp';
import WxCategoryScale from '../scale/scale.category';
import WxLegend from '../core/legend';
import WxLayout, {BoxInstance} from '../core/layout';
import WxAnimation from '../core/animation';
let Bezier = require('bezier-js');



// Line legend's default config
const WX_LINE_LEGEND_DEFAULT_CONFIG = {
    lineWidth: 1,
    // 'capStyle': 'butt', //Default line cap is cap,
    lineJoin: 'miter',
    fillArea: false,
    fillAlpha: 0.5,
    display: true,
    spanGaps: false, // If set true, will draw line between the null point
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

    stacked: false, // If true, line are stacked on the x-axis
    discardNeg: false,

    // The legend of line chart
    legends: [], // lineWidth, lineJoin, fillStyle, strokeStyle, fillArea can be set in here
    legendOptions: {
        'position': 'bottom'
    },

    // Point global options
    point : {},

    // The randomColor scheme
    // See https://github.com/davidmerfield/randomColor
    color: {
        hue: 'red',
        luminosity: 'light'
    },

    // The dataset's default key
    defaultKey: 'value',

    // Animation
    animate: true,
    animateOptions:{
        start: 1,
        end: 1001,
        duration: 1000
    }
};

const WX_LINER_ITEM_DEFAULT_CONFIG = {
    pointRadius: 2,
    pointStyle: 'circle', // Support triangle, rect and Image object
    pointBorderWidth: 1,
    pointBorderColor: '#ffffff',
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

        mixins([WxStackMixin], this, {
            // Mixins will create a new method to nested call all duplicate method
            mergeDuplicates: false
        });

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

        // Initialize wxAnimation
        if (me.chartConfig.animate)
            me.wxAnimation = new WxAnimation(me.chartConfig.animateOptions);

        me.emit('init', {
            options: me.chartConfig
        });
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
     * @param {number} [datasets[].pointBorderWidth=1.5] - Point border width
     * @param {string} [datasets[].pointBorderColor='auto'] - Point border color. If not set, will same as lineColor(luminosity+50%)
     * @param {number} [datasets[].display=true] - display the point or not
     * @returns {*}
     */
    update(datasets) {
        let me = this;
        me._labels = null;
        me._legends = null;
        super.update(datasets, extend({}, WX_LINER_ITEM_DEFAULT_CONFIG, me.chartConfig.point));
        me.wxLayout.removeAllBox();
        if (me.wxAnimation) me.wxAnimation.reset();
        return me.draw();
    }

    /**
     * Draw chart
     */
    draw() {
        let box,
            me = this,
            animate = me.chartConfig.animate,
            stacked = me.chartConfig.stacked,
            discardNeg = me.chartConfig.discardNeg,
            wxLayout = me.wxLayout;
        let {cutoutPercentage, rotation, color, borderWidth, padding} = me.chartConfig;

        me.emit('beforeDraw', {
            options: me.chartConfig,
        });

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
        let lineConfigs = me.legends.map((legend, legendIndex) => {
            let config = {
                legend: legend
            };
            let key = legend.key;
            // config.dataset = me.visDatasets.map(data => {return {value: data[key], data: data}});
            config.dataset = me.visDatasets.map((data, index) => {
                let value = data[key],
                    point;

                if (value) {
                    let yAxisPoint,
                        xAxisPoint = me.xAxis.getPoint(index);
                    if (stacked) {
                        if (discardNeg) {
                            let { sumPos } = me._getStackValue(index, legendIndex);
                            yAxisPoint = value < 0 ? me.yAxis.getPoint(sumPos) : me.yAxis.getPoint(sumPos + value);
                        } else {
                            yAxisPoint = me._getStackPoint(index, legendIndex);
                        }
                    } else {
                        yAxisPoint = me.yAxis.getPoint(value);
                    }

                    point = {
                        x: xAxisPoint.x,
                        y: yAxisPoint.y
                    };
                }

                return {value, point, data, index};
            });
            return config;
        });

        lineConfigs.reduce((pre, curr) => {
            me.drawLine(curr, pre, lineConfigs);
            return curr;
        }, null);

        if (animate) {
            me.emit('animate', { animation: me.wxAnimation });
            me.wxAnimation.run(true);
            me.wxAnimation.on('done', () => {
                me.emit('draw', {
                    options: lineConfigs,
                });
            });
        } else {
            me.emit('draw', {
                options: lineConfigs,
            });
        }
        // lineConfigs.forEach(line => me._drawLine(line));
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
     *
     * @param {number} n - The total tick
     * @param {number} ln - The space between category x-axis
     * @param {number} sp - If has an gap, total gap space space
     * @param {number} bp - If has an gap, the gap space before the current point
     * @return {number}
     * @private
     */
    _animateLineTick = function(n, ln, sp = 1, bp = 0) {
        return sp ? ((n % ln) + bp*ln) / (ln * sp) : 0;
    };

    _getCurr = (dataset, index) => {
        if (index > dataset.length - 1) {
            return;
        }
        return dataset[index];
    };

    _getNext = (dataset, index, spanGaps) => {
        // The end
        if (index >= dataset.length - 1) {
            return;
        }
        let nextDate = dataset[index + 1];
        if (!nextDate.point) {
            if (!!spanGaps)
                return this._getNext(dataset, index + 1, spanGaps);
            else
                return;
        }
        return nextDate;
    };
    _getNextPoint = (dataset, index, spanGaps) => {
        let next = this._getNext(dataset, index, spanGaps);
        return next ? next.point : null;
    };
    _getPre = (dataset, index, spanGaps) => {
        if (index <= 0) {
            return;
        }
        let preDate = dataset[index - 1];
        if (!preDate.point) {
            if (!!spanGaps)
                return this._getPre(dataset, index - 1, spanGaps);
            else
                return;
        }
        return preDate;
    };
    _getPrePoint = (dataset, index, spanGaps) => {
        let pre = this._getPre(dataset, index, spanGaps);
        return pre ? pre.point : null;
    };

    /**
     * Draw a line
     * @param pre
     * @param p
     * @param next
     * @param tension
     * @private
     */
    _lineToPoint = (pre, p, next, tension) => {
        let ctx = this.ctx;
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

    /**
     * Draw a animate line
     * @param pre
     * @param p
     * @param next
     * @param pert
     * @param curt
     * @param tension
     * @return {*}
     * @private
     */
    _animateLineToPoint = (pre, p, next, pert, curt, tension) => {
        let ctx = this.ctx;
        if (!tension || tension === 0) {
            let x1 = pre.x,
                x2 = p.x,
                y1 = pre.y,
                y2 = p.y;
            let totalPath = Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2)),
                cosAngle = (x2 - x1) / totalPath,
                sinAngle = (y2 - y1) / totalPath;
            let pointX = x1 + cosAngle * curt,
                pointY = y1 + sinAngle * curt;
            ctx.moveTo(x1, y1);
            ctx.lineTo(pointX, pointY);
            return {
                startPoint: pre,
                endPoint: {x:pointX, y:pointY}
            }
        } else {
            let p0, p1, p2, p3, controlPoints = splineCurve(pre, p, next, tension);

            if (pre && p) {
                let bz = new Bezier({x: pre.x, y: pre.y},
                    {x: pre.controlPoints.next.x, y: pre.controlPoints.next.y},
                    {x: controlPoints.previous.x, y: controlPoints.previous.y},
                    {x: p.x, y: p.y});
                let sbz = bz.split(pert || 0, curt);

                p0 = sbz.point(0); p1 = sbz.point(1); p2 = sbz.point(2); p3 = sbz.point(3);

                ctx.moveTo(Math.round(p0.x), p0.y);
                ctx.bezierCurveTo(
                    p1.x, p1.y,
                    p2.x, p2.y,
                    Math.round(p3.x), p3.y
                );
            }
            p.controlPoints = controlPoints;
            return {
                startPoint: (p0 ? {
                    x: Math.round(p0.x),
                    y: p0.y
                }: null),
                endPoint: (p3 ? {
                    x: Math.round(p3.x),
                    y: p3.y
                }: null),
            }
        }
    };

    __fillInHere = (firstPoint, currPoint, xAxisY, fillAlpha) => {
        let ctx = this.ctx;
        ctx.lineTo(currPoint.x, xAxisY);
        ctx.lineTo(firstPoint.x, xAxisY);

        ctx.globalAlpha = fillAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;
    };
    /**
     * Return a animate tick func
     * @param lineData
     * @param preData
     * @return {function(*, *, *)|null}
     * @private
     */
    _getAnimationDrawLine = (lineData, preData) => {
        let me = this,
            animate = me.chartConfig.animate,
            animateOpt = me.chartConfig.animateOptions,
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

        // Animation dynamic options
        let dataLen = dataset.length,
            categoryTicks = (animateOpt.end - animateOpt.start) / (dataLen - 1);

        if (!display) {
            return;
        }

        return (t, lastt, toNext) => {
            ctx.save();
            ctx.lineWidth = lineWidth;
            ctx.lineJoin = lineJoin;
            ctx.strokeStyle = strokeStyle;
            ctx.fillStyle = fillStyle;

            let dataIndex = !lastt
                ? 0 // first point
                : Math.floor(t/categoryTicks) + 1;
            let point, drawCurrPoint, index, data,
                pret = lastt? lastt.t: 0, curt = 0,
                curr = me._getCurr(dataset, dataIndex),
                next = me._getNext(dataset, dataIndex, spanGaps),
                pre = me._getPre(dataset, dataIndex, spanGaps),
                ppPoint,
                diffIndex = lastt ? dataIndex - lastt.index : 0;

            if (curr) {
                drawCurrPoint = curr.point;
                point = curr.point;
                index = curr.index;
                data = curr.data;
                curt = me._animateLineTick(t, categoryTicks, index - (pre?pre.index:0), dataIndex - (pre?pre.index:0) - 1);
            }

            if (pre) {
                ppPoint = me._getPrePoint(dataset, pre.index, spanGaps);
            }

            if (!drawCurrPoint && next) {
                drawCurrPoint = next.point;
                index = next.index;
                next = me._getNext(dataset, next.index, spanGaps);
            }

            if (diffIndex == 1) {
                // Draw line
                if (pre && pre.point) {
                    ctx.beginPath();
                    me._animateLineToPoint(
                        ppPoint,
                        pre.point,
                        drawCurrPoint,
                        pret,
                        1,
                        tension);
                    ctx.stroke();
                }

                pret = 0;
            }

            if ((!point && spanGaps) || point) {
                // this tick path close
                // Draw line

                if (drawCurrPoint) {
                    ctx.beginPath();
                    me._animateLineToPoint(
                        pre ? pre.point: null,
                        drawCurrPoint,
                        next ? next.point: null,
                        pret,
                        curt,
                        tension
                    );
                    ctx.stroke();
                }
            }

            if (pret == 0 && pre && pre.point) {
                let {pointBorderColor, pointBorderWidth, pointRadius, pointStyle, label} = pre.data;
                // TODO: pointStyle NOT IMPLEMENT, Only can render line
                if (pointRadius) {
                    ctx.beginPath();
                    ctx.arc(pre.point.x, pre.point.y, pointRadius, 0, 2 * Math.PI);
                    ctx.fill();
                }

                if (pointBorderWidth) {
                    ctx.beginPath();
                    ctx.arc(pre.point.x, pre.point.y, pointRadius, 0, 2 * Math.PI);
                    ctx.lineWidth = pointBorderWidth;
                    ctx.strokeStyle = pointBorderColor || legend.strokeStyle;
                    ctx.stroke();
                }
            }

            ctx.draw();
            ctx.restore();

            return {
                point: point,
                t: curt,
                index: dataIndex,
                diffIndex: diffIndex
            }
        };
    };

    /**
     * Draw one line
     * @param {Object} lineData - Line dataset
     * @param {Object} lineData.legend - Legend's config
     * @param {Object[]} lineData[].value - Data of each line point
     * @param {Object[]} lineData[].data - The data object
     * @param {Object[]} lineData[].point - The point for rending.
     * @param {Object} preData - Previous line dataset
     * @param {Object} total - All datasets
     * @private
     *
     */
      _drawLine(lineData, preData , total) {
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

        let xAxisY = me.xAxis.getPoint(0).y - me.xAxis.config.lineWidth/2;
        if (!display) {
            return;
        }

        ctx.save();

        ctx.lineWidth = lineWidth;
        ctx.lineJoin = lineJoin;
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        // Draw fill area
        if (fillArea) {
            ctx.beginPath();

            let firstPoint,
                currPoint;
            dataset.forEach((d, index) => {
                let {point} = d;
                if (!!currPoint) {
                    if (point) {
                        this._lineToPoint(currPoint, point, me._getNextPoint(dataset, index, spanGaps), tension);
                    } else if (!spanGaps) {
                        // Not spanGap, close path and fill
                        this.__fillInHere(firstPoint, currPoint, xAxisY, fillAlpha);
                        // First point reset
                        firstPoint = undefined;
                    } else {
                        // SpanGap, not record this point.
                        return;
                    }
                } else {
                    if (point) {
                        //ctx.moveTo(point.x, point.y);
                        this._lineToPoint(currPoint, point, me._getNextPoint(dataset, index, spanGaps), tension);
                        firstPoint = point;
                    }
                }
                currPoint = point;
            });
            if (currPoint && firstPoint) {
                this.__fillInHere(firstPoint, currPoint, xAxisY, tension, fillAlpha);
            }
        }

        ctx.beginPath();

        // Draw line
        let prePoint,
            pointStack = [];
        dataset.forEach((d, index) => {
            let {value, point, data} = d;
            let {pointBorderColor, pointBorderWidth, pointRadius, pointStyle, label} = data;

            pointStack.push({point, pointBorderColor, pointBorderWidth, pointRadius, pointStyle});

            if (point) {
                this._lineToPoint(prePoint, point, me._getNextPoint(dataset, index, spanGaps), tension);
                //!!currPoint ? ctx.lineTo(point.x, point.y): ctx.moveTo(point.x, point.y);
                // !!currPoint ?
                //     lineToPoint(currPoint, point, getNextPoint(dataset, index, spanGaps)):
                //     ctx.moveTo(point.x, point.y);
            } else if (spanGaps) {
                // SpanGap, not record this point.
                return;
            }
            prePoint = point;
        });
        ctx.stroke();

        // Draw Point
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
        });

        ctx.draw();
        ctx.restore();

        return;
    }

    /**
     * Draw one line
     * @param {Object} lineData - Line dataset
     * @param {Object} lineData.legend - Legend's config
     * @param {Object[]} lineData[].value - Data of each line point
     * @param {Object[]} lineData[].data - The data object
     * @param {Object[]} lineData[].point - The point for rending.
     * @param {Object} preData - Previous line dataset
     * @param {Object} total - All datasets
     * @private
     *
     */
    drawLine(lineData, preData ,total) {
        let me = this,
            animate = me.chartConfig.animate,
            animateOpt = me.chartConfig.animateOptions;

        if (animate) {
            let actionAnimation = me._getAnimationDrawLine(lineData, preData);
            if (!actionAnimation) {
                return;
            }
            me.wxAnimation.pushActions(actionAnimation);
            me.wxAnimation.pushActions((t) => {
                if (animateOpt.end === t) {
                    me._drawLine(lineData, preData, total);
                }
            });
        } else {
            me._drawLine(lineData, preData, total);
        }
    }
    /**
     * Build the yAxis datasets
     * @param {BoxInstance} area - The area of chart
     */
    yScaleAxisDatas(area) {
        let me = this,
            stacked = me.chartConfig.stacked,
            discardNeg = me.chartConfig.discardNeg,
            ctx = me.ctx;
        let yScaleItemOptions = me.chartConfig.yScaleItemOptions;
        let tickLimits = me.yAxis.calculateTickLimit(area, ctx);

        if (stacked) {
            let {max, min} = me.stackYScaleAxisLimit();
            return me.yAxis.buildDatasets(max, min < 0 && discardNeg ? 0 : min, tickLimits, undefined, yScaleItemOptions);
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
                    max = Math.max.apply(Math, curValue);
                    min = Math.min.apply(Math, curValue);
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
