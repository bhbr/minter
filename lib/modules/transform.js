export class Vertex extends Array {
    constructor(x = [0, 0], y) {
        super();
        if (typeof x == 'number' && typeof y == 'number') {
            this.x = x;
            this.y = y;
        }
        else if (x instanceof Array && x.length == 2 && y == undefined) {
            this.x = x[0];
            this.y = x[1];
        }
        else if (x instanceof Vertex) {
            throw 'Argument of Vertex constructor is already a Vertex. cannot assign by reference';
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
    closeTo(otherVertex, tolerance) {
        if (!tolerance) {
            tolerance = 1;
        }
        return (this.subtract(otherVertex).norm() < tolerance);
    }
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
        return this.imageUnder(new Translation(w1, w2));
    }
    translateBy(w1, w2) {
        this.copyFrom(this.translatedBy(w1, w2));
    }
    rotatedBy(angle, center = Vertex.origin()) {
        let r = new Rotation(angle, center);
        return this.imageUnder(r);
    }
    rotateBy(angle, center = Vertex.origin()) {
        this.copyFrom(this.rotatedBy(angle, center));
    }
    scaledBy(factor, center = Vertex.origin()) {
        let s = new Scaling(factor, center);
        return this.imageUnder(s);
    }
    scaleBy(factor, center = Vertex.origin()) {
        this.copyFrom(this.scaledBy(factor, center));
    }
    add(otherVertex) { return this.translatedBy(otherVertex); }
    multiply(factor) { return this.scaledBy(factor); }
    divide(factor) { return this.multiply(1 / factor); }
    opposite() { return new Vertex(-this.x, -this.y); }
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
}
export class Transform {
    constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
        this.a = a, this.b = b, this.c = c, this.d = d, this.e = e, this.f = f;
        this.anchor = new Vertex(e, f);
    }
    static identity() {
        return new Transform(1, 0, 0, 1, 0, 0);
    }
    copyFrom(otherTransform) {
        this.a = otherTransform.a;
        this.b = otherTransform.b;
        this.c = otherTransform.c;
        this.d = otherTransform.d;
        this.e = otherTransform.e;
        this.f = otherTransform.f;
        this.anchor.copyFrom(otherTransform.anchor);
    }
    asString() {
        return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
    }
    appliedToVertex(v) {
        if (v == undefined) {
            return undefined;
        }
        let newX = this.a * v.x + this.b * v.y + this.e;
        let newY = this.c * v.x + this.d * v.y + this.f;
        return new Vertex(newX, newY);
    }
    appliedToArrayOfVertices(arr) {
        let images = [];
        for (let v of arr) {
            images.push(this.appliedToVertex(v));
        }
        return images;
    }
    appliedTo(arg) {
        if (arg instanceof Vertex) {
            return this.appliedToVertex(arg);
        }
        else if (arg instanceof Array) {
            return this.appliedToArrayOfVertices(arg);
        }
        else {
            return undefined;
        }
    }
    get anchor() {
        return this._anchor;
    }
    set anchor(newValue) {
        this.e = newValue[0];
        this.f = newValue[1];
        if (this._anchor != undefined) {
            this._anchor.x = this.e;
            this._anchor.y = this.f;
        }
        else {
            this._anchor = new Vertex(this.e, this.f);
        }
    }
    // synonyms
    get center() { return this.anchor; }
    set center(newValue) { this.anchor = newValue; }
    det() { return this.a * this.d - this.b * this.c; }
    inverse() {
        let a = this.a, b = this.b, c = this.c, d = this.d, e = this.e, f = this.f;
        let det = this.det();
        let invA = d / det;
        let invB = -b / det;
        let invC = -c / det;
        let invD = a / det;
        let invE = b / a * (a * f - c * d) / det - d / a;
        let invF = (-a * f + c * d) / det;
        return new Transform(invA, invB, invC, invD, invE, invF);
    }
    rightComposedWith(otherTransform) {
        let a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d, e1 = this.e, f1 = this.f;
        let a2 = otherTransform.a, b2 = otherTransform.b, c2 = otherTransform.c, d2 = otherTransform.d, e2 = otherTransform.e, f2 = otherTransform.f;
        let a = a1 * a2 + b1 * c2;
        let b = a1 * b2 + b1 * d2;
        let c = c1 * a2 + d1 * c2;
        let d = c1 * b2 + d1 * d2;
        let e = a1 * e2 + b1 * f2 + e1;
        let f = c1 * e2 + d1 * f2 + f1;
        return new Transform(a, b, c, d, e, f);
    }
    rightComposeWith(otherTransform) {
        let a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d, e1 = this.e, f1 = this.f;
        let a2 = otherTransform.a, b2 = otherTransform.b, c2 = otherTransform.c, d2 = otherTransform.d, e2 = otherTransform.e, f2 = otherTransform.f;
        this.a = a1 * a2 + b1 * c2;
        this.b = a1 * b2 + b1 * d2;
        this.c = c1 * a2 + d1 * c2;
        this.d = c1 * b2 + d1 * d2;
        this.e = a1 * e2 + b1 * f2 + e1;
        this.f = c1 * e2 + d1 * f2 + f1;
        this.anchor = new Vertex(this.e, this.f);
    }
    leftComposedWith(otherTransform) {
        return otherTransform.rightComposedWith(this);
    }
    leftComposeWith(otherTransform) {
        this.copyFrom(this.leftComposedWith(otherTransform));
    }
    composedWith(otherTransform) {
        return this.rightComposedWith(otherTransform);
    }
    composeWith(otherTransform) {
        this.rightComposeWith(otherTransform);
    }
    conjugatedWith(otherTransform) {
        return otherTransform.inverse().composedWith(this).composedWith(otherTransform);
    }
    conjugateWith(otherTransform) {
        this.copyFrom(this.conjugatedWith(otherTransform));
    }
    anchoredAt(vertex) {
        // let t1 = (new Translation(this.anchor)).inverse()
        // let t2 = new Translation(vertex)
        // return t2.composedWith(t1).composedWith(this)
        return new Transform(this.a, this.b, this.c, this.d, vertex[0], vertex[1]);
    }
    anchorAt(vertex) {
        this.anchor = vertex;
    }
    reanchor() {
        this.anchorAt(this.anchor);
    }
    // synonyms
    centeredAt(vertex) { return this.anchoredAt(vertex); }
    centerAt(vertex) { this.anchorAt(vertex); }
    recenter() { this.reanchor(); }
}
// const t = new Transform(paper.width/2,0,0,-paper.height/2,paper.width/2,paper.height/2)
// paper.setAttribute('transform', t.asString())
export class Translation extends Transform {
    constructor(dx = [0, 0], dy) {
        super();
        if (typeof dx == 'number' && typeof dy == 'number') {
            this.dx = dx;
            this.dy = dy;
        }
        else if (dx instanceof Array && dx.length == 2 && dy == undefined) {
            this.dx = dx[0];
            this.dy = dx[1];
        }
    }
    get dx() { return this.e; }
    set dx(newValue) { this.e = newValue; }
    get dy() { return this.f; }
    set dy(newValue) { this.f = newValue; }
    inverse() {
        return new Translation(-this.dx, -this.dy);
    }
}
export class CentralStretching extends Transform {
    constructor(scaleX = 1, scaleY = 1) {
        super();
        this.a = scaleX, this.d = scaleY;
        this.center = Vertex.origin();
    }
    get scaleX() { return this.a; }
    set scaleX(newValue) { this.a = newValue; }
    get scaleY() { return this.d; }
    set scaleY(newValue) { this.d = newValue; }
    inverse() {
        return new CentralStretching(1 / this.scaleX, 1 / this.scaleY);
    }
}
export class Stretching extends Transform {
    get scaleX() { return this.a; }
    set scaleX(newValue) { this.a = newValue; }
    get scaleY() { return this.d; }
    set scaleY(newValue) { this.d = newValue; }
    constructor(scaleX = 1, scaleY = 1, center = Vertex.origin()) {
        super();
        let cs = new CentralStretching(scaleX, scaleY);
        let s = cs.centeredAt(center);
        this.copyFrom(s);
        this.center = center;
    }
    inverse() {
        return new Stretching(1 / this.scaleX, 1 / this.scaleY, this.center);
    }
}
export class CentralScaling extends CentralStretching {
    constructor(scale) {
        super(scale, scale);
    }
    get scale() { return this.scaleX; }
    set scale(newValue) { this.scaleX = newValue, this.scaleY = newValue; }
    inverse() {
        return new CentralScaling(1 / this.scale);
    }
}
export class Scaling extends Stretching {
    get scale() { return this.scaleX; }
    set scale(newValue) { this.scaleX = newValue, this.scaleY = newValue; }
    constructor(scale, center = Vertex.origin()) {
        super(scale);
        let cs = new CentralScaling(scale);
        let s = cs.centeredAt(center);
        this.copyFrom(s);
        this.center = center;
    }
    inverse() {
        return new Scaling(1 / this.scale, this.center);
    }
}
export class CentralRotation extends Transform {
    constructor(angle) {
        super(Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0);
        this.angle = angle;
    }
    get angle() { return this._angle; }
    set angle(newValue) {
        this._angle = newValue;
        this.a = Math.cos(this.angle);
        this.b = Math.sin(this.angle);
        this.c = -Math.sin(this.angle);
        this.d = Math.cos(this.angle);
    }
    inverse() {
        return new CentralRotation(-this.angle);
    }
}
export class Rotation extends Transform {
    constructor(angle, center = Vertex.origin()) {
        super();
        let cr = new CentralRotation(angle);
        let r = cr.centeredAt(center);
        this.copyFrom(r);
        this.center = center;
    }
    inverse() {
        return new Rotation(-this.angle, this.center);
    }
    get angle() { return this._angle; }
    set angle(newValue) {
        this._angle = newValue;
        this.a = Math.cos(this.angle);
        this.b = Math.sin(this.angle);
        this.c = -Math.sin(this.angle);
        this.d = Math.cos(this.angle);
    }
}
