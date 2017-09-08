/* global module, wx, window: false, document: false */
'use strict';

/**
 * An mixin class(implement by es6-mixins) for stacked point
 */
export default class WxStackMixin {
    /**
     * Calculate the yAxis data for *WxLinerScale*
     */
    stackYScaleAxisLimit() {
        let me = this;
        let min = 0, max = 0;
        me.visDatasets.forEach(function (data) {
            let sumNeg = 0, sumPos = 0;
            me.legends.forEach(function(legend) {
                let key = legend.key;
                let stackedVal = data[key];
                if (stackedVal < 0) {
                    sumNeg += stackedVal || 0;
                } else {
                    sumPos += stackedVal || 0;
                }
            });
            data.__sumNeg = sumNeg;
            data.__sumPos = sumPos;
            if (sumNeg < min) min = sumNeg;
            if (sumPos > max) max = sumPos;
        });

        return {max, min}
    }
    /**
     * Calculate the stack value
     * @param {number} index - The index of item
     * @param {Object} legendIndex - The index of legend
     * @param {number} [offset=0] - The offset value of stack
     * @param {WxScale} [yScale=this.yAxis] - Y-Axis instance
     * @return {{sumNeg: number, sumPos: number}}
     * @private
     */
    _getStackValue(index, legendIndex, offset = 0, yScale = this.yAxis) {
        let me = this,
            data = me.visDatasets[index];

        let stackedVal, sumNeg = 0, sumPos = 0;
        for (let j = 0; j < legendIndex; j++) {
            stackedVal = data[me.legends[j].key];
            if (stackedVal < 0) {
                sumNeg += stackedVal || 0;
            } else {
                sumPos += stackedVal || 0;
            }
        }
        return {
            sumNeg,
            sumPos
        }
    }

    /**
     * Calculate the stack bar
     * @param {number} index - The index of item
     * @param {Object} legendIndex - The index of legend
     * @param {number} [offsetValue=0] - The offset value of stack
     * @param {WxScale} [yScale=this.yAxis] - Y-Axis instance
     * @return {Object}
     * @private
     */
    _getStackPoint(index, legendIndex, offsetValue = 0, yScale = this.yAxis) {
        let me = this,
            data = me.visDatasets[index],
            value = data[me.legends[legendIndex].key];
        let { sumNeg, sumPos } = me._getStackValue(index, legendIndex, offsetValue, yScale);
        return value < 0 ? yScale.getPoint(sumNeg + value + offsetValue) : yScale.getPoint(sumPos + value + offsetValue) ;
    }
}