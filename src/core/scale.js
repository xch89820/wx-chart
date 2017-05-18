/* global module, wx, window: false, document: false */
'use strict';

import {
    checkWX,
    is,
    wxConverToPx,
    uid,
    retinaScale,
    extend,
    sum,
    toRadians,
    toDegrees
} from '../util/helper';
import WxCanvas from '../util/wxCanvas';
import {BoxInstance} from './layout';
import WxBaseComponent from './base'

// Scale default config
const WX_SCALE_DEFAULT_CONFIG = {
    display: true,
    position: 'top', // left, bottom, right, top
    extendLeft: 0,
    extendTop: 0,
    title: undefined,
    titleFontSize: 12,
    titleFontColor: '#cccccc',
    //'lineSpace' = fontSize * 0.5'
    color: '#000000', // Line color
    lineWidth: 1,

    gridLines: {
        display: true,
        color: '#e0e0e0', // Line color
        lineWidth: 1
    },

    ticks: {
        display: true,
        autoSkip: true,
        lineWidth: 1,
        fontColor: '#000000',
        fontSize: 10,
        minRotation: 0,
        maxRotation: 90

        //maxTicksLimit: null,
    }
};

const WX_SCALE_DEFAULT_ITEM_CONFIG = {
    display: true,
    // text: '',
    lineWidth: 1,
    fontColor: '#000000',
    //format: undefined // format text function
};

// The WeinXin APP scale
export default class WxScale extends WxBaseComponent {
    constructor(wxChart, config) {
        super(wxChart, config);
        this.config = extend(true, {}, WX_SCALE_DEFAULT_CONFIG, config);
    }

    /**
     * Get visible tick's text data
     */
    getTicksText(tick) {
        if (!!tick && !!tick.text) {
            return tick.format
                ? tick.format.call(tick, tick.text, tick)
                : tick.text;
        }
        return null;
    }

    /**
     * Get lineSpace
     * @returns {*|number}
     */
    get lineSpace() {
        let me = this;
        if (me._lineSpace) {
            return me._lineSpace;
        }
        me._lineSpace = this.config.lineSpace || this.wxChart.ctx.fontSize * 0.5;
        return me._lineSpace;
    }
    /**
     * Get longest text
     */
    longestText(ctx = this.wxChart.ctx, datasets = this.datasets) {
        let me = this;
        let maxTextLen = 0;
        datasets.forEach(function(dataset) {
            if (!!dataset.display) {
                let textWidth;
                if (dataset.textWidth) {
                    textWidth = dataset.textWidth
                } else {
                    let text = me.getTicksText(dataset);
                    textWidth = ctx.measureText(text).width;
                    dataset.textWidth = textWidth;
                }
                maxTextLen = maxTextLen < textWidth
                    ? textWidth
                    : maxTextLen;
            }
        });
        return maxTextLen;
    };

    calculateFixPadding(datasets, config) {
        let me = this,
            ctx = me.wxChart.ctx;
        if (config.fixPadding) {
            return config.fixPadding;
        }
        if (me.isHorizontal()) {
            let visTicks = me.visDatasets;
            let firstTickText = me.getTicksText(visTicks[0]),
                lastTickText = me.getTicksText(visTicks[visTicks.length - 1]);
            return Math.max(ctx.measureText(firstTickText).width, ctx.measureText(lastTickText).width)
        } else {
            return ctx.fontSize;
        }
    }

    init(datasets, defaultOptions = WX_SCALE_DEFAULT_ITEM_CONFIG) {
        let me = this;
        let config = me.config;

        datasets = super.init(datasets, defaultOptions);
        me.visDatasets = null;
        me._datasets = datasets;
        me.fixPadding = me.calculateFixPadding(datasets, config);

        return datasets
    }

