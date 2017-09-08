/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import WxChart from '../src/charts/wxChart'
import WxLegend from '../src/core/legend'
import randomColor from '../src/util/randomColor'
import { createWXEnv, initCanvasElement, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

describe('WxLegend component test', () => {
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
        let legend = new WxLegend(wxChart, {
            'position': 'right bottom'
        });

        let datasets = [{
            text: 'Jun',
            fillStyle: '#00eabf',
            strokeStyle: '#00b574'
        },{
            text: 'July',
            fillStyle: '#eae742',
            strokeStyle: '#eac900'
        },{
            text: 'Aug',
            fillStyle: '#5353ea',
            strokeStyle: '#404aea'
        },{
            text: 'Sep',
            fillStyle: '#ea1935',
            strokeStyle: '#b50d0a'
        },{
            text: 'Oct',
            fillStyle: '#eab2bb',
            strokeStyle: '#b54b6b'
        }];

        legend.update(datasets, wxChart.innerBox);

    });

    afterEach(() => {
        wxChart.destroy();
        destoryCanvasElement();
    })
});