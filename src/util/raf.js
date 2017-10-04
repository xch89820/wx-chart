/* global module, wx, getApp, window: false, global:false, document: false */
'use strict';

/**
 * Modify from RAF(https://github.com/chrisdickinson/raf)
 *
 */
import { checkWX } from '../util/helper';
let now = require('performance-now');
let root, isWx = checkWX();
root = isWx ? {} :
    (typeof window === 'undefined' ? global : window);

let vendors = ['moz', 'webkit']
    , suffix = 'AnimationFrame'
    , raf = root['request' + suffix]
    , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(let i = 0; !raf && i < vendors.length; i++) {
    raf = root[vendors[i] + 'Request' + suffix]
    caf = root[vendors[i] + 'Cancel' + suffix]
        || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
    let last = 0
        , id = 0
        , queue = []
        , frameDuration = 1000 / 60

    raf = function(callback) {
        if(queue.length === 0) {
            let _now = now()
                , next = Math.max(0, frameDuration - (_now - last))
            last = next + _now
            setTimeout(function() {
                let cp = queue.slice(0)
                // Clear queue here to prevent
                // callbacks from appending listeners
                // to the current frame's queue
                queue.length = 0
                for(let i = 0; i < cp.length; i++) {
                    if(!cp[i].cancelled) {
                        try{
                            cp[i].callback(last)
                        } catch(e) {
                            setTimeout(function() { throw e }, 0)
                        }
                    }
                }
            }, Math.round(next))
        }
        queue.push({
            handle: ++id,
            callback: callback,
            cancelled: false
        })
        return id
    }

    caf = function(handle) {
        for(let i = 0; i < queue.length; i++) {
            if(queue[i].handle === handle) {
                queue[i].cancelled = true
            }
        }
    }
}

module.exports = function(fn) {
    // Wrap in a new function to prevent
    // `cancel` potentially being assigned
    // to the native rAF function
    return raf.call(root, fn)
};
module.exports._root = root;
module.exports.cancel = function() {
    caf.apply(root, arguments)
};
module.exports.polyfill = function() {
    root.requestAnimationFrame = raf;
    root.cancelAnimationFrame = caf
};
