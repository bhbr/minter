import { Vertex, Transform } from './vertex-transform.js';
import { Color } from './color.js';
import { Dependency } from './dependency.js';
import { ExtendedObject } from './extended-object.js';
import { remove, stringFromPoint, pointerEventVertex, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, DRAW_BORDER } from './helpers.js';
export class Mobject extends ExtendedObject {
    constructor(argsDict = {}) {
        super();
        //// defaults
        let initialArgs = {
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
            snappablePoints: []
        };
        Object.assign(initialArgs, argsDict);
        //// state-independent setup
        this.setView(document.createElement('div'));
        this.eventTarget = null;
        this.boundPointerDown = this.pointerDown.bind(this);
        this.boundPointerMove = this.pointerMove.bind(this);
        this.boundPointerUp = this.pointerUp.bind(this);
        this.boundEventTargetMobject = this.eventTargetMobject.bind(this);
        addPointerDown(this.view, this.boundPointerDown);
        //this.boundUpdate = this.update.bind(this)
        this.savedSelfHandlePointerDown = this.selfHandlePointerDown;
        this.savedSelfHandlePointerMove = this.selfHandlePointerMove;
        this.savedSelfHandlePointerUp = this.selfHandlePointerUp;
        this.disableDragging();
        // this.boundCreatePopover = this.createPopover.bind(this)
        // this.boundDismissPopover = this.dismissPopover.bind(this)
        // this.boundMouseUpAfterCreatingPopover = this.mouseUpAfterCreatingPopover.bind(this)
        //// updating
        if (this.constructor.name == 'Mobject') {
            this.update(initialArgs);
        }
        else {
            this.setAttributes(initialArgs);
        }
        //// no state-dependent setup
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
    viewBottomCenter(frame) { return new Vertex(this.viewMidX(frame), this.viewYMin(frame)); }
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
    // get opacity(): number { return this._opacity }
    // set opacity(newValue: number) {
    // 	this._opacity = newValue
    // 	if (this.view) {
    // 		this.view.style.opacity = `${newValue}`
    // 	}
    // }
    // get backgroundColor(): Color { return this._backgroundColor }
    // set backgroundColor(newValue: Color) {
    // 	this._backgroundColor = newValue
    // 	this.view.style.backgroundColor = newValue.toHex()
    // }
    setView(newView) {
        var _a, _b;
        if (newView === this.view) {
            return;
        }
        (_b = (_a = this.view) === null || _a === void 0 ? void 0 : _a.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(this.view);
        if (this.view) {
            removePointerDown(this.view, this.boundPointerDown);
        }
        this.view = newView;
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
    getPaper() {
        let p = this;
        while (p != undefined && p.constructor.name != 'Paper') {
            p = p.parent;
        }
        return p;
    }
    show() {
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
    hide() {
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
    update(argsDict = {}, redraw = true) {
        // a new view should be set before anything else
        if (argsDict['view']) {
            this.setView(argsDict['view']);
            delete argsDict['view'];
        }
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
        if (this.constructor.name == 'Mobject' && redraw) {
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
        //console.log('event target on ', this, 'is', this.eventTarget)
        if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
            //console.log('passing on')
            this.eventTarget.pointerDown(e);
        }
        else {
            //console.log(`handling myself, and I am a ${this.constructor.name}`)
            this.selfHandlePointerDown(e);
        }
    }
    pointerMove(e) {
        //console.log("event target:", this.eventTarget)
        if (this.eventTarget.vetoOnStopPropagation) {
            return;
        }
        e.stopPropagation();
        if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
            //console.log("here?")
            this.eventTarget.pointerMove(e);
        }
        else {
            //console.log("or here?")
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
export class MGroup extends Mobject {
    constructor(argsDict = {}) {
        super();
        if (this.constructor.name == 'MGroup') {
            this.update(argsDict);
        }
        else {
            this.setAttributes(argsDict);
        }
        // children may have been set as a constructor args
        for (let submob of this.children) {
            this.add(submob);
        }
    }
    update(argsDict = {}, redraw = true) {
        super.update(argsDict, false);
        if (this.constructor.name == 'MGroup' && redraw) {
            this.redraw();
        }
    }
}
export class VMobject extends Mobject {
    constructor(argsDict = {}) {
        super();
        //// defaults
        let initialArgs = {
            fillColor: Color.white(),
            fillOpacity: 0,
            strokeColor: Color.white(),
            strokeWidth: 1,
        };
        Object.assign(initialArgs, argsDict);
        //// state-independent setup
        this.vertices = [];
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.svg['mobject'] = this;
        this.path['mobject'] = this;
        this.view.appendChild(this.svg); // why not just add?
        this.svg.appendChild(this.path);
        this.view.setAttribute('class', this.constructor.name + ' mobject-div');
        this.svg.setAttribute('class', 'mobject-svg');
        this.svg.style.overflow = 'visible';
        //// updating
        if (this.constructor.name == 'VMobject') {
            this.update(initialArgs);
        }
        else {
            this.setAttributes(initialArgs);
        }
        //// no state-dependent setup
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
    localULCorner() {
        return new Vertex(this.localXMin(), this.localYMin());
    }
    getWidth() { return this.localXMax() - this.localXMin(); }
    getHeight() { return this.localYMax() - this.localYMin(); }
    update(argsDict = {}, redraw = true) {
        super.update(argsDict, false);
        if (this.constructor.name == 'VMobject' && redraw) {
            this.redraw();
        }
    }
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
export class Polygon extends VMobject {
    constructor(argsDict = {}) {
        super();
        this.closed = true;
        if (this.constructor.name == 'Polygon') {
            this.update(argsDict);
        }
        else {
            this.setAttributes(argsDict);
        }
    }
    pathString() {
        let pathString = '';
        //let v = this.globalVertices()
        let v = this.vertices;
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
        if (this.closed) {
            pathString += 'Z';
        }
        return pathString;
    }
}
export class CurvedShape extends VMobject {
    constructor(argsDict = {}) {
        super();
        if (this.constructor.name == 'CurvedShape') {
            this.update(argsDict);
        }
        else {
            this.setAttributes(argsDict);
        }
    }
    updateBezierPoints() { }
    // implemented by subclasses
    update(argsDict = {}, redraw = true) {
        super.update(argsDict, redraw);
        this.updateBezierPoints();
    }
    // globalBezierPoints(): Array<Vertex> {
    // 	return this.globalTransform().appliedTo(this.bezierPoints)
    // }
    redrawSelf() {
        this.updateBezierPoints();
        super.redrawSelf();
    }
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
export class TextLabel extends Mobject {
    constructor(argsDict = {}) {
        super();
        let initialArgs = {
            text: 'text',
            horizontalAlign: 'center',
            verticalAlign: 'center',
            color: Color.white()
        };
        Object.assign(initialArgs, argsDict);
        //// state-independent setup
        this.view.setAttribute('class', this.constructor.name + ' unselectable mobject-div');
        this.view.style.display = 'flex';
        this.view.style.fontFamily = 'Helvetica';
        this.view.style.fontSize = '10px';
        //// updating
        if (this.constructor.name == 'TextLabel') {
            this.update(initialArgs);
        }
        else {
            this.setAttributes(initialArgs);
        }
    }
    redrawSelf() {
        if (this.anchor.isNaN()) {
            return;
        }
        if (this.color == undefined) {
            this.color = Color.white();
        }
    }
    update(argsDict = {}, redraw = true) {
        var _a;
        super.update(argsDict, false);
        //// internal dependencies
        this.view.innerHTML = this.text;
        this.view.style.color = ((_a = this.color) !== null && _a !== void 0 ? _a : Color.white()).toHex();
        switch (this.verticalAlign) {
            case 'top':
                this.view.style.alignItems = 'flex-start';
                break;
            case 'center':
                this.view.style.alignItems = 'center';
                break;
            case 'bottom':
                console.log('here');
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
        if (this.constructor.name == 'TextLabel' && redraw) {
            this.redraw();
        }
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
//# sourceMappingURL=mobject.js.map