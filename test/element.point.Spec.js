/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import { BoxInstance } from '../src/core/layout'
import WxChart from '../src/charts/wxChart'
import WxPointElement from '../src/elements/point'
import WxEventFactory from '../src/core/event'
import WxTooltip from '../src/core/tooltip'
import { createWXEnv, initCanvasElement, randomId, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

const POINT_STYLE = {
    radius: 2,
    borderWidth: 1,
    borderColor: '#30a0ff',
    hitRadius: 1,
    // Touched
    touched: {
        radius: 4,
        borderWidth: 1
    }
};

const POINT_STYLE_2 = {
    radius: 4,
    borderWidth: 1,
    backgroundColor:'#0e20ff',
    borderColor: '#30a0ff',
    hitRadius: 1,
    // Touched
    touched: {
        radius: 4,
        borderWidth: 2
    }
};

describe('WxPointElement component test', () => {
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

    it('Create WxPointElement and draw', () => {
        let point = new WxPointElement(20, 20, POINT_STYLE);
        point.draw(wxChart.ctx);
    });

    it('Create WxPointElement and draw 2', () => {
        let point = new WxPointElement(40, 40, POINT_STYLE_2);
        point.draw(wxChart.ctx);
    });

    it('WxPointElement in range', () => {
        let point = new WxPointElement(80, 80, POINT_STYLE_2);
        point.draw(wxChart.ctx);

        let wxEventBus = new WxEventFactory(wxChart);
        let tooltip;
        canvas.addEventListener('mousedown', function(e) {
            let event = wxEventBus.eventReceiver(e);
            if (tooltip && tooltip.shown) {
                tooltip.clear();
                point.draw(wxChart.ctx);
            }

            if (!point.inRange(event.x, event.y)) {
                return;
            }

            tooltip = new WxTooltip(wxChart);
            let {x, y ,padding} = point.tooltipPosition(event.x, event.y);

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