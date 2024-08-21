import { Ray } from './Ray.js';
export class Line extends Ray {
    drawingStartPoint() {
        if (this.startPoint == this.endPoint) {
            return this.startPoint;
        }
        return this.endPoint.add(this.startPoint.subtract(this.endPoint).multiply(100));
    }
}
//# sourceMappingURL=Line.js.map