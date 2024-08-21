var Paper = (function (exports) {
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

    /////////////
    // LOGGING //
    /////////////
    const LOG_STACK_RESOLUTION = Infinity;
    // logging inside HTML instead of the console
    // for debugging the app e. g. on iPad
    function logInto(obj, id) {
        let msg = obj.toString();
        let newLine = document.createElement('p');
        newLine.innerText = msg;
        let htmlConsole = document.querySelector('#' + id);
        htmlConsole.appendChild(newLine);
        // push old log entries out the top of the scroll view
        // (these lines don't work though)
        htmlConsole.scrollTop = htmlConsole.scrollHeight;
        newLine.scrollIntoView();
    }
    function logString(msg) {
        if (msg === undefined) {
            return 'undefined';
        }
        else if (msg === null) {
            return 'null';
        }
        else if (typeof msg === 'string') {
            return '"' + msg + '"';
        }
        else if (typeof msg === 'boolean') {
            return msg ? 'true' : 'false';
        }
        else if (typeof msg === 'number') {
            return msg.toString();
        }
        else if (msg.constructor.name == 'Array' || msg.constructor.name == 'Vertex') {
            if (msg.length == 0) {
                return "[]";
            }
            else if (msg[0].constructor.name == 'HTMLDivElement') {
                let ret = '[';
                for (let i = 0; i < msg.length - 1; i++) {
                    ret += msg[i].className + ', ';
                }
                ret += msg[msg.length - 1].className + ']';
                return ret;
            }
            else {
                let ret = '[';
                for (let i = 0; i < msg.length - 1; i++) {
                    ret += logString(msg[i]) + ', ';
                }
                ret += logString(msg[msg.length - 1]) + ']';
                return ret;
            }
        }
        else {
            let keys = Object.keys(msg);
            if (keys.length <= 5) {
                let ret = '{ ';
                for (let i = 0; i < keys.length - 1; i++) {
                    ret += keys[i] + ' : ' + logString(msg[keys[i]]) + ', ';
                }
                ret += keys[keys.length - 1] + ' : ' + logString(msg[keys[keys.length - 1]]) + ' }';
            }
            else {
                return msg.constructor.name;
            }
        }
    }
    function htmlLog(msg) {
        logInto(logString(msg), 'htmlConsole');
    }
    function jsLog(msg) {
        console.log(logString(msg));
    }
    function stackSize() {
        // how many levels of function calls deep are we?
        let s = (new Error()).stack;
        let a = s.split('\n');
        return a.length;
    }
    function log(msg) {
        // device-agnostic log function
        // with variable resolution,
        // this should be used for logging
        if (stackSize() > LOG_STACK_RESOLUTION) {
            return;
        }
        if (isTouchDevice) {
            htmlLog(msg);
        }
        else {
            jsLog(msg);
        }
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
    function extend(arr1, arr2) {
        for (let x of arr2) {
            arr1.push(x);
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
    function convertArrayToString(array) {
        var arrayString = "(";
        for (let s of array) {
            arrayString += s;
            arrayString += ",";
        }
        if (arrayString.length > 1) {
            arrayString = arrayString.slice(0, arrayString.length - 1);
        }
        arrayString += ")";
        return arrayString;
    }
    function getPaper() {
        return document.querySelector('#paper_id')['mobject'];
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
    const COLOR_PALETTE = {
        'white': Color.white(),
        'red': Color.red(),
        'orange': Color.orange(),
        'yellow': Color.yellow(),
        'green': Color.green(),
        'blue': Color.blue(),
        'indigo': Color.indigo(),
        'purple': Color.purple()
    };

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

    class CurvedShape extends CurvedLine {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                closed: true
            });
        }
    }

    class RoundedRectangle extends CurvedShape {
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

    const IO_LIST_WIDTH = 150;
    const IO_LIST_OFFSET = 10;
    const HOOK_RADIUS = 9;
    const BULLET_RADIUS = 7;
    const SNAPPING_DISTANCE = 12.5;
    const HOOK_INSET_X = 15;
    const HOOK_INSET_Y = 15;
    const HOOK_VERTICAL_SPACING = 25;
    const HOOK_LABEL_INSET = 30;
    const LINK_LINE_WIDTH = 5;

    class LinkHook extends Circle {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                mobject: new Mobject(),
                name: "default",
                type: "input"
            });
        }
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                radius: HOOK_RADIUS,
                fillOpacity: 0,
                strokeColor: Color.white()
            });
        }
        positionInLinkMap() {
            return this.parent.transformLocalPoint(this.midpoint, this.parent.parent.parent);
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

    class InputList extends RoundedRectangle {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                mobject: null,
                inputNames: [],
                linkHooks: [],
                cornerRadius: 20,
                fillColor: Color.white(),
                fillOpacity: 0.2,
                strokeWidth: 0,
                width: IO_LIST_WIDTH
            });
        }
        statefulSetup() {
            super.statefulSetup();
            this.createHookList();
            this.update({ height: this.getHeight() }, false);
        }
        getHeight() {
            if (this.inputNames == undefined) {
                return 0;
            }
            if (this.inputNames.length == 0) {
                return 0;
            }
            else {
                let h = 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * (this.inputNames.length - 1);
                return h;
            }
        }
        createHookList() {
            this.linkHooks = [];
            for (let i = 0; i < this.inputNames.length; i++) {
                let name = this.inputNames[i];
                let h = new LinkHook({
                    mobject: this.mobject,
                    name: name,
                    type: 'input'
                });
                let t = new TextLabel({
                    text: name,
                    horizontalAlign: 'left',
                    verticalAlign: 'center',
                    viewHeight: HOOK_VERTICAL_SPACING,
                    viewWidth: IO_LIST_WIDTH - HOOK_LABEL_INSET
                });
                this.add(h);
                this.add(t);
                let m = new Vertex([HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * i]);
                h.update({ midpoint: m });
                let a = h.midpoint.translatedBy(HOOK_LABEL_INSET, -HOOK_VERTICAL_SPACING / 2);
                t.update({ anchor: a });
                this.linkHooks.push(h);
            }
        }
        hookNamed(name) {
            for (let h of this.linkHooks) {
                if (h.name == name) {
                    return h;
                }
            }
            return null;
        }
        updateModel(argsDict = {}) {
            if (argsDict['inputNames'] !== undefined) {
                this.createHookList();
            }
            let p1 = this.bottomCenter();
            let p2 = this.mobject.localTopCenter();
            let v = new Vertex(p2[0] - p1[0], p2[1] - p1[1] - IO_LIST_OFFSET);
            argsDict['anchor'] = this.anchor.translatedBy(v);
            argsDict['height'] = this.getHeight();
            super.updateModel(argsDict);
        }
    }

    // import { Vertex } from '../../helpers/Vertex'
    // import { Color } from '../../helpers/Color'
    // import { Mobject } from './../Mobject'
    // import { RoundedRectangle } from '../../shapes/RoundedRectangle'
    // import { LinkHook } from './LinkHook'
    // import { TextLabel } from '../../TextLabel'
    // import { log } from '../../helpers/helpers'
    // import { HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_OFFSET, HOOK_VERTICAL_SPACING } from './constants'
    // export class OutputList extends RoundedRectangle {
    // 	outputNames: Array<string>
    // 	linkHooks: Array<LinkHook>
    // 	mobject: Mobject
    // 	defaultArgs(): object {
    // 		return Object.assign(super.defaultArgs(), {
    // 			mobject: null,
    // 			outputNames: [],
    // 			linkHooks: [],
    // 			cornerRadius: 20,
    // 			fillColor: Color.white(),
    // 			fillOpacity: 0.3,
    // 			strokeWidth: 0,
    // 			width: 150
    // 		})
    // 	}
    // 	statefulSetup() {
    // 		super.statefulSetup()
    // 		this.createHookList()
    // 		this.update({ height: this.getHeight() }, false)
    // 	}
    // 	getHeight(): number {
    // 		if (this.outputNames == undefined) { return 0 }
    // 		if (this.outputNames.length == 0) { return 0 }
    // 		else { return 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * this.outputNames.length }
    // 	}
    // 	createHookList() {
    // 		this.linkHooks = []
    // 		for (let i = 0; i < this.outputNames.length; i++) {
    // 			let name = this.outputNames[i]
    // 			let h = new LinkHook({
    // 				mobject: this.mobject,
    // 				name: name,
    // 				type: 'output'
    // 			})
    // 			let t = new TextLabel({
    // 				text: name,
    // 				horizontalAlign: 'left',
    // 				verticalAlign: 'center',
    // 				viewHeight: HOOK_VERTICAL_SPACING,
    // 				viewWidth: 100
    // 			})
    // 			this.add(h)
    // 			this.add(t)
    // 			h.update({ anchor: new Vertex([HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * i]) })
    // 			t.update({ anchor: h.anchor.translatedBy(HOOK_LABEL_OFFSET, 0) })
    // 			this.linkHooks.push(h)
    // 		}
    // 	}
    // 	hookNamed(name): LinkHook | null {
    // 		for (let h of this.linkHooks) {
    // 			if (h.name == name) {
    // 				return h
    // 			}
    // 		}
    // 		return null
    // 	}
    // 	updateModel(argsDict: object = {}) {
    // 		if (argsDict['outputNames'] !== undefined) {
    // 			this.createHookList()
    // 		}
    // 	 	let p3: Vertex = this.topCenter()
    // 		let p4: Vertex = this.mobject.localBottomCenter()
    // 		argsDict['anchor'] = this.anchor.translatedBy(p4[0] - p3[0], p4[1] - p3[1] + HOOK_INSET_Y)
    // 		argsDict['height'] = this.getHeight()
    // 		super.updateModel(argsDict)
    // 	}
    // }
    class OutputList extends RoundedRectangle {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                mobject: null,
                outputNames: [],
                linkHooks: [],
                cornerRadius: 20,
                fillColor: Color.white(),
                fillOpacity: 0.2,
                strokeWidth: 0,
                width: IO_LIST_WIDTH
            });
        }
        statefulSetup() {
            super.statefulSetup();
            this.createHookList();
            this.update({ height: this.getHeight() }, false);
        }
        getHeight() {
            if (this.outputNames == undefined) {
                return 0;
            }
            if (this.outputNames.length == 0) {
                return 0;
            }
            else {
                return 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * (this.outputNames.length - 1);
            }
        }
        createHookList() {
            this.linkHooks = [];
            for (let i = 0; i < this.outputNames.length; i++) {
                let name = this.outputNames[i];
                let h = new LinkHook({
                    mobject: this.mobject,
                    name: name,
                    type: 'output'
                });
                let t = new TextLabel({
                    text: name,
                    horizontalAlign: 'left',
                    verticalAlign: 'center',
                    viewHeight: HOOK_VERTICAL_SPACING,
                    viewWidth: IO_LIST_WIDTH - HOOK_LABEL_INSET
                });
                this.add(h);
                this.add(t);
                h.update({ midpoint: new Vertex([HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * i]) });
                t.update({ anchor: h.midpoint.translatedBy(HOOK_LABEL_INSET, -HOOK_VERTICAL_SPACING / 2) });
                this.linkHooks.push(h);
            }
        }
        hookNamed(name) {
            for (let h of this.linkHooks) {
                if (h.name == name) {
                    return h;
                }
            }
            return null;
        }
        updateModel(argsDict = {}) {
            if (argsDict['outputNames'] !== undefined) {
                this.createHookList();
            }
            let p1 = this.topCenter();
            let p2 = this.mobject.localBottomCenter();
            argsDict['anchor'] = this.anchor.translatedBy(p2[0] - p1[0], p2[1] - p1[1] + IO_LIST_OFFSET);
            argsDict['height'] = this.getHeight();
            super.updateModel(argsDict);
        }
    }

    class LinkableMobject extends Mobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                inputNames: [], // linkable parameters
                outputNames: [], // linkable parameters
            });
        }
        get parent() {
            return super.parent;
        }
        set parent(newValue) {
            super.parent = newValue;
        }
        statefulSetup() {
            super.statefulSetup();
            this.inputList = new InputList({
                mobject: this,
                inputNames: this.inputNames
            });
            this.add(this.inputList);
            this.inputList.hide();
            this.outputList = new OutputList({
                mobject: this,
                outputNames: this.outputNames
            });
            this.add(this.outputList);
            this.outputList.hide();
        }
        showLinks() {
            this.inputList.show();
            this.outputList.show();
        }
        hideLinks() {
            this.inputList.hide();
            this.outputList.hide();
        }
        inputHooks() {
            let arr = [];
            for (let inputName of this.inputNames) {
                arr.push(this.inputList.hookNamed(inputName));
            }
            return arr;
        }
        outputHooks() {
            let arr = [];
            for (let outputName of this.outputNames) {
                arr.push(this.outputList.hookNamed(outputName));
            }
            return arr;
        }
        dragging(e) {
            super.dragging(e);
            this.parent.linkMap.update();
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

    class Arrow extends Polygon {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                startPoint: Vertex.origin(),
                endPoint: Vertex.origin()
            });
        }
    }
    // export class Arrow extends MGroup {
    //     constructor(start = Vertex.origin(), end = Vertex.origin()) {
    //         super()
    //         if (end == null) {
    //             this.components = new Vertex(start)
    //         } else {
    //             this.startPoint = new Vertex(start)
    //             this.components = new Vertex(end)
    //         }
    //         this.stem = new Segment(Vertex.origin(), this.components())
    //         this.add(this.stem)
    //         this.tip = new Polygon(this.tipPoints())
    //         this.add(this.tip)
    //     }
    //     get startPoint() { return this.anchor }
    //     set startPoint(newValue) { this.anchor = new Vertex(newValue) }
    //     tipPoints() {
    //         let w = new Scaling(-0.2).appliedTo(this.components)
    //         let w1 = new Rotation(Math.PI/8).appliedTo(w)
    //         let w2 = new Rotation(-Math.PI/8).appliedTo(w)
    //         return new Translation(this.components).appliedTo([Vertex.origin(), w1, w2])
    //     }
    //     get endPoint() {
    //         return this.startPoint.translatedBy(this.components)
    //     }
    //     set endPoint(newValue) {
    //         this.components = new Vertex(newValue).subtract(this.startPoint)
    //     }
    //     redraw() {
    //         if (this.view == undefined || this.components == undefined) { return }
    //         if (this.visible && this.components.isNaN()) {
    //             this.visible = false
    //         }
    //         if (!this.visible && !this.components.isNaN()) {
    //             this.visible = true
    //         }
    //         if (this.stem != undefined) {
    //             this.stem.anchor = Vertex.origin()
    //             this.stem.vertices = [Vertex.origin(), this.components]
    //         }
    //         if (this.tip != undefined) {
    //             this.tip.anchor = Vertex.origin()
    //             this.tip.vertices = this.tipPoints()
    //         }
    //         super.redraw()
    //     }
    //     norm2() { return this.components.norm2() }
    //     norm() { return Math.sqrt(this.norm2()) }
    // }
    // export class Vector extends Arrow {}

    class Segment extends Arrow {
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

    class LinkBullet extends Circle {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                radius: BULLET_RADIUS,
                fillOpacity: 1,
                strokeColor: Color.white()
            });
        }
        get parent() {
            return super.parent;
        }
        set parent(newValue) {
            super.parent = newValue;
        }
        positionInLinkMap() {
            return this.parent.transformLocalPoint(this.midpoint, this.parent.parent.parent);
        }
    }

    class DependencyLink extends Mobject {
        statelessSetup() {
            super.statelessSetup();
            this.dependency = new Dependency();
            this.startBullet = new LinkBullet();
            this.endBullet = new LinkBullet();
            this.linkLine = new Segment({
                strokeWidth: LINK_LINE_WIDTH
            });
        }
        statefulSetup() {
            super.statefulSetup();
            this.add(this.startBullet);
            this.add(this.linkLine);
            this.add(this.endBullet);
            this.startBullet.addDependency('midpoint', this.linkLine, 'startPoint');
            this.endBullet.addDependency('midpoint', this.linkLine, 'endPoint');
        }
    }

    class LinkMap extends Mobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                linkList: [],
                connectedHooks: [],
                openBullet: null,
                openLink: null,
                screenEventHandler: ScreenEventHandler.Self
            });
        }
        get parent() {
            return super.parent;
        }
        set parent(newValue) {
            super.parent = newValue;
        }
        hookAtLocation(p) {
            for (let h of this.parent.innerInputHooks()) {
                if (p.closeTo(h.positionInLinkMap(), SNAPPING_DISTANCE)) {
                    return h;
                }
            }
            for (let h of this.parent.innerOutputHooks()) {
                if (p.closeTo(h.positionInLinkMap(), SNAPPING_DISTANCE)) {
                    return h;
                }
            }
            return null;
        }
        bulletAtLocation(p) {
            for (let link of this.linkList) {
                if (link.startBullet.positionInLinkMap().closeTo(p, SNAPPING_DISTANCE)) {
                    return link.startBullet;
                }
                if (link.endBullet.positionInLinkMap().closeTo(p, SNAPPING_DISTANCE)) {
                    return link.endBullet;
                }
            }
            return null;
        }
        onPointerDown(e) {
            let p = this.localEventVertex(e);
            p = this.hookAtLocation(p).positionInLinkMap();
            this.openBullet = this.bulletAtLocation(p);
            if (this.hookAtLocation(p) === null) {
                return;
            }
            if (this.openBullet === null) {
                // create new link from that hook
                let sb = new LinkBullet({ midpoint: p });
                let eb = new LinkBullet({ midpoint: p });
                this.openLink = new DependencyLink({
                    startBullet: sb,
                    endBullet: eb
                });
                this.add(this.openLink);
                if (this.hookAtLocation(p).type == 'input') {
                    // connecting input to output
                    this.openBullet = this.openLink.startBullet;
                }
                else {
                    // connecting output to input
                    this.openBullet = this.openLink.endBullet;
                }
            }
            else {
                // editing an existing link
                this.openLink = this.openBullet.parent;
            }
        }
        createNewLinkBetween(startHook, endHook) {
            this.openLink = new DependencyLink();
            this.add(this.openLink);
            this.openLink.startBullet.update({
                midpoint: startHook.positionInLinkMap()
            });
            this.openLink.endBullet.update({
                midpoint: endHook.positionInLinkMap()
            });
            startHook.addDependency('positionInLinkMap', this.openLink.startBullet, 'midpoint');
            endHook.addDependency('positionInLinkMap', this.openLink.endBullet, 'midpoint');
            this.linkList.push(this.openLink);
            this.openBullet = this.openLink.endBullet;
        }
        onPointerMove(e) {
            var p = this.localEventVertex(e);
            //log(p)
            let hooks = this.compatibleHooks();
            for (let h of hooks) {
                if (p.closeTo(h.positionInLinkMap(), SNAPPING_DISTANCE)) {
                    this.openBullet.update({
                        midpoint: h.positionInLinkMap()
                    });
                    return;
                }
            }
            this.openBullet.update({
                midpoint: p
            });
        }
        hookForBullet(bullet) {
            if (bullet === null) {
                return null;
            }
            for (let hook of this.parent.innerInputHooks()) {
                if (bullet.positionInLinkMap().equals(hook.positionInLinkMap())) {
                    return hook;
                }
            }
            for (let hook of this.parent.innerOutputHooks()) {
                if (bullet.positionInLinkMap().equals(hook.positionInLinkMap())) {
                    return hook;
                }
            }
            return null;
        }
        connectedBulletOfOpenLink() {
            if (this.openLink === null) {
                return null;
            }
            if (this.openBullet == this.openLink.startBullet) {
                return this.openLink.endBullet;
            }
            else {
                return this.openLink.startBullet;
            }
        }
        connectedHookOfOpenLink() {
            let b = this.connectedBulletOfOpenLink();
            return this.hookForBullet(b);
        }
        connectedMobjectOfOpenLink() {
            let h = this.connectedHookOfOpenLink();
            if (h === null) {
                return null;
            }
            return h.parent.parent;
        }
        compatibleHooks() {
            if (this.openBullet === null) {
                return [];
            }
            // to the current openBullet
            let hooks = [];
            if (this.openBullet === this.openLink.startBullet) {
                // input looking for an output
                extend(hooks, this.parent.innerOutputHooks());
                for (let h of this.connectedMobjectOfOpenLink().outputHooks()) {
                    remove(hooks, h);
                }
                return hooks;
            }
            else {
                // output looking for an input
                extend(hooks, this.parent.innerInputHooks());
                for (let h of this.connectedMobjectOfOpenLink().inputHooks()) {
                    remove(hooks, h);
                }
                return hooks;
            }
        }
        onPointerUp(e) {
            let h = this.hookAtLocation(this.localEventVertex(e));
            if (h === null) {
                this.remove(this.openLink);
            }
            else {
                this.createNewDependency();
            }
            this.openLink = null;
            this.openBullet = null;
        }
        createNewDependency() {
            if (this.openBullet == this.openLink.startBullet) {
                let startHook = this.hookAtLocation(this.openBullet.positionInLinkMap());
                let endHook = this.hookAtLocation(this.openLink.endBullet.positionInLinkMap());
                this.createNewDependencyBetweenHooks(startHook, endHook);
            }
            else if (this.openBullet == this.openLink.endBullet) {
                let startHook = this.hookAtLocation(this.openLink.startBullet.positionInLinkMap());
                let endHook = this.hookAtLocation(this.openBullet.positionInLinkMap());
                this.createNewDependencyBetweenHooks(startHook, endHook);
                this.connectedHooks.push([startHook, this.openLink, endHook]);
            }
        }
        createNewDependencyBetweenHooks(startHook, endHook) {
            startHook.mobject.addDependency(startHook.name, endHook.mobject, endHook.name);
        }
        updateModel(argsDict = {}) {
            super.updateModel(argsDict);
            for (let trio of this.connectedHooks) {
                let sh = trio[0];
                let link = trio[1];
                let eh = trio[2];
                link.startBullet.updateModel({
                    midpoint: sh.positionInLinkMap()
                });
                link.linkLine.updateModel({
                    startPoint: sh.positionInLinkMap(),
                    endPoint: eh.positionInLinkMap()
                });
                link.endBullet.updateModel({
                    midpoint: eh.positionInLinkMap()
                });
            }
        }
    }

    class CreatingMobject extends Mobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                startPoint: Vertex.origin(),
                endPoint: Vertex.origin()
            });
        }
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                screenEventHandler: ScreenEventHandler.Self
            });
        }
        get parent() {
            return super.parent;
        }
        set parent(newValue) {
            super.parent = newValue;
        }
        dissolve() {
            let cm = this.createdMobject();
            cm.update({
                anchor: this.startPoint
            });
            this.parent.addToContent(cm);
            this.parent.remove(this);
        }
        createdMobject() {
            return this;
        }
        updateFromTip(q) {
            this.endPoint.copyFrom(q);
        }
    }

    class CreatingBox extends CreatingMobject {
        statelessSetup() {
            super.statelessSetup();
            this.top = new Segment({ strokeColor: Color.white() });
            this.bottom = new Segment({ strokeColor: Color.white() });
            this.left = new Segment({ strokeColor: Color.white() });
            this.right = new Segment({ strokeColor: Color.white() });
        }
        statefulSetup() {
            super.statefulSetup();
            this.addDependency('p1', this.top, 'startPoint');
            this.addDependency('p2', this.top, 'endPoint');
            this.addDependency('p4', this.bottom, 'startPoint');
            this.addDependency('p3', this.bottom, 'endPoint');
            this.addDependency('p1', this.left, 'startPoint');
            this.addDependency('p4', this.left, 'endPoint');
            this.addDependency('p2', this.right, 'startPoint');
            this.addDependency('p3', this.right, 'endPoint');
            this.endPoint = this.endPoint || this.startPoint.copy();
            this.p1 = this.startPoint;
            this.p2 = new Vertex(this.endPoint.x, this.startPoint.y);
            this.p3 = this.endPoint;
            this.p4 = new Vertex(this.startPoint.x, this.endPoint.y);
            this.top.setAttributes({ startPoint: this.p1, endPoint: this.p2 });
            this.bottom.setAttributes({ startPoint: this.p4, endPoint: this.p3 });
            this.left.setAttributes({ startPoint: this.p1, endPoint: this.p4 });
            this.right.setAttributes({ startPoint: this.p2, endPoint: this.p3 });
            this.add(this.top);
            this.add(this.bottom);
            this.add(this.left);
            this.add(this.right);
        }
        updateFromTip(q) {
            this.endPoint.copyFrom(q);
            this.p2.x = this.endPoint.x;
            this.p2.y = this.startPoint.y;
            this.p4.x = this.startPoint.x;
            this.p4.y = this.endPoint.y;
            this.update({
                viewWidth: Math.abs(this.endPoint.x - this.startPoint.x),
                viewHeight: Math.abs(this.endPoint.y - this.startPoint.y)
            });
        }
        createdMobject() {
            let topLeft = new Vertex(Math.min(this.p1.x, this.p3.x), Math.min(this.p1.y, this.p3.y));
            let bottomRight = new Vertex(Math.max(this.p1.x, this.p3.x), Math.max(this.p1.y, this.p3.y));
            let w = bottomRight.x - topLeft.x;
            let h = bottomRight.y - topLeft.y;
            let cm = new Mobject({
                anchor: topLeft,
                viewWidth: w,
                viewHeight: h
            });
            return cm;
        }
    }

    class CreatingExpandableMobject extends CreatingBox {
        createdMobject() {
            let topLeft = new Vertex(Math.min(this.p1.x, this.p3.x), Math.min(this.p1.y, this.p3.y));
            let bottomRight = new Vertex(Math.max(this.p1.x, this.p3.x), Math.max(this.p1.y, this.p3.y));
            let w = bottomRight.x - topLeft.x;
            let h = bottomRight.y - topLeft.y;
            let cm = new ExpandableMobject({
                compactAnchor: topLeft,
                compactWidth: w,
                compactHeight: h
            });
            cm.contractStateChange();
            return cm;
        }
    }

    class CreatingConstruction extends CreatingBox {
        createdMobject() {
            let topLeft = new Vertex(Math.min(this.p1.x, this.p3.x), Math.min(this.p1.y, this.p3.y));
            let c = new Construction({
                compactAnchor: topLeft,
                compactWidth: this.viewWidth,
                compactHeight: this.viewHeight
            });
            c.contractStateChange();
            return c;
        }
    }

    class CindyCanvas extends LinkableMobject {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                screenEventHandler: ScreenEventHandler.Self,
            });
        }
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                points: []
            });
        }
        statefulSetup() {
            super.statefulSetup();
            this.innerCanvas = new Mobject({
                viewWidth: this.viewWidth,
                viewHeight: this.viewHeight,
                screenEventHandler: ScreenEventHandler.Auto
            });
            this.add(this.innerCanvas);
            this.innerCanvas.view.style['pointer-events'] = 'auto';
            this.innerCanvas.view.id = this.id;
            this.port = {
                id: this.id,
                width: this.viewWidth,
                height: this.viewHeight,
                transform: [{
                        visibleRect: [0, 1, 1, 0]
                    }]
            };
        }
        initCode() {
            return `resetclock();`;
        }
        drawCode() {
            return `drawcmd();`;
        }
        cindySetup() {
            let initScript = document.createElement('script');
            initScript.setAttribute('type', 'text/x-cindyscript');
            initScript.setAttribute('id', `${this.id}init`);
            initScript.textContent = this.initCode();
            document.body.appendChild(initScript);
            let drawScript = document.createElement('script');
            drawScript.setAttribute('type', 'text/x-cindyscript');
            drawScript.setAttribute('id', `${this.id}draw`);
            drawScript.textContent = this.drawCode();
            document.body.appendChild(drawScript);
            //this.port['element'] = this.view
            let argsDict = {
                scripts: `${this.id}*`,
                animation: { autoplay: true },
                ports: [this.port],
                geometry: this.geometry()
            };
            this.core = CindyJS.newInstance(argsDict);
        }
        startUp() {
            if (document.readyState === 'complete') {
                this.startNow();
            }
            else {
                document.addEventListener('DOMContentLoaded', function (e) { this.startNow(); }.bind(this));
            }
        }
        startNow() {
            this.core.startup();
            this.core.started = true;
            this.core.play();
            setTimeout(function () { console.log('core:', this.core); }.bind(this), 1000);
        }
        geometry() { return []; }
        setDragging(flag) {
            super.setDragging(flag);
            if (flag) {
                this.innerCanvas.screenEventHandler = ScreenEventHandler.Parent;
            }
            else {
                this.innerCanvas.screenEventHandler = ScreenEventHandler.Auto;
            }
        }
    }

    class WaveCindyCanvas extends CindyCanvas {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                wavelength: 1,
                frequency: 0
            });
        }
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                inputNames: ['wavelength', 'frequency'],
                outputNames: []
            });
        }
        statefulSetup() {
            super.statefulSetup();
            this.cindySetup();
        }
        initCode() {
            let l = 0.1 * (this.wavelength || 1);
            let f = 10 * (this.frequency || 1);
            return `W(x, p, l, f) := 0.5 * (1 + sin(|x - p| / l - seconds()*f)); drawcmd() := ( colorplot((0,W(#, A0, ${l}, ${f}) + W(#, A1, ${l}, ${f}),0)););` + super.initCode();
        }
        drawCode() {
            return `drawcmd();`;
        }
        geometry() {
            let ret = [];
            let i = 0;
            for (let point of this.points) {
                ret.push({ name: "A" + i, kind: "P", type: "Free", pos: point });
                i += 1;
            }
            return ret;
        }
        updateModel(argsDict = {}) {
            super.updateModel(argsDict);
            if (this.core != undefined && this.points.length > 0) {
                let l = 0.1 * (this.wavelength || 1);
                let f = 10 * (this.frequency || 1);
                this.core.evokeCS(`drawcmd() := ( colorplot((0,W(#, A0, ${l}, ${f}) + W(#, A1, ${l}, ${f}),0)););`);
            }
        }
    }

    class CreatingWaveCindyCanvas extends CreatingBox {
        createdMobject() {
            return new WaveCindyCanvas({
                anchor: this.startPoint,
                viewWidth: this.viewWidth,
                viewHeight: this.viewHeight,
                points: [[0.4, 0.4], [0.3, 0.8]],
                id: `wave-${this.viewWidth}x${this.viewHeight}`
            });
        }
        dissolve() {
            let cm = this.createdMobject();
            this.parent.addToContent(cm);
            this.parent.remove(this);
            cm.startUp();
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

    class BoxSlider extends LinkableMobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                min: 0,
                max: 1,
                value: 0.6,
                height: 200,
                width: 50,
                strokeColor: Color.white(),
                fillColor: Color.black(),
                barFillColor: Color.gray(0.5),
                screenEventHandler: ScreenEventHandler.Self
            });
        }
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                inputNames: [],
                outputNames: ['value']
            });
        }
        statelessSetup() {
            //// state-independent setup
            super.statelessSetup();
            this.outerBar = new Rectangle({
                fillColor: Color.black(),
                fillOpacity: 1,
                strokeColor: Color.white()
            });
            this.filledBar = new Rectangle({
                fillOpacity: 0.5
            });
            this.label = new TextLabel({
                viewHeight: 25,
                horizontalAlign: 'center',
                verticalAlign: 'center'
            });
        }
        statefulSetup() {
            super.statefulSetup();
            this.add(this.outerBar);
            this.add(this.filledBar);
            this.add(this.label);
            this.update();
        }
        normalizedValue() {
            return (this.value - this.min) / (this.max - this.min);
        }
        updateModel(argsDict = {}) {
            super.updateModel(argsDict);
            //// internal dependencies
            this.viewWidth = this.width;
            this.viewHeight = this.height;
            this.positionView();
            //// updating submobs
            let a = this.normalizedValue();
            if (isNaN(a)) {
                return;
            }
            this.outerBar.update({
                width: this.width,
                height: this.height,
                fillColor: this.backgroundColor
            }, false);
            this.filledBar.update({
                width: this.width,
                height: a * this.height,
                anchor: new Vertex(0, this.height - a * this.height),
                fillColor: this.barFillColor
            }, false);
            this.label.update({
                text: this.value.toPrecision(3).toString(),
                anchor: new Vertex(this.width / 2 - this.width / 2, this.height / 2 - 25 / 2),
                viewWidth: this.width
            }, false);
        }
        onPointerDown(e) {
            this.scrubStartingPoint = eventVertex(e);
            this.valueBeforeScrubbing = this.value;
        }
        onPointerMove(e) {
            let scrubVector = eventVertex(e).subtract(this.scrubStartingPoint);
            this.value = this.valueBeforeScrubbing - scrubVector.y / this.height * (this.max - this.min);
            this.value = Math.max(Math.min(this.value, this.max), this.min);
            this.update();
        }
    }

    class CreatingBoxSlider extends CreatingMobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                width: 50,
                height: 0,
                fillColor: Color.black(),
                startPoint: Vertex.origin()
            });
        }
        statelessSetup() {
            super.statelessSetup();
            this.protoSlider = new BoxSlider();
        }
        statefulSetup() {
            super.statefulSetup();
            this.add(this.protoSlider);
            this.anchor = this.startPoint;
            this.protoSlider.update({
                value: 0.5,
                width: this.width,
                height: 1,
                fillColor: Color.black(),
                barFillColor: Color.gray(0.5)
            });
            this.protoSlider.hideLinks();
        }
        createdMobject() {
            return this.protoSlider;
        }
        updateFromTip(q) {
            this.update({
                fillColor: Color.black()
            });
            this.protoSlider.update({
                height: q.y - this.startPoint.y,
                //fillColor: gray(0.5) // This shouldn't be necessary, fix
            });
            this.protoSlider.filledBar.update({
                fillColor: Color.gray(0.5)
            });
            this.protoSlider.hideLinks();
        }
        dissolve() {
            super.dissolve();
            this.protoSlider.update({
                anchor: this.anchor
            });
            this.protoSlider.outerBar.update({ anchor: new Vertex(0, 0) }); // necessary?
            this.protoSlider.label.update({
                anchor: new Vertex(this.protoSlider.width / 2 - this.protoSlider.label.viewWidth / 2, this.protoSlider.height / 2 - this.protoSlider.label.viewHeight / 2)
            });
        }
    }

    class Freehand extends CreatingMobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                penStrokeColor: Color.white(),
                penStrokeWidth: 1.0
            });
        }
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                screenEventHandler: ScreenEventHandler.Below
            });
        }
        statelessSetup() {
            super.statelessSetup();
            this.line = new Polygon({
                closed: false,
                opacity: 1.0
            });
        }
        statefulSetup() {
            super.statefulSetup();
            this.addDependency('penStrokeColor', this.line, 'strokeColor');
            this.line.update({
                strokeColor: this.penStrokeColor
            });
            if (this.line.vertices.length > 0) {
                this.startPoint = this.line.vertices[0];
                this.endPoint = this.line.vertices[this.line.vertices.length - 1];
            }
            this.add(this.line);
        }
        updateWithPoints(q) {
            let nbDrawnPoints = this.children.length;
            let p = null;
            if (nbDrawnPoints > 0) {
                p = this.children[nbDrawnPoints - 1].midpoint;
            }
            let pointDistance = 10;
            let distance = ((p.x - q.x) ** 2 + (p.y - q.y) ** 2) ** 0.5;
            let unitVector = new Vertex([(q.x - p.x) / distance, (q.y - p.y) / distance]);
            for (let step = pointDistance; step < distance; step += pointDistance) {
                let x = p.x + step * unitVector.x + 0.5 * Math.random();
                let y = p.y + step * unitVector.y + 0.5 * Math.random();
                let newPoint = new Vertex([x, y]);
                let c = new Circle({ radius: 2 });
                c.fillColor = this.penStrokeColor;
                c.midpoint = new Vertex(newPoint);
                this.add(c);
            }
            let t = Math.random();
            let r = (1 - t) * 0.5 + t * 0.75;
            let c = new Circle({ radius: r, midpoint: new Vertex(q) });
            this.add(c);
        }
        updateWithLines(q) {
            this.line.vertices.push(q);
        }
        updateFromTip(q) {
            this.updateWithLines(q);
            this.endPoint.copyFrom(q);
            this.redraw();
        }
        dissolve() {
            this.line.adjustFrame();
            let dr = this.line.anchor.copy();
            this.line.update({
                anchor: Vertex.origin()
            });
            this.update({
                anchor: this.anchor.translatedBy(dr),
                viewWidth: this.line.getWidth(),
                viewHeight: this.line.getHeight()
            });
            let par = this.parent;
            this.parent.remove(this);
            if (this.visible) {
                par.addToContent(this);
            }
        }
    }

    class ExpandButton extends TextLabel {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                viewWidth: 30,
                viewHeight: 30,
                anchor: Vertex.origin(),
                screenEventHandler: ScreenEventHandler.Self,
                backgroundColor: Color.green().brighten(0.5),
                color: Color.black()
            });
        }
        get parent() {
            return super.parent;
        }
        set parent(newValue) {
            super.parent = newValue;
        }
        onTap(e) {
            this.parent.toggleViewState();
        }
    }

    class Pendulum extends LinkableMobject {
        statelessSetup() {
            super.statelessSetup();
            this.fixture = new Rectangle({
                fillColor: Color.white(),
                fillOpacity: 1
            });
            this.string = new Segment();
            this.weight = new Circle({
                fillColor: Color.white(),
                fillOpacity: 1
            });
            this.initialTime = Date.now();
        }
        statefulSetup() {
            super.statefulSetup();
            this.add(this.fixture);
            this.add(this.string);
            this.add(this.weight);
            this.fixture.update({
                width: this.fixtureWidth,
                height: this.fixtureHeight,
                anchor: new Vertex(-this.fixtureWidth / 2, -this.fixtureHeight)
            }, false);
            this.weight.update({
                radius: this.weightRadius
            });
        }
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                fixtureWidth: 50,
                fixtureHeight: 10,
                initialSpeed: 0,
                inputNames: ['length', 'mass'],
                outputNames: ['angle', 'period']
            });
        }
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                maxLength: 300,
                length: 1,
                mass: 0.2,
                initialAngle: 0,
                initialTime: 0
            });
        }
        get angle() {
            let dt = (Date.now() - this.initialTime) % this.period;
            let value = this.initialAngle * Math.cos(2 * Math.PI * dt / this.period);
            return value;
        }
        get period() {
            return 500 * this.length ** 0.5 * 5; // ms
        }
        get pixelLength() {
            return this.length * this.maxLength;
        }
        get weightRadius() {
            return 50 * this.mass ** 0.5;
        }
        updateModel(argsDict = {}) {
            super.updateModel(argsDict);
            let angle = argsDict['initialAngle'] ?? this.angle;
            let newEndPoint = (new Vertex(0, 1)).rotatedBy(-angle).scaledBy(this.pixelLength);
            this.string.updateModel({
                endPoint: newEndPoint
            });
            this.weight.updateModel({
                radius: this.weightRadius,
                midpoint: newEndPoint
            });
        }
        run() {
            window.setInterval(function () { this.update(); }.bind(this), 10);
        }
    }

    class CreatingPendulum extends CreatingMobject {
        statelessSetup() {
            super.statelessSetup();
            this.pendulum = new Pendulum();
        }
        statefulSetup() {
            super.statefulSetup();
            this.add(this.pendulum);
            this.pendulum.update({
                anchor: this.startPoint
            }, false);
            this.pendulum.hideLinks();
        }
        createdMobject() {
            return this.pendulum;
        }
        updateFromTip(q) {
            super.updateFromTip(q);
            let dr = q.subtract(this.startPoint);
            let length = dr.norm();
            let angle = Math.atan2(dr.x, dr.y);
            this.pendulum.update({
                maxLength: length,
                length: 1,
                initialAngle: angle
            });
            this.pendulum.hideLinks();
        }
        dissolve() {
            super.dissolve();
            this.pendulum.update({
                initialTime: Date.now()
            });
            this.pendulum.run();
        }
    }

    class Point extends Circle {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                radius: 7.0
            });
        }
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                fillColor: Color.white(),
                fillOpacity: 1.0
            });
        }
        statefulSetup() {
            super.statefulSetup();
            if (!this.midpoint || this.midpoint.isNaN()) {
                this.update({ midpoint: Vertex.origin() }, false);
            }
        }
    }

    class FreePoint extends Point {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                screenEventHandler: ScreenEventHandler.Self
            });
        }
        onPointerDown(e) {
            this.startDragging(e);
        }
        onPointerMove(e) {
            this.dragging(e);
        }
        onPointerUp(e) {
            this.endDragging(e);
        }
    }

    class ConstructingMobject extends CreatingMobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                penStrokeColor: Color.white(),
                penStrokeWidth: 1.0,
                penFillColor: Color.white(),
                penFillOpacity: 0.0
            });
        }
        get parent() {
            return super.parent;
        }
        set parent(newValue) {
            super.parent = newValue;
        }
    }

    class ConstructingArrow extends ConstructingMobject {
        statelessSetup() {
            super.statelessSetup();
            this.startFreePoint = new FreePoint();
            this.endFreePoint = new FreePoint();
        }
        statefulSetup() {
            super.statefulSetup();
            this.add(this.startFreePoint);
            this.add(this.endFreePoint);
            this.endPoint = this.endPoint ?? this.startPoint.copy();
            this.addDependency('penStrokeColor', this.startFreePoint, 'strokeColor');
            this.addDependency('penFillColor', this.startFreePoint, 'fillColor');
            this.addDependency('penStrokeColor', this.endFreePoint, 'strokeColor');
            this.addDependency('penFillColor', this.endFreePoint, 'fillColor');
            this.addDependency('startPoint', this.startFreePoint, 'midpoint');
            this.addDependency('endPoint', this.endFreePoint, 'midpoint');
            this.startFreePoint.update({ midpoint: this.startPoint });
            this.endFreePoint.update({ midpoint: this.endPoint });
        }
        updateFromTip(q) {
            super.updateFromTip(q);
            this.update();
        }
        dissolve() {
            this.parent.integrate(this);
        }
    }

    class ConstructingSegment extends ConstructingArrow {
        statelessSetup() {
            super.statelessSetup();
            this.segment = new Segment();
        }
        statefulSetup() {
            super.statefulSetup();
            this.add(this.segment);
            this.segment.update({
                startPoint: this.startFreePoint.midpoint,
                endPoint: this.endFreePoint.midpoint
            });
            this.startFreePoint.addDependency('midpoint', this.segment, 'startPoint');
            this.endFreePoint.addDependency('midpoint', this.segment, 'endPoint');
            this.addDependency('penStrokeColor', this.segment, 'strokeColor');
        }
    }

    class Ray extends Segment {
        drawingEndPoint() {
            if (this.startPoint == this.endPoint) {
                return this.endPoint;
            }
            return this.startPoint.add(this.endPoint.subtract(this.startPoint).multiply(100));
        }
    }

    class ConstructingRay extends ConstructingArrow {
        statelessSetup() {
            super.statelessSetup();
            this.ray = new Ray();
        }
        statefulSetup() {
            super.statefulSetup();
            this.add(this.ray);
            this.ray.update({
                startPoint: this.startFreePoint.midpoint,
                endPoint: this.endFreePoint.midpoint
            }, false);
            this.startFreePoint.addDependency('midpoint', this.ray, 'startPoint');
            this.endFreePoint.addDependency('midpoint', this.ray, 'endPoint');
            this.addDependency('penStrokeColor', this.ray, 'strokeColor');
        }
    }

    class Line extends Ray {
        drawingStartPoint() {
            if (this.startPoint == this.endPoint) {
                return this.startPoint;
            }
            return this.endPoint.add(this.startPoint.subtract(this.endPoint).multiply(100));
        }
    }

    class ConstructingLine extends ConstructingArrow {
        statelessSetup() {
            super.statelessSetup();
            this.line = new Line();
        }
        statefulSetup() {
            super.statefulSetup();
            this.add(this.line);
            this.line.update({
                startPoint: this.startFreePoint.midpoint,
                endPoint: this.endFreePoint.midpoint
            }, false);
            this.startFreePoint.addDependency('midpoint', this.line, 'startPoint');
            this.endFreePoint.addDependency('midpoint', this.line, 'endPoint');
            this.addDependency('penStrokeColor', this.line, 'strokeColor');
        }
    }

    class TwoPointCircle extends Circle {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                strokeColor: Color.white(),
                fillColor: Color.white(),
                fillOpacity: 0,
                outerPoint: Vertex.origin()
            });
        }
        statefulSetup() {
            super.statefulSetup();
            this.view.style['pointer-events'] = 'none';
        }
        updateModel(argsDict = {}) {
            let p = argsDict['midpoint'] || this.midpoint;
            let q = argsDict['outerPoint'] || this.outerPoint;
            let r = p.subtract(q).norm();
            argsDict['radius'] = r;
            super.updateModel(argsDict);
        }
    }

    class ConstructingCircle extends ConstructingMobject {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                strokeWidth: 1,
                fillOpacity: 0
            });
        }
        statelessSetup() {
            super.statelessSetup();
            this.freeMidpoint = new FreePoint();
            this.freeOuterPoint = new FreePoint();
            this.circle = new TwoPointCircle();
        }
        statefulSetup() {
            super.statefulSetup();
            this.midpoint = this.midpoint || this.startPoint.copy();
            this.outerPoint = this.outerPoint || this.startPoint.copy();
            this.add(this.freeMidpoint);
            this.add(this.freeOuterPoint);
            this.add(this.circle);
            this.addDependency('penStrokeColor', this.freeMidpoint, 'strokeColor');
            this.addDependency('penFillColor', this.freeMidpoint, 'fillColor');
            this.addDependency('penStrokeColor', this.freeOuterPoint, 'strokeColor');
            this.addDependency('penFillColor', this.freeOuterPoint, 'fillColor');
            this.addDependency('penStrokeColor', this.circle, 'strokeColor');
            this.freeMidpoint.addDependency('midpoint', this.circle, 'midpoint');
            this.freeOuterPoint.addDependency('midpoint', this.circle, 'outerPoint');
            this.freeMidpoint.update({
                midpoint: this.midpoint,
                strokeColor: this.penStrokeColor,
                fillColor: this.penFillColor
            }, false);
            this.freeOuterPoint.update({
                midpoint: this.outerPoint,
                strokeColor: this.penStrokeColor,
                fillColor: this.penFillColor
            }, false);
            this.circle.update({
                midpoint: this.freeMidpoint.midpoint,
                outerPoint: this.freeOuterPoint.midpoint,
                fillOpacity: 0
            }, false);
        }
        updateFromTip(q) {
            super.updateFromTip(q);
            this.outerPoint.copyFrom(q);
            this.freeOuterPoint.midpoint.copyFrom(q);
            this.update();
        }
        dissolve() {
            this.parent.integrate(this);
        }
        // remove?
        update(argsDict = {}, redraw = true) {
            super.update(argsDict, redraw);
        }
    }

    class IntersectionPoint extends Point {
        constructor() {
            super(...arguments);
            this.fillOpacity = 0;
            this.lambda = NaN;
            this.mu = NaN;
        }
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                midpoint: new Vertex(NaN, NaN)
            });
        }
        updateModel(argsDict = {}) {
            let mp = this.intersectionCoords();
            if (mp.isNaN() || !this.geomob1.visible || !this.geomob2.visible) {
                this.recursiveHide();
            }
            else {
                this.recursiveShow();
                if (!this.midpoint.equals(mp)) {
                    argsDict['midpoint'] = mp;
                }
            }
            super.updateModel(argsDict);
        }
        intersectionCoords() {
            if (this.geomob1 instanceof Arrow && this.geomob2 instanceof Circle) {
                return this.arrowCircleIntersection(this.geomob1, this.geomob2, this.index);
            }
            else if (this.geomob1 instanceof Circle && this.geomob2 instanceof Arrow) {
                return this.arrowCircleIntersection(this.geomob2, this.geomob1, this.index);
            }
            else if (this.geomob1 instanceof Arrow && this.geomob2 instanceof Arrow) {
                return this.arrowArrowIntersection(this.geomob1, this.geomob2);
            }
            else if (this.geomob1 instanceof Circle && this.geomob2 instanceof Circle) {
                return this.circleCircleIntersection(this.geomob1, this.geomob2, this.index);
            }
            else {
                return new Vertex(NaN, NaN);
            }
        }
        arrowCircleIntersection(arrow, circle, index) {
            let A = arrow.startPoint;
            let B = arrow.endPoint;
            let C = circle.midpoint;
            let r = circle.radius;
            let a = A.subtract(B).norm2();
            let b = 2 * C.subtract(A).dot(A.subtract(B));
            let c = C.subtract(A).norm2() - r ** 2;
            let d = b ** 2 - 4 * a * c;
            this.lambda = (-b + (index == 0 ? -1 : 1) * d ** 0.5) / (2 * a);
            let P = A.add(B.subtract(A).multiply(this.lambda));
            if (arrow.constructor.name == 'Segment') {
                if (this.lambda < 0 || this.lambda > 1) {
                    P = new Vertex(NaN, NaN);
                }
            }
            else if (arrow.constructor.name == 'Ray') {
                if (this.lambda < 0) {
                    P = new Vertex(NaN, NaN);
                }
            }
            return P;
        }
        arrowArrowIntersection(arrow1, arrow2) {
            let A = arrow1.startPoint;
            let B = arrow1.endPoint;
            let C = arrow2.startPoint;
            let D = arrow2.endPoint;
            let AB = B.subtract(A);
            let CD = D.subtract(C);
            let AC = C.subtract(A);
            let det = (AB.x * CD.y - AB.y * CD.x);
            if (det == 0) {
                return new Vertex(NaN, NaN);
            } // parallel lines
            this.lambda = (CD.y * AC.x - CD.x * AC.y) / det;
            this.mu = (AB.y * AC.x - AB.x * AC.y) / det;
            let Q = A.add(AB.multiply(this.lambda));
            let intersectionFlag1 = (arrow1.constructor.name == 'Segment' && this.lambda >= 0 && this.lambda <= 1) || (arrow1.constructor.name == 'Ray' && this.lambda >= 0) || (arrow1.constructor.name == 'Line');
            let intersectionFlag2 = (arrow2.constructor.name == 'Segment' && this.mu >= 0 && this.mu <= 1) || (arrow2.constructor.name == 'Ray' && this.mu >= 0) || (arrow2.constructor.name == 'Line');
            return (intersectionFlag1 && intersectionFlag2) ? Q : new Vertex(NaN, NaN);
        }
        circleCircleIntersection(circle1, circle2, index) {
            let A = circle1.midpoint;
            let B = circle2.midpoint;
            let r1 = circle1.radius;
            let r2 = circle2.radius;
            let R = 0.5 * (r1 ** 2 - r2 ** 2 - A.norm2() + B.norm2());
            let r = (A.x - B.x) / (B.y - A.y);
            let s = R / (B.y - A.y);
            let a = 1 + r ** 2;
            let b = 2 * (r * s - A.x - r * A.y);
            let c = (A.y - s) ** 2 + A.x ** 2 - r1 ** 2;
            let d = b ** 2 - 4 * a * c;
            let x = (-b + (index == 0 ? -1 : 1) * d ** 0.5) / (2 * a);
            let y = r * x + s;
            let p = new Vertex(x, y);
            return p;
        }
    }

    class ExpandableMobject extends LinkableMobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                screenEventHandler: ScreenEventHandler.Self,
                contentChildren: [],
                expanded: false,
                compactWidth: 400,
                compactHeight: 300,
                compactAnchor: Vertex.origin(),
                expandedPadding: 10,
                buttons: ['DragButton', 'LinkButton', 'ExpandableButton', 'SliderButton'],
                creationStroke: [],
                creationMode: 'freehand',
                contentInset: 0,
                sidebar: null
            });
        }
        statelessSetup() {
            super.statelessSetup();
            this.background = new RoundedRectangle({
                cornerRadius: 50,
                fillColor: Color.gray(0.1),
                fillOpacity: 1.0,
                strokeColor: Color.white(),
                strokeWidth: 1.0,
                screenEventHandler: ScreenEventHandler.Parent
            });
            this.expandButton = new ExpandButton();
            this.creatingMobject = null;
            this.linkMap = new LinkMap();
        }
        statefulSetup() {
            super.statefulSetup();
            this.viewWidth = this.expanded ? this.expandedWidth : this.compactWidth;
            this.viewHeight = this.expanded ? this.expandedHeight : this.compactHeight;
            this.anchor = this.expanded ? this.expandedAnchor : this.compactAnchor.copy();
            this.background.update({
                width: this.viewWidth - 2 * this.contentInset,
                height: this.viewHeight - 2 * this.contentInset,
                anchor: new Vertex(this.contentInset, this.contentInset)
            });
            this.view.style['clip-path'] = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
            // TODO: clip at rounded corners as well
            this.add(this.background);
            this.add(this.expandButton);
            this.linkMap.update({
                viewWidth: this.expandedWidth,
                viewHeight: this.expandedHeight
            });
            if (this.contracted) {
                this.contractStateChange();
            }
            else {
                this.expandStateChange();
            }
            this.hideLinksOfContent();
        }
        get expandedAnchor() {
            return new Vertex(this.expandedPadding, this.expandedPadding);
        }
        get expandedWidth() {
            return getPaper().viewWidth - 2 * this.expandedPadding;
        }
        get expandedHeight() {
            return getPaper().viewHeight - 2 * this.expandedPadding;
        }
        get contracted() {
            return !this.expanded;
        }
        set contracted(newValue) {
            this.expanded = !newValue;
        }
        expandStateChange() {
            this.expanded = true;
            this.getPaper().expandedMobject = this;
            this.enableContent();
            if (this.parent !== undefined) {
                this.parent.moveToTop(this);
            }
            this.expandButton.update({
                text: '–'
            });
            this.moveToTop(this.linkMap);
            this.sidebar = this.getPaper().sidebar;
            if (this.sidebar === null || this.sidebar === undefined) {
                let sidebarView = document.querySelector('#sidebar_id');
                if (sidebarView !== null) {
                    this.sidebar = sidebarView['mobject'];
                    this.getPaper().sidebar = this.sidebar;
                }
            }
        }
        expand() {
            this.expandStateChange();
            this.animate({
                viewWidth: this.expandedWidth - 2 * this.contentInset,
                viewHeight: this.expandedHeight - 2 * this.contentInset,
                anchor: this.expandedAnchor
            }, 0.5);
            this.messageSidebar({ 'init': convertArrayToString(this.buttons) });
        }
        contractStateChange() {
            this.expanded = false;
            this.disableContent();
            if (this.parent) {
                this.getPaper().expandedMobject = this.parent;
            }
            this.expandButton.update({
                text: '+'
            });
        }
        contract() {
            this.contractStateChange();
            this.animate({
                viewWidth: this.compactWidth - 2 * this.contentInset,
                viewHeight: this.compactHeight - 2 * this.contentInset,
                anchor: this.compactAnchor
            }, 0.5);
            if (this.parent instanceof ExpandableMobject) {
                this.messageSidebar({ 'init': convertArrayToString(this.parent.buttons) });
            }
            this.sidebar = null;
        }
        addToContent(mob) {
            this.add(mob);
            this.contentChildren.push(mob);
            if (this.contracted) {
                mob.disable();
            }
            if (this.expandButton.visible) {
                // exception: Paper
                this.moveToTop(this.expandButton);
            }
            if (mob instanceof LinkableMobject) {
                mob.hideLinks();
            }
            if (mob instanceof ExpandableMobject) {
                if (mob instanceof Construction) {
                    return;
                }
                mob.background.update({
                    fillColor: this.background.fillColor.brighten(1.1)
                });
            }
        }
        disableContent() {
            for (let mob of this.contentChildren) {
                mob.disable();
            }
        }
        enableContent() {
            for (let mob of this.contentChildren) {
                mob.enable();
            }
        }
        messageSidebar(message) {
            if (isTouchDevice) {
                window.webkit.messageHandlers.handleMessageFromPaper.postMessage(message);
            }
            else {
                if (this.sidebar !== null && this.sidebar !== undefined) {
                    this.sidebar.getMessage(message);
                }
            }
        }
        toggleViewState() {
            if (this.expanded) {
                this.contract();
            }
            else {
                this.expand();
            }
        }
        removeFromContent(mob) {
            remove(this.contentChildren, mob);
            this.remove(mob);
        }
        handleMessage(key, value) {
            switch (key) {
                case 'drag':
                    this.setPanning(value);
                    for (let mob of this.contentChildren) {
                        mob.setDragging(value);
                    }
                    break;
                case 'create':
                    this.creationMode = value;
                    if (this.creatingMobject == null) {
                        return;
                    }
                    this.remove(this.creatingMobject);
                    this.creatingMobject = this.createCreatingMobject(this.creationMode);
                    this.add(this.creatingMobject);
                    break;
                case 'link':
                    if (value) {
                        this.showLinksOfContent();
                    }
                    else {
                        this.hideLinksOfContent();
                    }
            }
        }
        createCreatingMobject(type) {
            switch (type) {
                case 'freehand':
                    let fh = new Freehand();
                    fh.line.update({
                        vertices: this.creationStroke
                    });
                    return fh;
                case 'cindy':
                    let c = new CreatingWaveCindyCanvas({
                        startPoint: this.creationStroke[0],
                        endPoint: this.creationStroke[this.creationStroke.length - 1]
                    });
                    return c;
                case 'slider':
                    let s = new CreatingBoxSlider({
                        startPoint: this.creationStroke[0],
                        endPoint: this.creationStroke[this.creationStroke.length - 1]
                    });
                    s.protoSlider.hideLinks();
                    return s;
                case 'exp':
                    let e = new CreatingExpandableMobject({
                        startPoint: this.creationStroke[0],
                        endPoint: this.creationStroke[this.creationStroke.length - 1]
                    });
                    return e;
                case 'cons':
                    let e2 = new CreatingConstruction({
                        startPoint: this.creationStroke[0],
                        endPoint: this.creationStroke[this.creationStroke.length - 1]
                    });
                    return e2;
                case 'pendulum':
                    let p = new CreatingPendulum({
                        startPoint: this.creationStroke[0],
                        endPoint: this.creationStroke[this.creationStroke.length - 1]
                    });
                    return p;
            }
        }
        onPointerDown(e) {
            if (this.contracted) {
                return;
            }
            this.startCreating(e);
        }
        onTap(e) { }
        customOnPointerDown(e) {
            log('customOnPointerDown');
        }
        startCreating(e) {
            this.creationStroke.push(this.localEventVertex(e));
            this.creatingMobject = this.createCreatingMobject(this.creationMode);
            this.add(this.creatingMobject);
        }
        onPointerMove(e) {
            if (this.contracted) {
                return;
            }
            if (this.creationStroke.length == 0) {
                return;
            }
            this.creating(e);
        }
        creating(e) {
            let v = this.localEventVertex(e);
            this.creationStroke.push(v);
            this.creatingMobject.updateFromTip(v);
        }
        customOnPointerMove(e) {
        }
        onPointerUp(e) {
            if (this.contracted) {
                return;
            }
            this.endCreating(e);
        }
        endCreating(e) {
            this.creatingMobject.dissolve();
            this.creatingMobject = null;
            this.creationStroke = [];
        }
        customOnPointerUp(e) {
            log('customOnPointerUp');
        }
        startPanning(e) {
            this.panPointStart = eventVertex(e);
            for (let mob of this.contentChildren) {
                mob.dragAnchorStart = mob.anchor.copy();
            }
        }
        panning(e) {
            let panPoint = eventVertex(e);
            let dr = panPoint.subtract(this.panPointStart);
            for (let mob of this.contentChildren) {
                let newAnchor = mob.dragAnchorStart.add(dr);
                mob.update({ anchor: newAnchor });
                mob.view.style.left = `${newAnchor.x}px`;
                mob.view.style.top = `${newAnchor.y}px`;
            }
            this.linkMap.update();
        }
        endPanning(e) {
        }
        setPanning(flag) {
            if (flag) {
                this.savedOnPointerDown = this.onPointerDown;
                this.savedOnPointerMove = this.onPointerMove;
                this.savedOnPointerUp = this.onPointerUp;
                this.onPointerDown = this.startPanning;
                this.onPointerMove = this.panning;
                this.onPointerUp = this.endPanning;
            }
            else {
                this.onPointerDown = this.savedOnPointerDown;
                this.onPointerMove = this.savedOnPointerMove;
                this.onPointerUp = this.savedOnPointerUp;
                this.savedOnPointerDown = (e) => { };
                this.savedOnPointerMove = (e) => { };
                this.savedOnPointerUp = (e) => { };
            }
        }
        updateModel(argsDict = {}) {
            super.updateModel(argsDict);
            this.background.updateModel({
                width: this.viewWidth,
                height: this.viewHeight,
                viewWidth: this.viewWidth,
                viewHeight: this.viewHeight
            });
        }
        linkableChildren() {
            let arr = [];
            for (let submob of this.contentChildren) {
                if (submob instanceof LinkableMobject) {
                    arr.push(submob);
                }
            }
            return arr;
        }
        showLinksOfContent() {
            this.add(this.linkMap);
            for (let submob of this.linkableChildren()) {
                submob.showLinks();
            }
        }
        hideLinksOfContent() {
            this.remove(this.linkMap);
            for (let submob of this.linkableChildren()) {
                submob.hideLinks();
            }
        }
        inerInputHookLocation(submob, name) {
            let hookLocation = submob.inputList.hookNamed(name).positionInLinkMap();
            return hookLocation;
        }
        innerInputHooks() {
            let arr = [];
            for (let submob of this.linkableChildren()) {
                for (let inputName of submob.inputNames) {
                    arr.push(submob.inputList.hookNamed(inputName));
                }
            }
            return arr;
        }
        innerOutputHookLocation(submob, name) {
            let hookLocation = submob.outputList.hookNamed(name).positionInLinkMap();
            return hookLocation;
        }
        innerOutputHooks() {
            let arr = [];
            for (let submob of this.linkableChildren()) {
                for (let outputName of submob.outputNames) {
                    arr.push(submob.outputList.hookNamed(outputName));
                }
            }
            return arr;
        }
    }
    class Construction extends ExpandableMobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                points: [],
                freePoints: [],
                constructedMobjects: []
            });
        }
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                buttons: ['DragButton', 'ArrowButton', 'CircleButton']
            });
        }
        statefulSetup() {
            super.statefulSetup();
            this.view.style.overflow = 'hidden';
            this.background.update({
                fillColor: Color.black()
            });
        }
        integrate(mob) {
            this.remove(mob);
            let p1 = this.pointForVertex(mob.startPoint);
            let p2 = this.pointForVertex(mob.endPoint);
            this.addToContent(p1);
            this.addToContent(p2);
            let cm;
            if (mob instanceof ConstructingSegment) {
                cm = mob.segment;
                p1.addDependency('midpoint', cm, 'startPoint');
                p2.addDependency('midpoint', cm, 'endPoint');
            }
            else if (mob instanceof ConstructingRay) {
                cm = mob.ray;
                p1.addDependency('midpoint', cm, 'startPoint');
                p2.addDependency('midpoint', cm, 'endPoint');
            }
            else if (mob instanceof ConstructingLine) {
                cm = mob.line;
                p1.addDependency('midpoint', cm, 'startPoint');
                p2.addDependency('midpoint', cm, 'endPoint');
            }
            else if (mob instanceof ConstructingCircle) {
                cm = mob.circle;
                p1.addDependency('midpoint', cm, 'midpoint');
                p2.addDependency('midpoint', cm, 'outerPoint');
            }
            this.add(cm);
            this.intersectWithRest(cm);
            this.constructedMobjects.push(cm);
            p1.update({ strokeColor: mob.penStrokeColor, fillColor: mob.penFillColor });
            p2.update({ strokeColor: mob.penStrokeColor, fillColor: mob.penFillColor });
        }
        pointForVertex(v) {
            for (let p of this.points) {
                if (p.midpoint.equals(v)) {
                    return p;
                }
            }
            let p = new FreePoint({ midpoint: v });
            this.addPoint(p);
            return p;
        }
        addPoint(p) {
            for (let q of this.points) {
                if (p.midpoint.equals(q.midpoint)) {
                    return false;
                }
            }
            this.add(p);
            this.points.push(p);
            return true;
        }
        intersectWithRest(geomob1) {
            for (let geomob2 of this.constructedMobjects) {
                if (geomob1 == geomob2) {
                    continue;
                }
                let nbPoints = (geomob1 instanceof Arrow && geomob2 instanceof Arrow) ? 1 : 2;
                for (let i = 0; i < nbPoints; i++) {
                    let p = new IntersectionPoint({
                        geomob1: geomob1,
                        geomob2: geomob2,
                        index: i
                    });
                    let isNewPoint = this.addPoint(p);
                    if (isNewPoint) {
                        geomob1.addDependent(p);
                        geomob2.addDependent(p);
                    }
                }
            }
        }
        createCreatingMobject(type) {
            switch (type) {
                case 'segment':
                    let sg = new ConstructingSegment({
                        startPoint: this.creationStroke[0],
                        endPoint: this.creationStroke[this.creationStroke.length - 1]
                    });
                    return sg;
                case 'ray':
                    let ray = new ConstructingRay({
                        startPoint: this.creationStroke[0],
                        endPoint: this.creationStroke[this.creationStroke.length - 1]
                    });
                    return ray;
                case 'line':
                    let line = new ConstructingLine({
                        startPoint: this.creationStroke[0],
                        endPoint: this.creationStroke[this.creationStroke.length - 1]
                    });
                    return line;
                case 'circle':
                    let c = new ConstructingCircle({
                        startPoint: this.creationStroke[0],
                        endPoint: this.creationStroke[this.creationStroke.length - 1]
                    });
                    return c;
            }
            return super.createCreatingMobject(type);
        }
        creating(e) {
            if (this.creationMode == 'freehand') {
                super.creating(e);
                return;
            }
            let p = this.localEventVertex(e);
            for (let fq of this.points) {
                let q = fq.midpoint;
                if (p.subtract(q).norm() < 10) {
                    p = q;
                    break;
                }
            }
            this.creatingMobject.updateFromTip(p);
        }
        addToContent(mob) {
            super.addToContent(mob);
            if (mob instanceof Point) {
                this.points.push(mob);
                if (mob instanceof FreePoint) {
                    this.freePoints.push(mob);
                }
            }
        }
    }

    class Paper extends ExpandableMobject {
        defaultArgs() {
            return Object.assign(super.defaultArgs(), {
                children: [],
                screenEventHandler: ScreenEventHandler.Self,
                expandedMobject: this,
                pressedKeys: []
            });
        }
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                expanded: true,
                expandedPadding: 0,
                buttons: ['DragButton', 'LinkButton', 'ExpandableButton', 'SliderButton', 'CindyButton', 'PendulumButton']
            });
        }
        statelessSetup() {
            super.statelessSetup();
            this.currentColor = COLOR_PALETTE['white'];
        }
        statefulSetup() {
            super.statefulSetup();
            this.boundButtonUpByKey = this.buttonUpByKey.bind(this);
            this.boundButtonDownByKey = this.buttonDownByKey.bind(this);
            document.addEventListener('keydown', this.boundButtonDownByKey);
            document.addEventListener('keyup', this.boundButtonUpByKey);
            this.expandButton.hide();
            this.background.update({
                cornerRadius: 0,
                strokeColor: Color.clear(),
                strokeWidth: 0.0
            });
        }
        changeColorByName(newColorName) {
            let newColor = COLOR_PALETTE[newColorName];
            this.changeColor(newColor);
        }
        changeColor(newColor) {
            this.currentColor = newColor;
        }
        getMessage(message) {
            let key = Object.keys(message)[0];
            let value = Object.values(message)[0];
            if (value == "true") {
                value = true;
            }
            if (value == "false") {
                value = false;
            }
            if (typeof value == "string") {
                if (value[0] == "(") {
                    value = convertStringToArray(value);
                }
            }
            if ((key == "link" || key == "drag") && typeof value === "string") {
                value = (value === "1");
            }
            this.expandedMobject.handleMessage(key, value);
        }
        boundButtonDownByKey(e) { }
        boundButtonUpByKey(e) { }
        buttonDownByKey(e) {
            e.preventDefault();
            e.stopPropagation();
            if (this.pressedKeys.includes(e.key)) {
                return;
            }
            let alphanumericKeys = "1234567890qwertzuiopasdfghjklyxcvbnm".split("");
            let specialKeys = [" ", "Alt", "Backspace", "CapsLock", "Control", "Dead", "Escape", "Meta", "Shift", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
            let availableKeys = alphanumericKeys.concat(specialKeys);
            if (!availableKeys.includes(e.key)) {
                return;
            }
            this.pressedKeys.push(e.key);
            if (e.key == 'Shift') {
                window.emulatePen = true;
            }
            else {
                this.messageSidebar({ 'buttonDown': e.key });
            }
        }
        buttonUpByKey(e) {
            e.preventDefault();
            e.stopPropagation();
            remove(this.pressedKeys, e.key);
            if (e.key == 'Shift') {
                window.emulatePen = false;
            }
            else {
                this.messageSidebar({ 'buttonUp': e.key });
            }
        }
        get expandedAnchor() {
            return isTouchDevice ? Vertex.origin() : new Vertex(150, 0);
        }
        expand() { }
        contract() { }
    }
    let paperDiv = document.querySelector('#paper_id');
    const paper = new Paper({
        view: paperDiv,
        viewWidth: 1250,
        viewHeight: 1024,
    });

    exports.Paper = Paper;
    exports.paper = paper;

    return exports;

})({});
