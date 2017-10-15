/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import { is, extend, getDPR } from '../src/util/helper'
import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'

document.body.insertAdjacentHTML(
    'afterbegin',
    '<link rel="stylesheet" href="/base/test/style.css" />'
);

export function randomId(len = 32) {
    let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    let maxPos = $chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}
// Create WeiXin virtual environment
export function createWXEnv() {
    if ( __GLOBAL__DEBUG__WX__ === false) {
        return;
    }
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
        'platform': 'Android',
        'SDKVersion': '1.4.0'
    });

    wx.createCanvasContext = (id) => {
        let el = document.getElementById(id);
        if (el) {
            return el.getContext('2d');
        }
    };

    wx.canIUse = (name) => {
        let ver = getVersionAsArray();
        switch(name) {
            case 'canvasContext.setTextBaseline':
                return (ver[0] === 1 && ver[1] >= 4);
            case 'canvasContext.setTextAlign':
                return (ver[0] === 1 && ver[1] >= 1);
        }
        return true;
    };

    let ver = getVersionAsArray();
    // Set some function to CanvasRenderingContext2D
    if (typeof CanvasRenderingContext2D != 'undefined') {
        [
            'fillStyle',
            'lineCap',
            'lineJoin',
            'miterLimit',
            'lineWidth',
            'strokeStyle',
            'globalAlpha',
            'textAlign',
            'textBaseline'
        ].forEach((v) => {
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
        if (ver[0] === 1 && ver[1] < 1) {
            Object.defineProperty(CanvasRenderingContext2D.prototype, 'textAlign', {
                get: function() { return 'start'; },
                set: function(newValue) { return 'start' },
            });
        }
        if (ver[0] === 1 && ver[1] < 4) {
            Object.defineProperty(CanvasRenderingContext2D.prototype, 'textBaseline', {
                get: function () {
                    return 'alphabetic';
                },
                set: function (newValue) {
                    return 'alphabetic'
                },
            });
        }
    }
}

export let initCanvasElement = function(height = 500, width = 800, id='myCanvas') {
    let canvasHTML = `<canvas id="${id}" canvas-id="${id}" width="${width}px" height="${height}px" style="width:${width}px; height:${height}px; border: 1px solid #ffffff;"/>`;
    document.body.insertAdjacentHTML(
        'afterbegin',
        canvasHTML
    );

    let canvas = document.getElementById(id);
    let ctx = canvas.getContext('2d');
    let pixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio === 1) {
        return;
    }

    if ( __GLOBAL__DEBUG__WX__ === true ) {
        // In WX, can not resize the canvas
        canvas.height = height*pixelRatio;
        canvas.width = width*pixelRatio;
        ctx.scale(pixelRatio, pixelRatio);
        canvas.style.height = height + 'px';
        canvas.style.width = width + 'px';
    }

    return canvas;
};

export let destoryCanvasElement = function(id = 'myCanvas') {
    let canvas = document.getElementById(id);
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
    let realCanvas = document.getElementById(id);
    let realContext = realCanvas.getContext('2d');
    return {realCanvas, realContext};
};

export let getVersionAsArray = () => {
    let info = wx.getSystemInfoSync();
    let SDKVersion = info.SDKVersion;
    let vs = SDKVersion.match(/(\d+)\.(\d+)\.(\d+)/);

    return vs ? [+vs[1], +vs[2], +vs[3]]: [1, 0 ,0];
};
