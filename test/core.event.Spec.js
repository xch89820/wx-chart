/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import { is, wxConverToPx, extend } from '../src/util/helper'
import { createWXEnv, initCanvasElement, randomId, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'
import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import * as canvasInterceptor from '../verdor/canvas-interceptor'
import WxEventFactory from '../src/core/event'
import WxChart from '../src/charts/wxChart'
import WxPointElement from '../src/elements/point'
import WxTooltip from '../src/core/tooltip'

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

describe('WxEvent class test', () => {
    let id, canvas;
    beforeEach(() => {
        createWXEnv();
        id = randomId();
        canvas = initCanvasElement(400, 700, id);
    });

    it('Touch An Element', function() {
        // Init chart
        let wxChart = new WxChart(id, {
            'width': 400,
            'height': 700
        });

        let wxEventBus = new WxEventFactory(wxChart);
        // Draw an element
        let point = new WxPointElement(20, 20, POINT_STYLE);
        point.draw(wxChart.ctx);

        let tooltip = new WxTooltip(wxChart);
        // Over time
        let timer,lastTime,
            overTime = 500;
        // Bind mouse
        canvas.addEventListener('mousemove', function(e) {
            if (timer) clearTimeout(timer);

            let event = wxEventBus.eventReceiver(e);
            if (!point.inRange(event.x, event.y)) {
                if (tooltip.shown) {
                    tooltip.clear();
                    point.draw(wxChart.ctx);
                }
                return;
            }

            console.log(`In element range: ${event.x}, ${event.y}`);
            timer = setTimeout(function(){
                // Redraw chart
                wxChart.clear();
                point.draw(wxChart.ctx);

                // Draw touch tip
                let {x, y ,padding} = point.tooltipPosition(event.x, event.y);

                console.log(`Draw tooltip: ${x}, ${y}`);
                // Init tooltip
                tooltip.clear();
                let box = wxChart.innerBox.clone();
                box.x = x;
                box.y = y;
                tooltip.update('In the Point!', box);

                // let log = canvasInterceptor.getCanvasReplay(canvas);
                //console.log(log);
            }, overTime);

        });
    });

    afterEach(() => {
        destoryCanvasElement(id);
    })
});

