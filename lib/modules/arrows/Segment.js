import { VertexArray } from './../helpers/VertexArray.js';
import { Arrow } from './Arrow.js';
export class Segment extends Arrow {
    components() {
        return this.endPoint.subtract(this.startPoint);
    }
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
        let p = this.drawingStartPoint();
        let q = this.drawingEndPoint();
        this.vertices = new VertexArray([p, q]);
    }
    drawingStartPoint() { return this.startPoint; }
    drawingEndPoint() { return this.endPoint; }
    norm2() { return this.components().norm2(); }
    norm() { return Math.sqrt(this.norm2()); }
}
//# sourceMappingURL=Segment.js.map