import React from 'react';
import ReactDOM from 'react-dom';
import WxChartReact from './wxChartReact.jsx';
import WxDoughnut from '../charts/doughnut';

class WxDoughnutReact extends WxChartReact {
    initChart(el) {
        return new WxDoughnut(el, this.props);
    }
}

export default WxDoughnutReact;