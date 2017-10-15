/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';
import { is, wxConverToPx, extend } from '../src/util/helper'
import { createWXEnv, initCanvasElement, randomId, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'
import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import { WxTouch } from '../src/util/touch'

describe('WxTouch class test', () => {
    let id, canvas, wxLiner;
    beforeEach(function () {
        this.timeout(4000);
        createWXEnv();
        id = randomId();
        canvas = initCanvasElement(400, 700, id);
    });

    it('Draw an Canvas and get touch event', function() {
        let { realCanvas, realContext } = getRealCanvas(id);
        let canvasRectInfo = WxTouch.calculateRectInfo(realCanvas);

        realCanvas.style.borderWidth = 1;
        realCanvas.style.borderColor = '#000000';

        realContext.lineWidth = 1;
        realContext.stokeStyle = '#000000';
        realContext.fillStyle = '#000000';
        realContext.textAlign = 'start';
        realContext.textBaseline = 'top';
        realContext.rect(0, 0, 80, 20);
        realCanvas.addEventListener('mousemove', function(e) {
            realContext.clearRect(0, 0, 82, 22);
            let {x, y} = WxTouch.getRelativeCanvasPos(e, realCanvas, canvasRectInfo);

            realContext.stroke();
            realContext.fillText(`${x}, ${y}`, 0, 0)
        });
    });

    afterEach(() => {
        destoryCanvasElement(id);
    })
});