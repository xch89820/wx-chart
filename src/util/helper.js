/* global module, wx, window: false, document: false */
'use strict';

const ObjProto = Object.prototype;

// IS function, check variable's type
export let is = {};

[
    'Arguments',
    'Function',
    'String',
    'Number',
    'Date',
    'RegExp',
    'Error',
    'Symbol',
    'Map',
    'WeakMap',
    'Set',
    'WeakSet'
].forEach(function(name) {
    is[name] = function(obj) {
        return ObjProto.toString.call(obj) === '[object ' + name + ']';
    };
});

// Is a given value an array?
// Delegates to ECMA5's native Array.isArray
is['Array'] = Array.isArray || function(obj) {
    return ObjProto.toString.call(obj) === '[object Array]';
};

// Is a given variable an object?
is['Object'] = function(obj) {
    let type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

let class2type = {};
let toString = class2type.toString;
let hasOwn = class2type.hasOwnProperty;
let fnToString = hasOwn.toString;
let ObjectFunctionString = fnToString.call(Object);
// Is a given variable an object?
is['PureObject'] = function(obj) {
    let proto,
        Ctor;

    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if (!obj || ObjProto.toString.call(obj) !== "[object Object]") {
        return false;
    }

    proto = Object.getPrototypeOf(obj);
    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if (!proto) {
        return true;
    }
    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
    return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
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
    return is.Number(obj) && obj !== + obj;
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
function _assignGenerator(own) {
    let _copy = function(target, ...source) {
        let deep = true;
        if (is.Boolean(target)) {
            deep = target;
            target = 0 in source
                ? source.shift()
                : null;
        }

        if (is.Array(target)) {
            source.forEach(sc => {
                target.push(...sc);
            });
        } else if (is.Object(target)) {
            source.forEach(sc => {
                for (let key in sc) {
                    if (own && !sc.hasOwnProperty(key))
                        continue;
                    let so = sc[key],
                        to = target[key];
                    if (is.PureObject(so)) {
                        target[key] = deep
                            ? extend(true, is.PureObject(to)
                                ? to
                                : {}, so)
                            : so;
                    } else if (is.Array(so)) {
                        target[key] = deep
                            ? extend(true, is.Array(to)
                                ? to
                                : [], so)
                            : so;
                    } else {
                        target[key] = so;
                    }
                }
            });
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
            return + m[1] * windowSize.windowWidth / 750;
        }

        m = val.match(remReg);
        if (!!m) {
            return + m[1] * windowSize.windowWidth / 20;
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
    let windowHeight,
        windowWidth;
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

export let uid = (function() {
    let id = 0;
    return function() {
        id++;
        return 'u' + id;
    };
}());

export function niceNum(range, round) {
    let exponent = Math.floor(Math.log10(range));
    let fraction = range / Math.pow(10, exponent);
    let niceFraction;

    if (round) {
        if (fraction < 1.5) {
            niceFraction = 1;
        } else if (fraction < 3) {
            niceFraction = 2;
        } else if (fraction < 7) {
            niceFraction = 5;
        } else {
            niceFraction = 10;
        }
    } else if (fraction <= 1.0) {
        niceFraction = 1;
    } else if (fraction <= 2) {
        niceFraction = 2;
    } else if (fraction <= 5) {
        niceFraction = 5;
    } else {
        niceFraction = 10;
    }

    return niceFraction * Math.pow(10, exponent);
}

export function almostEquals(a, b, epsilon) {
    return Math.abs(a - b) < epsilon;
}

export function splineCurve(firstPoint, middlePoint, afterPoint, t = 0.4) {
    // Props to Rob Spencer at scaled innovation for his post on splining between points
    // http://scaledinnovation.com/analytics/splines/aboutSplines.html

    // This function must also respect "skipped" points

    let previous = !firstPoint
            ? middlePoint
            : firstPoint,
        current = middlePoint,
        next = !afterPoint
            ? middlePoint
            : afterPoint;

    let d01 = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2));
    let d12 = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));

    let s01 = d01 / (d01 + d12);
    let s12 = d12 / (d01 + d12);

    // If all points are the same, s01 & s02 will be inf
    s01 = isNaN(s01)
        ? 0
        : s01;
    s12 = isNaN(s12)
        ? 0
        : s12;

    let fa = t * s01; // scaling factor for triangle Ta
    let fb = t * s12;

    return {
        previous: {
            x: current.x - fa * (next.x - previous.x),
            y: current.y - fa * (next.y - previous.y)
        },
        next: {
            x: current.x + fb * (next.x - previous.x),
            y: current.y + fb * (next.y - previous.y)
        }
    };
}

/**
 * Get element style
 * @param element
 */
export function getStyle(element, property) {
    return element.currentStyle
        ? element.currentStyle[property]
        : document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
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
    return matches
        ? Number(matches[1])
        : undefined;
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



/**
 * shadeBlendConvert - Programmatically Lighten or Darken a hex color (or rgb, and blend colors)
 *
 * @param  {type} p    The percentage of light or black
 * @param  {type} from Color. Accepts 3 digit (or 4 digit) HEX color codes, in the form #RGB (or #ARGB).
 * @param  {type} to   Mixed color. Accepts 3 digit (or 4 digit) HEX color codes, in the form #RGB (or #ARGB).
 * @return {type}      HEX color , #RGB (or #ARGB)
 */
export function shadeBlendConvert(p, from, to) {
    if(typeof(p)!="number"||p<-1||p>1||typeof(from)!="string"||(from[0]!='r'&&from[0]!='#')||(typeof(to)!="string"&&typeof(to)!="undefined"))return null; //ErrorCheck
    if(!this.sbcRip)this.sbcRip=function(d){
        var l=d.length,RGB=new Object();
        if(l>9){
            d=d.split(",");
            if(d.length<3||d.length>4)return null;//ErrorCheck
            RGB[0]=i(d[0].slice(4)),RGB[1]=i(d[1]),RGB[2]=i(d[2]),RGB[3]=d[3]?parseFloat(d[3]):-1;
        }else{
            if(l==8||l==6||l<4)return null; //ErrorCheck
            if(l<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(l>4?d[4]+""+d[4]:""); //3 digit
            d=i(d.slice(1),16),RGB[0]=d>>16&255,RGB[1]=d>>8&255,RGB[2]=d&255,RGB[3]=l==9||l==5?r(((d>>24&255)/255)*10000)/10000:-1;
        }
        return RGB;}
    var i=parseInt,r=Math.round,h=from.length>9,h=typeof(to)=="string"?to.length>9?true:to=="c"?!h:false:h,b=p<0,p=b?p*-1:p,to=to&&to!="c"?to:b?"#000000":"#FFFFFF",f=sbcRip(from),t=sbcRip(to);
    if(!f||!t)return null; //ErrorCheck
    if(h)return "rgb("+r((t[0]-f[0])*p+f[0])+","+r((t[1]-f[1])*p+f[1])+","+r((t[2]-f[2])*p+f[2])+(f[3]<0&&t[3]<0?")":","+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*10000)/10000:t[3]<0?f[3]:t[3])+")");
    else return "#"+(0x100000000+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*255):t[3]>-1?r(t[3]*255):f[3]>-1?r(f[3]*255):255)*0x1000000+r((t[0]-f[0])*p+f[0])*0x10000+r((t[1]-f[1])*p+f[1])*0x100+r((t[2]-f[2])*p+f[2])).toString(16).slice(f[3]>-1||t[3]>-1?1:3);
}
