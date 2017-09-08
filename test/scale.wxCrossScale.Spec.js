/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import { BoxInstance } from '../src/core/layout'
import WxChart from '../src/charts/wxChart'
import WxCategoryScale from '../src/scale/scale.category'
import WxLinerScale from '../src/scale/scale.liner'
import WxCrossScale from '../src/scale/scale.crosshelp'
import WxLayout from '../src/core/layout'
import { createWXEnv, initCanvasElement, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

describe('WxCrossScale component test', () => {
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
        // x-axis
        let xScale = new WxCategoryScale(wxChart, {
            'position': 'bottom'
        });
        let xScaleDatasets = [{
            text: '一月'
        }, {
            text: '二月'
        }, {
            text: '三月'
        }, {
            text: '四月'
        }, {
            text: '五月'
        }];

        // y-axis
        let yScale = new WxLinerScale(wxChart, {
            'position': 'left'
        });
        let yMin = -10,
            yMax = 178;

        let box = wxChart.innerBox.clone();
        let tickLimits = yScale.calculateTickLimit(box, wxChart.ctx);
        let yScaleDatasets = yScale.buildDatasets(yMax, yMin, tickLimits);

        let wxCrossScale = new WxCrossScale(xScale, yScale);
        let {xBox, yBox} = wxCrossScale.draw(box, xScaleDatasets, yScaleDatasets);
    });

    afterEach(() => {
        wxChart.destroy();
        destoryCanvasElement();
    });
});

