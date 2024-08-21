import { Vertex } from '../helpers/Vertex.js';
import { VertexArray } from './../helpers/VertexArray.js';
import { Polygon } from './Polygon.js';
export class Rectangle extends Polygon {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            width: 100,
            height: 100,
            p1: Vertex.origin(),
            p2: Vertex.origin(),
            p3: Vertex.origin(),
            p4: Vertex.origin()
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.vertices = new VertexArray([this.p1, this.p2, this.p3, this.p4]);
    }
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
        //// internal dependencies
        this.viewWidth = this.width;
        this.viewHeight = this.height;
        this.p2.x = this.width;
        this.p3.x = this.width;
        this.p3.y = this.height;
        this.p4.y = this.height;
    }
}
//# sourceMappingURL=Rectangle.js.map