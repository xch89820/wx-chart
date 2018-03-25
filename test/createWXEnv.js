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

function compareVersion(v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    let len = Math.max(v1.length, v2.length);

    while (v1.length < len) {
        v1.push('0');
    }
    while (v2.length < len) {
        v2.push('0');
    }

    for (let i = 0; i < len; i++) {
        let num1 = parseInt(v1[i]);
        let num2 = parseInt(v2[i]);

        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }
    return 0
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
        'SDKVersion': '1.9.90'
    });

    wx.createCanvasContext = (id) => {
        let el = document.getElementById(id);
        if (el) {
            return el.getContext('2d');
        }
    };

    let UseMap = {
        fillStyle: '1.9.90',
        strokeStyle: '1.9.90',
        setTextBaseline: '1.4.0',
        textBaseline: '1.9.90',
        setTextAlign: '1.1.0',
        textAlign: '1.9.90',
        font: '1.9.90',
        setTransform: '1.9.90',
        transform: false,
        canvasGetImageData: '1.9.0',
        canvasPutImageData: '1.9.0',
        setLineDash: '1.6.0',
        lineWidth: '1.9.90',
        lineCap: '1.9.90',
        lineJoin: '1.9.90',
        miterLimit: '1.9.90',
        clip: '1.6.0',
        globalAlpha: '1.9.90',
        measureText: '1.9.90',
        globalCompositeOperation: '1.9.90',
        arcTo: '1.9.90',
        strokeText: '1.9.90',
        lineDashOffset: '1.9.90',
        createPattern: '1.9.90'
    };


    wx.canIUse = (canvasName) => {
        let ver = getVersion();
        let name = canvasName.match(/canvasContext\.(\w+)/);
        if (!name) {
            return true;
        }
        let lowerVersion = UseMap[name[1]];
        if (lowerVersion) {
            if (lowerVersion === true) {
                return true;
            } else if (is.String(lowerVersion)) {
                return compareVersion(ver, lowerVersion) >= 0;
            } else {
                return false;
            }
        }
        return true;
    };


    let _proxyFunc = function(propName, f) {
        return function(...args) {
            if (wx.canIUse('canvasContext.' + propName)) {
                return f.apply(this, args);
            } else {
                throw new TypeError(`${propName} is not a function`);
            }
        }
    };
    let _proxyObject = function(propName, opDef) {
        return {
            get: function() {
                if (wx.canIUse('canvasContext.' + propName)) {
                    return opDef.get.call(this);
                }
            },
            set: function(value) {
                if (wx.canIUse('canvasContext.' + propName)) {
                    return opDef.set.call(this, value);
                }
                // Do nothing...
            }
        }

    };
    // Simulate the weixin enviroment
    let _wapperPrototype = function(objectProp, prop,
                                    propDesc = Object.getOwnPropertyDescriptor(objectProp, prop)) {
        if (!propDesc || !propDesc.configurable) {
            return;
        }

        let orgPropDesc = extend(true, {}, propDesc);

        let propDescNew = {
            configurable: propDesc.configurable,
            enumerable: propDesc.enumerable
        };
        if (is.Function(propDesc.value)) {
            propDescNew.writable = propDesc.writable;
            propDescNew.value = _proxyFunc(prop, propDesc.value);
        } else {
            propDescNew = extend(propDescNew, _proxyObject(prop, propDesc));
        }
        Object.defineProperty(objectProp, prop, propDescNew);
        return orgPropDesc;
    };

    // Set some function to CanvasRenderingContext2D
    if (typeof CanvasRenderingContext2D != 'undefined' && !CanvasRenderingContext2D.prototype.__wx_proxyOriginal) {
        let CRC2DPrototype = CanvasRenderingContext2D.prototype;
        // Compatibilty prototype and function
        let proxyOriginal = {};
        for (let k in UseMap) {
            proxyOriginal[k] = _wapperPrototype(CRC2DPrototype, k);
        }

        // Old 'SET' function
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
            CanvasRenderingContext2D.prototype[fnName] = function(value) {
                proxyOriginal[v].set.call(this, value);
            }
        });

        // Special function
        CanvasRenderingContext2D.prototype.setShadow = function(offsetX, offsetY, blur, color){
            this.shadowOffsetX = offsetX;
            this.shadowOffsetY = offsetY;
            this.shadowBlur = blur;
            this.shadowColor = color;
        };

        CanvasRenderingContext2D.prototype.setFontSize = function(value) {
            if (is.Number(value)) {
                proxyOriginal['font'].set.call(this, "normal " + value + "px proxima-nova, 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif");
            }
        };

        CanvasRenderingContext2D.prototype.draw = function() {
          //do nothing;
        };

        CanvasRenderingContext2D.prototype.__wx_proxyOriginal = proxyOriginal;
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
    let realContextProxy = realContext;
    // Reflect simulate property 'get' and 'set' function to original CanvasRenderingContext2D.prototype
    if (CanvasRenderingContext2D.prototype.__wx_proxyOriginal) {
        let pxorg = CanvasRenderingContext2D.prototype.__wx_proxyOriginal;
        realContextProxy = new Proxy(realContext, {
            get: function(target, name) {
                if (!name in target) {
                    return undefined;
                }
                if (name in pxorg) {
                    let desc = pxorg[name];
                    if (is.Function(desc.value)) {
                        return desc.value.bind(realContext);
                    }
                    return desc.get.call(realContext);
                }
                let prop = Reflect.get(target, name);
                if (is.Function(prop)) {
                    return prop.bind(realContext);
                }
                return prop;
            },
            set: function(target, name, value) {
                if (name in pxorg) {
                    let desc = pxorg[name];
                    desc.set.call(realContext, value);
                } else {
                    Reflect.set(target, name, value);
                }
                return true;
            }
        });
    }

    return {realCanvas, realContext: realContextProxy};
};

export let getVersion = () => {
    let info = wx.getSystemInfoSync();
    return info.SDKVersion;
};
export let getVersionAsArray = () => {
    let info = wx.getSystemInfoSync();
    let SDKVersion = info.SDKVersion;
    let vs = SDKVersion.match(/(\d+)\.(\d+)\.(\d+)/);

    return vs ? [+vs[1], +vs[2], +vs[3]]: [1, 0 ,0];
};
