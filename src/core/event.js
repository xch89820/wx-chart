/* global module, wx, window: false, document: false */
'use strict';
import { extend, is, checkWX } from '../util/helper'
import { WxTouch } from '../util/touch'

/*
 * WxChart internal events:
 * All support event will cover to the list:
 * 		mouseenter
 *		mousedown
 *		mousemove
 *		mouseup
 *		mouseout
 *		click
 *		dblclick
 *		contextmenu
 *		keydown
 *		keypress
 *		keyup
 */
const typeMap = {
    // Mouse events
    mouseenter: 'mouseenter',
    mousedown: 'mousedown',
    mousemove: 'mousemove',
    mouseup: 'mouseup',
    mouseout: 'mouseout',
    mouseleave: 'mouseout',
    click: 'click',
    dblclick: 'dblclick',
    contextmenu: 'contextmenu',

    // Touch events
    touchstart: 'mousedown',
    touchmove: 'mousemove',
    touchend: 'mouseup',
    touchcancel: 'touchcancel',

    // Pointer events
    pointerenter: 'mouseenter',
    pointerdown: 'mousedown',
    pointermove: 'mousemove',
    pointerup: 'mouseup',
    pointerleave: 'mouseout',
    pointerout: 'mouseout',

    // Key events
    keydown: 'keydown',
    keypress: 'keypress',
    keyup: 'keyup',

    // WeiXin Special
    bindlongtap: 'longtap',
    longtap: 'longtap',
    longpress: 'longpress'
};

/**
 * WxEvent
 */
export class WxEvent {
    constructor(event, x, y, canvas) {
        this.x = x;
        this.y = y;
        this.type = typeMap[event.type];
        this.canvas = canvas;
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }
}
/**
 * An event wrapper of WxChart
 */
export default class WxEventFactory {
    /**
     * Create an WxChart's event
     * @param {WxChart} wxChart - WxChart object
     */
    constructor(wxChart) {
        let me = this;
        me.wxChart = wxChart;
        me.isWX = checkWX();
    }

    /**
     * Event Factory
     * @param {WxEvent|null} event - The event object
     */
    eventReceiver(event) {
        let x, y;
        let me = this,
            canvas = me.wxChart.canvas;
        if (event instanceof WxEvent) {
            return WxEvent;
        }

        if ( __GLOBAL__DEBUG__WX__ === true ) {
            ({x, y} = WxTouch.getRelativeCanvasPos(event, me.wxChart.canvas.canvasInstance.canvas))
        } else if (!me.isWX) {
            ({x, y} = WxTouch.getRelativeCanvasPos(event, me.wxChart.canvas.canvasInstance))
        } else {
            ({x, y} = WxTouch.wxGetRelativeCanvasPos(event))
        }

        if (!x || !y) {
            return null;
        }
        return new WxEvent(event, x, y, canvas);
    }

}
