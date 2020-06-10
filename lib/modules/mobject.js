import { Vertex, Transform } from './transform.js';
import { remove, stringFromPoint, pointerEventVertex, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp } from './helpers.js';
export class Dependency {
    constructor(argsDict = {}) {
        this.source = argsDict['source'];
        this.outputName = argsDict['outputName']; // may be undefined
        this.target = argsDict['target'];
        this.inputName = argsDict['inputName']; // may be undefined
    }
}
export class Color {
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
export class Mobject {
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
        this._anchor = newValue;
        this.transform.anchorAt(newValue);
        this.update();
    }
    moveAnchorTo(newAnchor) {
        this.anchor.copyFrom(newAnchor);
    }
    setView(newView) {
        if (this.view.parentNode) {
            this.view.parentNode.removeChild(this.view);
        }
        this.view = newView;
        this.view['mobject'] = this;
        if (this.superMobject) {
            this.superMobject.view.appendChild(this.view);
        }
        addPointerDown(this.view, this.boundPointerDown);
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
        // if all of this fails, you need to handle the event yourself
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
        if (argsDict['view']) {
            this.setView(argsDict['view']);
            delete argsDict['view'];
        }
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
            if (!this.dependsOn(submob)) { // prevent dependency loops
                submob.update({}, false);
            }
        }
    }
    redrawSubmobs() {
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
        if (this instanceof MGroup) {
        }
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
export class MGroup extends Mobject {
    constructor(argsDict = {}) {
        super();
        for (let submob of this.children) {
            this.add(submob);
        }
        this.update(argsDict);
    }
    redraw() {
        this.redrawSubmobs();
    }
}
export class VMobject extends Mobject {
    constructor(argsDict = {}) {
        super();
        this.vertices = [];
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
        console.warn('please subclass pathString');
        return '';
    }
}
export class Polygon extends VMobject {
    pathString() {
        let pathString = '';
        for (let point of this.globalVertices()) {
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
export class CurvedShape extends VMobject {
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
export class TextLabel extends Mobject {
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
