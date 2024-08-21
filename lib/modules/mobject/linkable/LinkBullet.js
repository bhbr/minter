import { Circle } from '../../shapes/Circle.js';
import { BULLET_RADIUS } from './constants.js';
import { Color } from '../../helpers/Color.js';
export class LinkBullet extends Circle {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            radius: BULLET_RADIUS,
            fillOpacity: 1,
            strokeColor: Color.white()
        });
    }
    get parent() {
        return super.parent;
    }
    set parent(newValue) {
        super.parent = newValue;
    }
    positionInLinkMap() {
        return this.parent.transformLocalPoint(this.midpoint, this.parent.parent.parent);
    }
}
//# sourceMappingURL=LinkBullet.js.map