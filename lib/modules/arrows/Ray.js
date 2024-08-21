import { Segment } from './Segment.js';
export class Ray extends Segment {
    drawingEndPoint() {
        if (this.startPoint == this.endPoint) {
            return this.endPoint;
        }
        return this.startPoint.add(this.endPoint.subtract(this.startPoint).multiply(100));
    }
}
//# sourceMappingURL=Ray.js.map