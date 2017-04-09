/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';
import { is, wxConverToPx, extend } from '../src/util/helper'
import { createWXEnv } from './createWXEnv'

describe('Util helper is', () => {
    it('Check is.Boolean', () => {
        assert.equal(is.Boolean(true), true);
    })
});

describe('Util helper extend', () => {
    let target, dTarget,source, source2, dSource, dSource2;

    beforeEach(() => {
        target = {'a': 1, 'k': []};
        source = {'b': 2, 'c': 3, 'k': [1, 2, 3]};
        source2 = {'d': 4, 'e': 5};

        dTarget = {'target': 1};
        dSource = {'deep': {'a': 1, 'b': {'c': 1}}};
        dSource2 = {'target': {'d': 1}};
    });

    it('extend one target', () => {
        extend(target, source);

        assert.deepEqual(target, {'a': 1, 'b': 2, 'c': 3, 'k': [1, 2, 3]}, 'merge source to target');
    });

    it('extend two source to target', () => {
        extend(target, source, source2);
        assert.deepEqual(target, {'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'k': [1, 2, 3]}, 'merge source to target');
    });

    it('extend deep copy', () => {
        extend(dTarget, dSource);
        assert.deepEqual(dTarget, {'target': 1, 'deep': {'a': 1, 'b': {'c': 1}}}, 'deep merge to target');
    });

    it('extend deep copy marked by true', () => {
        extend(true, dTarget, dSource);
        assert.deepEqual(dTarget, {'target': 1, 'deep': {'a': 1, 'b': {'c': 1}}}, 'deep merge to target');
    });

    it('extend deep copy two object', () => {
        extend(dTarget, dSource, dSource2);
        assert.deepEqual(dTarget, {'target': {'d': 1}, 'deep': {'a': 1, 'b': {'c': 1}}}, 'deep merge to target');
    });
});

describe('Util helper wxConverToPx', () => {
    before(() => {
        createWXEnv();
    });

    it('wxConverToPx cover 200 => 200', () => {
        assert.equal(wxConverToPx(200), 200);
    });

    it('wxConverToPx cover 200px => 200', () => {
        assert.equal(wxConverToPx('200px'), 200);
    });

    it('wxConverToPx cover 200rpx in iPhone6 => 100', () => {
        assert.equal(wxConverToPx('200rpx'), 100);
    });

    it('wxConverToPx cover 20rem in iPhone6 => 375', () => {
        assert.equal(wxConverToPx('20rem'), 375);
    });
});