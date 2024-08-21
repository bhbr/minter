import { Circle } from './Circle.js';
import { Vertex } from '../helpers/Vertex.js';
import { Color } from '../helpers/Color.js';
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
//# sourceMappingURL=TwoPointCircle.js.map