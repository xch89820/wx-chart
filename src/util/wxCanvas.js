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
    miterLimit: 10,
    lineWidth: 1,
    strokeStyle: '#000000',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: '#000000',
    font: '10px',
    textBaseline: 'alphabetic', // only support top, middle and alphabetic
    textAlign: 'start' // only support start, end and center
};

// Base text size
const WX_BASE_TEXT_SIZE = 9;

const pxReg = /([\d.]+)px/;
/**
 * Compatible canvas object
 */
export default class WxCanvas {
    constructor(id, config, contextOptions) {
        let me = this;

        me.isWeiXinAPP = checkWX();
        me._config = extend({}, WX_CANVAS_DEFAULT_PROPERTY, me.initConfig(config));

        // Acquire canvas context
        let {canvas, context} = this.acquireContext(id, config);

        me._canvas = canvas;
        me._ctx = context;
        me.wxCanvasRenderingContext2D = new WxCanvasRenderingContext2D(canvas, context, contextOptions);

        return me;
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
            canvas,
            context;
        // Outer canvas config
        let handlerCanvas = config.canvas;

        if (me.isWeiXinAPP) {
            if (is.String(id)) {
                canvas = context = wx.createCanvasContext(id);
            } else {
                throw new Error('Should set an id');
            }
        } else {
            if (handlerCanvas) canvas = handlerCanvas;
            else
                canvas = is.String(id) ? document.getElementById(id) :
                    (typeof HTMLCanvasElement != 'undefined' && id instanceof HTMLCanvasElement) ?
                        id:
                        null;
            if (typeof canvas != 'undefined') {
                context = canvas.getContext && canvas.getContext('2d');
            }
        }

        if (!canvas || !context) {
            console.error("Failed to create WxCanvas: can't acquire context!");
        }

        this.initCanvas(canvas);
        return {canvas, context};
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
    get height() {
        if (this.isWeiXinAPP) {
            return this._config.height;
        } else {
            let renderHeight = wxConverToPx(this._canvas.getAttribute('height'));
            if (renderHeight === null || renderHeight === '') {
                return readUsedSize(canvas, 'height');
            }
            return renderHeight;
        }
    }

    set height(val) {
        if (this.isWeiXinAPP) {
            // Can not set WeiXin app height
        } else {
            this._canvas.height = val;
        }
    }

    get width() {
        if (this.isWeiXinAPP) {
            return this._config.width;
        } else {
            let renderWidth = wxConverToPx(this._canvas.getAttribute('width'));
            if (renderWidth === null || renderWidth === '') {
                return readUsedSize(canvas, 'width');
            }
            return renderWidth;
        }
    }

    set width(val) {
        if (this.isWeiXinAPP) {
            // Can not set WeiXin app height
        } else {
            this._canvas.width = val;
        }
    }
}
export class WxCanvasRenderingContext2D {
    constructor(canvas, context, options) {
        let me = this;

        me.canvas = canvas;
        me._ctx = context;
        me.isWeiXinAPP = checkWX();

        // Canvas property cache stack
        me._ctxOptions = options;
        me._propertyCache = [extend({}, WX_CANVAS_CTX_DEFAULT_PROPERTY, options)];
        me.cp = me._propertyCache[0];

        me.createStyleProperty();
        me.createShadowsProperty();
        me.createTextProperty();
        me.createLineProperty();
        me.createRectProperty();
        me.createGradientProperty();
        me.createPathProperty();
        me.createTransformationProperty();
        me.createGlobalAlphaProperty();
        return me;
    }

    // Save function
    save() {
        let me = this;
        me._ctx.save();
        let nProperty = extend({}, WX_CANVAS_CTX_DEFAULT_PROPERTY, me._ctxOptions);
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
            me.cp[propertyName] = value;
        } else {
            me._ctx[propertyName] = value;
            me.cp[propertyName] = me._ctx[propertyName];
        }
        return value;
    }

