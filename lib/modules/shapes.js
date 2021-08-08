import { Vertex, Transform } from './vertex-transform.js';
import { Polygon, CurvedShape } from './mobject.js';
import { TAU } from './math.js';
export class Circle extends CurvedShape {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this._radius = 50;
        this.anchor = new Vertex(-this.radius, -this.radius);
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    get midpoint() { return this.anchor.translatedBy(this.radius, this.radius); }
    set midpoint(newValue) {
        if (this.radius === undefined) {
            this.radius = 0;
        }
        this.anchor = newValue.translatedBy(-this.radius, -this.radius);
    }
    get radius() { return this._radius; }
    set radius(newValue) {
        if (this.anchor == undefined) {
            this.midpoint = new Vertex(newValue, newValue);
        }
        let oldMidpoint = this.midpoint;
        this._radius = newValue;
        this.midpoint = oldMidpoint; // this moves the anchor so that the midpoint stays the same
    }
    updateSelf(args = {}) {
        let r = args['radius'] || this.radius;
        args['viewWidth'] = 2 * r;
        args['viewHeight'] = 2 * r;
        super.updateSelf(args);
    }
    updateBezierPoints() {
        let newBezierPoints = [];
        let n = 8;
        for (let i = 0; i <= n; i++) {
            let theta = i / n * 2 * Math.PI;
            let d = this.radius * 4 / 3 * Math.tan(Math.PI / (2 * n));
            let radialUnitVector = new Vertex(Math.cos(theta), Math.sin(theta));
            let tangentUnitVector = new Vertex(-Math.sin(theta), Math.cos(theta));
            let anchorPoint = radialUnitVector.scaledBy(this.radius);
            let leftControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(-d));
            let rightControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(d));
            if (i != 0) {
                newBezierPoints.push(leftControlPoint);
            }
            newBezierPoints.push(anchorPoint);
            if (i != n) {
                newBezierPoints.push(rightControlPoint);
            }
        }
        let translatedBezierPoints = [];
        for (let i = 0; i < newBezierPoints.length; i++) {
            translatedBezierPoints.push(newBezierPoints[i].translatedBy(this.radius, this.radius));
        }
        this.bezierPoints = translatedBezierPoints;
    }
}
export class TwoPointCircle extends Circle {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.outerPoint = Vertex.origin();
        this.fillOpacity = 0;
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.view.style['pointer-events'] = 'none';
    }
    updateSelf(args = {}) {
        let p = args['midpoint'] || this.midpoint;
        let q = args['outerPoint'] || this.outerPoint;
        let r = p.subtract(q).norm();
        args['radius'] = r;
        super.updateSelf(args);
    }
}
export class Ellipse extends CurvedShape {
    constructor(args = {}) {
        super(args);
        this.majorAxis = 200;
        this.minorAxis = 100;
        this.tilt = 0;
    }
}
export class Rectangle extends Polygon {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.width = 200;
        this.height = 100;
        this.p1 = Vertex.origin();
        this.p2 = new Vertex(this.width, 0);
        this.p3 = new Vertex(this.width, this.height);
        this.p4 = new Vertex(0, this.height);
        this.vertices = [this.p1, this.p2, this.p3, this.p4];
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    updateSelf(args = {}) {
        super.updateSelf(args);
        //// internal dependencies
        this.viewWidth = this.width;
        this.viewHeight = this.height;
        this.p2.x = this.width;
        this.p3.x = this.width;
        this.p3.y = this.height;
        this.p4.y = this.height;
    }
}
export class RoundedRectangle extends CurvedShape {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.width = 200;
        this.height = 100;
        this.cornerRadius = 10;
        this.p1 = Vertex.origin();
        this.p2 = Vertex.origin();
        this.p3 = Vertex.origin();
        this.p4 = Vertex.origin();
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    quarterArc() {
        let arr = [];
        let n = 4;
        for (let i = 0; i <= n; i++) {
            let theta = i / n * TAU / 4;
            let d = this.cornerRadius * 4 / 3 * Math.tan(TAU / (4 * n)) * 0.25;
            let radialUnitVector = new Vertex(Math.cos(theta), Math.sin(theta));
            let tangentUnitVector = new Vertex(-Math.sin(theta), Math.cos(theta));
            let anchorPoint = radialUnitVector.scaledBy(this.cornerRadius);
            let leftControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(-d));
            let rightControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(d));
            if (i != 0) {
                arr.push(leftControlPoint);
            }
            arr.push(anchorPoint);
            if (i != n) {
                arr.push(rightControlPoint);
            }
        }
        return arr;
    }
    updateBezierPoints() {
        let arc = this.quarterArc();
        let w = this.width;
        let h = this.height;
        let r = this.cornerRadius;
        let t1 = new Transform({ angle: 0, shift: new Vertex(w - r, h - r) });
        let arc1 = t1.appliedToVertices(arc);
        let t2 = new Transform({ angle: TAU / 4, shift: new Vertex(r, h - r) });
        let arc2 = t2.appliedToVertices(arc);
        let t3 = new Transform({ angle: TAU / 2, shift: new Vertex(r, r) });
        let arc3 = t3.appliedToVertices(arc);
        let t4 = new Transform({ angle: 3 / 4 * TAU, shift: new Vertex(w - r, r) });
        let arc4 = t4.appliedToVertices(arc);
        var arr = [];
        arr = arr.concat(arc1);
        arr = arr.concat([new Vertex(r, h), new Vertex(w - r, h)]);
        arr = arr.concat(arc2);
        arr = arr.concat([new Vertex(0, r), new Vertex(0, h - r)]);
        arr = arr.concat(arc3);
        arr = arr.concat([new Vertex(w - r, 0), new Vertex(r, 0)]);
        arr = arr.concat(arc4);
        arr = arr.concat([new Vertex(w, h - r), new Vertex(w, r)]);
        arr.push(arc1[0]);
        this.bezierPoints = arr;
    }
    updateSelf(args = {}) {
        // check if corner radius is not too large
        let cr = args['cornerRadius'] || this.cornerRadius;
        let w = args['width'] || this.width;
        let h = args['height'] || this.height;
        let r = Math.min(cr, Math.min(w, h) / 2);
        args['cornerRadius'] = r;
        super.updateSelf(args);
        //// internal dependencies
        this.viewWidth = this.width;
        this.viewHeight = this.height;
        this.p2.x = this.width;
        this.p3.x = this.width;
        this.p3.y = this.height;
        this.p4.y = this.height;
    }
}
//# sourceMappingURL=shapes.js.map