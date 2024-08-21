import { CreatingBox } from '../../creations/CreatingBox.js';
import { ExpandableMobject } from './ExpandableMobject.js';
import { Vertex } from '../../helpers/Vertex.js';
export class CreatingExpandableMobject extends CreatingBox {
    createdMobject() {
        let topLeft = new Vertex(Math.min(this.p1.x, this.p3.x), Math.min(this.p1.y, this.p3.y));
        let bottomRight = new Vertex(Math.max(this.p1.x, this.p3.x), Math.max(this.p1.y, this.p3.y));
        let w = bottomRight.x - topLeft.x;
        let h = bottomRight.y - topLeft.y;
        let cm = new ExpandableMobject({
            compactAnchor: topLeft,
            compactWidth: w,
            compactHeight: h
        });
        cm.contractStateChange();
        return cm;
    }
}
//# sourceMappingURL=CreatingExpandableMobject.js.map