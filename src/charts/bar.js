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
import {extend, is, splineCurve} from '../util/helper';
import randomColor from '../util/randomColor';

// Bar legend's default config
const WX_BAR_LEGEND_DEFAULT_CONFIG = {
    borderWidth: 2,
    fillArea: true,
    fillAlpha: 0.5,
    // barWidth: 'auto' //Set each bar's width. If not set, the bars are sized automatically.
    barPercentage: 0.9 // Percent (0-1) of the available width each bar should be within the data point space,like the flexible layout~
    // fillStyle
    // strokeStyle
};
// Bar default config
const WX_BAR_DEFAULT_CONFIG = {
    minBetweenPixel: 5, // The minisize space between each bar.
    pointPercentage: 0.8, // Percent (0-1) of the space for each data point
    stacked: false, // If true, bars are stacked on the x-axis
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
    //borderWidth: 2,
    //fillArea: true,
    //fillAlpha: 0.5,
    //borderColor: '#ffffff',
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
     * @param {string} [datasets[].borderWidth=2] - Bar's border width
     * @param {string} [datasets[].strokeStyle=2] - Bar's border color
     * @param {number} [datasets[].fillArea=true] - Fill color or not
     * @param {number} [datasets[].fillAlpha=0.6] - Fill color Alpha
     * @param {number} [datasets[].fillStyle] - Fill color. The default color will randomly assigned by 'color' option.
     * @param {string} [datasets[].barWidth='auto'] - Point bar width.
     * @param {number} [datasets[].barPercentage=1] - Percent (0-1) of the available width each bar should be within the data point space, like the flexible layout.
     * @returns {*}
     */
    update(datasets) {
        let me = this;
        me._labels = null;
        me._legends = null;
        super.update(datasets, WX_BAR_ITEM_DEFAULT_CONFIG);
        return me.draw();
    }
    /**
     * Draw chart
     */
    draw() {
        let box,
            me = this,
            wxLayout = me.wxLayout;
        let {pointPercentage, minBetweenPixel, stacked, color} = me.chartConfig;

        // First, we draw title
        box = wxLayout.adjustBox();
        if (me.title) {
            me.title.update(me.titleText, box);
            wxLayout.addBox(me.title.box);
        }
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
            ctx = me.ctx;
        let yScaleItemOptions = me.chartConfig.yScaleItemOptions;

        // First, get all available values and calculate the max/min value
        let {max, min} = this.datasets.reduce((pre, cur) => {
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
