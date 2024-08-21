import { Mobject } from '../Mobject.js';
import { Circle } from '../../shapes/Circle.js';
import { Color } from '../../helpers/Color.js';
import { HOOK_RADIUS } from './constants.js';
export class LinkHook extends Circle {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            mobject: new Mobject(),
            name: "default",
            type: "input"
        });
    }
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            radius: HOOK_RADIUS,
            fillOpacity: 0,
            strokeColor: Color.white()
        });
    }
    positionInLinkMap() {
        return this.parent.transformLocalPoint(this.midpoint, this.parent.parent.parent);
    }
}
//# sourceMappingURL=LinkHook.js.map