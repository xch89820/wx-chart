/* global module, wx, window: false, document: false */
'use strict';

import WxChart from './base'
import {extend, is} from '../util/helper'
import { BoxInstance } from './layout';

// Legend default config
const WX_TITLE_DEFAULT_CONFIG = {
    'display': true,
    'position': 'top', // top, bottom
    'fullWidth': true, // if the fullWidth is false, the 'width' property should be existed.
    'fontSize': 20,
    'fontColor': "#666",
    'padding': 10
};

export default class WxTitle {
    constructor(wxChart, config) {
        let me = this;

        if (!wxChart || !wxChart instanceof WxChart) {
            throw new Error('Should be an WxChart instance');
        }
        me.wxChart = wxChart;
        me.config = extend(true, {}, WX_TITLE_DEFAULT_CONFIG, config);

    }

    /**
     * Update text config
     * @param {string} text
     * @param {Object} area
     * area's example: {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
            lx: canvas.width - padding,
            ly: canvas.height - padding,
        };
     */
    update(text, area) {
        let me = this;
        let config = me.config;

        text = text || config.text;
        if (is.Undefined(text) || is.Null(text) || is.Undefined(area)) {
            return;
        }

        me.clear();
        // Calculate the top-lef point and width and height
        me.box = me.calculateBox(text, area, config);

        if (!!config.display) {
            me.draw(text);
        }
    }

    calculateBox(text, area, config) {
        let me = this;
        let wxChart = me.wxChart,
            ctx = wxChart.ctx,
            fontSize = config.fontSize||20;
        let x = area.x, y = area.y;
        let padding = config.padding || 10;

        let width = !!me.config.fullWidth ? (area.width - padding * 2) : me.config.width,
            outerWidth = !!me.config.fullWidth ? area.width : me.config.width,
            height = fontSize,
            outerHeight = height + padding * 2;

        if (me.config.position == 'bottom') {
            y = area.ly - outerHeight;
            y = y < area.y ? area.y : y;
        }

        return new BoxInstance({position: me.config.position, x, y, width, height, outerWidth, outerHeight});
    }

    /**
     * Draw legend
     * @param [datasets]
     */
    draw(text) {
        let me = this, ctx = me.wxChart.ctx;
        let {x, y, width, outerWidth, height, outerHeight} = me.box;

        let {fontColor, fontSize} = me.config;
        // Clear the area of legend
        me.clear();
        // Begin a new sub-context
        ctx.save();

        ctx.textBaseline = 'top';
        ctx.textAlign = 'start';
        ctx.fillStyle = fontColor;
        ctx.fontSize = fontSize;

        let textLen = ctx.measureText(text).width;
        x += (width - textLen) / 2;
        ctx.fillText(text, x, y);

        ctx.restore();
        ctx.draw();
    }

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

    isHorizontal() {
        let position = this.config.position;
        return position == 'top' || position == 'bottom';
    }
};