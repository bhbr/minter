import { TwoPointCircle } from '../shapes/TwoPointCircle.js';
import { ConstructingMobject } from './ConstructingMobject.js';
import { FreePoint } from './FreePoint.js';
export class ConstructingCircle extends ConstructingMobject {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            strokeWidth: 1,
            fillOpacity: 0
        });
    }
    statelessSetup() {
        super.statelessSetup();
        this.freeMidpoint = new FreePoint();
        this.freeOuterPoint = new FreePoint();
        this.circle = new TwoPointCircle();
    }
    statefulSetup() {
        super.statefulSetup();
        this.midpoint = this.midpoint || this.startPoint.copy();
        this.outerPoint = this.outerPoint || this.startPoint.copy();
        this.add(this.freeMidpoint);
        this.add(this.freeOuterPoint);
        this.add(this.circle);
        this.addDependency('penStrokeColor', this.freeMidpoint, 'strokeColor');
        this.addDependency('penFillColor', this.freeMidpoint, 'fillColor');
        this.addDependency('penStrokeColor', this.freeOuterPoint, 'strokeColor');
        this.addDependency('penFillColor', this.freeOuterPoint, 'fillColor');
        this.addDependency('penStrokeColor', this.circle, 'strokeColor');
        this.freeMidpoint.addDependency('midpoint', this.circle, 'midpoint');
        this.freeOuterPoint.addDependency('midpoint', this.circle, 'outerPoint');
        this.freeMidpoint.update({
            midpoint: this.midpoint,
            strokeColor: this.penStrokeColor,
            fillColor: this.penFillColor
        }, false);
        this.freeOuterPoint.update({
            midpoint: this.outerPoint,
            strokeColor: this.penStrokeColor,
            fillColor: this.penFillColor
        }, false);
        this.circle.update({
            midpoint: this.freeMidpoint.midpoint,
            outerPoint: this.freeOuterPoint.midpoint,
            fillOpacity: 0
        }, false);
    }
    updateFromTip(q) {
        super.updateFromTip(q);
        this.outerPoint.copyFrom(q);
        this.freeOuterPoint.midpoint.copyFrom(q);
        this.update();
    }
    dissolve() {
        this.parent.integrate(this);
    }
    // remove?
    update(argsDict = {}, redraw = true) {
        super.update(argsDict, redraw);
    }
}
//# sourceMappingURL=ConstructingCircle.js.map