/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';
import { is, checkWX, wxConverToPx, extend } from '../src/util/helper'
import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import { createWXEnv, initCanvasElement, destoryCanvasElement, getCanvas, getRealCanvas, getVersionAsArray } from './createWXEnv'

const CHECK_WXPROP_CANUSE = function (propName, wxfn, browserfn) {
    if ( __GLOBAL__DEBUG__WX__ === true) {
        if (is.String(propName)) propName = [propName];
        if (propName.some((pn) => wx.canIUse('canvasContext.' + pn))) {
            wxfn();
        }
    } else {
        browserfn ? browserfn() : wxfn();
    }
};

const CHECK_WXPROP_CANNOTUSE = function (propName, wxfn, browserfn) {
    if ( __GLOBAL__DEBUG__WX__ === true) {
        if (is.String(propName)) propName = [propName];
        if (!propName.some((pn) => wx.canIUse('canvasContext.' + pn))) {
            wxfn();
        }
    } else {
        browserfn ? browserfn() : wxfn();
    }
};



describe('Util wxCanvas', () => {
    let isWX = checkWX();
    beforeEach(() => {
        createWXEnv();
        initCanvasElement();
    });

    it('Create canvas object', () => {
        let { wxCanvas, wxCanvasContext } = getCanvas();
        expect(wxCanvas).to.be.an.instanceOf(WxCanvas);
        expect(wxCanvasContext).to.be.an.instanceOf(WxCanvasRenderingContext2D);
    });

    it('Create defualt canvas object ', () => {
        let { wxCanvas, wxCanvasContext } = getCanvas('myCanvas', {
            width: 300,
            height: 200
        });
		assert.equal(wxCanvas.height, 200);
		assert.equal(wxCanvas.width, 300);
    });


    it('Check canvas context: height, width', () => {
        let { wxCanvas, wxCanvasContext } = getCanvas();
        assert.equal(wxCanvas.height, 500);
        assert.equal(wxCanvas.width, 800);
    });

    it('Check canvas context: style property', () => {
        let color = "#DBA9FF", lineCap = 'round';
        let {wxCanvas, wxCanvasContext} = getCanvas();
        let {realCanvas, realContext} = getRealCanvas();

        // fillStyle
        wxCanvasContext.fillStyle = color;
        assert.equal(wxCanvasContext.fillStyle.toUpperCase(), color);
        CHECK_WXPROP_CANUSE(['fillStyle', 'setFillStyle'], function() {
            assert.equal(realContext.fillStyle.toUpperCase(), color);
        });

        // strokeStyle
        wxCanvasContext.strokeStyle = color;
        assert.equal(wxCanvasContext.strokeStyle.toUpperCase(), color);
        CHECK_WXPROP_CANUSE(['strokeStyle', 'setStrokeStyle'], function() {
            assert.equal(realContext.strokeStyle.toUpperCase(), color);
        });

    });

    it('Check canvas context: shadow property', () => {
        let shadowOffsetX = 5, shadowOffsetY = 0;
        let shadowColor = 'DBA9FF';
        let {wxCanvas, wxCanvasContext} = getCanvas();
        let {realCanvas, realContext} = getRealCanvas();

        wxCanvasContext.save();
        wxCanvasContext.shadowOffsetX = shadowOffsetX;
        wxCanvasContext.shadowOffsetY = shadowOffsetY;

        assert.equal(wxCanvasContext.shadowOffsetX, shadowOffsetX, 'Set shadowOffsetX error');
        assert.equal(realContext.shadowOffsetY, shadowOffsetY, 'Set shadowOffsetY error');
        wxCanvasContext.restore();

        wxCanvasContext.shadowColor = shadowColor;
        assert.equal(wxCanvasContext.shadowOffsetX, 0, 'Restore shadowOffsetX error');
        assert.equal(wxCanvasContext.shadowColor, shadowColor);
    });

    it('Check canvas context: font property', () => {
        let {wxCanvas, wxCanvasContext} = getCanvas();
        let {realCanvas, realContext} = getRealCanvas();
        // font
        wxCanvasContext.font = '40px Arial';
        assert.equal(wxCanvasContext.fontSize, 40);
        assert.equal(wxCanvasContext.font, '40px Arial');

        // font size
        wxCanvasContext.fontSize = '30px';
        assert.equal(wxCanvasContext.fontSize, 30);
        assert.equal(wxCanvasContext.font, '30px Arial');
    });

    it('Check canvas context: line property', () => {
        let lineCap = 'round', lineJoin = 'round', miterLimit = 2, lineWidth = 10;
        let lineDashOffset = 1.1;
        let {wxCanvas, wxCanvasContext} = getCanvas();
        let {realCanvas, realContext} = getRealCanvas();

        wxCanvasContext.lineCap = lineCap;
        assert.equal(wxCanvasContext.lineCap, lineCap);
        assert.equal(realContext.lineCap, lineCap);

        wxCanvasContext.lineJoin = lineJoin;
        assert.equal(wxCanvasContext.lineCap, lineJoin);
        assert.equal(realContext.lineCap, lineJoin);

        wxCanvasContext.miterLimit = miterLimit;
        assert.equal(wxCanvasContext.miterLimit, miterLimit);
        assert.equal(realContext.miterLimit, miterLimit);

        wxCanvasContext.lineWidth = lineWidth;
        assert.equal(wxCanvasContext.lineWidth, lineWidth);
        assert.equal(realContext.lineWidth, lineWidth);
    });

    it('Check canvas context: lineDash', () => {
        let lineDash = [10, 20], lineDashOffset = 5;
        let {wxCanvas, wxCanvasContext} = getCanvas();
        let {realCanvas, realContext} = getRealCanvas();

        wxCanvasContext.lineDashOffset = lineDashOffset;
        assert.equal(wxCanvasContext.lineDashOffset, lineDashOffset);
        CHECK_WXPROP_CANUSE('lineDashOffset', function() {
            assert.equal(realContext.lineDashOffset, lineDashOffset);
        });

        wxCanvasContext.setLineDash(lineDash);
        assert.equal(wxCanvasContext.lineDashOffset, lineDashOffset, 'setLineDash change the lineDashOffset');
        CHECK_WXPROP_CANUSE('lineDashOffset', function() {
            assert.equal(realContext.lineDashOffset, lineDashOffset, 'setLineDash change the lineDashOffset');
        });

        wxCanvasContext.lineDashOffset = 4;
        assert.equal(wxCanvasContext.lineDashOffset, 4);
        CHECK_WXPROP_CANUSE('lineDashOffset', function() {
            assert.equal(realContext.lineDashOffset, 4);
        });

    });

    it('Check canvas context: Rect', () => {

    });

    it('Check canvas context: Gradient', () => {

    });

    it('Check canvas context: Path', () => {

    });

    it('Check canvas context: Translate and Transform', () => {

    });

    it('Check canvas context: GlobalAlpha and GlobalCompositeOperation', () => {

    });

    it('Check canvas context: Image', () => {

    });

    it('Check canvas context: save and restore', () => {
        let color = "#DBA9FF", lineCap = 'round';
        let { wxCanvas, wxCanvasContext } = getCanvas();
        let { realCanvas, realContext } = getRealCanvas();

        // fillStyle
        wxCanvasContext.fillStyle = color;
        wxCanvasContext.lineCap = lineCap;
        wxCanvasContext.save();

        // 'save' function will inherit 'Drawing state'
        assert.equal(wxCanvasContext.fillStyle.toUpperCase(), color);
        assert.equal(realContext.fillStyle.toUpperCase(), color);
        expect(wxCanvasContext._propertyCache).to.have.lengthOf(2);

        let changeColor = '#FFA9FF';
        wxCanvasContext.fillStyle = changeColor;
        assert.equal(wxCanvasContext.fillStyle.toUpperCase(), changeColor);
        assert.equal(realContext.fillStyle.toUpperCase(), changeColor);

        wxCanvasContext.restore();
        assert.equal(wxCanvasContext.fillStyle.toUpperCase(), color);
        assert.equal(wxCanvasContext.lineCap, lineCap);
        assert.equal(realContext.fillStyle.toUpperCase(), color);
        assert.equal(realContext.lineCap, lineCap);
        expect(wxCanvasContext._propertyCache).to.have.lengthOf(1);

        wxCanvasContext.restore();
        expect(wxCanvasContext._propertyCache).to.have.lengthOf(1);
    });

    it('Check canvas context: measureText', () => {
        let text = 'text',
            textZH = '测试';
        let { wxCanvas, wxCanvasContext } = getCanvas();
        let { realCanvas, realContext } = getRealCanvas();
        // The browser minimum font size is 12
        if ( __GLOBAL__DEBUG__WX__ ) {
            if (wx.canIUse('canvasContext.measureText')) {
                assert.equal(wxCanvasContext.measureText(text).width,
                    realContext.measureText(text).width,
                    'measureText equal in normal ' + text);
            } else {
                assert.equal(wxCanvasContext.measureText(text).width,
                    wxCanvasContext._measureTextWidth(text),
                    'measureText equal in normal ' + text);

                assert.equal(wxCanvasContext.measureText(textZH).width,
                    wxCanvasContext._measureTextWidth(textZH),
                    'measureText equal in normal ' + textZH);
            }

        } else {
            let rw = realContext.measureText('text').width;
            assert.equal(wxCanvasContext.measureText('text').width, rw, 'measureText error in browser');
        }
    });

    it('Check canvas context: Draw text', () => {
        let text = 'text', textAlign = 'start', textBaseline = 'alphabetic';
        let { wxCanvas, wxCanvasContext } = getCanvas();
        let { realCanvas, realContext } = getRealCanvas();

        assert.equal(wxCanvasContext.textAlign, realContext.textAlign);
        assert.equal(wxCanvasContext.textBaseline, realContext.textBaseline);


        if ( __GLOBAL__DEBUG__WX__ ) {
            // fontSize = 10, textBaseline = alphabetic
            assert.equal(wxCanvasContext.textBaseline,
                'alphabetic',
                'textBaseline initialize error');
            assert.equal(wxCanvasContext._calculateYForTextBaseline(0, text), 0,
                'calculate Y at fontSize = 10, textBaseline = alphabetic');

            // Set textBaseline = middle
            wxCanvasContext.textBaseline = 'middle';
            assert.equal(wxCanvasContext.textBaseline,
                'middle',
                'textBaseline set to middle error');
            CHECK_WXPROP_CANUSE(['textBaseline', 'setTextBaseline'], function() {
                expect(realContext.textBaseline).to.equal('middle');
            });

            // Set textBaseline = top
            wxCanvasContext.textBaseline = 'top';
            CHECK_WXPROP_CANUSE(['textBaseline', 'setTextBaseline'], function() {
                expect(realContext.textBaseline).to.equal('top');
            });

        }

        wxCanvasContext.fillText(text, 0, 0);

        // Set textAlign = end
        wxCanvasContext.textAlign = 'end';
        expect(wxCanvasContext.textAlign).to.equal('end');
        if (isWX && wx.canIUse('canvasContext.setTextAlign')) {
            expect(realContext.textAlign).to.equal('right');
        } else {
            expect(realContext.textAlign).to.equal('end');
        }


        wxCanvasContext.textAlign = 'center';
        expect(realContext.textAlign).to.equal('center');

        wxCanvasContext.fillText('text', 0, 12);
    });

    afterEach(() => {
        destoryCanvasElement();
    })
});