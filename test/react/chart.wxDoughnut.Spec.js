/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import WxDoughnutReact from '../../src/react/doughnut.jsx'

describe('WxDoughnutReact component test', () => {
    it('Draw an WxDoughnutReact', () => {
        let pieProps = {
            id: 'myPie',
            width: 600,
            height: 400,
            title: '销售量',
            cutoutPercentage: 20
        };

        let body = document.body;
        const wxElement = ReactDOM.render(<WxDoughnutReact {...pieProps}></WxDoughnutReact>, body);

        wxElement.update([{
            label: '一月',
            value: 100,
            percentage: 60
        },{
            label: '二月',
            value: 100,
            percentage: 70
        },{
            label: '三月',
            value: 50,
            percentage: 80
        },{
            label: '四月',
            value: 30,
            percentage: 90
        },{
            label: '五月',
            value: 30,
            percentage: 100
        }])
    });

    afterEach(() => {
        // Unmount all element
        ReactDOM.unmountComponentAtNode(document.body);
    });
});