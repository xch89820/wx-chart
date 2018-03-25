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
import WxPointElement from '../elements/point';

let Bezier = require('bezier-js');
let tinycolor = require("tinycolor2");

// Line legend's default config
const WX_LINE_LEGEND_DEFAULT_CONFIG = {
    lineWidth: 1,
    // 'capStyle': 'butt', //Default line cap is cap,
    lineJoin: 'miter',
    fillArea: false,
    fillAlpha: 0.7,
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
    showLabel: true,
    // format: // title format function
    pointRadius: 4,
    pointStyle: 'circle', // Support triangle, rect and Image object
    pointBorderWidth: 2,
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
     * @param {Object} [config.legendOptions=[]] - The legend & label options.You should set 'key' to bind the attribute in datasets which is the value of the point.
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
        me.chartConfig = extend({}, WX_LINER_DEFAULT_CONFIG, me.config);

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

        me.emit('init', me.chartConfig);
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
     * @param {Object} [defaultItemOpt=WX_LINER_ITEM_DEFAULT_CONFIG]
     * @param {Boolean} [animation=true]
     * @returns {*}
     */
    update(datasets, defaultItemOpt = WX_LINER_ITEM_DEFAULT_CONFIG ,animation = true) {
        let me = this;
        me._labels = null;
        me._legends = null;
        super.update(datasets, extend({}, defaultItemOpt, me.chartConfig.point));
        me.wxLayout.removeAllBox();
        if (me.wxAnimation) me.wxAnimation.reset();
        return me.draw(animation);
    }

    /**
     * Re-draw chart
     * @param {Boolean} [animation=false]
     * @return {*}
     */
    redraw(animation = false) {
        let me = this;
        super.update(this.datasets);
        me.wxLayout.removeAllBox();
        if (me.wxAnimation) me.wxAnimation.reset();
        return me.draw(animation);
    }

    renderViews(box, legend, legendIndex) {
        let me = this,
            stacked = me.chartConfig.stacked,
            discardNeg = me.chartConfig.discardNeg,
            key = legend.key;
        return me.visDatasets.map((data, index) => {
            let o = me.renderView(data, index, { legend, legendIndex, stacked, discardNeg, key });
            o.totalValue = me.getTotalValue(key);
            o.legend = legend;
            o.legendIndex = legendIndex;
            o.formatValue = me.renderLabel(o.value, o.totalValue, o.element, o.data, o.legend, o.legendIndex);
            return o;
        });
    }

    /**
     * Render view
     * @param {Object} data
     * @param {number} index
     * @param {Object} opt
     */
    renderView(data, index, opt) {
        let me = this;
        let { legend, legendIndex, stacked, discardNeg, key } = opt;
        let value = data[key],
            element;

        if (value) {
            let yAxisPoint,
                xAxisPoint = me.xAxis.getPoint(index);
            if (stacked) {
                if (discardNeg) {
                    let {sumPos} = me._getStackValue(index, legendIndex);
                    yAxisPoint = value < 0 ? me.yAxis.getPoint(sumPos) : me.yAxis.getPoint(sumPos + value);
                } else {
                    yAxisPoint = me._getStackPoint(index, legendIndex);
                }
            } else {
                yAxisPoint = me.yAxis.getPoint(value);
            }

            // format: // title format function
            let pointOpt = {
                radius: data['pointRadius'],
                style: data['pointStyle'], // Support triangle, rect and Image object
                backgroundColor: data['pointBackgroundColor'] || legend['fillStyle'],
                borderWidth: data['pointBorderWidth'],
                borderColor: data['pointBorderColor'] || legend['strokeStyle'],
                touched: {
                    radius: data['touched'] ? data['touched']['pointRadius'] : data['pointRadius'] + 2,
                    borderWidth: data['touched'] ? data['touched']['pointBorderWidth'] : data['pointBorderWidth'] + 1,
                    style: data['touched'] ? data['touched']['pointStyle'] : data['pointStyle'],
                    borderColor: data['touched'] ? data['touched']['pointBorderColor'] : data['pointBorderColor'] || legend['strokeStyle'],
                    backgroundColor: data['pointBackgroundColor'] || legend['fillStyle']
                }
            };

            element = new WxPointElement(xAxisPoint.x, yAxisPoint.y, pointOpt);
        }

        return {value, element, data, index};
    }
    /**
     * Render labels
     * @param {number} value
     * @param {number|*} totalValue
     * @param {WxElement} element
     * @param {Object} data
     * @param {WxLegend} legend
     * @param {number} index
     */
    renderLabel(value, totalValue, element, data, legend, index) {
        let { label, format } = data;
        return is.Function(format)
            ? format.call(this, label, value, index, totalValue)
            : value+'';
    }

    /**
     * Draw chart
     */
    draw(animation = true) {
        let box,
            me = this,
            animate = animation && me.chartConfig.animate,
            stacked = me.chartConfig.stacked,
            discardNeg = me.chartConfig.discardNeg,
            wxLayout = me.wxLayout;
        let {cutoutPercentage, rotation, color, borderWidth, padding} = me.chartConfig;

        me.emit('beforeDraw', me.chartConfig);

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
        box = wxLayout.adjustBox();
        let {xBox:xScaleBox, yBox:yScaleBox} = me._drawScale(box);
        wxLayout.addBox(xScaleBox);
        wxLayout.addBox(yScaleBox);

        box = wxLayout.adjustBox();
        // Finally, draw line
        let viewsArray = [];
        me.legends.map((legend, legendIndex) => {
            let views = me.renderViews(box, legend, legendIndex);
            viewsArray.push(views);
        });
        // Render
        viewsArray.map(views => {
            me.drawLine(views, box, animation);
        });
        wxLayout.addBox(box);

        if (animate) {
            me.emit('animate', me.wxAnimation);
            me.wxAnimation.run(true);
            me.wxAnimation.once('done', () => {
                me.emit('draw', viewsArray);
            });
        } else {
            me.emit('draw', viewsArray);
        }


        // lineConfigs.forEach(line => me._drawLine(line));
    }

    /**
     * /**
     * Draw the scale of chart
     *
     * @param box
     * @private
     */
    _drawScale(box) {
        let me = this;

        let xDatasets = me.xScaleAxisDatas(),
            yDatasets = me.yScaleAxisDatas(box);
        return me.wxCrossScale.draw(box, xDatasets, yDatasets);
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
     * @param {WxElement} pre
     * @param {WxElement} p
     * @param {WxElement} next
     * @param {WxElement} pert
     * @param {number} curt
     * @param {number} tension
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
     * Draw point and point text
     * @param {WxElement} element
     * @param {Object} view
     * @param {BoxInstance} box
     * @private
     */
    _drawPoint(element, view, box) {
        let ctx = this.ctx;

        if (!view || !element) {
            return;
        }

        element.draw(ctx);
        this._drawLabel(view, box);
    };

    _drawLabel(view, box) {
        let me = this,
            ctx = me.ctx;
        let { showLabel, element, data, formatValue } = view;

        if (!showLabel) {
            return;
        }

        ctx.save();
        ctx.textBaseline = "bottom";
        ctx.fillStyle = tinycolor(element.options.backgroundColor).darken(15).toString();
        if (data.fontSize) ctx.fontSize = data.fontSize;

        let boxX = box.x,
            boxY = box.y;

        let itemX = element.x - ctx.measureText(formatValue).width/2,
            itemY = element.y - ctx.fontSize/6 - (element.radius||0) - (element.options.borderWidth||0);

        // Check box's X,Y
        if (itemX < boxX) {
            itemX = boxX;
        }
        if (itemY < boxY) {
            itemY = element.y  + ctx.fontSize/6 + (element.radius||0) + (element.options.borderWidth||0);
            ctx.textBaseline = "top";
        }

        ctx.fillText(formatValue, itemX, itemY);
        ctx.restore();
    };
    /**
     * Return a animate tick func
     * @param {Object[]} views - liner's view
     * @param {number} views[].index - Index of view
     * @param {Object} views[].legend - Legend's config
     * @param {number} views[].value - Data of each line point
     * @param {Object[]} views[].data - The data object
     * @param {WxElement} views[].element - The point for rending.
     * @param {BoxInstance} box
     * @return {function(*, *, *)|null|undefined}
     * @private
     */
    _getAnimationDrawLine(views, box) {
        let me = this,
            animateOpt = me.chartConfig.animateOptions,
            ctx = me.ctx;

        if (!views.length) {
            return;
        }
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
        } = views[0].legend;

        if (!display) {
            return;
        }
        // Animation dynamic options
        let viewsLen = views.length,
            categoryTicks = (animateOpt.end - animateOpt.start) / (viewsLen - 1);


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
                curr = me.getCurrView(views, dataIndex),
                next = me.getNextViewHasElement(views, dataIndex, spanGaps),
                pre = me.getPreViewHasElement(views, dataIndex, spanGaps),
                ppPoint,
                diffIndex = lastt ? dataIndex - lastt.index : 0;

            if (curr) {
                drawCurrPoint = curr.element;
                point = curr.element;
                index = curr.index;
                data = curr.data;
                curt = me._animateLineTick(t, categoryTicks, index - (pre?pre.index:0), dataIndex - (pre?pre.index:0) - 1);
            }

            if (pre) {
                ppPoint = me.getPreElement(views, pre.index, spanGaps);
            }

            if (!drawCurrPoint && next) {
                drawCurrPoint = next.element;
                index = next.index;
                next = me.getNextViewHasElement(views, next.index, spanGaps);
            }

            if (diffIndex == 1) {
                // Draw line
                if (pre && pre.element) {
                    ctx.beginPath();
                    me._animateLineToPoint(
                        ppPoint,
                        pre.element,
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
                        pre ? pre.element: null,
                        drawCurrPoint,
                        next ? next.element: null,
                        pret,
                        curt,
                        tension
                    );
                    ctx.stroke();
                }
            }

            if (pret == 0 && pre && pre.element) {
                pre.element.draw(ctx);
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
     * @param {Object[]} views - liner's view
     * @param {number} views[].index - Index of view
     * @param {Object} views[].legend - Legend's config
     * @param {number} views[].value - Data of each line point
     * @param {Object[]} views[].data - The data object
     * @param {WxElement} views[].element - The point for rending.
     *
     * @param {BoxInstance} box
     * @private
     *
     */
      _drawLine(views, box) {
        let me = this,
            ctx = me.ctx;

        if (!views.length) {
            return;
        }

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
        } = views[0].legend;

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
            views.forEach((view, index) => {
                let { element: point } = view;
                if (!!currPoint) {
                    if (point) {
                        this._lineToPoint(currPoint, point, me.getNextElement(views, index, spanGaps), tension);
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
                        this._lineToPoint(currPoint, point, me.getNextElement(views, index, spanGaps), tension);
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
        let prePoint;
        views.forEach((view, index) => {
            let { element: point } = view;

            if (point) {
                this._lineToPoint(prePoint, point, me.getNextElement(views, index, spanGaps), tension);
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
        views.forEach((view, index) => {
            me._drawPoint(view.element, view, box);
        });

        ctx.draw();
        ctx.restore();
    }

    /**
     * Draw one line
     *
     * @param {Object[]} views - liner's view
     * @param {number} views[].index - Index of view
     * @param {Object} views[].legend - Legend's config
     * @param {number} views[].value - Data of each line point
     * @param {Object[]} views[].data - The data object
     * @param {WxElement} views[].element - The point for rending.
     * @param {BoxInstance} box - Box for draw
     * @param {Boolean} [animation=true]
     */
    drawLine(views, box, animation = true) {
        let me = this,
            animate = animation && me.chartConfig.animate,
            animateOpt = me.chartConfig.animateOptions;

        if (animate) {
            let actionAnimation = me._getAnimationDrawLine(views, box);
            if (!actionAnimation) {
                return;
            }
            me.wxAnimation.pushActions(actionAnimation);
            me.wxAnimation.pushActions((t) => {
                if (animateOpt.end === t) {
                    me._drawLine(views, box);
                }
            });
        } else {
            me._drawLine(views, box);
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

    /**
     * Tooltip 'Element' model
     * @param {WxEvent} event
     * @param {Object[][]} viewsArr
     */
    elementTooltip(event, viewsArr) {
        let me = this;
        let tc = me.chartConfig.tooltip;
        let { content } = tc;

        let position, text, view;
        for (let i=0; i< viewsArr.length; i++) {
            let views = viewsArr[i];
            for (let j=0; j< views.length; j++) {
                view = views[j];
                let element = view.element;
                if (element && element.inRange(event.x, event.y)) {
                    position = tc.mouseFollow ?
                        { x: event.x, y: event.y, padding: element.padding } :
                        element.tooltipPosition(event.x, event.y);
                    text = is.Function(content) ? content.call(me, view, me.labels) : content.toString();
                    break;
                }
            }
        }

        return { position, text, views: view }
    }

    /**
     * Tooltip 'Axis' model
     * @param {WxEvent} event
     * @param {Object[][]} viewsArr
     * @return {Object} position and text
     */
    axisTooltip(event, viewsArr) {
        let me = this;
        let tc = me.chartConfig.tooltip;
        let { axisMark, content } = tc;

        // Get all axis views
        let marchIndex = -1, axisViews=[];
        for (let i=0; i< viewsArr.length; i++) {
            let views = viewsArr[i];
            for (let j=0; j< views.length; j++) {
                let view = views[j];
                let element = view.element;
                if (marchIndex > -1 && view.index == marchIndex) {
                    axisViews.push(view);
                } else if (element && element.inXRange(event.x)) {
                    marchIndex = view.index;
                    axisViews.push(view);
                }
            }
        }

        let position, text, labels, checker, before;
        if (marchIndex >= 0) {
            let xP = me.xAxis.getPoint(marchIndex);
            position = { x: xP.x, y: event.y, padding: axisViews[0].element.padding };
            text = is.Function(content) ? content.call(me, axisViews, me.labels) : content.toString();

            // prepare
            let ctx = event.canvas.contextInstance;
            checker = (opt, lastOpt) => {
                return opt && lastOpt && opt.views[0].index === lastOpt.views[0].index;
            };
            before = () => {

                let startY = me.yAxis.getPoint(me.yAxis.visDatasets[me.yAxis.visDatasets.length - 1].value),
                    endY = me.yAxis.getPoint(me.yAxis.visDatasets[0].value);
                ctx.save();
                ctx.beginPath();
                ctx.lineWidth = axisMark.lineWidth;
                ctx.strokeStyle = axisMark.strokeStyle || me.yAxis.config.color;
                ctx.moveTo(xP.x, endY.y);
                ctx.lineTo(xP.x, startY.y);
                ctx.stroke();
                ctx.restore();
            };
        }
        return { position, text, views: axisViews, checker, before }
    }
}