    calculateBox(area, datasets = this.datasets, config = this.config) {
        let me = this,
            ctx = me.wxChart.ctx;
        let fontSize = ctx.fontSize;
        let tickWidth = me.calculateTickWidth(datasets, area, config);
        let x,
            y,
            minWidth,
            minHeight,
            maxWidth,
            maxHeight;
        let minFontRotation = toRadians(config.ticks.minRotation || 0),
            maxFontRotation = toRadians(config.ticks.maxRotation || 90),
            fontRadians = minFontRotation;
        let lineSpace = me.lineSpace;
        let lineWidth = 1;

        let longestText = me.longestText();
        if (me.isHorizontal()) {
            if (longestText > tickWidth) {
                // Ticket's width not satisfied with the longest text's width
                if (tickWidth <= ctx.fontSize) {
                    fontRadians = maxFontRotation;
                } else {
                    fontRadians = Math.acos(tickWidth / longestText);
                    minHeight = Math.sin(fontRadians) * longestText + lineWidth + lineSpace + fontSize / 2;
                    if (minHeight > area.height) {
                        minHeight = area.height;
                        fontRadians = Math.asin((minHeight - lineWidth - lineSpace - fontSize / 2) / longestText);
                    } else if (fontRadians > maxFontRotation) {
                        fontRadians = maxFontRotation;
                        minHeight = Math.sin(fontRadians) * longestText + lineWidth + lineSpace + fontSize / 2;
                    }
                }
            } else {
                minHeight = fontSize * 1.5 + lineWidth + lineSpace;
            }
            minWidth = area.width;
            maxWidth = area.outerWidth;
            maxHeight = minHeight;
        } else {
            minWidth = longestText + lineWidth + lineSpace + fontSize / 2;
            if (minWidth > area.width) {
                minWidth = area.width;
                fontRadians = Math.acos((minWidth - lineWidth - lineSpace - fontSize / 2) / longestText);
                fontRadians = fontRadians > maxFontRotation
                    ? maxFontRotation
                    : fontRadians;
            }
            minHeight = area.height;
            maxWidth = minWidth;
            maxHeight = area.outerHeight;
        }
        switch (me.position) {
            case 'left':
            case 'top':
                x = area.x;
                y = area.y;
                break;
            case 'right':
                x = area.x + area.width - maxWidth;
                y = area.y;
                break;
            case 'bottom':
                x = area.x;
                y = area.y + area.height - maxHeight;
                break;
        }

        me.fontRadians = fontRadians;
        return new BoxInstance(me.position, x, y, minWidth, minHeight, maxWidth, maxHeight);
    };

    /**
     * Calculate ticks' separation distance
     * @param {BoxInstance} [area=this.box]
     *
     *
     * Horizontal Scale:
     * x------------------------------------.--x(first tick)--------------------------.--x(last tick)--margin--x
     * x------------------------------------.--x(first tick)-----x(last tick)--margin-.--x--titleWidth+padding--
     * |---extendLeft---|(box.x)---margin---|-----------area.width----------------------|---------margin------|
     *                  |----------------------------area box-------------------------------------------------|
     * Vertical Scale:
     * x----------------------------------------.--x--------(first tick)----------.--x(last tick)-x
     * x------------------titleHeight+padding---.--x---margin-x-------(first tick).--x(last tick)-x
     * |---extendTop----|(box.y)---margin-------|-----------area.height--------------|---margin---|
     *                  |----------------------------area box-------------------------------------|
     */
    calculateTickWidth(datasets = this.datasets, area = this.box, config = this.config) {
        let me = this,
            ticketWidth;
        let visTicks = me.visDatasets;
        let defaultLineWidth = config.ticks.lineWidth;
        // total line width
        let totalLineWidth = sum.apply(null, visTicks.map((v) => v.lineWidth || defaultLineWidth));
        let fixPadding = me.fixPadding;

        if (me.isHorizontal()) {
            let innerWidth = area.width,
                marginLR = area.marginLR;
            let titleWidth = me.calculateTitleWidth();
            let extendLeft = me.config.extendLeft;
            if (marginLR !== 0) {
                totalLineWidth += defaultLineWidth * 2;
            } else if (extendLeft !== 0) {
                totalLineWidth += defaultLineWidth;
            }
            ticketWidth = (innerWidth - titleWidth - totalLineWidth - fixPadding) / (visTicks.length - 1);
        } else {
            let innerHeight = area.height,
                marginTB = area.marginTB;
            let titleHeight = me.calculateTitleWidth();
            let extendTop = config.extendTop;
            if (marginTB !== 0) {
                totalLineWidth += defaultLineWidth * 2;
            } else if (extendTop !== 0) {
                totalLineWidth += defaultLineWidth;
            }
            ticketWidth = (innerHeight - titleHeight - totalLineWidth - fixPadding) / (visTicks.length - 1);
        }
        return ticketWidth;
    }

