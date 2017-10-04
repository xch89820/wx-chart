/**
 * Execute this snippet before the page uses any of the canvas methods.
 *
 * See test.html for an example, and README.md for documentation.
 * https://github.com/Rob--W/canvas-interceptor/
 */
'use strict';

wrapObject(CanvasRenderingContext2D.prototype, [
    'canvas',
], getCanvasName, function(instance, expr) {
    if (instance.__proxyLogs) {
        instance.__proxyLogs.push(expr);
        return;
    }
    var name = getCanvasName(instance);
    instance.__proxyLogs = [
        'var ' + name + ' = document.createElement("canvas").getContext("2d");',
        name + '.canvas.width = ' + instance.canvas.width + ';',
        name + '.canvas.height = ' + instance.canvas.height + ';',
        'document.body.appendChild(' + name + '.canvas);',
        expr,
    ];
});

/**
 * @param {CanvasRenderingContext2D} instance
 * @returns {string} identifier for canvas.
 */
export function getCanvasName(instance) {
    if (!instance.__proxyName) {
        getCanvasName.counter = (getCanvasName.counter + 1) || 1;
        instance.__proxyName = 'ctx' + getCanvasName.counter;
    }
    return instance.__proxyName;
}

/**
 * @param {CanvasRenderingContext2D|HTMLCanvasElement} instance
 * @returns {string} JavaScript serialization of all method invocations and
 *   property accesses of the canvas. Pass this to eval() and you should see an
 *   identical canvas in the document.
 */
export function getCanvasReplay(instance) {
    if (instance.getContext) {
        instance = instance.getContext('2d');
    }
    if (!instance.__proxyLogs) {
        return '// No actions available';
    }
    var code = instance.__proxyLogs.join('\n');
    if (code.indexOf('constructImageData(') >= 0) {
        code = 'var constructImageData = ' + constructImageData + ';\n' + code;
    }
    return code;
}

/**
 * Clear the logged actions.
 *
 * @param {CanvasRenderingContext2D|HTMLCanvasElement} instance
 */
export function clearCanvasLog(instance) {
    if (instance.getContext) {
        instance = instance.getContext('2d');
    }
    delete instance.__proxyLogs;
}

/**
 * Wrap a prototype and log all method calls/property accesses.
 * Adds a method __proxyUnwrap to the prototype chain to allow reverting the
 * wrapper. Note that the unwrap method does not fully undo the wrapping if the
 * the web page caches any property/method while the wrapper was active. In this
 * case, the only way to undo the wrapper is to reload the page.
 *
 * @param {object} o - The object (usually a flat prototype) to be wrapped.
 * @param {string[]} exclude - Property to be excluded from being wrapped.
 * @param {function(instance)} getName - Function that returns the identifier to
 *   be put in front of method calls and property accesses.
 * @param {function(instance, expr)} - Called whenever a method is called or a
 *   property is accessed. |expr| is the serialization of the invocation/access.
 */
export function wrapObject(o, exclude, getName, log) {
    if (Object.prototype.hasOwnProperty.call(o, '__proxyOriginal')) {
        throw new Error('Object is already wrapped!');
    }
    o.__proxyOriginal = {};

    Object.getOwnPropertyNames(o).forEach(function(propName) {
        if (propName.charAt(0) === '_' || exclude.indexOf(propName) >= 0 ||
            propName === 'constructor') {
            return;
        }
        var propDesc = Object.getOwnPropertyDescriptor(o, propName);
        if (!propDesc.configurable) {
            console.warn('Property "' + propName + '" is not configurable');
            return;
        }

        var propDescNew = {
            configurable: true,
            enumerable: propDesc.enumerable,
        };
        if (typeof propDesc.value === 'function') {
            propDescNew.writable = propDesc.writable;
            propDescNew.value = proxyMethod(propName, propDesc.value);
        } else {
            // If this assert is triggered, we have to decide whether to proxy
            // .value as .get/.set, or copy the property without proxying.
            console.assert(!propDesc.value, 'Property "' + propName +
                    '" should not have a non-function value');
        }
        if (propDesc.get) {
            propDescNew.get = proxyGetter(propName, propDesc.get);
        }
        if (propDesc.set) {
            propDescNew.set = proxySetter(propName, propDesc.set);
        }
        Object.defineProperty(o, propName, propDescNew);
        o.__proxyOriginal[propName] = propDesc;
    });

    o.__proxyUnwrap = function() {
        Object.keys(o.__proxyOriginal).forEach(function(propName) {
            Object.defineProperty(o, propName, o.__proxyOriginal[propName]);
        });
        delete o.__proxyOriginal;
        delete o.__proxyUnwrap;
    };

    function proxyMethod(methodName, originalMethod) {
        return function proxiedMethod() {
            var args = [].map.call(arguments, serializeArg).join(', ');
            var action = getName(this) + '.' + methodName + '(' + args + ');';
            log(this, action);
            return originalMethod.apply(this, arguments);
        };
    }

    function proxyGetter(propName, originalGetter) {
        return function proxiedGetter() {
            var action = '// read ' + getName(this) + '.' + propName;
            log(this, action);
            return originalGetter.call(this);
        };
    }

    function proxySetter(propName, originalSetter) {
        return function proxiedGetter(value) {
            var arg = serializeArg(value);
            var action = getName(this) + '.' + propName + ' = ' + arg + ';';
            log(this, action);
            return originalSetter.call(this, value);
        };
    }
}

