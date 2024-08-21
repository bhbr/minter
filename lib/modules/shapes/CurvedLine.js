import { VMobject } from '../mobject/VMobject.js';
import { VertexArray } from '../helpers/VertexArray.js';
import { stringFromPoint } from '../helpers/helpers.js';
export class CurvedLine extends VMobject {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            closed: false
        });
    }
    updateBezierPoints() { }
    // implemented by subclasses
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
        this.updateBezierPoints();
    }
    static makePathString(bezierPoints, closed = false) {
        let points = bezierPoints;
        if (points == undefined || points.length == 0) {
            return '';
        }
        // there should be 3n + 1 points
        let nbCurves = (points.length - 1) / 3;
        if (nbCurves % 1 != 0) {
            throw 'Incorrect number of Bézier points';
        }
        let pathString = 'M' + stringFromPoint(points[0]);
        for (let i = 0; i < nbCurves; i++) {
            let point1str = stringFromPoint(points[3 * i + 1]);
            let point2str = stringFromPoint(points[3 * i + 2]);
            let point3str = stringFromPoint(points[3 * i + 3]);
            pathString += `C${point1str} ${point2str} ${point3str}`;
        }
        if (closed) {
            pathString += 'Z';
        }
        return pathString;
    }
    pathString() {
        return CurvedLine.makePathString(this.bezierPoints, this.closed);
    }
    get bezierPoints() { return this._bezierPoints; }
    set bezierPoints(newValue) {
        this._bezierPoints = newValue;
        let v = new VertexArray();
        let i = 0;
        for (let p of this.bezierPoints) {
            if (i % 3 == 1) {
                v.push(p);
            }
            i += 1;
        }
        this.vertices = v;
    }
}
//# sourceMappingURL=CurvedLine.js.map