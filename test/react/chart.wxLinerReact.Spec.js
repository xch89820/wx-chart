/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import WxLinerReact from '../../src/react/liner.jsx'

describe('WxLinerReact component test', () => {
    it('Draw an WxLinerReact', () => {
        let linerProps = {
            id: 'multiFillLine',
            width: 600,
            height: 400,
            title: '销售额',
            yScaleOptions: {
                position: 'left',
                title: '万元'
            },
            crossScaleOptions: {
                xFirstPointSpace: 0
            },
            legends: [{
                text: '日用品',
                key: 'dailyNecessities',
                fillArea: true,
                fillStyle: '#3385ff',
                strokeStyle: '#3385ff'
            }, {
                text: '水果',
                key: 'fruit',
                fillArea: true,
                fillStyle: '#238456',
                strokeStyle: '#238456'
            }, {
                text: '家电',
                key: 'appliances'
            }]
        };
        let body = document.body;
        const wxElement = ReactDOM.render(<WxLinerReact {...linerProps}></WxLinerReact>, body);

        wxElement.update([{
            dailyNecessities: 1,
            fruit: 10,
            appliances: 30,
            label: '一月'
        }, {
            dailyNecessities: 20,
            fruit: 50,
            appliances: 10,
            label: '二月'
        }, {
            dailyNecessities: 55,
            fruit: 12,
            appliances: 34,
            label: '三月'
        }, {
            dailyNecessities: 54,
            fruit: 72,
            appliances: 16,
            label: '四月'
        }, {
            dailyNecessities: 24,
            fruit: 65,
            appliances: 78,
            label: '五月'
        }]);
    });

    afterEach(() => {
        // Unmount all element
        ReactDOM.unmountComponentAtNode(document.body);
    });
});