/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas from '../src/util/wxCanvas'
import WxBar from '../src/charts/bar'
import { createWXEnv, initCanvasElement, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

describe('WxBar component test', () => {
    let wxBar;
    beforeEach(() => {
        createWXEnv();
        initCanvasElement(400, 700);
    });

    it('Draw an WxBar', () => {
        wxBar = new WxBar('myCanvas', {
            'width': 700,
            'height': 400,
            'title': '测试柱状图',
            'legends':[{
                'text': '测试1'
            }]
        });

        wxBar.update([{
            value: 1,
            label: '一月'
        }, {
            value: 40,
            label: '二月'
        }, {
            value: 35,
            label: '三月'
        }, {
            value: 56,
            label: '四月'
        }, {
            value: 71,
            label: '五月'
        }]);
    });

    it('Draw an mutil-data WxBar', () => {
        wxBar = new WxBar('myCanvas', {
            'width': 700,
            'height': 400,
            'title': '测试柱状图',
            'legends':[{
                'text': '测试图1',
                'key': 'test1',
                'fillStyle': '#3385ff',
                'strokeStyle': '#3385ff'
            }, {
                'text': '测试图2',
                'key': 'test2',
            }]
        });

        wxBar.update([{
            test1: -10,
            test2: 20,
            label: '一月'
        }, {
            test1: -42,
            test2: 115,
            label: '二月'
        }, {
            test1: -38,
            test2: 34.5,
            label: '三月'
        }, {
            test1: 56,
            test2: 22,
            label: '四月'
        }, {
            test1: 71,
            test2: 56,
            label: '五月'
        }]);
    });

    it('Draw an mutil-data stacked WxBar', () => {
        wxBar = new WxBar('myCanvas', {
            'width': 700,
            'height': 400,
            'title': '测试柱状图',
            'stacked': true,
            //'zeroLine': true,
            'legends': [{
                'text': '测试图1',
                //'borderWidth': 0,
                'key': 'test1'
            }, {
                'text': '测试图2',
                'key': 'test2',
                //'borderWidth': 0
            }]
        });

        wxBar.update([{
            test1: -10,
            test2: 20,
            label: '一月'
        }, {
            test1: 42,
            test2: 115,
            label: '二月'
        }, {
            test1: 38,
            test2: 34.5,
            label: '三月'
        }, {
            test1: 56,
            test2: 22,
            label: '四月'
        }, {
            test1: 71,
            test2: 56,
            label: '五月'
        }]);
    });
    afterEach(() => {
        wxBar.destroy();
        destoryCanvasElement();
    });
});