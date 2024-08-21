import { ConstructingArrow } from './ConstructingArrow.js';
import { Segment } from '../arrows/Segment.js';
export class ConstructingSegment extends ConstructingArrow {
    statelessSetup() {
        super.statelessSetup();
        this.segment = new Segment();
    }
    statefulSetup() {
        super.statefulSetup();
        this.add(this.segment);
        this.segment.update({
            startPoint: this.startFreePoint.midpoint,
            endPoint: this.endFreePoint.midpoint
        });
        this.startFreePoint.addDependency('midpoint', this.segment, 'startPoint');
        this.endFreePoint.addDependency('midpoint', this.segment, 'endPoint');
        this.addDependency('penStrokeColor', this.segment, 'strokeColor');
    }
}
//# sourceMappingURL=ConstructingSegment.js.map