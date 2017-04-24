/* global module, wx, window: false, document: false */
'use strict';
import WxChart from './base'
import {extend, is} from '../util/helper'

/**
 * A box model description
 * @typedef {Object} BoxInstance
 * @property {number} x - The x point.
 * @property {number} y - The y point.
 * @property {number} width - Inner width (context only, not calculate padding and margin)
 * @property {number} height - Inner height (context only, not calculate padding and margin)
 * @property {number} outerWidth - Outer width
 * @property {number} outerHeight - Outer height
 *
 *
 * (x,y) -------------------------- (ex, y)
 *   |                                 |
 *   |    (lx,ly)-------------(rx,ly)  |
 *   |      |                    |     |
 *   |      |                    |     |
 *   |    (lx,ry)-------------(rx,ry)  |
 *   |                                 |
 * (x,ey) ------------------------- (ex, ey)
 */
export class BoxInstance {
    constructor(position, x, y, width, height, outerWidth, outerHeight) {
        let me = this;
        if (is.PureObject(position)) {
            let opt = position;

            position = opt.position;
            x = opt.x;
            y = opt.y;
            width = opt.width;
            height = opt.height;

            let padding = opt.padding,
                margin = opt.margin;
            if (is.Number(padding) && is.Number(margin)) {
                outerWidth = width + padding * 2 + margin * 2;
                outerHeight = height + padding * 2 + margin * 2;
            } else {
                outerWidth = opt.outerWidth;
                outerHeight = opt.outerHeight;
            }
        }

        me.position = position;
        me.width = width;
        me.height = height;
        me.outerWidth = outerWidth;
        me.outerHeight = outerHeight;

        Object.defineProperty(this, 'x', {
            get: function() {
                return x;
            },
            set: function(value) {
                me.width += x - value;
                me.outerWidth += x - value;
                x = value;
            }
        });

        Object.defineProperty(this, 'y', {
            get: function() {
                return y;
            },
            set: function(value) {
                me.height += y - value;
                me.outerHeight += y - value;
                y = value;
            }
        });
    }

    /**
     * The x,y in right-bottom
     */
    get ex() {
        return this.x + this.outerWidth;
    }
    get ey() {
        return this.y + this.outerHeight;
    }
    /**
     * The x,y in content
     */
    get lx() {
        return this.x + this.marginLR;
    }
    get ly() {
        return this.y + this.marginTB;
    }
    get rx() {
        return this.x + this.width + this.marginLR;
    }
    get ry() {
        return this.y + this.height + this.marginTB;
    }
    get marginLR() {
        return (this.outerWidth - this.width) / 2;
    }
    set marginLR(value) {
        if (is.Number(value)) {
            this.width -= value * 2;
        }
    }
    get marginTB() {
        return (this.outerHeight - this.height) / 2;
    }
    set marginTB(value) {
        if (is.Number(value)) {
            this.height -= value * 2;
        }
    }

    /**
     * Clone this box and return an new Instance
     * @returns {BoxInstance}
     */
    clone() {
        let me = this;
        return new BoxInstance(me.position, me.x, me.y, me.width, me.height, me.outerWidth, me.outerHeight)
    }

    /**
     * Check whether intersect with other BoxInstance
     */
    isIntersect(boxInstance) {
        let me = this;
        return !(me.ex < boxInstance.x || me.x > boxInstance.ex || me.ey < boxInstance.y || me.y < boxInstance.ey);
    }

    toObject() {
        return {
            position: this.position,
            x: this.x,
            y: this.y,
            ex: this.ex,
            ey: this.ey,
            lx: this.lx,
            ly: this.ly,
            rx: this.rx,
            ry: this.ry,
            width: this.width,
            height: this.height,
            outerHeight: this.outerHeight,
            outerWidth: this.outerWidth
        };
    }
}
/**
 * @class WxLayout
 * Find the best box area of items
 */
export default class WxLayout {
    constructor(wxChart) {
        let me = this;

        if (!wxChart || !wxChart instanceof WxChart) {
            throw new Error('Should be an WxChart instance');
        }
        me.wxChart = wxChart;
        //me.initBox = wx.wxChart.innerBox.clone();
        me._boxs = [];
    }

    /**
     * Add an boxInstance
     * @param {BoxInstance} boxInstance
     * @returns {number} The box id
     */
    addBox(boxInstance) {
        let me = this;
        if (!boxInstance instanceof BoxInstance) {
            throw new Error('Please add an BoxInstance Object');
        }
        return parseInt(me._boxs.push(boxInstance)) - 1;
    }

    /**
     * Remove an boxInstance
     * @param {(BoxInstance|number)} boxId - The box id
     */
    removeBox(boxId) {
        let me = this;
        if (is.Number(boxId)) {
            me._boxs.splice(boxId, 1);
        } else if (boxId instanceof BoxInstance) {
            me._boxs.splice(me._boxs.indexOf(boxId), 1);
        }
    }

    removeAllBox() {
        this._boxs = [];
    }

    adjustBox() {
        let me = this;
        let box = me.wxChart.innerBox.clone();
        me._boxs.forEach(function(boxInstance) {
            let {
                position,
                x,
                y,
                height,
                width,
                outerWidth,
                outerHeight
            } = boxInstance;
            switch (position) {
                case 'top':
                    box.y += outerHeight;
                    break;
                case 'bottom':
                    box.outerHeight -= outerHeight;
                    box.height -= outerHeight;
                    break;
                case 'left':
                    box.x += outerWidth;
                    break;
                case 'right':
                    box.outerWidth -= outerWidth;
                    box.width -= outerWidth;
                    break;
            }
        });
        return box;
    }
}
