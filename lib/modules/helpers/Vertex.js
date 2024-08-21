import { Transform } from './Transform.js';
export class Vertex extends Array {
    constructor(arg1, arg2) {
        super();
        this.passedByValue = true;
        if (arg1 == undefined) {
            this.x = 0;
            this.y = 0;
        }
        else if (typeof arg1 == 'number' && typeof arg2 == 'number') {
            this.x = arg1;
            this.y = arg2;
        }
        else if (arg1 instanceof Array && arg1.length == 2 && arg2 == undefined) {
            this.x = arg1[0];
            this.y = arg1[1];
        }
        else if (arg1 instanceof Vertex) {
            return arg1;
        }
    }
    get x() { return this[0]; }
    set x(newValue) { this[0] = newValue; }
    get y() { return this[1]; }
    set y(newValue) { this[1] = newValue; }
    static origin() {
        return new Vertex(0, 0);
    }
    static new(...args) {
        let x = args[0];
        if (x instanceof Vertex) {
            return x;
        }
        else {
            return new Vertex(...args);
        }
    }
    dot(otherVertex) { return this.x * otherVertex.x + this.y * otherVertex.y; }
    norm2() { return this.dot(this); }
    norm() { return Math.sqrt(this.norm2()); }
    closeTo(otherVertex, tolerance = 1e-6) {
        if (this.isNaN() || otherVertex.isNaN()) {
            return false;
        }
        if (!tolerance) {
            tolerance = 1;
        }
        return (this.subtract(otherVertex).norm() < tolerance);
    }
    isZero() { return this.x == 0 && this.y == 0; }
    equals(otherVertex) {
        return this.closeTo(otherVertex, 1e-6);
    }
    copyFrom(otherVertex) {
        this.x = otherVertex.x;
        this.y = otherVertex.y;
    }
    update(otherVertex) { this.copyFrom(otherVertex); }
    copy() {
        let ret = new Vertex();
        ret.copyFrom(this);
        return ret;
    }
    imageUnder(transform) {
        return transform.appliedTo(this);
    }
    apply(transform) {
        this.copyFrom(this.imageUnder(transform));
    }
    translatedBy(w1, w2) {
        return this.imageUnder(new Transform({ shift: new Vertex(w1, w2) }));
    }
    translateBy(w1, w2) {
        this.copyFrom(this.translatedBy(w1, w2));
    }
    rotatedBy(angle, center = Vertex.origin()) {
        return this.imageUnder(new Transform({ angle: angle, anchor: center }));
    }
    rotateBy(angle, center = Vertex.origin()) {
        this.copyFrom(this.rotatedBy(angle, center));
    }
    scaledBy(scale, center = Vertex.origin()) {
        let s = new Transform({ scale: scale, anchor: center });
        return this.imageUnder(s);
    }
    scaleBy(scale, center = Vertex.origin()) {
        this.copyFrom(this.scaledBy(scale, center));
    }
    add(otherVertex) { return this.translatedBy(otherVertex); }
    multiply(factor) { return this.scaledBy(factor); }
    divide(factor) { return this.multiply(1 / factor); }
    opposite() { return this.multiply(-1); }
    subtract(otherVertex) { return this.add(otherVertex.opposite()); }
    isNaN() {
        return (isNaN(this.x) || isNaN(this.y));
    }
    static vertices(listOfComponents) {
        let listOfVertices = [];
        for (let components of listOfComponents) {
            let v = new Vertex(components);
            listOfVertices.push(v);
        }
        return listOfVertices;
    }
    interpolate(newVertex, weight) {
        return this.scaledBy(1 - weight).add(newVertex.scaledBy(weight));
    }
    toString() {
        return `[${this.x}, ${this.y}]`;
    }
}
//# sourceMappingURL=Vertex.js.map