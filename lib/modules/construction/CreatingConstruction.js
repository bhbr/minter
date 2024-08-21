import { CreatingBox } from '../creations/CreatingBox.js';
import { Vertex } from '../helpers/Vertex.js';
import { Construction } from '../mobject/expandable/ExpandableMobject.js';
export class CreatingConstruction extends CreatingBox {
    createdMobject() {
        let topLeft = new Vertex(Math.min(this.p1.x, this.p3.x), Math.min(this.p1.y, this.p3.y));
        let c = new Construction({
            compactAnchor: topLeft,
            compactWidth: this.viewWidth,
            compactHeight: this.viewHeight
        });
        c.contractStateChange();
        return c;
    }
}
//# sourceMappingURL=CreatingConstruction.js.map