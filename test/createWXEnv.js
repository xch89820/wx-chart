/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import { is, extend, getDPR } from '../src/util/helper'
import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'

document.body.insertAdjacentHTML(
    'afterbegin',
    '<link rel="stylesheet" href="/base/test/style.css" />'
);

// Create WeiXin virtual environment
export function createWXEnv() {
    if (typeof wx != 'undefined') {
        return;
    } else {
        window.wx = {};
    }
    // Defined global wx
    let wx = window.wx || {};

    // getSystemInfoSync
    wx.getSystemInfoSync = () => ({
        'model': 'iPhone 6',
        'pixelRatio': 2,
        'windowWidth': 375,
        'windowHeight': 571,
        'language': 'zh_CN',
        'version': '6.3.9',
        'system': 'iOS 10.0.1',
        'platform': 'Android'
    });

    wx.createCanvasContext = (id) => {
        let el = document.getElementById(id);
        if (el) {
            let context = el.getContext('2d');
            return context;
        }
    };

    // Set some function to CanvasRenderingContext2D
    if (typeof  CanvasRenderingContext2D != 'undefined') {
        ['fillStyle', 'lineCap', 'lineJoin', 'miterLimit', 'lineWidth', 'strokeStyle', 'globalAlpha'].forEach((v) => {
            let fnName = 'set' + v.replace(/(\w)/, v => v.toUpperCase());
            CanvasRenderingContext2D.prototype[fnName] = function(val) {
                this[v] = val;
            };
        });

        CanvasRenderingContext2D.prototype.setShadow = function(offsetX, offsetY, blur, color){
            this.shadowOffsetX = offsetX;
            this.shadowOffsetY = offsetY;
            this.shadowBlur = blur;
            this.shadowColor = color;
        };

        CanvasRenderingContext2D.prototype.setFontSize = function(value) {
            if (is.Number(value)) {
                this.font = "normal " + value + "px proxima-nova, 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
            }
        };

        CanvasRenderingContext2D.prototype.draw = function() {
          //do nothing;
        };

        // Disable some attribute
        Object.defineProperty(CanvasRenderingContext2D.prototype, 'textAlign', {
            get: function() { return 'start'; },
            set: function(newValue) { return 'start' },
        });
        Object.defineProperty(CanvasRenderingContext2D.prototype, 'textBaseline', {
            get: function() { return 'alphabetic'; },
            set: function(newValue) { return 'alphabetic' },
        });
    }
}

export let initCanvasElement = function(height = 500, width = 800) {
    let canvasHTML = `<canvas id="myCanvas" canvas-id="myCanvas" width="${width}px" height="${height}px" style="width:${width}px; height:${height}px; border: 1px solid #ffffff;"/>`;
    document.body.insertAdjacentHTML(
        'afterbegin',
        canvasHTML
    );

    let canvas = document.getElementById('myCanvas');
    let ctx = canvas.getContext('2d');
    let pixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio === 1) {
        return;
    }

    canvas.height = height*pixelRatio;
    canvas.width = width*pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
    canvas.style.height = height + 'px';
    canvas.style.width = width + 'px';
};

export let destoryCanvasElement = function() {
    let canvas = document.getElementById('myCanvas');
    canvas.parentNode.removeChild(canvas);
};

export let getCanvas = function(id = 'myCanvas', config = {
    width: '800px',
    height: '500px'
}) {
    let wxCanvas = new WxCanvas(id, config);
    let wxCanvasContext = wxCanvas.getContext('2d');
    return {wxCanvas, wxCanvasContext};
};

export let getRealCanvas = function(id = 'myCanvas') {
    let realCanvas = document.getElementById('myCanvas');
    let realContext = realCanvas.getContext('2d');
    return {realCanvas, realContext};
};
