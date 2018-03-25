/* global module, wx, window: false, document: false */
'use strict';

import mixins from 'es6-mixins';
import {extend, is, splineCurve, shadeBlendConvert} from '../util/helper';
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

let tinycolor = require("tinycolor2");

// Line legend's default config
const WX_BUBBLE_LEGEND_DEFAULT_CONFIG = {
    display: true,
    rKey: 'z', // Mutil datas exist, you should set this property
    zrp: 0 // The ratio of z/r; 0 represent 'auto' config
};

// Line default config
const WX_BUBBLE_DEFAULT_CONFIG = {
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

const WX_BUBBLE_ITEM_DEFAULT_CONFIG = {
    showLabel: false,
    // format: // title format function
    pointRadius: 4,
    pointStyle: 'circle', // Support triangle, rect and Image object
    pointBorderWidth: 2,
    pointBorderColor: '#ffffff',
    display: true
};

export default class WxBubble extends WxChart {
    constructor(id, config) {
        super(id, config);

        mixins([WxStackMixin], this, {
            // Mixins will create a new method to nested call all duplicate method
            mergeDuplicates: false
        });

        let me = this;
        me.chartConfig = extend({}, WX_BUBBLE_DEFAULT_CONFIG, me.config);

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
     * @param {Object} [defaultItemOpt=WX_BUBBLE_ITEM_DEFAULT_CONFIG]
     * @param {Boolean} [animation=true]
     * @returns {*}
     */
    update(datasets, defaultItemOpt = WX_BUBBLE_ITEM_DEFAULT_CONFIG, animation = true) {
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

    _calZRP(maxValue) {
        let me = this;
        let vwp = me.xAxis.tickWidth / maxValue / 2,
            vhp = me.canvas.height / maxValue;

        // Make sure all radius should not up to x-axis tick's width
        return Math.min(vhp, vwp);
    }

    renderViews(box, legend, legendIndex) {
        let me = this,
            key = legend.key;
        let zrp = legend.zrp;

        if (!zrp) {
            let max = me.calculateMaxRadius();
            zrp = me._calZRP(max);
            legend.zrp = zrp;
        }

        return me.visDatasets.map((data, index) => {
            let o = me.renderView(data, index, { legend, legendIndex, key });
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
        let { legend, legendIndex, key } = opt;
        let value = data[key],
            element;

        if (value) {
            let xAxisPoint = me.xAxis.getPoint(index),
                yAxisPoint = me.yAxis.getPoint(value);

            // format: // title format function
            let rKey = legend.rKey || 'z';
            let pointOpt = {
                radius: data[rKey] ?  data[rKey] * legend.zrp : data['pointRadius'],
                style: data['pointStyle'], // Support triangle, rect and Image object
                backgroundColor: data['pointBackgroundColor'] || legend['fillStyle'],
                borderWidth: data['pointBorderWidth'],
                borderColor: data['pointBorderColor'] || legend['strokeStyle'],
                touched: {
                    radius: data['touched'] ?
                        (data['touched'][rKey] ?  data['touched'][rKey] * legend.zrp : data['touched']['pointRadius']):
                        (data[rKey] ?  data[rKey] * legend.zrp :  data['pointRadius']) + 2,
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
        let { color } = me.chartConfig;

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
            }, WX_BUBBLE_LEGEND_DEFAULT_CONFIG, legend);
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
            me.drawBubble(views, box, animation);
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

    calculateMaxRadius(datasets = this.visDatasets, lkey = 'rKey') {
        let me = this,
            max = 0;

        me.legends.forEach(function(legend, index){
            datasets.forEach(function(dataset, index) {
                let rKey = legend[lkey] || 'z';
                let value = parseFloat(dataset[rKey]);
                if (!is.NaN(value)) {
                    max = max > value ? max : value;
                }
            });
        });

        return max;
    }

    /**
     * Draw a bubble series
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
    drawBubble(views, box, animation = true) {
        let me = this,
            animate = animation && me.chartConfig.animate,
            animateOpt = me.chartConfig.animateOptions;

        if (animate) {
            let actionAnimation = me._getAnimationDrawBubble(views, box);
            if (!actionAnimation) {
                return;
            }
            me.wxAnimation.pushActions(actionAnimation);
            me.wxAnimation.pushActions((t) => {
                if (animateOpt.end === t) {
                    me._drawBubble(views, box);
                }
            });
        } else {
            me._drawBubble(views, box);
        }
    }

    /**
     * Draw one bubble
     * @param {Object[]} views - bubble's view
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
    _drawBubble(views, box) {
        let me = this,
            ctx = me.ctx;

        if (!views.length) {
            return;
        }

        let {
            display
        } = views[0].legend;

        ctx.save();

        // Draw Point
        views.forEach((view, index) => {
            me._drawPoint(view.element, view, box);
        });

        ctx.draw();
        ctx.restore();
    }

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

        let { showLabel, label } = view.data;

        element.draw(ctx);

        if (showLabel) {
            let curFillStyle = ctx.fillStyle;
            ctx.textBaseline = "middle";
            ctx.fillStyle = tinycolor(curFillStyle).darken(50).toString();

            let formatValue = view.formatValue;

            let itemX = element.x - ctx.measureText(formatValue).width/2,
                itemY = element.y;

            ctx.fillText(formatValue, itemX, itemY);

            ctx.fillStyle = curFillStyle;
        }
    }

    /**
     *
     * @param {number} n - The total tick
     * @param {number} ln - The space between category x-axis
     * @param {Object[]} views - liner's view
     * @param {number} views[].index - Index of view
     * @param {Object} views[].legend - Legend's config
     * @param {number} views[].value - Data of each line point
     * @param {Object[]} views[].data - The data object
     * @param {WxElement} views[].element - The point for rending.
     * @private
     */
    _animateBubbleRadius(n, ln, view) {
        let { element, totalValue } = view;
        return ((n % ln) / ln) * element.radius;
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
    _getAnimationDrawBubble(views, box) {
        let me = this,
            animateOpt = me.chartConfig.animateOptions,
            ctx = me.ctx;

        if (!views.length) {
            return;
        }

        let {
            display
        } = views[0].legend;

        if (!display) {
            return;
        }

        // Animation dynamic options
        let viewsLen = views.length,
            categoryTicks = (animateOpt.end - animateOpt.start) / (viewsLen - 1);

        return (t, lastt, toNext) => {
            ctx.save();

            let dataIndex = !lastt
                ? 0 // first point
                : Math.floor(t/categoryTicks) + 1;
            let element, drawCurrPoint, index, data,
                curRadius = 0,
                // pret = lastt? lastt.t: 0,
                curr = me.getCurrView(views, dataIndex),
                // next = me.getNextViewHasElement(views, dataIndex, spanGaps),
                pre = me.getPreViewHasElement(views, dataIndex, false),
                // ppPoint,
                diffIndex = lastt ? dataIndex - lastt.index : 0;

            if (curr) {
                element = curr.element;
                curRadius = me._animateBubbleRadius(t, categoryTicks, curr);
            }


            if ((diffIndex == 1||lastt) && pre && pre.element) {
                // Draw previous bubble
                pre.element.draw(ctx);
            }

            if (element) {
                // Draw current bubble
                let { options } = element;
                let elementOpt = extend({}, options, {
                    radius: curRadius
                });
                (new WxPointElement(element.x, element.y, elementOpt)).draw(ctx);
            }

            ctx.draw();
            ctx.restore();

            return {
                element: element,
                t: t,
                index: dataIndex,
                diffIndex: diffIndex
            }
        };
    };

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