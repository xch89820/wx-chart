/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import { BoxInstance } from '../src/core/layout'
import WxChart from '../src/charts/wxChart'
import WxRectElement from '../src/elements/rect'
import WxEventFactory from '../src/core/event'
import WxTooltip from '../src/core/tooltip'
import { createWXEnv, initCanvasElement, randomId, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

const RECT_STYLE = {
    borderWidth: 1,
    borderColor: '#30a0ff',
    width: 100,
    height: 100,
    // Touched
    touched: {}
};

const RECT_STYLE_2 = {
    borderWidth: 1,
    backgroundColor:'#0e20ff',
    borderColor: '#30a0ff',
    width: 100,
    height: 150
};

const RECT_STYLE_3 = {
    borderWidth: 5,
    border: 'top left right',
    backgroundColor:'#0e20ff',
    borderColor: '#ff1529',
    width: 100,
    height: 100
};

describe('WxRectElement component test', () => {
    let wxChart, id, canvas;
    beforeEach(() => {
        createWXEnv();
        id = randomId();
        canvas = initCanvasElement(600, 350, id);
        wxChart = new WxChart(id, {
            'width': 600,
            'height': 350
        });
    });

    it('Create WxRectElement and draw', () => {
        let rect = new WxRectElement(20, 20, RECT_STYLE);
        rect.draw(wxChart.ctx);
    });

    it('Create WxRectElement and draw 2', () => {
        let rect = new WxRectElement(40, 40, RECT_STYLE_2);
        rect.draw(wxChart.ctx);
    });

    it('Create WxRectElement and draw 3', () => {
        let rect = new WxRectElement(40, 40, RECT_STYLE_3);
        rect.draw(wxChart.ctx);
    });

    it('WxPointElement in range', () => {
        let rect = new WxRectElement(80, 80, RECT_STYLE_3);
        rect.draw(wxChart.ctx);

        let wxEventBus = new WxEventFactory(wxChart);
        let tooltip;
        canvas.addEventListener('mousedown', function(e) {
            let event = wxEventBus.eventReceiver(e);
            if (tooltip && tooltip.shown) {
                tooltip.clear();
                rect.draw(wxChart.ctx);
            }

            if (!rect.inRange(event.x, event.y)) {
                return;
            }

            tooltip = new WxTooltip(wxChart);
            let {x, y ,padding} = rect.tooltipPosition(event.x, event.y);

            console.log(`Draw tooltip: ${x}, ${y}`);
            let box = wxChart.innerBox.clone();
            box.x = x;
            box.y = y;
            tooltip.update('In the Element!', box);
        });

    });

    afterEach(() => {
        wxChart.destroy();
        destoryCanvasElement(id);
    })
});