/* global module, wx, window: false, document: false */
'use strict';

import {
    checkWX,
    is,
    wxConverToPx,
    uid,
    retinaScale,
    extend
} from '../util/helper';
import WxCanvas from '../util/wxCanvas';
import {BoxInstance} from '../core/layout';
// import mixins from 'es6-mixins';
import WxEventFactory from '../core/event'
import WxTooltip from '../core/tooltip'
import Emitter from '../util/emitter';

// Chart default config
let WX_CHART_DEFAULT_CONFIG = {
    fontSize: 10,
    width: 300,
    height: 200,
    display: 'block',
    padding: 0
};

let WX_TOOLTIP_DEFAULT_CONFIG = {
    model: 'element', // Display model: element or axis
    axisMark: {
        strokeStyle: '#666666',
        lineWidth: 1
    },
    displayTooltip: true, // Display tooltip
    delay: 200, // Delay to display
    mouseFollow: false, // Display tooltip position on the basis of the mouse or self fixed position
    /**
     * @param {Object[]|Object} views - liner's view
     * @param {number} views[].index - Index of view
     * @param {Object} views[].legend - Legend's config
     * @param {number} views[].value - Data of each line point
     * @param {Object[]} views[].data - The data object
     * @param {WxElement} views[].element - The point for rending.
     * @param {Array[]|undefined} labels - axis's label
     * @return {{text: *}}
     */
    content: function(views, labels) {
        let view;
        if (is.Array(views) && views.length === 1) {
            view = views[0];
        } else if (is.PureObject(views)) {
            view = views;
        }

        // Just one element
        if (view) {
            let opt =  {};
            if (labels) {
                opt.title = labels[view.index];
                opt.text = view.legend.text + ' : ' + view.value;
            } else {
                opt.title = view.legend.text + ' : ' + view.value;
            }
            return opt;
        } else {
            let title = labels[views[0].index];
            let text = views.map(view =>
                view.legend.text + ':' + (view.value? view.value :'')
            ).join('</br>');
            return {
                title, text
            }
        }
    },
    defaultChecker(opt, lastOpt) {
        return opt && lastOpt
            && opt.position.x === lastOpt.position.x
            && opt.position.y === lastOpt.position.y ;
    }
};

// Store all references of 'WxChart' instances - allowing us to globally resize chart instances on window resize.
let wxChartInstances = {};

export function getChartInstances(id) {
    if (id && id in wxChartInstances) {
        return wxChartInstances[id];
    }
    return null;
}

// The basic class of WeiXin chart
export default class WxChart extends Emitter {
    /**
     * @constructor
     * @param {string|HTMLCanvasElement} id - Canvas id ,DOM ID or HTMLElement
     * @param {Object|number} [config] - The config of Canvas or the width of chart.
     * @param {number} [config.width] - The width of canvas.
     * @param {number} [config.height] - The height of canvas.
     * @param {number} [config.padding] - The padding of canvas.
     * @param {string} [config.display] - The display style of chart.
     */
    constructor(id, config) {
        super();

        let me = this;

        // Arguments parse...
        let chartConf;
        if (is.PureObject(config)) {
            chartConf = extend({}, WX_CHART_DEFAULT_CONFIG, config);
        } else if (is.Number(config) || is.String(config)) {
            // WxChart(id, width, height, display, ...options)
            chartConf = {
                'width': arguments[1],
                'height': 2 in arguments
                    ? arguments[2]
                    : WX_CHART_DEFAULT_CONFIG.height,
                'display': 3 in arguments
                    ? arguments[3]
                    : WX_CHART_DEFAULT_CONFIG.display
            };
            if (4 in arguments && is.PureObject(arguments[4])) {
                extend({}, WX_CHART_DEFAULT_CONFIG, chartConf, arguments[4]);
            } else {
                extend({}, WX_CHART_DEFAULT_CONFIG, chartConf);
            }
        }

        // Tooltip show
        chartConf = extend({}, { tooltip: WX_TOOLTIP_DEFAULT_CONFIG }, chartConf);

        me.canvas = new WxCanvas(id, chartConf);
        me.ctx = me.canvas.getContext('2d');
        me.isWeiXinAPP = checkWX();
        me._id = uid();

        me.emit('initCanvas', me.canvas, me.ctx, me.id + '');

        me._config = me.initConfig(chartConf);
        me.initContext();

        // Append to wxChartInstances
        wxChartInstances[me.id + ''] = me;

        return me;
    }

