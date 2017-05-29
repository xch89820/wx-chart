import React from 'react';
import ReactDOM from 'react-dom';
import WxChartReact from './wxChartReact.jsx';
import WxBar from '../charts/bar';

class WxBarReact extends WxChartReact {
    initChart(el) {
        return new WxBar(el, this.props);
    }
}

export default WxBarReact;