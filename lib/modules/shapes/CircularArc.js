import { CurvedLine } from './CurvedLine.js';
import { Vertex } from '../helpers/Vertex.js';
import { VertexArray } from '../helpers/VertexArray.js';
import { TAU } from '../helpers/math.js';
export class CircularArc extends CurvedLine {
    get midpoint() {
        return this.anchor.translatedBy(this.radius, this.radius);
    }
    set midpoint(newValue) {
        this.anchor = newValue.translatedBy(-this.radius, -this.radius);
    }
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            midpoint: Vertex.origin(),
            radius: 10,
            angle: TAU / 4,
        });
    }
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            nbPoints: 32
        });
    }
    updateModel(argsDict = {}) {
        /*
        Since midpoint is just an alias for a shifted anchor, there is possible
        confusion when updating a Circle/CircularArc with a new midpoint, anchor
        and/or radius.
        This is resolved here:
            - updating the midpoint changes the anchor with the given new or existing radius
            - updating just the radius keeps the midpoint where it is (anchor changes)
        */
        // read all possible new values
        let r = argsDict['radius'];
        let m = argsDict['midpoint'];
        let a = argsDict['anchor'];
        if (m && a) {
            throw `Inconsistent data: cannot set midpoint and anchor of a ${this.constructor.name} simultaneously`;
        }
        // adjust the anchor according to the given parameters
        if (r !== undefined && !m && !a) { // only r given
            argsDict['anchor'] = this.midpoint.translatedBy(-r, -r);
        }
        else if (r === undefined && m && !a) { // only m given
            argsDict['anchor'] = m.translatedBy(-this.radius, -this.radius);
        }
        else if (r === undefined && !m && a) { // only a given
            // nothing to adjust
        }
        else if (r !== undefined && m) { // r and m given, but no a
            argsDict['anchor'] = m.translatedBy(-r, -r);
        }
        else if (r !== undefined && !m && a) { // r and a given
            // nothing to adjust
        }
        // remove the new midpoint (taken care of by updating the anchor)
        delete argsDict['midpoint'];
        let updatedRadius = (r !== undefined) ? r : this.radius;
        argsDict['viewWidth'] = 2 * updatedRadius;
        argsDict['viewHeight'] = 2 * updatedRadius;
        super.updateModel(argsDict);
    }
    updateBezierPoints() {
        let newBezierPoints = new VertexArray();
        let d = this.radius * 4 / 3 * Math.tan(this.angle / (4 * this.nbPoints));
        for (let i = 0; i <= this.nbPoints; i++) {
            let theta = i / this.nbPoints * this.angle;
            let radialUnitVector = new Vertex(Math.cos(theta), Math.sin(theta));
            let tangentUnitVector = new Vertex(-Math.sin(theta), Math.cos(theta));
            let anchorPoint = radialUnitVector.scaledBy(this.radius);
            let leftControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(-d));
            let rightControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(d));
            if (i != 0) {
                newBezierPoints.push(leftControlPoint);
            }
            newBezierPoints.push(anchorPoint);
            if (i != this.nbPoints) {
                newBezierPoints.push(rightControlPoint);
            }
        }
        let translatedBezierPoints = new VertexArray();
        for (let i = 0; i < newBezierPoints.length; i++) {
            translatedBezierPoints.push(newBezierPoints[i].translatedBy(this.radius, this.radius));
        }
        this.bezierPoints = translatedBezierPoints;
        // do NOT update the view, because redraw calls updateBezierPoints
    }
}
//# sourceMappingURL=CircularArc.js.map