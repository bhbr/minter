import { Vertex } from './transform.js';
import { Color, Mobject, MGroup, TextLabel } from './mobject.js';
import { Circle, RoundedRectangle } from './shapes.js';
import { pointerEventVertex, paperLog } from './helpers.js';
import { CreatedMobject } from './creating.js';
import { Segment } from './arrows.js';
const BULLET_SIZE = 10;
const SNAPPING_DISTANCE = 10;
export class LinkBullet extends Circle {
    constructor(argsDict) {
        super(argsDict);
        this.setAttributes({
            radius: BULLET_SIZE,
            fillOpacity: 0,
            strokeColor: Color.white()
        });
    }
}
export class InputList extends RoundedRectangle {
    constructor(argsDict) {
        super(argsDict);
        this.setDefaults({ listInputNames: [] });
        this.setAttributes({
            cornerRadius: 20,
            fillColor: Color.white(),
            fillOpacity: 0.1,
            strokeWidth: 0,
            width: 150,
            height: this.getHeight()
        });
        this.redraw();
        this.bulletLocationDict = {};
        for (let i = 0; i < this.listInputNames.length; i++) {
            let name = this.listInputNames[i];
            let c = new LinkBullet({ mobject: this.mobject, inputName: name });
            let t = new TextLabel({
                text: name,
                textAnchor: 'left',
                textAlign: 'left'
            });
            c.anchor = new Vertex([40, 3 + 25 * (i + 1)]);
            t.anchor = c.anchor.translatedBy(15, 0);
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
export class OutputList extends RoundedRectangle {
    constructor(argsDict) {
        super(argsDict);
        this.setDefaults({ listOutputNames: [] });
        this.setAttributes({
            cornerRadius: 20,
            fillColor: Color.white(),
            fillOpacity: 0.3,
            strokeWidth: 0,
            width: 150,
            height: this.getHeight()
        });
        this.redraw();
        this.bulletLocationDict = {};
        for (let i = 0; i < this.listOutputNames.length; i++) {
            let name = this.listOutputNames[i];
            let c = new LinkBullet({ mobject: this.mobject, outputName: name });
            let t = new TextLabel({
                text: name,
                textAnchor: 'left',
                textAlign: 'left'
            });
            c.anchor = new Vertex([40, 3 + 25 * (i + 1)]);
            t.anchor = c.anchor.translatedBy(15, 0);
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
export class IOList extends MGroup {
    constructor(argsDict) {
        super(argsDict);
        this.inputList = new InputList(argsDict);
        this.outputList = new OutputList(argsDict);
        this.add(this.inputList);
        this.add(this.outputList);
        // positioning is handled by parent
    }
}
export class DependencyMap extends MGroup {
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
        let tl = null;
        if (tcircle.constructor.name == 'Circle') {
            // actually this is the Circle that we dragged, not the LinkBullet we snapped it to
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
        }
        else {
            tl = tcircle;
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
            if (p.closeTo(loc, SNAPPING_DISTANCE)) {
                return loc;
            }
        }
        return p;
    }
    snapOutput(p) {
        for (let [loc, mobject, outputName] of this.outputLocations()) {
            if (p.closeTo(loc, SNAPPING_DISTANCE)) {
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
            if (p.closeTo(loc, SNAPPING_DISTANCE)) {
                return [mobject, inputName];
            }
        }
        return [null, null];
    }
    getOutputFromVertex(p) {
        for (let [loc, mobject, outputName] of this.outputLocations()) {
            if (p.closeTo(loc, SNAPPING_DISTANCE)) {
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
export class LinkLine extends CreatedMobject {
    constructor(argsDict) {
        super(argsDict);
        this.endPoint = this.startPoint.copy();
        this.startBullet = new Circle({
            radius: BULLET_SIZE - 2,
            fillOpacity: 1,
            anchor: this.startPoint
        });
        this.line = new Segment({
            startPoint: this.startPoint,
            endPoint: this.startPoint.copy(),
            strokeWidth: 3
        });
        this.endBullet = new Circle({
            radius: BULLET_SIZE - 2,
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
        paperLog('dissolving LinkLine');
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
    update(argsDict = {}, redraw = true) {
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
export class LinkableMobject extends Mobject {
    constructor(argsDict = {}) {
        super();
        this.setDefaults({
            inputNames: [],
            outputNames: [] // linkable parameters
        });
        this.update(argsDict);
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
