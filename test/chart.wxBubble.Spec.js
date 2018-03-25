/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas from '../src/util/wxCanvas'
import WxBubble from '../src/charts/bubble'
import { createWXEnv, initCanvasElement, randomId, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'
import * as canvasInterceptor from '../verdor/canvas-interceptor'

describe('WxBubble component test', () => {
    let id, canvas, wxBubble;
    beforeEach(function () {
        this.timeout(4000);
        createWXEnv();
        id = randomId();
        canvas = initCanvasElement(400, 700, id);
    });

    it('Draw an WxBubble', function(done) {
        wxBubble = new WxBubble(id, {
            width: 700,
            height: 400,
            yScaleOptions: {
                position: 'left',
                title: '覆盖率（%）'
            },
            title: '数据量/覆盖度统计',
            point: {
                pointBorderWidth: 0
            },
            legends:[{
                text: '北京'
            }]
        });

        wxBubble.once('draw',(views) => {
            let handler = wxBubble.mouseoverTooltip(views);
            canvas.addEventListener('mousemove', handler);
            done();
        });

        wxBubble.update([{
            z: 10,
            value: 40,
            label: '一月'
        }, {
            z: 22,
            value: 40,
            label: '二月'
        }, {
            z: 13,
            value: 35,
            label: '三月'
        }, {
            z: 15,
            value: 56,
            label: '四月'
        }, {
            z: 90,
            value: 71,
            label: '五月'
        }]);
    });

    it('Draw an WxBubble without animate', function(done) {
        wxBubble = new WxBubble(id, {
            width: 700,
            height: 400,
            animate: false,
            title: '数据量/覆盖度统计',
            yScaleOptions: {
                position: 'left',
                title: '覆盖率（%）'
            },
            legends:[{
                text: '北京'
            }]

        });

        // let lastHandler;
        wxBubble.once('draw',(views) => {
            // if (lastHandler) canvas.removeEventListener('mousemove', lastHandler);
            let handler = wxBubble.mouseoverTooltip(views);
            canvas.addEventListener('mousemove', handler);
            // lastHandler = handler;
            done();
        });

        wxBubble.update([{
            z: 10,
            value: 1,
            label: '一月'
        }, {
            z: 23.75,
            value: 40,
            label: '二月'
        }, {
            z: 33,
            value: 35,
            label: '三月'
        }, {
            z: 34.52,
            value: 56,
            label: '四月'
        }, {
            z: 34.55,
            value: 71,
            label: '五月'
        }]);
    });

    it('Draw an mutil-data WxBubble', function(done) {
        wxBubble = new WxBubble(id, {
            width: 700,
            height: 400,
            title: '数据量/覆盖度统计',
            yScaleOptions: {
                position: 'left',
                title: '覆盖率（%）'
            },
            legends:[{
                text: '北京',
                key: 'bj',
                rKey: 'bjz',
                fillStyle: '#3385ff',
                strokeStyle: '#3385ff'
            }, {
                text: '上海',
                key: 'sh',
                rKey: 'shz'
            }, {
                text: '南京',
                key: 'nj',
                rKey: 'njz'
            }],
            tooltip: {
                model: 'axis'
            }
        });

        // let lastHandler;
        wxBubble.once('draw',(views) => {
            let handler = wxBubble.mouseoverTooltip(views);
            canvas.addEventListener('mousemove', handler);
            done();
        });

        wxBubble.update([{
            bj: 10,
            sh: 20,
            nj: 10,
            bjz: 20,
            shz: 25,
            njz: 31,
            label: '一月'
        }, {
            bj: 40,
            sh: 115,
            nj: 12,
            bjz: 31,
            shz: 25,
            njz: 33,
            label: '二月'
        }, {
            bj: 35,
            sh: 34.5,
            nj: 16,
            bjz: 35,
            shz: 30,
            njz: 40,
            label: '三月'
        }, {
            bj: 56,
            sh: 22,
            nj: 21,
            bjz: 70,
            shz: 21,
            njz: 33,
            label: '四月'
        }, {
            bj: 71,
            sh: 56,
            nj: 32,
            bjz: 57,
            shz: 55,
            njz: 35,
            label: '五月'
        }]);
    });

    afterEach(() => {
        let log = canvasInterceptor.getCanvasReplay(canvas);
        //console.log(log);
        //console.log(log)
        wxBubble.destroy();
        destoryCanvasElement(id);
    });
});