    initConfig(config) {
        let me = this;
        if (!me.canvas) {
            console.error("Failed to create WxChart: can't acquire context!");
        }

        let canvas = me.canvas,
            cvWidth = canvas.width,
            cvHeight = canvas.height;
        config.width = cvWidth;
        config.height = cvHeight;
        config.aspectRatio = config.aspectRatio
            ? config.aspectRatio
            : !is.Undefined(cvHeight) && !is.Undefined(cvWidth)
                ? (cvWidth / cvHeight).toFixed(2)
                : null;
        config.display = config.display || 'block';
        return config;
    }

    initContext() {
        let me = this;
        if (!me.canvas) {
            console.error("Failed to create WxChart: can't acquire context!");
            return me;
        }
        // Set scale of canvas
        retinaScale(me.ctx, me.canvas.width, me.canvas.height);

        // Set font size
        if (me.config.fontSize) {
            me.ctx.fontSize = me.config.fontSize;
        }

        // calculate box
        let padding = me.config.padding || 0;
        me.innerBox = new BoxInstance('top', 0, 0, me.canvas.width - padding * 2, me.canvas.height - padding * 2, me.canvas.width, me.canvas.height);
    }

    draw(animation) {
        // Do nothing...
    }

    redraw(animation) {}

    /**
     * Get the chat `view` for draw
     * @param {BoxInstance} box
     * @param {Object} [legend]
     * @param {number} [legendIndex]
     *
     * @return {Object} view contains four elements
     * value - the element value
     * element - view's element instance
     * data - view's dataset
     * legend - view's legend
     * index - sequence number
     */
    renderViews(box, legend, legendIndex) {}

    /**
     * Render view
     * @param {Object} data
     * @param {number} index
     * @param {Object} opt
     */
    renderView(data, index, opt) {}

    /**
     * Render labels
     * @param {number} value
     * @param {number|*} totalValue
     * @param {WxElement} element
     * @param {Object} data
     * @param {Object} legend
     * @param {number} index
     */
    renderLabel(value, totalValue, element, data, legend, index) {}

    update(datasets, defaultItemOpt) {
        let me = this;
        if (is.Undefined(datasets)) {
            return;
        }
        if (!is.Array(datasets)) {
            datasets = [datasets];
        }

        datasets = datasets.map(function(dataset) {
            return extend({}, defaultItemOpt, dataset);
        });

        me.emit('update', datasets);
        // Fill default Options
        me.clear();
        me._datasets = datasets;
        me._visDatasets = null;

        // calculate total value
        me.totalValues = me.calculateTotal();
        return me._datasets;
    }

    clear() {
        let me = this;
        me.ctx.clearRect(0, 0, me.canvas.width, me.canvas.height);
        if (me.config.backgroundColor) {
            me.ctx.save();
            me.ctx.fillStyle = me.config.backgroundColor;
            me.ctx.fillRect(0, 0, me.canvas.width, me.canvas.height);
            me.ctx.restore();
            me.ctx.draw();
        }

        me.emit('clear', me.canvas);
    }

    destroy() {
        let me = this;

        me.clear();
        me.canvas.releaseContext();

        if (me.id && me.id in wxChartInstances) {
            delete wxChartInstances[me.id];
        }

        //me.id = null;
        me.canvas = null;
        me.ctx = null;
        me._config = null;
        me.innerBox = null;

        me.emit('destroy');
    }

    /** Views operation **/
    getCurrView = (views, index) => {
        if (index > views.length - 1) {
            return;
        }
        return views[index];
    };

    getNextViewHasElement = (views, index, spanGaps) => {
        // The end
        if (index >= views.length - 1) {
            return;
        }
        let nextDate = views[index + 1];
        if (!nextDate.element) {
            if (!!spanGaps)
                return this.getNextViewHasElement(views, index + 1, spanGaps);
            else
                return;
        }
        return nextDate;
    };

    getNextElement = (views, index, spanGaps) => {
        let next = this.getNextViewHasElement(views, index, spanGaps);
        return next ? next.element : null;
    };

    getPreViewHasElement = (views, index, spanGaps) => {
        if (index <= 0) {
            return;
        }
        let preDate = views[index - 1];
        if (!preDate.element) {
            if (!!spanGaps)
                return this.getPreViewHasElement(views, index - 1, spanGaps);
            else
                return;
        }
        return preDate;
    };

    getPreElement = (views, index, spanGaps) => {
        let pre = this.getPreViewHasElement(views, index, spanGaps);
        return pre ? pre.element : null;
    };

    /** property **/
    get id() {
        return this._id;
    }

    // The 'config' property
    get config() {
        if (!this._config) {
            this._config = extend({}, WX_CHART_DEFAULT_CONFIG);
        }
        return this._config;
    }

    set config(chartConf) {
        let me = this;
        // Update chart config
        me._config = me.initConfig(chartConf);
        me.initContext();
        // Clear canvas
        me.clear();
        // Call redraw
        me.draw();
    }

