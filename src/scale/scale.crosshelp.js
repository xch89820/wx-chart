/* global module, wx, window: false, document: false */
'use strict';

import WxScale from '../core/scale'
import WxLayout, {BoxInstance} from '../core/layout'
import {extend, is, niceNum, almostEquals} from '../util/helper'

const WX_CROSSSCALE_CONFIG = {
    xMargin: undefined, // undefined, a number or a function
    xFirstPointSpace: 'auto', // The interval of fixed-point distance y-Axix
};
/**
 * An cross scale helper
 */
export default class WxCrossScale {
    /**
     * @constructor
     * @param {WxScale} xScale - x-Axis instance
     * @param {WxScale} yScale - y-Axis instance
     * @param {Object} [config]
     */
    constructor(xScale, yScale, config) {
        if (!xScale instanceof WxScale && !yScale instanceof WxScale) {
            throw new Error('Should be an WxScale instance');
        }

        let me = this;
        me.xScale = xScale;
        me.yScale = yScale;

        me.config = extend(true, {}, WX_CROSSSCALE_CONFIG, config);
    }

    /**
     * Draw a cross scale
     */
    draw(area, xScaleDatasets, yScaleDatasets) {
        let me = this, {xMargin, xFirstPointSpace} = me.config;

        me.yScale.init(yScaleDatasets);
        let yBox = me.yScale.calculateBox(area, yScaleDatasets);
        me.xScale.init(xScaleDatasets);
        let xBox = me.xScale.calculateBox(area, xScaleDatasets);

        // Y-Base
        let yMHeight = xBox.outerHeight - xBox.marginTB - me.xScale.lineSpace;
        //yBox.y = yBox.y + yMHeight*2;
        me.yScale.config.fixPadding = yMHeight * 2;

        // Adjust X-BOX
        let xMWidth = yBox.outerWidth - yBox.marginLR - me.yScale.lineSpace;


        let xOffset = xMWidth - me.xScale.fixPadding / 2;

        let xExtendLeft;
        if (xFirstPointSpace === 'auto') {
            xExtendLeft = me.xScale.config.extendLeft || Math.min(xBox.width / 10, me.xScale.calculateTickWidth(xScaleDatasets, xBox) / xScaleDatasets.length);
        } else if (xFirstPointSpace === 0) {
            // Zero y-space; The first point of Y will overlap the last point of X, so remove the last point of X
            yScaleDatasets[yScaleDatasets.length - 1].text = '';
            xExtendLeft = 0;
        } else if (is.Function(xFirstPointSpace)) {
            xExtendLeft = xFirstPointSpace(xBox, yBox, area, me.xScale, me.yScale, xScaleDatasets, yScaleDatasets);
        } else {
            xExtendLeft = parseFloat(xFirstPointSpace);
        }

        xOffset -= (me.xScale.config.ticks.lineWidth || 1);
        xOffset += xExtendLeft;

        let xAxisXPoint = area.x + xOffset;
        if (is.Function(xMargin)) {
            xMargin = xMargin(xBox, yBox, area, me.xScale, me.yScale, xScaleDatasets, yScaleDatasets);
        } else if (!xMargin || !is.Number(xMargin)) {
            xMargin = 0;
        }

        let calXbox = new BoxInstance(xBox.position, xAxisXPoint, xBox.y, xBox.width - xOffset - xMargin, xBox.height, xBox.outerWidth - xOffset, xBox.outerHeight);
        me.yScale.setBox(yBox, false);
        me.yScale.update(yScaleDatasets);

        me.xScale.setBox(calXbox, false);
        me.xScale.config.extendLeft = xExtendLeft;
        me.xScale.update(xScaleDatasets);

        return {xBox: calXbox, yBox: yBox};
    }
}
