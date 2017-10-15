/* global module, wx, window: false, document: false */
'use strict';

import { is, checkWX, readUsedSize, extend, getStyle, wxConverToPx } from './helper';
import WxCanvas from './wxCanvas'

export class WxTouch {
    static calculateRectInfo(canvas) {
        if (typeof HTMLCanvasElement != 'undefined' && canvas instanceof HTMLCanvasElement) {
            let boundingRect = canvas.getBoundingClientRect();
            // Get padding
            let paddingLeft = parseFloat(getStyle(canvas, 'padding-left'));
            let paddingTop = parseFloat(getStyle(canvas, 'padding-top'));
            let paddingRight = parseFloat(getStyle(canvas, 'padding-right'));
            let paddingBottom = parseFloat(getStyle(canvas, 'padding-bottom'));
            // Get border
            let borderLeft = parseFloat(getStyle(canvas, 'border-left'));
            let borderTop = parseFloat(getStyle(canvas, 'border-top'));
            let borderRight = parseFloat(getStyle(canvas, 'border-right'));
            let borderBottom = parseFloat(getStyle(canvas, 'border-bottom'));

            let pbLeft = paddingLeft + borderLeft,
                pbRight = paddingRight + borderRight,
                pbTop = paddingTop + borderTop,
                pbBottom = paddingBottom + borderBottom;
            let width = boundingRect.right - boundingRect.left - pbLeft - pbRight;
            let height = boundingRect.bottom - boundingRect.top - pbTop - pbBottom;

            let scaleX = (canvas.width / width) || 1;
            let scaleY = (canvas.height / height) || 1;
            return {
                left: boundingRect.left + pbLeft,
                right: boundingRect.right + pbRight,
                top : boundingRect.top + pbTop,
                bottom: boundingRect.bottom + pbBottom,
                width,
                height,
                scaleX,
                scaleY
            }
        }
        return null;
    }
    static getRelativeCanvasPos(evt, canvas, rectInfo) {
        if (!rectInfo) {
            rectInfo = WxTouch.calculateRectInfo(canvas);
        }

        let { left, top, scaleX, scaleY, width, height } = rectInfo;

        let mouseX, mouseY;
        let e = evt.originalEvent || evt;
        let touches = e.touches;
        if (touches && touches.length > 0) {
            mouseX = touches[0].clientX;
            mouseY = touches[0].clientY;
        } else {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }

        mouseX = Math.round((mouseX - left) / (width) * canvas.width / scaleX);
        mouseY = Math.round((mouseY - top) / (height) * canvas.height / scaleY);

        return {
            x: mouseX,
            y: mouseY
        }
    }
    static wxGetRelativeCanvasPos(evt) {
        let mouseX, mouseY;
        let touches = evt.touches;
        if (touches && touches.length > 0) {
            mouseX = touches[0].x;
            mouseY = touches[0].y;
        }

        return {
            x: mouseX,
            y: mouseY
        }
    }
}