/* global module, wx, window: false, document: false */
'use strict';

import WxScale from '../core/scale'
import {extend, is, niceNum, almostEquals} from '../util/helper'

/**
 * @class Liner scale
 */
export default class WxLinerScale extends WxScale {
    /**
     * Build a ticks array by max/min value
     * Use to generator liner scale ticks
     *
     * @param {number} max - Max value
     * @param {number} min - Min value
     * @param {number} maxTicks - The maxinum number of ticks
     * @param {number} [stepSize] - Special space size
     *
     * @return {Array} The ticks data
     */
    buildTicks(max, min, maxTicks, stepSize) {
        let spacing,
            ticks = [];
        if (!!stepSize && stepSize > 0) {
            spacing = stepSize;
        } else {
            let niceRange = niceNum(max - min, false);
            spacing = niceNum(niceRange / (maxTicks - 1), true);
        }

        let niceMin = Math.floor(min / spacing) * spacing;
        let niceMax = Math.ceil(max / spacing) * spacing;
        let numSpaces = (niceMax - niceMin) / spacing;

        if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
            numSpaces = Math.round(numSpaces);
        } else {
            numSpaces = Math.ceil(numSpaces);
        }

        for (let j = 0; j < numSpaces; j++) {
            ticks.push(niceMin + (j * spacing));
        }
        ticks.push(niceMax);

        return ticks;
    }

    /**
     * Build a datasets base on buildTicks
     *
     * @param {number} max - Max value
     * @param {number} min - Min value
     * @param {number} maxTicks - The maximum number of ticks
     * @param {number} [stepSize] - Assign the space size
     * @param {Object} [scaleOptions] - Assign the dataset item's options
     *
     * @return {Array} The ticks data
     */
    buildDatasets(max, min, maxTicks, stepSize, scaleOptions) {
        let me = this;
        let ticks = me.buildTicks(max, min, maxTicks, stepSize);
        if (!me.isHorizontal())
            ticks.reverse();
        return ticks.map(function(val) {
            return extend({
                text: val + '',
                value: val
            }, scaleOptions);
        });
    }

    /**
     * Calculate the maximum ticks of scale
     *
     * @param {BoxInstance} area - area of chart
     * @param {WxCanvasRenderingContext2D} ctx - Content of chart
     * @returns {number} maxTicks
     */
    calculateTickLimit(area, ctx) {
        let me = this,
            fontSize = ctx.fontSize;
        let maxTicks;
        let tickOpts = me.config.ticks;

        if (me.isHorizontal()) {
            maxTicks = Math.min(tickOpts.maxTicksLimit
                ? tickOpts.maxTicksLimit
                : 11, Math.ceil(area.width / 50));
        } else {
            // The factor of 2 used to scale the font size has been experimentally determined.
            maxTicks = Math.min(tickOpts.maxTicksLimit
                ? tickOpts.maxTicksLimit
                : 11, Math.ceil(area.height / (2 * fontSize)));
        }

        return maxTicks;
    }

    /**
     * Get one point by a value
     * **Must** run after 'setBox' or 'update'
     * @param {number} value
     * @returns {object} point
     *
     */
    getPoint(value) {
        let me = this,
            box = this.box;
        let pointX,
            pointY;

        let startVal = parseInt(me.visDatasets[0].value),
            endVal = parseInt(me.visDatasets[me.visDatasets.length - 1].value);
        // if (!me.isHorizontal()) {
        //     [startVal,endVal] = [endVal,startVal];
        // }
        let range = endVal - startVal;

        if (me.isHorizontal()) {
            let realWidth = me.getTicksPosition(me.visDatasets.length - 1).x - me.getTicksPosition(0).x;
            pointX = me.getTicksPosition(0).x + (realWidth / range * (value - startVal));
            pointY = me.position === 'top'
                ? box.ry - me.lineSpace
                : box.ly + me.lineSpace;
        } else {
            let realHeight = me.getTicksPosition(me.visDatasets.length - 1).y - me.getTicksPosition(0).y;
            pointX = me.position === 'left'
                ? box.rx - me.lineSpace
                : box.lx + me.lineSpace;
            pointY = me.getTicksPosition(0).y + (realHeight / range * (value - startVal));
        }
        return {x: Math.round(pointX), y: Math.round(pointY)};
    }
}
