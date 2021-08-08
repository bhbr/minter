import { Vertex, Transform } from './vertex-transform.js';
import { Color } from './color.js';
import { Dependency } from './dependency.js';
import { ExtendedObject } from './extended-object.js';
import { remove, stringFromPoint, pointerEventVertex } from './helpers.js';
import { addPointerDown, removePointerDown } from './helpers.js';
import { addPointerMove, removePointerMove } from './helpers.js';
import { addPointerUp, removePointerUp } from './helpers.js';
import { DRAW_BORDER, EVENT_LOGGING } from './helpers.js';
import { xMin, xMax, yMin, yMax, midX, midY } from './helpers.js';
export class Mobject extends ExtendedObject {
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
        if (EVENT_LOGGING) {
            console.log('event target on ', this, 'is', this.eventTarget);
        }
        if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
            if (EVENT_LOGGING) {
                console.log('passing on');
            }
            this.eventTarget.pointerDown(e);
        }
        else {
            if (EVENT_LOGGING) {
                console.log(`handling myself, and I am a ${this.constructor.name}`);
            }
            this.selfHandlePointerDown(e);
        }
    }
    pointerMove(e) {
        if (EVENT_LOGGING) {
            console.log(this, "event target:", this.eventTarget);
        }
        if (this.eventTarget.vetoOnStopPropagation) {
            return;
        }
        e.stopPropagation();
        if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
            if (EVENT_LOGGING) {
                console.log("passing on");
            }
            this.eventTarget.pointerMove(e);
        }
        else {
            if (EVENT_LOGGING) {
                console.log(`handling myself, and I am a ${this.constructor.name}`);
            }
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
export class MGroup extends Mobject {
    setup() {
        super.setup();
        // children may have been set as a constructor args
        for (let submob of this.children) {
            this.add(submob);
        }
    }
}
export class VMobject extends Mobject {
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
export class Polygon extends VMobject {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.closed = true;
        if (!superCall) {
            this.setup();
            this.update(args);
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
export class TextLabel extends Mobject {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.text = 'text';
        this.horizontalAlign = 'center'; // 'left' | 'center' | 'right'
        this.verticalAlign = 'center'; // 'top' | 'center' | 'bottom'
        this.color = Color.white();
        this.fontSize = 10;
        this.fontFamily = 'Helvetica';
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.view.setAttribute('class', this.constructor.name + ' unselectable mobject-div');
        this.view.style.display = 'flex';
        this.view.style.fontFamily = this.fontFamily;
    }
    redrawSelf() {
        super.redrawSelf();
        this.view.style.fontSize = `${this.fontSize}px`;
        this.view.innerHTML = this.text;
        this.view.style.color = this.color.toHex();
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