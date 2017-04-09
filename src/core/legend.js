/* global module, wx, window: false, document: false */
'use strict';

import WxChart from './base'
import {extend, is} from '../util/helper'
import { BoxInstance } from './layout';
import WxBaseComponent from './base'

// Legend default config
const WX_LEGEND_DEFAULT_CONFIG = {
    'display': true,
    /**
     * position can set to :top, bottom, left(same as left bottom), right(same as right bottom), left top, left bottom, right top, right bottom
     */
    'position': 'top',
    'fullWidth': true, // if the fullWidth is false, the 'width' property should be existed.
    'labels': {
        'boxWidth': 30,
        'fontSize': 10,
        'padding': 10 // Padding width between legend items
    }
};

//
// The datasets is an empty array at the first time
// When you set 'data' attribute, the legend items will draw on Canvas
// Format
// {
//    text: 'Displayed Text String',
//    fillStyle: 'Color', // Fill style of the legend box
//    hidden: Boolean, // If true, this item represents a hidden datasets. Label will be rendered with a strike-through effect,
//    strokeStyle: 'Color'
//    lineCap: String,
//    lineJoin: String,
//    lineWidth: Number
// }
const WX_LEGEND_DEFAULT_ITEM_CONFIG = {
    'lineWidth': 2
};

export default class WxLegend extends WxBaseComponent {
    constructor(wxChart, config) {
        super(wxChart, config);
        this.config = extend(true, {}, WX_LEGEND_DEFAULT_CONFIG, config);
    }

    init(datasets, defaultOptions = WX_LEGEND_DEFAULT_ITEM_CONFIG) {
        let me = this;
        let config = me.config;

        datasets = super.init(datasets, defaultOptions);
        // Reset legendBox
        // Calculate the legend items
        datasets = me.calculateLegendItem(datasets, config);

        me._datasets = datasets;

        return datasets;
    }

    calculateLegendItem(datasets, config) {
        let me = this;
        let labelsConfig = config.labels || {};

        let ctx = me.wxChart.ctx;
        let boxWidth = labelsConfig.boxWidth;
        let fontSize = labelsConfig.fontSize;
        if (!is.Array(datasets) && is.PureObject(datasets)) {
            datasets = [datasets];
        }

        datasets = datasets.map(function (dataset) {
            let textWidth = ctx.measureText(dataset.text).width;

            let width = boxWidth + (fontSize / 2) + textWidth;
            dataset._prop = {
                'fontSize': fontSize,
                'boxHeight': fontSize,
                'boxWidth': boxWidth,
                'textWidth': textWidth,
                'width': width
            };
            return dataset;
        });

        return datasets;
    }

