import { ConstructingArrow } from './ConstructingArrow.js';
import { Line } from '../arrows/Line.js';
export class ConstructingLine extends ConstructingArrow {
    statelessSetup() {
        super.statelessSetup();
        this.line = new Line();
    }
    statefulSetup() {
        super.statefulSetup();
        this.add(this.line);
        this.line.update({
            startPoint: this.startFreePoint.midpoint,
            endPoint: this.endFreePoint.midpoint
        }, false);
        this.startFreePoint.addDependency('midpoint', this.line, 'startPoint');
        this.endFreePoint.addDependency('midpoint', this.line, 'endPoint');
        this.addDependency('penStrokeColor', this.line, 'strokeColor');
    }
}
//# sourceMappingURL=ConstructingLine.js.map