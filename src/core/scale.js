/* global module, wx, window: false, document: false */
'use strict';

import { checkWX, is, wxConverToPx, uid, retinaScale, extend, sum, toRadians, toDegrees } from '../util/helper';
import WxCanvas from '../util/wxCanvas';
import { BoxInstance } from './layout';
import WxBaseComponent from './base'

// Scale default config
const WX_SCALE_DEFAULT_CONFIG = {
    'display': true,
    'position': 'top', // left, bottom, right, top
    "extendLeft": 0,
    "extendTop":0,
    'title': undefined,
    'titleFontSize': 15,
    //'lineSpace' = fontSize * 0.5'
    'color' : '#000000', // Line color

    'gridLines': {
        'display': true,
        'color': '#e0e0e0', // Line color
        'lineWidth': 1
    },

    'ticks': {
        'display': true,
        'autoSkip': true,
        'lineWidth': 1,
        'fontColor': '#000000',
        //'fontSize': 10,
        'minRotation': 0,
        'maxRotation': 90
    }
};

const WX_SCALE_DEFAULT_ITEM_CONFIG = {
    'display': true,
    // 'text': '',
    'lineWidth': 1,
    'fontColor': '#000000',
    //'format': undefined // format text function
};

// The WeinXin APP scale
export default class WxScale extends WxBaseComponent {
    constructor(wxChart, config) {
        super(wxChart, config);
        this.config = extend(true, {}, WX_SCALE_DEFAULT_CONFIG, config);
    }

    /**
     * Update data and re-draw
     * @param {Object[]} datasets
     * @param {BoxInstance} [area]
     * @param {Object} [defaultOptions]
     * @returns {Array} datasets
     */
    update(datasets, area, defaultOptions = WX_SCALE_DEFAULT_ITEM_CONFIG) {
        let me = this;
        let config = me.config;

        datasets = super.update(datasets, area, defaultOptions);

        me.box = area;
        me._datasets = datasets;
        if (me.isVisiable()) {
            me.ticketWidth = me.calculateTickWidth(area);
            me.box = me.calculateBox(area);
            me.draw();
        }
    }
    /**
     * Get visible ticks
     */
    getVisibleTicks() {
        return this.datasets.filter((v) => !!v.display);
    }
    /**
     * Get visible ticks' text data
     */
    getTicksTexts() {
        return this.getVisibleTicks().map((v) => v.text);
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
        let maxTextLen = 0;
        datasets.forEach(function(dataset){
            if (!!dataset.display) {
                let textWidth;
                if (dataset.textWidth) {
                    textWidth = dataset.textWidth
                } else {
                    let text = dataset.format ? dataset.format.call(dataset, dataset.text, dataset) : dataset.text;
                    textWidth = ctx.measureText(text).width;
                    dataset.textWidth = textWidth;
                }
                maxTextLen = maxTextLen < textWidth ? textWidth : maxTextLen;
            }
        });
        return maxTextLen;
    };

    /**
     * Calculate axis box
     * @param {BoxInstance} area - Current box area
     * @param {number} tickWidth
     */
    calculateBox(area, tickWidth = this.ticketWidth) {
        let me = this, ctx = me.wxChart.ctx;
        let fontSize = ctx.fontSize;
        let minWidth, minHeight;
        let minFontRotation = toRadians(me.config.ticks.minRotation||0),
            maxFontRotation = toRadians(me.config.ticks.maxRotation||90),
            fontRadians = minFontRotation;
        let lineSpace = me.lineSpace;
        let lineWidth = 1;
        let newBox;//position, x, y, width, height, outerWidth, outerHeight

        let longestText = me.longestText();
        switch (me.position) {
            case 'left':
            case 'right':
                minWidth = longestText + lineWidth + lineSpace + fontSize * 1.5;
                if (minWidth > area.width) {
                    minWidth = area.width;
                    fontRadians = Math.acos((minWidth - lineWidth - lineSpace - fontSize * 1.5) / longestText);
                    fontRadians = fontRadians > maxFontRotation ? maxFontRotation : fontRadians;
                }
                minHeight = area.height;
                newBox = new BoxInstance(me.position, area.x, area.y, minWidth, minHeight, minWidth, area.outerHeight);
                break;
            case 'top':
            case 'bottom':
                if (longestText > tickWidth) {
                    // Ticket's width not satisfied with the longest text's width
                    if (tickWidth <= ctx.fontSize) {
                        fontRadians = maxFontRotation;
                    } else {
                        fontRadians = Math.acos(tickWidth / longestText);
                        minHeight = Math.sin(fontRadians) * longestText + lineWidth + lineSpace + fontSize * 1.5;
                        if (minHeight > area.height) {
                            minHeight = area.height;
                            fontRadians = Math.asin((minHeight - lineWidth - lineSpace - fontSize * 1.5) / longestText);
                        } else if (fontRadians > maxFontRotation) {
                            fontRadians = maxFontRotation;
                            minHeight = Math.sin(fontRadians) * longestText + lineWidth + lineSpace + fontSize * 1.5;
                        }
                    }
                } else {
                    minHeight = fontSize * 1.5;
                }
                minWidth = area.width;
                newBox = new BoxInstance(me.position, area.x, area.y, minWidth, minHeight, area.outerWidth, minHeight);
                break;
        }

        me.fontRadians = fontRadians;
        return newBox;
    };

