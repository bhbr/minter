import { CircularArc } from './CircularArc.js';
import { TAU } from '../helpers/math.js';
export class Circle extends CircularArc {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            angle: TAU,
            closed: true
        });
    }
}
//# sourceMappingURL=Circle.js.map