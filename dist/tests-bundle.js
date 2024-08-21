(function () {
    'use strict';

    // Problem: When updating a Mobject with setAttributes(argsDict),
    // some attributes should only be copied (passed by value),
    // not linked (passed by reference). This mainly concerns Vertex.
    // E. g. if one Mobject's anchor is set to another's by reference,
    //these two attributes now point to the same object. Changing one
    // Mobject's anchor now changes the other's as well.
    // The issue stems from the fact that a Vertex is an object
    // even though it should just be a "dumb" list of numbers (a struct)
    // without a persistent identity.
    // Solution: An ExtendedObject has a flag passedByValue, which
    // is taken into account when updating a Mobject's attribute with
    // such an ExtendedObject as argument.
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
            // always change an object via this method,
            // it will automatically check for mutability
            // and pick the right setter method
            for (let [key, value] of Object.entries(argsDict)) {
                let setter = this.setter(key);
                if (setter != undefined) {
                    if (Object.keys(this.fixedArgs()).includes(key) && this[key] != undefined) {
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
        copyAttributesFrom(obj, attrs) {
            let updateDict = {};
            for (let attr of attrs) {
                updateDict[attr] = obj[attr];
            }
            this.setAttributes(updateDict);
        }
        fixedArgs() { return {}; }
        // filled upon subclassing
        assureProperty(key, cons) {
            // for proper initialization:
            // this initializes a property
            // just in case it is uninitialized
            // (so a properly initialized property
            // does not get overwritten by mistake either)
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
        copy() {
            let obj = new ExtendedObject();
            obj.copyAttributesFrom(this, Object.keys(this));
            return obj;
        }
        toString() {
            return this.constructor.name;
        }
    }

    const TAU = 2 * Math.PI;
    const DEGREES = TAU / 360;

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
            let ret = [];
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

    // testing whether objects get created properly
    // esp. passing properties by value (Vertex, Transform) of by reference (anything else)
    class MyExtObject extends ExtendedObject {
    }
    function ExtendedObjectTest() {
        let v = new Vertex(1, 2);
        let a = new Vertex(3, 4);
        let t = new Transform({
            anchor: a,
            scale: 2
        });
        let eobj = new MyExtObject({
            vertex: v,
            transform: t,
            array: a
        });
        // testing which changes will stick to the original objects
        eobj.vertex.x = 7; // shouldn't affect v
        eobj.transform.scale = -1; // shouldn't affect t
        eobj.array.push('c'); // should affect a
        console.log(v, t, a, eobj);
    }
    class MyExtObject2 extends MyExtObject {
        constructor() {
            super(...arguments);
            this.vertex = new Vertex(7, 8);
            this.blip = 1;
        }
    }
    let eobj2 = new MyExtObject2();
    console.log(eobj2.vertex, eobj2.blip, eobj2);

    ExtendedObjectTest();

})();
