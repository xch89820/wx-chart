/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import { BoxInstance } from '../src/core/layout'
import WxChart from '../src/charts/wxChart'
import WxLinerScale from '../src/scale/scale.liner'
import WxLayout from '../src/core/layout'
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

    it('Create X Liner Axis', () => {
        let scale = new WxLinerScale(wxChart, {
            'position': 'bottom'
        });

        let box = wxChart.innerBox.clone();

        let tickLimits = scale.calculateTickLimit(box, wxChart.ctx);
        // 11
        let datasets = scale.buildDatasets(178, -10, tickLimits);
        // [{text: '-20', value: -20}, {text: '0', value: 0}, {text: '20', value: 20}, {text: '40', value: 40}, {text: '60', value: 60}, {text: '80', value: 80}, {text: '100', value: 100}, {text: '120', value: 120}, {text: '140', value: 140}, {text: '160', value: 160}, {text: '180', value: 180}]


        scale.update(datasets, box);
    });

    afterEach(() => {
        wxChart.destroy();
        destoryCanvasElement();
    });
});