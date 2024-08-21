import { CreatingMobject } from '../creations/CreatingMobject.js';
import { Color } from '../helpers/Color.js';
export class ConstructingMobject extends CreatingMobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            penStrokeColor: Color.white(),
            penStrokeWidth: 1.0,
            penFillColor: Color.white(),
            penFillOpacity: 0.0
        });
    }
    get parent() {
        return super.parent;
    }
    set parent(newValue) {
        super.parent = newValue;
    }
}
//# sourceMappingURL=ConstructingMobject.js.map