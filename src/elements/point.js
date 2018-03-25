/* global module, wx, window: false, document: false */
'use strict';

import {extend, is} from '../util/helper'
import WxElement from '../core/element'

let WX_POINT_CONFIG = {
    radius: 2,
    style: 'circle', // Support triangle, rect and Image object
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
    hitRadius: 2,
    // Touched
    touched: {
        radius: 4,
        borderWidth: 1
    }
};

/**
 * The point element
 */
export default class WxPointElement extends WxElement {
    constructor(x, y, options) {
        super(x, y, options);

        let me = this;
        me.options = extend({}, WX_POINT_CONFIG, options);
        me.radius = me.options.radius || 2;
    }

    get padding() {
        let { radius, borderWidth } = this.options;
        return radius + borderWidth;
    }

    _inXRange = (point) => {
        let { radius, hitRadius } = this.options;
        return (Math.pow(point - this.x, 2) < Math.pow(radius + hitRadius, 2));
    };
    _inYRange = (point) => {
        let { radius, hitRadius } = this.options;
        return (Math.pow(point - this.y, 2) < Math.pow(radius + hitRadius, 2));
    };
    inXRange(mouseX) {
        return this._inXRange(mouseX);
    }
    inYRange(mouseY) {
        return this._inYRange(mouseY);
    }
    inRange(mouseX, mouseY) {
        let { radius, hitRadius } = this.options;
        return (Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)) < Math.pow(hitRadius + radius, 2);
    }
    tooltipPosition(mouseX, mouseY) {
        let { radius, borderWidth } = this.options;
        return {
            x: this.x,
            y: this.y,
            padding: this.padding
        };
    }
    draw(ctx, protect = false) {
        let { radius, borderWidth, backgroundColor, borderColor } = this.options;
        let { x, y } = this;

        if (protect) ctx.save();

        ctx.beginPath();
        ctx.fillStyle = backgroundColor;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();

        if (borderWidth) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = borderColor;
            ctx.stroke();
        }

        if (protect) ctx.restore();
    }
    clear(ctx, fillColor = '#ffffff', protect = false) {
        let { radius, borderWidth, backgroundColor, borderColor } = this.options;
        let { x, y } = this;

        if (protect) ctx.save();

        ctx.beginPath();
        ctx.fillStyle = fillColor;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();

        if (borderWidth) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = fillColor;
            ctx.stroke();
        }

        if (protect) ctx.restore();
    }
};
