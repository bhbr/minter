var Sidebar = (function (exports) {
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

    window.emulatePen = false;
    const isTouchDevice = (document.body.className == 'ipad');
    // this includes PointerEvent (subclass of MouseEvent)
    var ScreenEventDevice;
    (function (ScreenEventDevice) {
        ScreenEventDevice[ScreenEventDevice["Mouse"] = 0] = "Mouse";
        ScreenEventDevice[ScreenEventDevice["Finger"] = 1] = "Finger";
        ScreenEventDevice[ScreenEventDevice["Pen"] = 2] = "Pen";
        ScreenEventDevice[ScreenEventDevice["Unknown"] = 3] = "Unknown";
    })(ScreenEventDevice || (ScreenEventDevice = {}));
    var ScreenEventType;
    (function (ScreenEventType) {
        ScreenEventType[ScreenEventType["Down"] = 0] = "Down";
        ScreenEventType[ScreenEventType["Move"] = 1] = "Move";
        ScreenEventType[ScreenEventType["Up"] = 2] = "Up";
        ScreenEventType[ScreenEventType["Cancel"] = 3] = "Cancel";
        ScreenEventType[ScreenEventType["Unknown"] = 4] = "Unknown";
    })(ScreenEventType || (ScreenEventType = {}));
    var ScreenEventHandler;
    (function (ScreenEventHandler) {
        ScreenEventHandler[ScreenEventHandler["Auto"] = 0] = "Auto";
        // e.g. for CindyJS canvas
        ScreenEventHandler[ScreenEventHandler["Below"] = 1] = "Below";
        // e. g. for the interior of a TwoPointCircle
        ScreenEventHandler[ScreenEventHandler["Self"] = 2] = "Self";
        ScreenEventHandler[ScreenEventHandler["Parent"] = 3] = "Parent"; // let the parent handle it, even if the target (this mob or a submob) could handle it
        // i. e. this disables the interactivity of the mobjects and of all its submobs
        // General rule: the event is handled by the lowest submob that can handle it
        // and that is not underneath a PassUp
        // If the event policies end in a loop, no one handles it
    })(ScreenEventHandler || (ScreenEventHandler = {}));
    function eventVertex(e) {
        // subtract the sidebar's width if necessary
        // i. e. if running in the browser (minter.html)
        // instead of in the app (paper.html)
        var sidebarWidth = 0;
        let sidebarView = document.querySelector('#sidebar_id');
        if (sidebarView !== null) {
            // we are in the browser
            sidebarWidth = sidebarView.clientWidth;
        }
        let t = null;
        if (e instanceof MouseEvent) {
            t = e;
        }
        else {
            t = e.changedTouches[0];
        }
        //log(`pageXY: ${t.pageX}, ${t.pageY}`)
        return new Vertex(t.pageX - sidebarWidth, t.pageY);
    }
    function screenEventType(e) {
        if (e.type == 'pointerdown' || e.type == 'mousedown' || e.type == 'touchstart') {
            return ScreenEventType.Down;
        }
        if (e.type == 'pointermove' || e.type == 'mousemove' || e.type == 'touchmove') {
            return ScreenEventType.Move;
        }
        if (e.type == 'pointerup' || e.type == 'mouseup' || e.type == 'touchend') {
            return ScreenEventType.Up;
        }
        if (e.type == 'pointercancel' || e.type == 'touchcancel') {
            return ScreenEventType.Cancel;
        }
        return ScreenEventType.Unknown;
    }
    function addPointerDown(element, method) {
        element.addEventListener('touchstart', method, { capture: true });
        element.addEventListener('mousedown', method, { capture: true });
    }
    function addPointerMove(element, method) {
        element.addEventListener('touchmove', method, { capture: true });
        element.addEventListener('mousemove', method, { capture: true });
    }
    function addPointerUp(element, method) {
        element.addEventListener('touchend', method, { capture: true });
        element.addEventListener('mouseup', method, { capture: true });
        element.addEventListener('pointerup', method, { capture: true });
    }

    function deepCopy(obj, memo = []) {
        // A deep copy recursively creates copies of all the objects
        // encountered as properties. Shared objects (i. e.
        // the same object assigned to different properties)
        // must be tracked and their identity retained.
        // This is done via memoization and the reason
        // why this implementation is so convoluted
        if (typeof obj != 'object' || obj === null) {
            return obj;
        }
        if (obj.constructor.name.endsWith('Event')) {
            return null;
        }
        if (obj.constructor.name == 'Array') {
            let newObj = [];
            memo.push([obj, newObj]);
            for (let value of obj) {
                var copiedValue;
                var alreadyCopied = false;
                for (let pair of memo) {
                    if (pair[0] === value) {
                        alreadyCopied = true;
                        copiedValue = pair[1];
                    }
                }
                if (alreadyCopied) {
                    newObj.push(copiedValue);
                }
                else {
                    let y = deepCopy(value, memo);
                    newObj.push(y);
                    memo.push([value, y]);
                }
            }
            return newObj;
        }
        var newObj = Object.create(obj.constructor.prototype);
        if (obj.constructor.name == 'HTMLDivElement') {
            newObj = document.createElement('div');
        }
        else if (obj.constructor.name == 'HTMLSVGElement') {
            newObj = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        }
        else if (obj.constructor.name == 'HTMLPathElement') {
            newObj = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        }
        memo.push([obj, newObj]);
        for (let [key, value] of Object.entries(obj)) {
            var copiedValue;
            var alreadyCopied = false;
            for (let pair of memo) {
                if (pair[0] === value) {
                    alreadyCopied = true;
                    copiedValue = pair[1];
                }
            }
            if (alreadyCopied) {
                newObj[key] = copiedValue;
            }
            else {
                let y = deepCopy(value, memo);
                newObj[key] = y;
            }
        }
        if (obj.svg != undefined) {
            newObj.svg = obj.svg.cloneNode();
            newObj.path = obj.path.cloneNode();
            newObj.view.appendChild(newObj.svg);
            newObj.svg.appendChild(newObj.path);
        }
        return newObj;
    }
    /////////////
    // VARIOUS //
    /////////////
    function stringFromPoint(point) {
        // a string representation for CSS
        let x = point[0], y = point[1];
        return `${x} ${y}`;
    }
    function remove(arr, value, all = false) {
        // remove an objector value from an Array
        // either the first encountered matching entry (if all = false)
        // or every matching entry (if all = true)
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                arr.splice(i, 1);
                if (!all) {
                    break;
                }
            }
        }
    }
    function convertStringToArray(s) {
        let brackets = ["(", ")", "[", "]"];
        let whitespace = [" ", "\t", "\r", "\n"];
        for (let char of brackets.concat(whitespace)) {
            s = s.replace(char, "");
        }
        if (s.length == 0)
            return [];
        let a = s.split(",");
        if (a.length == 0) {
            return [s];
        }
        return a;
    }

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
        interpolate(newColor, weight) {
            return new Color((1 - weight) * this.red + weight * newColor.red, (1 - weight) * this.green + weight * newColor.green, (1 - weight) * this.blue + weight * newColor.blue, (1 - weight) * this.alpha + weight * newColor.alpha);
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
        static purple() { return new Color(1, 0, 1); }
    }
    ({
        'white': Color.white(),
        'red': Color.red(),
        'orange': Color.orange(),
        'yellow': Color.yellow(),
        'green': Color.green(),
        'blue': Color.blue(),
        'indigo': Color.indigo(),
        'purple': Color.purple()
    });

    class Dependency {
        constructor(argsDict = {}) {
            this.source = argsDict['source'];
            this.outputName = argsDict['outputName']; // may be undefined
            this.target = argsDict['target'];
            this.inputName = argsDict['inputName']; // may be undefined
        }
        delete() {
            this.source.removeDependency(this);
        }
    }

    class VertexArray extends Array {
        constructor(array) {
            super();
            if (!array) {
                return;
            }
            for (let vertex of array) {
                this.push(vertex);
            }
        }
        interpolate(newVertexArray, weight) {
            let interpolatedVertexArray = new VertexArray();
            for (let i = 0; i < this.length; i++) {
                interpolatedVertexArray.push(this[i].interpolate(newVertexArray[i], weight));
            }
            return interpolatedVertexArray;
        }
        imageUnder(transform) {
            let image = new VertexArray();
            for (let i = 0; i < this.length; i++) {
                image.push(this[i].imageUnder(transform));
            }
            return image;
        }
    }

    const DRAW_BORDER = false;
    class Mobject extends ExtendedObject {
        ////////////////////
        // INITIALIZATION //
        ////////////////////
        constructor(argsDict = {}, isSuperCall = false) {
            super({}, true);
            let initialArgs = this.defaultArgs();
            Object.assign(initialArgs, argsDict);
            Object.assign(initialArgs, this.fixedArgs());
            this.statelessSetup();
            if (!isSuperCall) {
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
                view: document.createElement('div'),
                visible: true,
                opacity: 1.0,
                backgroundColor: Color.clear(),
                drawBorder: DRAW_BORDER,
                dependencies: [],
                screenEventHandler: ScreenEventHandler.Parent,
                savedScreenEventHandler: null,
                snappablePoints: []
            };
        }
        fixedArgs() {
            return {};
        }
        statelessSetup() {
            // state-independent setup
            this.eventTarget = null;
            this.screenEventHistory = [];
            this.boundEventTargetMobject = this.eventTargetMobject.bind(this);
            this.boundCapturedOnPointerDown = this.capturedOnPointerDown.bind(this);
            this.boundCapturedOnPointerMove = this.capturedOnPointerMove.bind(this);
            this.boundCapturedOnPointerUp = this.capturedOnPointerUp.bind(this);
            this.boundRawOnPointerDown = this.rawOnPointerDown.bind(this);
            this.boundRawOnPointerMove = this.rawOnPointerMove.bind(this);
            this.boundRawOnPointerUp = this.rawOnPointerUp.bind(this);
            this.boundOnPointerDown = this.onPointerDown.bind(this);
            this.boundOnPointerMove = this.onPointerMove.bind(this);
            this.boundOnPointerUp = this.onPointerUp.bind(this);
            this.boundOnTap = this.onTap.bind(this);
            this.boundRawOnLongPress = this.rawOnLongPress.bind(this);
            this.savedOnPointerDown = this.onPointerDown;
            this.savedOnPointerMove = this.onPointerMove;
            this.savedOnPointerUp = this.onPointerUp;
        }
        statefulSetup() {
            this.setupView();
            addPointerDown(this.view, this.boundCapturedOnPointerDown);
            addPointerMove(this.view, this.boundCapturedOnPointerMove);
            addPointerUp(this.view, this.boundCapturedOnPointerUp);
        }
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
            let frame_ = frame || this.parent || this;
            let dr = newCenter.subtract(this.center(frame_));
            this.anchor.copy();
            this.anchor = this.anchor.translatedBy(dr[0], dr[1]);
        }
        relativeTransform(frame) {
            // If there is no frame, use the parent's coordinate frame. If there is no parent yet, use local coordinates
            let frame_ = frame || this.parent || this;
            let t = Transform.identity();
            let mob = this;
            while (mob && mob.transform instanceof Transform) {
                if (mob == frame_) {
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
        // e. g. VMobjects.
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
            let p = this.transformLocalPoint(new Vertex(this.viewWidth / 2, this.viewHeight / 2), frame);
            return p;
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
        setupView() {
            this.view['mobject'] = this;
            if (this.parent) {
                this.parent.view.appendChild(this.view);
            }
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
            this.view.style['transform'] = this.transform.withoutAnchor().toCSSString();
            this.view.style['left'] = this.anchor.x.toString() + 'px';
            this.view.style['top'] = this.anchor.y.toString() + 'px';
            this.view.style['width'] = this.viewWidth.toString() + 'px';
            this.view.style['height'] = this.viewHeight.toString() + 'px';
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
                this.view.style['opacity'] = this.opacity.toString();
                //if (!this.visible || !this.parent) { return }
                this.redrawSelf();
                if (recursive) {
                    this.redrawSubmobs();
                }
            }
            catch {
                console.warn(`Unsuccessfully tried to draw ${this.constructor.name} (too soon?)`);
            }
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
            catch {
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
            catch {
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
        animate(argsDict = {}, seconds) {
            this.interpolationStartCopy = deepCopy(this);
            this.interpolationStartCopy.clearScreenEventHistory();
            this.interpolationStopCopy = deepCopy(this.interpolationStartCopy);
            this.interpolationStopCopy.update(argsDict, false);
            let dt = 10;
            this.animationTimeStart = Date.now();
            this.animationDuration = seconds;
            this.animationInterval = window.setInterval(function () { this.updateAnimation(Object.keys(argsDict)); }.bind(this), dt);
            window.setTimeout(this.cleanupAfterAnimation.bind(this), seconds * 1000);
        }
        updateAnimation(keys) {
            let weight = (Date.now() - this.animationTimeStart) / (this.animationDuration * 1000);
            let newArgsDict = this.interpolatedAnimationArgs(keys, weight);
            this.update(newArgsDict);
        }
        interpolatedAnimationArgs(keys, weight) {
            let ret = {};
            for (let key of keys) {
                let startValue = this.interpolationStartCopy[key];
                let stopValue = this.interpolationStopCopy[key];
                if (typeof startValue == 'number') {
                    ret[key] = (1 - weight) * startValue + weight * stopValue;
                }
                else if (startValue instanceof Vertex) {
                    ret[key] = startValue.interpolate(stopValue, weight);
                }
                else if (startValue instanceof Transform) {
                    ret[key] = startValue.interpolate(stopValue, weight);
                }
                else if (startValue instanceof Color) {
                    ret[key] = startValue.interpolate(stopValue, weight);
                }
                else if (startValue instanceof VertexArray) {
                    ret[key] = startValue.interpolate(stopValue, weight);
                }
            }
            return ret;
        }
        cleanupAfterAnimation() {
            window.clearInterval(this.animationInterval);
            this.animationInterval = null;
            this.interpolationStartCopy = null;
            this.interpolationStopCopy = null;
        }
        get parent() { return this._parent; }
        set parent(newValue) {
            try {
                this.view?.remove();
            }
            catch {
                console.warn('View is not part of body');
            }
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
        get superMobject() { return this.parent; }
        set superMobject(newValue) { this.parent = newValue; }
        get submobjects() { return this.children; }
        set submobjects(newValue) {
            this.children = newValue;
        }
        get submobs() { return this.submobjects; }
        set submobs(newValue) {
            this.submobs = newValue;
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
            remove(this.children, submob);
            submob.parent = undefined;
            submob.view.remove();
        }
        moveToTop(submob) {
            if (submob.parent != this) {
                console.warn(`${submob} is not yet a submob of ${this}`);
                return;
            }
            this.remove(submob);
            this.add(submob);
        }
        getPaper() {
            let p = this;
            while (p != undefined && p.constructor.name != 'Paper') {
                p = p.parent;
            }
            return p;
        }
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
        removeDependency(dep) {
            remove(this.dependencies, dep);
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
        consolidateTransformAndAnchor(argsDict = {}) {
            let newAnchor = argsDict['anchor'];
            var newTransform = argsDict['transform']; // ?? Transform.identity()
            if (newTransform) {
                let nt = newTransform;
                if (nt.anchor.isZero()) {
                    nt.anchor = newAnchor ?? this.anchor;
                }
                argsDict['transform'] = newTransform;
            }
            else {
                newTransform = this.transform;
                newTransform.anchor = argsDict['anchor'] ?? this.anchor;
            }
            delete argsDict['anchor'];
            argsDict['transform'] = newTransform;
            return argsDict;
        }
        updateModel(argsDict = {}) {
            argsDict = this.consolidateTransformAndAnchor(argsDict);
            this.setAttributes(argsDict);
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
        updateFrom(mob, attrs, redraw = true) {
            let updateDict = {};
            for (let attr of attrs) {
                updateDict[attr] = mob[attr];
            }
            this.update(updateDict, redraw);
        }
        updateSubmobs() {
            for (let submob of this.children || []) {
                if (!this.dependsOn(submob)) { // prevent dependency loops
                    submob.update({}, false);
                }
            }
        }
        // empty method as workaround (don't ask)
        removeFreePoint(fp) { }
        onPointerDown(e) { }
        onPointerMove(e) { }
        onPointerUp(e) { }
        onTap(e) { }
        onDoubleTap(e) { }
        onLongPress(e) { }
        savedOnPointerDown(e) { }
        savedOnPointerMove(e) { }
        savedOnPointerUp(e) { }
        savedOnTap(e) { }
        savedOnLongPress(e) { }
        boundEventTargetMobject(e) { return this; }
        boundCapturedOnPointerDown(e) { }
        boundCapturedOnPointerMove(e) { }
        boundCapturedOnPointerUp(e) { }
        boundRawOnPointerDown(e) { }
        boundRawOnPointerMove(e) { }
        boundRawOnPointerUp(e) { }
        boundRawOnLongPress(e) { }
        boundOnPointerDown(e) { }
        boundOnPointerMove(e) { }
        boundOnPointerUp(e) { }
        boundOnTap(e) { }
        get screenEventHandler() {
            return this._screenEventHandler;
        }
        set screenEventHandler(newValue) {
            this._screenEventHandler = newValue;
            if (this.view == undefined) {
                return;
            }
            if (this.screenEventHandler == ScreenEventHandler.Below) {
                this.view.style['pointer-events'] = 'none';
            }
            else {
                this.view.style['pointer-events'] = 'auto';
            }
        }
        disable() {
            this.savedScreenEventHandler = this.screenEventHandler;
            this.screenEventHandler = ScreenEventHandler.Parent; // .Below?
        }
        enable() {
            if (this.savedScreenEventHandler === null) {
                return;
            }
            this.screenEventHandler = this.savedScreenEventHandler;
            this.savedScreenEventHandler = null;
        }
        eventTargetMobjectChain(e) {
            // find the lowest Mobject willing and allowed to handle the event
            // collect the chain of target views (highest to lowest)
            var t = e.target;
            if (t.tagName == 'path') {
                t = t.parentElement.parentElement;
            }
            // the mob whose view contains the svg element containing the path
            if (t.tagName == 'svg') {
                t = t.parentElement.parentElement;
            }
            // we hit an svg outside its path (but inside its bounding box),
            // so ignore the corresponding mob and pass the event on to its parent
            let targetViewChain = [t];
            while (t != undefined && t != this.view) {
                t = t.parentElement;
                targetViewChain.push(t);
            }
            targetViewChain.reverse();
            //log(targetViewChain)
            // collect the chain of corresponding target mobjects (lowest to highest)
            let targetMobChain = [];
            for (var view of targetViewChain.values()) {
                let m = view['mobject'];
                if (m == undefined) {
                    continue;
                }
                let mob = m;
                if (mob.screenEventHandler == ScreenEventHandler.Parent) {
                    break;
                }
                // only consider targets above the first .Parent
                targetMobChain.push(mob);
            }
            //log(targetMobChain)
            return targetMobChain;
        }
        eventTargetMobject(e) {
            var t = e.target;
            if (t == this.view) {
                return this;
            }
            let targetMobChain = this.eventTargetMobjectChain(e);
            //log(targetMobChain)
            var m;
            while (targetMobChain.length > 0) {
                //log('pop')
                m = targetMobChain.pop();
                //log(m)
                //log(m.screenEventHandler)
                if (m != undefined && (m.screenEventHandler == ScreenEventHandler.Self || m.screenEventHandler == ScreenEventHandler.Auto)) {
                    //log(`event target mobject: ${m.constructor.name}`)
                    //log(m.screenEventHandler)
                    return m;
                }
            }
            // if all of this fails, this mob must handle the event itself
            return this;
        }
        capturedOnPointerDown(e) {
            this.eventTarget = this.boundEventTargetMobject(e);
            if (this.eventTarget == null) {
                return;
            }
            if (this.eventTarget.screenEventHandler == ScreenEventHandler.Auto) {
                return;
            }
            e.stopPropagation();
            this.eventTarget.rawOnPointerDown(e);
        }
        capturedOnPointerMove(e) {
            if (this.eventTarget == null) {
                return;
            }
            if (this.eventTarget.screenEventHandler == ScreenEventHandler.Auto) {
                return;
            }
            e.stopPropagation();
            this.eventTarget.rawOnPointerMove(e);
        }
        capturedOnPointerUp(e) {
            if (this.eventTarget == null) {
                return;
            }
            if (this.eventTarget.screenEventHandler == ScreenEventHandler.Auto) {
                return;
            }
            e.stopPropagation();
            this.eventTarget.rawOnPointerUp(e);
            this.eventTarget = null;
        }
        localEventVertex(e) {
            let p = eventVertex(e);
            let pp = this.getPaper();
            let rt = this.relativeTransform(pp);
            let inv = rt.inverse();
            let q = inv.appliedTo(p);
            return q;
        }
        registerScreenEvent(e) {
            // return value is a success flag
            // (false if e is just a duplicate of the latest registered event)
            if (isTouchDevice) {
                let minIndex = Math.max(0, this.screenEventHistory.length - 5);
                for (var i = minIndex; i < this.screenEventHistory.length; i++) {
                    let e2 = this.screenEventHistory[i];
                    if (eventVertex(e).closeTo(eventVertex(e2), 2)) {
                        if (screenEventType(e) == screenEventType(e2)) {
                            return false;
                        }
                    }
                }
            }
            this.screenEventHistory.push(e);
            return true;
        }
        rawOnPointerDown(e) {
            if (!this.registerScreenEvent(e)) {
                return;
            }
            this.onPointerDown(e);
            this.timeoutID = window.setTimeout(this.boundRawOnLongPress, 1000, e);
        }
        rawOnPointerMove(e) {
            if (!this.registerScreenEvent(e)) {
                return;
            }
            this.resetTimeout();
            this.onPointerMove(e);
        }
        rawOnPointerUp(e) {
            if (!this.registerScreenEvent(e)) {
                return;
            }
            this.resetTimeout();
            this.onPointerUp(e);
            if (this.tapDetected()) {
                this.onTap(e);
            }
            if (this.doubleTapDetected()) {
                this.onDoubleTap(e);
            }
            //window.setTimeout(this.clearScreenEventHistory, 2000)
        }
        clearScreenEventHistory() {
            this.screenEventHistory = [];
        }
        isTap(e1, e2, dt = 500) {
            return (screenEventType(e1) == ScreenEventType.Down
                && screenEventType(e2) == ScreenEventType.Up
                && Math.abs(e2.timeStamp - e1.timeStamp) < 500);
        }
        tapDetected() {
            if (this.screenEventHistory.length < 2) {
                return false;
            }
            let e1 = this.screenEventHistory[this.screenEventHistory.length - 2];
            let e2 = this.screenEventHistory[this.screenEventHistory.length - 1];
            return this.isTap(e1, e2);
        }
        doubleTapDetected() {
            if (this.screenEventHistory.length < 4) {
                return false;
            }
            let e1 = this.screenEventHistory[this.screenEventHistory.length - 4];
            let e2 = this.screenEventHistory[this.screenEventHistory.length - 3];
            let e3 = this.screenEventHistory[this.screenEventHistory.length - 2];
            let e4 = this.screenEventHistory[this.screenEventHistory.length - 1];
            return this.isTap(e1, e2) && this.isTap(e3, e4) && this.isTap(e1, e4, 1000);
        }
        rawOnLongPress(e) {
            this.onLongPress(e);
            this.resetTimeout();
        }
        resetTimeout() {
            if (this.timeoutID) {
                clearTimeout(this.timeoutID);
                this.timeoutID = null;
            }
        }
        startDragging(e) {
            this.dragAnchorStart = this.anchor.subtract(eventVertex(e));
        }
        dragging(e) {
            this.update({
                anchor: eventVertex(e).add(this.dragAnchorStart)
            });
        }
        endDragging(e) {
            this.dragAnchorStart = null;
        }
        draggingEnabled() {
            return (this.onPointerDown == this.startDragging);
        }
        setDragging(flag) {
            if (flag) {
                if (this.draggingEnabled()) {
                    return;
                }
                this.savedOnPointerDown = this.onPointerDown;
                this.savedOnPointerMove = this.onPointerMove;
                this.savedOnPointerUp = this.onPointerUp;
                this.onPointerDown = this.startDragging;
                this.onPointerMove = this.dragging;
                this.onPointerUp = this.endDragging;
            }
            else {
                if (!this.draggingEnabled()) {
                    return;
                }
                this.onPointerDown = this.savedOnPointerDown;
                this.onPointerMove = this.savedOnPointerMove;
                this.onPointerUp = this.savedOnPointerUp;
                this.savedOnPointerDown = (e) => { };
                this.savedOnPointerMove = (e) => { };
                this.savedOnPointerUp = (e) => { };
            }
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
            this.vertices = new VertexArray();
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.svg['mobject'] = this;
            this.path['mobject'] = this;
            this.svg.appendChild(this.path);
            this.svg.setAttribute('class', 'mobject-svg');
            this.svg.style.overflow = 'visible';
        }
        statefulSetup() {
            this.setupView();
            this.view.appendChild(this.svg);
            this.view.setAttribute('class', this.constructor.name + ' mobject-div');
            addPointerDown(this.path, this.boundCapturedOnPointerDown);
            addPointerMove(this.path, this.boundCapturedOnPointerMove);
            addPointerUp(this.path, this.boundCapturedOnPointerUp);
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
            this.update(updateDict);
        }
    }

    class Polygon extends VMobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                closed: true
            });
        }
        static makePathString(vertices, closed) {
            let pathString = '';
            let v = vertices;
            if (v.length == 0) {
                return '';
            }
            for (let point of v) {
                if (point == undefined || point.isNaN()) {
                    pathString = '';
                    return pathString;
                }
                let prefix = (pathString == '') ? 'M' : 'L';
                pathString += prefix + stringFromPoint(point);
            }
            if (closed) {
                pathString += 'Z';
            }
            return pathString;
        }
        pathString() {
            return Polygon.makePathString(this.vertices, this.closed);
        }
    }

    class Rectangle extends Polygon {
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

    const BUTTON_CENTER_X = 50;
    const BUTTON_SPACING = 12.5;
    const BUTTON_RADIUS = 25;
    const BUTTON_SCALE_FACTOR = 1.3;
    function buttonCenter(index) {
        let y = BUTTON_CENTER_X + index * (BUTTON_SPACING + 2 * BUTTON_RADIUS);
        return new Vertex(BUTTON_CENTER_X, y);
    }

    class CurvedLine extends VMobject {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                closed: false
            });
        }
        updateBezierPoints() { }
        // implemented by subclasses
        updateModel(argsDict = {}) {
            super.updateModel(argsDict);
            this.updateBezierPoints();
        }
        static makePathString(bezierPoints, closed = false) {
            let points = bezierPoints;
            if (points == undefined || points.length == 0) {
                return '';
            }
            // there should be 3n + 1 points
            let nbCurves = (points.length - 1) / 3;
            if (nbCurves % 1 != 0) {
                throw 'Incorrect number of Bézier points';
            }
            let pathString = 'M' + stringFromPoint(points[0]);
            for (let i = 0; i < nbCurves; i++) {
                let point1str = stringFromPoint(points[3 * i + 1]);
                let point2str = stringFromPoint(points[3 * i + 2]);
                let point3str = stringFromPoint(points[3 * i + 3]);
                pathString += `C${point1str} ${point2str} ${point3str}`;
            }
            if (closed) {
                pathString += 'Z';
            }
            return pathString;
        }
        pathString() {
            return CurvedLine.makePathString(this.bezierPoints, this.closed);
        }
        get bezierPoints() { return this._bezierPoints; }
        set bezierPoints(newValue) {
            this._bezierPoints = newValue;
            let v = new VertexArray();
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

    class CircularArc extends CurvedLine {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                midpoint: Vertex.origin(),
                radius: 10,
                angle: TAU / 4,
            });
        }
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                nbPoints: 32
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
            let newBezierPoints = new VertexArray();
            let d = this.radius * 4 / 3 * Math.tan(this.angle / (4 * this.nbPoints));
            for (let i = 0; i <= this.nbPoints; i++) {
                let theta = i / this.nbPoints * this.angle;
                let radialUnitVector = new Vertex(Math.cos(theta), Math.sin(theta));
                let tangentUnitVector = new Vertex(-Math.sin(theta), Math.cos(theta));
                let anchorPoint = radialUnitVector.scaledBy(this.radius);
                let leftControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(-d));
                let rightControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(d));
                if (i != 0) {
                    newBezierPoints.push(leftControlPoint);
                }
                newBezierPoints.push(anchorPoint);
                if (i != this.nbPoints) {
                    newBezierPoints.push(rightControlPoint);
                }
            }
            let translatedBezierPoints = new VertexArray();
            for (let i = 0; i < newBezierPoints.length; i++) {
                translatedBezierPoints.push(newBezierPoints[i].translatedBy(this.radius, this.radius));
            }
            this.bezierPoints = translatedBezierPoints;
            // do NOT update the view, because redraw calls updateBezierPoints
        }
    }

    class Circle extends CircularArc {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                angle: TAU,
                closed: true
            });
        }
    }

    class TextLabel extends Mobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                text: 'text',
                horizontalAlign: 'center',
                verticalAlign: 'center',
                color: Color.white()
            });
        }
        statefulSetup() {
            super.statefulSetup();
            this.view.setAttribute('class', this.constructor.name + ' unselectable mobject-div');
            this.view.style.display = 'flex';
            this.view.style.fontFamily = 'Helvetica';
            this.view.style.fontSize = '10px';
        }
        redrawSelf() {
            if (this.anchor.isNaN()) {
                return;
            }
            if (this.color == undefined) {
                this.color = Color.white();
            }
            super.redrawSelf();
        }
        updateModel(argsDict = {}) {
            super.updateModel(argsDict);
            //// internal dependencies
            this.view.innerHTML = this.text;
            this.view.style.color = (this.color ?? Color.white()).toHex();
            switch (this.verticalAlign) {
                case 'top':
                    this.view.style.alignItems = 'flex-start';
                    break;
                case 'center':
                    this.view.style.alignItems = 'center';
                    break;
                case 'bottom':
                    this.view.style.alignItems = 'flex-end';
                    break;
            }
            switch (this.horizontalAlign) {
                case 'left':
                    this.view.style.justifyContent = 'flex-start';
                    break;
                case 'center':
                    this.view.style.justifyContent = 'center';
                    break;
                case 'right':
                    this.view.style.justifyContent = 'flex-end';
                    break;
            }
        }
    }

    var paper = null;
    if (isTouchDevice === false) {
        const paperView = document.querySelector('#paper_id');
        if (paperView !== null) {
            paper = paperView['mobject'];
        }
    }
    class SidebarButton extends Circle {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                strokeWidth: 0,
                optionSpacing: 25,
                screenEventHandler: ScreenEventHandler.Self
            });
        }
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                currentModeIndex: 0,
                previousIndex: 0,
                baseColor: Color.gray(0.4),
                locationIndex: 0,
                active: false,
                showLabel: true,
                text: 'text',
                fontSize: 12,
                messages: [],
                radius: BUTTON_RADIUS,
                viewWidth: 2 * BUTTON_RADIUS,
                viewHeight: 2 * BUTTON_RADIUS,
                fillOpacity: 1
            });
        }
        statelessSetup() {
            super.statelessSetup();
            this.label = new TextLabel();
        }
        statefulSetup() {
            super.statefulSetup();
            this.add(this.label);
            this.addDependency('midpoint', this.label, 'midpoint');
            this.updateModeIndex(0);
            this.label.update({
                viewWidth: 2 * this.radius,
                viewHeight: 2 * this.radius,
                text: this.text
            }, false);
            let fontSize = this.fontSize ?? 12;
            this.label.view.style['font-size'] = `${fontSize}px`;
            this.label.view.style['color'] = Color.white().toHex();
        }
        numberOfIndices() { return this.messages.length; }
        get baseColor() { return this._baseColor; }
        set baseColor(newColor) {
            this._baseColor = newColor;
            this.fillColor = newColor;
        }
        get locationIndex() { return this._locationIndex; }
        set locationIndex(newIndex) {
            this._locationIndex = newIndex;
            this.update({ midpoint: buttonCenter(this._locationIndex) });
        }
        colorForIndex(i) {
            return this.baseColor;
        }
        buttonDownByKey(key) {
            if (key == this.key) {
                this.commonButtonDown();
            }
            else if (key == 'ArrowRight' && this.active) {
                this.selectNextOption();
            }
            else if (key == 'ArrowLeft' && this.active) {
                this.selectPreviousOption();
            }
        }
        commonButtonDown() {
            if (this.active) {
                return;
            }
            this.messagePaper(this.messages[0]);
            this.active = true;
            this.update({
                radius: 1.2 * this.radius,
                previousIndex: this.currentModeIndex
            });
            this.label.view.style.setProperty('font-size', `${1.2 * this.fontSize}px`);
            this.label.update({
                viewWidth: 2 * this.radius,
                viewHeight: 2 * this.radius
            });
        }
        onPointerDown(e) {
            e.preventDefault();
            e.stopPropagation();
            this.commonButtonDown();
            this.touchStart = eventVertex(e);
        }
        onPointerUp(e) {
            e.preventDefault();
            e.stopPropagation();
            this.commonButtonUp();
        }
        buttonUpByKey(key) {
            if (key == this.key) {
                this.commonButtonUp();
            }
        }
        commonButtonUp() {
            this.currentModeIndex = 0;
            let dx = this.currentModeIndex * this.optionSpacing;
            let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
            this.active = false;
            this.fillColor = this.colorForIndex(this.currentModeIndex);
            this.update({
                radius: this.radius / 1.2,
                midpoint: newMidpoint
            });
            this.label.view.style.setProperty('font-size', `${this.fontSize}px`);
            this.label.update({
                viewWidth: 2 * this.radius,
                viewHeight: 2 * this.radius
            });
            this.messagePaper(this.outgoingMessage);
        }
        messagePaper(message) {
            try {
                window.webkit.messageHandlers.handleMessageFromSidebar.postMessage(message);
            }
            catch {
                paper.getMessage(message);
            }
        }
        updateLabel() {
            if (this.label == undefined) {
                return;
            }
            this.label.update({
                viewWidth: 2 * this.radius,
                viewHeight: 2 * this.radius
            });
            let f = this.active ? BUTTON_SCALE_FACTOR : 1;
            let fs = f * (this.fontSize ?? 12);
            this.label.view?.setAttribute('font-size', fs.toString());
            if (this.showLabel) {
                try {
                    let msg = this.messages[this.currentModeIndex];
                    this.label.update({
                        text: Object.values(msg)[0]
                    });
                }
                catch { }
            }
            else {
                this.label.text = '';
            }
        }
        updateModel(argsDict = {}) {
            super.updateModel(argsDict);
            this.updateLabel();
        }
        updateModeIndex(newIndex, withMessage = {}) {
            if (newIndex == this.currentModeIndex || newIndex == -1) {
                return;
            }
            this.currentModeIndex = newIndex;
            let message = this.messages[this.currentModeIndex];
            this.fillColor = this.colorForIndex(this.currentModeIndex);
            if (withMessage) {
                this.messagePaper(message);
            }
            this.update();
        }
        selectNextOption() {
            if (this.currentModeIndex == this.messages.length - 1) {
                return;
            }
            let dx = this.optionSpacing * (this.currentModeIndex + 1);
            let c = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
            this.update({
                transform: new Transform({ scale: 1.2 }),
                midpoint: c
            });
            this.updateModeIndex(this.currentModeIndex + 1, true);
        }
        selectPreviousOption() {
            if (this.currentModeIndex == 0) {
                return;
            }
            let dx = this.optionSpacing * (this.currentModeIndex - 1);
            this.midpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
            this.updateModeIndex(this.currentModeIndex - 1, true);
        }
        onPointerMove(e) {
            if (e != null) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (e instanceof MouseEvent) ;
            else {
                e.changedTouches[0];
            }
            let p = eventVertex(e);
            var dx = p.x - this.touchStart.x;
            var newIndex = Math.floor(this.previousIndex + dx / this.optionSpacing);
            newIndex = Math.min(Math.max(newIndex, 0), this.messages.length - 1);
            dx += this.previousIndex * this.optionSpacing;
            dx = Math.min(Math.max(dx, 0), this.optionSpacing * (this.messages.length - 1));
            let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
            this.updateModeIndex(newIndex, true);
            this.update({ midpoint: newMidpoint });
        }
    }

    class CreativeButton extends SidebarButton {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                creations: [],
                outgoingMessage: { create: 'freehand' }
            });
        }
        statefulSetup() {
            super.statefulSetup();
            for (let c of this.creations) {
                this.messages.push({ create: c });
            }
        }
    }

    class ArrowButton extends CreativeButton {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                creations: ['segment', 'ray', 'line'],
                key: 'w'
            });
        }
    }

    class CircleButton extends CreativeButton {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                creations: ['circle'],
                key: 'e'
            });
        }
    }

    class ToggleButton extends SidebarButton {
        commonButtonUp() {
            this.currentModeIndex = 0;
            super.commonButtonUp();
        }
        updateLabel() {
            if (this.label == undefined) {
                return;
            }
            let f = this.active ? BUTTON_SCALE_FACTOR : 1;
            this.label.view.setAttribute('font-size', (f * this.fontSize).toString());
        }
    }

    class DragButton extends ToggleButton {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                messages: [{ drag: true }],
                outgoingMessage: { drag: false },
                key: 'q'
            });
        }
        statefulSetup() {
            super.statefulSetup();
            this.label.text = 'drag';
        }
    }

    class LinkButton extends ToggleButton {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                messages: [{ link: true }],
                outgoingMessage: { link: false },
                key: 'w'
            });
        }
        statefulSetup() {
            super.statefulSetup();
            this.label.view['fill'] = 'black';
            this.label.text = 'link';
        }
    }

    class CindyButton extends CreativeButton {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                creations: ['cindy'],
                key: 't'
            });
        }
    }

    class SliderButton extends CreativeButton {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                creations: ['slider'],
                key: 'r'
            });
        }
    }

    class ExpandableButton extends CreativeButton {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                creations: ['exp', 'cons'],
                key: 'e'
            });
        }
    }

    class PendulumButton extends CreativeButton {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                creations: ['pendulum'],
                key: 'z'
            });
        }
    }

    function buttonFactory(name, locationIndex) {
        switch (name) {
            case 'ArrowButton':
                return new ArrowButton({ locationIndex: locationIndex });
            case 'CircleButton':
                return new CircleButton({ locationIndex: locationIndex });
            case 'DragButton':
                return new DragButton({ locationIndex: locationIndex });
            case 'LinkButton':
                return new LinkButton({ locationIndex: locationIndex });
            case 'CindyButton':
                return new CindyButton({ locationIndex: locationIndex });
            case 'SliderButton':
                return new SliderButton({ locationIndex: locationIndex });
            case 'ExpandableButton':
                return new ExpandableButton({ locationIndex: locationIndex });
            case 'PendulumButton':
                return new PendulumButton({ locationIndex: locationIndex });
        }
    }

    let paperButtons = ['DragButton', 'LinkButton', 'ExpandableButton', 'SliderButton', 'CindyButton', 'PendulumButton'];
    class Sidebar extends Mobject {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                viewWidth: 150,
                viewHeight: 1024,
                screenEventHandler: ScreenEventHandler.Self
            });
        }
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                buttons: []
            });
        }
        statelessSetup() {
            this.background = new Rectangle({
                fillColor: Color.gray(0.1),
                fillOpacity: 1.0,
                strokeWidth: 0,
                screenEventHandler: ScreenEventHandler.Parent // ?
            });
            super.statelessSetup();
        }
        statefulSetup() {
            this.add(this.background);
            this.background.update({
                width: this.viewWidth,
                height: this.viewHeight
            });
            this.view['mobject'] = this;
            let paperView = document.querySelector('#paper_id');
            if (paperView !== null) {
                let paper = paperView['mobject'];
                paper.sidebar = this;
                this.background.update({
                    fillColor: paper.background.fillColor
                });
            }
            this.handleMessage('init', paperButtons);
            super.statefulSetup();
        }
        addButton(button) {
            let i = this.buttons.length;
            this.add(button);
            this.buttons.push(button);
            button.update({ midpoint: buttonCenter(i) });
        }
        clear() {
            for (let button of Object.values(this.buttons)) {
                this.remove(button);
                this.buttons.pop();
            }
        }
        initialize(value) {
            this.clear();
            for (let i = 0; i < value.length; i++) {
                let button = buttonFactory(value[i], i);
                this.addButton(button);
            }
        }
        buttonForKey(key) {
            for (let b of this.buttons) {
                if (b.key == key) {
                    return b;
                }
            }
            return null;
        }
        handleMessage(key, value) {
            switch (key) {
                case 'init':
                    this.initialize(value);
                    break;
                case 'buttonDown':
                    if (this.activeButton === null || this.activeButton === undefined) {
                        this.activeButton = this.buttonForKey(value);
                    }
                    if (this.activeButton !== null) {
                        this.activeButton.buttonDownByKey(value);
                    }
                    break;
                case 'buttonUp':
                    if (this.activeButton !== null && this.activeButton !== undefined) {
                        this.activeButton.buttonUpByKey(value);
                        if (this.activeButton.key == value) {
                            this.activeButton = null;
                        }
                    }
                    break;
            }
        }
        getMessage(message) {
            let key = Object.keys(message)[0];
            let value = Object.values(message)[0];
            let convertedValue = value;
            if (value == "true") {
                convertedValue = true;
            }
            if (value == "false") {
                convertedValue = false;
            }
            if (value[0] == "(") {
                convertedValue = convertStringToArray(value);
            }
            this.handleMessage(key, convertedValue);
        }
    }
    let sidebarDiv = document.querySelector('#sidebar_id');
    const sidebar = new Sidebar({
        view: sidebarDiv
    });

    exports.Sidebar = Sidebar;
    exports.sidebar = sidebar;

    return exports;

})({});
