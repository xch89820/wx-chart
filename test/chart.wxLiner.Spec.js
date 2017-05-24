/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas from '../src/util/wxCanvas'
import WxLiner from '../src/charts/liner'
import { createWXEnv, initCanvasElement, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

describe('WxLiner component test', () => {
    let wxLiner;
    beforeEach(() => {
        createWXEnv();
        initCanvasElement(400, 700);


    });

    it('Draw an WxLiner', () => {
        wxLiner = new WxLiner('myCanvas', {
            width: 700,
            height: 400,
            title: '测试线状图',
            fillArea: true,
            yScaleOptions: {
                position: 'left',
                title: '销量(万)'
            },
            legends:[{
                text: '测试图1',
                fillStyle: '#3385ff',
                strokeStyle: '#3385ff'
            }]
        });

        wxLiner.update([{
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

    it('Draw multi-WxLiner', () => {
        wxLiner = new WxLiner('myCanvas', {
            'width': 700,
            'height': 400,
            'title': '测试线状图',
            'crossScaleOptions': {
                'xFirstPointSpace': 0
            },
            yScaleOptions: {
                position: 'left',
                title: '销量(万)'
            },
            'legends':[{
                'text': '测试图1',
                'key': 'test1',
                'fillArea': true,
                'fillStyle': '#3385ff',
                'strokeStyle': '#3385ff'
            }, {
                'text': '测试图2',
                'fillArea': true,
                'key': 'test2',
            }]
        });

        wxLiner.update([{
            test1: 10,
            test2: 20,
            label: '一月'
        }, {
            test1: 40,
            test2: 115,
            label: '二月'
        }, {
            test1: 35,
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
        wxLiner.destroy();
        destoryCanvasElement();
    });
});