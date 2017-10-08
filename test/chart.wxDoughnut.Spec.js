/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas from '../src/util/wxCanvas'
import WxDoughnut from '../src/charts/doughnut'
import { createWXEnv, initCanvasElement, randomId, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'
import * as canvasInterceptor from '../verdor/canvas-interceptor'

describe('WxDoughnut component test', () => {
    let id, canvas, wxDoughnut;
    beforeEach(function () {
        this.timeout(5000);
        createWXEnv();
        id = randomId();
        canvas = initCanvasElement(350, 600, id);
    });

    it('Draw an Pie',function (done) {
        wxDoughnut = new WxDoughnut(id, {
            width: 600,
            height: 350,
            title: '各直销公司业务销量',
            point: {
                format: function(label, value, totalValue) {
                    return label + ' (' + (value/totalValue*100).toFixed(2) + '%)';
                }
            }
        });

        wxDoughnut.update([{
            label: '北京',
            value: 30
        },{
            label: '天津',
            value: 32
        },{
            label: '厦门',
            value: 10
        },{
            label: '福建',
            value: 100
        },{
            label: '广州',
            value: 3
        }]);

        wxDoughnut.on('draw',function() {
            setTimeout(done, 200);
        });
    });

    it('Draw an wxDoughnut', function(done) {
        wxDoughnut = new WxDoughnut(id, {
            'width': 600,
            'height': 350,
            'title': '测试多纳圈图'
        });

        wxDoughnut.update([{
            label: '测试',
            value: 100
        },{
            label: '测试2',
            value: 100
        },{
            label: '测试3',
            value: 50
        },{
            label: '测试4',
            value: 30
        },{
            label: '测试5',
            value: 30
        }]);

        wxDoughnut.on('draw',() => {
            setTimeout(done, 200);
        });
    });

    it('Draw an wxDoughnut with percentage options', function(done){
        wxDoughnut = new WxDoughnut(id, {
            width: 600,
            height: 350,
            title: '各直销公司业务销量'
        });

        wxDoughnut.update([{
            label: '北京',
            value: 100,
            percentage: 60
        },{
            label: '天津',
            value: 100,
            percentage: 70
        },{
            label: '厦门',
            value: 50,
            percentage: 80
        },{
            label: '福建',
            value: 30,
            percentage: 90
        },{
            label: '广州',
            value: 30,
            percentage: 100
        }]);
        wxDoughnut.on('draw',() => {
            setTimeout(done, 200);
        });
    });

    afterEach(() => {
        let log = canvasInterceptor.getCanvasReplay(canvas);
        console.log(log)
        wxDoughnut.destroy();
        destoryCanvasElement(id);
    })
});