    calculateTitleWidth(config = this.config) {
        let titleWidth,
            me = this,
            ctx = me.wxChart.ctx;
        if (me.isHorizontal()) {
            titleWidth = config.title
                ? ctx.measureText(config.title, config.titleFontSize).width
                : 0;
        } else {
            titleWidth = config.title
                ? config.titleFontSize
                : 0;
        }
        return titleWidth;
    }

    _getTicksLineWidthOffset(index, visTicks) {
        let offset = 0,
            me = this;
        if (!visTicks) {
            visTicks = me.visDatasets;
        }
        let defaultLineWidth = this.config.ticks.lineWidth;
        visTicks.map((tick, i) => {
            if (index >= i) {
                offset += tick.lineWidth || defaultLineWidth;
            }
        });
        return offset;
    }

    /**
     * Get position of ticket
     * @param {number} index - Begin from zero. If set -1, the function will return the actual x,y included extendLeft or extendTop
     * @param {number} [ticketWidth=this.ticketWidth]
     * @param {BoxInstance} [area=this.box]
     */
    getTicksPosition(index, ticketWidth, area = this.box) {
        let me = this,
            ctx = me.wxChart.ctx;
        let fixPadding = me.fixPadding;
        if (!ticketWidth) {
            ticketWidth = me.calculateTickWidth();
        }
        let visTicks = me.visDatasets;

        let baseX,
            baseY;
        if (me.isHorizontal()) {
            baseX = index === -1
                ? area.x - me.config.extendLeft + fixPadding / 2 + (me.config.extendLeft
                    ? me.config.ticks.lineWidth
                    : 0)
                : area.lx + me._getTicksLineWidthOffset(index, visTicks) + ticketWidth * index + fixPadding / 2;
            baseY = me.position === 'top'
                ? area.ry - me.lineSpace
                : area.ly + me.lineSpace;
        } else {
            baseY = index === -1
                ? area.y - me.config.extendTop + fixPadding / 2 + (me.config.extendTop
                    ? me.config.ticks.lineWidth
                    : 0)
                : area.ly + me.calculateTitleWidth() + me._getTicksLineWidthOffset(index, visTicks) + ticketWidth * index + fixPadding / 2;
            baseX = me.position === 'left'
                ? area.rx - me.lineSpace
                : area.lx + me.lineSpace;
        }
        return {x: baseX, y: baseY}
    }

    _initDrawATickText() {
        let me = this,
            ctx = me.wxChart.ctx;
        switch (me.position) {
            case 'left':
                ctx.textAlign = 'end';
                ctx.textBaseline = 'middle';
                break;
            case 'right':
                ctx.textAlign = 'start';
                ctx.textBaseline = 'middle';
                break;
            case 'top':
                ctx.textAlign = 'center';
                ctx.textBaseline = 'alphabetic';
                break;
            case 'bottom':
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                break;
        }
    }
    _drawATickLine(x, y, fontSize, tick = null) {
        let me = this,
            ctx = me.wxChart.ctx;
        let lineSpace = me.lineSpace;
        let sx = x;
        let sy = y;
        switch (me.position) {
            case 'left':
                sx += lineSpace;
                break;
            case 'right':
                sx -= lineSpace;
                break;
            case 'top':
                sy += lineSpace;
                break;
            case 'bottom':
                sy -= lineSpace;
                break;
        }
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Draw text
        let text;
        if (tick && tick.text && is.String(tick.text)) {
            ctx.save();
            me._initDrawATickText();
            text = tick.format
                ? tick.format.call(me, tick.text, tick, x, y, me.fontRadians)
                : tick.text;
            let textWidth = tick.textWidth
                ? tick.textWidth
                : ctx.measureText(text).width;
            switch (me.position) {
                case 'left':
                    ctx.translate(x - fontSize / 2, y + Math.sin(me.fontRadians) * textWidth / 2);
                    ctx.rotate(me.fontRadians);
                    //ctx.fillText(text, x - ctx.fontSize/2, y);
                    break;
                case 'right':
                    ctx.translate(x + fontSize / 2, y + Math.sin(me.fontRadians) * textWidth / 2);
                    ctx.rotate(-me.fontRadians);
                    // ctx.fillText(text, x + ctx.fontSize/2, y);
                    break;
                case 'top':
                    ctx.translate(x, y - fontSize / 2);
                    ctx.rotate(-me.fontRadians);
                    break;
                case 'bottom':
                    ctx.translate(x, y + fontSize / 2);
                    ctx.rotate(me.fontRadians);
                    break;
            }
            ctx.fillText(text, 0, 0);

            ctx.restore();
        }
    }

