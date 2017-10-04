/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import WxChart, { getChartInstances } from '../src/charts/wxChart'
import { createWXEnv, initCanvasElement, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

describe('WxChart component test', () => {
    beforeEach(() => {
        createWXEnv();
        initCanvasElement();
    });

    it('Create and destroy wxChart object', () => {
        let wxChart = new WxChart('myCanvas', {
            'width': 800,
            'height': 500
        });

        expect(wxChart.canvas.width).to.equal(800);
        expect(wxChart.canvas.height).to.equal(500);

        assert.isDefined(wxChart.id, 'Has an unique ID');
        let id = wxChart.id;
        assert.equal(getChartInstances(id), wxChart);

        wxChart.destroy();
        assert.isNull(getChartInstances(id), 'Destroy Failed!');
    });

    afterEach(() => {
        destoryCanvasElement();
    })
});