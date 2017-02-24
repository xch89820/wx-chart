/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import { BoxInstance } from '../src/core/layout'
import WxChart from '../src/core/wxChart'
import WxScale from '../src/core/scale'
import { createWXEnv, initCanvasElement, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

describe('WxScale component test', () => {
    let wxChart;
    beforeEach(() => {
        createWXEnv();
        initCanvasElement(350, 600);

        wxChart = new WxChart('myCanvas', {
            'width': 600,
            'height': 350
        });
    });

    it('Create Y left Axis', () => {
        let scale = new WxScale(wxChart, {
            'position': 'right'
        });

        let datasets = [{
            'text': '100',
            'lineWidth': 2
        },{
            'text': '80'
        },{
            'text': '60'
        },{
            'text': '40'
        },{
            'text': '20'
        },{
            'text': '0'
        }];

        let box = wxChart.innerBox.clone();
        box.marginLR = 20;
        box.marginTB = 20;
        scale.update(datasets, box);

    });
    //
    // it('Create Y right Axis', () => {
    //     let scale = new WxScale(wxChart, {
    //         'position': 'right'
    //     });
    //
    //     let datasets = [{
    //         'text': '100',
    //         'lineWidth': 2
    //     },{
    //         'text': '80'
    //     },{
    //         'text': '60'
    //     },{
    //         'text': '40'
    //     },{
    //         'text': '20'
    //     },{
    //         'text': '0'
    //     }];
    //
    //     let box = wxChart.innerBox.clone();
    //     box.marginLR = 20;
    //     box.marginTB = 20;
    //     scale.update(datasets, box);
    //
    // });

    // it('Create X Axis', () => {
    //     let scale = new WxScale(wxChart, {
    //         'position': 'bottom'
    //     });
    //
    //     let datasets = [{
    //         'text': '1000',
    //         'lineWidth': 2
    //     },{
    //         'text': '800'
    //     },{
    //         'text': '600'
    //     },{
    //         'text': '400'
    //     },{
    //         'text': '200'
    //     },{
    //         'text': '00'
    //     }];
    //
    //     let box  = wxChart.innerBox.clone();
    //     box.marginLR = 250;
    //     box.marginTB = 155;
    //     scale.update(datasets, box);
    //
    // });

    // it('Create X-Y Axis', () => {
    //     let scale = new WxScale(wxChart, {
    //         'position': 'left'
    //     });
    //
    //     let datasets = [{
    //         'text': '1000',
    //         'lineWidth': 2
    //     },{
    //         'text': '800'
    //     },{
    //         'text': '600'
    //     },{
    //         'text': '400'
    //     },{
    //         'text': '200'
    //     },{
    //         'text': '0'
    //     }];
    //
    //     let box = new BoxInstance('left', 0, 0, 50, 310, 50, 350);
    //     scale.update(datasets, box);
    //
    // });

    afterEach(() => {
        // wxChart.destroy();
        // destoryCanvasElement();
    });
});