    get datasets() {
        return this._datasets;
    }
    set datasets(datasets) {
        return this.update(datasets);
    }

    /**
     * Get visible ticks
     */
    get visDatasets() {
        return this._visDatasets
            ? this._visDatasets
            : this._visDatasets = this.datasets.filter((v) => !!v.display);
    }
    // Can not reset
    set visDatasets(val) {}

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

    getLegendConfig() {
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
    // legends
    get legends() {
        let me = this;
        if (!me._legends) {
            me._legends = me.getLegendConfig();
        }
        return me._legends;
    }

    set legends(value) {
        this._legends = value;
    }

    calculateMaxValue(datasets = this.visDatasets, lkey = 'key') {
        let me = this,
            max = 0;

        me.legends.forEach(function(legend, index){
            datasets.forEach(function(dataset, index) {
                let value = parseFloat(dataset[legend[lkey]]);
                if (!is.NaN(value)) {
                    max = max > value ? max : value;
                }
            });
        });

        return max;
    }

    calculateTotal(datasets = this.visDatasets, lkey = 'key') {
        let me = this,
            totalValues = {};

        me.legends.forEach(function(legend, index){
            let total = 0;
            datasets.forEach(function(dataset, index) {
                let value = parseFloat(dataset[legend[lkey]]);
                if (!is.NaN(value)) {
                    total += Math.abs(value);
                }
            });
            totalValues[legend[lkey]] = total;
        });

        return totalValues;
    }

    getTotalValue(key = 'value') {
        let me = this;
        if (me.totalValues) {
            me.totalValues = me.calculateTotal();
        }
        return me.totalValues[key];
    }

    /**
     * Tooltip 'Element' model
     * @param {WxEvent} event
     * @param {Object[]} views
     * @return {Object} position and text
     */
    elementTooltip(event, views) {
        throw Error('Chart must implement elementTooltip');
    }

    /**
     * Tooltip 'Axis' model
     * @param {WxEvent} event
     * @param {Object[]} views
     * @return {Object} position and text
     */
    axisTooltip(event, views) {
        throw Error('Chart must implement axisTooltip');
    }


    /**
     * Default mouseover handler
     * @param views
     * @param {Object[][]} viewArr - liner's view
     * @param {number} viewArr[][].index - Index of view
     * @param {Object} viewArr[][].legend - Legend's config
     * @param {number} viewArr[][].value - Data of each line point
     * @param {Object[]} viewArr[][].data - The data object
     * @param {WxElement} viewArr[][].element - The point for rending.
     */
    mouseoverTooltip(viewArr) {
        let me = this,
            tooltipConfig = me.chartConfig.tooltip;

        let timer, lastTime, lastTooltipOpt,
            delay = tooltipConfig.delay || 0;
        let eventBus = new WxEventFactory(this);
        let tooltip = new WxTooltip(this, tooltipConfig);

        return (e) => {
            let event = eventBus.eventReceiver(e);
            if (!event) {
                return;
            }
            let tooltipOpt = me[tooltipConfig.model + 'Tooltip'].call(me, event, viewArr);
            let { position, text, checker, before, after } = tooltipOpt;

            checker = checker || tooltipConfig.defaultChecker;
            if (position) {
                if (checker && checker(tooltipOpt, lastTooltipOpt)) return;
                // Check tooltip change
                else {
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }
                    // Record position
                    if (tooltip.shown) {
                        tooltip.clear();
                        me.redraw(false);
                    }
                    lastTooltipOpt = tooltipOpt;
                }
            } else {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                if (tooltip.shown) {
                    tooltip.clear();
                    me.redraw(false);
                }
                lastTooltipOpt = null;
                return;
            }

            //console.log(`Tooltip show: ${position.x}, ${position.y} , text : ${text.title} ${text.text? ('-' + text.text) : ''}`);
            let showX = position.x + position.padding,
                showY = position.y + position.padding;
            let box = me.innerBox.clone();
            box.x = showX;
            box.y = showY;
            let calBox = tooltip.calculateBox(box, text);
            if (calBox.ex > me.innerBox.ex) {
                // Out of the x-edge
                box.x = position.x - position.padding - calBox.outerWidth;
            }
            if (calBox.ey > me.innerBox.ey) {
                // Out of the y-edge
                box.y = position.y - position.padding - calBox.outerHeight;
            }

            timer = setTimeout(function(){
                if (before) before.call(me, tooltip, box);
                // me.redraw(false);
                tooltip.update(text, box);
                if (after) after.call(me, tooltip, box);
            }, delay);
        };
    }
}
