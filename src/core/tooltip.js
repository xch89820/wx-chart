/* global module, wx, window: false, document: false */
'use strict';

import {extend, is, wrapText} from '../util/helper'
import {BoxInstance} from './layout';
import WxBaseComponent from './base';

// Legend default config
const WX_TOOLTIP_DEFAULT_CONFIG = {
    display: true,
    backgroundColor: '#000000',
    titleFontSize: 13,
    titleLineHeight: 13,
    titleFontColor: '#ffffff',
    titleUnderline: true,
    titleUnderlineWidth: 1,
    titleUnderlineColor: '#dde8ff',
    fontSize: 11,
    fontLineHeight: 15,
    fontColor: '#ffffff',
    padding: 10,
    cornerRadius: 5,
    lineSpace: 7,
    width: 'auto',
    opacity: 0.8,
    changeLine: '</br>'
};

export default class WxToolTip extends WxBaseComponent {
    constructor(wxChart, config) {
        super(wxChart, config);
        this.config = extend(true, {}, WX_TOOLTIP_DEFAULT_CONFIG, config);

        // Save the title and content layout information
        this._layout = null;
        this.shown = false;
    }

    /**
     * Get visible ticks
     */
    get visDatasets() {
        return this.datasets;
    }

    /**
     * Initialize datasets and options
     * @param {string|Object} datasets - Tooltip text and content
     */
    init(datasets) {
        let me = this;

        let info = {};
        if (is.Undefined(datasets) || is.Null(datasets)) {
            datasets = me.datasets;
            if (!datasets) {
                throw new Error('Datasets is null');
            }
        }
        if (is.Object(datasets)) {
            info.text = datasets.text;
            info.title = datasets.title;
        } else if (is.String(datasets)) {
            info.title = datasets;
        } else {
            throw new Error('Must has text');
        }

        me._datasets = info;
        me._visDatasets = null;
        return info;
    }

    /**
     * Calculate occupied space
     * @param {Object[]} [datasets] - datasets
     * @param {BoxInstance} [area] - Current box area
     * @param {Object} [config]
     * @returns {BoxInstance}
     */
    calculateBox(area, datasets = this.datasets, config = this.config) {
        let me = this,
            canvas = me.wxChart.canvas,
            ctx = me.wxChart.ctx;
        me._layout = null;

        let { text, title } = datasets;

        let { width, height, padding,
            titleFontSize, titleLineHeight,
            fontSize, fontLineHeight,
            titleUnderline, titleUnderlineWidth,
            lineSpace, changeLine } = config;
        let { width: canvasWidth, height: canvasHeight } = canvas;
        let titleLineCount = 1, contentLineCount = 0;

        // Title size calculate
        let titleWidth = 0, contentWidth = 0;
        let titleHeight = 0, contentHeight = 0;
        let titleTextWidth = ctx.measureTextByFontSize(title, titleFontSize).width;

        if (is.Number(width)) {
            titleWidth = width - padding*2;
            if (titleWidth > 0) {
                titleLineCount = Math.ceil(titleTextWidth / titleWidth);
            } else {
                // No space to render text, so auto-size it
                console.warn('No space to render tooltip\'s title!');
                width = 'auto';
            }
        }

        if (width === 'auto' || width < 0) {
            let maxCanvasWidth = canvasWidth / 2;
            if (maxCanvasWidth < titleTextWidth) {
                // Title too long
                titleLineCount = Math.ceil(titleTextWidth / maxCanvasWidth);
                titleWidth = maxCanvasWidth;
            } else {
                titleLineCount = 1;
                titleWidth = titleTextWidth;
            }
        }
        titleHeight = titleLineCount * titleLineHeight;


        // Content size calculate
        if (text && text.length) {
            let changeLineMLen = changeLine.length;
            // Change Line Mark
            if (is.String(changeLine)) changeLine = new RegExp(changeLine, 'g');
            else throw new Error('ChangeLine has to a string or Regexp');

            // Do filter
            text = text.replace(new RegExp('^' +changeLine), '');
            // Calculate real content width
            let res,
                calText = text.replace(changeLine, '');
            let oneLineTextWidth = ctx.measureTextByFontSize(calText, fontSize).width;
            contentWidth = oneLineTextWidth > titleWidth * 2 ? titleWidth * 2 : oneLineTextWidth;
            contentLineCount = Math.ceil(oneLineTextWidth / contentWidth);

            // Content width
            let lastChangeIndex = 0, ccount = 0, clNum = 0, autoMaxWidth = 0;
            while ((res = changeLine.exec(text)) != null) {
                //let index = changeLine.lastIndex - (clNum+1) * changeLineMLen;
                let index = changeLine.lastIndex - changeLineMLen;
                let charsWidth = ctx.measureTextByFontSize(
                    text.slice(lastChangeIndex, index)
                    , fontSize
                ).width;
                if (charsWidth % contentWidth) {
                    autoMaxWidth = charsWidth < contentWidth ? Math.max(charsWidth, autoMaxWidth) : contentWidth;
                    ccount += Math.ceil(charsWidth / contentWidth);
                } else if (index) {
                    autoMaxWidth = contentWidth;
                }
                lastChangeIndex = changeLine.lastIndex;
                clNum++;
            }
            if (lastChangeIndex < text.length) {
                ccount ++;
            }
            // Content line count
            contentLineCount = Math.max(contentLineCount, ccount);
            if (autoMaxWidth < contentWidth && autoMaxWidth > titleWidth) {
                contentWidth = autoMaxWidth;
            }

            // Content height
            contentHeight = contentLineCount * fontLineHeight;
        }

        let totalHeight = (padding||0)*2 + titleHeight +
            (text && text.length ?
                (titleUnderline ? (lineSpace*2 + titleUnderlineWidth + contentHeight) : contentHeight)
            : 0);
        let totalWidth = (padding||0)*2.5 + Math.max(contentWidth, titleWidth);
        if (contentWidth > titleWidth) {
            // Fix title width
            titleLineCount = Math.ceil(titleTextWidth / contentWidth);
        }

        me._layout = {
            titleWidth, titleHeight, titleLineCount,
            contentWidth, contentHeight, contentLineCount
        };

        return new BoxInstance(
            area.position,
            area.x,
            area.y,
            totalWidth,
            totalHeight,
            totalWidth,
            totalHeight
        );
    }

