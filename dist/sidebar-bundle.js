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
            let listOfVertices = new VertexArray();
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
        /*
        General rule: the event is handled by the lowest submob that can handle it
        and that is not underneath a mobject that wants its parent to handle it.
        If the event policies end in a loop, no one handles it
        */
    })(ScreenEventHandler || (ScreenEventHandler = {}));
    function eventVertex(e) {
        /*
        subtract the sidebar's width if necessary
        i. e. if running in the browser (minter.html)
        instead of in the app (paper.html)
        */
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
    /*
    The following functions handle adding and removing event listeners,
    including the confusion between touch, mouse and pointer events.
    */
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

    /*
    For debugging; draw the border of the mobject's view
    (a HTMLDivelement) via a CSS property
    */
    const DRAW_BORDER = false;
    class Mobject extends ExtendedObject {
        /*
        A mobject (math object) has a view with an underlying state
        and logic for drawing and user interaction.
         */
        //////////////////////////////////////////////////////////
        //                                                      //
        //                    INITIALIZATION                    //
        //                                                      //
        //////////////////////////////////////////////////////////
        /*
        Subclasses dot NOT get their own explicit constructor.
        This is to cleanly separate the stateless and stateful
        setup processes (explained below).
        
        Subclasses may also have a quite different setup
        than their superclass, and would otherwise have to undo
        a lot of the superclass's constructor setup.
        (E. g. a Circle's anchor should not be set, instead
        its midpoint should. A Circle's anchor acts like
        a computed property.)
        
        It also allows to control the setting of fixed and default
        state variables.

        A mobject is created in four steps:

        STEP 1: [in this.statelessSetup()] //
        
           Create all objects that any properties (state-defining variables)
           may rely on (e. g. the view = HTMLDivElement).
        
        STEP 2: [in this.setAttributes(...)] //
        
           Set all state variables.
        
        STEP 3: [in this.statefulSetup()] //
        
           Complete the setup applying the properties
           onto the objects created in step 1
           (e. g. setting the view's width and height).
           This step should only contain commands that
           need to be run only once at the mobject's
           creation.
        
        STEP 4: [in this.update(...)] //
        
           All the ways the properties influence
           the mobject whenever they change.
        */
        constructor(argsDict = {}, isSuperCall = false) {
            /*
            A mobject is initialized by providing a dictionary (object)
            of parameters (argsDict).
            */
            // First call all superclass constructors with no parameters at all
            super({}, true);
            if (isSuperCall) {
                return;
            }
            // Now we are back in the lowest-class constructor
            // STEP 1
            this.statelessSetup();
            // STEP 2
            let initialArgs = this.initialArgs(argsDict);
            this.setAttributes(initialArgs);
            // STEP 3
            this.statefulSetup();
            // STEP 4
            this.update(argsDict);
        }
        initialArgs(argsDict = {}) {
            /*
            Adjust the constructor's arguments in light
            of default and fixed values.
            */
            // Given values supercede default values
            let initialArgs = this.defaultArgs();
            Object.assign(initialArgs, argsDict);
            // Fixed values supercede given values
            Object.assign(initialArgs, this.fixedArgs());
            return initialArgs;
        }
        defaultArgs() {
            /*
            Default values of properties (declared
            in the sections that follow).
            This list is complemented in subclasses
            by overriding the method like this:
        
                defaultArgs(): object {
                    return Object.assign(super.defaultArgs(), {
                        ...
                    })
                }
            */
            return {
                // The meaning of these properties is explained in the sections further below.
                // position
                transform: Transform.identity(),
                viewWidth: 100,
                viewHeight: 100,
                /*
                Note: anchor is a property of transform
                and exposed to the mobject itself
                with a getter/setter.
                */
                // view
                view: document.createElement('div'),
                visible: true,
                opacity: 1.0,
                backgroundColor: Color.clear(),
                drawBorder: DRAW_BORDER,
                // hierarchy
                children: [], // i. e. submobjects
                // dependencies
                dependencies: [],
                // interactivity
                screenEventHandler: ScreenEventHandler.Parent,
                savedScreenEventHandler: null,
                eventTarget: null,
                screenEventHistory: []
            };
        }
        fixedArgs() {
            // These are property values that cannot be changed,
            // either by arguments given to the constructor
            // or in a subclass.
            // For declaring fixed properties in a Mobject
            // subclass, override this method as described
            // further up in defaultArgs().
            return {};
        }
        removeFixedArgs(argsDict = {}) {
            let newArgsDict = {};
            let fixedKeys = Object.keys(this.fixedArgs());
            for (let key of Object.keys(argsDict)) {
                if (fixedKeys.includes(key)) {
                    console.warn(`Cannot change property ${key} of ${this.constructor.name}`);
                    continue;
                }
                newArgsDict[key] = argsDict[key];
            }
            return newArgsDict;
        }
        statelessSetup() {
            // state-independent setup (step 1)
            // These methods for event handling need to be "bound"
            // to the mobject (whatever that means)
            this.boundEventTargetMobject = this.eventTargetMobject.bind(this);
            this.boundOnPointerDown = this.onPointerDown.bind(this);
            this.boundOnPointerMove = this.onPointerMove.bind(this);
            this.boundOnPointerUp = this.onPointerUp.bind(this);
            this.boundOnTap = this.onTap.bind(this);
            this.boundOnDoubleTap = this.onDoubleTap.bind(this);
            this.boundOnLongPress = this.onLongPress.bind(this);
            /*
            When holding down the drag button,
            the onPointer methods are redirected to
            the corresponding methods that make the
            mobject self-drag.
            After the drag button is let go, these
            methods are redirected to their previous
            code.
            */
            this.savedOnPointerDown = this.onPointerDown;
            this.savedOnPointerMove = this.onPointerMove;
            this.savedOnPointerUp = this.onPointerUp;
        }
        statefulSetup() {
            // state-dependent setup (step 3)
            this.setupView();
            addPointerDown(this.view, this.capturedOnPointerDown.bind(this));
            addPointerMove(this.view, this.capturedOnPointerMove.bind(this));
            addPointerUp(this.view, this.capturedOnPointerUp.bind(this));
        }
        // (Note: the view itself is declared further below)
        // this.anchor is a synonym for this.transform.anchor
        get anchor() {
            return this.transform.anchor;
        }
        set anchor(newValue) {
            if (!this.transform) {
                this.transform = Transform.identity();
            }
            this.transform.anchor = newValue;
        }
        relativeTransform(frame) {
            /*
            What transform maps (actively) from the given
            ancestor mobject ('frame') to this descendant mobject?
            If the transforms in between are all just anchor
            translations, this gives this mobject's anchor
            in the coordinate frame of the given mobject.
            */
            // If there is no frame, use the direct parent's coordinate frame.
            // If there is no parent yet, use your own (local) coordinates.
            let frame_ = frame || this.parent || this;
            let t = Transform.identity();
            let mob = this;
            while (mob && mob.transform instanceof Transform) {
                if (mob == frame_) {
                    return t;
                }
                t.leftComposeWith(new Transform({ shift: mob.anchor }));
                t.leftComposeWith(mob.transform);
                mob = mob.parent;
            }
            throw 'relativeTransform requires a direct ancestor';
        }
        transformLocalPoint(point, frame) {
            /*
            Given a point (Vertex) in local coordinates,
            compute its coordinates in the given ancestor
            mobject's frame.
            */
            let t = this.relativeTransform(frame);
            return t.appliedTo(point);
        }
        /*
        The following geometric properties are first computed from the view frame.
        The versions without 'view' in the name can be overriden by subclasses,
        e. g. VMobjects.
        */
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
        /*
        Equivalent (by default) versions without "view" in the name
        These can be overriden in subclasses, e. g. in VMobject using
        its vertices.
        */
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
        get visible() {
            return this.view.style['visibility'] == 'visible';
        }
        set visible(newValue) {
            this.view.style['visibility'] = newValue ? 'visible' : 'hidden';
        }
        setupView() {
            this.view['mobject'] = this;
            if (this.parent) {
                this.parent.view.appendChild(this.view);
            }
            this.view.setAttribute('class', 'mobject-div ' + this.constructor.name);
            this.view.style.transformOrigin = 'top left';
            this.view.style.position = 'absolute';
            // 'absolute' positions this mobject relative (sic) to its parent
            this.view.style.overflow = 'visible';
            // by default, the mobject can draw outside its view's borders
        }
        positionView() {
            if (!this.view) {
                return;
            }
            this.view.style['transform'] = this.transform.withoutAnchor().toCSSString();
            this.view.style['left'] = `${this.anchor.x.toString()}px`;
            this.view.style['top'] = `${this.anchor.y.toString()}px`;
            this.view.style['width'] = `${this.viewWidth.toString()}px`;
            this.view.style['height'] = `${this.viewHeight.toString()}px`;
        }
        styleView() {
            if (!this.view) {
                return;
            }
            this.view.style.border = this.drawBorder ? '1px dashed green' : 'none';
            this.view.style['background-color'] = this.backgroundColor.toCSS();
            this.view.style['opacity'] = this.opacity.toString();
        }
        // Drawing methods //
        redrawSelf() { }
        /*
        Redraw just yourself, not your children (submobs),
        overridden in subclasses
        */
        redrawSubmobs() {
            for (let submob of this.children || []) {
                submob.redraw();
            }
        }
        redraw(recursive = true) {
            // redraw yourself and your children
            try {
                if (!this.view) {
                    return;
                }
                this.positionView();
                this.styleView();
                this.redrawSelf();
                if (recursive) {
                    this.redrawSubmobs();
                }
            }
            catch {
                console.warn(`Unsuccessfully tried to draw ${this.constructor.name} (too soon?)`);
            }
        }
        // Show and hide //
        show() {
            // Show this mobject and all of its descendents
            try {
                if (!this.view) {
                    return;
                }
                this.visible = true;
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
            // Hide this mobject and all of its descendents
            try {
                if (!this.view) {
                    return;
                }
                this.visible = false;
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
            // Show this mobject and all mobjects that depend on it
            this.show();
            for (let depmob of this.allDependents()) {
                depmob.show();
            }
        }
        recursiveHide() {
            // Hide this mobject and all mobjects that depend on it
            this.hide();
            for (let depmob of this.allDependents()) {
                depmob.hide();
            }
        }
        animate(argsDict = {}, seconds) {
            // Calling this method launches an animation
            // Create mobject copies
            this.interpolationStartCopy = deepCopy(this);
            this.interpolationStartCopy.clearScreenEventHistory();
            this.interpolationStopCopy = deepCopy(this.interpolationStartCopy);
            this.interpolationStopCopy.update(argsDict, false);
            // all times in ms bc that is what setInterval and setTimeout expect
            let dt = 10;
            this.animationTimeStart = Date.now();
            this.animationDuration = seconds * 1000;
            this.animationInterval = window.setInterval(function () {
                this.updateAnimation(Object.keys(argsDict));
            }
                .bind(this), dt);
            // this.animationInterval is a reference number
            // that we need to remember to stop the animation
            window.setTimeout(this.cleanupAfterAnimation
                .bind(this), this.animationDuration);
        }
        updateAnimation(keys) {
            // This method gets called at regular intervals during the animation
            let weight = (Date.now() - this.animationTimeStart) / this.animationDuration;
            let newArgsDict = this.interpolatedAnimationArgs(keys, weight);
            this.update(newArgsDict);
        }
        interpolatedAnimationArgs(keys, weight) {
            /*
            Compute a convex combination between the start and stop values
            of each key. The custom types (all except number) all have
            their own interpolation method.
            */
            let returnValues = {};
            for (let key of keys) {
                let startValue = this.interpolationStartCopy[key];
                let stopValue = this.interpolationStopCopy[key];
                if (typeof startValue == 'number') {
                    returnValues[key] = (1 - weight) * startValue + weight * stopValue;
                }
                else if (startValue instanceof Vertex) {
                    returnValues[key] = startValue.interpolate(stopValue, weight);
                }
                else if (startValue instanceof Transform) {
                    returnValues[key] = startValue.interpolate(stopValue, weight);
                }
                else if (startValue instanceof Color) {
                    returnValues[key] = startValue.interpolate(stopValue, weight);
                }
                else if (startValue instanceof VertexArray) {
                    returnValues[key] = startValue.interpolate(stopValue, weight);
                }
            }
            return returnValues;
        }
        cleanupAfterAnimation() {
            // This method gets called at the end of the animation
            window.clearInterval(this.animationInterval);
            this.animationInterval = null;
            this.interpolationStartCopy = null;
            this.interpolationStopCopy = null;
        }
        /*
        Actually we want to hide behind setting this.parent
        some more housekeeping code bc parent and child
        reference each other, and probably the views need
        to be updated.
        */
        get parent() { return this._parent; }
        set parent(newValue) {
            try {
                // there might already be a parent
                this.parent.remove(this);
            }
            catch { }
            this._parent = newValue;
            if (newValue === undefined || newValue == null) {
                return;
            }
            newValue.add(this);
            if (newValue.visible) {
                this.show();
            }
            else {
                this.hide();
            }
        }
        // Alias for parent
        get superMobject() { return this.parent; }
        set superMobject(newValue) { this.parent = newValue; }
        // Aliases for children
        get submobjects() { return this.children; }
        set submobjects(newValue) {
            this.children = newValue;
        }
        get submobs() { return this.submobjects; }
        set submobs(newValue) {
            this.submobs = newValue;
        }
        add(submob) {
            // Set this as the submob's parent
            if (submob.parent != this) {
                submob.parent = this;
            }
            // Add submob to the children
            if (this.children === undefined || this.children === null) {
                throw `Please add submob ${submob.constructor.name} to ${this.constructor.name} later, in statefulSetup()`;
            }
            else if (!this.children.includes(submob)) {
                this.children.push(submob);
            }
            // Add its view to this view and redraw
            this.view.append(submob.view);
            submob.redraw();
        }
        remove(submob) {
            // Remove from the array of children
            // (with an imported helper method)
            remove(this.children, submob);
            submob.parent = null;
            submob.view.remove();
        }
        moveToTop(submob) {
            /*
            Put this submob in front of every other sibling,
            so that it will obstruct them and catch screen events
            */
            if (submob.parent != this) {
                console.warn(`moveToTop: ${submob} is not yet a submob of ${this}`);
                return;
            }
            this.remove(submob);
            this.add(submob);
        }
        dependents() {
            // All mobjects that depend directly on this
            let dep = [];
            for (let d of this.dependencies) {
                dep.push(d.target);
            }
            return dep;
        }
        allDependents() {
            // All mobjects that depend either directly or indirectly on this
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
            /*
            No properties given. Simply if this mobject updates,
            update the target mobject as well.
            */
            this.addDependency(null, target, null);
        }
        // Update methods //
        updateModel(argsDict = {}) {
            // Update just the properties and what depends on them, without redrawing
            argsDict = this.consolidateTransformAndAnchor(argsDict); // see below
            argsDict = this.removeFixedArgs(argsDict);
            this.setAttributes(argsDict);
            this.updateSubmobModels();
            for (let dep of this.dependencies || []) {
                let outputName = this[dep.outputName]; // may be undefined
                if (typeof outputName === 'function') {
                    dep.target[dep.inputName] = outputName.bind(this)();
                }
                else if (outputName !== undefined && outputName !== null) {
                    dep.target[dep.inputName] = outputName;
                }
                dep.target.updateModel();
            }
        }
        updateSubmobModels() {
            for (let submob of this.children || []) {
                if (!this.dependsOn(submob)) { // prevent dependency loops
                    submob.updateModel();
                }
            }
        }
        update(argsDict = {}, redraw = true) {
            // Update with or without redrawing
            this.updateModel(argsDict);
            if (redraw) {
                this.redraw();
            }
            for (let depmob of this.dependents()) {
                depmob.update({}, redraw);
            }
        }
        updateFrom(mob, attrs, redraw = true) {
            let updateDict = {};
            for (let attr of attrs) {
                updateDict[attr] = mob[attr];
            }
            this.update(updateDict, redraw);
        }
        consolidateTransformAndAnchor(argsDict = {}) {
            /*
            argsDict may contain updated values for the anchor, the transform, or both.
            Since this.anchor == this.transform.anchor, this may be contradictory
            information. This method fixes argsDict.
            */
            let newAnchor = argsDict['anchor'];
            var newTransform = argsDict['transform'];
            if (newTransform) {
                let nt = newTransform;
                if (nt.anchor.isZero()) {
                    /*
                    If the new transform has no anchor,
                    set it to the new anchor if given one.
                    Otherwise set it to your own anchor (i. e. it won't change).
                    */
                    nt.anchor = newAnchor ?? this.anchor;
                }
            }
            else {
                /*
                If there is no new transform value, still create
                a copy of the existing one and put the new anchor
                in there (if given, otherwise the old anchor).
                */
                newTransform = this.transform;
                newTransform.anchor = argsDict['anchor'] ?? this.anchor;
            }
            delete argsDict['anchor'];
            argsDict['transform'] = newTransform;
            return argsDict;
        }
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
        /*
        The following empty methods need to be declared here
        so we can manipulate and override them later.
        */
        onPointerDown(e) { }
        boundOnPointerDown(e) { }
        savedOnPointerDown(e) { }
        onPointerMove(e) { }
        boundOnPointerMove(e) { }
        savedOnPointerMove(e) { }
        onPointerUp(e) { }
        boundOnPointerUp(e) { }
        savedOnPointerUp(e) { }
        onTap(e) { }
        boundOnTap(e) { }
        savedOnTap(e) { }
        onDoubleTap(e) { }
        boundOnDoubleTap(e) { }
        savedOnDoubleTap(e) { }
        onLongPress(e) { }
        boundOnLongPress(e) { }
        savedOnLongPress(e) { }
        boundEventTargetMobject(e) { return this; }
        // Methods for temporarily disabling interactivity on a mobject
        // (e. g. when dragging a CindyCanvas)
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
        /*
        Finding the event target

        Depending on the screenEventHandler:

        - .Below: mobject is transparent (via CSS), the sibling mobject
                  underneath or the parent should handle the event
                  Example: TwoPointCircle in a Construction
        - .Auto:  don't interfere with event propagation at all
                  Example: CindyCanvas

        Otherwise the event is captured by the topmost view (paper or sidebar),
        the automatic propagation is stopped and the event is passed onto the
        eventTarget as determined by the declared screenEventHandlers in the
        chain of possible event targets.
        The event target is the lowest mobject willing to handle it and that
        is not underneath a mobject that wants its parent to handle it.

        - .Parent: the parent should handle it
        - .Self:   handle it if no child wants to handle it and if no parent wants
                   its parent to handle it
        */
        eventTargetMobject(e) {
            /*
            Find the lowest Mobject willing and allowed to handle the event
            General rule: the event is handled by the lowest submob that can handle it
            and that is not underneath a mobject that wants its parent to handle it.
            If the event policies end in a loop, no one handles it.
            */
            var t = e.target;
            if (t == this.view) {
                return this;
            }
            let targetMobChain = this.eventTargetMobjectChain(e); // defined below
            var m;
            while (targetMobChain.length > 0) {
                m = targetMobChain.pop();
                if (m != undefined && (m.screenEventHandler == ScreenEventHandler.Self || m.screenEventHandler == ScreenEventHandler.Auto)) {
                    return m;
                }
            }
            // if all of this fails, this mob must handle the event itself
            return this;
        }
        eventTargetMobjectChain(e) {
            // Collect the chain of corresponding target mobjects (lowest to highest)
            let targetViewChain = this.eventTargetViewChain(e); // defined below
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
                // only consider targets above the first mobject
                // with ScreenEventHandler.Parent
                targetMobChain.push(mob);
            }
            return targetMobChain;
        }
        eventTargetViewChain(e) {
            // Collect the chain of target views (highest to lowest)
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
            return targetViewChain;
        }
        /*
        Captured event methods

        Instead of calling the event methods exposed in the API (onPointerDown etc.),
        the event listeners call these methods that do some housekeeping
        before and after:

        Step 1: determine the event target (only in capturedOnPointerDown)
        Step 2: stop the propagation ( or not if ScreenEventHandler.Auto)
        Step 3: check if the event is just a duplicate of the last event
        Step 4: call the API event method
        Step 5: set/unset timers to listen for e. g. taps, double taps, long presses etc.
        */
        capturedOnPointerDown(e) {
            // step 1
            this.eventTarget = this.eventTargetMobject.bind(this)(e); // this.boundEventTargetMobject(e)
            let target = this.eventTarget;
            if (target == null) {
                return;
            }
            // step 2
            if (target.screenEventHandler == ScreenEventHandler.Auto) {
                return;
            }
            e.stopPropagation();
            // step 3
            target.registerScreenEvent(e);
            if (this.isDuplicate(e)) {
                return;
            }
            // step 4
            target.onPointerDown(e);
            // step 5
            target.timeoutID = window.setTimeout(function () {
                target.onLongPress(e);
                this.resetTimeout();
            }.bind(this), 1000, e);
        }
        capturedOnPointerMove(e) {
            // step 1
            let target = this.eventTarget;
            if (target == null) {
                return;
            }
            // step 2
            if (target.screenEventHandler == ScreenEventHandler.Auto) {
                return;
            }
            e.stopPropagation();
            // step 3
            target.registerScreenEvent(e);
            if (this.isDuplicate(e)) {
                return;
            }
            // step 4
            target.onPointerMove(e);
            // step 5
            target.resetTimeout();
        }
        capturedOnPointerUp(e) {
            // step 1
            let target = this.eventTarget;
            if (target == null) {
                return;
            }
            // step 2
            if (target.screenEventHandler == ScreenEventHandler.Auto) {
                return;
            }
            e.stopPropagation();
            // step 3
            target.registerScreenEvent(e);
            if (this.isDuplicate(e)) {
                return;
            }
            // step 4
            target.onPointerUp(e);
            if (target.tapDetected()) {
                target.onTap(e);
            }
            if (target.doubleTapDetected()) {
                target.onDoubleTap(e);
            }
            // step 5
            target.resetTimeout();
            window.setTimeout(this.clearScreenEventHistory, 2000);
            this.eventTarget = null;
        }
        // Local coordinates for use in custom event methods
        localEventVertex(e) {
            /*
            eventVertex(e) gives the coordinates in the topmost
            mobject's frame (paper or sidebar). This method here
            finds them in the mobject's local frame.
            */
            let p = eventVertex(e);
            let rt = this.relativeTransform(getPaper());
            let q = rt.inverse().appliedTo(p);
            return q;
        }
        // Looking for duplicates
        registerScreenEvent(e) {
            if (this.isDuplicate(e)) {
                return;
            }
            this.screenEventHistory.push(e);
        }
        isDuplicate(e) {
            /*
            Duplicates can occur on an iPad, where the same action
            triggers a TouchEvent and a MouseEvent. Here we are just looking at
            the screenEvent's type (down, move, up or cancel) and ignore
            the device to determine duplicates.
            */
            if (!isTouchDevice) {
                return false;
            } // no iPad = no problem
            let minIndex = Math.max(0, this.screenEventHistory.length - 5);
            for (var i = minIndex; i < this.screenEventHistory.length; i++) {
                let e2 = this.screenEventHistory[i];
                if (eventVertex(e).closeTo(eventVertex(e2), 2)) {
                    if (screenEventType(e) == screenEventType(e2)) {
                        return true;
                    }
                }
            }
            return false;
        }
        // Gesture recognizers
        isTap(e1, e2, dt = 500) {
            // Do these two events together form a tap gesture?
            return (screenEventType(e1) == ScreenEventType.Down
                && screenEventType(e2) == ScreenEventType.Up
                && Math.abs(e2.timeStamp - e1.timeStamp) < 500);
        }
        tapDetected() {
            // Have we just witnessed a tap?
            if (this.screenEventHistory.length < 2) {
                return false;
            }
            let e1 = this.screenEventHistory[this.screenEventHistory.length - 2];
            let e2 = this.screenEventHistory[this.screenEventHistory.length - 1];
            return this.isTap(e1, e2);
        }
        isDoubleTap(e1, e2, e3, e4, dt = 1000) {
            // Do these fours events together form a double tap gesture?
            return this.isTap(e1, e2) && this.isTap(e3, e4) && this.isTap(e1, e4, dt);
        }
        doubleTapDetected() {
            // Have we just witnessed a double tap?
            if (this.screenEventHistory.length < 4) {
                return false;
            }
            let e1 = this.screenEventHistory[this.screenEventHistory.length - 4];
            let e2 = this.screenEventHistory[this.screenEventHistory.length - 3];
            let e3 = this.screenEventHistory[this.screenEventHistory.length - 2];
            let e4 = this.screenEventHistory[this.screenEventHistory.length - 1];
            return this.isDoubleTap(e1, e2, e3, e4);
        }
        mereTapDetected() {
            return this.tapDetected() && !this.doubleTapDetected();
        }
        // Cleanup methods
        clearScreenEventHistory() {
            this.screenEventHistory = [];
        }
        resetTimeout() {
            if (this.timeoutID) {
                clearTimeout(this.timeoutID);
                this.timeoutID = null;
            }
        }
        // Dragging methods
        /*
        Mobjects drag themselves, not via their parent.
        This is possible since the event target is fixed by hand
        as long as the gesture occurs, even if individual events
        (pointer moves) may trigger outside it because of lag.
        */
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
        draggingEnabled() {
            return (this.onPointerDown == this.startDragging);
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
            // setup the svg
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg['mobject'] = this;
            this.svg.setAttribute('class', 'mobject-svg');
            this.svg.style.overflow = 'visible';
            // and its path
            this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.path['mobject'] = this;
            this.svg.appendChild(this.path);
        }
        statefulSetup() {
            this.setupView();
            this.view.appendChild(this.svg);
            this.view.setAttribute('class', this.constructor.name + ' mobject-div');
            // screen events are detected on the path
            // so the active area is clipped to its shape
            addPointerDown(this.path, this.capturedOnPointerDown.bind(this));
            addPointerMove(this.path, this.capturedOnPointerMove.bind(this));
            addPointerUp(this.path, this.capturedOnPointerUp.bind(this));
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
            // This method turns this.vertices into a CSS path
            console.warn('please subclass pathString');
            return '';
        }
        relativeVertices(frame) {
            // the vertices are in local coordinates, convert them to the given frame of an ancestor mobject
            let returnValue = this.relativeTransform(frame).appliedToVertices(this.vertices);
            if (returnValue == undefined) {
                return new VertexArray();
            }
            else {
                return returnValue;
            }
        }
        globalVertices() {
            // uses default frame = paper
            return this.relativeVertices();
        }
        //////////////////////////////////////////////////////////
        //                                                      //
        //                     FRAME METHODS                    //
        //                                                      //
        //////////////////////////////////////////////////////////
        /*
        The coordinate extrema (x_min, x_max, y_min, y_max) are computed from the vertices
        instead of the view frame as for a general Mobject.
        Other coordinate quantities (x_mid, y_mid, ulCorner etc.) are computes from these
        four values.
        */
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
        localMidX() { return (this.localXMin() + this.localXMax()) / 2; }
        localMidY() { return (this.localYMin() + this.localYMax()) / 2; }
        localULCorner() { return new Vertex(this.localXMin(), this.localYMin()); }
        localURCorner() { return new Vertex(this.localXMax(), this.localYMin()); }
        localLLCorner() { return new Vertex(this.localXMin(), this.localYMax()); }
        localLRCorner() { return new Vertex(this.localXMax(), this.localYMax()); }
        localCenter() { return new Vertex(this.localMidX(), this.localMidY()); }
        localLeftCenter() { return new Vertex(this.localXMin(), this.localMidY()); }
        localRightCenter() { return new Vertex(this.localXMax(), this.localMidY()); }
        localTopCenter() { return new Vertex(this.localMidX(), this.localYMin()); }
        localBottomCenter() { return new Vertex(this.localMidX(), this.localYMax()); }
        ulCorner(frame) { return this.transformLocalPoint(this.localULCorner(), frame); }
        urCorner(frame) { return this.transformLocalPoint(this.localURCorner(), frame); }
        llCorner(frame) { return this.transformLocalPoint(this.localLLCorner(), frame); }
        lrCorner(frame) { return this.transformLocalPoint(this.localLRCorner(), frame); }
        center(frame) { return this.transformLocalPoint(this.localCenter(), frame); }
        xMin(frame) { return this.ulCorner(frame).x; }
        xMax(frame) { return this.lrCorner(frame).x; }
        yMin(frame) { return this.ulCorner(frame).y; }
        yMax(frame) { return this.lrCorner(frame).y; }
        midX(frame) { return this.center(frame).x; }
        midY(frame) { return this.center(frame).y; }
        leftCenter(frame) { return this.transformLocalPoint(this.localLeftCenter(), frame); }
        rightCenter(frame) { return this.transformLocalPoint(this.localRightCenter(), frame); }
        topCenter(frame) { return this.transformLocalPoint(this.localTopCenter(), frame); }
        bottomCenter(frame) { return this.transformLocalPoint(this.localRightCenter(), frame); }
        getWidth() { return this.localXMax() - this.localXMin(); }
        getHeight() { return this.localYMax() - this.localYMin(); }
        adjustFrame() {
            // Set the view anchor and size to fit the frame as computed from the vertices
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
        get midpoint() {
            return this.anchor.translatedBy(this.radius, this.radius);
        }
        set midpoint(newValue) {
            this.anchor = newValue.translatedBy(-this.radius, -this.radius);
        }
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
            /*
            Since midpoint is just an alias for a shifted anchor, there is possible
            confusion when updating a Circle/CircularArc with a new midpoint, anchor
            and/or radius.
            This is resolved here:
                - updating the midpoint changes the anchor with the given new or existing radius
                - updating just the radius keeps the midpoint where it is (anchor changes)
            */
            // read all possible new values
            let r = argsDict['radius'];
            let m = argsDict['midpoint'];
            let a = argsDict['anchor'];
            if (m && a) {
                throw `Inconsistent data: cannot set midpoint and anchor of a ${this.constructor.name} simultaneously`;
            }
            // adjust the anchor according to the given parameters
            if (r !== undefined && !m && !a) { // only r given
                argsDict['anchor'] = this.midpoint.translatedBy(-r, -r);
            }
            else if (r === undefined && m && !a) { // only m given
                argsDict['anchor'] = m.translatedBy(-this.radius, -this.radius);
            }
            else if (r === undefined && !m && a) ;
            else if (r !== undefined && m) { // r and m given, but no a
                argsDict['anchor'] = m.translatedBy(-r, -r);
            }
            else ;
            // remove the new midpoint (taken care of by updating the anchor)
            delete argsDict['midpoint'];
            let updatedRadius = (r !== undefined) ? r : this.radius;
            argsDict['viewWidth'] = 2 * updatedRadius;
            argsDict['viewHeight'] = 2 * updatedRadius;
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

    class ArithmeticButton extends CreativeButton {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                creations: ['var', 'const', '+', '–', '&times;', '/'],
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

    class SwingButton extends CreativeButton {
        fixedArgs() {
            return Object.assign(super.fixedArgs(), {
                creations: ['swing'],
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
            case 'ArithmeticButton':
                return new ArithmeticButton({ locationIndex: locationIndex });
            case 'ExpandableButton':
                return new ExpandableButton({ locationIndex: locationIndex });
            case 'SwingButton':
                return new SwingButton({ locationIndex: locationIndex });
        }
    }

    let paperButtons = ['DragButton', 'LinkButton', 'ExpandableButton', 'ArithmeticButton', 'CindyButton', 'SwingButton'];
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
