/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import WxChart from '../src/core/base'
import WxTitle from '../src/core/title'
import { createWXEnv, initCanvasElement, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

describe('Util wxChart', () => {
    let wxChart;
    beforeEach(() => {
        createWXEnv();
        initCanvasElement(350, 600);

        wxChart = new WxChart('myCanvas', {
            'width': 600,
            'height': 350
        });
    });

    it('Create wxLegend object', () => {
        let title = new WxTitle(wxChart);

        title.update('Title', wxChart.innerBox);

    });

    afterEach(() => {
        // destoryCanvasElement();
        // wxChart.destroy();
    })
});