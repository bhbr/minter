import { ConstructingArrow } from './ConstructingArrow.js';
import { Ray } from '../arrows/Ray.js';
export class ConstructingRay extends ConstructingArrow {
    statelessSetup() {
        super.statelessSetup();
        this.ray = new Ray();
    }
    statefulSetup() {
        super.statefulSetup();
        this.add(this.ray);
        this.ray.update({
            startPoint: this.startFreePoint.midpoint,
            endPoint: this.endFreePoint.midpoint
        }, false);
        this.startFreePoint.addDependency('midpoint', this.ray, 'startPoint');
        this.endFreePoint.addDependency('midpoint', this.ray, 'endPoint');
        this.addDependency('penStrokeColor', this.ray, 'strokeColor');
    }
}
//# sourceMappingURL=ConstructingRay.js.map