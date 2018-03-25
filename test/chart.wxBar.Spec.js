/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas from '../src/util/wxCanvas'
import WxBar from '../src/charts/bar'
import { createWXEnv, initCanvasElement, randomId, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'
import * as canvasInterceptor from '../verdor/canvas-interceptor'

describe('WxBar component test', () => {
    let id, canvas, wxBar;
    beforeEach(function () {
        this.timeout(4000);
        createWXEnv();
        id = randomId();
        canvas = initCanvasElement(400, 700, id);
    });

    it('Draw an WxBar', function(done) {
        wxBar = new WxBar(id, {
            width: 700,
            height: 400,

            title: '北京分公司业务销量对比',
            legends:[{
                text: '北京'
            }]
        });

        // let lastHandler;
        wxBar.once('draw',(views) => {
            let handler = wxBar.mouseoverTooltip(views);
            canvas.addEventListener('mousemove', handler);
            done();
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

    it('Draw an WxBar without animate', function(done) {
        wxBar = new WxBar(id, {
            width: 700,
            height: 400,
            animate: false,
            title: '北京分公司业务销量对比',
            legends:[{
                text: '北京'
            }]
        });

        // let lastHandler;
        wxBar.once('draw',(views) => {
            let handler = wxBar.mouseoverTooltip(views);
            canvas.addEventListener('mousemove', handler);
            done();
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

    it('Draw an mutil-data WxBar', function(done) {
        wxBar = new WxBar(id, {
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

        // let lastHandler;
        wxBar.once('draw',(views) => {
            let handler = wxBar.mouseoverTooltip(views);
            canvas.addEventListener('mousemove', handler);
            done();
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
            //sh: 34.5,
            label: '三月'
        }, {
            bj: 56,
            sh: 22,
            label: '四月'
        }, {
            bj: 80,
            sh: 56,
            label: '五月'
        }]);
    });

    it('Draw an mutil-data WxBar with axis tooltip', function(done) {
        wxBar = new WxBar(id, {
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
            tooltip: {
                model: 'axis'
            }
        });

        // let lastHandler;
        wxBar.once('draw',(views) => {
            let handler = wxBar.mouseoverTooltip(views);
            canvas.addEventListener('mousemove', handler);
            done();
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
            //sh: 34.5,
            label: '三月'
        }, {
            bj: 56,
            sh: 22,
            label: '四月'
        }, {
            bj: 80,
            sh: 56,
            label: '五月'
        }]);
    });


    it('Draw an mutil-data stacked WxBar', function(done) {
        wxBar = new WxBar(id, {
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

        // let lastHandler;
        wxBar.once('draw',(views) => {
            let handler = wxBar.mouseoverTooltip(views);
            canvas.addEventListener('mousemove', handler);
            done();
        });

        wxBar.update([{
            bj: 10,
            sh: -22,
            sz: -40,
            label: '一月'
        }, {

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
        wxBar.once('draw',() => {
            done();
        });
    });


    afterEach(() => {
        let log = canvasInterceptor.getCanvasReplay(canvas);
        console.log(log)
        wxBar.destroy();
        destoryCanvasElement(id);
    });
});



