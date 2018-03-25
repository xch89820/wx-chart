/* global module, wx, window: false, document: false */
'use strict';

import {is, checkWX, readUsedSize, extend, wxConverToPx} from './helper';
import {REG_HANZI, REG_ALPHABET_NUMBER} from './helper';

// Chart default config
const WX_CANVAS_DEFAULT_PROPERTY = {
    width: 300,
    height: 200
};
const WX_CANVAS_CTX_DEFAULT_PROPERTY = {
    fillStyle: '#000000',
    lineCap: 'butt',
    lineJoin: 'miter',
    lineDashOffset: 0.0,
    miterLimit: 10,
    lineWidth: 1,
    strokeStyle: '#000000',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: '#000000',
    font: '10px',
    textBaseline: 'alphabetic', // only support top, middle and alphabetic
    textAlign: 'left'
};

// Base text size
const WX_BASE_TEXT_SIZE = 9;

const pxReg = /([\d.]+)px/;

function wxCompareVersion(v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    let len = Math.max(v1.length, v2.length);

    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
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
/**
 * Compatible canvas object
 */
export default class WxCanvas {
    constructor(id, config, contextOptions) {
        let me = this;

        me.isWeiXinAPP = checkWX();
        me._config = extend({}, WX_CANVAS_DEFAULT_PROPERTY, me.initConfig(config));

        // Acquire canvas context
        let {domID, canvas, context} = this.acquireContext(id, config);
        me.domID = id;

        me._canvas = canvas;
        me._ctx = context;
        me.wxCanvasRenderingContext2D = new WxCanvasRenderingContext2D(canvas, context, contextOptions);

        return me;
    }

    get config() {
        return this._config;
    }

    get contextInstance() {
        return this._ctx;
    }

    get canvasInstance() {
        return this._canvas;
    }

    /**
     * Initialization WxCanvas config
     * @param {Object} config
     * @returns {boolean}
     */
    initConfig(config) {
        if (!config) {
            return;
        }

        if (typeof config.width != 'undefined') {
            config.width = wxConverToPx(config.width);
        }
        if (typeof config.height != 'undefined') {
            config.height = wxConverToPx(config.height);
        }
        return config;
    }

    /**
     * Create Canvas context
     * @param {String} id
     * @param {Object} config
     * @returns {*}
     */
    acquireContext(id, config) {
        let me = this,
            domID,
            canvas,
            context;
        // Outer canvas config
        let handlerCanvas = config.canvas;

        if (me.isWeiXinAPP) {
            if (is.String(id)) {
                canvas = context = wx.createCanvasContext(id);
                domID = id;
            } else {
                throw new Error('Should set an id');
            }
        } else {
            if (handlerCanvas) {
                canvas = handlerCanvas;
            } else {
                if (is.String(id)) {
                    canvas = document.getElementById(id);
                    domID = id;
                } else if (typeof HTMLCanvasElement != 'undefined' && id instanceof HTMLCanvasElement) {
                    canvas = id;
                    domID = id.id;
                }
            }
            if (typeof canvas != 'undefined') {
                context = canvas.getContext && canvas.getContext('2d');
            }
        }

        if (!canvas || !context) {
            console.error("Failed to create WxCanvas: can't acquire context!");
        }

        this.initCanvas(canvas);
        return {domID, canvas, context};
    }

    /**
     * Initializes the HTMLCanvasElement style and render size without modifying the canvas display size
     */
    initCanvas(canvas) {
        let config = this._config,
            renderHeight,
            renderWidth,
            display,
            height,
            width;
        height = config.height;
        width = config.width;

        if (this.isWeiXinAPP) {
            renderHeight = height;
            renderWidth = width;
            display = config.display;
        } else {
            let style = canvas.style;

            // NOTE(SB) canvas.getAttribute('width') !== canvas.width: in the first case it
            // returns null or '' if no explicit value has been set to the canvas attribute.
            renderHeight = canvas.getAttribute('height');
            renderWidth = canvas.getAttribute('width');

            // Force canvas to display as block to avoid extra space caused by inline
            // elements, which would interfere with the responsive resize process.
            // https://github.com/chartjs/Chart.js/issues/2538
            style.display = style.display || 'block';

            if (renderWidth === null || renderWidth === '') {
                var displayWidth = width || readUsedSize(canvas, 'width');
                if (displayWidth !== undefined) {
                    canvas.width = displayWidth;
                    width = displayWidth;
                }
            }

            if (renderHeight === null || renderHeight === '') {
                if (!height && canvas.style.height === '') {
                    // If no explicit render height and style height, let's apply the aspect ratio,
                    // which one can be specified by the user but also by charts as default option
                    // (i.e. options.aspectRatio). If not specified, use canvas aspect ratio of 2.
                    canvas.height = height = canvas.width / (config.aspectRatio || 2);
                } else {
                    let displayHeight = height || readUsedSize(canvas, 'height');
                    if (displayWidth !== undefined) {
                        canvas.height = displayHeight;
                        height = displayHeight;
                    }
                }
            }
        }

        // Chart.js modifies some canvas values that we want to restore on destroy
        config._wxChart = {
            initial: {
                height: renderHeight,
                width: renderWidth,
                style: {
                    display: display,
                    height: height,
                    width: width
                }
            }
        };

        return canvas;
    }

    /**
     * Restores the canvas initial state, such as render/display sizes and style.
     */
    releaseContext() {
        let canvas = this._canvas,
            config = this._config;
        if (!config._wxChart) {
            return;
        }

        let initial = config._wxChart.initial;
        if (this.isWeiXinAPP) {
            // Do nothing
        } else {
            ['height', 'width'].forEach(function(prop) {
                let value = initial[prop];
                if (value === undefined || value === null) {
                    canvas.removeAttribute(prop);
                } else {
                    canvas.setAttribute(prop, value);
                }
            });

            let style = initial.style;
            for (let key of Object.keys(style)) {
                canvas.style[key] = style[key];
            }

            // The canvas render size might have been changed (and thus the state stack discarded),
            // we can't use save() and restore() to restore the initial state. So make sure that at
            // least the canvas context is reset to the default state by setting the canvas width.
            // https://www.w3.org/TR/2011/WD-html5-20110525/the-canvas-element.html
            canvas.width = canvas.width;
        }

        delete config._wxChart;
    }

    getContext(str) {
        if (str === '2d') {
            return this.wxCanvasRenderingContext2D;
        }
    }

    // Property
    /**
     * Canvas DOM height
     */
    get renderHeight() {
        if (this.isWeiXinAPP) {
            return this.height;
        } else {
            let renderHeight = wxConverToPx(this.canvasInstance.getAttribute('height'));
            if (renderHeight === null || renderHeight === '') {
                return readUsedSize(canvas, 'height');
            }
            return renderHeight;
        }
    }

    set renderHeight(val) {
        if (this.isWeiXinAPP) {
            // Can not set WeiXin app height
        } else {
            this.canvasInstance.height = val;
        }
    }

    /**
     * Canvas height
     */
    get height() {
        return this.config.height;
    }

    /**
     * Canvas DOM width
     */
    get renderWidth() {
        if (this.isWeiXinAPP) {
            return this.width;
        } else {
            let renderWidth = wxConverToPx(this.canvasInstance.getAttribute('width'));
            if (renderWidth === null || renderWidth === '') {
                return readUsedSize(canvas, 'width');
            }
            return renderWidth;
        }
    }

    set renderWidth(val) {
        if (this.isWeiXinAPP) {
            // Can not set WeiXin app height
        } else {
            this.canvasInstance.width = val;
        }
    }

    /**
     * Canvas height
     */
    get width() {
        return this.config.width;
    }
}
export class WxCanvasRenderingContext2D {
    constructor(canvas, context, options) {
        let me = this;

        me.canvas = canvas;
        me._ctx = context;
        me.isWeiXinAPP = checkWX();
        if (me.isWeiXinAPP) {
            me.systemInfo = wx.getSystemInfoSync();
        }

        // Canvas property cache stack
        me._ctxOptions = options;
        me._propertyCache = [extend({}, WX_CANVAS_CTX_DEFAULT_PROPERTY, options)];
        me.cp = me._propertyCache[0];

        // Inject property
        me.createStyleProperty();
        me.createShadowsProperty();
        me.createTextProperty();
        me.createLineProperty();
        me.createRectProperty();
        me.createGradientProperty();
        me.createPathProperty();
        me.createTransformationProperty();
        me.createGlobalAlphaProperty();
        me.createFileImageProperty();
        me.createGlobalCompositeOperation();
        return me;
    }

    // Save function
    save() {
        let me = this;
        me._ctx.save();
        // 2018.1 Fix bug - 'save' function will inherit 'Drawing state'(#see:https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/save)
        let nProperty = extend({}, WX_CANVAS_CTX_DEFAULT_PROPERTY, me.cp, me._ctxOptions);
        me._propertyCache.push(nProperty);
        me.cp = nProperty;
        return me.cp;
    }

    // Restore function
    restore() {
        let me = this;
        me._ctx.restore();
        if (me.cp != null && me._propertyCache.length > 1) {
            me._propertyCache.pop();
            me.cp = me._propertyCache[me._propertyCache.length - 1];
        }
        return me.cp;
    }

    // Property
    _wxSetPropertyCallable(value,
                           propertyName,
                           wxSetProperty = 'set' + propertyName.replace(/(\w)/, v => v.toUpperCase()),
                           wxSetValue = value
    ) {
        let me = this;

        if (is.Null(value) || is.Undefined(value)) {
            return value;
        }

        //performance
        if (me.cp[propertyName] === value) {
            return value;
        }

        if (me.isWeiXinAPP) {
            me._ctx[wxSetProperty](wxSetValue);
        } else {
            me._ctx[propertyName] = value;
        }
        me.cp[propertyName] = value;

        return value;
    }

    // Normally property weixin app not support
    _wxSetProperty(value, propertyName, setWxCTX = false) {
        let me = this;

        if (is.Null(value) || is.Undefined(value)) {
            return value;
        }

        //performance
        if (me.cp[propertyName] === value) {
            return value;
        }

        if (me.isWeiXinAPP) {
            if (setWxCTX) me._ctx[propertyName] = value;
        } else {
            me._ctx[propertyName] = value;
        }
        me.cp[propertyName] = value;

        return value;
    }

    _wxCompatibiltyProperty(value, propertyName, setWxCTX = true, wxSetValue = value) {
        let me = this;

        if (is.Null(value) || is.Undefined(value)) {
            return value;
        }

        //performance
        if (me.cp[propertyName] === value) {
            return value;
        }

        if (me.isWeiXinAPP) {
            let pName = 'canvasContext.' + propertyName;
            if (wx.canIUse(pName)) {
                me._ctx[propertyName] = wxSetValue;
            } else {
                if (setWxCTX) {
                    me._ctx[propertyName] = wxSetValue;
                }
                throw new Error(`WeiXin APP not support "${propertyName}" property!`);
            }
        } else {
            me._ctx[propertyName] = value;
        }
        me.cp[propertyName] = value;

        return value;
    }

    // Test wx env
    _wxCompatibiltySetProperty(value,
                               propertyName,
                               wxSetProperty = 'set' + propertyName.replace(/(\w)/, v => v.toUpperCase()),
                               wxSetValue = value
    ) {
        if (this.isWeiXinAPP) {
            let pName = 'canvasContext.' + wxSetProperty;
            if (wx.canIUse(pName)) {
                return this._wxSetPropertyCallable(value, propertyName, wxSetProperty, wxSetValue)
            }
        }
        return this._wxSetProperty(value, propertyName, true);
    }

    _wxCallableMaker(fnName, wxFnName = fnName) {
        let me = this;
        return function(...args) {
            if (me.isWeiXinAPP) {
                return me._ctx[wxFnName](...args);
            } else {
                return me._ctx[fnName](...args);
            }
        }
    }

    _wxCompatibiltyCallableMaker(fnName, wxFnName = fnName) {
        let me = this;
        return function(...args) {
            if (me.isWeiXinAPP) {
                if (wx.canIUse('canvasContext.' + fnName)) {
                    return me._ctx[wxFnName](...args);
                } else {
                    throw new Error(`WeiXinAPP not support "${fnName}(${wxFnName})" function!`);
                }
            } else {
                return me._ctx[fnName](...args);
            }
        }
    }

    createStyleProperty() {
        let me = this;

        let styleProperty = ['fillStyle', 'strokeStyle'];
        styleProperty.forEach(p => {
            Object.defineProperty(me, p, {
                get: () => {
                    return me.cp[p];
                },
                set: (value) => {
                    try {
                        return me._wxCompatibiltyProperty(value, p)
                    } catch (e) {
                        return me._wxSetPropertyCallable(value, p)
                    }
                }
            })
        });

    }
    createShadowsProperty() {
        let me = this;
        // Shadow property
        ['shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'shadowColor'].forEach(p => {
            Object.defineProperty(me, p, {
                get: () => {
                    return me.cp[p];
                },
                set: (value) => {
                    let me = this;

                    if (is.Null(value) || is.Undefined(value)) {
                        return value;
                    }
                    // performance
                    if (me.cp[p] === value) {
                        return;
                    }

                    if (me.isWeiXinAPP) {
                        me._ctx.setShadow(me.cp['shadowOffsetX'] || 0, me.cp['shadowOffsetY'] || 0, me.cp['shadowBlur'] || 0, me.cp['shadowColor'] || '#000000');
                    } else {
                        me._ctx[p] = value;
                    }
                    me.cp[p] = value;

                    return value;
                }
            })
        });
    }

    // Text property
    createTextProperty() {
        let me = this;

        let taProperty = 'textAlign';
        Object.defineProperty(me, taProperty, {
            get: () => {
                return me.cp[taProperty];
            },
            set: (value) => {
                // WeiXin setTextAlign just support 'left' 'center' and 'right'
                let wxVal = value;
                if (value === 'start' || value === 'end') {
                    wxVal = value === 'start' ? 'left' : 'right';
                }
                try {
                    return me._wxCompatibiltyProperty(value, taProperty, undefined, wxVal)
                } catch (e) {
                    return me._wxCompatibiltySetProperty(value, taProperty, undefined, wxVal);
                }
            }
        });

        let tblProperty = 'textBaseline';
        Object.defineProperty(me, tblProperty, {
            get: () => {
                return me.cp[tblProperty];
            },
            set: (value) => {
                let wxVal = value;
                if (value === 'hanging') {
                    return me._wxSetProperty(value, tblProperty);
                }
                if (value === 'alphabetic') {
                    wxVal = 'normal';
                }
                try {
                    return me._wxCompatibiltyProperty(value, tblProperty, undefined, wxVal)
                } catch (e) {
                    return me._wxCompatibiltySetProperty(value, tblProperty, undefined, wxVal);
                }
            }
        });

        Object.defineProperty(me, 'font', {
            get: () => {
                return me.cp.font;
            },
            set: (value) => {
                if (me.isWeiXinAPP) {
                    if (wx.canIUse('canvasContext.font') && me.cp.font !== value) {
                        me._ctx.font = value;
                        me.cp.font = value;
                    } else {
                        let m = value.match(pxReg);
                        if (!!m && me.cp.font !== value) {
                            let fontSize = +m[1];
                            me._ctx.setFontSize(fontSize);
                            me.cp.font = value;
                        }
                    }

                } else if (me.cp.font !== value) {
                    me._ctx.font = value;
                    me.cp.font = value;
                }
                return me.cp.font;
            }
        });

        Object.defineProperty(me, 'fontSize', {
            get: () => {
                return parseInt(me.cp.font);
            },
            set: (value) => {
                let fontSize = parseInt(value);
                if (is.NaN(fontSize)) {
                    return;
                }

                let currentFont = me.isWeiXinAPP
                    ? me.cp.font
                    : me._ctx.font;
                currentFont = currentFont.replace(pxReg, fontSize + 'px');
                if (currentFont === me.cp.font) {
                    return me.cp.font;
                }
                if (me.isWeiXinAPP) {
                    me._ctx.setFontSize(fontSize);
                } else {
                    me._ctx.font = currentFont;
                }
                me.cp.font = currentFont;

                return me.cp.font;
            }
        });
    }

    measureTextByFontSize(text, fontSize) {
        let me = this;
        if (!fontSize) {
            return this.measureText(text);
        } else {
            me.save();
            me.fontSize = fontSize;
            let mt = this.measureText(text);
            me.restore();
            return mt;
        }
    }

    _measureTextWidth(text, fontSize = this.fontSize) {
        let textLen = text.length;
        let hanzi = text.match(new RegExp(REG_HANZI, 'g'));
        let hanziNum = !!hanzi
            ? hanzi.length
            : 0;
        let otherNum = textLen - hanziNum;
        return fontSize * (otherNum + hanziNum * 2 + 2) / 2 + fontSize / 4;
    }
    // Wrapper 'measureText' function for WeiXin APP
    measureText(text) {
        let me = this;
        if (me.isWeiXinAPP) {
            if (!text) {
                return 0;
            }
            // Compatible
            if (wx.canIUse('canvasContext.measureText')) {
                return me._ctx.measureText(text);
            }

            let fontSize = me.fontSize;
            let size = me._measureTextWidth(text, fontSize);

            return {
                'width': size
            };
        } else {
            return me._ctx.measureText(text);
        }
    }
    _calculateYForTextBaseline(y, text, baseNum = WX_BASE_TEXT_SIZE) {
        let me = this,
            culY = y;

        if (!me.isWeiXinAPP) {
            return culY;
        }

        let fontSize = me.fontSize;
        let textBaseline = me.textBaseline;
        switch (textBaseline) {
            case 'top':
                culY = fontSize * baseNum / 10 + y;
                break;
            case 'middle':
                culY = fontSize * baseNum / 20 + y;
                break;
            case 'alphabetic':
            case 'normal': // Only WeiXin has
                break;
        }
        return culY;
    }
    _calculateXFortextAlign(x, text, baseNum = WX_BASE_TEXT_SIZE) {
        let me = this,
            culX = x;
        if (!me.isWeiXinAPP) {
            return culX;
        }

        let textAlign = me.textAlign;
        switch (textAlign) {
            case 'end':
            case 'right': // ignore RTL-browsers
                culX = x - me.measureText(text).width;
                break;
            case 'center':
                culX = x - me.measureText(text).width / 2;
                break;
            case 'start':
            case 'left': // ignore RTL-browsers
                break;
        }
        return culX;
    }
    /**
     * Overwrite fillText
     * Weixin 0.12 not support 'textBaseline', 'textAlign' attribute, so we should figure out it.
     * @param text
     * @param x
     * @param y
     * @param options - [maxWidth, baseNum = WX_BASE_TEXT_SIZE]
     * @returns {*}
     */
    fillText(text, x, y, ...options) {
        let me = this,
            maxWidth = 0 in options
                ? options[0]
                : undefined,
            baseNum = 1 in options
                ? options[1]
                : WX_BASE_TEXT_SIZE;
        if (me.isWeiXinAPP) {
            let culX = x,
                culY = y;
            if (!wx.canIUse('canvasContext.setTextBaseline') && !wx.canIUse('canvasContext.textBaseline')) {
                culY = me._calculateYForTextBaseline(y, text, baseNum);
            }
            if (!wx.canIUse('canvasContext.setTextAlign') && !wx.canIUse('canvasContext.textAlign')) {
                culX = me._calculateXFortextAlign(x, text, baseNum);
            }
            if (wx.canIUse('canvasContext.measureText') && wx.getSystemInfoSync().system.match(/^iOS/)) {
                // iOS fillText bug
                let res, ta = me.textAlign;
                if (ta === 'start' || ta === 'left') {
                    me.textAlign = 'center';
                    res = me._ctx.fillText(text, (culX + me.measureText(text).width / 2), culY);
                    me.textAlign = ta;
                } else {
                    res = me._ctx.fillText(text, culX, culY);
                }
                return res;
            }
            return me._ctx.fillText(text, culX, culY);
        } else {
            return me._ctx.fillText(text, x, y, maxWidth);
        }
    }
    strokeText(text, x, y, ...options) {
        let me = this;
        if (me.isWeiXinAPP) {
            if (wx.canIUse('canvasContext.strokeText')) {
                return me.strokeText(text, x, y, ...options);
            } else {
                return me.fillText(text, x, y, ...options);
            }
        } else {
            return me._ctx.strokeText(text, x, y, ...options);
        }
    }

    // Line property
    createLineProperty() {
        let me = this;
        let smProperty = ['lineCap', 'lineJoin', 'miterLimit', 'lineWidth'];
        smProperty.forEach(p => {
            Object.defineProperty(me, p, {
                get: () => {
                    return me.cp[p];
                },
                set: (value) => {
                    try {
                        return me._wxCompatibiltyProperty(value, p)
                    } catch (e) {
                        return me._wxSetPropertyCallable(value, p)
                    }
                }
            })
        });

        let lineDashOffset = 'lineDashOffset';
        Object.defineProperty(me, lineDashOffset, {
            get: () => {
                return me.cp[lineDashOffset];
            },
            set: (value) => {
                if (is.Null(value) || is.Undefined(value)) {
                    return value;
                }

                //performance
                if (me.cp[lineDashOffset] === value) {
                    return value;
                }

                me.cp[lineDashOffset] = value;
                if (me.isWeiXinAPP) {
                    if (wx.canIUse('canvasContext.lineDashOffset')) {
                        me._ctx[lineDashOffset] = value;
                    }
                    if (wx.canIUse('canvasContext.setLineDash')) {
                        let lineDash = me.cp['lineDash'];
                        if (!lineDash) {
                            // Just set property and return
                            return value;
                        }
                        return me._ctx.setLineDash(lineDash, value);
                    }
                } else {
                    me._ctx[lineDashOffset] = value;
                }
            }
        });
    }

    setLineDash(value) {
        let me = this;
        if (is.Null(value) || is.Undefined(value)) {
            return value;
        }
        //performance
        if (me.cp['lineDashOffset'] === value) {
            return value;
        }

        me.cp['lineDash'] = value;
        if (me.isWeiXinAPP) {
            let lineDashOffset = me.lineDashOffset;
            return me._ctx['setLineDash'](value, lineDashOffset);
        } else {
            return me._ctx['setLineDash'](value);
        }
    }

    getLineDash() {
        return this.cp['lineDash'] || [];
    }

    // Drawing rectangles
    createRectProperty() {
        let me = this;
        ['clearRect', 'fillRect', 'strokeRect'].forEach(function(functionName) {
            me[functionName] = me._wxCallableMaker(functionName);
        })
    }

    // Gradient
    createGradientProperty() {
        let me = this;
        me.createLinearGradient = me._wxCallableMaker('createLinearGradient');
        me.addColorStop = me._wxCallableMaker('addColorStop');
    }
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
        let me = this;
        if (me.isWeiXinAPP) {
            return me._ctx.createCircularGradient(x0, y0, r0);
        } else {
            return me._ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
        }
    }

    // Paths and Drawing paths
    createPathProperty() {
        let me = this;
        [
            'beginPath',
            'closePath',
            'moveTo',
            'lineTo',
            'bezierCurveTo',
            'quadraticCurveTo',
            'arc',
            'rect'
        ].forEach(function(functionName) {
            me[functionName] = me._wxCallableMaker(functionName);
        });
        me.arcTo = me._wxCompatibiltyCallableMaker('arcTo');

        ['fill', 'stroke'].forEach(function(functionName) {
            me[functionName] = function(...args) {
                return me._ctx[functionName](...args);
            }
        });

        this.clip = me._wxCompatibiltyCallableMaker('clip');
    }

    // Transformations
    createTransformationProperty() {
        let me = this;
        ['rotate', 'scale', 'translate'].forEach(function(functionName) {
            me[functionName] = me._wxCompatibiltyCallableMaker(functionName);
        });
    }
    transform(...args) {
        let me = this;
        try {
            return me._wxCompatibiltyCallableMaker(value, 'setTransform');
        } catch (e) {
            return me._wxCompatibiltyCallableMaker(value, 'transform');
        }
    }

    // globalAlpha
    createGlobalAlphaProperty() {
        let me = this;
        ['globalAlpha'].forEach(p => {
            Object.defineProperty(me, p, {
                get: () => {
                    return me.cp[p];
                },
                set: (value) => {
                    try {
                        me._wxCompatibiltyProperty(value, p);
                    } catch (e) {
                        me._wxSetPropertyCallable(value, p);
                    }
                }
            })
        });
    }
    // Draw function
    draw(ctu = true) {
        if (this.isWeiXinAPP) {
            this._ctx.draw(ctu);
        }
    }

    // Composite operation
    createGlobalCompositeOperation() {
        let me = this;
        ['globalCompositeOperation'].forEach(p => {
            Object.defineProperty(me, p, {
                get: () => {
                    return me.cp[p];
                },
                set: (value) => {
                    return me._wxCompatibiltyProperty(value, p);
                }
            })
        });
    }

    // create file&image function
    // Be careful use 'canvasGetImageData' ,'canvasPutImageData';
    // There are async-function in WeiXin
    drawImage(...args) {
        let me = this;
        if (me.isWeiXinAPP) {
            if (args.length > 4 && wxCompareVersion(me.systemInfo.SDKVersion, '1.9.0') >= 0) {
                // Not support drawImage(sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) until 1.9.0 version
                throw new Error(`WeiXin not support "drawImage(8 args)" function until 1.9.0 version!`);
            } else {
                return me._ctx.drawImage(...args);
            }
        } else {
            return me._ctx.drawImage(...args);
        }
    }
    createFileImageProperty() {
        this.createPattern = this._wxCompatibiltyCallableMaker('createPattern');
    }

    getImageData(x, y, width, height, callback) {
        let me = this;
        if (me.isWeiXinAPP) {
            if (wx.canIUse('wx.canvasGetImageData')) {
                let opt = {
                    canvasId: me.canvas.domID,
                    x,
                    y,
                    width,
                    height,
                    success: callback
                };
                return wx.canvasGetImageData(opt);
            } else {
                throw new Error(`WeiXinAPP not support "getImageData" function!`);
            }
        } else {
            let imageData = me._ctx['getImageData'](x, y, width, height);
            if (callback) {
                callback.call(me, imageData);
            }
        }
    }

    putImageData(imageData, x, y, callback) {
        let me = this;
        if (me.isWeiXinAPP) {
            if (wx.canIUse('wx.canvasPutImageData')) {
                let opt = {
                    canvasId: me.canvas.domID,
                    data: imageData.data,
                    x,
                    y,
                    width: imageData.width,
                    height: imageData.height,
                    complete: callback
                };
                return wx.canvasPutImageData(opt);
            } else {
                throw new Error(`WeiXinAPP not support "getImageData" function!`);
            }
        } else {
            me._ctx['putImageData'](imageData, x, y);
            if (callback) {
                callback.call(me, imageData);
            }
        }
    }

    // file operation
    canvasToTempFilePath(...args) {
        let me = this;
        if (me.isWeiXinAPP) {
            return me._ctx.canvasToTempFilePath(...args);
        } else {
            throw new Error('Browser not support "canvasToTempFilePath" function!')
        }
    }
}
