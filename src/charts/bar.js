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
import WxRectElement from '../elements/rect';

let tinycolor = require("tinycolor2");
// Bar legend's default config
const WX_BAR_LEGEND_DEFAULT_CONFIG = {
    borderWidth: 1,
    fillArea: true,
    fillAlpha: 0.7,
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

    point: {},

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

const WX_BAR_ITEM_DEFAULT_CONFIG = {
    showLabel: true,
    // format: // title format function
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

        mixins([WxStackMixin], this, {
            // Mixins will create a new method to nested call all duplicate method
            mergeDuplicates: false
        });

        let me = this;
        me.chartConfig = extend({}, WX_BAR_DEFAULT_CONFIG, me.config);

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
     * @param {string} [datasets[].borderWidth=1] - Bar's border width
     * @param {string} [datasets[].strokeStyle] - Bar's border color
     * @param {number} [datasets[].fillArea=true] - Fill color or not
     * @param {number} [datasets[].fillAlpha=0.6] - Fill color Alpha
     * @param {number} [datasets[].fillStyle] - Fill color. The default color will randomly assigned by 'color' option.
     * @param {Object} [defaultItemOpt=WX_BAR_ITEM_DEFAULT_CONFIG]
     * @param {Boolean} [animation=true]
     * @returns {*}
     */
    update(datasets, defaultItemOpt = WX_BAR_ITEM_DEFAULT_CONFIG, animation = true) {
        let me = this;
        me._labels = null;
        me._legends = null;
        super.update(datasets, extend({}, WX_BAR_ITEM_DEFAULT_CONFIG, me.chartConfig.point));
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

    /**
     * Draw chart
     */
    draw(animation = true) {
        let box,
            me = this,
            ctx = me.ctx,
            animate = animation && me.chartConfig.animate,
            wxLayout = me.wxLayout;
        let {pointPercentage, minBetweenPixel, stacked, color, zeroLine} = me.chartConfig;

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
        box = wxLayout.adjustBox();
        let {xBox:xScaleBox, yBox:yScaleBox} = me._drawScale(box);
        wxLayout.addBox(xScaleBox);
        wxLayout.addBox(yScaleBox);

        box = wxLayout.adjustBox();
        // Calculate bar ruler
        me.barRuler = me.calculateBarRuler();
        // Finally, draw bar
        // Global neg flag
        // May be can be remove....
        me.hasNeg = false;
        // Finally, draw line
        let viewsArray = [];
        me.legends.map((legend, legendIndex) => {
            let views = me.renderViews(box, legend, legendIndex);
            viewsArray.push(views);
        });
        // Render
        viewsArray.map(views => {
            me.drawBar(views, box, animation);
        });

        if (animate) {
            me.emit('animate', me.wxAnimation);
            me.wxAnimation.run(true);
            me.wxAnimation.once('done', () => {
                if (zeroLine)
                    me._darwZeroLine();
                me.emit('draw', viewsArray);
            });
        } else {
            if (zeroLine)
                me._darwZeroLine();
            me.emit('draw', viewsArray);

        }
    }

    renderView(data, index, opt) {
        let me = this;
        let { legend, legendIndex, key } = opt;

        let value = data[key];
        if (!value) {
            return {value, element:null, data, index};
        }
        let point = me.calculateBarRect(index, legendIndex);

        let pointOpt = {
            width: point.barWidth,
            height: point.barHeight,
            backgroundColor: data['pointBackgroundColor'] || legend['fillStyle'],
            backgroundAlpha: data['pointBackgroundAlpha'] || legend['fillAlpha'],
            borderColor: data['pointBorderColor'] || legend['strokeStyle'],
            borderWidth: data['pointBorderWidth'] || legend['borderWidth'],
            border: 'top left right bottom', // space division
        };

        pointOpt.touched = {
            width: point.barWidth,
            height: point.barHeight,
            backgroundColor:  data['touched'] ?
                data['touched']['backgroundColor'] :
                tinycolor(pointOpt['backgroundColor']).darken(10).toString(),
            backgroundAlpha: data['touched'] ?
                data['touched']['backgroundAlpha'] :
                pointOpt['backgroundAlpha'],
            borderColor : data['touched'] ?
                data['touched']['borderColor'] :
                pointOpt['borderColor'],
            borderWidth: data['touched'] ?
                data['touched']['borderWidth'] :
                pointOpt['borderWidth'],
        };
        let element = new WxRectElement(point.x, point.y, pointOpt);

        return {value, element, data, index};
    }

    renderViews(box, legend, legendIndex) {
        let me = this,
            key = legend.key;
        return me.visDatasets.map((data, index) => {
            let o = me.renderView(data, index, { legend, legendIndex, key });
            if (o.value < 0) me.hasNeg = true;
            o.totalValue = me.getTotalValue(key);
            o.legend = legend;
            o.legendIndex = legendIndex;
            o.formatValue = me.renderLabel(o.value, o.totalValue, o.element, o.data, o.legend, o.legendIndex);
            return o;
        });
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
     * Draw zero line
     * @private
     */
    _darwZeroLine() {
        let me = this,
            ctx = me.ctx;
        // zero line
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = me.xAxis.config.color;
        ctx.lineWidth = me.xAxis.config.lineWidth;
        let baseY = me.yAxis.getPoint(0).y;
        ctx.moveTo(me.xAxis.getPoint(-1).x, baseY);
        ctx.lineTo(me.xAxis.box.ex, baseY);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draw bars
     *
     * @param {Object[]} views - liner's view
     * @param {number} views[].index - Index of view
     * @param {Object} views[].legend - Legend's config
     * @param {number} views[].value - Data of each line point
     * @param {Object[]} views[].data - The data object
     * @param {WxElement} views[].element - The point for rending.
     * @param {WxElement} views[].totalValue - Total values.
     * @param {BoxInstance} box - Box for draw
     * @param {Boolean} [animation=true]
     */
    drawBar(views, box, animation) {
        let me = this,
            animate = me.chartConfig.animate && animation;

        if (animate) {
            let actionAnimation = me._getAnimationDrawBar(views, box);
            me.wxAnimation.pushActions(actionAnimation);
        } else {
            me._drawBar(views, box);
        }
    }

    /**
     * Draw a bar
     * @param {Object[]} views - liner's view
     * @param {number} views[].index - Index of view
     * @param {Object} views[].legend - Legend's config
     * @param {number} views[].value - Data of each line point
     * @param {Object[]} views[].data - The data object
     * @param {WxElement} views[].element - The point for rending.
     * @param {WxElement} views[].totalValue - Total values.
     *
     * @param {BoxInstance} box
     * @private
     *
     */
    _drawBar(views, box) {
        let me = this,
            ctx = me.ctx;
        ctx.save();

        views.forEach(function(view) {
            if (view.element) {
                view.element.draw(me.ctx);
                me._drawLabel(view, box);
            }
        });

        ctx.draw();
        ctx.restore();
    }

    _drawLabel(view, box) {
        let me = this,
            stacked = me.chartConfig.stacked,
            ctx = me.ctx;
        let { showLabel, element, data, formatValue } = view;

        if (!showLabel) {
            return;
        }

        let { x: pointX, y: pointY } = element;

        ctx.save();

        ctx.fillStyle = tinycolor(element.options.backgroundColor).darken(15).toString();
        if (data.fontSize) ctx.fontSize = data.fontSize;
        let itemX, itemY;

        if (stacked) {
            ctx.textBaseline = "middle";
            itemX = pointX + element.width/2 - ctx.measureText(formatValue).width/3;
            itemY = pointY + element.height/2;
        } else {
            ctx.textBaseline = "bottom";
            itemX = pointX + element.width/2 - ctx.measureText(formatValue).width/3;
            itemY = pointY - ctx.fontSize/4;
        }

        // Check box's X,Y
        if (itemX < box.x) {
            itemX = box.x;
        }
        if (itemY < box.y) {
            itemY = box.y;
        }

        ctx.fillText(formatValue, itemX, itemY);
        ctx.restore();
    }

    /**
     * Animation to draw bar
     * @param {Object[]} views - liner's view
     * @param {number} views[].index - Index of view
     * @param {Object} views[].legend - Legend's config
     * @param {number} views[].value - Data of each line point
     * @param {Object[]} views[].data - The data object
     * @param {WxElement} views[].element - The point for rending.
     * @param {WxElement} views[].totalValue - Total values.
     *
     * @param {BoxInstance} box
     * @private
     *
     */
    _getAnimationDrawBar(views, box) {
        let me = this;
        let { backgroundColor, stacked, animate, animateOptions } = me.chartConfig;
        let ctx = me.ctx;

        // Animation dynamic options
        let dataLen = views.length,
            categoryTicks = (animateOptions.end - animateOptions.start) / dataLen;

        return (t, lastData, toNext) => {
            ctx.save();
            let dataIndex = Math.floor(t / categoryTicks);
            let view = dataIndex < dataLen ? views[dataIndex] : views[dataLen - 1];
            let { element, dataset } = view;
            let percent = (t % categoryTicks) / categoryTicks;

            let interElement;
            if (lastData) {
                let {
                    dataIndex: lastDataIndex,
                    percent: lastPercent,
                    lt,
                    interElement: ltElement,
                } = lastData;

                // Draw current bar
                if (lastDataIndex < dataLen && ltElement) {
                    ltElement.clear(ctx, backgroundColor, true);
                }

                // Lasted bar
                if (lastDataIndex !== dataIndex && !!lastPercent) {
                    // End the lasted bar
                    let lastView = lastDataIndex < dataLen ? views[lastDataIndex] : views[dataLen-1];
                    if (lastView.element) {
                        lastView.element.draw(ctx);
                        me._drawLabel(lastView, box);
                    }
                }
            }

            if (dataIndex < dataLen && !!percent && element) {
                let { width, height, options } = element;
                let elementOpt = extend({}, options);

                let curWidth = width,
                    curHeight = height * percent,
                    px = element.x,
                    py = element.y + height - curHeight;

                elementOpt.width = curWidth;
                elementOpt.height = curHeight;
                interElement = new WxRectElement(px, py, elementOpt);
                interElement.draw(ctx);
            }

            ctx.draw();
            ctx.restore();

            return {
                dataIndex,
                percent,
                interElement,
                lt: t
            }
        };
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
                    standardPercentage = legend.barWidth / pointWidth;
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
            barRuler = me.barRuler ? me.barRuler : me.calculateBarRuler(xScale);
        let legendOpt = me.legends[legendIndex];
        if (!legendOpt) {
            return;
        }
        // Calculate the bar's width in front of this legend
        let frontBarWidth = me.legends.slice(0, legendIndex).reduce((acc, cur) => acc + cur.barWidth, 0);
        let data = me.visDatasets[index];
        let value = legendOpt.key && typeof data[legendOpt.key] !== 'undefined' ?　
            data[legendOpt.key] :
            null;
        if (is.Null(value) || is.Undefined(value)) {
            return;
        }

        let xPoint, yPoint, barWidth, barHeight;
        // console.log(index);
        let xPointInstance = xScale.getPoint(index);

        // console.log(xPointInstance);
        if (stacked) {
            xPoint = xPointInstance.x - barRuler.pointWidth/2 + barRuler.barIntervalWidth/2;
            yPoint = me._getStackPoint(index, legendIndex).y;
            barWidth = legendOpt.barWidth;

            // TODO: Find another way to replace this variable :__sumNeg __sumPos
            let baseY = yScale.getPoint(0).y;
            barHeight = value < 0 ?
            (value / data.__sumNeg) * (yScale.getPoint(data.__sumNeg).y - baseY) :
            (value / data.__sumPos) * (baseY - yScale.getPoint(data.__sumPos).y)

            yPoint = value < 0 ? yPoint - barHeight : yPoint;
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
     * Draw the scale of chart
     *
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
            ctx = me.ctx;
        let yScaleItemOptions = me.chartConfig.yScaleItemOptions;
        let tickLimits = me.yAxis.calculateTickLimit(area, ctx);

        if (stacked) {
            //let {max, min}  = me.stackYScaleAxisLimit();
            let {max, min} = me.stackYScaleAxisLimit();
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
