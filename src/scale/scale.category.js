/* global module, wx, window: false, document: false */
'use strict';

import WxScale from '../core/scale'
import {extend, is, niceNum, almostEquals} from '../util/helper'

/**
 * @class Liner scale
 */
export default class WxCategoryScale extends WxScale {
    /**
     * Build a ticks array by minIndex or maxIndex
     * Use to generator category scale ticks
     *
     * @param {Array} legends - The legend config of chart
     * @param {number} maxIndex - Max index
     * @param {number} minIndex - Min index
     *
     * @return {Array} The ticks data
     */
    buildTicks(legends, maxIndex, minIndex) {
        if (!legends || !is.Array(legends)) {
            return legends;
        }
        minIndex = minIndex || 0;
        maxIndex = maxIndex || legends.length;

        return legends.slice(minIndex, maxIndex);
    }

    buildDatasets(legends, maxIndex, minIndex) {
        return this.buildTicks(...arguments);
    }

    /**
     * Get one point by a value
     * @param {number} index - The index of category
     */
    getPoint(index) {
        return this.getTicksPosition(index);
    }
}