    /**
     * Calculate ticks' separation distance
     * @param {BoxInstance} [area=this.box]
     *
     *
     * Horizontal Scale:
     * x------------------------------------x(first tick)-------------------------------x(last tick)--margin--x
     * x------------------------------------x(first tick)-----x(last tick)------margin--x--titleWidth+padding--
     * |---extendLeft---|(box.x)---margin---|-----------area.width----------------------|---------margin------|
     *                  |----------------------------area box-------------------------------------------------|
     * Vertical Scale:
     * x----------------------------------------x--------(first tick)---------------x(last tick)-x
     * x------------------titleHeight+padding---x---margin-x-------(first tick)-----x(last tick)-x
     * |---extendTop----|(box.y)---margin-------|-----------area.height-------------|---margin---|
     *                  |----------------------------area box------------------------------------|
     */
    calculateTickWidth(area = this.box) {
        let me = this, ctx = me.wxChart.ctx,
            config = me.config,
            ticketWidth;
        let visTicks = me.getVisibleTicks();
        let defaultLineWidth = config.ticks.lineWidth;
        // total line width
        let totalLineWidth = sum.apply(null, visTicks.map((v) => v.lineWidth||defaultLineWidth));
        let title2Padding = ctx.fontSize;

        if (me.isHorizontal()) {
            let innerWidth = area.width,
                marginLR = area.marginLR;
            let titleWidth =
                config.title ? ctx.measureText(config.title, config.titleFontSize) + title2Padding: 0;
            let extendLeft = me.config.extendLeft;
            if (marginLR !== 0) {
                totalLineWidth += defaultLineWidth*2;
            } else if (extendLeft !== 0) {
                totalLineWidth += defaultLineWidth;
            }
            ticketWidth = (innerWidth - titleWidth - totalLineWidth) / (visTicks.length-1);
        } else {
            let innerHeight = area.height,
                marginTB = area.marginTB;
            let titleHeight = config.title ? config.titleFontSize + title2Padding : 0;
            let extendTop = config.extendTop;
            if (marginTB !== 0) {
                totalLineWidth += defaultLineWidth*2;
            } else if (extendTop !== 0) {
                totalLineWidth += defaultLineWidth;
            }
            ticketWidth = (innerHeight - titleHeight - totalLineWidth) / (visTicks.length-1);
        }
        return ticketWidth;
    }

