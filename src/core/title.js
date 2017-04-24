/* global module, wx, window: false, document: false */
'use strict';

import WxChart from './base'
import {extend, is} from '../util/helper'
import {BoxInstance} from './layout';
import WxBaseComponent from './base';

// Legend default config
const WX_TITLE_DEFAULT_CONFIG = {
    display: true,
    position: 'top', // top, bottom
    fullWidth: true, // if the fullWidth is false, the 'width' property should be existed.
    fontSize: 20,
    fontColor: '#666',
    padding: 10
};

export default class WxTitle extends WxBaseComponent {
    constructor(wxChart, config) {
        super(wxChart, config);
        this.config = extend(true, {}, WX_TITLE_DEFAULT_CONFIG, config);
    }

    /**
     * Update data and re-draw
     * @param {Object[]} text
     * @param {Object} [defaultOptions]
     * @returns {string} text
     */
    init(text, defaultOptions = {}) {
        let me = this;
        let config = me.config;

        text = text
            ? text
            : config.text;
        if (is.Undefined(text) || is.Null(text)) {
            throw new Error('Text is null');
        }

        me._datasets = text;
        return text;
    }

    calculateBox(area, datasets = this.config.text, config = this.config) {
        let me = this;
        let wxChart = me.wxChart,
            ctx = wxChart.ctx,
            fontSize = config.fontSize || 20;
        let x = area.x,
            y = area.y;
        let padding = config.padding || 10;

        let width = !!config.fullWidth
                ? (area.width - padding * 2)
                : config.width,
            outerWidth = !!config.fullWidth
                ? area.width
                : config.width,
            height = fontSize,
            outerHeight = height + padding * 2;

        if (config.position == 'bottom') {
            y = area.ry - outerHeight;
            y = y < area.y
                ? area.y
                : y;
        }

        return new BoxInstance({
            position: config.position,
            x,
            y,
            width,
            height,
            outerWidth,
            outerHeight
        });
    }

    draw(text = this.config.text, box = this.box, config = this.config) {
        let me = this,
            ctx = me.wxChart.ctx;
        let {
            x,
            y,
            width,
            outerWidth,
            height,
            outerHeight
        } = box;

        if (is.Undefined(text) || is.Null(text)) {
            throw new Error('Text is null');
        }

        let {fontColor, fontSize} = config;
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
