import { Point } from './../creations/Point.js';
import { Vertex } from '../helpers/Vertex.js';
import { Arrow } from '../arrows/Arrow.js';
import { Circle } from '../shapes/Circle.js';
export class IntersectionPoint extends Point {
    constructor() {
        super(...arguments);
        this.fillOpacity = 0;
        this.lambda = NaN;
        this.mu = NaN;
    }
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            midpoint: new Vertex(NaN, NaN)
        });
    }
    updateModel(argsDict = {}) {
        let mp = this.intersectionCoords();
        if (mp.isNaN() || !this.geomob1.visible || !this.geomob2.visible) {
            this.recursiveHide();
        }
        else {
            this.recursiveShow();
            if (!this.midpoint.equals(mp)) {
                argsDict['midpoint'] = mp;
            }
        }
        super.updateModel(argsDict);
    }
    intersectionCoords() {
        if (this.geomob1 instanceof Arrow && this.geomob2 instanceof Circle) {
            return this.arrowCircleIntersection(this.geomob1, this.geomob2, this.index);
        }
        else if (this.geomob1 instanceof Circle && this.geomob2 instanceof Arrow) {
            return this.arrowCircleIntersection(this.geomob2, this.geomob1, this.index);
        }
        else if (this.geomob1 instanceof Arrow && this.geomob2 instanceof Arrow) {
            return this.arrowArrowIntersection(this.geomob1, this.geomob2);
        }
        else if (this.geomob1 instanceof Circle && this.geomob2 instanceof Circle) {
            return this.circleCircleIntersection(this.geomob1, this.geomob2, this.index);
        }
        else {
            return new Vertex(NaN, NaN);
        }
    }
    arrowCircleIntersection(arrow, circle, index) {
        let A = arrow.startPoint;
        let B = arrow.endPoint;
        let C = circle.midpoint;
        let r = circle.radius;
        let a = A.subtract(B).norm2();
        let b = 2 * C.subtract(A).dot(A.subtract(B));
        let c = C.subtract(A).norm2() - r ** 2;
        let d = b ** 2 - 4 * a * c;
        this.lambda = (-b + (index == 0 ? -1 : 1) * d ** 0.5) / (2 * a);
        let P = A.add(B.subtract(A).multiply(this.lambda));
        if (arrow.constructor.name == 'Segment') {
            if (this.lambda < 0 || this.lambda > 1) {
                P = new Vertex(NaN, NaN);
            }
        }
        else if (arrow.constructor.name == 'Ray') {
            if (this.lambda < 0) {
                P = new Vertex(NaN, NaN);
            }
        }
        return P;
    }
    arrowArrowIntersection(arrow1, arrow2) {
        let A = arrow1.startPoint;
        let B = arrow1.endPoint;
        let C = arrow2.startPoint;
        let D = arrow2.endPoint;
        let AB = B.subtract(A);
        let CD = D.subtract(C);
        let AC = C.subtract(A);
        let det = (AB.x * CD.y - AB.y * CD.x);
        if (det == 0) {
            return new Vertex(NaN, NaN);
        } // parallel lines
        this.lambda = (CD.y * AC.x - CD.x * AC.y) / det;
        this.mu = (AB.y * AC.x - AB.x * AC.y) / det;
        let Q = A.add(AB.multiply(this.lambda));
        let intersectionFlag1 = (arrow1.constructor.name == 'Segment' && this.lambda >= 0 && this.lambda <= 1) || (arrow1.constructor.name == 'Ray' && this.lambda >= 0) || (arrow1.constructor.name == 'Line');
        let intersectionFlag2 = (arrow2.constructor.name == 'Segment' && this.mu >= 0 && this.mu <= 1) || (arrow2.constructor.name == 'Ray' && this.mu >= 0) || (arrow2.constructor.name == 'Line');
        return (intersectionFlag1 && intersectionFlag2) ? Q : new Vertex(NaN, NaN);
    }
    circleCircleIntersection(circle1, circle2, index) {
        let A = circle1.midpoint;
        let B = circle2.midpoint;
        let r1 = circle1.radius;
        let r2 = circle2.radius;
        let R = 0.5 * (r1 ** 2 - r2 ** 2 - A.norm2() + B.norm2());
        let r = (A.x - B.x) / (B.y - A.y);
        let s = R / (B.y - A.y);
        let a = 1 + r ** 2;
        let b = 2 * (r * s - A.x - r * A.y);
        let c = (A.y - s) ** 2 + A.x ** 2 - r1 ** 2;
        let d = b ** 2 - 4 * a * c;
        let x = (-b + (index == 0 ? -1 : 1) * d ** 0.5) / (2 * a);
        let y = r * x + s;
        let p = new Vertex(x, y);
        return p;
    }
}
//# sourceMappingURL=IntersectionPoint.js.map