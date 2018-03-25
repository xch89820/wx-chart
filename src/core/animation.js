/* global module, wx, window: false, document: false */
'use strict';

import Tweezer from '../util/tweezer';
import * as ez from 'ez.js';
import {
    is,
    extend
} from '../util/helper';
import Emitter from '../util/emitter';


export function wxAnimationActLinker() {
    let actions = [],
        globals = {};
    return function(action, ...options) {
        let me = this;
        if (me instanceof WxAnimation) {
            // Run all actions in WxAnimation call
            let ret;
            actions.forEach((action) => { ret = action.apply(me, arguments)} );
            return ret;
        } else {
            // Just push action
            actions.push(action);
            return actions;
        }
    }
}

export default class WxAnimation extends Emitter {
    // Tweenzer instance
    tweenzerHandler;

    /**
     * A action callback
     * @callback WxAnimation~action
     * @param {number} value - The value of this tick
     * @param {Object} preRet - The last tick's return value
     * @param {Promise} toNext - Hand over next action
     * @param {function} nextAction - Next action or Null
     *
     * @description
     * Every action is a callback to deal one or more ticks
     * Several parameters will pass to. The first is value of this tick; Another is an function can hand over the executive authority to next action.
     */
    actions;

    // The animate has started or not
    started;

    // The current handler action
    currentActionIndex = 0;

    // The error in actions
    error;

    /**
     * WxAnimation initial
     *
     * @param {Object} options - Animation options
     * @param {number} options.start - The start value
     * @param {number} options.end - The end value
     * @param {Object} [options.duration=1000] - The total seconds of animation
     * @param {Object} [options.easeType=easeInOut] - Easing type, please see [ez.js](https://github.com/jaxgeller/ez.js/blob/master/ez.js) for more information
     * @constructor
     */
    constructor(options) {
        super();

        let easeFun = ez.easeInOutQuad;
        if (options.easeType) {
            if (typeof ez[options.easeType] != 'undefined') {
                easeFun = ez[options.easeType];
            }
        }

        this.tweenzerHandler = new Tweezer(
            extend({easing: easeFun}, options)
        );

        this.actions = [];
    }

    /**
     * Push an action to
     * @param {WxAnimation~action|wxAnimationActLinker} action
     * @return {number} - The index of action
     */
    pushActions(action) {
        if (!is.Function(action)) {
            throw new Error("Should pass to an `action` callback function");
        }
        return this.actions.push(action);
    }

    /**
     * Reset actions
     */
    resetActions() {
        this.actions = [];
    }

    runTick(value, preRet) {
        let me = this,
            caindex = me.currentActionIndex || 0;
        if (caindex >= me.actions.length) {
            return;
        }

        let ret,
            action = me.actions[caindex],
            nextAction = caindex+1 <= me.actions.length ? me.actions[caindex+1]: null;
        // try {
        me.emit('tick', value, preRet, me.handOverAction, nextAction, false);
        ret = action.apply(me,[value, preRet, me.handOverAction, nextAction]);
        // } catch (e) {
        //     me.error = `${e.name} : ${e.message}`;
        //     // Catch an error.
        //     // Stop all actions
        //     me.started = false;
        //     me.currentActionIndex = 0;
        //     me.tweenzerHandler.stop();
        //     me.emit('error', me.error);
        // }
        return ret;
    };

    runTickParallel(value, tickRet = []){
        let me = this,
            actions = me.actions,
            actionsLen = me.actions.length;

        // try {
        actions.forEach((action, index) => {
            let preRet = tickRet ? tickRet[index] : null,
                toNext = () => {
                },
                nextAction = index + 1 < actionsLen ? actions[index + 1] : null;
            me.emit('tick', value, preRet, toNext, nextAction, true);
            let ret = action.apply(me, [value, preRet, toNext, nextAction]);
            tickRet[index] = ret;
        });
        // } catch (e) {
        //     me.error = `${e.name} : ${e.message}`;
        //     // Catch an error.
        //     // Stop all actions
        //     me.started = false;
        //     me.tweenzerHandler.stop();
        //     me.emit('error', me.error);
        // }
        return tickRet;
    };

    handOverAction = () => {
        this.currentActionIndex++;
    };

    tick(parallel) {
        let me = this, rets = undefined;
        return function(v) {
            if (parallel)
                rets = me.runTickParallel(v, rets);
            else
                rets = me.runTick(v, rets);
        }
    }
    /**
     * Run actions
     *
     * @param {Boolean} parallel - parallel to exec all actions
     */
    run(parallel = false) {
        let me = this;
        me.emit('start', parallel);
        me.started = true;

        me.tweenzerHandler
            .on('tick', me.tick(parallel))
            .on('done', function() {
                me.currentActionIndex = 0;
                me.started = false;
                me.emit('done', parallel);
            }).begin();
    }

    stop = () => {
        this.currentActionIndex = 0;
        this.tweenzerHandler.stop();
        this.started = false;
        this.emit('stop');
    };

    reset = () => {
        this.currentActionIndex = 0;
        this.tweenzerHandler.stop().off('tick').off('done');
        this.started = false;
        this.resetActions();
        this.emit('reset');
    };
}



