var Sidebar = (function (exports) {
    'use strict';

    class Vertex extends Array {
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
    class Transform {
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
            //console.log('old anchor:', this._anchor, 'new anchor:', newValue)
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
    class Translation extends Transform {
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
    class CentralStretching extends Transform {
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
    class Stretching extends Transform {
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
    class CentralScaling extends CentralStretching {
        constructor(scale) {
            super(scale, scale);
        }
        get scale() { return this.scaleX; }
        set scale(newValue) { this.scaleX = newValue, this.scaleY = newValue; }
        inverse() {
            return new CentralScaling(1 / this.scale);
        }
    }
    class Scaling extends Stretching {
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
    class CentralRotation extends Transform {
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
    class Rotation extends Transform {
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

    const isTouchDevice = 'ontouchstart' in document.documentElement;
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
    function rgb(r, g, b) {
        let hex_r = (Math.round(r * 255)).toString(16).padStart(2, '0');
        let hex_g = (Math.round(g * 255)).toString(16).padStart(2, '0');
        let hex_b = (Math.round(b * 255)).toString(16).padStart(2, '0');
        return '#' + hex_r + hex_g + hex_b;
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

    class Dependency {
        constructor(argsDict = {}) {
            this.source = argsDict['source'];
            this.outputName = argsDict['outputName']; // may be undefined
            this.target = argsDict['target'];
            this.inputName = argsDict['inputName']; // may be undefined
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
    class Mobject {
        constructor(argsDict = {}) {
            this.children = [];
            this.snappablePoints = []; // workaround, don't ask
            this.eventTarget = null;
            if (argsDict['view'] == undefined) {
                //this.view = document.createElement('div') // placeholder
                this.view = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            }
            else {
                this.view = argsDict['view'];
            }
            let defaults = {
                transform: Transform.identity(),
                anchor: Vertex.origin(),
                vertices: [],
                children: [],
                dependencies: [],
                fillColor: Color.white(),
                fillOpacity: 1,
                strokeColor: Color.white(),
                strokeWidth: 1,
                passAlongEvents: false,
                visible: true,
                draggable: false // by outside forces, that is
            };
            Object.assign(defaults, argsDict);
            this.setAttributes(defaults);
            this.view['mobject'] = this;
            this.view.setAttribute('class', this.constructor.name);
            this.show();
            this.boundPointerDown = this.pointerDown.bind(this);
            this.boundPointerMove = this.pointerMove.bind(this);
            this.boundPointerUp = this.pointerUp.bind(this);
            this.boundEventTargetMobject = this.eventTargetMobject.bind(this);
            addPointerDown(this.view, this.boundPointerDown);
            this.savedSelfHandlePointerDown = this.selfHandlePointerDown;
            this.savedSelfHandlePointerMove = this.selfHandlePointerMove;
            this.savedSelfHandlePointerUp = this.selfHandlePointerUp;
            this.disableDragging();
            // this.boundCreatePopover = this.createPopover.bind(this)
            // this.boundDismissPopover = this.dismissPopover.bind(this)
            // this.boundMouseUpAfterCreatingPopover = this.mouseUpAfterCreatingPopover.bind(this)
        }
        get opacity() { return this.fillOpacity; }
        set opacity(newValue) { this.fillOpacity = newValue; }
        get transform() {
            if (this._transform == undefined) {
                this._transform = Transform.identity();
            }
            return this._transform;
        }
        set transform(newValue) {
            if (this._transform == undefined) {
                this._transform = newValue;
            }
            else {
                this._transform.copyFrom(newValue);
            }
        }
        get anchor() { return this._anchor; }
        set anchor(newValue) {
            if (this._anchor == undefined) {
                this._anchor = newValue;
            }
            else {
                this._anchor.copyFrom(newValue);
            }
            this.transform.anchorAt(newValue);
            this.update();
        }
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
        getPaper() {
            let p = this;
            while (p != undefined && p.constructor.name != 'Paper') {
                p = p.parent;
            }
            return p;
        }
        get superMobject() { return this.parent; }
        set superMobject(newValue) { this.parent = newValue; }
        enableDragging() {
            this.savedSelfHandlePointerDown = this.selfHandlePointerDown;
            this.savedSelfHandlePointerMove = this.selfHandlePointerMove;
            this.savedSelfHandlePointerUp = this.selfHandlePointerUp;
            this.selfHandlePointerDown = this.startSelfDragging;
            this.selfHandlePointerMove = this.selfDragging;
            this.selfHandlePointerUp = this.endSelfDragging;
        }
        disableDragging() {
            this.selfHandlePointerDown = this.savedSelfHandlePointerDown;
            this.selfHandlePointerMove = this.savedSelfHandlePointerMove;
            this.selfHandlePointerUp = this.savedSelfHandlePointerUp;
        }
        eventTargetMobject(e) {
            let t = e.target;
            if (t.tagName == 'path') {
                t = t.parentElement;
            }
            if (t == this.view) {
                return this;
            }
            let targetViewChain = [t];
            while (t != undefined && t != this.view) {
                t = t.parentElement;
                targetViewChain.push(t);
            }
            t = targetViewChain.pop();
            t = targetViewChain.pop();
            while (t != undefined) {
                if (t['mobject'] != undefined) {
                    return t['mobject'];
                }
                t = targetViewChain.pop();
            }
            return this;
        }
        pointerDown(e) {
            e.stopPropagation();
            removePointerDown(this.view, this.boundPointerDown);
            addPointerMove(this.view, this.boundPointerMove);
            addPointerUp(this.view, this.boundPointerUp);
            this.eventTarget = this.boundEventTargetMobject(e);
            if (this.eventTarget != this && this.passAlongEvents) {
                this.eventTarget.pointerDown(e);
            }
            else {
                this.selfHandlePointerDown(e);
            }
        }
        pointerMove(e) {
            e.stopPropagation();
            if (this.eventTarget != this && this.passAlongEvents) {
                this.eventTarget.pointerMove(e);
            }
            else {
                this.selfHandlePointerMove(e);
            }
        }
        pointerUp(e) {
            e.stopPropagation();
            removePointerMove(this.view, this.boundPointerMove);
            removePointerUp(this.view, this.boundPointerUp);
            addPointerDown(this.view, this.boundPointerDown);
            if (this.eventTarget != this && this.passAlongEvents) {
                this.eventTarget.pointerUp(e);
            }
            else {
                this.selfHandlePointerUp(e);
            }
            this.eventTarget = null;
        }
        properties() {
            let obj = this;
            let properties = [];
            while (obj.constructor.name != 'Object') {
                properties.push(...Object.getOwnPropertyNames(obj));
                obj = Object.getPrototypeOf(obj);
            }
            return properties;
        }
        setter(key) {
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
            for (let [key, value] of Object.entries(argsDict)) {
                let setter = this.setter(key);
                if (setter != undefined) {
                    setter.call(this, value);
                }
                else {
                    if (this[key] instanceof Vertex) {
                        this[key].copyFrom(value);
                    }
                    else {
                        this[key] = value;
                    }
                }
            }
        }
        // flagged for deletion
        setDefaults(argsDict = {}) {
            for (let [key, value] of Object.entries(argsDict)) {
                if (this[key] != undefined) {
                    continue;
                }
                if (this[key] instanceof Vertex) {
                    this[key].copyFrom(value);
                }
                else {
                    this[key] = value;
                }
            }
        }
        get parent() { return this._parent; }
        set parent(newValue) {
            this.view.remove();
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
        relativeTransform(frame) {
            let t = Transform.identity();
            let mob = this;
            if (mob.constructor.name == 'CindyCanvas') {
                if (frame == this) {
                    return t;
                }
                else if (frame == (this.getPaper())) {
                    t.e = this.anchor.x;
                    t.f = this.anchor.y;
                    return t;
                }
                else {
                    throw 'Cannot compute property of CindyCanvas for this frame';
                }
            }
            while (mob && mob.transform instanceof Transform) {
                if (mob == frame) {
                    break;
                }
                t.leftComposeWith(mob.transform);
                mob = mob.parent;
            }
            return t;
        }
        globalTransform() {
            return this.relativeTransform();
        }
        relativeVertices(frame) {
            let returnValue = this.relativeTransform(frame).appliedTo(this.vertices);
            if (returnValue == undefined) {
                return [];
            }
            else {
                return returnValue;
            }
        }
        globalVertices() {
            return this.relativeVertices();
        }
        update(argsDict = {}, redraw = true) {
            this.setAttributes(argsDict);
            this.transform.anchorAt(this.anchor);
            this.updateSubmobs();
            for (let dep of this.dependencies || []) {
                let outputName = this[dep.outputName]; // may be undefined
                if (typeof outputName === 'function') {
                    dep.target[dep.inputName] = outputName();
                }
                else if (outputName != undefined && outputName != null) {
                    dep.target[dep.inputName] = outputName;
                }
                dep.target.update();
            }
            if (redraw) {
                this.redraw();
            }
        }
        updateSubmobs() {
            for (let submob of this.children || []) {
                submob.update({}, false);
            }
        }
        redrawSubmobs() {
            console.log(this.constructor.name + '.redrawSubmobs');
            for (let submob of this.children || []) {
                submob.redraw();
                submob.redrawSubmobs();
            }
        }
        redraw() {
            console.warn('Please subclass Mobject.redraw for class', this.constructor.name);
        }
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
        hide() {
            this.visible = false;
            if (this.view != undefined) {
                this.view.style["visibility"] = "hidden";
            }
            for (let submob of this.children) {
                submob.hide();
            } // we have to propagate invisibility
            this.redraw();
        }
        show() {
            this.visible = true;
            if (this.view != undefined) {
                this.view.style["visibility"] = "visible";
            }
            for (let submob of this.children) {
                submob.show();
            } // we have to propagate visibility bc we have to for invisibility
            this.redraw();
        }
        centerAt(newCenter, frame) {
            if (!frame) {
                frame = this;
            }
            let dr = newCenter.subtract(this.center(frame));
            this.anchor = this.anchor.translatedBy(dr[0], dr[1]);
            this.redraw();
        }
        startSelfDragging(e) {
            this.dragPointStart = pointerEventVertex(e);
            this.dragAnchorStart = this.anchor.copy();
        }
        selfDragging(e) {
            let dragPoint = pointerEventVertex(e);
            let dr = dragPoint.subtract(this.dragPointStart);
            this.anchor.copyFrom(this.dragAnchorStart.add(dr));
            this.update();
        }
        endSelfDragging(e) {
            this.dragPointStart = undefined;
            this.dragAnchorStart = undefined;
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
        // empty methods as workaround (don't ask)
        removeFreePoint(fp) { }
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
        getWidth() { return this.localXMax() - this.localXMin(); }
        getHeight() { return this.localYMax() - this.localYMin(); }
        localULCorner() { return new Vertex(this.localXMin(), this.localYMin()); }
        localURCorner() { return new Vertex(this.localXMax(), this.localYMin()); }
        localLLCorner() { return new Vertex(this.localXMin(), this.localYMax()); }
        localLRCorner() { return new Vertex(this.localXMax(), this.localYMax()); }
        localMidX() { return (this.localXMin() + this.localXMax()) / 2; }
        localMidY() { return (this.localYMin() + this.localYMax()) / 2; }
        localLeftCenter() { return new Vertex(this.localXMin(), this.localMidY()); }
        localRightCenter() { return new Vertex(this.localXMax(), this.localMidY()); }
        localTopCenter() { return new Vertex(this.localMidX(), this.localYMin()); }
        localBottomCenter() { return new Vertex(this.localMidX(), this.localYMax()); }
        localCenter() {
            return new Vertex(this.localMidX(), this.localMidY());
        }
        xMin(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localXMin());
        }
        xMax(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localXMax());
        }
        yMin(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localYMin());
        }
        yMax(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localYMax());
        }
        ulCorner(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localULCorner());
        }
        urCorner(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localURCorner());
        }
        llCorner(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localLLCorner());
        }
        lrCorner(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localLRCorner());
        }
        midX(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.midX());
        }
        midY(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.midY());
        }
        leftCenter(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localLeftCenter());
        }
        rightCenter(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localRightCenter());
        }
        topCenter(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localTopCenter());
        }
        bottomCenter(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localBottomCenter());
        }
        center(frame) {
            if (!frame) {
                frame = this;
            }
            return this.relativeTransform(frame).appliedTo(this.localCenter());
        }
        globalXMin() { return this.xMin(this.getPaper()); }
        globalXMax() { return this.xMax(this.getPaper()); }
        globalYMin() { return this.yMin(this.getPaper()); }
        globalYMax() { return this.yMax(this.getPaper()); }
        globalULCorner() { return this.ulCorner(this.getPaper()); }
        globalURCorner() { return this.urCorner(this.getPaper()); }
        globalLLCorner() { return this.llCorner(this.getPaper()); }
        globalLRCorner() { return this.lrCorner(this.getPaper()); }
        globalMidX() { return this.midX(this.getPaper()); }
        globalMidY() { return this.midY(this.getPaper()); }
        globalLeftCenter() { return this.leftCenter(this.getPaper()); }
        globalRightCenter() { return this.rightCenter(this.getPaper()); }
        globalTopCenter() { return this.topCenter(this.getPaper()); }
        globalBottomCenter() { return this.bottomCenter(this.getPaper()); }
        globalCenter() { return this.center(this.getPaper()); }
    }
    class MGroup extends Mobject {
        constructor(argsDict = {}) {
            super();
            for (let submob of this.children) {
                this.add(submob);
            }
            this.update(argsDict);
        }
        redraw() {
            console.log('MGroup.redraw');
            this.redrawSubmobs();
        }
    }
    class VMobject extends Mobject {
        constructor(argsDict = {}) {
            super();
            this.vertices = [];
            this.view = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.path['mobject'] = this;
            this.view.appendChild(this.path); // why not just add?
            this.view.setAttribute('class', this.constructor.name);
            this.setAttributes({
                fillColor: Color.white(),
                fillOpacity: 0.5,
                strokeColor: Color.white(),
                strokeWidth: 1
            });
            this.update(argsDict);
        }
        redraw() {
            if (this.path == undefined || this.vertices.length == 0) {
                return;
            }
            let pathString = this.pathString();
            if (pathString.includes("NaN")) {
                return;
            }
            this.path.setAttribute('d', pathString);
            this.path.style['fill'] = this.fillColor.toHex();
            this.path.style['fill-opacity'] = this.fillOpacity.toString();
            this.path.style['stroke'] = this.strokeColor.toHex();
            this.path.style['stroke-width'] = this.strokeWidth.toString();
            this.redrawSubmobs();
        }
        pathString() {
            console.log('please subclass pathString');
            return '';
        }
    }
    class Polygon extends VMobject {
        pathString() {
            let pathString = '';
            for (let point of this.vertices) {
                if (point == undefined || point.isNaN()) {
                    pathString = '';
                    return pathString;
                }
                let prefix = (pathString == '') ? 'M' : 'L';
                pathString += prefix + stringFromPoint(point);
            }
            pathString += 'Z';
            return pathString;
        }
    }
    class CurvedShape extends VMobject {
        updateBezierPoints() { }
        // implemented by subclasses
        update(argsDict = {}, redraw = true) {
            super.update(argsDict, redraw);
            this.updateBezierPoints();
        }
        globalBezierPoints() {
            return this.globalTransform().appliedTo(this.bezierPoints);
        }
        redraw() {
            console.log(this.constructor.name + '.redraw');
            this.updateBezierPoints();
            super.redraw();
        }
        pathString() {
            let points = this.globalBezierPoints();
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
    class TextLabel extends Mobject {
        constructor(argsDict = {}) {
            super();
            this.setAttributes({
                text: '',
                textAnchor: 'middle',
                color: Color.white()
            });
            this.view = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this.view['mobject'] = this;
            this.view.setAttribute('class', this.constructor.name + ' unselectable');
            this.view.setAttribute('text-anchor', this.textAnchor);
            this.view.setAttribute('alignment-baseline', 'middle');
            this.view.setAttribute('font-family', 'Helvetica');
            this.view.setAttribute('font-size', '12');
            this.view.setAttribute('x', '0');
            this.view.setAttribute('y', '0');
            this.view.setAttribute('stroke-width', '0');
            this.update(argsDict);
        }
        redraw() {
            this.view.textContent = this.text;
            this.view.setAttribute('x', this.globalTransform().e.toString());
            this.view.setAttribute('y', this.globalTransform().f.toString());
            if (this.color == undefined) {
                this.color = Color.white();
            }
            this.view.setAttribute('fill', this.color.toHex());
            this.view.setAttribute('stroke', this.color.toHex());
            this.redrawSubmobs();
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
        constructor(argsDict = {}) {
            super();
            this.setDefaults({
                radius: 10,
                midPoint: Vertex.origin()
            });
            this.setAttributes(argsDict);
        }
        // midPoint is a synonym for anchor
        get midPoint() { return this.anchor; }
        set midPoint(newValue) {
            this.anchor = newValue; // updates automatically
        }
        area() { return Math.PI * this.radius ** 2; }
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
            this.bezierPoints = newBezierPoints;
            // do NOT update the view, because redraw calls updateBezierPoints
        }
        rightEdge() {
            return new Vertex(this.radius, 0);
        }
    }
    class TwoPointCircle extends Circle {
        constructor(argsDict) {
            super(argsDict);
            this.setAttributes({
                strokeColor: Color.white(),
                fillColor: Color.white(),
                fillOpacity: 0
            });
            this.view.style['pointer-events'] = 'none';
            this.radius = this.midPoint.subtract(this.outerPoint).norm();
        }
        update(argsDict = {}, redraw = true) {
            try {
                this.radius = this.midPoint.subtract(this.outerPoint).norm();
            }
            catch (_a) { }
            super.update(argsDict, redraw);
        }
    }
    class Rectangle extends Polygon {
        constructor(argsDict) {
            super();
            this.setDefaults({
                width: 100,
                height: 100
            });
            this.p1 = Vertex.origin();
            this.p2 = new Vertex([this.width, 0]);
            this.p3 = new Vertex([this.width, this.height]);
            this.p4 = new Vertex([0, this.height]);
            this.vertices = [this.p1, this.p2, this.p3, this.p4];
            this.setAttributes(argsDict);
        }
        update(argsDict, redraw = true) {
            try {
                this.p2.x = this.width;
                this.p3.x = this.width;
                this.p3.y = this.height;
                this.p4.y = this.height;
                super.update(argsDict, redraw);
            }
            catch (_a) { }
        }
    }
    class RoundedRectangle extends CurvedShape {
        constructor(argsDict) {
            super(argsDict);
            this.setDefaults({
                width: 100,
                height: 100,
                cornerRadius: 10
            });
            this.p1 = Vertex.origin();
            this.p2 = new Vertex([this.width, 0]);
            this.p3 = new Vertex([this.width, this.height]);
            this.p4 = new Vertex([0, this.height]);
            this.updateBezierPoints();
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
                let p21 = this.p2.translatedBy(-r, 0);
                let p22 = this.p2.translatedBy(0, r);
                let p31 = this.p3.translatedBy(0, -r);
                let p32 = this.p3.translatedBy(-r, 0);
                let p41 = this.p4.translatedBy(r, 0);
                let p42 = this.p4.translatedBy(0, -r);
                this.bezierPoints = [
                    p12, p21,
                    p12, p21, this.p2,
                    this.p2, p22, p31,
                    p22, p31, this.p3,
                    this.p3, p32, p41,
                    p32, p41, this.p4,
                    this.p4, p42, p11,
                    p42, p11, this.p1,
                    this.p1, p12
                ];
            }
            catch (_a) { }
        }
    }

    class Segment extends Polygon {
        constructor(argsDict) {
            super(argsDict);
            this.setDefaults({
                startPoint: Vertex.origin(),
                endPoint: Vertex.origin(),
            });
            this.update();
        }
        components() {
            return this.endPoint.subtract(this.startPoint);
        }
        update(argsDict = {}, redraw = true) {
            this.vertices = [this.drawingStartPoint(), this.drawingEndPoint()];
            super.update(argsDict, redraw);
        }
        drawingStartPoint() { return this.startPoint; }
        drawingEndPoint() { return this.endPoint; }
        norm2() { return this.components().norm2(); }
        norm() { return Math.sqrt(this.norm2()); }
    }
    class Ray extends Segment {
        drawingEndPoint() {
            if (this.startPoint == this.endPoint) {
                return this.endPoint;
            }
            return this.startPoint.add(this.endPoint.subtract(this.startPoint).multiply(100));
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

    class CreatedMobject extends MGroup {
        dissolveInto(superMobject) {
            superMobject.remove(this);
            if (!this.visible) {
                return;
            }
            for (let submob of this.children) {
                superMobject.add(submob);
            }
        }
        updateFromTip(q) { }
    }
    class Freehand extends CreatedMobject {
        constructor(argsDict = {}) {
            super(argsDict);
            this.setAttributes({
                strokeColor: Color.white()
            });
        }
        updateWithPoints(q) {
            let nbDrawnPoints = this.children.length;
            let p = null;
            if (nbDrawnPoints > 0) {
                p = this.children[nbDrawnPoints - 1].midPoint;
            }
            let pointDistance = 10;
            let distance = ((p.x - q.x) ** 2 + (p.y - q.y) ** 2) ** 0.5;
            let unitVector = new Vertex([(q.x - p.x) / distance, (q.y - p.y) / distance]);
            for (let step = pointDistance; step < distance; step += pointDistance) {
                let x = p.x + step * unitVector.x + 0.5 * Math.random();
                let y = p.y + step * unitVector.y + 0.5 * Math.random();
                let newPoint = new Vertex([x, y]);
                let c = new Circle({ radius: 2 });
                c.fillColor = this.strokeColor;
                c.midPoint = new Vertex(newPoint);
                this.add(c);
            }
            let t = Math.random();
            let r = (1 - t) * 0.5 + t * 0.75;
            let c = new Circle({ radius: r, midPoint: new Vertex(q) });
            this.add(c);
        }
        updateWithLines(q) {
            let nbDrawnPoints = this.children.length;
            let p = null;
            if (nbDrawnPoints == 0) {
                p = q;
            }
            else {
                p = this.children[nbDrawnPoints - 1].endPoint;
            }
            let newLine = new Segment({
                startPoint: p,
                endPoint: q,
                strokeColor: this.strokeColor
            });
            this.add(newLine);
        }
        updateFromTip(q) {
            this.updateWithLines(q);
            this.redraw();
        }
        dissolveInto(superMobject) {
            superMobject.remove(this);
            if (this.visible) {
                superMobject.add(this);
            }
        }
    }
    class Point extends Circle {
        constructor(argsDict) {
            super(argsDict);
            this.radius = 5;
            this.view.setAttribute('class', this.constructor.name);
            this.setDefaults({
                midPoint: Vertex.origin()
            });
            this.setAttributes({
                fillColor: Color.white(),
                fillOpacity: 1.0
            });
        }
    }
    class FreePoint extends Point {
        constructor(argsDict) {
            super(argsDict);
            this.setAttributes({
                draggable: true
            });
            this.enableDragging();
        }
    }
    class DrawnArrow extends CreatedMobject {
        constructor(argsDict) {
            super(argsDict);
            this.endPoint = this.endPoint || this.startPoint.copy();
            this.passAlongEvents = true;
            this.startFreePoint = new FreePoint({
                midPoint: this.startPoint
            });
            this.endFreePoint = new FreePoint({
                midPoint: this.endPoint
            });
            this.add(this.startFreePoint);
            this.add(this.endFreePoint);
        }
        updateFromTip(q) {
            this.endPoint.copyFrom(q);
            this.update();
        }
        dissolveInto(paper) {
            paper.removeFreePoint(this.startFreePoint);
            paper.removeFreePoint(this.endFreePoint);
            for (let fq of paper.snappablePoints) {
                let q = fq.midPoint;
                if (this.startPoint.x == q.x && this.startPoint.y == q.y) {
                    this.startPoint = fq.midPoint;
                    this.startFreePoint = fq;
                    this.update();
                    break;
                }
            }
            for (let fq of paper.snappablePoints) {
                let q = fq.midPoint;
                if (this.endPoint.x == q.x && this.endPoint.y == q.y) {
                    this.endPoint = fq.midPoint;
                    this.endFreePoint = fq;
                    this.update();
                    break;
                }
            }
            paper.add(this.startFreePoint);
            paper.add(this.endFreePoint);
        }
    }
    class DrawnSegment extends DrawnArrow {
        constructor(argsDict) {
            super(argsDict);
            this.segment = new Segment({
                startPoint: this.startFreePoint.midPoint,
                endPoint: this.endFreePoint.midPoint
            });
            this.add(this.segment);
        }
        dissolveInto(superMobject) {
            super.dissolveInto(superMobject);
            superMobject.remove(this.segment);
            this.segment = new Segment({
                startPoint: this.startPoint,
                endPoint: this.endPoint,
                strokeColor: this.strokeColor,
            });
            this.startFreePoint.addDependent(this.segment);
            this.endFreePoint.addDependent(this.segment);
            superMobject.add(this.segment);
        }
    }
    class DrawnRay extends DrawnArrow {
        constructor(argsDict) {
            super(argsDict);
            this.ray = new Ray({
                startPoint: this.startFreePoint.midPoint,
                endPoint: this.endFreePoint.midPoint,
            });
            this.add(this.ray);
            this.startFreePoint.addDependent(this.ray);
            this.endFreePoint.addDependent(this.ray);
        }
        dissolveInto(superMobject) {
            super.dissolveInto(superMobject);
            superMobject.remove(this.ray);
            this.ray = new Ray({
                startPoint: this.startPoint,
                endPoint: this.endPoint,
                strokeColor: this.strokeColor
            });
            this.startFreePoint.addDependent(this.ray);
            this.endFreePoint.addDependent(this.ray);
            superMobject.add(this.ray);
        }
    }
    class DrawnLine extends DrawnArrow {
        constructor(argsDict) {
            super(argsDict);
            this.line = new Line({
                startPoint: this.startFreePoint.midPoint,
                endPoint: this.endFreePoint.midPoint
            });
            this.add(this.line);
            this.startFreePoint.addDependent(this.line);
            this.endFreePoint.addDependent(this.line);
        }
        dissolveInto(superMobject) {
            super.dissolveInto(superMobject);
            superMobject.remove(this.line);
            this.line = new Line({
                startPoint: this.startPoint,
                endPoint: this.endPoint,
                strokeColor: this.strokeColor
            });
            this.startFreePoint.addDependent(this.line);
            this.endFreePoint.addDependent(this.line);
            superMobject.add(this.line);
        }
    }
    class DrawnCircle extends CreatedMobject {
        constructor(argsDict) {
            super(argsDict);
            this.setDefaults({
                strokeColor: Color.white()
            });
            this.setAttributes({
                strokeWidth: 1,
                fillOpacity: 0
            });
            this.midPoint = this.midPoint || this.startPoint.copy();
            this.outerPoint = this.outerPoint || this.startPoint.copy();
            this.passAlongEvents = true;
            this.freeMidpoint = new FreePoint({
                midPoint: this.midPoint
            });
            this.freeOuterPoint = new FreePoint({
                midPoint: this.outerPoint
            });
            this.circle = new TwoPointCircle({
                midPoint: this.midPoint,
                outerPoint: this.outerPoint,
                fillOpacity: 0
            });
            this.add(this.freeMidpoint);
            this.add(this.freeOuterPoint);
            this.add(this.circle);
            this.freeMidpoint.addDependent(this.circle);
            this.freeOuterPoint.addDependent(this.circle);
        }
        updateFromTip(q) {
            this.outerPoint.copyFrom(q);
            this.update();
        }
        dissolveInto(paper) {
            paper.removeFreePoint(this.freeMidpoint);
            paper.removeFreePoint(this.freeOuterPoint);
            for (let fq of paper.snappablePoints) {
                let q = fq.midPoint;
                if (this.midPoint.x == q.x && this.midPoint.y == q.y) {
                    this.midPoint = fq.midPoint;
                    this.freeMidpoint = fq;
                    this.update();
                    break;
                }
            }
            for (let fq of paper.snappablePoints) {
                let q = fq.midPoint;
                if (this.outerPoint.x == q.x && this.outerPoint.y == q.y) {
                    this.outerPoint = fq.midPoint;
                    this.freeOuterPoint = fq;
                    this.update();
                    break;
                }
            }
            paper.add(this.freeMidpoint);
            paper.add(this.freeOuterPoint);
            paper.remove(this.circle);
            this.circle = new TwoPointCircle({
                midPoint: this.midPoint,
                outerPoint: this.outerPoint
            });
            this.circle.strokeColor = this.strokeColor;
            this.freeMidpoint.addDependent(this.circle);
            this.freeOuterPoint.addDependent(this.circle);
            paper.add(this.circle);
        }
    }

    class LinkBullet extends Circle {
        constructor(argsDict) {
            super(argsDict);
            this.setAttributes({
                radius: 10,
                fillOpacity: 0,
                strokeColor: Color.white()
            });
        }
    }
    class InputList extends RoundedRectangle {
        constructor(argsDict) {
            super(argsDict);
            this.setDefaults({ listInputNames: [] });
            this.setAttributes({
                cornerRadius: 30,
                fillColor: Color.white(),
                fillOpacity: 0.1,
                width: 150,
                height: this.getHeight()
            });
            this.redraw();
            this.bulletLocationDict = {};
            for (let i = 0; i < this.listInputNames.length; i++) {
                let name = this.listInputNames[i];
                let c = new LinkBullet({ mobject: this.mobject, inputName: name });
                let t = new TextLabel({ text: name, textAnchor: 'left' });
                c.anchor = new Vertex([40, 3 + 25 * (i + 1)]);
                t.anchor = c.anchor.translatedBy(25, 0);
                this.bulletLocationDict[name] = c.anchor;
                this.add(c);
                this.add(t);
            }
        }
        getHeight() {
            let l = this.listInputNames.length;
            if (l == 0) {
                return 0;
            }
            else {
                return 40 + 25 * this.listInputNames.length;
            }
        }
    }
    class OutputList extends RoundedRectangle {
        constructor(argsDict) {
            super(argsDict);
            this.setDefaults({ listOutputNames: [] });
            this.setAttributes({
                cornerRadius: 30,
                fillColor: Color.white(),
                fillOpacity: 0.3,
                width: 150,
                height: this.getHeight()
            });
            this.redraw();
            this.bulletLocationDict = {};
            for (let i = 0; i < this.listOutputNames.length; i++) {
                let name = this.listOutputNames[i];
                let c = new LinkBullet({ mobject: this.mobject, outputName: name });
                let t = new TextLabel({ text: name, textAnchor: 'left' });
                c.anchor = new Vertex([40, 3 + 25 * (i + 1)]);
                t.anchor = c.anchor.translatedBy(25, 0);
                this.bulletLocationDict[name] = c.anchor;
                this.add(c);
                this.add(t);
            }
        }
        getHeight() {
            let l = this.listOutputNames.length;
            if (l == 0) {
                return 0;
            }
            else {
                return 40 + 25 * this.listOutputNames.length;
            }
        }
    }
    class IOList extends MGroup {
        constructor(argsDict) {
            super(argsDict);
            this.inputList = new InputList(argsDict);
            this.outputList = new OutputList(argsDict);
            this.add(this.inputList);
            this.add(this.outputList);
            // positioning is handled by parent
        }
    }
    class DependencyMap extends MGroup {
        constructor(argsDict) {
            super(argsDict);
            this.linkLines = [];
        }
        selfHandlePointerDown(e) {
            let t = this.eventTargetMobject(e).eventTargetMobject(e).eventTargetMobject(e);
            // find a better way to handle this!
            if (t instanceof LinkBullet) {
                let tl = t;
                this.editedLinkLine = new LinkLine({
                    startPoint: tl.center(this),
                    source: tl.mobject,
                    inputName: t.inputName,
                    startHook: tl,
                    superMobject: this.superMobject
                });
                this.add(this.editedLinkLine);
                this.startMobject = tl.mobject;
            }
        }
        selfHandlePointerMove(e) {
            if (this.editedLinkLine == undefined) {
                return;
            }
            let p = pointerEventVertex(e);
            this.editedLinkLine.updateFromTip(this.snapInput(p));
        }
        selfHandlePointerUp(e) {
            let line = this.editedLinkLine;
            let tcircle = this.eventTargetMobject(e).eventTargetMobject(e).eventTargetMobject(e);
            // actually this is the Circle that we dragged, not the LinkBullet we snapped it to
            let tl = null;
            for (let iol of this.children) {
                if (!(iol instanceof IOList)) {
                    continue;
                }
                for (let b of iol.inputList.children) {
                    if (!(b instanceof LinkBullet)) {
                        continue;
                    }
                    let bc = b.globalCenter();
                    let tc = tcircle.globalCenter();
                    if (bc.x == tc.x && bc.y == tc.y) {
                        tl = b;
                        break;
                    }
                }
            }
            line.target = tl.mobject;
            line.endHook = tl;
            line.dissolveInto(this);
            this.linkLines.push(line);
            this.editedLinkLine = undefined;
            this.pointerUpVertex = pointerEventVertex(e);
        }
        snapInput(p) {
            for (let [loc, mobject, inputName] of this.inputLocations()) {
                if (p.closeTo(loc, 5)) {
                    return loc;
                }
            }
            return p;
        }
        snapOutput(p) {
            for (let [loc, mobject, outputName] of this.outputLocations()) {
                if (p.closeTo(loc, 5)) {
                    return loc;
                }
            }
            return p;
        }
        inputLocations() {
            let arr = [];
            for (let ioList of this.children) {
                if (!(ioList instanceof IOList)) {
                    continue;
                }
                let dict = ioList.inputList.bulletLocationDict;
                for (let inputName of Object.keys(dict)) {
                    let loc = ioList.inputList.relativeTransform(this).appliedTo(dict[inputName]);
                    arr.push([loc, ioList.mobject, inputName]);
                }
            }
            return arr;
        }
        outputLocations() {
            let arr = [];
            for (let ioList of this.children) {
                if (!(ioList instanceof IOList)) {
                    continue;
                }
                let dict = ioList.outputList.bulletLocationDict;
                for (let outputName of Object.keys(dict)) {
                    let loc = ioList.outputList.relativeTransform(this).appliedTo(dict[outputName]);
                    arr.push([loc, ioList.mobject, outputName]);
                }
            }
            return arr;
        }
        getInputFromVertex(p) {
            for (let [loc, mobject, inputName] of this.inputLocations()) {
                if (p.closeTo(loc, 5)) {
                    return [mobject, inputName];
                }
            }
            return [null, null];
        }
        getOutputFromVertex(p) {
            for (let [loc, mobject, outputName] of this.outputLocations()) {
                if (p.closeTo(loc, 5)) {
                    return [mobject, outputName];
                }
            }
            return [null, null];
        }
        fixLinkLine(argsDict) {
            let p = argsDict['fromPoint'];
            let q = argsDict['toPoint'];
            let [source, outputName] = this.getOutputFromVertex(p);
            let [target, inputName] = this.getInputFromVertex(q);
            if (source == null || target == null) {
                this.remove(this.editedLinkLine);
                return;
            }
            source.addDependency(outputName, target, inputName);
            this.addDependency(null, this.editedLinkLine, null);
            source.update();
        }
    }
    class LinkLine extends CreatedMobject {
        constructor(argsDict) {
            super(argsDict);
            this.endPoint = this.startPoint.copy();
            this.startBullet = new Circle({
                radius: 8,
                fillOpacity: 1,
                anchor: this.startPoint
            });
            this.line = new Segment({
                startPoint: this.startPoint,
                endPoint: this.startPoint.copy(),
                strokeWidth: 3
            });
            this.endBullet = new Circle({
                radius: 8,
                fillOpacity: 1,
                anchor: this.startPoint.copy()
            });
            this.add(this.startBullet);
            this.add(this.line);
            this.add(this.endBullet);
        }
        dissolveInto(superMobject) {
            superMobject.fixLinkLine({
                fromPoint: this.startPoint,
                toPoint: this.endPoint
            });
            //super.dissolveInto(superMobject)
        }
        updateFromTip(q) {
            this.endBullet.anchor.copyFrom(q);
            this.line.endPoint.copyFrom(q);
            //this.update() // why does this not work?
            this.endBullet.update();
            this.line.update();
            this.endPoint.copyFrom(q);
        }
        update(argsDict, redraw = true) {
            if (this.startHook != undefined && this.startBullet != undefined) {
                this.startBullet.centerAt(this.startHook.center(this.superMobject), this.superMobject);
            }
            if (this.endHook != undefined && this.endBullet != undefined) {
                this.endBullet.centerAt(this.endHook.center(this.superMobject), this.superMobject);
            }
            if (this.line != undefined) {
                this.line.update({
                    startPoint: this.startHook.center(this.superMobject),
                    endPoint: this.endHook.center(this.superMobject)
                });
            }
            super.update(argsDict, redraw);
        }
    }
    class LinkableMobject extends Mobject {
        constructor(argsDict) {
            super(argsDict);
            this.setDefaults({
                inputNames: [],
                outputNames: [] // linkable parameters
            });
        }
        dependenciesBetweenChildren() {
            let deps = [];
            for (let submob of this.children) {
                deps.push(...submob.dependencies);
            }
            return deps;
        }
        showLinksOfSubmobs() {
            if (this.dependencyMap) {
                this.dependencyMap.show();
                return;
            }
            this.dependencyMap = new DependencyMap({ superMobject: this });
            this.dependencyMap.mobject = this;
            this.add(this.dependencyMap);
            for (let submob of this.children) {
                this.createIOListForMobject(submob);
            }
            for (let submob of this.cindys) {
                this.createIOListForMobject(submob);
            }
        }
        createIOListForMobject(submob) {
            if (submob == this.dependencyMap) {
                return;
            }
            if (!(submob instanceof LinkableMobject)) {
                return;
            }
            if (submob.inputNames.length == 0 && submob.outputNames.length == 0) {
                return;
            }
            let ioList = new IOList({
                mobject: submob,
                listInputNames: submob.inputNames,
                listOutputNames: submob.outputNames,
            });
            this.dependencyMap.add(ioList);
            let p1 = ioList.inputList.bottomCenter(this);
            let p2 = submob.topCenter(this);
            ioList.inputList.anchor.translateBy(p2[0] - p1[0], p2[1] - p1[1] - 10);
            p1 = ioList.outputList.topCenter(this);
            p2 = submob.bottomCenter(this);
            ioList.outputList.anchor.translateBy(p2[0] - p1[0], p2[1] - p1[1] + 10);
            ioList.update();
        }
        hideLinksOfSubmobs() {
            this.dependencyMap.hide();
        }
        updateIOList() {
            if (this.dependencyMap == undefined) {
                return;
            }
            for (let submob of this.children) {
                var alreadyLinked = false;
                for (let ioList of this.dependencyMap.children) {
                    if (!(ioList instanceof IOList)) {
                        continue;
                    }
                    if (ioList.mobject == submob) {
                        alreadyLinked = true;
                    }
                }
                if (!alreadyLinked) {
                    this.createIOListForMobject(submob);
                }
            }
        }
        redraw() {
            this.redrawSubmobs();
        }
    }

    class CindyCanvas extends LinkableMobject {
        constructor(argsDict) {
            super(argsDict);
            this.paper = argsDict['paper'];
            this.anchor = argsDict['anchor'];
            this.width = argsDict['width'];
            this.height = argsDict['height'];
            // this.mainScript = document.createElement('script')
            // this.mainScript.setAttribute('type', 'text/javascript')
            // this.mainScript.setAttribute('src', 'CindyJS/build/js/Cindy.js')
            // this.mainScript.onload = this.createCore.bind(this)
            this.view.style['position'] = 'absolute';
            this.view.style['left'] = this.anchor.x + 'px';
            this.view.style['top'] = this.anchor.y + 'px';
            this.csView = document.createElement('canvas');
            let canvasID = 'CSCanvas'; // + this.paper.cindyPorts.length
            this.csView.setAttribute('id', canvasID);
            this.view.appendChild(this.csView);
            this.draggable = true;
            this.view.style['pointer-events'] = 'auto';
            document.querySelector('#paper-container').insertBefore(this.view, document.querySelector('#paper-console'));
            //document.head.appendChild(this.mainScript)
            this.paper.cindyPorts.push({
                id: canvasID,
                width: this.width,
                height: this.height,
                transform: [{
                        visibleRect: [0, 1, 1, 0]
                    }]
            });
            this.points = [[0.4, 0.4], [0.3, 0.8]];
            this.paper.add(this);
            //this.update()
            this.initScript = document.createElement('script');
            this.initScript.setAttribute('type', 'text/x-cindyscript');
            this.initScript.setAttribute('id', 'csinit');
            this.initScript.textContent = this.initCode();
            this.drawScript = document.createElement('script');
            this.drawScript.setAttribute('type', 'text/x-cindyscript');
            this.drawScript.setAttribute('id', 'csdraw');
            this.drawScript.textContent = this.drawCode();
            document.body.appendChild(this.initScript);
            document.body.appendChild(this.drawScript);
            this.createCore();
        }
        getPaper() { return this.paper; }
        initCode() {
            return `resetclock();`;
        }
        drawCode() {
            return `drawcmd();`;
        }
        createCore() {
            let argsDict = {
                scripts: "cs*",
                autoplay: true,
                ports: this.paper.cindyPorts,
                geometry: this.geometry()
            };
            this.core = this.paper.callCindyJS(argsDict);
        }
        geometry() { return []; }
        update(argsDict, redraw = true) { }
        redraw() { }
        localXMin() { return 0; }
        localXMax() { return this.width; }
        localYMin() { return 0; }
        localYMax() { return this.height; }
    }
    class WaveCindyCanvas extends CindyCanvas {
        constructor(argsDict = {}) {
            super(argsDict);
            this.setDefaults({
                wavelength: 1,
                frequency: 1
            });
            this.inputNames = ['wavelength', 'frequency'];
            this.update(argsDict);
        }
        initCode() {
            let l = 0.1 * (this.wavelength || 1);
            let f = 10 * (this.frequency || 1);
            return `W(x, p, l, f) := 0.5 * (1 + sin(|x - p| / l - seconds()*f)); drawcmd() := ( colorplot((0,W(#, A0, ${l}, ${f}) + W(#, A1, ${l}, ${f}),0)););` + super.initCode();
        }
        drawCode() {
            let l = 0.1 * (this.wavelength || 1);
            let f = 10 * (this.frequency || 1);
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
        update(argsDict = {}, redraw = true) {
            let l = 0.1 * (this.wavelength || 1);
            let f = 10 * (this.frequency || 1);
            if (this.core != undefined) {
                this.core.evokeCS(`drawcmd() := ( colorplot((0,W(#, A0, ${l}, ${f}) + W(#, A1, ${l}, ${f}),0)););`);
            }
            // if (this.drawScript != undefined) {
            // 	this.drawScript.textContent = this.drawCode()
            // }
            super.update(argsDict, redraw);
        }
    }
    class DrawnRectangle extends CreatedMobject {
        constructor(argsDict) {
            super(argsDict);
            this.endPoint = this.endPoint || this.startPoint.copy();
            this.p1 = this.startPoint;
            this.p2 = new Vertex(this.endPoint.x, this.startPoint.y);
            this.p3 = this.endPoint;
            this.p4 = new Vertex(this.startPoint.x, this.endPoint.y);
            this.top = new Segment({ startPoint: this.p1, endPoint: this.p2 });
            this.bottom = new Segment({ startPoint: this.p3, endPoint: this.p4 });
            this.left = new Segment({ startPoint: this.p1, endPoint: this.p4 });
            this.right = new Segment({ startPoint: this.p2, endPoint: this.p3 });
            this.top.strokeColor = Color.white();
            this.bottom.strokeColor = Color.white();
            this.left.strokeColor = Color.white();
            this.right.strokeColor = Color.white();
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
            this.redraw();
        }
        dissolveInto(parent) {
            let w = this.p2.x - this.p1.x;
            let h = this.p3.y - this.p1.y;
            let cindy = new WaveCindyCanvas({
                paper: parent,
                anchor: this.p1,
                width: w,
                height: h,
                wavelength: 0.1
            }); // auto-adds to parent
            cindy.update();
        }
    }

    class BoxSlider extends LinkableMobject {
        constructor(argsDict = {}) {
            super(argsDict);
            this.setDefaults({
                min: 0,
                max: 1,
                value: 0.6,
                height: 200,
                width: 50,
                strokeColor: Color.white()
            });
            this.setAttributes({
                draggable: true,
                //outputs: ['value'],
                outputNames: ['value']
            });
            this.setAttributes({
                fillColor: argsDict['backgroundColor'] || Color.white()
            });
            this.outerBar = new Rectangle({
                width: this.width,
                height: this.height,
                fillColor: Color.black(),
                fillOpacity: 1,
                strokeColor: this.strokeColor
            });
            this.add(this.outerBar);
            this.filledBar = new Rectangle({
                width: this.width,
                height: this.normalizedValue() * this.height,
                fillColor: argsDict['fillColor'] || Color.gray(0.5)
            });
            this.add(this.filledBar);
            this.label = new TextLabel({ text: this.value.toString() });
            this.label.anchor = new Vertex(this.width / 2, this.height / 2);
            this.add(this.label);
            this.update();
        }
        normalizedValue() {
            return (this.value - this.min) / (this.max - this.min);
        }
        update(argsDict = {}, redraw = true) {
            super.update(argsDict, redraw = false);
            let a = this.normalizedValue();
            if (isNaN(a)) {
                return;
            }
            try {
                this.outerBar.update(argsDict);
                this.filledBar.anchor.y = this.height - this.filledBar.height;
                this.filledBar.update({ height: a * this.height });
                this.label.text = this.value.toPrecision(3).toString();
                this.label.anchor.copyFrom(new Vertex(this.width / 2, this.height / 2));
            }
            catch (_a) { }
            if (redraw) {
                this.redraw();
            }
        }
        selfHandlePointerDown(e) {
            this.scrubStartingPoint = pointerEventVertex(e);
            this.valueBeforeScrubbing = this.value;
        }
        selfHandlePointerMove(e) {
            let scrubVector = pointerEventVertex(e).subtract(this.scrubStartingPoint);
            this.value = this.valueBeforeScrubbing - scrubVector.y / this.height * (this.max - this.min);
            this.value = Math.max(Math.min(this.value, this.max), this.min);
            this.update();
        }
    }
    // export class Slider extends Mobject {
    //     constructor(min = -1, max = 1, value = 0, length = 100, orientation = 'horizontal') {
    //         super()
    //         this.min = min
    //         this.max = max
    //         this.value = value
    //         this.length = length
    //         this.orientation = orientation
    //         let start = Vertex.origin()
    //         let end = start
    //         if (orientation == 'horizontal') { end = start.translatedBy(length, 0) }
    //         else if (orientation == 'vertical') { end = start.translatedBy(0, -length) }
    //         this.line = new Line(start, end)
    //         this.line.strokeWidth = 1
    //         this.line.anchor = Vertex.origin()
    //         this.add(this.line)
    //         this.scrubber = new Polygon([
    //             new Vertex(0,0), new Vertex(10,-10), new Vertex(10,10)
    //         ])
    //         this.scrubber.anchor = this.valueToCoords(this.value)
    //         this.add(this.scrubber)
    //         if (orientation == 'horizontal') {
    //             this.scale = new Polygon([
    //                 new Vertex(0,0),
    //                 new Vertex(this.length,0),
    //                 new Vertex(this.length,-40),
    //                 new Vertex(0,-40),
    //             ])
    //         } else if (orientation == 'vertical') {
    //             this.scale = new Polygon([
    //                 new Vertex(0,0),
    //                 new Vertex(0,-this.length),
    //                 new Vertex(-40,-this.length),
    //                 new Vertex(-40,0),
    //             ])
    //         }
    //         this.scale.strokeColor = rgba(0,0,0,0)
    //         this.scale.fillColor = rgba(0,0,0,0.2)
    //         this.boundDragScaleStart = this.dragScaleStart.bind(this)
    //         this.boundDragScale = this.dragScale.bind(this)
    //         this.boundDragScaleEnd = this.dragScaleEnd.bind(this)
    //         this.scale.view.addEventListener('mousedown', this.boundDragScaleStart)
    //         this.updateScale()
    //         this.add(this.scale)
    //         this.boundScrubStart = this.scrubStart.bind(this)
    //         this.boundScrub = this.scrub.bind(this)
    //         this.boundScrubEnd = this.scrubEnd.bind(this)
    //         this.scrubber.view.addEventListener('mousedown', this.boundScrubStart)
    //     }
    //     scrubStart(e) {
    //         if (e.target != this.scrubber.path) { return }
    //         this.scrubber.view.removeEventListener('mousedown', this.boundScrubStart)
    //         paper.addEventListener('mousemove', this.boundScrub)
    //         paper.addEventListener('mouseup', this.boundScrubEnd)
    //         this.dragStartingPoint = new Vertex(e.x, e.y)
    //         this.oldScrubAnchor = new Vertex(this.scrubber.anchor)
    //         this.updateValue()
    //     }
    //     scrub(e) {
    //         let dragVector = new Vertex(e.x, e.y).subtract(this.dragStartingPoint)
    //         if (this.orientation == 'horizontal') {
    //             let newX = this.oldScrubAnchor.x + dragVector.x
    //             newX = Math.max(0, Math.min(this.length, newX))
    //             this.scrubber.anchor = new Vertex(newX, this.scrubber.anchor.y)
    //         } else if (this.orientation == 'vertical') {
    //             let newY = this.oldScrubAnchor.y + dragVector.y
    //             newY = Math.min(0, Math.max(-this.length, newY))
    //             this.scrubber.anchor = new Vertex(this.scrubber.anchor.x, newY)
    //         } else {
    //             console.log('Unknown orientation')
    //         }
    //         this.scrubber.redraw()
    //         this.updateValue()
    //     }
    //     scrubEnd(e) {
    //         paper.removeEventListener('mouseup', this.boundScrubEnd)
    //         paper.removeEventListener('mousemove', this.boundScrub)
    //         this.scrubber.view.addEventListener('mousedown', this.boundScrubStart)
    //         this.updateValue()
    //     }
    //     updateValue() {
    //         this.value = this.coordsToValue(this.scrubber.anchor)
    //     }
    //     valueToCoords(x) {
    //         let fraction = (x - this.min)/(this.max - this.min)
    //         if (this.orientation == 'horizontal') {
    //             return new Vertex(fraction * this.length, 0)
    //         } else if (this.orientation == 'vertical') {
    //             return new Vertex(0, -fraction * this.length)
    //         } else {
    //             console.log('Unknown orientation')
    //             return undefined
    //         }
    //     }
    //     coordsToValue(v) {
    //         let fraction = 0
    //         if (this.orientation == 'horizontal') {
    //             fraction = v.x/this.length
    //         } else if (this.orientation == 'vertical') {
    //             fraction = -v.y/this.length
    //         } else {
    //             console.log('Unknown orientation')
    //             return undefined
    //         }
    //         return (1 - fraction) * this.min + fraction * this.max
    //     }
    //     static tickValues(a, b) {
    //         //console.log('a', a, 'b', b)
    //         let n = Math.floor(Math.log10(b - a))
    //         //console.log('n', n)
    //         let m = 10**(Math.log10(b - a) - n) // mantissa, 1 <= m < 10
    //         //console.log('m', m)
    //         let unit = 0
    //         if (m < 2) { unit = 0.2 * 10**n }
    //         else if (m < 5) { unit = 0.5 * 10**n }
    //         else { unit = 10**n }
    //         //console.log('unit', unit)
    //         let ticks = new Array()
    //         //console.log('xmin', Math.ceil(a/unit)*unit)
    //         for (let x = Math.ceil(a/unit)*unit; x < b; x += unit) {
    //              ticks.push(x)
    //         }
    //         return ticks
    //     }
    //     updateScale() {
    //         for (let submob of this.scale.submobjects) {
    //             this.scale.remove(submob)
    //         }
    //         let values = Slider.tickValues(this.min, this.max)
    //         for (let value of values) {
    //             let location = this.valueToCoords(value)
    //             if (this.orientation == 'horizontal') {
    //                 location.translateBy(0, -25)
    //             } else if (this.orientation = 'vertical') {
    //                 location.translateBy(-25, 0)
    //             }
    //             let label = new TextLabel(value)
    //             label.view.setAttribute('class', 'TextLabel scaleLabel unselectable')
    //             label.anchor = location
    //             this.scale.add(label)
    //         }
    //     }
    //     dragScaleStart(e) {
    //         this.scale.dragStartingPoint = new Vertex(e.x, e.y)
    //         this.oldMin = this.min
    //         this.oldMax = this.max
    //         this.scale.view.removeEventListener('mousedown', this.boundDragScaleStart)
    //         this.scale.view.addEventListener('mousemove', this.boundDragScale)
    //         this.scale.view.addEventListener('mouseup', this.boundDragScaleEnd)
    //         e.stopPropagation()
    //     }
    //     dragScale(e) {
    //         let dragVector = new Vertex(e.x, e.y).subtract(this.scale.dragStartingPoint)
    //         let dvalue = 0
    //         if (this.orientation == 'horizontal') {
    //             let newX = this.scale.dragStartingPoint.x + dragVector.x
    //             newX = Math.max(0, Math.min(this.length, newX))
    //             let dx = newX - this.scale.dragStartingPoint.x
    //             dvalue = this.coordsToValue(new Vertex(newX, 0)) - this.coordsToValue(this.scale.dragStartingPoint)
    //         } else if (this.orientation == 'vertical') {
    //             let newY = this.scale.dragStartingPoint.y + dragVector.y
    //             newY = Math.max(0, Math.min(this.length, newY))
    //             let dy = newY - this.scale.dragStartingPoint.y
    //             dvalue = this.coordsToValue(new Vertex(0, newY)) - this.coordsToValue(this.scale.dragStartingPoint)
    //         } else {
    //             console.log('Unknown orientation')
    //         }
    //         this.min = this.oldMin - dvalue
    //         this.max = this.oldMax - dvalue
    //         this.scrubber.anchor = this.valueToCoords(this.value)
    //         this.scrubber.redraw()
    //         this.updateScale()
    //     }
    //     dragScaleEnd(e) {
    //         this.scale.view.addEventListener('mousedown', this.boundDragScaleStart)
    //         this.scale.view.removeEventListener('mousemove', this.boundDragScale)
    //         this.scale.view.removeEventListener('mouseup', this.boundDragScaleEnd)
    //         this.scale.dragStartingPoint = undefined
    //         this.oldMin = undefined
    //         this.oldMax = undefined
    //     }
    // }

    class CreatedBoxSlider extends CreatedMobject {
        constructor(argsDict) {
            super(argsDict);
            this.setAttributes({
                width: 50,
                height: 0,
                fillColor: Color.black()
            });
            this.setDefaults({ startPoint: Vertex.origin() });
            this.anchor = this.startPoint;
            this.protoSlider = new BoxSlider(argsDict);
            this.protoSlider.update({
                value: 0.5,
                width: this.width,
                height: 0,
                fillColor: Color.black()
            });
            this.protoSlider.filledBar.update({
                width: this.width,
                fillColor: Color.gray(0.5)
            });
            this.add(this.protoSlider);
        }
        updateFromTip(q) {
            this.update({
                fillColor: Color.black()
            });
            this.protoSlider.update({
                height: q.y - this.startPoint.y,
            });
            this.protoSlider.filledBar.update({
                fillColor: Color.gray(0.5)
            });
            this.redraw();
        }
        dissolveInto(superMobject) {
            superMobject.remove(this);
            superMobject.add(this.protoSlider);
            this.protoSlider.update({
                anchor: this.anchor
            });
            this.protoSlider.outerBar.update({ anchor: new Vertex(0, 0) });
            this.protoSlider.label.update({
                anchor: new Vertex(this.protoSlider.width / 2, this.protoSlider.height / 2)
            });
        }
    }

    class CreationGroup extends CreatedMobject {
        constructor(argsDict) {
            super(argsDict);
            this.creations = {};
            this.creations['freehand'] = new Freehand();
            this.creations['segment'] = new DrawnSegment({ startPoint: this.startPoint });
            this.creations['ray'] = new DrawnRay({ startPoint: this.startPoint });
            this.creations['line'] = new DrawnLine({ startPoint: this.startPoint });
            this.creations['circle'] = new DrawnCircle({ startPoint: this.startPoint });
            this.creations['cindy'] = new DrawnRectangle({ startPoint: this.startPoint });
            this.creations['slider'] = new CreatedBoxSlider({ startPoint: this.startPoint });
            this.setVisibleCreation(this.visibleCreation);
            for (let creation of Object.values(this.creations)) {
                this.add(creation);
            }
            this.update();
        }
        updateFromTip(q) {
            for (let creation of Object.values(this.creations)) {
                creation.updateFromTip(q);
            }
        }
        setVisibleCreation(visibleCreation) {
            for (let mob of Object.values(this.creations)) {
                mob.hide();
            }
            this.visibleCreation = visibleCreation;
            this.creations[visibleCreation].show();
            if (visibleCreation == 'cindy') {
                this.creations[visibleCreation].strokeColor = Color.white();
            }
        }
        dissolveInto(superMobject) {
            superMobject.remove(this);
            this.creations[this.visibleCreation].dissolveInto(superMobject);
            superMobject.updateIOList();
        }
    }

    class Paper extends LinkableMobject {
        constructor(argsDict = {}) {
            super(argsDict);
            this.children = [];
            this.cindys = [];
            this.setDragging(false);
            this.visibleCreation = 'freehand';
            this.cindyPorts = [];
            this.snappablePoints = [];
            this.geometricObjects = [];
            this.colorPalette = {
                'black': rgb(0, 0, 0),
                'white': rgb(1, 1, 1),
                'red': rgb(1, 0, 0),
                'orange': rgb(1, 0.5, 0),
                'yellow': rgb(1, 1, 0),
                'green': rgb(0, 1, 0),
                'blue': rgb(0, 0, 1),
                'indigo': rgb(0.5, 0, 1),
                'violet': rgb(1, 0, 1)
            };
            this.currentColor = this.colorPalette['white'];
        }
        changeColorByName(newColorName) {
            let newColor = this.colorPalette[newColorName];
            this.changeColor(newColor);
        }
        changeColorByHex(newColorHex) {
            let newColor = Color.fromHex(newColorHex);
            this.changeColor(newColor);
        }
        changeColor(newColor) {
            this.currentColor = newColor;
            if (this.creationGroup == undefined) {
                return;
            }
            this.creationGroup.strokeColor = this.currentColor;
            this.creationGroup.fillColor = this.currentColor;
            this.creationGroup.update();
        }
        setDragging(flag) {
            this.passAlongEvents = !flag;
            for (let c of this.cindys) {
                c.draggable = flag;
                c.view.style['pointer-events'] = (flag ? 'none' : 'auto');
            }
            if (flag) {
                this.selfHandlePointerDown = this.startDragging;
                this.selfHandlePointerMove = this.dragging;
                this.selfHandlePointerUp = this.endDragging;
            }
            else {
                this.selfHandlePointerDown = this.startCreating;
                this.selfHandlePointerMove = this.creativeMove;
                this.selfHandlePointerUp = this.endCreating;
            }
        }
        startDragging(e) {
            this.draggedMobject = this.eventTargetMobject(e);
            if (this.draggedMobject == this) {
                // check if we hit a CindyCanvas
                for (let c of this.cindys) {
                    let p = pointerEventVertex(e);
                    let p1 = (p.x > c.anchor.x);
                    let p2 = (p.y > c.anchor.y);
                    let p3 = (p.x < c.anchor.x + c.width);
                    let p4 = (p.y < c.anchor.y + c.height);
                    if (p1 && p2 && p3 && p4) {
                        this.draggedMobject = c;
                        break;
                    }
                }
            }
            if (this.draggedMobject == this || !this.draggedMobject.draggable) {
                this.draggedMobject = undefined;
                return;
            }
            this.dragPointStart = pointerEventVertex(e);
            this.dragAnchorStart = this.draggedMobject.anchor.copy();
            this.draggedIOList = undefined;
            if (this.dependencyMap == undefined) {
                return;
            }
            for (let ioList of this.dependencyMap.children) {
                if (ioList.mobject == this.draggedMobject) {
                    this.draggedIOList = ioList;
                    break;
                }
            }
            this.dragIOListAnchorStart = this.draggedIOList.anchor.copy();
        }
        dragging(e) {
            if (this.draggedMobject == undefined) {
                return;
            }
            let dragPoint = pointerEventVertex(e);
            let dr = dragPoint.subtract(this.dragPointStart);
            this.draggedMobject.anchor.copyFrom(this.dragAnchorStart.add(dr));
            if (this.draggedMobject instanceof CindyCanvas) {
                this.draggedMobject.view.style.left = this.draggedMobject.anchor.x + "px";
                this.draggedMobject.view.style.top = this.draggedMobject.anchor.y + "px";
            }
            this.draggedMobject.update();
            if (this.dependencyMap == undefined) {
                return;
            }
            this.draggedIOList.anchor.copyFrom(this.dragIOListAnchorStart.add(dr));
            this.draggedIOList.update();
            this.dependencyMap.update();
        }
        endDragging(e) {
            this.dragPointStart = undefined;
            this.dragAnchorStart = undefined;
            this.draggedMobject = undefined;
        }
        handleMessage(message) {
            if (message == undefined || message == {}) {
                return;
            }
            let key = Object.keys(message)[0];
            let value = Object.values(message)[0];
            if (value == "true") {
                value = true;
            }
            if (value == "false") {
                value = false;
            }
            switch (key) {
                case 'creating':
                    this.changeVisibleCreation(value);
                    if (value == 'freehand') {
                        this.passAlongEvents = true;
                        break;
                    }
                    if (this.creationGroup == undefined) {
                        this.passAlongEvents = false;
                    }
                    break;
                case 'color':
                    this.changeColorByHex(value);
                    break;
                case 'drag':
                    this.setDragging(value);
                    break;
                case 'toggleLinks':
                    if (value == 1 || value == '1') {
                        this.showAllLinks();
                    }
                    else {
                        this.hideAllLinks();
                    }
                    break;
            }
        }
        changeVisibleCreation(newVisibleCreation) {
            this.visibleCreation = newVisibleCreation;
            if (this.creationGroup != undefined) {
                this.creationGroup.setVisibleCreation(newVisibleCreation);
            }
        }
        startCreating(e) {
            this.creationStartPoint = pointerEventVertex(e);
            for (let fp of this.snappablePoints) {
                if (this.creationStartPoint.subtract(fp.midPoint).norm() < 10) {
                    this.creationStartPoint = fp.midPoint;
                }
            }
            this.creationGroup = new CreationGroup({
                startPoint: this.creationStartPoint,
                visibleCreation: this.visibleCreation
            });
            this.creationGroup.strokeColor = this.currentColor;
            this.creationGroup.fillColor = this.currentColor;
            this.add(this.creationGroup);
            this.changeVisibleCreation(this.visibleCreation);
        }
        arrowCircleIntersections(arrow, circle) {
            let A = arrow.startPoint;
            let B = arrow.endPoint;
            let C = circle.midPoint;
            let r = circle.radius;
            let a = A.subtract(B).norm2();
            let b = -2 * A.subtract(B).dot(B.add(C));
            let c = B.add(C).norm2() - r ** 2;
            let d = b ** 2 - 4 * a * c;
            if (d >= 0) {
                let l1 = (-b - d ** 0.5) / (2 * a);
                let l2 = (-b + d ** 0.5) / (2 * a);
                let P1 = A.multiply(l1).add(B.multiply(1 - l1));
                let P2 = A.multiply(l2).add(B.multiply(1 - l2));
                let intersections = [P1, P2];
                if (A instanceof Segment) {
                    if (l1 < 0 || l1 > 1) {
                        P1 = new Vertex(NaN, NaN);
                    }
                    if (l2 < 0 || l2 > 1) {
                        P2 = new Vertex(NaN, NaN);
                    }
                }
                else if (A instanceof Ray) {
                    if (l1 < 0) {
                        P1 = new Vertex(NaN, NaN);
                    }
                    if (l2 < 0) {
                        P2 = new Vertex(NaN, NaN);
                    }
                }
                return intersections;
            }
            else {
                let P1 = new Vertex(NaN, NaN);
                let P2 = new Vertex(NaN, NaN);
                return [P1, P2];
            }
        }
        creativeMove(e) {
            let p = pointerEventVertex(e);
            for (let fq of this.snappablePoints) {
                let q = fq.anchor;
                if (p.subtract(q).norm() < 10) {
                    p = q;
                    break;
                }
            }
            this.creationGroup.updateFromTip(p);
        }
        endCreating(e) {
            this.creationGroup.dissolveInto(this);
            if (this.creationGroup.visibleCreation == 'segment') {
                console.log('segment');
                let segment = this.creationGroup.creations['segment'].segment;
                for (let geomob of this.geometricObjects) {
                    console.log('some object');
                    if (geomob instanceof Circle) {
                        let arr = this.arrowCircleIntersections(segment, geomob);
                        let p1 = new Point({ midPoint: arr[0], fillOpacity: 0.2 });
                        let p2 = new Point({ midPoint: arr[1], fillOpacity: 0.2 });
                        this.add(p1);
                        this.add(p2);
                    }
                }
            }
            this.remove(this.creationGroup);
            this.creationGroup = undefined;
        }
        addCindy(cindyCanvas) {
            // document.querySelector('#paper-container').insertBefore(
            // 	cindyCanvas.view, document.querySelector('#paper-console')
            // )
            // document.body.appendChild(cindyCanvas.script)
            this.cindys.push(cindyCanvas);
        }
        removeCindy(cindyCanvas) {
            cindyCanvas.view.remove();
            cindyCanvas.initScript.remove();
            cindyCanvas.drawScript.remove();
        }
        addFreePoint(fp) {
            this.snappablePoints.push(fp);
            super.add(fp);
        }
        removeFreePoint(fp) {
            remove(this.snappablePoints, fp);
            super.remove(fp);
        }
        add(mobject) {
            if (mobject instanceof CindyCanvas) {
                this.addCindy(mobject);
            }
            else if (mobject instanceof FreePoint) {
                this.addFreePoint(mobject);
            }
            else {
                super.add(mobject);
            }
            if (mobject instanceof Segment || mobject instanceof Ray || mobject instanceof Line || mobject instanceof TwoPointCircle) {
                this.geometricObjects.push(mobject);
            }
        }
        remove(mobject) {
            if (mobject instanceof CindyCanvas) {
                this.removeCindy(mobject);
            }
            else if (mobject instanceof FreePoint) {
                this.removeFreePoint(mobject);
            }
            else {
                super.remove(mobject);
            }
        }
        showAllLinks() {
            this.showLinksOfSubmobs();
        }
        hideAllLinks() {
            this.hideLinksOfSubmobs();
        }
        callCindyJS(argsDict) {
            return CindyJS(argsDict);
        }
        redraw() {
            this.redrawSubmobs();
        }
    }
    const paper = new Paper({ view: document.querySelector('#paper'), passAlongEvents: true });
    // let c = new Circle({anchor: new Vertex(100, 100), radius: 25})
    // c.anchor = new Vertex(300, 400)
    // c.fillColor = Color.violet()
    // c.redraw()
    //paper.add(c)
    // let t = new TextLabel({
    // 	text: "blablub",
    // 	anchor: new Vertex(100, 100),
    // 	color: Color.red()	
    // })
    // paper.add(t)
    // let s = new Segment({
    // 	startPoint: new Vertex(100, 100),
    // 	endPoint: new Vertex(200, 300)
    // })
    // paper.add(s)
    let m = new MGroup();
    let c = new Circle({ anchor: new Vertex(100, 100), radius: 75 });
    let r = new Rectangle({
        anchor: new Vertex(0, 0),
        width: 50,
        height: 50,
        fillColor: Color.green()
    });
    m.add(c);
    m.add(r);
    paper.add(m);

    exports.Paper = Paper;
    exports.paper = paper;

    return exports;

}({}));
