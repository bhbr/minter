import { Circle } from '../shapes/Circle.js';
import { Vertex } from '../helpers/Vertex.js';
import { Color } from '../helpers/Color.js';
export class Point extends Circle {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            radius: 7.0
        });
    }
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            fillColor: Color.white(),
            fillOpacity: 1.0
        });
    }
    statefulSetup() {
        super.statefulSetup();
        if (!this.midpoint || this.midpoint.isNaN()) {
            this.update({ midpoint: Vertex.origin() }, false);
        }
    }
}
//# sourceMappingURL=Point.js.map