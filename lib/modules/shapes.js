import { Vertex } from './vertex-transform.js';
import { Color } from './color.js';
import { Polygon, CurvedShape } from './mobject.js';
export class Circle extends CurvedShape {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            midpoint: Vertex.origin(),
            radius: 10
        });
    }
    updateModel(argsDict = {}) {
        let r = argsDict['radius'] || this.radius;
        let a = argsDict['anchor'];
        if (a != undefined) {
            argsDict['midpoint'] = a.translatedBy(r, r);
        }
        else {
            let m = argsDict['midpoint'] || this.midpoint;
            argsDict['anchor'] = m.translatedBy(-r, -r);
        }
        argsDict['viewWidth'] = 2 * r;
        argsDict['viewHeight'] = 2 * r;
        super.updateModel(argsDict);
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
        // do NOT update the view, because redraw calls updateBezierPoints
    }
}
export class TwoPointCircle extends Circle {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            strokeColor: Color.white(),
            fillColor: Color.white(),
            fillOpacity: 0,
            outerPoint: Vertex.origin()
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.view.style['pointer-events'] = 'none';
    }
    updateModel(argsDict = {}) {
        let p = argsDict['midpoint'] || this.midpoint;
        let q = argsDict['outerPoint'] || this.outerPoint;
        let r = p.subtract(q).norm();
        argsDict['radius'] = r;
        super.updateModel(argsDict);
    }
}
export class Ellipse extends CurvedShape {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            majorAxis: 200,
            minorAxis: 100,
            tilt: 0
        });
    }
}
export class Rectangle extends Polygon {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            width: 100,
            height: 100,
            p1: Vertex.origin(),
            p2: Vertex.origin(),
            p3: Vertex.origin(),
            p4: Vertex.origin()
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.vertices = [this.p1, this.p2, this.p3, this.p4];
    }
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
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
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            cornerRadius: 10,
            p1: Vertex.origin(),
            p2: Vertex.origin(),
            p3: Vertex.origin(),
            p4: Vertex.origin()
        });
    }
    updateBezierPoints() {
        try {
            let r = Math.min(this.cornerRadius, Math.min(this.width, this.height) / 2);
            this.p2.x = this.width;
            this.p3.x = this.width;
            this.p3.y = this.height;
            this.p4.y = this.height;
            let p11 = this.p1.translatedBy(0, r);
            let p12 = this.p1.translatedBy(r, 0);
            let p21 = this.p2.translatedBy(-r, 0);
            let p22 = this.p2.translatedBy(0, r);
            let p31 = this.p3.translatedBy(0, -r);
            let p32 = this.p3.translatedBy(-r, 0);
            let p41 = this.p4.translatedBy(r, 0);
            let p42 = this.p4.translatedBy(0, -r);
            this.bezierPoints = [
                p12, p21,
                p12, p21, this.p2,
                this.p2, p22, p31,
                p22, p31, this.p3,
                this.p3, p32, p41,
                p32, p41, this.p4,
                this.p4, p42, p11,
                p42, p11, this.p1,
                this.p1, p12
            ];
        }
        catch (_a) { }
    }
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
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