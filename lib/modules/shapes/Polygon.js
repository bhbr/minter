import { VMobject } from '../mobject/VMobject.js';
import { stringFromPoint } from '../helpers/helpers.js';
export class Polygon extends VMobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            closed: true
        });
    }
    static makePathString(vertices, closed) {
        let pathString = '';
        let v = vertices;
        if (v.length == 0) {
            return '';
        }
        for (let point of v) {
            if (point == undefined || point.isNaN()) {
                pathString = '';
                return pathString;
            }
            let prefix = (pathString == '') ? 'M' : 'L';
            pathString += prefix + stringFromPoint(point);
        }
        if (closed) {
            pathString += 'Z';
        }
        return pathString;
    }
    pathString() {
        return Polygon.makePathString(this.vertices, this.closed);
    }
}
//# sourceMappingURL=Polygon.js.map