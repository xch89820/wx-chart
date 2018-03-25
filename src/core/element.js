/* global module, wx, window: false, document: false */
'use strict';
import { extend, is } from '../util/helper'

/**
 * Virtual element base class
 * Every element represent to an `entity` at chart
 *
 * Element only implement 'pure' function for get range or draw, not bind any context of canvas or event
 */
export default class WxElement {
    constructor(x, y, options) {
        this.x = x;
        this.y = y;
        this.options = options;
    }

    inXRange(mouseX) {
        throw new Error('Not implement inXRange function!');
    }
    inYRange(mouseY) {
        throw new Error('Not implement inYRange function!');
    }
    inRange(mouseX, mouseY) {
        throw new Error('Not implement inYRange function!');
    }
    tooltipPosition(mouseX, mouseY) {
        let { x, y } = this;
        return { x, y };
    }
    draw(ctx, protect = false) {
        throw new Error('Not implement draw function!');
    }
    clear(ctx, fillColor = '#ffffff') {
        throw new Error('Not implement clear function!');
    }
    touchedDraw(ctx, extendOptions, protect = false) {
        let opt = extend({}, this.options.touched, extendOptions);
        return this.draw(ctx, opt);
    }
}