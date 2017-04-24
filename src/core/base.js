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
import {BoxInstance} from './layout';
import WxChart from '../charts/wxChart';
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
     * Initialize datasets and options
     * @param {Object[]} datasets
     * @param {Object} [defaultOptions]
     * @returns {Array|*}
     */
    init(datasets, defaultOptions = {}) {
        let me = this;

        if (is.Undefined(datasets) || is.Null(datasets)) {
            datasets = me.datasets;
            if (!datasets) {
                throw new Error('Datasets is null');
            }
        }

        if (!is.Array(datasets)) {
            datasets = [datasets];
        }

        datasets = datasets.map(function(dataset) {
            return extend({}, defaultOptions, dataset);
        });

        me._datasets = datasets;
        me._visDatasets = null;
        return me._datasets;
    }

    /**
     * Update data and re-draw
     * @param {Object[]} datasets
     * @param {BoxInstance} [area]
     * @param {Object} [config]
     */
    update(datasets, area, config = this.config) {
        let me = this;

        me.clear();
        if (!datasets) {
            return;
        }
        datasets = me.init(datasets);

        if (area && area instanceof BoxInstance) {
            area = me.box = me.calculateBox(area, datasets, config);
        } else if (me.box) {
            area = me.box;
        } else {
            return;
        }

        if (me.isVisiable()) {
            me.draw(datasets, area, config);
        }
    }

    /**
     * Calculate occupied space
     * @param {Object[]} [datasets] - datasets
     * @param {BoxInstance} [area] - Current box area
     * @param {Object} [config]
     * @returns {BoxInstance}
     */
    calculateBox(area, datasets = this.datasets, config = this.config) {
        return area;
    }

    /**
     * Set an occupied space for component
     * @param {BoxInstance} box - New box
     * @param {Boolean} [redraw=true] - Re-draw the component
     */
    setBox(box, redraw = true) {
        let me = this;
        if (redraw) {
            me.clear();
        }
        if (box && box instanceof BoxInstance) {
            me.box = box;
        }
        if (redraw && me.isVisiable()) {
            me.draw();
        }
    }

    /**
     * Draw the component
     *
     * @param {Object[]} [datasets] - datasets
     * @param {BoxInstance} [box] - Current box area
     * @param {Object} [config]
     */
    draw(datasets = this.datasets, box = this.box, config = this.config) {}
    /**
     * Clear canvas in component's box
     */
    clear() {
        let me = this;
        if (me.box) {
            me.wxChart.ctx.clearRect(me.box.x, me.box.y, me.box.outerWidth, me.box.outerHeight);
            me.wxChart.ctx.draw();
        }
    }

    isVisiable() {
        return !!this.config.display;
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
