/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import WxChart from '../src/charts/wxChart'
import WxLegend from '../src/core/legend'
import WxTitle from '../src/core/title'
import WxLayout from '../src/core/layout'
import randomColor from '../src/util/randomColor'
import { createWXEnv, initCanvasElement, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

describe('Util wxChart', () => {
    let wxChart, wxLayout;
    beforeEach(() => {
        createWXEnv();
        initCanvasElement(350, 600);

        wxChart = new WxChart('myCanvas', {
            'width': 600,
            'height': 350
        });
        wxLayout = new WxLayout(wxChart);
    });

    it('Create normal chart layout', () => {
        let box = wxChart.innerBox;
        let legend = new WxLegend(wxChart, {
            'position': 'bottom'
        });
        let datasets = [{
            text: 'Red',
            fillStyle: '#ea1935',
            strokeStyle: '#b50d0a'
        },{
            hidden: true,
            text: 'Blue',
            fillStyle: '#ea1935',
            strokeStyle: '#b50d0a'
        },{
            hidden: true,
            text: 'Yellow,Yellow,Yellow,Yellow,Yellow',
            fillStyle: '#ea1935',
            strokeStyle: '#b50d0a'
        }];

        box = wxLayout.adjustBox();
        assert.deepEqual(box.toObject(),
            {position: 'top', x: 0, y: 0, ex:600, ey: 350,lx: 0, ly: 0, rx: 600, ry: 350, width: 600, height: 350, outerHeight: 350, outerWidth: 600});
        legend.update(datasets, box);
        wxLayout.addBox(legend.box);

        let legendHeight = legend.box.outerHeight,
            leftHeight = 350-legendHeight,
            ey = 350-legendHeight;
        let title = new WxTitle(wxChart);
        box = wxLayout.adjustBox();
        assert.deepEqual(box.toObject(),
            {position: 'top', x: 0, y: 0, ex:600, ey: ey, lx: 0, ly: 0, rx: 600, ry: ey, width: 600, height: leftHeight, outerHeight: leftHeight, outerWidth: 600});
        title.update('My Chart Title', box);
        wxLayout.addBox(title.box);


        let titleHeight = title.box.outerHeight;
            leftHeight -= titleHeight;
        box = wxLayout.adjustBox();
        assert.deepEqual(box.toObject(),
            {position: 'top', x: 0, y: 40, ex:600, ey: ey, lx: 0, ly: 40, rx: 600, ry: ey, width: 600, height: leftHeight, outerHeight: leftHeight, outerWidth: 600});
    });

    it('Create left legend layout', () => {
        let box = wxChart.innerBox;

        let title = new WxTitle(wxChart);
        box = wxLayout.adjustBox();
        title.update('My Chart Title', box);
        wxLayout.addBox(title.box);

        let datasets = [{
            text: 'Red',
            fillStyle: '#ea1935',
            strokeStyle: '#b50d0a'
        },{
            hidden: true,
            text: 'Blue',
            fillStyle: '#ea1935',
            strokeStyle: '#b50d0a'
        },{
            hidden: true,
            text: 'Yellow,Yellow,Yellow,Yellow,Yellow',
            fillStyle: '#ea1935',
            strokeStyle: '#b50d0a'
        },{
            hidden: true,
            text: 'Orange,Orange,Orange,Orange,Orange',
            fillStyle: '#ea1935',
            strokeStyle: '#b50d0a'
        }];
        let legend = new WxLegend(wxChart, {
            'position': 'bottom right'
        });
        box = wxLayout.adjustBox();
        legend.update(datasets, box);
        wxLayout.addBox(legend.box);



        box = wxLayout.adjustBox();
    });

    afterEach(() => {
        wxChart.destroy();
        destoryCanvasElement();
    })
});