    draw(datasets = this.datasets, box = this.box, config = this.config) {
        let me = this,
            ctx = me.wxChart.ctx;
        let fontSize = ctx.fontSize;
        let fixPadding = me.fixPadding,
            tickWidth = me.calculateTickWidth(datasets, box, config);
        let tickConfig = config.ticks;
        let {
            x,
            y,
            width,
            outerWidth,
            height,
            outerHeight
        } = box;
        let visTicks = me.visDatasets;

        let {x: currX, y: currY, x: baseX, y: baseY} = me.getTicksPosition(-1, tickWidth);
        ctx.save();
        ctx.fillStyle = tickConfig.fontColor;
        ctx.fontSize = tickConfig.fontSize;
        ctx.lineWidth = tickConfig.lineWidth;
        let titleWidth = me.calculateTitleWidth();

        if (me.isHorizontal()) {
            // Draw the first point
            if (me.box.marginLR || config.extendLeft) {
                me._drawATickLine(currX, currY, fontSize);
            }
            // Move to first tick
            currX = me.box.lx + fixPadding / 2;
            // Draw ticks
            visTicks.map((tick) => {
                currX += tick.lineWidth;
                ctx.fillStyle = tick.fontColor;
                ctx.lineWidth = tick.lineWidth;
                ctx.fontSize = tick.fontSize || ctx.fontSize;
                me._drawATickLine(currX, currY, fontSize, tick);
                currX += tickWidth;
            });
            // Draw the last point
            currX = me.box.ex - fixPadding / 2 - titleWidth;
            if (me.box.marginLR) {
                me._drawATickLine(currX, currY, fontSize);
            }

            ctx.fillStyle = tickConfig.fontColor;
            ctx.lineWidth = config.lineWidth;
            // draw axis line
            ctx.beginPath();
            ctx.moveTo(baseX, currY);
            ctx.lineTo(currX, currY);
            ctx.stroke();

            if (config.title) {
                ctx.save();
                currX += fontSize / 2;
                ctx.fontSize = config.titleFontSize;
                ctx.textAlign = 'start';
                ctx.textBaseline = 'bottom';
                ctx.fillStyle = config.titleFontColor;
                ctx.fillText(config.title, currX, currY);
                ctx.restore();
            }

        } else {
            if (config.title) {
                ctx.save();
                ctx.fontSize = config.titleFontSize;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillStyle = config.titleFontColor;
                ctx.fillText(config.title, currX, currY);
                ctx.restore();
            }

            // Draw the first point
            if (me.box.marginTB || config.extendTop) {
                currY += titleWidth;
                me._drawATickLine(currX, currY, fontSize);
            }
            currY = me.box.ly + fixPadding / 2 + titleWidth;
            // Draw ticks
            visTicks.map((tick) => {
                currY += tick.lineWidth;
                ctx.fillStyle = tick.fontColor;
                ctx.lineWidth = tick.lineWidth;
                ctx.fontSize = tick.fontSize || ctx.fontSize;
                me._drawATickLine(currX, currY, fontSize, tick);
                currY += tickWidth;
            });
            // Draw the last point
            currY = me.box.ey - fixPadding / 2;
            if (me.box.marginTB) {
                me._drawATickLine(currX, currY, fontSize);
            }

            ctx.fillStyle = tickConfig.fontColor;
            ctx.lineWidth = config.lineWidth;
            // draw axis line
            ctx.beginPath();
            ctx.moveTo(currX, baseY + titleWidth);
            ctx.lineTo(currX, currY);
            ctx.stroke();
        }
        ctx.draw();
        ctx.restore();
    }

    // Empty interface
    /**
     * Get one point by a value
     * @param {number} index - The index of category
     */
    getPoint(index) {
        return null;
    }
}
