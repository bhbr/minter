import { Vertex, Transform } from './vertex-transform.js';
import { Color } from './color.js';
import { Dependency } from './dependency.js';
import { Frame } from './frame.js';
import { remove, stringFromPoint, pointerEventVertex, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp } from './helpers.js';
export class Mobject extends Frame {
    constructor(argsDict = {}) {
        super();
        this.vertices = [];
        this.children = [];
        this.dependencies = [];
        this.snappablePoints = []; // workaround, don't ask
        this.drawBorder = false;
        this.eventTarget = null;
        let defaults = {
            transform: Transform.identity(),
            anchor: Vertex.origin(),
            viewWidth: 100,
            viewHeight: 100,
            vertices: [],
            children: [],
            dependencies: [],
            fillColor: Color.white(),
            fillOpacity: 1,
            strokeColor: Color.white(),
            strokeWidth: 1,
            passAlongEvents: false,
            visible: true,
            draggable: true // by outside forces, that is
        };
        this.update(defaults, false);
        if (argsDict['view'] == undefined) {
            let defaultView = document.createElement('div');
            this.setView(defaultView); // placeholder
        }
        else {
            this.setView(argsDict['view']);
        }
        this.update(argsDict, false);
        //this.show()
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
        this.positionView();
        this.update();
    }
    //boundUpdate: (argsDict: object, redraw: boolean) => ()
    get opacity() { return this.fillOpacity; }
    set opacity(newValue) { this.fillOpacity = newValue; }
    setView(newView) {
        if (newView === this.view) {
            return;
        }
        if (this.view && this.view.parentNode) {
            this.view.parentNode.removeChild(this.view);
        }
        if (this.view) {
            removePointerDown(this.view, this.boundPointerDown);
        }
        this.view = newView;
        this.view['mobject'] = this;
        if (this.superMobject) {
            this.superMobject.view.appendChild(this.view);
        }
        addPointerDown(this.view, this.boundPointerDown);
        this.positionView();
        this.view.setAttribute('class', 'mobject-div ' + this.constructor.name);
        this.view.style.position = 'absolute'; // 'absolute' positions it relative (sic) to tits parent
        this.view.style.overflow = 'visible';
        if (this.drawBorder) {
            this.view.style.borderColor = Color.green().toCSS();
            this.view.style.borderWidth = "1px";
            this.view.style.borderStyle = "dashed";
        }
    }
    positionView() {
        if (!this.view || !this.anchor) {
            return;
        }
        this.view.style['width'] = this.viewWidth.toString() + 'px';
        this.view.style['height'] = this.viewHeight.toString() + 'px';
        this.view.style['left'] = this.anchor.x.toString() + 'px';
        this.view.style['top'] = this.anchor.y.toString() + 'px';
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
                //console.log(t, t['mobject'])
                return t['mobject'];
            }
            t = targetViewChain.pop();
        }
        // if all of this fails, you need to handle the event yourself
        return this;
    }
    pointerDown(e) {
        console.log('pointerDown on', this);
        e.stopPropagation();
        removePointerDown(this.view, this.boundPointerDown);
        addPointerMove(this.view, this.boundPointerMove);
        addPointerUp(this.view, this.boundPointerUp);
        this.eventTarget = this.boundEventTargetMobject(e);
        console.log('event target on ', this, 'is', this.eventTarget);
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
    update(argsDict = {}, redraw = true) {
        if (argsDict['view']) {
            this.setView(argsDict['view']);
            delete argsDict['view'];
        }
        this.setAttributes(argsDict);
        this.transform.anchor = this.anchor;
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
        if (this.view && redraw) {
            this.positionView();
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
        if (!this.anchor) {
            return;
        }
        if (this.anchor.isNaN()) {
            return;
        }
        this.redrawSubmobs();
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
    // empty method as workaround (don't ask)
    removeFreePoint(fp) { }
    relativeTransform(frame) {
        if (!frame) {
            return this.transform;
        }
        let mob = this;
        let t = this.transform;
        while (mob != frame) {
            mob = mob.parent;
            t.rightComposeWith(mob.transform);
        }
        return t;
    }
    localXMin() { return 0; }
    localXMax() { return this.viewWidth; }
    localYMin() { return 0; }
    localYMax() { return this.viewHeight; }
    localMidX() { return (this.localXMin() + this.localXMax()) / 2; }
    localMidY() { return (this.localYMin() + this.localYMax()) / 2; }
    localULCorner() { return new Vertex(this.localXMin(), this.localYMin()); }
    localURCorner() { return new Vertex(this.localXMax(), this.localYMin()); }
    localLLCorner() { return new Vertex(this.localXMin(), this.localYMax()); }
    localLRCorner() { return new Vertex(this.localXMax(), this.localYMax()); }
    localLeftCenter() { return new Vertex(this.localXMin(), this.localMidY()); }
    localRightCenter() { return new Vertex(this.localXMax(), this.localMidY()); }
    localTopCenter() { return new Vertex(this.localMidX(), this.localYMin()); }
    localBottomCenter() { return new Vertex(this.localMidX(), this.localYMax()); }
    localCenter() { return new Vertex(this.localMidX(), this.localMidY()); }
}
export class MGroup extends Mobject {
    constructor(argsDict = {}) {
        super();
        for (let submob of this.children) {
            this.add(submob);
        }
        this.update(argsDict);
    }
}
export class VMobject extends Mobject {
    constructor(argsDict = {}) {
        super();
        this.vertices = [];
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.svg['mobject'] = this;
        this.path['mobject'] = this;
        this.view.appendChild(this.svg); // why not just add?
        this.svg.appendChild(this.path);
        this.view.setAttribute('class', this.constructor.name + " mobject-div");
        this.svg.setAttribute('class', "mobject-svg");
        this.svg.style.overflow = 'visible';
        this.setAttributes({
            fillColor: Color.white(),
            fillOpacity: 0.5,
            strokeColor: Color.white(),
            strokeWidth: 1
        });
        this.update(argsDict);
    }
    redraw() {
        if (!this.anchor || this.anchor.isNaN()) {
            return;
        }
        this.positionView();
        if (this.path == undefined) {
            return;
        }
        let pathString = this.pathString();
        if (pathString.includes("NaN")) {
            return;
        }
        this.path.setAttribute('d', pathString);
        try {
            this.path.style['fill'] = this.fillColor.toHex();
            this.path.style['fill-opacity'] = this.fillOpacity.toString();
            this.path.style['stroke'] = this.strokeColor.toHex();
            this.path.style['stroke-width'] = this.strokeWidth.toString();
            this.redrawSubmobs();
        }
        catch (_a) { }
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
}
export class Polygon extends VMobject {
    constructor() {
        super(...arguments);
        this.closed = true;
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
    updateBezierPoints() { }
    // implemented by subclasses
    update(argsDict = {}, redraw = true) {
        super.update(argsDict, redraw);
        this.updateBezierPoints();
    }
    // globalBezierPoints(): Array<Vertex> {
    // 	return this.globalTransform().appliedTo(this.bezierPoints)
    // }
    redraw() {
        this.updateBezierPoints();
        super.redraw();
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
        this.setAttributes({
            text: '',
            textAnchor: 'middle',
            textAlign: 'center',
            color: Color.white()
        });
        this.view.setAttribute('class', this.constructor.name + ' unselectable');
        this.view.setAttribute('x', '0');
        this.view.setAttribute('y', '0');
        this.textView = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.textView['mobject'] = this;
        this.textView.setAttribute('alignment-baseline', 'middle');
        this.textView.setAttribute('font-family', 'Helvetica');
        this.textView.setAttribute('font-size', '12');
        this.textView.setAttribute('stroke-width', '0');
        this.update(argsDict);
    }
    redraw() {
        if (this.anchor.isNaN()) {
            return;
        }
        if (this.color == undefined) {
            this.color = Color.white();
        }
        if (this.textView) {
            this.textView.textContent = this.text;
        }
        if (this.view) {
            //this.view.setAttribute('x', this.globalTransform().e.toString())
            //this.view.setAttribute('y', this.globalTransform().f.toString())
            this.view.setAttribute('x', this.anchor.toString());
            this.view.setAttribute('y', this.anchor.toString());
            this.view.setAttribute('fill', this.color.toHex());
            this.view.setAttribute('stroke', this.color.toHex());
        }
        this.redrawSubmobs();
    }
    update(argsDict = {}, redraw = true) {
        if (this.textView) {
            this.textView.setAttribute('text-anchor', this.textAnchor);
            this.textView.setAttribute('text-align', this.textAlign);
        }
        super.update(argsDict, redraw);
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
