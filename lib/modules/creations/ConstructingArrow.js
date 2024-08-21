import { FreePoint } from './FreePoint.js';
import { ConstructingMobject } from './ConstructingMobject.js';
export class ConstructingArrow extends ConstructingMobject {
    statelessSetup() {
        super.statelessSetup();
        this.startFreePoint = new FreePoint();
        this.endFreePoint = new FreePoint();
    }
    statefulSetup() {
        super.statefulSetup();
        this.add(this.startFreePoint);
        this.add(this.endFreePoint);
        this.endPoint = this.endPoint ?? this.startPoint.copy();
        this.addDependency('penStrokeColor', this.startFreePoint, 'strokeColor');
        this.addDependency('penFillColor', this.startFreePoint, 'fillColor');
        this.addDependency('penStrokeColor', this.endFreePoint, 'strokeColor');
        this.addDependency('penFillColor', this.endFreePoint, 'fillColor');
        this.addDependency('startPoint', this.startFreePoint, 'midpoint');
        this.addDependency('endPoint', this.endFreePoint, 'midpoint');
        this.startFreePoint.update({ midpoint: this.startPoint });
        this.endFreePoint.update({ midpoint: this.endPoint });
    }
    updateFromTip(q) {
        super.updateFromTip(q);
        this.update();
    }
    dissolve() {
        this.parent.integrate(this);
    }
}
//# sourceMappingURL=ConstructingArrow.js.map