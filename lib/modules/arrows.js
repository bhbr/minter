import { Vertex } from './vertex-transform.js';
import { Polygon } from './mobject.js';
export class Arrow extends Polygon {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.startPoint = Vertex.origin();
        this.endPoint = Vertex.origin();
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
}
export class Segment extends Arrow {
    constructor(args = {}, superCall = false) {
        super({}, true);
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    components() {
        return this.endPoint.subtract(this.startPoint);
    }
    updateSelf(args = {}) {
        super.updateSelf(args);
        let p = this.drawingStartPoint();
        let q = this.drawingEndPoint();
        this.vertices = [p, q];
    }
    drawingStartPoint() { return this.startPoint; }
    drawingEndPoint() { return this.endPoint; }
    norm2() { return this.components().norm2(); }
    norm() { return Math.sqrt(this.norm2()); }
}
export class Ray extends Segment {
    drawingEndPoint() {
        if (this.startPoint == this.endPoint) {
            return this.endPoint;
        }
        return this.startPoint.add(this.endPoint.subtract(this.startPoint).multiply(100));
    }
}
export class Line extends Ray {
    drawingStartPoint() {
        if (this.startPoint == this.endPoint) {
            return this.startPoint;
        }
        return this.endPoint.add(this.startPoint.subtract(this.endPoint).multiply(100));
    }
}
//# sourceMappingURL=arrows.js.map