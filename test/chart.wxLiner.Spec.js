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
            title: '北京分公司业务销量趋势图',
            yScaleOptions: {
                position: 'left',
                title: '人民币(万)'
            },
            legendOptions:{
              display: false
            },
            legends:[{
                text: '销售额'
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
            width: 700,
            height: 400,
            title: '北京-上海分公司业务销量对比',
            crossScaleOptions: {
                xFirstPointSpace: 0
            },
            yScaleOptions: {
                position: 'left',
                title: '人民币(万)'
            },
            legends:[{
                text: '北京',
                key: 'bj',
                fillStyle: '#3385ff',
                strokeStyle: '#3385ff',
                fillArea: true
            }, {
                text: '上海',
                key: 'sh',
                fillArea: true
            }]
        });

        wxLiner.update([{
            bj: 10,
            sh: 20,
            label: '一月'
        }, {
            bj: 40,
            sh: 115,
            label: '二月'
        }, {
            bj: 35,
            sh: 34.5,
            label: '三月'
        }, {
            bj: 56,
            sh: 22,
            label: '四月'
        }, {
            bj: 71,
            sh: 56,
            label: '五月'
        }]);
    });

    it('Draw stacked multi-WxLiner', () => {
        wxLiner = new WxLiner('myCanvas', {
            width: 700,
            height: 400,
            title: '北京-上海分公司业务销量对比',
            stacked: true,
            crossScaleOptions: {
                xFirstPointSpace: 0
            },
            yScaleOptions: {
                position: 'left',
                title: '人民币(万)'
            },
            point:{
                pointRadius: 0
            },
            legends:[{
                text: '北京',
                key: 'bj',
                fillStyle: '#3385ff',
                strokeStyle: '#3385ff',
                fillArea: true
            }, {
                text: '上海',
                key: 'sh',
                fillArea: true
            }]
        });

        wxLiner.update([{
            bj: -20,
            sh: 20,
            label: '一月'
        }, {
            bj: 40,
            sh: 115,
            label: '二月'
        }, {
            bj: 35,
            sh: 34.5,
            label: '三月'
        }, {
            bj: 56,
            sh: 22,
            label: '四月'
        }, {
            bj: 71,
            sh: 56,
            label: '五月'
        }]);
    });

    afterEach(() => {
        wxLiner.destroy();
        destoryCanvasElement();
    });
});




