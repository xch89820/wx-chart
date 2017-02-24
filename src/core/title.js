/* global module, wx, window: false, document: false */
'use strict';

import WxChart from './base'
import {extend, is} from '../util/helper'
import { BoxInstance } from './layout';
import WxBaseComponent from './base';

// Legend default config
const WX_TITLE_DEFAULT_CONFIG = {
    'display': true,
    'position': 'top', // top, bottom
    'fullWidth': true, // if the fullWidth is false, the 'width' property should be existed.
    'fontSize': 20,
    'fontColor': "#666",
    'padding': 10
};

export default class WxTitle extends WxBaseComponent{
    constructor(wxChart, config) {
        super(wxChart, config);
        this.config = extend(true, {}, WX_TITLE_DEFAULT_CONFIG, config);
    }

    /**
     * Update data and re-draw
     * @param {Object[]} text
     * @param {BoxInstance} [area=this.box]
     * @param {Object} [defaultOptions]
     * @returns {string} text
     */
    update(text, area, defaultOptions = {}) {
        let me = this;
        let config = me.config;


        area = area ? area: me.box;
        if (is.Undefined(area) || is.Null(area)) {
            throw new Error('Draw area is null');
        }

        text = text ? text : config.text;
        if (is.Undefined(text) || is.Null(text)) {
            throw new Error('Text is null');
        }

        me.clear();
        // Calculate the top-lef point and width and height
        me.box = me.calculateBox(text, area, config);

        if (me.isVisiable()) {
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
            y = area.ry - outerHeight;
            y = y < area.y ? area.y : y;
        }

        return new BoxInstance({position: me.config.position, x, y, width, height, outerWidth, outerHeight});
    }

    /**
     * Draw title
     * @param {string} [text] - The title's text
     */
    draw(text) {
        let me = this, ctx = me.wxChart.ctx;
        let {x, y, width, outerWidth, height, outerHeight} = me.box;

        text = text || me.config.text;
        if (is.Undefined(text) || is.Null(text)) {
            throw new Error('Text is null');
        }

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
};