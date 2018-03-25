/**
 * Created by xu.chenhui on 2017/10/30.
 */

import {extend, is} from '../util/helper'
import WxElement from '../core/element'
let tinycolor = require("tinycolor2");

let WX_RECT_CONFIG = {
    //backgroundColor: '#fff',
    //backgroundAlpha: 0.8,
    borderColor: '#000',
    borderWidth: 1,
    border: 'top left right bottom', // space division
    touched: {
        //backgroundColor: tinycolor('#fff').darken(10).toString()
        //backgroundAlpha: 0.9
    }
};

/**
 * The rectangle element
 */
export default class WxRectElement extends WxElement {
    constructor(x, y, options) {
        super(x, y);

        let me = this;
        me.options = extend({}, WX_RECT_CONFIG, options);

        let { width, height} = me.options;
        me.width = width;
        me.height = height;
    }

    _getBoxBounds() {
        let me = this;
        let { x, y, width, height } = me;

        return {
            left: x,
            top: y,
            right: x + width,
            bottom: y + height
        }
    }

    get padding() {
        return this.width / 10;
    }

    inXRange(mouseX) {
        let bd = this._getBoxBounds();
        return mouseX > bd.left && mouseX < bd.right;
    }
    inYRange(mouseY) {
        let bd = this._getBoxBounds();
        return mouseY > bd.top && mouseY < bd.bottom;
    }
    inRange(mouseX, mouseY) {
        let bd = this._getBoxBounds();
        return (mouseX > bd.left && mouseX < bd.right) && (mouseY > bd.top && mouseY < bd.bottom);
    }
    _drawPath(ctx, border, boxBounds) {
        let end = {x:0, y:0};
        let borderArr = border.split(/\W+/);
        let doPath = (x, y, fn) => {
            if (end.x == x && end.y == y) {
                fn();
            } else {
                ctx.moveTo(x, y);
                fn();
            }
        };

        ctx.beginPath();
        if (borderArr.indexOf('top') > -1) {
            doPath(boxBounds.left, boxBounds.top, () => {
                ctx.lineTo(boxBounds.right, boxBounds.top);
            });
        }
        if (borderArr.indexOf('right') > -1) {
            doPath(boxBounds.right, boxBounds.top, () => {
                ctx.lineTo(boxBounds.right, boxBounds.bottom);
            });
        }
        if (borderArr.indexOf('bottom') > -1) {
            doPath(boxBounds.right, boxBounds.bottom, () => {
                ctx.lineTo(boxBounds.left, boxBounds.bottom);
            });
        }
        if (borderArr.indexOf('left') > -1) {
            doPath(boxBounds.left, boxBounds.bottom, () => {
                ctx.lineTo(boxBounds.left, boxBounds.top);
            });
        }
        ctx.stroke();
    }
    draw(ctx, protect = false) {
        let me = this;
        let bd = this._getBoxBounds();
        let { border, borderColor, borderWidth, backgroundColor,backgroundAlpha } = me.options;

        if (protect) ctx.save();
        // Fill box
        if (backgroundColor) {
            ctx.beginPath();
            ctx.fillStyle = backgroundColor;
            if (backgroundAlpha) ctx.globalAlpha = backgroundAlpha;
            ctx.rect(me.x ,me.y ,me.width, me.height);
            ctx.fill();
            if (backgroundAlpha) ctx.globalAlpha = 1;
        }

        // Draw box's margin
        if (borderWidth && borderWidth>0) {
            ctx.beginPath();
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = borderColor;
            me._drawPath(ctx, border, bd);
            ctx.stroke();
        }

        if (protect) ctx.restore();
    }
    clear(ctx, fillColor = '#ffffff', protect = false) {
        let me = this;
        let bd = this._getBoxBounds();
        let { border, borderWidth} = me.options;

        if (protect) ctx.save();

        ctx.beginPath();
        ctx.fillStyle = fillColor;
        ctx.rect(me.x ,me.y ,me.width, me.height);
        ctx.fill();

        if (borderWidth && borderWidth>0) {
            ctx.beginPath();
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = fillColor;
            me._drawPath(ctx, border, bd);
            ctx.stroke();
        }
        if (protect) ctx.restore();
    }
    tooltipPosition(mouseX, mouseY) {
        return { x: mouseX, y: mouseY, padding: this.padding };
    }
}
