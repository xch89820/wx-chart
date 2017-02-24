/* global module, wx, window: false, document: false */
'use strict';

const ObjProto = Object.prototype;

// IS function, check variable's type
export let is = {};

['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'].forEach(function (name) {
    is[name] = function (obj) {
        return ObjProto.toString.call(obj) === '[object ' + name + ']';
    };
});

// Is a given value an array?
// Delegates to ECMA5's native Array.isArray
is['Array'] = Array.isArray || function (obj) {
        return ObjProto.toString.call(obj) === '[object Array]';
    };

// Is a given variable an object?
is['Object'] = function (obj) {
    let type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

// Is a given variable an object?
is['PureObject'] = function(obj) {
    var type = typeof obj;
    return type === 'object' && !!obj;
};

is['Boolean'] = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
};

// Is a given value equal to null?
is['Null'] = function(obj) {
    return obj === null;
};

// Is a given variable undefined?
is['Undefined'] = function(obj) {
    return obj === void 0;
};

// Is the given value `NaN`? (NaN is the only number which does not equal itself).
is['NaN'] = function(obj) {
    return is.Number(obj) && obj !== +obj;
};

// Some helper function
export function sum() {
    let args = Array.from(arguments);
    let res = 0;
    return args.reduce(function(a, b) {
        return a + b;
    }, 0);
}

// Some regex
export const REG_HANZI = /[\u4e00-\u9fa5]/;
export const REG_ALPHABET = /[a-zA-Z]/;
export const REG_NUMBER = /[0-9]/;
export const REG_ALPHABET_NUMBER = /[0-9a-zA-Z]/;

// Assign function generator
function _assignGenerator(own, defaults) {
    let _copy = function (target, ...source) {
        let deep = true;
        if (is.Boolean(target)) {
            deep = target;
            target = 0 in source ? source.shift() : null;
        }

        if (is.Array(target)) {
            target.push(...source);
        } else if (is.Object(target)) {
            for (let index = 0; index < source.length; index++) {
                let sc = source[index];
                for (let key in sc) {
                    if (own && !sc.hasOwnProperty(key)) continue;
                    let so = sc[key], to = target[key] || {};
                    if (!defaults || target[i] === void 0) {
                        target[key] = is.PureObject(so) && deep ?
                            (deep? extend(true, {}, so) :extend({}, so)) :
                            so;
                    }
                }
            }
        }
        // Do nothing
        return target;
    };
    return _copy;
}

/**
 *
 * Extend a given object
 * @param {Boolean|Object|Array} target - target object or deep mark (default is true)
 * @param {Array|Object} source - target object if the first argument represent the deep mark, otherwise the source for merging
 * @returns {*}
 */
export let extend = _assignGenerator(false);
export let extendOwn = _assignGenerator(true);

/**
 * Check WeiXin environment
 */
export function checkWX() {
    return __GLOBAL__DEBUG__WX__ === true || (typeof wx != 'undefined' && typeof wx === 'object');
}

export let isWeiXinAPP = checkWX();
/**
 * Convert (rpx/rem) to px
 * @param unit
 */
const rpxReg = /([\d.]+)rpx/,
    remReg = /([\d.]+)rem/;
export function wxConverToPx(val) {
    if (!isWeiXinAPP) {
	    return Number.parseInt(val);
    }

    let windowSize = getWindowSize();
    if (is.String(val)) {
        let m = val.match(rpxReg);
        if (!!m) {
            return +m[1] * windowSize.windowWidth / 750;
        }

        m = val.match(remReg);
        if (!!m) {
            return +m[1] * windowSize.windowWidth / 20;
        }

        return Number.parseInt(val);
    } else if (is.Number(val)) {
        return val;
    } else {
        throw new Error('Convert px error');
    }
}

export function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
export function toDegrees(radians) {
    return radians * (180 / Math.PI);
}
/**
 * Get window size (px)
 * @returns {*}
 */
export function getWindowSize() {
    let windowHeight, windowWidth;
    if (isWeiXinAPP) {
        let ret = wx.getSystemInfoSync();
        windowWidth = ret.windowWidth;
        windowHeight = ret.windowHeight;
    } else {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
    }
    return {windowWidth, windowHeight};
};

/**
 * Get window's Device Pixel Ratio
 */
export function getDPR() {
    if (isWeiXinAPP) {
        let ret = wx.getSystemInfoSync();
        return ret.pixelRatio;
    } else {
        return window.devicePixelRatio || 1;
    }
};

export let uid = (function () {
    let id = 0;
    return function () {
        id++;
        return 'u' + id;
    };
}());

/**
 * Get element style
 * @param element
 */
export function getStyle(element, property) {
    return element.currentStyle ?
        element.currentStyle[property] :
        document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
}
/**
 * The 'used' size is the final value of a dimension property after all calculations have
 * been performed. This method uses the computed style of `element` but returns undefined
 * if the computed style is not expressed in pixels. That can happen in some cases where
 * `element` has a size relative to its parent and this last one is not yet displayed,
 * for example because of `display: none` on a parent node.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
 * @param element
 * @param property
 * @returns {Number} Size in pixels or undefined if unknown.
 */
export function readUsedSize(element, property) {
    let value = getStyle(element, property);
    let matches = value && value.match(/(\d+)px/);
    return matches ? Number(matches[1]) : undefined;
}
/**
 * For retina screen
 * @param ctx
 * @param width
 * @param height
 */
export function retinaScale(ctx, width, height) {
    let pixelRatio = getDPR();
    if (pixelRatio === 1) {
        return;
    }

    let canvas = ctx.canvas;
    if (isWeiXinAPP) {
        // Do I resize the height or width?
    } else {
        canvas.height = canvas.height * pixelRatio;
        canvas.width = canvas.width * pixelRatio;
        ctx.scale(pixelRatio, pixelRatio);

        // If no style has been set on the canvas, the render size is used as display size,
        // making the chart visually bigger, so let's enforce it to the 'correct' values.
        // See https://github.com/chartjs/Chart.js/issues/3575
        canvas.style.height = height + 'px';
        canvas.style.width = width + 'px';
    }
}
