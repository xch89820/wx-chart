/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import { BoxInstance } from '../src/core/layout'
import WxChart from '../src/charts/wxChart'
import WxScale from '../src/core/scale'
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

    it('Create Y right Axis', () => {
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

    it('Create X Axis', () => {
        let scale = new WxScale(wxChart, {
            'position': 'bottom'
        });

        let datasets = [{
            'text': '1000',
            'lineWidth': 2
        },{
            'text': '800'
        },{
            'text': '600'
        },{
            'text': '400'
        },{
            'text': '200'
        },{
            'text': '00'
        }];

        let box  = wxChart.innerBox.clone();
        box.marginLR = 250;
        box.marginTB = 155;
        scale.update(datasets, box);

    });

    it('Create X-Y Axis', () => {
        let yAxis = new WxScale(wxChart, {
            'position': 'left'
        });
        let xAxis = new WxScale(wxChart, {
            'position': 'bottom'
        });
        let wxLayout = new WxLayout(wxChart);

        let y_datasets = [{
            'text': '1000'
        },{
            'text': '800'
        },{
            'text': '600'
        },{
            'text': '400'
        },{
            'text': '200'
        },{
            'text': '0'
        }];

        let x_datasets = [{
            'text': 'January'
        },{
            'text': 'February'
        },{
            'text': 'March'
        },{
            'text': 'April'
        },{
            'text': 'May'
        },{
            'text': 'June'
        },{
            'text': 'July'
        }];

        let box = wxLayout.adjustBox();
        yAxis.init(y_datasets);
        let yBox = yAxis.calculateBox(box, y_datasets);
        xAxis.init(x_datasets);
        let xBox = xAxis.calculateBox(box, x_datasets);

        // Y-Base
        let yMHeight = xBox.outerHeight - xBox.marginTB - xAxis.lineSpace;
        //yBox.y = yBox.y + yMHeight*2;
        yAxis.config.fixPadding = yMHeight*2;

        // Adjust X-BOX
        let xMWidth = yBox.outerWidth - yBox.marginLR - yAxis.lineSpace;
        let xOffset = xMWidth - xAxis.fixPadding/2 - (xAxis.config.ticks.lineWidth||1),
            xExtendLeft = xAxis.config.extendLeft || xAxis.calculateTickWidth(x_datasets, xBox) / 2;

        xOffset += xExtendLeft;
        let xAxisXPoint = box.x + xOffset;
        let calXbox = new BoxInstance(
            xBox.position, xAxisXPoint, xBox.y, xBox.width - xOffset, xBox.height, xBox.outerWidth - xOffset, xBox.outerHeight
        );

        yAxis.setBox(yBox, false);
        yAxis.update(y_datasets);
        wxLayout.addBox(yAxis.box);

        xAxis.setBox(calXbox, false);
        xAxis.config.extendLeft = xExtendLeft;
        xAxis.update(x_datasets);
        wxLayout.addBox(xAxis.box);
    });
    it('getTicksPosition', () => {
        let scale = new WxScale(wxChart, {
            'position': 'bottom'
        });

        let datasets = [{
            'text': '1000',
            'lineWidth': 2
        }, {
            'text': '800'
        }, {
            'text': '600'
        }, {
            'text': '400'
        }, {
            'text': '200'
        }, {
            'text': '0'
        }];


        let box = wxChart.innerBox.clone();
        scale.update(datasets, box);

        let fixPadding = scale.calculateFixPadding(scale.config);
        let tx = scale.box.x - scale.config.extendLeft + fixPadding / 2 + (scale.config.extendLeft
            ? scale.config.ticks.lineWidth
            : 0);
        let ty = scale.box.ly + scale.lineSpace;
        assert.deepEqual({
            x: tx,
            y: ty
        }, scale.getTicksPosition(-1), 'Position tick: -1');


        tx = scale.box.lx + scale._getTicksLineWidthOffset(0, scale.visDatasets)  + fixPadding / 2;
        assert.deepEqual({
            x: tx,
            y: ty
        }, scale.getTicksPosition(0), 'Position tick: 1');

        tx = scale.box.lx + scale._getTicksLineWidthOffset(1, scale.visDatasets) + (scale.tickWidth * 1) + fixPadding / 2;
        assert.deepEqual({
            x: tx,
            y: ty
        }, scale.getTicksPosition(1), 'Position tick: 2');

        let endIndex = datasets.length-1;
        tx = scale.box.lx + scale._getTicksLineWidthOffset(endIndex, scale.visDatasets) + (scale.tickWidth * endIndex) + fixPadding / 2;
        assert.deepEqual({
            x: tx,
            y: ty
        }, scale.getTicksPosition(endIndex), 'End tick');
    });

    it('getTicksPosition 2', () => {
        let scale = new WxScale(wxChart, {
            'position': 'bottom',
            'extendLeft': 30
        });

        let datasets = [{
            'text': '1000',
            'lineWidth': 2
        }, {
            'text': '800'
        }, {
            'text': '600'
        }, {
            'text': '400'
        }, {
            'text': '200'
        }, {
            'text': '0'
        }];


        let box = wxChart.innerBox.clone();
        scale.update(datasets, box);

        let fixPadding = scale.calculateFixPadding(scale.config);
        let tx = scale.box.x - scale.config.extendLeft + fixPadding / 2 + (scale.config.extendLeft
                ? scale.config.ticks.lineWidth
                : 0);
        let ty = scale.box.ly + scale.lineSpace;

        assert.deepEqual({
            x: tx,
            y: ty
        }, scale.getTicksPosition(-1), 'Position tick: 1');

        tx = scale.box.lx + scale._getTicksLineWidthOffset(0, scale.visDatasets)  + fixPadding / 2;
        assert.deepEqual({
            x: tx,
            y: ty
        }, scale.getTicksPosition(0), 'Position tick: 1');
    });

    afterEach(() => {
        wxChart.destroy();
        destoryCanvasElement();
    });
});