/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxAnimation from '../src/core/animation';
import WxCanvas, {WxCanvasRenderingContext2D} from '../src/util/wxCanvas'
import {createWXEnv, initCanvasElement, destoryCanvasElement, getCanvas, getRealCanvas} from './createWXEnv'
let Bezier = require('bezier-js');

describe('Test wxAnimation', () => {
    beforeEach(() => {
        createWXEnv();
        initCanvasElement();
    });

    it('Draw A line easeInOut', () => {
        let color = "#DBA9FF", lineCap = 'round';
        let { wxCanvas, wxCanvasContext } = getCanvas();
        let { realCanvas, realContext } = getRealCanvas();

        wxCanvasContext.strokeStyle = color;
        wxCanvasContext.lineCap = lineCap;
        wxCanvasContext.save();

        // Draw 10,10 -> 40,50
        let x1 = 10, x2 = 100,
            y1 = 10, y2 = 100;
        wxCanvasContext.beginPath();
        wxCanvasContext.moveTo(x1,y1);

        let totalPath = Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2)),
            cosAngle = (x2 - x1) / totalPath,
            sinAngle = (y2 - y1) / totalPath;
        let wxAnimation = new WxAnimation({start:0,end: totalPath});
        wxAnimation.pushActions((t) => {
            let xt = cosAngle * t,
                yt = sinAngle * t;
            let pointX = x1 + xt,
                pointY = y1 + yt;
            wxCanvasContext.lineTo(pointX, pointY);
            wxCanvasContext.stroke();
        });
        wxAnimation.run();
        wxCanvasContext.restore();
    });

    it('Move a rect', () => {
        let color = "#6c4fff",
            fill = '#8fa7ff';
        let { wxCanvas, wxCanvasContext } = getCanvas();
        let { realCanvas, realContext } = getRealCanvas();

        wxCanvasContext.strokeStyle = color;
        wxCanvasContext.fillStyle = fill;
        wxCanvasContext.lineWidth = 1;
        wxCanvasContext.save();

        let x1 = 10, y1 = 10;
        let width = 200, height = 300;
        let wxAnimation = new WxAnimation({start:10,end: 200, easeType: 'easeOutBounce'});
        wxAnimation.pushActions((t, lt) => {
            if (lt){
                wxCanvasContext.clearRect(x1 + lt - 0.5,y1 - 0.5,width + 1,height + 1);
            }
            wxCanvasContext.strokeRect(x1+t,y1,width,height);
            wxCanvasContext.fillRect(x1+t,y1,width,height);
            return t;
        });
        wxAnimation.run();

        wxCanvasContext.restore();
    });

    it('Draw Bezier curve', () => {
        let points = [
            {x:80.625, y:350},
            {x:141.3375, y:294},
            {x:162.6301, y:238.0425},
            {x:232.4062, y:210}
        ];

        let color = "#6c4fff";
        let { wxCanvas, wxCanvasContext } = getCanvas();
        let { realCanvas, realContext } = getRealCanvas();

        wxCanvasContext.strokeStyle = color;
        wxCanvasContext.lineWidth = 1;
        wxCanvasContext.save();

        wxCanvasContext.beginPath();
        wxCanvasContext.moveTo(points[0].x,points[0].y);

        let bz = new Bezier(...points);
        let wxAnimation = new WxAnimation({start:1, end: 1000});
        wxAnimation.pushActions((t, lt) => {
            let sbz = bz.split((lt||0)/1000, t/1000);
            let p0 = sbz.point(0),
                p1 = sbz.point(1),
                p2 = sbz.point(2),
                p3 = sbz.point(3);
            wxCanvasContext.moveTo(p0.x, p0.y);
            wxCanvasContext.bezierCurveTo(
                p1.x, p1.y,
                p2.x, p2.y,
                p3.x, p3.y,
            );
            wxCanvasContext.stroke();
            return t;
        });
        wxAnimation.run();
        wxCanvasContext.restore();
    });

    it('Draw arc zoom', () => {
        let fillStyle = "#6c4fff",
            strokeStyle = "#ffffff",
            x = 20,
            y = 20,
            radius = 10;
        let {wxCanvas, wxCanvasContext} = getCanvas();
        let {realCanvas, realContext} = getRealCanvas();

        wxCanvasContext.strokeStyle = strokeStyle;
        wxCanvasContext.fillStyle = fillStyle;
        wxCanvasContext.lineWidth = 3;
        wxCanvasContext.save();


        let wxAnimation = new WxAnimation({start: 1, end: radius, easeType: 'easeOutElastic'});
        wxAnimation.pushActions((t, lt) => {
            wxCanvasContext.beginPath();
            wxCanvasContext.arc(x, y, t, 0, 2 * Math.PI);
            wxCanvasContext.fill();
            wxCanvasContext.stroke();
            return t;
        });
        wxAnimation.run();
        wxCanvasContext.restore();
    });

    afterEach(() => {
        destoryCanvasElement();
    })
});