(function () {
    'use strict';

    class ExtendedObject {
        constructor(args = {}, superCall = false) {
            this.passedByValue = false;
            this.setAttributes(args);
        }
        properties() {
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
            // a key can refer to a property or an accessor (getter/setter)
            // this picks the right one to call in setAttributes
            // so we don't create properties that shouldn't be objects in their own right
            let descriptor = undefined;
            if (this.properties().includes(key)) {
                let obj = this;
                while (obj.constructor.name != 'Object' && descriptor === undefined) {
                    descriptor = Object.getOwnPropertyDescriptor(obj, key);
                    obj = Object.getPrototypeOf(obj);
                }
            }
            if (descriptor !== undefined) {
                return descriptor.set;
            }
            else {
                return undefined;
            }
        }
        setAttributes(args = {}) {
            for (let [key, newValue] of Object.entries(args)) {
                let setter = this.setter(key);
                if (setter !== undefined) {
                    setter.call(this, newValue);
                }
                else {
                    // we have an as-of-yet unknown property
                    if (newValue !== undefined && newValue.passedByValue) {
                        // create and copy
                        if (this[key] === undefined) {
                            this[key] = new newValue.constructor();
                        }
                        if (this[key].copyFrom !== undefined && typeof this[key].copyFrom == 'function') {
                            this[key].copyFrom(newValue);
                        }
                        else {
                            console.warn(`Object ${this[key]} does not implement method copyFrom`);
                        }
                    }
                    else {
                        // just link (pass by reference)
                        this[key] = newValue;
                    }
                }
            }
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
        midPointWith(otherVertex) {
            return new Vertex((this.x + otherVertex.x) / 2, (this.y + otherVertex.y) / 2);
        }
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
        constructor(args = {}, superCall = false) {
            super({}, true);
            this.passedByValue = true;
            this.angle = 0;
            this.scale = 1;
            this.shift = Vertex.origin();
            if (!superCall) {
                this.setAttributes(args);
            }
        }
        static identity() { return new Transform(); }
        det() { return this.scale ** 2; }
        asString() {
            let str1 = this.scale == 1 ? `` : `scale(${this.scale}) `;
            let str2 = this.angle == 0 ? `` : `rotate(-${this.angle / DEGREES}deg) `; // CSS convention is clockwise *facepalm*
            let str3 = this.shift.isZero() ? `` : `translate(${this.shift.x}px,${this.shift.y}px)`;
            return str1 + str2 + str3;
        }
        a() { return this.scale * Math.cos(this.angle); }
        b() { return -this.scale * Math.sin(this.angle); }
        c() { return this.scale * Math.sin(this.angle); }
        d() { return this.scale * Math.cos(this.angle); }
        e() { return this.shift.x; }
        f() { return this.shift.y; }
        inverse() {
            let t = new Transform({
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
            let v = t.shift;
            let w = this.shift;
            return new Transform({
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
        constructor(args = {}) {
            this.source = args['source'];
            this.outputName = args['outputName']; // may be undefined
            this.target = args['target'];
            this.inputName = args['inputName']; // may be undefined
        }
    }

    const isTouchDevice = 'ontouchstart' in document.documentElement;
    const DRAW_BORDER = true;
    function stringFromPoint(point) {
        let x = point[0], y = point[1];
        return `${x} ${y}`;
    }
    function remove(arr, value, all = false) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                arr.splice(i, 1);
                if (!all) {
                    break;
                }
            }
        }
    }
    function pointerEventPageLocation(e) {
        let t = null;
        let sidebarWidth = 0;
        try {
            let sidebar = document.querySelector('#sidebar');
            sidebarWidth = sidebar.clientWidth;
        }
        catch (_a) {
        }
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
    function extremeComponent(vertices, index, direction) {
        var extremum = -direction * Infinity;
        for (let v of vertices) {
            extremum = (direction > 0) ? Math.max(extremum, v[index]) : Math.min(extremum, v[index]);
        }
        return extremum;
    }
    function xMin(vertices) {
        return extremeComponent(vertices, 0, -1);
    }
    function xMax(vertices) {
        return extremeComponent(vertices, 0, 1);
    }
    function yMin(vertices) {
        return extremeComponent(vertices, 1, -1);
    }
    function yMax(vertices) {
        return extremeComponent(vertices, 1, 1);
    }
    function midX(vertices) {
        return (xMin(vertices) + xMax(vertices)) / 2;
    }
    function midY(vertices) {
        return (yMin(vertices) + yMax(vertices)) / 2;
    }

    class Mobject extends ExtendedObject {
        constructor(args = {}, superCall = false) {
            super({}, true);
            // position and hierarchy
            this.anchor = Vertex.origin();
            this._transform = Transform.identity();
            this.transformOrigin = ["top", "left"]; // to be writable later
            this._parent = null;
            this.viewWidth = 200;
            this.viewHeight = 200;
            this.children = [];
            // view and style
            this.view = document.createElement('div');
            this.visible = true;
            this.opacity = 1;
            this.backgroundColor = Color.clear();
            this.drawBorder = DRAW_BORDER;
            // dependency
            this.dependencies = [];
            // interactivity
            this.eventTarget = null;
            this.vetoOnStopPropagation = false;
            this.interactive = false;
            this.passAlongEvents = true; // to event target
            this.previousPassAlongEvents = null; // stored copy while temporarily set to false when draggable
            this.draggable = false; // by outside forces, that is (FreePoints drag themselves, as that is their method of interaction)
            this.dragPointStart = null;
            this.dragAnchorStart = null;
            if (!superCall) {
                this.setup();
                this.update(args);
            }
        }
        get transform() { return this._transform; }
        set transform(newTransform) {
            if (!newTransform.shift.isZero()) {
                console.warn("A Mobject's transform should not have a shift. Adjust the Mobject's anchor instead.");
            }
            this._transform = newTransform;
        }
        setup() {
            this.setupView();
            this.setupTouches();
        }
        tearDownView() {
            if (!this.view) {
                return;
            }
            if (this.superMobject) {
                this.superMobject.view.removeChild(this.view);
            }
            removePointerDown(this.view, this.boundPointerDown);
        }
        setupView() {
            this.view['mobject'] = this;
            if (this.superMobject) {
                this.superMobject.view.appendChild(this.view);
            }
            this.view.setAttribute('class', 'mobject-div ' + this.constructor.name);
            this.view.style.transformOrigin = `${this.transformOrigin[1]} ${this.transformOrigin[0]}`; // 'top left' etc.
            this.view.style.position = 'absolute'; // 'absolute' positions it relative (sic) to its parent
            this.view.style.overflow = 'visible';
            this.view.style.border = this.drawBorder ? '1px dashed green' : 'none';
        }
        setupTouches() {
            this.eventTarget = null;
            this.boundPointerDown = this.pointerDown.bind(this);
            this.boundPointerMove = this.pointerMove.bind(this);
            this.boundPointerUp = this.pointerUp.bind(this);
            this.boundEventTargetMobject = this.eventTargetMobject.bind(this);
            this.savedSelfHandlePointerDown = this.selfHandlePointerDown;
            this.savedSelfHandlePointerMove = this.selfHandlePointerMove;
            this.savedSelfHandlePointerUp = this.selfHandlePointerUp;
            addPointerDown(this.view, this.boundPointerDown);
            this.disableDragging();
        }
        update(args = {}, redraw = true) {
            this.updateSelf(args, redraw);
            this.updateSubmobs(redraw);
            this.updateDependents(redraw);
        }
        updateSelf(args = {}, redraw = true) {
            if (args['view'] !== undefined) {
                this.tearDownView();
            }
            this.setAttributes(args);
            if (args['view'] !== undefined) {
                this.setupView();
                this.setupTouches();
            }
            if (redraw) {
                this.redrawSelf();
            }
        }
        updateSubmobs(redraw = true) {
            for (let submob of this.children || []) {
                if (!this.dependsOn(submob)) { // prevent dependency loops
                    submob.update({}, redraw);
                }
            }
        }
        updateDependents(redraw = true) {
            for (let dep of this.dependencies || []) {
                let outputValue = this[dep.outputName]; // may be undefined
                if (typeof outputValue === 'function') {
                    dep.target[dep.inputName] = outputValue.bind(this)();
                }
                else if (outputValue !== undefined && outputValue !== null) {
                    dep.target[dep.inputName] = outputValue;
                }
                dep.target.update({}, redraw);
            }
        }
        redrawSelf() {
            this.view.style['left'] = this.anchor.x.toString() + 'px';
            this.view.style['top'] = this.anchor.y.toString() + 'px';
            this.view.style['transform'] = this.transform.asString();
            this.view.style['width'] = this.viewWidth.toString() + 'px';
            this.view.style['height'] = this.viewHeight.toString() + 'px';
            this.view.style['background-color'] = this.backgroundColor.toCSS();
            this.view.style['visibility'] = this.visible ? 'visible' : 'hidden';
        }
        centerAt(newCenter, frame) {
            // If there is no frame, use the parent's coordinate frame. If there is no parent yet, use local coordinates
            frame = frame || this.parent || this;
            let dr = newCenter.subtract(this.relativeViewCenter(frame));
            let oldAnchor = this.anchor.copy();
            this.anchor = this.anchor.translatedBy(dr[0], dr[1]);
        }
        transformRelativeTo(frame) {
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
        localPointRelativeTo(point, frame) {
            let t = this.transformRelativeTo(frame);
            return t.appliedTo(point);
        }
        localViewXMin() { return 0; }
        localViewXMax() { return this.viewWidth; }
        localViewYMin() { return 0; }
        localViewYMax() { return this.viewHeight; }
        localViewMidX() { return this.viewWidth / 2; }
        localViewMidY() { return this.viewHeight / 2; }
        localViewULCorner() { return new Vertex(this.localViewXMin(), this.localViewYMin()); }
        localViewURCorner() { return new Vertex(this.localViewXMax(), this.localViewYMin()); }
        localViewLRCorner() { return new Vertex(this.localViewXMax(), this.localViewYMax()); }
        localViewLLCorner() { return new Vertex(this.localViewXMin(), this.localViewYMax()); }
        localViewCorners() { return [this.localViewULCorner(), this.localViewURCorner(), this.localViewLRCorner(), this.localViewLLCorner()]; }
        localViewCenter() { return new Vertex(this.localViewMidX(), this.localViewMidY()); }
        localViewTopCenter() { return new Vertex(this.localViewMidX(), this.localViewYMin()); }
        localViewBottomCenter() { return new Vertex(this.localViewMidX(), this.localViewYMax()); }
        localViewLeftCenter() { return new Vertex(this.localViewXMin(), this.localViewMidY()); }
        localViewRightCenter() { return new Vertex(this.localViewXMax(), this.localViewMidY()); }
        relativeViewULCorner(frame) { return this.localPointRelativeTo(this.localViewULCorner(), frame); }
        relativeViewURCorner(frame) { return this.localPointRelativeTo(this.localViewURCorner(), frame); }
        relativeViewLRCorner(frame) { return this.localPointRelativeTo(this.localViewLRCorner(), frame); }
        relativeViewLLCorner(frame) { return this.localPointRelativeTo(this.localViewLLCorner(), frame); }
        relativeViewCorners(frame) { return [this.relativeViewULCorner(frame), this.relativeViewURCorner(frame), this.relativeViewLRCorner(frame), this.relativeViewLLCorner(frame)]; }
        relativeViewCenter(frame) { return this.localPointRelativeTo(this.localViewCenter(), frame); }
        relativeViewTopCenter(frame) { return this.localPointRelativeTo(this.localViewTopCenter(), frame); }
        relativeViewBottomCenter(frame) { return this.localPointRelativeTo(this.localViewBottomCenter(), frame); }
        relativeViewLeftCenter(frame) { return this.localPointRelativeTo(this.localViewLeftCenter(), frame); }
        relativeViewRightCenter(frame) { return this.localPointRelativeTo(this.localViewRightCenter(), frame); }
        relativeViewXMin(frame) { return xMin(this.relativeViewCorners(frame)); }
        relativeViewXMax(frame) { return xMax(this.relativeViewCorners(frame)); }
        relativeViewYMin(frame) { return yMin(this.relativeViewCorners(frame)); }
        relativeViewYMax(frame) { return yMax(this.relativeViewCorners(frame)); }
        relativeViewMidX(frame) { return midX(this.relativeViewCorners(frame)); }
        relativeViewMidY(frame) { return midY(this.relativeViewCorners(frame)); }
        viewULCorner() { return this.relativeViewULCorner(); }
        viewURCorner() { return this.relativeViewURCorner(); }
        viewLRCorner() { return this.relativeViewLRCorner(); }
        viewLLCorner() { return this.relativeViewLLCorner(); }
        viewCorners() { return this.relativeViewCorners(); }
        viewCenter() { return this.relativeViewCenter(); }
        viewTopCenter() { return this.relativeViewTopCenter(); }
        viewBottomCenter() { return this.relativeViewBottomCenter(); }
        viewLeftCenter() { return this.relativeViewLeftCenter(); }
        viewRightCenter() { return this.relativeViewRightCenter(); }
        viewXMin() { return this.relativeViewXMin(); }
        viewXMax() { return this.relativeViewXMax(); }
        viewYMin() { return this.relativeViewYMin(); }
        viewYMax() { return this.relativeViewYMax(); }
        viewMidX() { return this.relativeViewMidX(); }
        viewMidY() { return this.relativeViewMidY(); }
        localExtentXMin() { return this.submobjects.length == 0 ? this.localViewXMin() : this.relativeSubmobXMin(this); }
        localExtentXMax() { return this.submobjects.length == 0 ? this.localViewXMax() : this.relativeSubmobXMax(this); }
        localExtentYMin() { return this.submobjects.length == 0 ? this.localViewYMin() : this.relativeSubmobYMin(this); }
        localExtentYMax() { return this.submobjects.length == 0 ? this.localViewYMax() : this.relativeSubmobYMax(this); }
        localExtentMidX() { return (this.localExtentXMin() + this.localExtentXMax()) / 2; }
        localExtentMidY() { return (this.localExtentYMin() + this.localExtentYMax()) / 2; }
        localExtentULCorner() { return new Vertex(this.localExtentXMin(), this.localExtentYMin()); }
        localExtentURCorner() { return new Vertex(this.localExtentXMax(), this.localExtentYMin()); }
        localExtentLRCorner() { return new Vertex(this.localExtentXMax(), this.localExtentYMax()); }
        localExtentLLCorner() { return new Vertex(this.localExtentXMin(), this.localExtentYMax()); }
        localExtentCorners() { return [this.localExtentULCorner(), this.localExtentURCorner(), this.localExtentLRCorner(), this.localExtentLLCorner()]; }
        localExtentCenter() { return new Vertex(this.localExtentMidX(), this.localExtentMidY()); }
        localExtentTopCenter() { return new Vertex(this.localExtentMidX(), this.localExtentYMin()); }
        localExtentBottomCenter() { return new Vertex(this.localExtentMidX(), this.localExtentYMax()); }
        localExtentLeftCenter() { return new Vertex(this.localExtentXMin(), this.localExtentMidY()); }
        localExtentRightCenter() { return new Vertex(this.localExtentXMax(), this.localExtentMidY()); }
        relativeExtentULCorner(frame) { return this.localPointRelativeTo(this.localExtentULCorner(), frame); }
        relativeExtentURCorner(frame) { return this.localPointRelativeTo(this.localExtentURCorner(), frame); }
        relativeExtentLRCorner(frame) { return this.localPointRelativeTo(this.localExtentLRCorner(), frame); }
        relativeExtentLLCorner(frame) { return this.localPointRelativeTo(this.localExtentLLCorner(), frame); }
        relativeExtentCorners(frame) { return [this.relativeExtentULCorner(frame), this.relativeExtentURCorner(frame), this.relativeExtentLRCorner(frame), this.relativeExtentLLCorner(frame)]; }
        relativeExtentCenter(frame) { return this.localPointRelativeTo(this.localExtentCenter(), frame); }
        relativeExtentTopCenter(frame) { return this.localPointRelativeTo(this.localExtentTopCenter(), frame); }
        relativeExtentBottomCenter(frame) { return this.localPointRelativeTo(this.localExtentBottomCenter(), frame); }
        relativeExtentLeftCenter(frame) { return this.localPointRelativeTo(this.localExtentLeftCenter(), frame); }
        relativeExtentRightCenter(frame) { return this.localPointRelativeTo(this.localExtentRightCenter(), frame); }
        relativeExtentXMin(frame) { return xMin(this.relativeExtentCorners(frame)); }
        relativeExtentXMax(frame) { return xMax(this.relativeExtentCorners(frame)); }
        relativeExtentYMin(frame) { return yMin(this.relativeExtentCorners(frame)); }
        relativeExtentYMax(frame) { return yMax(this.relativeExtentCorners(frame)); }
        relativeExtentMidX(frame) { return midX(this.relativeExtentCorners(frame)); }
        relativeExtentMidY(frame) { return midY(this.relativeExtentCorners(frame)); }
        extentULCorner() { return this.relativeExtentULCorner(); }
        extentURCorner() { return this.relativeExtentURCorner(); }
        extentLRCorner() { return this.relativeExtentLRCorner(); }
        extentLLCorner() { return this.relativeExtentLLCorner(); }
        extentCorners() { return this.relativeExtentCorners(); }
        extentCenter() { return this.relativeExtentCenter(); }
        extentTopCenter() { return this.relativeExtentTopCenter(); }
        extentBottomCenter() { return this.relativeExtentBottomCenter(); }
        extentLeftCenter() { return this.relativeExtentLeftCenter(); }
        extentRightCenter() { return this.relativeExtentRightCenter(); }
        extentXMin() { return this.relativeExtentXMin(); }
        extentXMax() { return this.relativeExtentXMax(); }
        extentYMin() { return this.relativeExtentYMin(); }
        extentYMax() { return this.relativeExtentYMax(); }
        extentMidX() { return this.relativeExtentMidX(); }
        extentMidY() { return this.relativeExtentMidY(); }
        relativeULCorner(frame) { return this.relativeExtentULCorner(frame); }
        relativeURCorner(frame) { return this.relativeExtentURCorner(frame); }
        relativeLRCorner(frame) { return this.relativeExtentLRCorner(frame); }
        relativeLLCorner(frame) { return this.relativeExtentLLCorner(frame); }
        relativeCorners(frame) { return this.relativeExtentCorners(frame); }
        relativeCenter(frame) { return this.relativeExtentCenter(frame); }
        relativeTopCenter(frame) { return this.relativeExtentTopCenter(frame); }
        relativeBottomCenter(frame) { return this.relativeExtentBottomCenter(frame); }
        relativeLeftCenter(frame) { return this.relativeExtentLeftCenter(frame); }
        relativeRightCenter(frame) { return this.relativeExtentRightCenter(frame); }
        relativeXMin(frame) { return this.relativeExtentXMin(frame); }
        relativeXMax(frame) { return this.relativeExtentXMax(frame); }
        relativeYMin(frame) { return this.relativeExtentYMin(frame); }
        relativeYMax(frame) { return this.relativeExtentYMax(frame); }
        relativeMidX(frame) { return this.relativeExtentMidX(frame); }
        relativeMidY(frame) { return this.relativeExtentMidY(frame); }
        localULCorner() { return this.relativeExtentULCorner(this); }
        localURCorner() { return this.relativeExtentURCorner(this); }
        localLRCorner() { return this.relativeExtentLRCorner(this); }
        localLLCorner() { return this.relativeExtentLLCorner(this); }
        localCorners() { return this.relativeExtentCorners(this); }
        localCenter() { return this.relativeExtentCenter(this); }
        localTopCenter() { return this.relativeExtentTopCenter(this); }
        localBottomCenter() { return this.relativeExtentBottomCenter(this); }
        localLeftCenter() { return this.relativeExtentLeftCenter(this); }
        localRightCenter() { return this.relativeExtentRightCenter(this); }
        localXMin() { return this.relativeExtentXMin(this); }
        localXMax() { return this.relativeExtentXMax(this); }
        localYMin() { return this.relativeExtentYMin(this); }
        localYMax() { return this.relativeExtentYMax(this); }
        ulCorner() { return this.extentULCorner(); }
        urCorner() { return this.extentURCorner(); }
        lrCorner() { return this.extentLRCorner(); }
        llCorner() { return this.extentLLCorner(); }
        corners() { return this.extentCorners(); }
        center() { return this.extentCenter(); }
        topCenter() { return this.extentTopCenter(); }
        bottomCenter() { return this.extentBottomCenter(); }
        leftCenter() { return this.extentLeftCenter(); }
        rightCenter() { return this.extentRightCenter(); }
        xMin() { return this.extentXMin(); }
        xMax() { return this.extentXMax(); }
        yMin() { return this.extentYMin(); }
        yMax() { return this.extentYMax(); }
        localSubmobXMin() {
            var ret = Infinity;
            for (let submob of this.submobjects) {
                ret = Math.min(ret, xMin(submob.relativeExtentCorners(this)));
            }
            return ret;
        }
        localSubmobXMax() {
            var ret = -Infinity;
            for (let submob of this.submobjects) {
                ret = Math.max(ret, xMax(submob.relativeExtentCorners(this)));
            }
            return ret;
        }
        localSubmobYMin() {
            var ret = Infinity;
            for (let submob of this.submobjects) {
                ret = Math.min(ret, yMin(submob.relativeExtentCorners(this)));
            }
            return ret;
        }
        localSubmobYMax() {
            var ret = -Infinity;
            for (let submob of this.submobjects) {
                ret = Math.max(ret, yMax(submob.relativeExtentCorners(this)));
            }
            return ret;
        }
        localSubmobMidX() {
            return (this.localSubmobXMin() + this.localSubmobXMax()) / 2;
        }
        localSubmobMidY() {
            return (this.localSubmobYMin() + this.localSubmobYMax()) / 2;
        }
        localSubmobULCorner() { return new Vertex(this.localSubmobXMin(), this.localSubmobYMin()); }
        localSubmobURCorner() { return new Vertex(this.localSubmobXMax(), this.localSubmobYMin()); }
        localSubmobLLCorner() { return new Vertex(this.localSubmobXMin(), this.localSubmobYMax()); }
        localSubmobLRCorner() { return new Vertex(this.localSubmobXMax(), this.localSubmobYMax()); }
        localSubmobCorners() { return [this.localSubmobULCorner(), this.localSubmobURCorner(), this.localSubmobLRCorner(), this.localSubmobLLCorner()]; }
        localSubmobCenter() { return new Vertex(this.localSubmobMidX(), this.localSubmobMidY()); }
        localSubmobTopCenter() { return new Vertex(this.localSubmobMidX(), this.localSubmobYMin()); }
        localSubmobBottomCenter() { return new Vertex(this.localSubmobMidX(), this.localSubmobYMax()); }
        localSubmobLeftCenter() { return new Vertex(this.localSubmobXMin(), this.localSubmobMidY()); }
        localSubmobRightCenter() { return new Vertex(this.localSubmobXMax(), this.localSubmobMidY()); }
        relativeSubmobULCorner(frame) { return this.localPointRelativeTo(this.localSubmobULCorner(), frame); }
        relativeSubmobURCorner(frame) { return this.localPointRelativeTo(this.localSubmobURCorner(), frame); }
        relativeSubmobLLCorner(frame) { return this.localPointRelativeTo(this.localSubmobLLCorner(), frame); }
        relativeSubmobLRCorner(frame) { return this.localPointRelativeTo(this.localSubmobLRCorner(), frame); }
        relativeSubmobCorners(frame) { return [this.relativeSubmobULCorner(frame), this.relativeSubmobURCorner(frame), this.relativeSubmobLRCorner(frame), this.relativeSubmobLLCorner(frame)]; }
        relativeSubmobCenter(frame) { return this.localPointRelativeTo(this.localSubmobCenter(), frame); }
        relativeSubmobTopCenter(frame) { return this.localPointRelativeTo(this.localSubmobTopCenter(), frame); }
        relativeSubmobBottomCenter(frame) { return this.localPointRelativeTo(this.localSubmobBottomCenter(), frame); }
        relativeSubmobLeftCenter(frame) { return this.localPointRelativeTo(this.localSubmobLeftCenter(), frame); }
        relativeSubmobRightCenter(frame) { return this.localPointRelativeTo(this.localSubmobRightCenter(), frame); }
        relativeSubmobXMin(frame) { return xMin(this.relativeSubmobCorners(frame)); }
        relativeSubmobXMax(frame) { return xMax(this.relativeSubmobCorners(frame)); }
        relativeSubmobYMin(frame) { return yMin(this.relativeSubmobCorners(frame)); }
        relativeSubmobYMax(frame) { return yMax(this.relativeSubmobCorners(frame)); }
        relativeSubmobMidX(frame) { return midX(this.relativeSubmobCorners(frame)); }
        relativeSubmobMidY(frame) { return midY(this.relativeSubmobCorners(frame)); }
        submobULCorner() { return this.relativeSubmobULCorner(); }
        submobURCorner() { return this.relativeSubmobURCorner(); }
        submobLRCorner() { return this.relativeSubmobLRCorner(); }
        submobLLCorner() { return this.relativeSubmobLLCorner(); }
        submobCorners() { return this.relativeSubmobCorners(); }
        submobCenter() { return this.relativeSubmobCenter(); }
        submobTopCenter() { return this.relativeSubmobTopCenter(); }
        submobBottomCenter() { return this.relativeSubmobBottomCenter(); }
        submobLeftCenter() { return this.relativeSubmobLeftCenter(); }
        submobRightCenter() { return this.relativeSubmobRightCenter(); }
        submobXMin() { return this.relativeSubmobXMin(); }
        submobXMax() { return this.relativeSubmobXMax(); }
        submobYMin() { return this.relativeSubmobYMin(); }
        submobYMax() { return this.relativeSubmobYMax(); }
        submobMidX() { return this.relativeSubmobMidX(); }
        submobMidY() { return this.relativeSubmobMidY(); }
        getWidth() { return this.localExtentXMax() - this.localExtentXMin(); }
        getHeight() { return this.localExtentYMax() - this.localExtentYMin(); }
        adjustFrame() {
            let v = this.localExtentULCorner();
            let shift = new Transform({ shift: v });
            let inverseShift = shift.inverse();
            let updateDict = {};
            for (let [key, value] of Object.entries(this)) {
                var newValue;
                if (value instanceof Vertex && key != 'anchor') {
                    newValue = inverseShift.appliedTo(value);
                }
                else if (value instanceof Array && value.length > 0 && value[0] instanceof Vertex) {
                    newValue = inverseShift.appliedToVertices(value);
                }
                else if (value instanceof Mobject && value != this.superMobject && !this.submobjects.includes(value)) {
                    // "unregistered" submobs, registered ones are handled below
                    value.update({
                        anchor: inverseShift.appliedTo(value.anchor)
                    });
                }
                else {
                    continue;
                }
                updateDict[key] = newValue;
            }
            for (let submob of this.submobjects) {
                let newAnchor = inverseShift.appliedTo(submob.anchor);
                submob.update({
                    anchor: newAnchor
                });
            }
            if (this.superMobject) {
                updateDict['anchor'] = shift.appliedTo(this.anchor);
            }
            updateDict['viewWidth'] = this.getWidth();
            updateDict['viewHeight'] = this.getHeight();
            this.update(updateDict);
        }
        get superMobject() { return this.parent; }
        set superMobject(newValue) { this.parent = newValue; }
        // move to update?
        get parent() { return this._parent; }
        set parent(newParent) {
            var _a;
            (_a = this.view) === null || _a === void 0 ? void 0 : _a.remove();
            this._parent = newParent;
            if (newParent == undefined) {
                return;
            }
            newParent.add(this);
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
            submob.update();
        }
        remove(submob) {
            submob.view.remove();
            remove(this.children, submob);
            submob.parent = undefined;
        }
        getPaper() {
            let p = this;
            while (p != undefined && p.constructor.name != 'Paper') {
                p = p.parent;
            }
            return p;
        }
        show() {
            this.update({ visible: true });
            for (let submob of this.children) {
                submob.show();
            } // we have to propagate visibility bc we have to for invisibility
        }
        hide() {
            this.update({ visible: false }, false);
            for (let submob of this.children) {
                submob.show();
            } // we have to propagate visibility bc we have to for invisibility
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
            //console.log(targetViewChain)
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
            if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
                this.eventTarget.pointerDown(e);
            }
            else {
                this.selfHandlePointerDown(e);
            }
        }
        pointerMove(e) {
            if (this.eventTarget.vetoOnStopPropagation) {
                return;
            }
            e.stopPropagation();
            if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
                this.eventTarget.pointerMove(e);
            }
            else {
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
        constructor(args = {}, superCall = false) {
            super({}, true);
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.vertices = [];
            this.fillColor = Color.white();
            this.fillOpacity = 0.5;
            this.strokeColor = Color.white();
            this.strokeWidth = 1;
            if (!superCall) {
                this.setup();
                this.update(args);
            }
        }
        setup() {
            super.setup();
            this.svg['mobject'] = this;
            this.path['mobject'] = this;
            this.svg.appendChild(this.path);
            this.svg.setAttribute('class', 'mobject-svg');
            this.svg.style.overflow = 'visible';
            this.view.appendChild(this.svg); // why not just add?
            this.view.setAttribute('class', this.constructor.name + ' mobject-div');
        }
        redrawSelf() {
            super.redrawSelf();
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
            let returnValue = this.transformRelativeTo(frame).appliedToVertices(this.vertices);
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
        localVerticesXMin() { return xMin(this.vertices); }
        localVerticesXMax() { return xMax(this.vertices); }
        localVerticesYMin() { return yMin(this.vertices); }
        localVerticesYMax() { return yMax(this.vertices); }
        localVerticesMidX() { return midX(this.vertices); }
        localVerticesMidY() { return midY(this.vertices); }
        localVerticesULCorner() { return new Vertex(this.localVerticesXMin(), this.localVerticesYMin()); }
        localVerticesURCorner() { return new Vertex(this.localVerticesXMax(), this.localVerticesYMin()); }
        localVerticesLRCorner() { return new Vertex(this.localVerticesXMax(), this.localVerticesYMax()); }
        localVerticesLLCorner() { return new Vertex(this.localVerticesXMin(), this.localVerticesYMax()); }
        localVerticesCorners() { return [this.localVerticesULCorner(), this.localVerticesURCorner(), this.localVerticesLRCorner(), this.localVerticesLLCorner()]; }
        localVerticesCenter() { return new Vertex(this.localVerticesMidX(), this.localVerticesMidY()); }
        localVerticesTopCenter() { return new Vertex(this.localVerticesMidX(), this.localVerticesYMin()); }
        localVerticesBottomCenter() { return new Vertex(this.localVerticesMidX(), this.localVerticesYMax()); }
        localVerticesLeftCenter() { return new Vertex(this.localVerticesXMin(), this.localVerticesMidY()); }
        localVerticesRightCenter() { return new Vertex(this.localVerticesXMax(), this.localVerticesMidY()); }
        relativeVerticesULCorner(frame) { return this.localPointRelativeTo(this.localVerticesULCorner(), frame); }
        relativeVerticesURCorner(frame) { return this.localPointRelativeTo(this.localVerticesURCorner(), frame); }
        relativeVerticesLRCorner(frame) { return this.localPointRelativeTo(this.localVerticesLRCorner(), frame); }
        relativeVerticesLLCorner(frame) { return this.localPointRelativeTo(this.localVerticesLLCorner(), frame); }
        relativeVerticesCorners(frame) { return [this.relativeVerticesULCorner(frame), this.relativeVerticesURCorner(frame), this.relativeVerticesLRCorner(frame), this.relativeVerticesLLCorner(frame)]; }
        relativeVerticesCenter(frame) { return this.localPointRelativeTo(this.localVerticesCenter(), frame); }
        relativeVerticesTopCenter(frame) { return this.localPointRelativeTo(this.localVerticesTopCenter(), frame); }
        relativeVerticesBottomCenter(frame) { return this.localPointRelativeTo(this.localVerticesBottomCenter(), frame); }
        relativeVerticesLeftCenter(frame) { return this.localPointRelativeTo(this.localVerticesLeftCenter(), frame); }
        relativeVerticesRightCenter(frame) { return this.localPointRelativeTo(this.localVerticesRightCenter(), frame); }
        relativeVerticesXMin(frame) { return xMin(this.relativeVerticesCorners(frame)); }
        relativeVerticesXMax(frame) { return xMax(this.relativeVerticesCorners(frame)); }
        relativeVerticesYMin(frame) { return yMin(this.relativeVerticesCorners(frame)); }
        relativeVerticesYMax(frame) { return yMax(this.relativeVerticesCorners(frame)); }
        relativeVerticesMidX(frame) { return midX(this.relativeVerticesCorners(frame)); }
        relativeVerticesMidY(frame) { return midY(this.relativeVerticesCorners(frame)); }
        verticesULCorner() { return this.relativeVerticesULCorner(); }
        verticesURCorner() { return this.relativeVerticesURCorner(); }
        verticesLRCorner() { return this.relativeVerticesLRCorner(); }
        verticesLLCorner() { return this.relativeVerticesLLCorner(); }
        verticesCorners() { return this.relativeVerticesCorners(); }
        verticesCenter() { return this.relativeVerticesCenter(); }
        verticesTopCenter() { return this.relativeVerticesTopCenter(); }
        verticesBottomCenter() { return this.relativeVerticesBottomCenter(); }
        verticesLeftCenter() { return this.relativeVerticesLeftCenter(); }
        verticesRightCenter() { return this.relativeVerticesRightCenter(); }
        verticesXMin() { return this.relativeVerticesXMin(); }
        verticesXMax() { return this.relativeVerticesXMax(); }
        verticesYMin() { return this.relativeVerticesYMin(); }
        verticesYMax() { return this.relativeVerticesYMax(); }
        verticesMidX() { return this.relativeVerticesMidX(); }
        verticesMidY() { return this.relativeVerticesMidY(); }
        localExtentXMin() { return Math.min(this.localVerticesXMin(), this.localSubmobXMin()); }
        localExtentXMax() { return Math.max(this.localVerticesXMax(), this.localSubmobXMax()); }
        localExtentYMin() { return Math.min(this.localVerticesYMin(), this.localSubmobYMin()); }
        localExtentYMax() { return Math.max(this.localVerticesYMax(), this.localSubmobYMax()); }
        localExtentMidX() { return (this.localVerticesXMin() + this.localSubmobXMax()) / 2; }
        localExtentMidY() { return (this.localVerticesYMin() + this.localSubmobYMax()) / 2; }
    }
    class CurvedShape extends VMobject {
        constructor(args = {}, superCall = false) {
            super({}, true);
            this._bezierPoints = [];
            if (!superCall) {
                this.setup();
                this.update(args);
            }
        }
        updateBezierPoints() { }
        // implemented by subclasses
        updateSelf(args = {}) {
            super.updateSelf(args);
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
        constructor(args = {}, superCall = false) {
            super({}, true);
            this._radius = 50;
            this.anchor = new Vertex(-this.radius, -this.radius);
            if (!superCall) {
                this.setup();
                this.update(args);
            }
        }
        get midpoint() { return this.anchor.translatedBy(this.radius, this.radius); }
        set midpoint(newValue) {
            if (this.radius === undefined) {
                this.radius = 0;
            }
            this.anchor = newValue.translatedBy(-this.radius, -this.radius);
        }
        get radius() { return this._radius; }
        set radius(newValue) {
            if (this.anchor == undefined) {
                this.midpoint = new Vertex(newValue, newValue);
            }
            let oldMidpoint = this.midpoint;
            this._radius = newValue;
            this.midpoint = oldMidpoint; // this moves the anchor so that the midpoint stays the same
        }
        updateSelf(args = {}) {
            let r = args['radius'] || this.radius;
            args['viewWidth'] = 2 * r;
            args['viewHeight'] = 2 * r;
            super.updateSelf(args);
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
        }
    }

    let m = new Mobject({
        anchor: new Vertex(200, 100),
        viewWidth: 250,
        viewHeight: 150,
        backgroundColor: Color.red()
    });
    let c = new Circle({
        midpoint: new Vertex(50, 50),
        radius: 60,
        fillColor: Color.green(),
        fillOpacity: 1,
        strokeColor: Color.red()
    });
    m.add(c);
    document.querySelector('#paper').appendChild(m.view);

}());
