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
            width: 700,
            height: 400,
            title: '北京分公司业务销量对比',
            legends:[{
                text: '北京'
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
            width: 700,
            height: 400,
            title: '北京-上海分公司业务销量对比',
            legends:[{
                text: '北京',
                key: 'bj',
                fillStyle: '#3385ff',
                strokeStyle: '#3385ff'
            }, {
                text: '上海',
                key: 'sh',
            }],
            yScaleOptions: {
                position: 'left',
                title: '人民币(万)'
            },
        });

        wxBar.update([{
            bj: 10,
            sh: 20,
            label: '一月'
        }, {
            bj: 42,
            sh: 115,
            label: '二月'
        }, {
            bj: 38,
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

    it('Draw an mutil-data stacked WxBar', () => {
        wxBar = new WxBar('myCanvas', {
            width: 700,
            height: 400,
            title: '北京-上海分公司环比销量对比',
            stacked: true,
            yScaleOptions: {
                position: 'left',
                title: '百分比'
            },
            color: {luminosity: 'light'},
            //'zeroLine': true,
            legends: [{
                text: '北京',
                key: 'bj'
            }, {
                text: '上海',
                key: 'sh'
            },{
                text: '深圳',
                key: 'sz'
            }]
        });

        wxBar.update([{
            bj: 10,
            sh: -22,
            sz: -40,
            label: '一月'
        }, {
            bj: 42,
            sh: 115,
            sz: -21,
            label: '二月'
        }, {
            bj: 38,
            sh: 34.5,
            sz: -1,
            label: '三月'
        }, {
            bj: 56,
            sh: 22,
            sz: 10,
            label: '四月'
        }, {
            bj: 71,
            sh: 56,
            sz: 70,
            label: '五月'
        }]);
    });

    afterEach(() => {
        wxBar.destroy();
        destoryCanvasElement();
    });
});



