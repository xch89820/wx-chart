/* global module, wx, window: false, document: false */
'use strict';

import WxCanvas from '../util/wxCanvas';
import WxChart from './wxChart';
import WxTitle from '../core/title';
import WxLayout, {BoxInstance} from '../core/layout';
import WxLegend from '../core/legend';
import randomColor from '../util/randomColor';
import {extend, is} from '../util/helper';
import WxAnimation from '../core/animation';
import WxArcElement from '../elements/arc';

// Doughnut default config
const WX_DOUGHNUT_DEFAULT_CONFIG = {
    legendOptions:{
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

    point: {},

    // The title text or a title config object
    title: undefined,

    // Chart padding, default auto set
    padding: undefined,

    labelDistancePercentage: 0.15,
    // Animation
    animate: true,
    animateOptions:{
        start: 1,
        end: 501,
        duration: 1000
    }
};

// Doughnut legend's default config
const WX_BAR_LEGEND_DEFAULT_CONFIG = {
    borderWidth: 1,
    fillArea: true,
    fillAlpha: 0.7,
    display: true
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
const WX_DOUGHNUT_ITEM_DEFAULT_CONFIG = {
    // format: // title format function
    display: true,
    pointBorderWidth: 2,
    percentage: 100,
    pointBorderColor: '#ffffff'
};

export default class WxDoughnut extends WxChart {
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
    constructor(id, config) {
        super(id, config);
        let me = this;
        me.chartConfig = extend({}, WX_DOUGHNUT_DEFAULT_CONFIG, me.config);

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

        me.legend = new WxLegend(me, me.chartConfig.legendOptions);
        me.wxLayout = new WxLayout(me);

        // Initialize wxAnimation
        if (me.chartConfig.animate)
            me.wxAnimation = new WxAnimation(me.chartConfig.animateOptions);

        me.emit('init', me.chartConfig);
    }

    /**
     * Update a datesets of chart and reDraw
     * @param {Object[]} datasets
     * @param {string} [datasets[].display=true] - Display or not.
     * @param {string} datasets[].label - The label text of an dataset.
     * @param {function} datasets[].format - The label text format function.
     * @param {number} datasets[].value - The value of an dataset.
     * @param {string} [datasets[].pointColor] - The color.
     * @param {string} [datasets[].pointBorderColor]- The border color.
     * @param {string} [datasets[].pointBorderWidth]- The border width.
     * @param {string} [datasets[].percentage=100] - The percentage of radius, default is '100'
     * @param {string} [datasets[].legend] - The legend option of an dataset. We will set legend text as same as label text.
     * @param {Object} [defaultItemOpt=WX_DOUGHNUT_ITEM_DEFAULT_CONFIG]
     * @param {Boolean} [animation=true]
     */
    update(datasets, defaultItemOpt = WX_DOUGHNUT_ITEM_DEFAULT_CONFIG, animation = true) {
        let me = this;
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
    redraw(animation=false) {
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
            animate = animation && me.chartConfig.animate,
            labelDistancePercentage = me.chartConfig.labelDistancePercentage,
            wxLayout = me.wxLayout;
        let {
            cutoutPercentage,
            rotation,
            color,
            title,
            borderWidth,
            padding
        } = me.chartConfig;

        me.emit('beforeDraw', me.chartConfig);

        box = wxLayout.adjustBox();
        // First, we draw title
        if (me.title) {
            me.title.update(me.titleText, box);
            wxLayout.addBox(me.title.box);
        }

        box = wxLayout.adjustBox();
        // Second, random color and get legend datasets
        let rColors = randomColor(extend(true, {}, color, {count: me.visDatasets.length}));

        me.legends = me.legends.map(function (legend, index) {
            if (!legend.strokeStyle) {
                legend.strokeStyle = me.chartConfig.backgroundColor || legend.borderColor || rColors[index];
            }

            return extend(true, {
                fillStyle: rColors[index]
            }, WX_BAR_LEGEND_DEFAULT_CONFIG, legend);
        });

        me.legend.update(me.legends, box);
        wxLayout.addBox(me.legend.box);

        // Thirdly, adjust chart box
        box = wxLayout.adjustBox();
        padding = padding || box.width * 0.1;
        box.width -= padding;
        box.height -= padding;

        me.initRenderConfiog(box);
        let viewsArray = me.renderViews(box);
        wxLayout.addBox(box);

        me.drawDoughnut(viewsArray, box, animation);

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

    initRenderConfiog(box) {
        let me = this;
        let {
            cutoutPercentage,
            labelDistancePercentage,
            rotation,
            innerRadius,
            outerRadius,
            centerX,
            centerY
        } = me.chartConfig;

        let maxBorderWidth = Math.max(...me.visDatasets.map(x=>x.borderWidth||0));

        // Use the min size
        if (!outerRadius) {
            outerRadius = Math.min(box.width, box.height);
        }

        let outerRadiusWithoutBorder = Math.max((outerRadius - maxBorderWidth * 2) / 2, 0) - 10;
        let longestLabelWidth = me._longestLabel(me.getTotalValue()),
            maximalFontSize = me._maximalLabelFontSize();

        // Resize
        let shouldSpace = longestLabelWidth + maximalFontSize + outerRadiusWithoutBorder * labelDistancePercentage;
        // Calculate the space between pie's border and margin of chart
        let widthSpace = (box.width - (outerRadiusWithoutBorder+maxBorderWidth)*2)/2;
        if (widthSpace < shouldSpace) {
            // Reset outerRadius
            let rz = shouldSpace - widthSpace;
            outerRadiusWithoutBorder -= rz;
            outerRadius -= rz;

        }
        me.chartConfig.outerRadiusWithoutBorder = outerRadiusWithoutBorder;
        me.chartConfig.outerRadius = outerRadius;

        // inneradius
        if (!innerRadius) {
            me.chartConfig.innerRadius = cutoutPercentage
                ? (outerRadiusWithoutBorder / 100) * cutoutPercentage
                : 0;
        }

        if (!centerX || !centerY) {
            me.chartConfig.centerX = box.x + (box.outerWidth / 2);
            me.chartConfig.centerY = box.y + (box.outerHeight / 2);
        }
    }


    /**
     * Render view
     * @param {Object} data
     * @param {number} index
     * @param {Object} opt
     */
    renderView(data, index, opt) {
        let me = this;
        let {
            cutoutPercentage,
            labelDistancePercentage,
            rotation,
            innerRadius,
            outerRadiusWithoutBorder,
            centerX,
            centerY
        } = me.chartConfig;
        let { value, color, pointBorderColor, pointBorderWidth } = data;
        let { startAngle, legend, legendIndex } = opt;

        let angle = Math.PI * 2.0 * (value / me.getTotalValue());
        let elementOpt = {
            startAngle,
            angle,
            backgroundColor: color || legend['fillStyle'],
            borderColor: pointBorderColor || legend['strokeStyle'],
            borderWidth: pointBorderWidth || 2,
            innerRadius,
            radius: outerRadiusWithoutBorder  / 100 * (data['percentage']||100)
        };
        let element = new WxArcElement(centerX, centerY, elementOpt);

        return {value, element, data, index};
    }

    renderViews(box, legend, legendIndex){
        let me = this;
        let {
            cutoutPercentage,
            labelDistancePercentage,
            rotation,
            innerRadius,
            outerRadius,
            outerRadiusWithoutBorder,
            centerX,
            centerY
        } = me.chartConfig;

        let startAngle = rotation;
        return me.visDatasets.map((data, index) => {
            // legend and legendIndex is nil
            legend = me.legends[index];
            legendIndex = index;

            let o = me.renderView(data, index, {startAngle, legend, legendIndex});
            let formatValue = me.renderLabel(data.value, me.getTotalValue(), o.element, data, legend, index);
            startAngle += o.element.angle;
            o.totalValue = me.getTotalValue();
            o.legend = legend;
            o.legendIndex = legendIndex;
            o.formatValue = formatValue;
            return o;
        });
    }

    /**
     * Render labels
     * @param {number} value
     * @param {number|*} totalValue
     * @param {WxElement} element
     * @param {Object} data
     * @param {Object} legend
     * @param {number} index
     */
    renderLabel(value, totalValue, element, data, legend, index) {
        let { label, format } = data;
        return is.Function(format)
            ? data.format.call(this, label, value, index, totalValue)
            : label;
    }

    /**
     * Draw doughnut
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
    drawDoughnut(views, box, animation = true) {
        let me = this,
            animate = me.chartConfig.animate && animation;

        if (animate) {
            let actionAnimation = me._getAnimationDrawDoughnut(views, box);
            if (!actionAnimation) {
                return;
            }
            me.wxAnimation.pushActions(actionAnimation);
        } else {
            me._drawDoughnut(views, box);
        }
    }

    /**
     * Animation to draw doughnut
     *
     * @param {Object[]} views - liner's view
     * @param {number} views[].index - Index of view
     * @param {Object} views[].legend - Legend's config
     * @param {number} views[].value - Data of each line point
     * @param {Object[]} views[].data - The data object
     * @param {WxElement} views[].element - The point for rending.
     * @param {BoxInstance} box - Box for draw
     */
    _getAnimationDrawDoughnut(views, box) {
        let me = this,
            ctx = me.ctx,
            backgroundColor = me.config.backgroundColor;
        let {
            rotation,
            animateOptions:animateOpt
        } = me.chartConfig;
        let aniTotal = animateOpt.end - animateOpt.start;
        let totalAngle = Math.PI * 2.0;

        return (t, lastt, toNext) => {
            let ta = totalAngle/aniTotal;
            let currTotalAngle = rotation + ta * t;
            let lastTotalAngle = rotation + (lastt ?  ta * lastt : 0);

            // Clear
            // ctx.save();
            // ctx.beginPath();
            // if (backgroundColor) {
            //     ctx.fillStyle = backgroundColor;
            //     ctx.strokeStyle = backgroundColor;
            //     ctx.fillRect(
            //         box.x,
            //         box.y,
            //         box.outerWidth,
            //         box.outerHeight
            //     )
            // } else {
            //     ctx.clearRect(
            //         box.x,
            //         box.y,
            //         box.outerWidth,
            //         box.outerHeight
            //     );
            // }

            // Draw animate element
            if (animateOpt.end === t) {
                me._drawDoughnut(views, box);
            } else {
                //console.log("==============");
                //console.log(`lastTotalAngle : ${lastTotalAngle}`);
                //console.log(`currTotalAngle : ${currTotalAngle}`);
                views.forEach(function(view, index) {
                    let { startAngle, endAngle, options } = view.element;
                    //console.log(`startAngle: ${startAngle} , endAngle: ${endAngle}`);
                    if (startAngle < lastTotalAngle && endAngle < lastTotalAngle) {
                        // Not render for perform
                        return;
                    }

                    if (startAngle < lastTotalAngle && endAngle > lastTotalAngle) {
                        // This is the lasted element
                        if (startAngle < currTotalAngle && endAngle > currTotalAngle) {
                            // Render a part of the element
                            let elementOpt = extend({}, options);
                            elementOpt.angle = currTotalAngle - startAngle;
                            (new WxArcElement(view.element.x, view.element.y, elementOpt)).draw(ctx);
                        } else {
                            // Render the element
                            view.element.draw(ctx);
                        }
                    } else if (startAngle < currTotalAngle && endAngle > currTotalAngle) {
                        // Render a part of the element
                        let elementOpt = extend({}, options);
                        elementOpt.angle = currTotalAngle - startAngle;
                        (new WxArcElement(view.element.x, view.element.y, elementOpt)).draw(ctx);
                    }
                });
            }
            ctx.restore();
            ctx.draw();

            return t;
        };
    }

    /**
     * Draw doughnut
     *
     * @param {Object[]} views - liner's view
     * @param {number} views[].index - Index of view
     * @param {Object} views[].legend - Legend's config
     * @param {number} views[].value - Data of each line point
     * @param {Object[]} views[].data - The data object
     * @param {WxElement} views[].element - The point for rending.
     * @param {BoxInstance} box - Box for draw
     */
    _drawDoughnut(views, box) {
        let me = this,
            ctx = me.ctx;

        ctx.save();
        me.initAvoidCollision();
        views.forEach(function(view) {
            view.element.draw(me.ctx);
            me._drawLabel(view, box);
        });

        ctx.draw();
        ctx.restore();
    }
    // Draw label
    _drawLabel(view, box) {
        let me = this,
            ctx = me.ctx;
        let labelDistancePercentage = me.chartConfig.labelDistancePercentage || 0.2;

        let {
            value,
            element,
            data,
            legend,
            formatValue,
            totalValue
        } = view;

        let centerAngle = element.startAngle + element.angle / 2;
        let currentRadius = element.radius;

        let { x:pointX, y:pointY } = element;
        // Line start point
        let startX = Math.cos(centerAngle) * currentRadius + pointX;
        let startY = Math.sin(centerAngle) * currentRadius + pointY;

        // Line turn around point
        let offsetRadius = currentRadius * labelDistancePercentage,
            turnRadius = currentRadius + offsetRadius;
        let turnX = Math.cos(centerAngle) * turnRadius + pointX;
        let turnY = Math.sin(centerAngle) * turnRadius + pointY;

        // Avoid Collision
        let adjustPoint = me.avoidCollision({
            x: turnX,
            y: turnY
        }, {
            x: pointX,
            y: pointY
        });
        turnX = adjustPoint.x;
        turnY = adjustPoint.y;

        let textLen = ctx.measureText(formatValue).width;
        let endX = turnX + ((turnX - pointX) > 0
                    ? offsetRadius
                    : -offsetRadius),
            endY = turnY;
        let textX = turnX - pointX > 0
                ? endX + 4
                : endX - 4 - textLen,
            textY = endY;

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = view.element.options.backgroundColor;
        ctx.fillStyle = view.element.options.backgroundColor;
        if (data.fontSize) ctx.fontSize = data.fontSize;
        ctx.moveTo(startX, startY);
        ctx.lineTo(turnX, turnY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.fillText(formatValue, textX, textY);
        ctx.restore();
    }
    // Get longest label
    _longestLabel(totalValue) {
        let me = this,
            visDatasets = me.visDatasets,
            ctx = me.ctx;
        let maxLabelWidth = 0;
        visDatasets.forEach(dataset => {
            let {
                label,
                value,
                format
            } = dataset;

            label = is.Function(format)
                ? format.call(me, label, value, totalValue, 0, dataset)
                : label;
            let textLen = ctx.measureText(label).width;

            maxLabelWidth = textLen > maxLabelWidth ? textLen : maxLabelWidth;
        });
        return maxLabelWidth;
    }
    // Get maximal font size of label
    _maximalLabelFontSize() {
        let me = this,
            visDatasets = me.visDatasets;
        let max= 0;
        visDatasets.forEach(dataset => {
            let {
                fontSize
            } = dataset;
            max = fontSize > max ? fontSize : max;
        });
        return max;
    }
    // Avoid Collision
    initAvoidCollision() {
        this._lastPoint = null;
    }
    avoidCollision(newPoint, centerPoint, avoidUnit = this.ctx.fontSize + 4) {
        let me = this,
            box = me.box;
        let cpx = centerPoint.x,
            cpy = centerPoint.y;
        if (me._lastPoint) {
            let lpx = me._lastPoint.x,
                lpy = me._lastPoint.y;
            let npx = newPoint.x,
                npy = newPoint.y;
            if ((npx - cpx) * (lpx - cpx) > 0 && Math.abs(lpy - npy) < avoidUnit) {
                let ny = (npx - cpx) > 0
                    ? lpy + avoidUnit
                    : lpy - avoidUnit;
                newPoint.y = ny;
            }
        }
        this._lastPoint = newPoint;
        return newPoint;
    }


    /**
     * Tooltip 'Element' model
     * @param {WxEvent} event
     * @param {Object[]} viewsArr
     */
    elementTooltip(event, viewsArr) {
        let me = this;
        let tc = me.chartConfig.tooltip;
        let { content } = tc;

        let position, text, view;
        for (let i=0; i< viewsArr.length; i++) {
            view = viewsArr[i];
            let element = view.element;
            if (element && element.inRange(event.x, event.y)) {
                position = tc.mouseFollow ?
                    { x: event.x, y: event.y, padding: element.padding } :
                    element.tooltipPosition(event.x, event.y);
                text = is.Function(content) ? content.call(me, view) : content.toString();
                break;
            }
        }

        return { position, text, views: view }
    }

    /**
     * Tooltip 'Axis' model
     * @param {WxEvent} event
     * @param {Object[]} viewsArr
     * @return {Object} position and text
     */
    axisTooltip(event, viewsArr) {
        return this.elementTooltip(event, viewsArr);
    }
}
