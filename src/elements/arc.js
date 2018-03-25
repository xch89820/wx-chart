/**
 * Created by xu.chenhui on 2017/11/08.
 */

import {extend, is} from '../util/helper'
import WxElement from '../core/element'

let WX_ARC_CONFIG = {
    //backgroundColor: '#fff',
    //backgroundAlpha: 0.8,
    borderColor: '#000',
    borderWidth: 1,
    touch: {}
};
/**
 * The rectangle element
 */
export default class WxArcElement extends WxElement {
    constructor(x, y, options) {
        super(x, y);

        let me = this;
        me.options = extend({}, WX_ARC_CONFIG, options);

        let { startAngle, angle, radius, innerRadius } = me.options;
        me.angle = angle;
        me.startAngle = startAngle||0;
        me.radius = radius;
        me.innerRadius = innerRadius||0;
    }

    get endAngle() {
        return this.startAngle + this.angle;
    }

    get padding() {
        let { borderWidth } = this.options;
        return borderWidth * 3;
    }

    inXRange(mouseX) {
        let { x, radius } = this;
        return (Math.pow(mouseX - x, 2) < Math.pow(radius, 2));
    }
    inYRange(mouseY) {
        let { y, radius } = this;
        return (Math.pow(mouseY - y, 2) < Math.pow(radius, 2));
    }
    inRange(mouseX, mouseY) {
        let { borderWidth, borderColor, backgroundColor } = this.options;
        let { x, y, angle, startAngle, radius, innerRadius } = this;

        // calculate angle
        let xDis = mouseX - x,
            yDis = mouseY - y;
        let pointDis = Math.sqrt(Math.pow(xDis, 2) + Math.pow(yDis, 2));
        let pointAngle = Math.atan2(yDis, xDis);
        if (pointAngle < (-0.5 * Math.PI)) {
            pointAngle += 2.0 * Math.PI; // make sure the returned angle is in the range of (-PI/2, 3PI/2]
        }

        // Sanitise angle range
        let endAngle = startAngle + angle;
        while (endAngle < startAngle) {
            endAngle += 2.0 * Math.PI;
        }
        while (pointAngle > endAngle) {
            pointAngle -= 2.0 * Math.PI;
        }
        while (pointAngle < startAngle) {
            pointAngle += 2.0 * Math.PI;
        }

        return ((pointAngle >= startAngle && pointAngle <= endAngle) && (pointDis >= innerRadius && pointDis <= radius));
    }
    tooltipPosition(mouseX, mouseY) {
        return { x: mouseX, y: mouseY, padding: this.padding };
    }
    draw(ctx, protect = false) {
        let me = this;
        let { borderWidth, borderColor, backgroundColor } =  me.options;
        let { x, y, startAngle, endAngle, radius, innerRadius } = me;

        if (protect) ctx.save();

        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.arc(x, y, innerRadius, endAngle, startAngle, true);

        ctx.closePath();

        if (backgroundColor) {
            ctx.fillStyle = backgroundColor;
            ctx.fill();
        }
        if (borderColor) ctx.strokeStyle = borderColor;
        if (borderWidth) {
            ctx.lineJoin = 'bevel';
            ctx.stroke();
        }

        if (protect) ctx.restore();
    }
    clear(ctx, fillColor = '#ffffff', protect = false) {
        let me = this;
        let { borderWidth, backgroundColor } =  me.options;
        let { x, y, startAngle, endAngle, radius, innerRadius } = me;

        if (protect) ctx.save();

        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.arc(x, y, innerRadius, endAngle, startAngle, true);

        ctx.closePath();

        if (backgroundColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
        if (borderWidth) {
            ctx.strokeStyle = fillColor;
            ctx.lineJoin = 'bevel';
            ctx.stroke();
        }

        if (protect) ctx.restore();
    }
}