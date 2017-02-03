/* global module, wx, window: false, document: false, describe, it, assert, wx */
'use strict';
import { is, wxConverToPx, extend } from '../src/util/helper'
import WxCanvas, { WxCanvasRenderingContext2D } from '../src/util/wxCanvas'
import { createWXEnv, initCanvasElement, destoryCanvasElement, getCanvas, getRealCanvas } from './createWXEnv'

describe('Util wxCanvas', () => {
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

    it('Check canvas context: set prototype', () => {
	    let color = "#DBA9FF", lineCap = 'round';
        let { wxCanvas, wxCanvasContext } = getCanvas();
        let { realCanvas, realContext } = getRealCanvas();

        // fillStyle
        wxCanvasContext.fillStyle = color;
        assert.equal(wxCanvasContext.fillStyle.toUpperCase(), color);
        assert.equal(realContext.fillStyle.toUpperCase(), color);

        // lineCap
        wxCanvasContext.lineCap = lineCap;
        assert.equal(wxCanvasContext.lineCap, lineCap);
        assert.equal(realContext.lineCap, lineCap);

        // font
        wxCanvasContext.font = '40px Arial';
        assert.equal(wxCanvasContext.fontSize, 40);
        assert.equal(wxCanvasContext.font, '40px Arial');

        // font size
        wxCanvasContext.fontSize = '30px';
        assert.equal(wxCanvasContext.fontSize, 30);
        assert.equal(wxCanvasContext.font, '30px Arial');
    });

    it('Check canvas context: save and restore', () => {
        let color = "#DBA9FF", lineCap = 'round';
        let { wxCanvas, wxCanvasContext } = getCanvas();
        let { realCanvas, realContext } = getRealCanvas();

        // fillStyle
        wxCanvasContext.fillStyle = color;
        wxCanvasContext.lineCap = lineCap;
        wxCanvasContext.save();

        assert.equal(wxCanvasContext.fillStyle.toUpperCase(), '#000000');
        //assert.equal(wxCanvasContext.lineCap, 'butt');
        assert.equal(realContext.fillStyle.toUpperCase(), color);
        //assert.equal(realContext.lineCap, 'butt');
        expect(wxCanvasContext._propertyCache).to.have.lengthOf(2);

        wxCanvasContext.restore();
        assert.equal(wxCanvasContext.fillStyle.toUpperCase(), color);
        assert.equal(wxCanvasContext.lineCap, lineCap);
        assert.equal(realContext.fillStyle.toUpperCase(), color);
        assert.equal(realContext.lineCap, lineCap);
        expect(wxCanvasContext._propertyCache).to.have.lengthOf(1);

        wxCanvasContext.restore();
        expect(wxCanvasContext._propertyCache).to.have.lengthOf(1);
    });

    it('Check canvas context: Draw text', () => {
        let textAlign = "start", textBaseline = 'alphabetic';
        let { wxCanvas, wxCanvasContext } = getCanvas();
        let { realCanvas, realContext } = getRealCanvas();

        assert.equal(wxCanvasContext.textAlign, realContext.textAlign);
        assert.equal(wxCanvasContext.textBaseline, realContext.textBaseline);

        // The browser minimum font size is 12
        assert.equal(wxCanvasContext.measureText('text').width,
            wxCanvasContext.fontSize*2+wxCanvasContext.fontSize/2,
            'measureText equal in normal text');

        // fontSize = 10, textBaseline = alphabetic
        assert.equal(wxCanvasContext._calculateYForTextBaseline(0, 'text'), 0,
            'calculate Y at fontSize = 10, textBaseline = alphabetic');

        // Set textBaseline = middle
        wxCanvasContext.textBaseline = 'middle';
        expect(realContext.textBaseline).to.equal('alphabetic');
        assert.equal(wxCanvasContext._calculateYForTextBaseline(0, 'text'), 4.5,
            'calculate Y at fontSize = 10, textBaseline = middle');

        // Set textBaseline = top
        wxCanvasContext.textBaseline = 'top';
        expect(realContext.textBaseline).to.equal('alphabetic');
        assert.equal(wxCanvasContext._calculateYForTextBaseline(0, 'text'), 9,
            'calculate Y at fontSize = 10, textBaseline = top');

        wxCanvasContext.fillText('text', 0, 0);

        // Set textAlign = end
        wxCanvasContext.textAlign = 'end';
        expect(realContext.textAlign).to.equal('start');
        assert.equal(wxCanvasContext._calculateXFortextAlign(0, 'text'), -25,
            'calculate X at fontSize = 10, textAlign = end');

        // Set textAlign = middle
        wxCanvasContext.textAlign = 'center';
        expect(realContext.textAlign).to.equal('start');
        assert.equal(wxCanvasContext._calculateXFortextAlign(0, 'text'), -12.5,
            'calculate X at fontSize = 10, textAlign = end');

        wxCanvasContext.fillText('text', 0, 12);
    });

    afterEach(() => {
        destoryCanvasElement();
    })
});