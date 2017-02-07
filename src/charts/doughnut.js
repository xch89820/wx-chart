/* global module, wx, window: false, document: false */
'use strict';

import WxCanvas from '../util/wxCanvas';
import WxChart from '../core/base';
import WxTitle from '../core/title';
import WxLayout, { BoxInstance } from '../core/layout';
import WxLegend from '../core/legend';
import randomColor from '../util/randomColor';
import {extend, is} from '../util/helper'

// Doughut default config
const WX_DOUGHUT_DEFAULT_CONFIG = {
    // The percentage of the chart that we cut out of the middle.
    'cutoutPercentage': 50,

    // The rotation of the chart, where the first data arc begins.
    'rotation': Math.PI * -0.5,

    // The randomColor scheme
    // See https://github.com/davidmerfield/randomColor
    'color': {hue: 'red', luminosity: 'light'},

    // The title text or a title config object
    'title': undefined,

    // The borderWidth
    'borderWidth': 2,

    // Chart padding, default auto set
    'padding': undefined,

    'labelDistancePercentage': 0.15,
};

/**
 * Doughut item config
 *
 * value: The value of chart
 * label: The legend text
 * color: The color of item ,by default we use the randomColour scheme to create color
 * radius: The percentage of radius, default is '100'
 * legend: [Object] legend options
 */
const WX_DOUGHUT_ITEM_DEFAULT_CONFIG = {
    'hidden': false,
    'percentage': 100
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
        me.chartConfig = extend({}, WX_DOUGHUT_DEFAULT_CONFIG, config);

        me.title = null;
        // Initialize title and legend
        if (me.chartConfig.title) {
            me.title = new WxTitle(me, is.Object(me.chartConfig.title) ? me.chartConfig.title : null);
            me.titleText = is.String(me.chartConfig.title) ? me.chartConfig.title : me.chartConfig.title.text;
        }

        me.legend = new WxLegend(me, me.chartConfig.legendOptions);
        me.wxLayout = new WxLayout(me);
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
    update(datasets) {
        let me = this;
        super.update(datasets, WX_DOUGHUT_ITEM_DEFAULT_CONFIG);
        return me.draw();
    }

    /**
     * Draw chart
     */
    draw() {
        let box, me = this,
            wxLayout = me.wxLayout;
        let { cutoutPercentage, rotation, color, title, borderWidth, padding } = me.chartConfig;

        box = wxLayout.adjustBox();
        // First, we draw title
        if (me.title) {
           me.title.update(me.titleText, box);
           wxLayout.addBox(me.title.box);
        }

        box = wxLayout.adjustBox();
        // Second, random color and get legend datasets
        let rColors = randomColor(
            extend(true, {}, color, {count: me.datasets.length})
        );
        let rBorderColor = randomColor({hue: color.hue || 'black', luminosity: 'dark', count: 1});
        let legendDatasets = [];
        me.datasets.forEach(function(dataset, index){
            if (!dataset.color) {
                dataset.color = rColors[index];
            }
            if (!dataset.borderColor) {
                dataset.borderColor = me.config.backgroundColor||"#ffffff";
            }

            let legend = dataset.legend;
            if (!legend || is.String(legend)) {
                legendDatasets.push({
                    hidden: dataset.hidden || false,
                    text: is.String(legend) ? legend: dataset.label,
                    fillStyle: dataset.color,
                    strokeStyle: rBorderColor[0]
                });
            } else if (is.Object(legend)){
                legendDatasets.push(
                    extend({hidden: dataset.hidden}, legend)
                );
            }
        });
        me.legend.update(legendDatasets, box);
        wxLayout.addBox(me.legend.box);


        box = wxLayout.adjustBox();
        padding = padding || box.width*0.1;
        box.width -= padding;
        box.height -= padding;
        me.box = box;

        let { x, y, width, height, outerWidth, outerHeight } = box;
        let minSize = Math.min(width, height);
        let outerRadius = Math.max((minSize - borderWidth*2) / 2, 0);
        let innerRadius = cutoutPercentage ? (outerRadius/100)*cutoutPercentage : 0,
            innerRadiusColor = me.config.backgroundColor||"#ffffff";
        let totalValue = me.calculateTotal();
        let pointX = x + (outerWidth / 2),
            pointY = y + (outerHeight / 2);

        let drawAngle = rotation;
        me.initAvoidCollision();
        me.datasets.forEach(function(dataset, index){
            let startAngle = drawAngle,
                endAngle = startAngle + (Math.PI * 2.0) * (dataset.value / totalValue);
            let opt = {pointX, pointY, startAngle, endAngle, innerRadius, outerRadius, totalValue, borderWidth};
            me.drawData(dataset, opt);
            me.drawLabel(dataset, opt);

            drawAngle = endAngle;
        });
        wxLayout.addBox(me.box);
    }

    drawData(dataset, options) {
        let me = this, ctx = me.ctx;
        let { pointX, pointY, startAngle, endAngle, outerRadius, innerRadius, totalValue, borderWidth } = options;
        let { label, value, color, borderColor, percentage, hidden} = dataset;
        let currentRadius = (outerRadius - innerRadius)/100 * percentage;

        if (!!hidden) {
            return endAngle;
        }

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
    };

    drawLabel(dataset, options) {
        let me = this, ctx = me.ctx;
        let labelDistancePercentage = me.chartConfig.labelDistancePercentage||0.2;
        let { pointX, pointY, startAngle, endAngle, outerRadius, innerRadius, totalValue, borderWidth } = options;
        let { label, value, color, borderColor, percentage, hidden} = dataset;
        let currentRadius = (outerRadius - innerRadius)/100 * percentage;

        if (!!hidden) {
            return;
        }
        let centerAngle = startAngle + (endAngle - startAngle)/2;

        // Line start point
        let startX = Math.cos(centerAngle) * currentRadius + pointX;
        let startY = Math.sin(centerAngle) * currentRadius + pointY;

        // Line turn around point
        let offsetRadius = currentRadius * labelDistancePercentage,
            turnRadius = currentRadius + offsetRadius;
        let turnX = Math.cos(centerAngle) * turnRadius + pointX;
        let turnY = Math.sin(centerAngle) * turnRadius + pointY;

        // Avoid Collision
        let adjustPoint = me.avoidCollision({x:turnX, y:turnY}, {x:pointX,y:pointY});
        turnX = adjustPoint.x;
        turnY = adjustPoint.y;

        let textLen = ctx.measureText(label).width;
        let endX = turnX + ((turnX-pointX)>0 ? offsetRadius: -offsetRadius), endY = turnY;
        let textX = turnX-pointX > 0 ? endX + 4 : endX - 4 - textLen,
            textY = endY + ctx.fontSize/2;

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.moveTo(startX, startY);
        ctx.lineTo(turnX, turnY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.fillText(label, textX, textY);
        ctx.draw();
        ctx.restore();
    };

    initAvoidCollision() {
        this._lastPoint = null;
    }
    avoidCollision(newPoint, centerPoint, avoidUnit = this.ctx.fontSize + 4){
        let me = this, box = me.box;
        let cpx = centerPoint.x, cpy = centerPoint.y;
        if (me._lastPoint) {
            let lpx = me._lastPoint.x, lpy = me._lastPoint.y;
            let npx = newPoint.x, npy = newPoint.y;
            if ((npx-cpx) * (lpx-cpx) > 0 && Math.abs(lpy - npy) < avoidUnit) {
                let ny = (npx-cpx) > 0 ? lpy + avoidUnit : lpy - avoidUnit;
                newPoint.y = ny;
            }
        }
        this._lastPoint = newPoint;
        return newPoint;
    }
}
