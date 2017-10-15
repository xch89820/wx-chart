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
import mitt from 'mitt';
import mixins from 'es6-mixins';

// Chart default config
let wxChartDefaultConfig = {
    fontSize: 10,
    width: 300,
    height: 200,
    display: 'block',
    padding: 0,
    backgroundColor: null
};

// Store all references of 'WxChart' instances - allowing us to globally resize chart instances on window resize.
let wxChartInstances = {};

export function getChartInstances(id) {
    if (id && id in wxChartInstances) {
        return wxChartInstances[id];
    }
    return null;
};

// The basic class of WeiXin chart
export default class WxChart {
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
        let me = this;

        // Event emitter
        mixins([mitt()], this, {
            // Mixins will create a new method to nested call all duplicate method
            mergeDuplicates: false
        });

        // Arguments parse...
        let chartConf;
        if (is.PureObject(config)) {
            chartConf = extend({}, wxChartDefaultConfig, config);
        } else if (is.Number(config) || is.String(config)) {
            // WxChart(id, width, height, display, ...options)
            chartConf = {
                'width': arguments[1],
                'height': 2 in arguments
                    ? arguments[2]
                    : wxChartDefaultConfig.height,
                'display': 3 in arguments
                    ? arguments[3]
                    : wxChartDefaultConfig.display
            };
            if (4 in arguments && is.PureObject(arguments[4])) {
                extend({}, wxChartDefaultConfig, chartConf, arguments[4]);
            } else {
                extend({}, wxChartDefaultConfig, chartConf);
            }
        }

        me.canvas = new WxCanvas(id, chartConf);
        me.ctx = me.canvas.getContext('2d');
        me.isWeiXinAPP = checkWX();
        me._id = uid();

        me.emit('initCanvas', {
            canvas: me.canvas,
            ctx: me.ctx,
            id: me.id + ''
        });

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
                ? (cvWidth / cvWidth).toFixed(2)
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
        me.innerBox = new BoxInstance('top', 0, 0, me.config.width - padding * 2, me.config.height - padding * 2, me.config.width, me.config.height);
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

        me.emit('clear', {
            canvas: me.canvas
        });
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
    get id() {
        return this._id;
    }

    // The 'config' property
    get config() {
        if (!this._config) {
            this._config = extend({}, wxChartDefaultConfig);
        }
        return this._config;
    }
    set config(chartConf) {
        let me = this;
        // Update chart config
        me.initConfig(chartConf);
        me.initContext();
        // Clear canvas
        me.clear();
        // Call redraw
        me.draw();
    }

    draw() {
        // Do nothing...
    }

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

        me.emit('update', {datasets});
        // Fill default Options
        me.clear();
        me._datasets = datasets;
        me._visDatasets = null;
        return me._datasets;
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

    calculateTotal() {
        let datasets = this.datasets;
        let total = 0;
        let value;

        datasets.forEach(function(dataset, index) {
            value = parseFloat(dataset.value);
            if (!is.NaN(value) && !dataset.hidden) {
                total += Math.abs(value);
            }
        });

        return total;
    }
}
