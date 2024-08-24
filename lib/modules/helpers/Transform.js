import { ExtendedObject } from './ExtendedObject.js';
import { DEGREES } from './math.js';
import { Vertex } from './Vertex.js';
import { VertexArray } from './VertexArray.js';
export class Transform extends ExtendedObject {
    constructor(argsDict = {}) {
        super(argsDict);
        this.passedByValue = true;
        this.assureProperty('anchor', Vertex);
        this.assureProperty('shift', Vertex);
        this.setDefaults({
            anchor: Vertex.origin(),
            angle: 0,
            scale: 1,
            shift: Vertex.origin()
        });
    }
    static identity() { return new Transform(); }
    det() { return this.scale ** 2; }
    toCSSString() {
        let str1 = this.shift.isZero() ? `` : `translate(${this.shift.x}px,${this.shift.y}px) `;
        let str2 = this.anchor.isZero() || (this.scale == 1 && this.angle == 0) ? `` : `translate(${-this.anchor.x}px,${-this.anchor.y}px) `;
        let str3 = this.scale == 1 ? `` : `scale(${this.scale}) `;
        let str4 = this.angle == 0 ? `` : `rotate(${this.angle / DEGREES}deg) `;
        let str5 = this.anchor.isZero() || (this.scale == 1 && this.angle == 0) ? `` : `translate(${this.anchor.x}px,${this.anchor.y}px) `;
        return (str1 + str2 + str3 + str4 + str5).replace(`  `, ` `).trim();
    }
    a() { return this.scale * Math.cos(this.angle); }
    b() { return -this.scale * Math.sin(this.angle); }
    c() { return this.scale * Math.sin(this.angle); }
    d() { return this.scale * Math.cos(this.angle); }
    e() { return (1 - this.a()) * this.anchor.x + (1 - this.b()) * this.anchor.y + this.shift.x; }
    f() { return (1 - this.c()) * this.anchor.x + (1 - this.d()) * this.anchor.y + this.shift.y; }
    inverse() {
        let t = new Transform({
            anchor: this.anchor,
            angle: -this.angle,
            scale: 1 / this.scale
        });
        t.shift = t.appliedTo(this.shift).opposite();
        return t;
    }
    appliedTo(p) {
        return new Vertex(this.a() * p.x + this.b() * p.y + this.e(), this.c() * p.x + this.d() * p.y + this.f());
    }
    appliedToVertices(vertices) {
        // This method accepts also an undertyped argument
        let ret = new VertexArray();
        for (let v of vertices) {
            ret.push(this.appliedTo(v));
        }
        return ret;
    }
    copy() {
        let ct = new Transform();
        ct.copyFrom(this);
        return ct;
    }
    copyFrom(t) { this.setAttributes(t); }
    rightComposedWith(t) {
        let v = t.shift.add(t.anchor).subtract(this.anchor);
        let w = this.shift.add(this.anchor).subtract(t.anchor);
        return new Transform({
            anchor: t.anchor,
            scale: this.scale * t.scale,
            angle: this.angle + t.angle,
            shift: v.rotatedBy(this.angle).scaledBy(this.scale).translatedBy(w)
        });
    }
    rightComposeWith(t) {
        this.copyFrom(this.rightComposedWith(t));
    }
    leftComposeWith(t) {
        this.copyFrom(this.leftComposedWith(t));
    }
    leftComposedWith(t) {
        return t.rightComposedWith(this);
    }
    interpolate(newTransform, weight) {
        return new Transform({
            anchor: this.anchor.interpolate(newTransform.anchor, weight),
            angle: (1 - weight) * this.angle + weight * newTransform.angle,
            scale: (1 - weight) * this.scale + weight * newTransform.scale,
            shift: this.shift.interpolate(newTransform.shift, weight)
        });
    }
    withoutAnchor() {
        let t = this.copy();
        t.anchor = Vertex.origin();
        return t;
    }
    toString() {
        return `Transform(anchor: ${this.anchor}, angle: ${this.angle / DEGREES}°, scale: ${this.scale}, shift: ${this.shift})`;
    }
}
//# sourceMappingURL=Transform.js.map