    // Normally property weixin app not support
    _wxNotSupportSetProperty(value, propertyName, setBrowser = true) {
        let me = this;

        if (is.Null(value) || is.Undefined(value)) {
            return value;
        }

        //performance
        if (me.cp[propertyName] === value) {
            return value;
        }

        if (me.isWeiXinAPP) {
            me.cp[propertyName] = value;
            setBrowser
                ? me._ctx[propertyName] = value
                : null;
        } else {
            me._ctx[propertyName] = value;
            me.cp[propertyName] = me._ctx[propertyName];
        }
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
        return this._wxNotSupportSetProperty(value, propertyName);
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
                    if (value) {
                        return me._wxSetPropertyCallable(value.toLowerCase(), p)
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
                    // performance
                    if (me.cp[p] === value) {
                        return;
                    }

                    if (me.isWeiXinAPP) {
                        me.cp[p] = value;
                        me._ctx.setShadow(me.cp['shadowOffsetX'] || 0, me.cp['shadowOffsetY'] || 0, me.cp['shadowBlur'] || 0, me.cp['shadowColor'] || '#000000');
                    } else if (!is.Null(value) && !is.Undefined(value)) {
                        me._ctx[p] = value;
                        me.cp[p] = value;
                    }
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
                if (value === 'left' || value === 'right' || value === 'center')
                    return me._wxCompatibiltySetProperty(value, taProperty);
                else if (value === 'start' || value === 'end')
                    return me._wxCompatibiltySetProperty(value, taProperty, undefined, value === 'start' ? 'left' : 'right');
                else
                    return me._wxNotSupportSetProperty(value, taProperty);
            }
        });

        let tblProperty = 'textBaseline';
        Object.defineProperty(me, tblProperty, {
            get: () => {
                return me.cp[tblProperty];
            },
            set: (value) => {
                if (value === 'hanging')
                    return me._wxNotSupportSetProperty(value, tblProperty);
                else if (value === 'alphabetic')
                    return me._wxCompatibiltySetProperty(value, tblProperty, undefined, 'normal');
                else
                    return me._wxCompatibiltySetProperty(value, tblProperty);
            }
        });

        Object.defineProperty(me, 'font', {
            get: () => {
                return me.cp.font;
            },
            set: (value) => {
                if (me.isWeiXinAPP) {
                    let m = value.match(pxReg);
                    if (!!m && me.cp.font !== value) {
                        let fontSize = +m[1];
                        me._ctx.setFontSize(fontSize);
                        me.cp.font = value;
                    }
                } else {
                    if (me.cp.font !== value) {
                        me._ctx.font = value;
                        me.cp.font = value;
                    }
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
                    me.cp.font = currentFont;
                } else {
                    me._ctx.font = currentFont;
                    me.cp.font = currentFont;
                }
                return me.cp.font;
            }
        });
    }
    // Wrapper 'measureText' function for WeiXin APP
    measureText(text, fontSize = this.fontSize) {
        let me = this;
        if (me.isWeiXinAPP) {
            if (!text) {
                return 0;
            }
            let textLen = text.length;
            let hanzi = text.match(new RegExp(REG_HANZI, 'g'));
            let hanziNum = !!hanzi
                ? hanzi.length
                : 0;
            let otherNum = textLen - hanziNum;

            return {
                'width': fontSize * (otherNum + hanziNum * 2) / 2 + fontSize / 4
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
            if (!wx.canIUse('canvasContext.setTextBaseline')) {
                culY = me._calculateYForTextBaseline(y, text, baseNum);
            }
            if (!wx.canIUse('canvasContext.setTextAlign')) {
                culX = me._calculateXFortextAlign(x, text, baseNum);
            }

            return me._ctx.fillText(text, culX, culY);
        } else {
            return me._ctx.fillText(text, x, y, maxWidth);
        }
    }
    strokeText(text, x, y, ...options) {
        let me = this;
        if (me.isWeiXinAPP) {
            return me.fillText(text, x, y, ...options);
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
                    return me._wxSetPropertyCallable(value, p)
                }
            })
        });

        ['lineDashOffset'].forEach(p => {
            Object.defineProperty(me, p, {
                get: () => {
                    return me.cp[p];
                },
                set: (value) => {
                    return me._wxNotSupportSetProperty(value, p);
                }
            });
        });
    }
    setLineDash() {}
    getLineDash() {}

    // Drawing rectangles
    createRectProperty() {
        let me = this;
        ['clearRect', 'fillRect', 'strokeRect'].forEach(function(functionName) {
            me[functionName] = function(...args) {
                return me._ctx[functionName](...args);
            }
        })
    }

    // Gradient
    createGradientProperty() {
        let me = this;
        ['createLinearGradient'].forEach(function(functionName) {
            me[functionName] = function(...args) {
                return me._ctx[functionName](...args);
            }
        })
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
            me[functionName] = function(...args) {
                return me._ctx[functionName](...args);
            }
        });

        ['fill', 'stroke'].forEach(function(functionName) {
            me[functionName] = function(...args) {
                return me._ctx[functionName](...args);
            }
        })
    }
    clip(...args) {
        let me = this;
        if (me.isWeiXinAPP) {
            throw new Error('WeiXin APP not support "clip" function yet!')
        } else {
            return me._ctx.clip(...args);
        }
    }

    // Transformations
    createTransformationProperty() {
        let me = this;
        ['rotate', 'scale', 'translate'].forEach(function(functionName) {
            me[functionName] = function(...args) {
                return me._ctx[functionName](...args);
            }
        });
    }
    transform() {
        let me = this;
        if (me.isWeiXinAPP) {
            throw new Error('WeiXin APP not support "transform" function yet!')
        } else {
            return me._ctx.transform(...args);
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
                    return me._wxSetPropertyCallable(value, p)
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
}