    /**
     * Draw the component
     *
     * @param {Object[]} [datasets] - datasets
     * @param {BoxInstance} [box] - Current box area
     * @param {Object} [config]
     */
    draw(datasets = this.datasets, box = this.box, config = this.config) {
        let me = this,
            canvas = me.wxChart.canvas,
            ctx = this.wxChart.ctx;
        let { title, text } = me.datasets;
        let { titleLineCount, contentLineCount, titleHeight, contentHeight } = me._layout;
        let { x, y, outerWidth, outerHeight } = box;
        let { backgroundColor, padding,
            titleFontSize, titleLineHeight, titleFontColor,
            titleUnderline, titleUnderlineWidth, titleUnderlineColor, lineSpace,
            fontSize, fontLineHeight, fontColor,
            opacity, cornerRadius } = config;
        let tipWidth = outerWidth - padding*2;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = backgroundColor;
        // Draw background
        me.drawRoundedRectangle(ctx, x ,y, outerWidth-1, outerHeight, cornerRadius);
        ctx.fill();

        // Draw title
        let titleX = x + padding,
            titleY = y + padding;
        ctx.fillStyle = titleFontColor;
        ctx.textBaseline = 'middle';
        ctx.fontSize = titleFontSize;
        wrapText(ctx, title, titleX, titleY + titleLineHeight/2, outerWidth, titleLineHeight);

        if (text && text.length) {
            let lineX, lineY;
            if (titleUnderline) {
                // Draw line
                lineX = titleX;
                lineY = titleY + titleHeight + lineSpace;
                ctx.lineWidth = titleUnderlineWidth;
                ctx.strokeStyle = titleUnderlineColor;
                ctx.beginPath();
                ctx.moveTo(lineX, lineY);
                ctx.lineTo(lineX + outerWidth - padding*2, lineY);
                ctx.stroke();
            }

            // Draw content
            let contentX = lineX,
                contentY = lineY + lineSpace + (titleUnderline?titleUnderlineWidth:0);
            ctx.fillStyle = fontColor;
            ctx.fontSize = fontSize;
            wrapText(ctx, text, contentX, contentY + fontLineHeight/2, outerWidth, fontLineHeight);
        }

        ctx.draw();
        ctx.restore();

        me.shown = true;
    }

    clear() {
        if (this.shown) {
            super.clear();
            this.shown = false;
        }
    }

    drawRoundedRectangle(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}