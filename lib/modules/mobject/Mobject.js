import { remove, deepCopy } from '../helpers/helpers.js';
import { ScreenEventHandler, eventVertex, addPointerDown, addPointerMove, addPointerUp, screenEventType, ScreenEventType, isTouchDevice } from './screen_events.js';
import { Vertex } from '../helpers/Vertex.js';
import { Transform } from '../helpers/Transform.js';
import { ExtendedObject } from '../helpers/ExtendedObject.js';
import { Color } from '../helpers/Color.js';
import { Dependency } from './Dependency.js';
import { VertexArray } from '../helpers/VertexArray.js';
export const DRAW_BORDER = false;
export class Mobject extends ExtendedObject {
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
        let oldAnchor = this.anchor.copy();
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
//# sourceMappingURL=Mobject.js.map