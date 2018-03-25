/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import { BoxInstance } from '../src/core/layout'
import WxChart from '../src/charts/wxChart'
import WxArcElement from '../src/elements/arc'
import WxEventFactory from '../src/core/event'
import WxTooltip from '../src/core/tooltip'
import { createWXEnv, initCanvasElement, randomId, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

const ARC_STYLE = {
    angle: Math.PI/180*30,
    startAngle: 0,
    radius: 100,
    //backgroundColor: '#fff',
    //backgroundAlpha: 0.8,
    borderColor: '#ff407e',
    borderWidth: 1,
    touch: {}
};

const ARC_STYLE_2 = {
    angle: Math.PI/180*40,
    startAngle: Math.PI/180*10,
    radius: 100,
    innerRadius: 50,
    backgroundColor: '#ff97be',
    backgroundAlpha: 0.8,
    borderColor: '#ff407e',
    borderWidth: 1,
    touch: {}
};

describe('WxArcElement component test', () => {
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

    it('Create WxArcElement and draw', () => {
        let arc = new WxArcElement(20, 20, ARC_STYLE);
        arc.draw(wxChart.ctx);
    });

    it('Create WxArcElement and draw 2', () => {
        let arc = new WxArcElement(80, 80, ARC_STYLE_2);
        arc.draw(wxChart.ctx);
    });

    it('WxArcElement in range', () => {
        let arc = new WxArcElement(80, 80, ARC_STYLE_2);
        arc.draw(wxChart.ctx);

        let wxEventBus = new WxEventFactory(wxChart);
        let tooltip;
        canvas.addEventListener('mousedown', function(e) {
            let event = wxEventBus.eventReceiver(e);
            if (tooltip && tooltip.shown) {
                tooltip.clear();
                arc.draw(wxChart.ctx);
            }

            if (!arc.inRange(event.x, event.y)) {
                return;
            }

            tooltip = new WxTooltip(wxChart);
            let {x, y ,padding} = arc.tooltipPosition(event.x, event.y);

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