/**
 * Serialize an object.
 *
 * @param {*} obj - Object to be serialized.
 * @returns {string} Serialization of the object. This string is a valid
 *   JavaScript **expression** and could be passed to eval('(' + code + ')').
 */
export function serializeArg(obj) {
    if (obj === undefined) {
        return 'undefined';
    }
    if (obj === null) {
        return 'null';
    }
    var type = typeof obj;
    if (type !== 'object' && type !== 'function') {
        // Primitive value.
        return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
        return '[' + obj.map(serializeArg).join(', ') + ']';
    }

    var objName = Object.prototype.toString.call(obj);
    if (objName === '[object Object]' &&
        Object.getPrototypeOf(obj) === Object.prototype) {
        // Assuming a plain non-cyclic object.
        return '{' + Object.keys(obj).map(function(key) {
            return '"' + key + '": ' + serializeArg(obj[key]);
        }).join(', ') + '}';
    }

    if (obj instanceof ArrayBuffer) {
        return serializeArg(new Uint8Array(obj)) + '.buffer';
    }

    if (obj.buffer instanceof ArrayBuffer) {
        if (obj instanceof DataView) {
            return 'new DataView(' + serializeArg(obj.buffer) + ', ' +
                    obj.byteOffset + ', ' + obj.byteLength + ')';
        }
        // Typed array
        // (use objName.slice because IE 10 and 11 don't have constructor.name).
        return 'new ' + (obj.constructor.name || objName.slice(8, -1)) +
            '([' + [].join.call(obj) + '])';
    }

    if (obj instanceof ImageData) {
        return 'constructImageData(' + obj.width + ', ' + obj.height + ', [' +
                [].join.call(obj.data) + '])';
    }

    if (obj instanceof HTMLImageElement) {
        // TODO: Serialize
        return '{ /* HTMLImageElement (src="' + obj.src + '") */ }';
    }

    if (obj instanceof HTMLCanvasElement) {
        // TODO: Serialize
        return '{ /* HTMLCanvasElement */ }';
    }

    if (obj instanceof HTMLVideoElement) {
        // TODO: Serialize
        return '{ /* HTMLVideoElement */ }';
    }

    // TODO: Implement serialization of:
    // - CanvasGradient
    // - CanvasPattern
    // - Path2D
    // - TextMetrics

    if (type === 'function') {
        return 'function() { /* body hidden */ }';
    }

    return '{ /* unserializable ' + objName + ' */ }';
}


// To be serialized and added to the exported serialization if needed.
export function constructImageData(width, height, data) {
    var imageData;
    try {
        // Chrome 43+, Firefox 29+, Opera 30+
        imageData = new ImageData(width, height);
    } catch (e) {
        var ctx = document.createElement('canvas').getContext('2d');
        // Use the unwrapped functions to avoid polluting the logs.
        var createImageData = ctx.__proxyOriginal &&
            ctx.__proxyOriginal.createImageData &&
            ctx.__proxyOriginal.createImageData.value || ctx.createImageData;
        imageData = createImageData.call(ctx, width, height);
    }
    if (imageData.data.set) {
        imageData.data.set(data, 0);
    } else {
        for (var i = 0; i < data.length; ++i) {
            imageData.data[i] = data[i];
        }
    }
    return imageData;
}
