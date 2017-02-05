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
    'colorTheme': 'red',

    // The title text or a title config object
    'title': undefined,

    // The borderWidth
    'borderWidth': 2,

    'padding': 10
};

/**
 * Doughut item config
 *
 * value: The value of chart
 * label: The legend text
 * color: The color of item ,by default we use the randomColour scheme to create color
 * radius: The percentage of radius, default is '100'
 * legend [Object] legend options
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
     * @param {number} [config.padding=0] - The padding of canvas.
     * @param {string} [config.display=block] - The display style of chart.
     *
     * @param {number} [config.cutoutPercentage=50] - The percentage of the chart that we cut out of the middle.
     * @param {number} [config.rotation=Math.PI * -0.5] - The rotation of the chart, where the first data arc begins.
     * @param {string} [config.colorTheme=red] - The randomColor scheme.
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
        let { cutoutPercentage, rotation, colorTheme='red', title, borderWidth, padding } = me.chartConfig;

        box = wxLayout.adjustBox();
        // First, we draw title
        if (me.title) {
           me.title.update(me.titleText, box);
           wxLayout.addBox(me.title.box);
        }

        box = wxLayout.adjustBox();
        // Second, random color and get legend datasets
        let rColors = randomColor({hue: colorTheme, luminosity: 'light', count: me.datasets.length});
        let rBorderColor = randomColor({hue: colorTheme, luminosity: 'dark', count: 1});
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
        let { x, y, width, height, outerWidth, outerHeight } = box;
        let minSize = Math.min(width - padding*2, height - padding*2);
        let outerRadius = Math.max((minSize - borderWidth*2) / 2, 0);
        let innerRadius = cutoutPercentage ? (outerRadius/100)*cutoutPercentage : 0,
            innerRadiusColor = me.config.backgroundColor||"#ffffff";
        let totalValue = me.calculateTotal();
        let pointX = x + (outerWidth / 2),
            pointY = y + (outerHeight / 2);


        let drawAngle = rotation;

        me.datasets.forEach(function(dataset, index){
            drawAngle = me.drawData(dataset, {pointX, pointY, drawAngle, outerRadius, innerRadius, totalValue, borderWidth});
        });

        me.box = new BoxInstance({position: 'top', x, y, width: width - padding*2 , outerWidth:box.outerWidth, height: height - padding*2, outerHeight:box.outerHeight});
        wxLayout.addBox(me.box);
    }

    drawData(dataset, options) {
        let me = this;
        let { pointX, pointY, drawAngle, outerRadius, innerRadius, totalValue, borderWidth } = options;
        let { label, value, color, borderColor, percentage, hidden} = dataset;
        let currentRadius = (outerRadius - innerRadius)/100 * percentage;

        if (!!hidden) {
            return drawAngle;
        }
        let startAngle = drawAngle,
            endAngle = drawAngle + (Math.PI * 2.0) * (value / totalValue);

        me.ctx.save();
        me.ctx.beginPath();

        me.ctx.arc(pointX, pointY, currentRadius, startAngle, endAngle);
        me.ctx.arc(pointX, pointY, innerRadius, endAngle, startAngle, true);

        me.ctx.closePath();
        me.ctx.strokeStyle = borderColor;
        me.ctx.lineWidth = borderWidth || 0;
        me.ctx.fillStyle = color;

        me.ctx.fill();
        me.ctx.lineJoin = 'bevel';

        if (borderWidth) {
            me.ctx.stroke();
        }
        me.ctx.draw();
        me.ctx.restore();
        return endAngle;
    };
}
