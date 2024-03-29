(function () {
    'use strict';

    // Problem: When updating a Mobject with setAttributes(argsDict),
    // some atttributes should only be copied (passed by value), not linked (passed by reference).
    // This mainly concerns Vertex. E. g. if one Mobject's anchor is set to another's
    // by reference, these two attributes nwo point to the same object. Changing one Mobject's
    // anchor now changes the other as well.
    // The issue stems from the fact that a Vertex is an object even though it should
    // just be a "dumb" list of numbers (a struct) without a persistent identity.
    // Solution: An ExtendedObject has a flag passedByValue, which is taken into account
    // when updating a Mobject's attribute with such an ExtendedObject as argument.
    class ExtendedObject {
        constructor(argsDict = {}, superCall = true) {
            // this signature needs to align with the constructor signature os Mobject,
            // where the roll of superCall will become clear
            this.passedByValue = false; // the default is pass-by-reference
            this.setAttributes(argsDict);
        }
        properties() {
            // get a list of all of the objects property names, form most specific to most abstract
            let obj = this;
            let properties = [];
            // this loop walks up the superclass hierarchy and collects all inherited properties
            while (obj.constructor.name != 'Object') {
                properties.push(...Object.getOwnPropertyNames(obj));
                obj = Object.getPrototypeOf(obj);
            }
            return properties;
        }
        setter(key) {
            // when updating a Mobject with mob.setAttributes({prop: value}),
            // the key "prop" can refer to either:
            //  - a property (mob["prop"]) or
            //  - an accessor (getter/setter mob.prop)
            // this picks the right one to call in setAttributes
            // so we don't create properties that shouldn't be objects in their own right
            let descriptor = undefined;
            if (this.properties().includes(key)) {
                let obj = this;
                while (obj.constructor.name != 'Object' && descriptor == undefined) {
                    descriptor = Object.getOwnPropertyDescriptor(obj, key);
                    obj = Object.getPrototypeOf(obj);
                }
            }
            if (descriptor != undefined) {
                return descriptor.set;
            }
            else {
                return undefined;
            }
        }
        setAttributes(argsDict = {}) {
            // update the object with the given attribute names and values
            // always change a nobject via this method,
            // it will automatically check for mutability
            // and pick the right setter method
            for (let [key, value] of Object.entries(argsDict)) {
                let setter = this.setter(key);
                if (setter != undefined) {
                    if (Object.keys(this.fixedArgs()).includes(key)) {
                        console.warn(`Cannot reassign property ${key} on ${this.constructor.name}`);
                        continue;
                    }
                    setter.call(this, value);
                }
                else {
                    // we have an as-of-yet unknown property
                    if (value != undefined && value.passedByValue) {
                        // create and copy (pass-by-value)
                        if (this[key] == undefined) {
                            this[key] = new value.constructor();
                        }
                        this[key].copyFrom(value);
                    }
                    else {
                        // just link (pass-by-reference)
                        this[key] = value;
                    }
                }
            }
        }
        fixedArgs() { return {}; }
        // filled upon subclassing
        assureProperty(key, cons) {
            if (this[key] == undefined) {
                this[key] = new cons();
            }
        }
        setDefaults(argsDict = {}) {
            // we often cannot set default values for properties as declarations alone
            // (before and outside the methods) as these get set too late
            // (at the end of the constructor)
            // instead we call setDefaults at the appropriate time earlier in the constructor
            // the argsDict is considered as soft suggestions, only for properties
            // that have not yet been set
            // this is in opposition to setAttributes which has the mandate
            // to overwrite existing properties
            let undefinedKVPairs = {};
            for (let [key, value] of Object.entries(argsDict)) {
                if (this[key] == undefined) {
                    undefinedKVPairs[key] = value;
                }
            }
            this.setAttributes(undefinedKVPairs);
        }
    }

    const TAU = 2 * Math.PI;
    const DEGREES = TAU / 360;

    class Vertex extends Array {
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
        closeTo(otherVertex, tolerance) {
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
    }
    class Transform extends ExtendedObject {
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
        asString() {
            let str1 = ``; // this.anchor.isZero() ? `` : `translate(${this.anchor.x}px,${this.anchor.y}px)`
            let str2 = this.scale == 1 ? `` : `scale(${this.scale})`;
            let str3 = this.angle == 0 ? `` : `rotate(${this.angle / DEGREES}deg)`;
            let str4 = ``; // this.anchor.isZero() ? `` : `translate(${-this.anchor.x}px,${-this.anchor.y}px)`
            let str5 = this.shift.isZero() ? `` : `translate(${this.shift.x}px,${this.shift.y}px)`;
            return (str1 + str2 + str3 + str4 + str5).replace(`  `, ` `);
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
            let ret = [];
            for (let v of vertices) {
                ret.push(this.appliedTo(v));
            }
            return ret;
        }
        copy() { return Object.assign({}, this); }
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
    }
    // export abstract class Transform extends ExtendedObject {
    // 	abstract get centralTransform(): CentralTransform
    // 	abstract get translation(): Translation
    // 	abstract get a(): number
    // 	abstract get b(): number
    // 	abstract get c(): number
    // 	abstract get d(): number
    // 	abstract get anchor(): Vertex
    // 	abstract get shift(): Vertex
    // 	abstract set anchor(newValue: Vertex)
    // 	abstract set shift(newValue: Vertex)
    // 	abstract safeCopyFrom(t: Transform)
    // 	abstract appliedTo(arg1: Vertex | number, arg2?: number): Vertex
    // 	abstract inverse(): Transform
    // 	abstract isIdentity(): boolean
    // 	abstract asString(): string
    // 	static identity(): Identity { return new Identity() }
    // 	static create(ct: CentralTransform, anchor: Vertex) {
    // 		return new MatrixTransform({centralTransform: ct, anchor: anchor}).refine()
    // 	}
    // 	get center(): Vertex { return this.anchor }
    // 	get e(): number { return this.shift.x }
    // 	get f(): number { return this.shift.y }
    // 	det(): number { return this.centralTransform.det() }
    // 	appliedToVertices(vertices: Array<Vertex>): Array<Vertex> {
    // 		let ret: Array<Vertex> = []
    // 		for (let v of vertices) {
    // 			ret.push(this.appliedTo(v))
    // 		}
    // 		return ret
    // 	}
    // 	copyFrom(t: Transform) {
    // 		// type-check t
    // 		if (t.constructor.name == this.constructor.name) {
    // 			this.safeCopyFrom(t)
    // 		} else {
    // 			throw `Cannot overwrite ${this.constructor.name} with ${t.constructor.name}`
    // 		}
    // 	}
    // 	copy(): Transform { return {...this} }
    // 	asMatrixTransform(): MatrixTransform {
    // 		return new MatrixTransform({a: this.a, b: this.b, c: this.c, d: this.d, shift: this.shift})
    // 	}
    // 	leftComposeWith(t: Transform) {
    // 		this.copyFrom(this.leftComposedWith(t))
    // 	}
    // 	leftComposedWith(t: Transform): Transform {
    // 		return t.rightComposedWith(this)
    // 	}
    // 	rightComposeWith(t: Transform) {
    // 		this.copyFrom(this.rightComposedWith(t))
    // 	}
    // 	rightComposedWith(t: Transform): Transform {
    // 		console.log('composing', this, t)
    // 		let a1: number = this.a, b1: number = this.b, c1: number = this.c, d1: number = this.d
    // 		let a2: number = t.a, b2: number = t.b, c2: number = t.c, d2: number = t.d
    // 		let a: number = a1*a2 + b1*c2
    // 		let b: number = a1*b2 + b1*d2
    // 		let c: number = c1*a2 + d1*c2
    // 		let d: number = c1*b2 + d1*d2
    // 		let e1: number = this.e, f1: number = this.f
    // 		let e2: number = t.e, f2: number = t.f
    // 		let e: number = a1*e2 + b1*f2 + e1
    // 		let f: number = c1*e2 + d1*f2 + f1
    // 		let m = new MatrixTransform({a: a, b: b, c: c, d: d, shift: new Vertex(e, f)}).refine()
    // 		console.log('into', m)
    // 		return m
    // 	}
    // 	refine(): Transform {
    // 		// this method detects the narrowest possible subclass this belongs to
    // 		let reducedCT: Transform
    // 		if (this.b == 0 && this.c == 0) {
    // 			if (this.a == 1 && this.d == 1) {
    // 				reducedCT = new Identity()
    // 			} else if (this.a == this.d) {
    // 				reducedCT = new CentralScaling(this.a)
    // 			} else {
    // 				reducedCT = new CentralStretching(this.a, this.d)
    // 			}
    // 		} else if (this.a ** 2 + this.b ** 2 == 1 && this.c == -this.b) {
    // 			reducedCT = new CentralRotation(Math.atan2(-this.b, this.a))
    // 		} else {
    // 			reducedCT = new CentralMatrixTransform(this.a, this.b, this.c, this.d)
    // 		}
    // 		if (this.shift.isZero()) {
    // 			return reducedCT
    // 		} else {
    // 			if (reducedCT instanceof Identity) {
    // 				return new Translation(this.shift)
    // 			} else if (reducedCT instanceof CentralScaling) {
    // 				return new Scaling(reducedCT, this.anchor)
    // 			} else if (reducedCT instanceof CentralStretching) {
    // 				return new Stretching(reducedCT, this.anchor)
    // 			} else if (reducedCT instanceof CentralRotation) {
    // 				return new Rotation(reducedCT, this.anchor)
    // 			} else {
    // 				return new MatrixTransform(reducedCT, this.anchor)
    // 			} 
    // 		}
    // 	}
    // }
    // abstract class CentralTransform extends Transform {
    // 	get centralTransform(): CentralTransform { return this }
    // 	get translation(): Translation { return new Translation({shift: Vertex.origin()}) }
    // 	get anchor(): Vertex { return Vertex.origin() }
    // 	get shift(): Vertex { return this.translation.shift }
    // 	set anchor(newValue: Vertex) { throw 'Cannot set anchor on CentralTransform' }
    // 	set shift(newValue: Vertex) { throw 'Cannot set shift on CentralTransform' }
    // 	asCentralMatrixTransform(): CentralMatrixTransform {
    // 		return new CentralMatrixTransform({a: this.a, b: this.b, c: this.c, d: this.d})
    // 	}
    // 	appliedTo(arg1: Vertex | number, arg2?: number): Vertex {
    // 		let x, y: number
    // 		if (!arg2 && arg1 instanceof Vertex) {
    // 			x = this.a * arg1.x + this.b * arg1.y
    // 			y = this.c * arg1.x + this.d * arg1.y
    // 		} else if (typeof arg1  == 'number') {
    // 			x = this.a * arg1 + this.b * arg2
    // 			y = this.c * arg1 + this.d * arg2
    // 		} else {
    // 			throw 'Incorrect arguments for Transform.appliedTo'
    // 		}
    // 		return new Vertex(x, y)
    // 	}
    // 	add(t: CentralTransform): CentralMatrixTransform {
    // 		let a = this.a + t.a
    // 		let b = this.b + t.b
    // 		let c = this.c + t.c
    // 		let d = this.d + t.d
    // 		return new CentralMatrixTransform({a: a, b: b, c: c, d: d})
    // 	}
    // 	subtract(t: CentralTransform): CentralMatrixTransform {
    // 		return this.add(t.scaledBy(-1))
    // 	}
    // 	scaledBy(scale: number): CentralTransform {
    // 		return this.leftComposedWith(new CentralScaling({scale: scale})) as CentralTransform
    // 	}
    // 	scaleBy(scale: number) {
    // 		this.copyFrom(this.scaledBy(scale))
    // 	}
    // 	rotatedBy(angle: number): CentralTransform {
    // 		return this.leftComposedWith(new CentralRotation({angle: angle})) as CentralTransform
    // 	}
    // 	rotateBy(angle: number) {
    // 		this.copyFrom(this.rotatedBy(angle))
    // 	}
    // }
    // class Identity extends CentralTransform {
    // 	get a(): number { return 1 }
    // 	get b(): number { return 0 }
    // 	get c(): number { return 0 }
    // 	get d(): number { return 1 }
    // 	get translation(): Translation { return new Translation({shift: Vertex.origin()}) }
    // 	get anchor(): Vertex { throw "Identity has no anchor!" }
    // 	det(): number { return 1 }
    // 	safeCopyFrom(t: Transform) { }
    // 	appliedTo(v: Vertex) { return v.copy() }
    // 	inverse(): Identity { return this }
    // 	isIdentity(): boolean { return true }
    // 	asString(): string { return `` }
    // }
    // class CentralMatrixTransform extends CentralTransform {
    // 	a: number = 1
    // 	b: number = 0
    // 	c: number = 0
    // 	d: number = 1
    // 	constructor(a: number | object | Array<number> = 1, b?: number, c?: number, d?: number) {
    // 		super()
    // 		if (typeof a == 'number') {
    // 			this.a = a, this.b = b, this.c = c, this.d = d
    // 		} else if (a instanceof Array) {
    // 			this.a = a[0], this.b = a[1], this.c = a[2], this.d = a[3] 
    // 		} else {
    // 			this.a = a['a'], this.b = a['b'], this.c = a['c'], this.d = a['d'] 
    // 		}
    // 	}
    // 	asString(): string {
    // 		return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d})`
    // 	}
    // 	inverse(): CentralMatrixTransform {
    // 		let m = new CentralMatrixTransform({a: this.d, b: -this.b, c: -this.c, d: this.a})
    // 		m.scaleBy(1/this.det())
    // 		return m
    // 	}
    // 	det(): number { return this.a * this.d - this.b * this.c }
    // 	copyFrom(t: Transform) {
    // 		if (t instanceof CentralTransform) {
    // 			super.copyFrom(t.asCentralMatrixTransform())
    // 		}
    // 	}
    // 	safeCopyFrom(t: Transform) {
    // 		this.a = t.a, this.b = t.b, this.c = t.c, this.d = t.d
    // 	}
    // 	isIdentity(): boolean { return this.a == 1 && this.b == 0 && this.c == 0 && this.d == 1 }
    // }
    // class CentralStretching extends CentralTransform {
    // 	scaleX: number = 1
    // 	scaleY: number = 1
    // 	constructor(scaleX: number | object | Array<number> = 1, scaleY?: number) {
    // 		super()
    // 		if (typeof scaleX == 'number') {
    // 			this.scaleX = scaleX, this.scaleY = scaleY ?? 1
    // 		} else if (scaleX instanceof Array) {
    // 			this.scaleX = scaleX[0], this.scaleY = scaleX[1]
    // 		} else {
    // 			this.scaleX = scaleX['scaleX'], this.scaleY = scaleX['scaleY']
    // 		}
    // 	}
    // 	get a(): number { return this.scaleX }
    // 	get b(): number { return 0 }
    // 	get c(): number { return 0 }
    // 	get d(): number { return this.scaleY }
    // 	inverse(): CentralStretching { return new CentralStretching({scaleX: 1/this.scaleX, scaleY: 1/this.scaleY}) }
    // 	det(): number { return this.scaleX * this.scaleY }
    // 	safeCopyFrom(t: Transform) {
    // 		this.scaleX = (t as CentralStretching).scaleX
    // 		this.scaleY = (t as CentralStretching).scaleY
    // 	}
    // 	isIdentity(): boolean { return this.scaleX == 1 && this.scaleY == 1 }
    // 	asString(): string {
    // 		return `scale(${this.scaleX}, ${this.scaleY})`
    // 	}
    // }
    // class CentralScaling extends CentralStretching {
    // 	constructor(scale: number | object = 1) {
    // 		super()
    // 		if (typeof(scale) == 'number') {
    // 			this.scale = scale
    // 		} else {
    // 			this.scale = scale['scale']
    // 		}
    // 	}
    // 	get scale() { return this.scaleX }
    // 	set scale(newValue: number) {
    // 		this.scaleX = newValue, this.scaleY = newValue
    // 	}
    // 	safeCopyFrom(t: Transform) {
    // 		this.scale = (t as CentralScaling).scale
    // 	}
    // 	asString(): string {
    // 		return `scale(${this.scale})`
    // 	}
    // 	det(): number { return this.scale ** 2 }
    // 	inverse(): CentralScaling { return new CentralScaling({scale: 1/this.scale}) }
    // 	isIdentity(): boolean { return this.scale == 1 }
    // }
    // const TAU = 2 * Math.PI
    // const DEGREES = TAU / 360
    // class CentralRotation extends CentralTransform {
    // 	angle: number = 0
    // 	constructor(angle: number | object = 1) {
    // 		super()
    // 		if (typeof(angle) == 'number') {
    // 			this.angle = angle
    // 		} else {
    // 			this.angle = angle['angle'] ?? angle['radians'] ?? angle['degrees'] * DEGREES
    // 		}
    // 	}
    // 	get a(): number { return Math.cos(this.angle) }
    // 	get b(): number { return -Math.sin(this.angle) }
    // 	get c(): number { return Math.sin(this.angle) }
    // 	get d(): number { return Math.cos(this.angle) }
    // 	// synonym for angle
    // 	get radians(): number { return this.angle }
    // 	set radians(newValue: number) { this.angle = newValue }
    // 	get degrees(): number { return this.radians / DEGREES }
    // 	set degrees(newValue: number) { this.radians = newValue * DEGREES }
    // 	inverse(): CentralRotation { return new CentralRotation({angle: -this.angle}) }
    // 	det(): number { return 1 }
    // 	safeCopyFrom(t: Transform) {
    // 		this.angle = (t as CentralRotation).angle
    // 	}
    // 	asString(): string {
    // 		return `rotate({this.degrees()}deg)`
    // 	}
    // 	isIdentity(): boolean { return this.angle % TAU == 0 }
    // }
    // class Affine<T extends CentralTransform> extends Transform {
    // 	centralTransform: T
    // 	translation: Translation = new Translation()
    // 	constructor(t: object, a?: Vertex | Array<number>) {
    // 		super()
    // 		this.translation = new Translation(Vertex.origin())
    // 		if (t instanceof CentralTransform) {
    // 			this.centralTransform = t as T
    // 			this.anchor = new Vertex(a)
    // 		} else {
    // 			this.centralTransform = t['centralTransform']
    // 			if (t['anchor'] != undefined) { this.anchor = t['anchor'] }
    // 			if (t['shift'] != undefined) { this.shift = t['shift'] }
    // 		}
    // 	}
    // 	get a(): number { return this.centralTransform.a }
    // 	get b(): number { return this.centralTransform.b }
    // 	get c(): number { return this.centralTransform.c }
    // 	get d(): number { return this.centralTransform.d }
    // 	get anchor(): Vertex {
    // 		return  new Identity().subtract(this.centralTransform).inverse().appliedTo(this.shift)
    // 	}
    // 	set anchor(newValue: Vertex) {
    // 		this.shift = new Identity().subtract(this.centralTransform).appliedTo(newValue)
    // 	}
    // 	set center(newValue: Vertex) { this.anchor = newValue }
    // 	get shift(): Vertex { return this.translation.shift }
    // 	set shift(newValue: Vertex) {
    // 		this.assureProperty('translation', Translation)
    // 		this.translation.assureProperty('shift', Vertex)
    // 		this.translation.shift.copyFrom(newValue)
    // 	}
    // 	det(): number { return this.centralTransform.det() }
    // 	inverse(): this {
    // 		return new (<any>this.constructor)({centralTransform: this.centralTransform.inverse(), anchor: this.anchor}).refine()
    // 	}
    // 	asString(): string {
    // 		if (this.isIdentity()) { return `` }
    // 		if (this.anchor.isZero()) { return this.centralTransform.asString() }
    // 		let t = new Translation(this.anchor)
    // 		let str1: string = t.asString()
    // 		if (this.centralTransform.isIdentity()) { return str1 
    // 		}
    // 		let str2: string = this.centralTransform.asString()
    // 		let str3: string = t.inverse().asString()
    // 		return `${str3} ${str2} ${str1}`
    // 	}
    // 	appliedTo(v: Vertex) {
    // 		return this.centralTransform.appliedTo(v).translatedBy(this.shift)
    // 	}
    // 	isIdentity(): boolean {
    // 		return this.centralTransform.isIdentity() && this.translation.isIdentity()
    // 	}
    // 	safeCopyFrom(t: Transform) {
    // 		this.centralTransform.copyFrom((t as Affine<T>).centralTransform)
    // 		this.shift.copyFrom(t.shift)
    // 	}
    // }
    // export class Translation extends Transform {
    // 	shift: Vertex
    // 	get centralTransform(): CentralTransform { return new Identity() }
    // 	get translation(): Translation { return this }
    // 	get a(): number { return this.centralTransform.a }
    // 	get b(): number { return this.centralTransform.b }
    // 	get c(): number { return this.centralTransform.c }
    // 	get d(): number { return this.centralTransform.d }
    // 	constructor(w1?: number | object, w2?: number) {
    // 		super()
    // 		if (w1 == undefined) {
    // 			this.shift = Vertex.origin()
    // 		} else if (typeof w1 == 'number') {
    // 			this.shift = new Vertex(w1, w2)
    // 		} else if (w1 instanceof Array) {
    // 			this.shift = new Vertex(w1)
    // 		} else if (w1 instanceof Vertex) {
    // 			this.shift = w1
    // 		} else {
    // 			this.shift = w1['shift']
    // 		}
    // 	}
    // 	get anchor(): Vertex { throw "Translations have no anchor!" }
    // 	appliedTo(arg1: Vertex | number, arg2?: number): Vertex {
    // 		let x, y: number
    // 		if (!arg2 && arg1 instanceof Vertex) {
    // 			x = arg1.x + this.e
    // 			y = arg1.y + this.f
    // 		} else if (typeof arg1  == 'number') {
    // 			x = arg1 + this.e
    // 			y = arg2 + this.f
    // 		} else {
    // 			throw 'Incorrect arguments for Transform.appliedTo'
    // 		}
    // 		return new Vertex(x, y)
    // 	}
    // 	asString(): string { return `translate(${this.e}px, ${this.f}px)` }
    // 	safeCopyFrom(t: Transform) {
    // 		t.translation.copyFrom(t as Translation)
    // 	}
    // 	rightComposedWith(t: Transform): Transform {
    // 		if (t instanceof Translation) {
    // 			let v: Vertex = this.shift.add(t.shift)
    // 			if (v.isZero()) { return new Identity() }
    // 			else { return new Translation(v) }
    // 		} else {
    // 			return Transform.create(t.copy().centralTransform, this.shift.add(t.shift))
    // 		}
    // 	}
    // 	inverse(): Translation {
    // 		return new Translation({shift: this.shift.opposite()})
    // 	}
    // 	isIdentity(): boolean { return this.shift.isZero() }
    // }
    // export class MatrixTransform extends Affine<CentralMatrixTransform> {
    // 	constructor(arg1: number | object, arg2?: number | Vertex | Array<number>, arg3?: number, arg4?: number, arg5?: number | Vertex | Array<number>, arg6?: number) {
    // 		if (typeof arg1 == 'object') {
    // 			if (arg1 instanceof CentralMatrixTransform) {
    // 				// MatrixTransform(cmt)
    // 				// MatrixTransform(cmt, [5, 6])
    // 				// MatrixTransform(cmt, anchor)
    // 				super({centralTransform: arg1, anchor: arg2})
    // 			} else if (arg1 instanceof Array) {
    // 				// MatrixTransform([1, 2, 3, 4])
    // 				// MatrixTransform([1, 2, 3, 4], [5, 6])
    // 				// MatrixTransform([1, 2, 3, 4], anchor)
    // 				super({centralTransform: new CentralMatrixTransform(arg1), anchor: new Vertex(arg2)})
    // 			} else {
    // 				if (arg1['centralTransform'] == undefined) {
    // 					// MatrixTransform({a: a, b: b, c: c, d: d, anchor: anchor})
    // 					// MatrixTransform({a: a, b: b, c: c, d: d, shift: shift})
    // 					let newArgs: object = {...arg1}
    // 					newArgs['centralTransform'] = new CentralMatrixTransform(arg1['a'], arg1['b'], arg1['c'], arg1['d'])
    // 					delete newArgs['a'], delete newArgs['b'], delete newArgs['a'], delete newArgs['a']
    // 					super(newArgs)
    // 				} else {
    // 					// MatrixTransform({centralTransform: cmt, anchor: anchor})
    // 					// MatrixTransform({centralTransform: cmt, shift: shift})
    // 					super(arg1)
    // 				}
    // 			}
    // 		} else if (typeof arg1 == 'number') {
    // 			if (arg6 == undefined) {
    // 				// MatrixTransform(1, 2, 3, 4)
    // 				// MatrixTransform(1, 2, 3, 4, [5, 6])
    // 				// MatrixTransform(1, 2, 3, 4, anchor)
    // 				super(new CentralMatrixTransform(arg1, arg2 as number, arg3, arg4), new Vertex(arg5))
    // 			} else {
    // 				// MatrixTransform(1, 2, 3, 4, 5, 6)
    // 				super(new CentralMatrixTransform(arg1, arg2 as number, arg3, arg4), new Vertex(arg5, arg6))
    // 			}
    // 		} else {
    // 			throw 'Unrecognized constructor signature for MatrixTransform'
    // 		}
    // 	}
    // 	// getters need to be duplicated here
    // 	get a(): number { return this.centralTransform.a }
    // 	get b(): number { return this.centralTransform.b }
    // 	get c(): number { return this.centralTransform.c }
    // 	get d(): number { return this.centralTransform.d }
    // 	set a(newValue: number) {
    // 		this.assureProperty('centralTransform', CentralMatrixTransform)
    // 		this.centralTransform.a = newValue
    // 	}
    // 	set b(newValue: number) {
    // 		this.assureProperty('centralTransform', CentralMatrixTransform)
    // 		this.centralTransform.b = newValue
    // 	}
    // 	set c(newValue: number) {
    // 		this.assureProperty('centralTransform', CentralMatrixTransform)
    // 		this.centralTransform.c = newValue
    // 	}
    // 	set d(newValue: number) {
    // 		this.assureProperty('centralTransform', CentralMatrixTransform)
    // 		this.centralTransform.d = newValue
    // 	}
    // 	copyFrom(t: Transform) {
    // 		if (t instanceof MatrixTransform) {
    // 			super.copyFrom(t.asMatrixTransform())
    // 		}
    // 	}
    // 	get centralMatrixTransform(): CentralMatrixTransform { return this.centralTransform }
    // 	set centralMatrixTransform(newValue: CentralMatrixTransform) { this.centralTransform.copyFrom(newValue) }
    // }
    // export class Rotation extends Affine<CentralRotation> {
    // 	constructor(arg1: number | object, arg2?: Vertex | Array<number>) {
    // 		if (typeof arg1 == 'object') {
    // 			if (arg1 instanceof CentralRotation) {
    // 				// Rotation(cr)
    // 				// Rotation(cr, [1, 2])
    // 				// Rotation(cr, anchor)
    // 				super({centralTransform: arg1, anchor: new Vertex(arg2)})
    // 			} else {
    // 				if (arg1['centralTransform'] == undefined) {
    // 					// Rotation({angle: TAU/4, anchor: anchor})
    // 					// Rotation({radians: TAU/4, anchor: anchor})
    // 					// Rotation({degrees: 90, anchor: anchor})
    // 					// Rotation({angle: TAU/4, shift: shift})
    // 					// Rotation({radians: TAU/4, shift: shift})
    // 					// Rotation({degrees: TAU/4, shift: shift})
    // 					let radians: number = arg1['angle'] ?? arg1['radians'] ?? arg1['degrees'] * DEGREES
    // 					let newArgs: object = {...arg1}
    // 					newArgs['centralTransform'] = new CentralRotation(radians)
    // 					delete newArgs['angle'], delete newArgs['radians'], delete newArgs['degrees']
    // 					super(newArgs)
    // 				} else {
    // 					// Rotation({centralTransform: cr, anchor: anchor})
    // 					// Rotation({centralTransform: cr, shift: shift})
    // 					super(arg1)
    // 				}
    // 			}
    // 		} else if (typeof arg1 == 'number') {
    // 			// Rotation(TAU/4)
    // 			// Rotation(TAU/4, [1, 2])
    // 			// Rotation(TAU/4, anchor)
    // 			super(new CentralRotation(arg1), new Vertex(arg2))
    // 		} else {
    // 			throw 'Unrecognized call signature for Rotation'
    // 		}
    // 	}
    // 	get angle(): number { return this.centralTransform.angle }
    // 	set angle(newValue: number) {
    // 		this.assureProperty('centralTransform', CentralRotation)
    // 		this.centralTransform.angle = newValue
    // 	}
    // }
    // export class Stretching extends Affine<CentralStretching> {
    // 	constructor(arg1: number | Array<number> | object, arg2?: number | Vertex | Array<number>, arg3?: Vertex | Array<number>) {
    // 		if (typeof arg1 == 'object') {
    // 			if (arg1 instanceof Array) {
    // 				// Stretching([sx, sy])
    // 				// Stretching([sx, sy], [3, 4])
    // 				// Stretching([sx, sy], anchor)
    // 				super(new CentralStretching(arg1), arg2 as (Vertex | Array<number>))
    // 			} else {
    // 				if (arg1 instanceof CentralStretching) {
    // 					// Stretching(cs)
    // 					// Stretching(cs, [3, 4])
    // 					// Stretching(cs, anchor)
    // 					super({centralTransform: arg1, anchor: new Vertex(arg2)})
    // 				} else {
    // 					if (arg1['centralTransform'] == undefined) {
    // 						// Stretching({scaleX: sx, scaleY: sy, anchor: anchor})
    // 						// Stretching({scaleX: sx, scaleY: sy, shift: shift})
    // 						let sx: number = arg1['scaleX'], sy: number = arg1['scaleY']
    // 						let newArgs: object = {...arg1}
    // 						newArgs['centralTransform'] = new CentralStretching(sx, sy)
    // 						delete newArgs['scaleX'], newArgs['scaleY']
    // 						super(newArgs) 
    // 					} else {
    // 						// Stretching({centralTransform: cs, anchor: anchor})
    // 						// Stretching({centralTransform: cs, shift: shift})
    // 						super(arg1)
    // 					}
    // 				}
    // 			}
    // 		} else if (typeof arg1 == 'number') {
    // 			// Stretching(sx, sy)
    // 			// Stretching(sx, sy, [3, 4])
    // 			// Stretching(sx, sy, anchor)
    // 			super(new CentralStretching(arg1, arg2 as number), arg3 as Vertex)
    // 		} else {
    // 			throw 'Unrecognized call signature for Stretching'
    // 		}
    // 	}
    // 	get CentralStretching(): CentralStretching { return this.centralTransform }
    // 	set CentralStretching(newValue: CentralStretching) { this.centralTransform.copyFrom(newValue) }
    // 	get scaleX(): number { return this.centralTransform.scaleX }
    // 	set scaleX(newValue: number) {
    // 		this.assureProperty('centralTransform', CentralStretching)
    // 		this.centralTransform.scaleX = newValue
    // 	}
    // 	get scaleY(): number { return this.centralTransform.scaleY }
    // 	set scaleY(newValue: number) {
    // 		this.assureProperty('centralTransform', CentralStretching)
    // 		this.centralTransform.scaleY = newValue
    // 	}
    // }
    // export class Scaling extends Affine<CentralScaling> {
    // 	constructor(arg1: number | object, arg2?: Vertex | Array<number>) {
    // 		if (typeof arg1 == 'object') {
    // 			if (arg1 instanceof CentralScaling) {
    // 				// Scaling(cs)
    // 				// Scaling(cs, [1, 2])
    // 				// Scaling(cs, anchor)
    // 				super({centralTransform: arg1, anchor: new Vertex(arg2)})
    // 			} else {
    // 				if (arg1['centralTransform'] == undefined) {
    // 					// Scaling({scale: s, anchor: anchor})
    // 					// Scaling({scale: s, shift: shift})
    // 					let s: number = arg1['scale']
    // 					let newArgs: object = {...arg1}
    // 					newArgs['centralTransform'] = new CentralScaling(s)
    // 					delete newArgs['scale']
    // 					super(newArgs)
    // 				} else {
    // 					// Scaling({centralTransform: cs, anchor: anchor})
    // 					// Scaling({centralTransform: cs, shift: shift})
    // 					super(arg1)
    // 				}
    // 			}
    // 		} else if (typeof arg1 == 'number') {
    // 			// Scaling(s)
    // 			// Scaling(s, [1, 2])
    // 			// Scaling(s, anchor)
    // 			super(new CentralScaling(arg1), new Vertex(arg2))
    // 		} else {
    // 			throw 'Unrecognized call signature for Scaling'
    // 		}
    // 	}
    // 	get CentralScaling(): CentralScaling { return this.centralTransform }
    // 	set CentralScaling(newValue: CentralScaling) { this.centralTransform.copyFrom(newValue) }
    // 	get scale(): number { return this.centralTransform.scale }
    // 	set scale(newValue: number) {
    // 		this.assureProperty('centralTransform', CentralScaling)
    // 		this.centralTransform.scale = newValue
    // 	}
    // }

    class Color {
        constructor(r, g, b, a = 1) {
            this.red = r;
            this.green = g;
            this.blue = b;
            this.alpha = a;
        }
        brighten(factor) {
            return new Color(factor * this.red, factor * this.green, factor * this.blue, this.alpha);
        }
        toHex() {
            let hex_r = (Math.round(this.red * 255)).toString(16).padStart(2, '0');
            let hex_g = (Math.round(this.green * 255)).toString(16).padStart(2, '0');
            let hex_b = (Math.round(this.blue * 255)).toString(16).padStart(2, '0');
            let hex_a = '';
            if (this.alpha != 1) {
                hex_a = (Math.round(this.alpha * 255)).toString(16).padStart(2, '0');
            }
            return '#' + hex_r + hex_g + hex_b + hex_a;
        }
        toCSS() {
            return `rgb(${255 * this.red}, ${255 * this.green}, ${255 * this.blue}, ${this.alpha})`;
        }
        withAlpha(a, premultiplied = false) {
            return new Color(this.red, this.green, this.blue, premultiplied ? a * this.alpha : a);
        }
        static fromHex(hex) {
            let r = parseInt('0x' + hex.slice(1, 2)) / 255;
            let g = parseInt('0x' + hex.slice(3, 2)) / 255;
            let b = parseInt('0x' + hex.slice(5, 2)) / 255;
            let a = 1;
            if (hex.length > 7) {
                a = parseInt('0x' + hex.slice(7, 2)) / 255;
            }
            return new Color(r, g, b, a);
        }
        static clear() { return new Color(0, 0, 0, 0); }
        static gray(x) { return new Color(x, x, x); }
        static black() { return Color.gray(0); }
        static white() { return Color.gray(1); }
        static red() { return new Color(1, 0, 0); }
        static orange() { return new Color(1, 0.5, 0); }
        static yellow() { return new Color(1, 1, 0); }
        static green() { return new Color(0, 1, 0); }
        static blue() { return new Color(0, 0, 1); }
        static indigo() { return new Color(0.5, 0, 1); }
        static violet() { return new Color(1, 0, 1); }
    }
    const COLOR_PALETTE = {
        'white': Color.white(),
        'red': Color.red(),
        'orange': Color.orange(),
        'yellow': Color.yellow(),
        'green': Color.green(),
        'blue': Color.blue(),
        'indigo': Color.indigo(),
        'violet': Color.violet()
    };

    class Dependency {
        constructor(argsDict = {}) {
            this.source = argsDict['source'];
            this.outputName = argsDict['outputName']; // may be undefined
            this.target = argsDict['target'];
            this.inputName = argsDict['inputName']; // may be undefined
        }
    }

    const isTouchDevice = 'ontouchstart' in document.documentElement;
    const DRAW_BORDER = false;
    function stringFromPoint(point) {
        // a string representation for CSS
        let x = point[0], y = point[1];
        return `${x} ${y}`;
    }
    function remove(arr, value, all = false) {
        // remove an object from an Array
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                arr.splice(i, 1);
                if (!all) {
                    break;
                }
            }
        }
    }
    // any Event that has an associated location on the screen
    // it can be triggered by a mouse, a finger or a stylus
    function pointerEventPageLocation(e) {
        // subtract the sidebar's width if necessary
        // i. e. if running in the browser (minter.html)
        // instead of in the app (paper.html)
        let sidebarWidth = 0;
        try {
            let sidebar = document.querySelector('#sidebar');
            sidebarWidth = sidebar.clientWidth;
        }
        catch (_a) {
        }
        let t = null;
        if (e instanceof MouseEvent) {
            t = e;
        }
        else {
            t = e.changedTouches[0];
        }
        return [t.pageX - sidebarWidth, t.pageY];
    }
    function pointerEventVertex(e) {
        return new Vertex(pointerEventPageLocation(e));
    }
    function addPointerDown(element, method) {
        element.addEventListener('touchstart', method, { capture: true });
        element.addEventListener('mousedown', method, { capture: true });
    }
    function removePointerDown(element, method) {
        element.removeEventListener('touchstart', method, { capture: true });
        element.removeEventListener('mousedown', method, { capture: true });
    }
    function addPointerMove(element, method) {
        element.addEventListener('touchmove', method, { capture: true });
        element.addEventListener('mousemove', method, { capture: true });
    }
    function removePointerMove(element, method) {
        element.removeEventListener('touchmove', method, { capture: true });
        element.removeEventListener('mousemove', method, { capture: true });
    }
    function addPointerUp(element, method) {
        element.addEventListener('touchend', method, { capture: true });
        element.addEventListener('mouseup', method, { capture: true });
        element.addEventListener('pointerup', method, { capture: true });
    }
    function removePointerUp(element, method) {
        element.removeEventListener('touchend', method, { capture: true });
        element.removeEventListener('mouseup', method, { capture: true });
        element.removeEventListener('pointerup', method, { capture: true });
    }

    class Mobject extends ExtendedObject {
        constructor(argsDict = {}, superCall = false) {
            super({}, true);
            let initialArgs = this.defaultArgs();
            Object.assign(initialArgs, argsDict);
            Object.assign(initialArgs, this.fixedArgs());
            this.statelessSetup();
            //// updating
            if (!superCall) {
                this.setAttributes(initialArgs);
                this.statefulSetup();
                this.update();
            }
        }
        defaultArgs() {
            return {
                transform: Transform.identity(),
                viewWidth: 100,
                viewHeight: 100,
                children: [],
                visible: true,
                opacity: 1.0,
                backgroundColor: Color.clear(),
                drawBorder: DRAW_BORDER,
                dependencies: [],
                interactive: false,
                vetoOnStopPropagation: false,
                passAlongEvents: true,
                draggable: false,
                snappablePoints: [],
                view: document.createElement('div')
            };
        }
        fixedArgs() {
            return {};
        }
        statelessSetup() {
            //// state-independent setup
            this.eventTarget = null;
            this.boundPointerDown = this.pointerDown.bind(this);
            this.boundPointerMove = this.pointerMove.bind(this);
            this.boundPointerUp = this.pointerUp.bind(this);
            this.boundEventTargetMobject = this.eventTargetMobject.bind(this);
            //this.boundUpdate = this.update.bind(this)
            this.savedSelfHandlePointerDown = this.selfHandlePointerDown;
            this.savedSelfHandlePointerMove = this.selfHandlePointerMove;
            this.savedSelfHandlePointerUp = this.selfHandlePointerUp;
            this.disableDragging();
            // this.boundCreatePopover = this.createPopover.bind(this)
            // this.boundDismissPopover = this.dismissPopover.bind(this)
            // this.boundMouseUpAfterCreatingPopover = this.mouseUpAfterCreatingPopover.bind(this)
        }
        statefulSetup() {
            this.setupView();
            addPointerDown(this.view, this.boundPointerDown);
        }
        // position and hierarchy
        get anchor() {
            return this.transform.anchor;
        }
        set anchor(newValue) {
            if (!this.transform) {
                this.transform = Transform.identity();
            }
            this.transform.anchor = newValue;
        }
        centerAt(newCenter, frame) {
            // If there is no frame, use the parent's coordinate frame. If there is no parent yet, use local coordinates
            frame = frame || this.parent || this;
            let dr = newCenter.subtract(this.center(frame));
            let oldAnchor = this.anchor.copy();
            this.anchor = this.anchor.translatedBy(dr[0], dr[1]);
        }
        relativeTransform(frame) {
            // If there is no frame, use the parent's coordinate frame. If there is no parent yet, use local coordinates
            frame = frame || this.parent || this;
            let t = Transform.identity();
            let mob = this;
            while (mob && mob.transform instanceof Transform) {
                if (mob == frame) {
                    break;
                }
                t.leftComposeWith(new Transform({ shift: mob.anchor }));
                t.leftComposeWith(mob.transform);
                mob = mob.parent;
            }
            return t;
        }
        transformLocalPoint(point, frame) {
            let t = this.relativeTransform(frame);
            return t.appliedTo(point);
        }
        // The following geometric properties are first computed from the view frame.
        // The versions without "view" in the name can be overriden by subclasses,
        // e. g. SVGMobjects.
        viewULCorner(frame) {
            return this.transformLocalPoint(Vertex.origin(), frame);
        }
        viewURCorner(frame) {
            return this.transformLocalPoint(new Vertex(this.viewWidth, 0), frame);
        }
        viewLLCorner(frame) {
            return this.transformLocalPoint(new Vertex(0, this.viewHeight), frame);
        }
        viewLRCorner(frame) {
            return this.transformLocalPoint(new Vertex(this.viewWidth, this.viewHeight), frame);
        }
        viewXMin(frame) { return this.viewULCorner(frame).x; }
        viewXMax(frame) { return this.viewLRCorner(frame).x; }
        viewYMin(frame) { return this.viewULCorner(frame).y; }
        viewYMax(frame) { return this.viewLRCorner(frame).y; }
        viewCenter(frame) {
            return this.transformLocalPoint(new Vertex(this.viewWidth / 2, this.viewHeight / 2), frame);
        }
        viewMidX(frame) { return this.viewCenter(frame).x; }
        viewMidY(frame) { return this.viewCenter(frame).y; }
        viewLeftCenter(frame) { return new Vertex(this.viewXMin(frame), this.viewMidY(frame)); }
        viewRightCenter(frame) { return new Vertex(this.viewXMax(frame), this.viewMidY(frame)); }
        viewTopCenter(frame) { return new Vertex(this.viewMidX(frame), this.viewYMin(frame)); }
        viewBottomCenter(frame) { return new Vertex(this.viewMidX(frame), this.viewYMax(frame)); }
        // Equivalent (by default) versions without "view" in the name
        ulCorner(frame) { return this.viewULCorner(frame); }
        urCorner(frame) { return this.viewURCorner(frame); }
        llCorner(frame) { return this.viewLLCorner(frame); }
        lrCorner(frame) { return this.viewLRCorner(frame); }
        xMin(frame) { return this.viewXMin(frame); }
        xMax(frame) { return this.viewXMax(frame); }
        yMin(frame) { return this.viewYMin(frame); }
        yMax(frame) { return this.viewYMax(frame); }
        center(frame) { return this.viewCenter(frame); }
        midX(frame) { return this.viewMidX(frame); }
        midY(frame) { return this.viewMidY(frame); }
        leftCenter(frame) { return this.viewLeftCenter(frame); }
        rightCenter(frame) { return this.viewRightCenter(frame); }
        topCenter(frame) { return this.viewTopCenter(frame); }
        bottomCenter(frame) { return this.viewBottomCenter(frame); }
        // Local versions (relative to own coordinate system)
        localULCorner() { return this.ulCorner(this); }
        localURCorner() { return this.urCorner(this); }
        localLLCorner() { return this.llCorner(this); }
        localLRCorner() { return this.lrCorner(this); }
        localXMin() { return this.xMin(this); }
        localXMax() { return this.xMax(this); }
        localYMin() { return this.yMin(this); }
        localYMax() { return this.yMax(this); }
        localCenter() { return this.center(this); }
        localMidX() { return this.midX(this); }
        localMidY() { return this.midY(this); }
        localLeftCenter() { return this.leftCenter(this); }
        localRightCenter() { return this.rightCenter(this); }
        localTopCenter() { return this.topCenter(this); }
        localBottomCenter() { return this.bottomCenter(this); }
        get superMobject() { return this.parent; }
        set superMobject(newValue) { this.parent = newValue; }
        // move to update?
        get parent() { return this._parent; }
        set parent(newValue) {
            var _a;
            (_a = this.view) === null || _a === void 0 ? void 0 : _a.remove();
            this._parent = newValue;
            if (newValue == undefined) {
                return;
            }
            newValue.add(this);
            if (this.parent.visible) {
                this.show();
            }
            else {
                this.hide();
            }
        }
        get submobjects() { return this.children; }
        set submobjects(newValue) {
            this.children = newValue;
        }
        get submobs() { return this.submobjects; }
        set submobs(newValue) {
            this.submobs = newValue;
        }
        // view and style
        setupView() {
            this.view['mobject'] = this;
            if (this.superMobject) {
                this.superMobject.view.appendChild(this.view);
            }
            addPointerDown(this.view, this.boundPointerDown); // TODO: move
            //this.positionView()
            this.view.setAttribute('class', 'mobject-div ' + this.constructor.name);
            this.view.style.transformOrigin = 'top left';
            this.view.style.position = 'absolute'; // 'absolute' positions it relative (sic) to its parent
            this.view.style.overflow = 'visible';
        }
        positionView() {
            if (!this.view) {
                return;
            }
            this.view.style.border = this.drawBorder ? '1px dashed green' : 'none';
            this.view.style['transform'] = this.transform.asString();
            this.view.style['width'] = this.viewWidth.toString() + 'px';
            this.view.style['height'] = this.viewHeight.toString() + 'px';
            if (this.anchor != undefined) {
                this.view.style['left'] = this.anchor.x.toString() + 'px';
                this.view.style['top'] = this.anchor.y.toString() + 'px';
            }
        }
        add(submob) {
            if (submob.parent != this) {
                submob.parent = this;
            }
            if (this.children == undefined) {
                console.error(`Please add submob ${submob.constructor.name} to ${this.constructor.name} later, in statefulSetup()`);
            }
            if (!this.children.includes(submob)) {
                this.children.push(submob);
            }
            this.view.append(submob.view);
            submob.redraw();
        }
        remove(submob) {
            submob.view.remove();
            remove(this.children, submob);
            submob.parent = undefined;
        }
        redrawSelf() { }
        redrawSubmobs() {
            for (let submob of this.children || []) {
                submob.redraw();
            }
        }
        redraw(recursive = true) {
            try {
                if (!this.view) {
                    return;
                }
                this.positionView();
                this.view.style['background-color'] = this.backgroundColor.toCSS();
                //if (!this.visible || !this.parent) { return }
                this.redrawSelf();
                if (recursive) {
                    this.redrawSubmobs();
                }
            }
            catch (_a) {
                console.warn(`Unsuccessfully tried to draw ${this.constructor.name} (too soon?)`);
            }
        }
        getPaper() {
            let p = this;
            while (p != undefined && p.constructor.name != 'Paper') {
                p = p.parent;
            }
            return p;
        }
        show() {
            try {
                if (!this.view) {
                    return;
                }
                this.visible = true;
                this.view.style["visibility"] = "visible";
                for (let submob of this.children) {
                    submob.show();
                } // we have to propagate visibility bc we have to for invisibility
                this.redraw();
            }
            catch (_a) {
                console.warn(`Unsuccessfully tried to show ${this.constructor.name} (too soon?)`);
            }
        }
        hide() {
            try {
                if (!this.view) {
                    return;
                }
                this.visible = false;
                this.view.style["visibility"] = "hidden";
                for (let submob of this.children) {
                    submob.hide();
                } // we have to propagate invisibility
                this.redraw();
            }
            catch (_a) {
                console.warn(`Unsuccessfully tried to hide ${this.constructor.name} (too soon?)`);
            }
        }
        recursiveShow() {
            this.show();
            for (let depmob of this.allDependents()) {
                depmob.show();
            }
        }
        recursiveHide() {
            this.hide();
            for (let depmob of this.allDependents()) {
                depmob.hide();
            }
        }
        // dependency
        dependents() {
            let dep = [];
            for (let d of this.dependencies) {
                dep.push(d.target);
            }
            return dep;
        }
        allDependents() {
            let dep = this.dependents();
            for (let mob of dep) {
                dep.push(...mob.allDependents());
            }
            return dep;
        }
        dependsOn(otherMobject) {
            return otherMobject.allDependents().includes(this);
        }
        addDependency(outputName, target, inputName) {
            if (this.dependsOn(target)) {
                throw 'Circular dependency!';
            }
            let dep = new Dependency({
                source: this,
                outputName: outputName,
                target: target,
                inputName: inputName
            });
            this.dependencies.push(dep);
        }
        addDependent(target) {
            this.addDependency(null, target, null);
        }
        initialUpdate(argsDict = {}, superCall = false) {
            if (superCall) {
                this.setAttributes(argsDict);
            }
            else {
                this.update(argsDict);
            }
        }
        updateModel(argsDict = {}) {
            this.setAttributes(argsDict);
            //this.positionView()
            this.updateSubmobs();
            for (let dep of this.dependencies || []) {
                let outputName = this[dep.outputName]; // may be undefined
                if (typeof outputName === 'function') {
                    dep.target[dep.inputName] = outputName.bind(this)();
                }
                else if (outputName != undefined && outputName != null) {
                    dep.target[dep.inputName] = outputName;
                }
                dep.target.update();
            }
        }
        update(argsDict = {}, redraw = true) {
            this.updateModel(argsDict);
            if (redraw) {
                this.redraw();
            }
        }
        updateSubmobs() {
            for (let submob of this.children || []) {
                if (!this.dependsOn(submob)) { // prevent dependency loops
                    submob.update({}, false);
                }
            }
        }
        // interactivity
        // empty method as workaround (don't ask)
        removeFreePoint(fp) { }
        selfHandlePointerDown(e) { }
        selfHandlePointerMove(e) { }
        selfHandlePointerUp(e) { }
        savedSelfHandlePointerDown(e) { }
        savedSelfHandlePointerMove(e) { }
        savedSelfHandlePointerUp(e) { }
        boundPointerDown(e) { }
        boundPointerMove(e) { }
        boundPointerUp(e) { }
        boundEventTargetMobject(e) { return this; }
        enableDragging() {
            this.previousPassAlongEvents = this.passAlongEvents;
            this.passAlongEvents = false;
            this.savedSelfHandlePointerDown = this.selfHandlePointerDown;
            this.savedSelfHandlePointerMove = this.selfHandlePointerMove;
            this.savedSelfHandlePointerUp = this.selfHandlePointerUp;
            this.selfHandlePointerDown = this.startSelfDragging;
            this.selfHandlePointerMove = this.selfDragging;
            this.selfHandlePointerUp = this.endSelfDragging;
        }
        disableDragging() {
            if (this.previousPassAlongEvents != undefined) {
                this.passAlongEvents = this.previousPassAlongEvents;
            }
            this.selfHandlePointerDown = this.savedSelfHandlePointerDown;
            this.selfHandlePointerMove = this.savedSelfHandlePointerMove;
            this.selfHandlePointerUp = this.savedSelfHandlePointerUp;
        }
        eventTargetMobject(e) {
            var t = e.target;
            if (t.tagName == 'path') {
                t = t.parentElement.parentElement;
            }
            if (t == this.view) {
                return this;
            }
            let targetViewChain = [t];
            while (t != undefined && t != this.view) {
                t = t.parentElement;
                targetViewChain.push(t);
            }
            console.log(targetViewChain);
            t = targetViewChain.pop();
            t = targetViewChain.pop();
            while (t != undefined) {
                if (t['mobject'] != undefined) {
                    let r = t['mobject'];
                    //console.log('event target mob:', r)
                    return r;
                }
                t = targetViewChain.pop();
            }
            // if all of this fails, you need to handle the event yourself
            //console.log('event target mob:', this)
            return this;
        }
        pointerDown(e) {
            this.eventTarget = this.boundEventTargetMobject(e);
            if (this.eventTarget.vetoOnStopPropagation) {
                return;
            }
            e.stopPropagation();
            removePointerDown(this.view, this.boundPointerDown);
            addPointerMove(this.view, this.boundPointerMove);
            addPointerUp(this.view, this.boundPointerUp);
            console.log('event target on ', this, 'is', this.eventTarget);
            if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
                console.log('passing on');
                this.eventTarget.pointerDown(e);
            }
            else {
                console.log(`handling myself, and I am a ${this.constructor.name}`);
                this.selfHandlePointerDown(e);
            }
        }
        pointerMove(e) {
            //console.log(this, "event target:", this.eventTarget)
            if (this.eventTarget.vetoOnStopPropagation) {
                return;
            }
            e.stopPropagation();
            if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
                //console.log("passing on")
                this.eventTarget.pointerMove(e);
            }
            else {
                //console.log(`handling myself, and I am a ${this.constructor.name}`)
                this.selfHandlePointerMove(e);
            }
        }
        pointerUp(e) {
            if (this.eventTarget.vetoOnStopPropagation) {
                return;
            }
            e.stopPropagation();
            removePointerMove(this.view, this.boundPointerMove);
            removePointerUp(this.view, this.boundPointerUp);
            addPointerDown(this.view, this.boundPointerDown);
            if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
                this.eventTarget.pointerUp(e);
            }
            else {
                this.selfHandlePointerUp(e);
            }
            this.eventTarget = null;
        }
        startSelfDragging(e) {
            this.dragPointStart = pointerEventVertex(e);
            this.dragAnchorStart = this.anchor;
        }
        selfDragging(e) {
            console.log('selfDragging');
            let dragPoint = pointerEventVertex(e);
            let dr = dragPoint.subtract(this.dragPointStart);
            this.update({
                anchor: this.dragAnchorStart.add(dr)
            }, true);
        }
        endSelfDragging(e) {
            this.dragPointStart = undefined;
            this.dragAnchorStart = undefined;
        }
    }
    class VMobject extends Mobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                fillColor: Color.white(),
                fillOpacity: 0,
                strokeColor: Color.white(),
                strokeWidth: 1,
            });
        }
        statelessSetup() {
            super.statelessSetup();
            this.vertices = [];
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.svg['mobject'] = this;
            this.path['mobject'] = this;
            this.svg.appendChild(this.path);
            this.svg.setAttribute('class', 'mobject-svg');
            this.svg.style.overflow = 'visible';
        }
        statefulSetup() {
            super.statefulSetup();
            this.view.appendChild(this.svg); // why not just add?
            this.view.setAttribute('class', this.constructor.name + ' mobject-div');
        }
        redrawSelf() {
            let pathString = this.pathString();
            if (pathString.includes('NaN')) {
                return;
            }
            this.path.setAttribute('d', pathString);
            this.path.style['fill'] = this.fillColor.toHex();
            this.path.style['fill-opacity'] = this.fillOpacity.toString();
            this.path.style['stroke'] = this.strokeColor.toHex();
            this.path.style['stroke-width'] = this.strokeWidth.toString();
        }
        pathString() {
            console.warn('please subclass pathString');
            return '';
        }
        relativeVertices(frame) {
            let returnValue = this.relativeTransform(frame).appliedToVertices(this.vertices);
            if (returnValue == undefined) {
                return [];
            }
            else {
                return returnValue;
            }
        }
        globalVertices() {
            return this.relativeVertices(); // uses default frame = paper
        }
        localXMin() {
            let xMin = Infinity;
            if (this.vertices != undefined) {
                for (let p of this.vertices) {
                    xMin = Math.min(xMin, p.x);
                }
            }
            if (this.children != undefined) {
                for (let mob of this.children) {
                    xMin = Math.min(xMin, mob.localXMin() + mob.anchor.x);
                }
            }
            return xMin;
        }
        localXMax() {
            let xMax = -Infinity;
            if (this.vertices != undefined) {
                for (let p of this.vertices) {
                    xMax = Math.max(xMax, p.x);
                }
            }
            if (this.children != undefined) {
                for (let mob of this.children) {
                    xMax = Math.max(xMax, mob.localXMax() + mob.anchor.x);
                }
            }
            return xMax;
        }
        localYMin() {
            let yMin = Infinity;
            if (this.vertices != undefined) {
                for (let p of this.vertices) {
                    yMin = Math.min(yMin, p.y);
                }
            }
            if (this.children != undefined) {
                for (let mob of this.children) {
                    yMin = Math.min(yMin, mob.localYMin() + mob.anchor.y);
                }
            }
            return yMin;
        }
        localYMax() {
            let yMax = -Infinity;
            if (this.vertices != undefined) {
                for (let p of this.vertices) {
                    yMax = Math.max(yMax, p.y);
                }
            }
            if (this.children != undefined) {
                for (let mob of this.children) {
                    yMax = Math.max(yMax, mob.localYMax() + mob.anchor.y);
                }
            }
            return yMax;
        }
        localULCorner() {
            return new Vertex(this.localXMin(), this.localYMin());
        }
        getWidth() { return this.localXMax() - this.localXMin(); }
        getHeight() { return this.localYMax() - this.localYMin(); }
        adjustFrame() {
            let shift = new Transform({ shift: this.localULCorner() });
            let inverseShift = shift.inverse();
            let updateDict = {};
            for (let [key, value] of Object.entries(this)) {
                var newValue;
                if (value instanceof Vertex) {
                    newValue = inverseShift.appliedTo(value);
                }
                else if (value instanceof Array && value.length > 0) {
                    newValue = [];
                    if (!(value[0] instanceof Vertex)) {
                        continue;
                    }
                    for (let v of value) {
                        newValue.push(inverseShift.appliedTo(v));
                    }
                }
                else {
                    continue;
                }
                updateDict[key] = newValue;
            }
            updateDict['anchor'] = shift.appliedTo(this.anchor);
            updateDict['viewWidth'] = this.getWidth();
            updateDict['viewHeight'] = this.getHeight();
            console.log(updateDict);
            this.update(updateDict);
        }
    }
    class CurvedShape extends VMobject {
        updateBezierPoints() { }
        // implemented by subclasses
        updateModel(argsDict = {}) {
            super.updateModel(argsDict);
            this.updateBezierPoints();
        }
        // globalBezierPoints(): Array<Vertex> {
        // 	return this.globalTransform().appliedTo(this.bezierPoints)
        // }
        // redrawSelf() {
        // 	this.updateBezierPoints()
        // 	super.redrawSelf()
        // }
        pathString() {
            //let points: Array<Vertex> = this.globalBezierPoints()
            let points = this.bezierPoints;
            if (points == undefined || points.length == 0) {
                return '';
            }
            // there should be 3n+1 points
            let nbCurves = (points.length - 1) / 3;
            if (nbCurves % 1 != 0) {
                throw 'Incorrect number of Bézier points';
            }
            let pathString = 'M' + stringFromPoint(points[0]);
            for (let i = 0; i < nbCurves; i++) {
                let point1str = stringFromPoint(points[3 * i + 1]);
                let point2str = stringFromPoint(points[3 * i + 2]);
                let point3str = stringFromPoint(points[3 * i + 3]);
                pathString += 'C' + point1str + ' ' + point2str + ' ' + point3str;
            }
            pathString += 'Z';
            return pathString;
        }
        get bezierPoints() { return this._bezierPoints; }
        set bezierPoints(newValue) {
            this._bezierPoints = newValue;
            let v = [];
            let i = 0;
            for (let p of this.bezierPoints) {
                if (i % 3 == 1) {
                    v.push(p);
                }
                i += 1;
            }
            this.vertices = v;
        }
    }
    // export class Popover extends CurvedShape {
    //     constructor(sourceMobject, width, height, direction = 'right') {
    //         super()
    //         this.sourceMobject = sourceMobject
    //         this.anchor = sourceMobject.anchor.translatedBy(sourceMobject.rightEdge())
    //         // sourceMobject != parentMobject because using the latter
    //         // conflicts with the z hierarchy
    //         let tipSize = 10
    //         let cornerRadius = 30
    //         this.fillColor = 'white'
    //         this.strokeColor = 'black'
    //         this.strokeWidth = 1
    //         if (direction == 'right') {
    //             let bezierPoints = Vertex.vertices([
    //                 [0, 0], [0, 0],
    //                 [tipSize, tipSize], [tipSize, tipSize], [tipSize, tipSize],
    //                 [tipSize, height/2 - cornerRadius], [tipSize, height/2 - cornerRadius], [tipSize, height/2],
    //                 [tipSize, height/2], [tipSize + cornerRadius, height/2], [tipSize + cornerRadius, height/2],
    //                 [tipSize + width - cornerRadius, height/2], [tipSize + width - cornerRadius, height/2], [tipSize + width, height/2],
    //                 [tipSize + width, height/2], [tipSize + width, height/2 - cornerRadius], [tipSize + width, height/2 - cornerRadius],
    //                 [tipSize + width, -height/2 + cornerRadius], [tipSize + width, -height/2 + cornerRadius], [tipSize + width, -height/2],
    //                 [tipSize + width, -height/2], [tipSize + width - cornerRadius, -height/2], [tipSize + width - cornerRadius, -height/2],
    //                 [tipSize + cornerRadius, -height/2], [tipSize + cornerRadius, -height/2], [tipSize, -height/2], 
    //                 [tipSize, -height/2], [tipSize, -height/2 + cornerRadius], [tipSize, -height/2 + cornerRadius],
    //                 [tipSize, -tipSize], [tipSize, -tipSize], [tipSize, -tipSize],
    //                 [0, 0], [0, 0]
    //             ])
    //             // let translatedBezierPoints = []
    //             // for (let point of bezierPoints) {
    //             //     point.translateBy(this.anchor)
    //             // }
    //             this.bezierPoints = bezierPoints
    //         }
    //         this.closeButton = new TextLabel('X')
    //         this.closeButton.anchor = new Vertex(70, -130)
    //         this.boundDismiss = this.dismiss.bind(this)
    //         this.closeButton.view.addEventListener('click', this.boundDismiss)
    //         this.add(this.closeButton)
    //         this.deleteButton = new TextLabel('🗑')
    //         this.deleteButton.anchor = new Vertex(65, 140)
    //         this.boundDelete = this.delete.bind(this)
    //         this.deleteButton.view.addEventListener('click', this.boundDelete)
    //         this.add(this.deleteButton)
    //     }
    //     dismiss(e) {
    //         this.sourceMobject.dismissPopover(e)
    //     }
    //     delete(e) {
    //         this.dismiss(e)
    //     }
    // }

    class Circle extends CurvedShape {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                midpoint: Vertex.origin(),
                radius: 10
            });
        }
        updateModel(argsDict = {}) {
            let r = argsDict['radius'] || this.radius;
            let a = argsDict['anchor'];
            if (a != undefined) {
                argsDict['midpoint'] = a.translatedBy(r, r);
            }
            else {
                let m = argsDict['midpoint'] || this.midpoint;
                argsDict['anchor'] = m.translatedBy(-r, -r);
            }
            argsDict['viewWidth'] = 2 * r;
            argsDict['viewHeight'] = 2 * r;
            super.updateModel(argsDict);
        }
        updateBezierPoints() {
            let newBezierPoints = [];
            let n = 8;
            for (let i = 0; i <= n; i++) {
                let theta = i / n * 2 * Math.PI;
                let d = this.radius * 4 / 3 * Math.tan(Math.PI / (2 * n));
                let radialUnitVector = new Vertex(Math.cos(theta), Math.sin(theta));
                let tangentUnitVector = new Vertex(-Math.sin(theta), Math.cos(theta));
                let anchorPoint = radialUnitVector.scaledBy(this.radius);
                let leftControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(-d));
                let rightControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(d));
                if (i != 0) {
                    newBezierPoints.push(leftControlPoint);
                }
                newBezierPoints.push(anchorPoint);
                if (i != n) {
                    newBezierPoints.push(rightControlPoint);
                }
            }
            let translatedBezierPoints = [];
            for (let i = 0; i < newBezierPoints.length; i++) {
                translatedBezierPoints.push(newBezierPoints[i].translatedBy(this.radius, this.radius));
            }
            this.bezierPoints = translatedBezierPoints;
            // do NOT update the view, because redraw calls updateBezierPoints
        }
    }

    // let f = new Mobject({
    // 	anchor: new Vertex(200, 100),
    // 	viewWidth: 150,
    // 	viewHeight: 50
    // })
    // f.redraw()
    let c = new Circle({
        midpoint: new Vertex(50, 50),
        radius: 60,
        fillColor: Color.green(),
        fillOpacity: 1,
        strokeColor: Color.red()
    });
    c.redraw();
    document.querySelector('#paper').appendChild(c.view);

}());