    _getTicksLineWidthOffset(index, visTicks) {
        let offset = 0, me = this;
        if (!visTicks) {
            visTicks = me.getVisibleTicks();
        }
        let defaultLineWidth = this.config.ticks.lineWidth;
        visTicks.map((tick, i) => {
            if (index >= i) {
                offset += tick.lineWidth||defaultLineWidth;
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
    getTicksPosition(index, ticketWidth = this.ticketWidth, area = this.box) {
        let me = this, ctx = me.wxChart.ctx;
        if (!ticketWidth) {
            ticketWidth = me.calculateTickWidth(me.box);
        }
        let visTicks = me.getVisibleTicks();

        let baseX, baseY;
        if (me.isHorizontal()) {
            baseX = index === -1 ?
                area.x - me.config.extendLeft :
                area.lx + me._getTicksLineWidthOffset(index, visTicks) + (visTicks.length-1)*ticketWidth;
            baseY = me.position === 'top' ? area.ry - me.lineSpace : area.ly +  me.lineSpace;
        } else {
            let titleHeight = me.config.titleFontSize + ctx.fontSize;
            baseY = index === -1 ?
                area.y - me.config.extendTop :
                area.ly + titleHeight + me._getTicksLineWidthOffset(index, visTicks) + (visTicks.length-1)*ticketWidth;
            baseX = me.position === 'left' ? area.rx - me.lineSpace : area.lx + me.lineSpace;
        }
        return {
            x: baseX,
            y: baseY
        }
    }

    _initDrawATickText() {
        let me = this, ctx = me.wxChart.ctx;
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
        let me = this, ctx = me.wxChart.ctx;
        let lineSpace = me.lineSpace;
        let sx = x;
        let sy = y;
        switch (me.position) {
            case 'left': sx += lineSpace; break;
            case 'right': sx -= lineSpace; break;
            case 'top': sy += lineSpace; break;
            case 'bottom': sy -= lineSpace; break;
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
            text = tick.format ? tick.format.call(me, tick.text, tick, x, y, me.fontRadians) : tick.text;
            let textWidth = tick.textWidth ? tick.textWidth : ctx.measureText(text).width;
            switch (me.position) {
                case 'left':
                    ctx.translate(x - fontSize/2, y + Math.sin(me.fontRadians) * textWidth/2);
                    ctx.rotate(me.fontRadians);
                    //ctx.fillText(text, x - ctx.fontSize/2, y);
                    break;
                case 'right':
                    ctx.translate(x + fontSize/2, y + Math.sin(me.fontRadians) * textWidth/2);
                    ctx.rotate(-me.fontRadians);
                    // ctx.fillText(text, x + ctx.fontSize/2, y);
                    break;
                case 'top':
                    ctx.translate(x, y - textWidth/2);
                    ctx.rotate(-me.fontRadians);
                    break;
                case 'bottom':
                    ctx.translate(x, y + textWidth/2);
                    ctx.rotate(me.fontRadians);
                    break;
            }
            ctx.fillText(text, 0, 0);

            ctx.restore();
        }
    }
    draw() {
        let me = this, ctx = me.wxChart.ctx;
        let fontSize = ctx.fontSize;
        let config = me.config;
        let tickConfig = me.config.ticks;
        let {x, y, width, outerWidth, height, outerHeight} = me.box;
        let tickWidth = me.ticketWidth;
        let visTicks = me.getVisibleTicks();

        let {x: currX, y: currY, x: baseX, y: baseY} = me.getTicksPosition(-1, tickWidth);
        ctx.save();
        ctx.fillStyle = tickConfig.fontColor;
        ctx.lineWidth = tickConfig.lineWidth;

        if (me.isHorizontal()) {
            // Draw the first point
            me._drawATickLine(currX, currY, fontSize);
            // Move to first tick
            currX =  me.box.lx;
            // Draw ticks
            visTicks.map((tick) => {
                ctx.fillStyle = tick.fontColor;
                ctx.lineWidth = tick.lineWidth;
                ctx.fontSize = tick.fontSize||ctx.fontSize;
                me._drawATickLine(currX, currY, fontSize, tick);
                currX+= tickWidth;
            });
            // Draw the last point
            currX = me.box.ex;
            me._drawATickLine(currX, currY, fontSize);

            ctx.fillStyle = tickConfig.fontColor;
            ctx.lineWidth = tickConfig.lineWidth;
            // draw axis line
            ctx.beginPath();
            ctx.moveTo(baseX, currY);
            ctx.lineTo(currX, currY);
            ctx.stroke();

            if (config.title) {
                ctx.save();
                currX += fontSize/2;
                ctx.fontSize = config.titleFontSize;
                ctx.textAlign = 'start';
                ctx.textBaseline = 'middle';
                ctx.fillText(config.title, currX, currY);
                ctx.restore();
            }

        } else {
            if (config.title) {
                ctx.save();
                currY += fontSize/2;
                ctx.fontSize = config.titleFontSize;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(config.title, currX, currY);
                ctx.restore();
            }

            // Draw the first point
            me._drawATickLine(currX, currY, fontSize);
            // Move to first tick
            currY =  me.box.ly;
            // Draw ticks
            visTicks.map((tick) => {
                ctx.fillStyle = tick.fontColor;
                ctx.lineWidth = tick.lineWidth;
                ctx.fontSize = tick.fontSize||ctx.fontSize;
                me._drawATickLine(currX, currY, fontSize, tick);
                currY += tickWidth;
            });
            // Draw the last point
            currY = me.box.ey;
            me._drawATickLine(currX, currY, fontSize);

            ctx.fillStyle = tickConfig.fontColor;
            ctx.lineWidth = tickConfig.lineWidth;
            // draw axis line
            ctx.beginPath();
            ctx.moveTo(currX, baseY);
            ctx.lineTo(currX, currY);
            ctx.stroke();
        }
        ctx.draw();
        ctx.restore();
    }
}
