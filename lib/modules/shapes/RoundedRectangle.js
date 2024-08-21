import { Vertex } from '../helpers/Vertex.js';
import { VertexArray } from '../helpers/VertexArray.js';
import { CurvedShape } from './CurvedShape.js';
export class RoundedRectangle extends CurvedShape {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            cornerRadius: 10,
            p1: Vertex.origin(),
            p2: Vertex.origin(),
            p3: Vertex.origin(),
            p4: Vertex.origin(),
            width: 200,
            height: 100
        });
    }
    updateBezierPoints() {
        try {
            let r = Math.min(this.cornerRadius, Math.min(this.width, this.height) / 2);
            this.p2.x = this.width;
            this.p3.x = this.width;
            this.p3.y = this.height;
            this.p4.y = this.height;
            let p11 = this.p1.translatedBy(0, r);
            let p12 = this.p1.translatedBy(r, 0);
            let m12 = this.p1.add(this.p2).divide(2);
            let p21 = this.p2.translatedBy(-r, 0);
            let p22 = this.p2.translatedBy(0, r);
            let m23 = this.p2.add(this.p3).divide(2);
            let p31 = this.p3.translatedBy(0, -r);
            let p32 = this.p3.translatedBy(-r, 0);
            let m34 = this.p3.add(this.p4).divide(2);
            let p41 = this.p4.translatedBy(r, 0);
            let p42 = this.p4.translatedBy(0, -r);
            let m41 = this.p4.add(this.p1).divide(2);
            this.bezierPoints = new VertexArray([
                p12, p21,
                this.p1, m12, this.p2,
                p12, p21, this.p2,
                this.p2, p22, p31,
                this.p2, m23, this.p3,
                p22, p31, this.p3,
                this.p3, p32, p41,
                this.p3, m34, this.p4,
                p32, p41, this.p4,
                this.p4, p42, p11,
                this.p4, m41, this.p1,
                p42, p11, this.p1,
                this.p1, p12
            ]);
        }
        catch { }
    }
    updateModel(argsDict = {}) {
        //console.log('updating RoundedRectangle')
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
//# sourceMappingURL=RoundedRectangle.js.map