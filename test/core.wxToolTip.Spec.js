/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import WxChart from '../src/charts/wxChart'
import WxTooltip from '../src/core/tooltip'
import { createWXEnv, initCanvasElement, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

describe('WxTooltip component test', () => {
    let wxChart;
    beforeEach(() => {
        createWXEnv();
        initCanvasElement(350, 600);

        wxChart = new WxChart('myCanvas', {
            'width': 600,
            'height': 350
        });
    });

    it('Create tooltip object', () => {
        let tooltip = new WxTooltip(wxChart);

        let box = wxChart.innerBox.clone();
        box.x = 10;
        box.y = 20;
        tooltip.update('I have an messages!', box);

    });

    it('Create tooltip title & content', () => {
        let tooltip = new WxTooltip(wxChart);

        let box = wxChart.innerBox.clone();
        box.x = 10;
        box.y = 40;
        tooltip.update({
            title: '短消息',
            text: 'I have an messages!'
        }, box);

    });

    it('Create tooltip split mark', () => {
        let tooltip = new WxTooltip(wxChart);

        let box = wxChart.innerBox.clone();
        box.x = 10;
        box.y = 40;
        tooltip.update({
            title: '测试分行',
            text: '测试下分行是否好使</br>好使或者不好使</br>第三行</br>第四行有点长常常常常</br>哈哈哈哈哈'
        }, box);

    });

    afterEach(() => {
        // wxChart.destroy();
        // destoryCanvasElement();
    });
});