    calculateBox(area, datasets = this.datasets, config = this.config) {
        let me = this;
        let outerWidth, outerHeight,
            width, height;
        let wxChart = me.wxChart,
            ctx = wxChart.ctx,
            fontSize = ctx.fontSize;
        let x = area.x, y = area.y;
        let padding = config.labels.padding||10;

        if (me.isHorizontal()) {
            width = !!config.fullWidth ? (area.width - padding * 2) : config.width;
            outerWidth = !!config.fullWidth ? area.width: config.width;
            height = fontSize;
            outerHeight = height + padding * 2;

            // Calculate all items
            let lineNum = 0, currentLineWidth = 0, maxLineWidth = 0;
            datasets.forEach(function (dataset) {
                let prop = dataset._prop,
                    outerWidth = prop.width + padding;
                let lineWidth = currentLineWidth + outerWidth;
                if (lineWidth > width) {
                    // The previous line width
                    maxLineWidth = maxLineWidth < currentLineWidth ? currentLineWidth : maxLineWidth;
                    // We should take a new line
                    lineNum++;
                    // Set currentLineWidth = 0
                    currentLineWidth = outerWidth;

                    // The first item width insufficient..
                    if (outerWidth > width) {
                        // The width options is tooooo small!
                        console.warn('The width options is too small! width=', width, '.The chart will set to ', lineWidth);
                        width = outerWidth;
                    }
                } else {
                    currentLineWidth += outerWidth;
                }

                prop.padding = padding;
                prop.lineNum = lineNum;
                prop.outerWidth = outerWidth;
            });
            maxLineWidth = maxLineWidth < currentLineWidth ? currentLineWidth : maxLineWidth;

            // Re calculate the height of legend
            if (lineNum > 0) {
                height = fontSize*(lineNum+1) + lineNum*fontSize/2;
                outerHeight = height + padding * 2
            }

            x += (width - maxLineWidth) / 2;
            if (me.position == 'bottom') {
                y = area.ry - outerHeight;
                y = y < area.y ? area.y : y;
            }
        } else {
            let position = me.position.match(/left/) ? 'left' : 'right';
            let align = me.position.match(/top/) ? 'top' : 'bottom';
            let width = 0, lineNum = 0;
            datasets.forEach(function (dataset) {
                let wh = dataset._prop.width;
                width = width < wh ? wh : width;

                dataset._prop.padding = padding;
                dataset._prop.lineNum = lineNum;
                // not use to set prop.outerWidth
                dataset._prop.outerWidth = null;
                lineNum++;
            });
            outerWidth = width + padding * 2;
            height = fontSize*(lineNum+1) + lineNum*padding/2;
            outerHeight = height + padding * 2;

            if (align == 'bottom') {
                y = area.ry - outerHeight;
                y = y < area.y ? area.y : y;
            }
            if (position == 'right') {
                x = area.rx - outerWidth;
                x = x < 0 ? 0 : x;
            }
            return new BoxInstance({position: position, x, y, width, outerWidth, height, outerHeight});
        }

        return new BoxInstance({position: config.position, x, y, width, outerWidth, height, outerHeight});
    }

    draw(datasets = this.datasets, box = this.box, config = this.config) {
        let me = this, ctx = me.wxChart.ctx;
        let {x, y, width, outerWidth, height, outerHeight} = box;

        // Clear the area of legend
        me.clear();

        // Begin a new sub-context
        ctx.save();
        // Draw all items
        let currentLineNum = -1;
        let currentX = x, currentY = y;
        datasets.forEach(function(dataset){
            let {text, hidden, fillStyle, strokeStyle, lineCap, lineJoin, lineWidth} = dataset;
            let {width, fontSize, textWidth, padding, lineNum, boxWidth, boxHeight, outerWidth} = dataset._prop;

            if (!width) {
                // No need to draw
                return;
            }

            // Set style
            ctx.textBaseline = 'top';
            ctx.textAlign = 'start';
            ctx.fillStyle = fillStyle;
            ctx.strokeStyle = strokeStyle;
            ctx.lineCap = lineCap;
            ctx.lineJoin = lineJoin;
            ctx.lineWidth = lineWidth;

            if (currentLineNum < lineNum) {
                currentLineNum = lineNum;
                currentX = x + padding;
                currentY = y + (lineNum*fontSize*1.5) + padding;
            }
            let thisX = currentX;
            // draw rect
            if (ctx.lineWidth != 0) {
                ctx.strokeRect(currentX, currentY, boxWidth, boxHeight);
            }
            ctx.fillRect(currentX, currentY, boxWidth, boxHeight);

            // draw text
            currentX += boxWidth + (fontSize / 2);
            ctx.fillText(text, currentX, currentY);

            // draw hidden strike through
            if (hidden) {
                ctx.save();
                // Strike through the text if hidden
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.moveTo(currentX,  currentY + (fontSize / 2));
                ctx.lineTo(currentX + textWidth, currentY + (fontSize / 2));
                ctx.stroke();
                ctx.restore();
            }

            currentX = thisX + outerWidth;
        });
        ctx.restore();

        ctx.draw();
    }
}