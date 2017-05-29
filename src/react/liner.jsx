import React from 'react';
import ReactDOM from 'react-dom';
import WxChartReact from './wxChartReact.jsx';
import WxLiner from '../charts/liner';

class WxLinerReact extends WxChartReact {
    initChart(el) {
        return new WxLiner(el, this.props);
    }
}

export default WxLinerReact;