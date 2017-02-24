/* global module, wx, window: false, document: false */
'use strict';

import { checkWX, is, wxConverToPx, uid, retinaScale, extend } from '../util/helper';
import WxChart from './wxChart';
import WxCanvas from '../util/wxCanvas';

// The basic component
export default class WxBaseComponent {
    constructor(wxChart, config) {
        let me = this;

        if (!wxChart || !wxChart instanceof WxChart) {
            throw new Error('Should be an WxChart instance');
        }
        me.wxChart = wxChart;

        // scale set options
        this._datasets = [];

        return me;
    }

    /**
     * Update data and re-draw
     * @param {Object[]} [datasets]
     * @param {BoxInstance} [area=this.box]
     * @param {Object} [defaultOptions]
     * @returns {Array} datasets
     */
    update(datasets, area, defaultOptions={}) {
        let me = this;

        if (is.Undefined(datasets) || is.Null(datasets)) {
            datasets = me.datasets;
            if (!datasets) {
                throw new Error('Datasets is null');
            }
        }
        area = area ? area : me.box;
        if (is.Undefined(area) || is.Null(area)) {
            throw new Error('Draw area is null');
        }

        me.clear();

        if (!is.Array(datasets)) {
            datasets = [datasets];
        }

        datasets = datasets.map(function(dataset){
            return extend({}, defaultOptions, dataset);
        });

        me._datasets = datasets;
        return me._datasets;
    }

    /**
     * Clear canvas in component's box
     */
    clear() {
        let me = this;
        if (me.box) {
            me.wxChart.ctx.clearRect(
                me.box.x,
                me.box.y,
                me.box.outerWidth,
                me.box.outerHeight
            );
            me.wxChart.ctx.draw();
        }
    }

    isVisiable() {
        return !!this.config.display;
    }

    get datasets(){
        return this._datasets;
    }
    set datasets(datasets) {
        return this.update(datasets);
    }

    get position() {
        return this.config.position;
    }
    set position(value) {
        this.config.position = value;
        return this.update();
    }

    isHorizontal() {
        return this.position == 'top' || this.position == 'bottom';
    }
}
