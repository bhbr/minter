import { Vertex } from './vertex-transform.js';
import { Mobject, MGroup, TextLabel } from './mobject.js';
import { Color } from './color.js';
import { Circle, RoundedRectangle } from './shapes.js';
import { pointerEventVertex, paperLog } from './helpers.js';
import { CreatedMobject } from './creating.js';
import { Segment } from './arrows.js';
const BULLET_SIZE = 10;
const SNAPPING_DISTANCE = 10;
export class LinkHook extends Circle {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            radius: BULLET_SIZE,
            fillOpacity: 0,
            strokeColor: Color.white()
        });
    }
}
export class InputList extends RoundedRectangle {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            listInputNames: [],
            hookLocationDict: {},
            cornerRadius: 20,
            fillColor: Color.white(),
            fillOpacity: 0.2,
            strokeWidth: 0,
            width: 150
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.createHookList();
        this.update({ height: this.getHeight() }, false);
    }
    createHookList() {
        for (let i = 0; i < this.listInputNames.length; i++) {
            let name = this.listInputNames[i];
            let c = new LinkHook({ mobject: this.mobject, inputName: name });
            let t = new TextLabel({
                text: name,
                horizontalAlign: 'left',
                verticalAlign: 'center',
                viewHeight: 20,
                viewWidth: 100
            });
            this.add(c);
            this.add(t);
            c.update({ anchor: new Vertex([15, -10 + 25 * (i + 1)]) });
            t.update({ anchor: c.anchor.translatedBy(25, 0) });
            this.hookLocationDict[name] = c.parent.transformLocalPoint(c.midpoint, t.getPaper());
        }
    }
    getHeight() {
        if (this.listInputNames == undefined) {
            return 0;
        }
        if (this.listInputNames.length == 0) {
            return 0;
        }
        else {
            return 40 + 25 * this.listInputNames.length;
        }
    }
    updateModel(argsDict = {}) {
        argsDict['height'] = this.getHeight();
        super.updateModel(argsDict);
    }
}
export class OutputList extends RoundedRectangle {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            listOutputNames: [],
            hookLocationDict: {},
            cornerRadius: 20,
            fillColor: Color.white(),
            fillOpacity: 0.3,
            strokeWidth: 0,
            width: 150
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.createHookList();
        this.update({ height: this.getHeight() }, false);
    }
    getHeight() {
        if (this.listOutputNames == undefined) {
            return 0;
        }
        if (this.listOutputNames.length == 0) {
            return 0;
        }
        else {
            return 40 + 25 * this.listOutputNames.length;
        }
    }
    createHookList() {
        for (let i = 0; i < this.listOutputNames.length; i++) {
            let name = this.listOutputNames[i];
            let c = new LinkHook({ mobject: this.mobject, outputName: name });
            let t = new TextLabel({
                text: name,
                horizontalAlign: 'left',
                verticalAlign: 'center',
                viewHeight: 20,
                viewWidth: 100
            });
            this.hookLocationDict[name] = c.anchor;
            this.add(c);
            this.add(t);
            c.update({ anchor: new Vertex([15, -10 + 25 * (i + 1)]) });
            t.update({ anchor: c.anchor.translatedBy(25, 0) });
            this.hookLocationDict[name] = c.parent.transformLocalPoint(c.midpoint, t.getPaper());
        }
    }
    updateModel(argsDict = {}) {
        argsDict['height'] = this.getHeight();
        super.updateModel(argsDict);
    }
}
export class IOList extends MGroup {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            listInputNames: [],
            listOutputNames: []
        });
    }
    statelessSetup() {
        this.inputList = new InputList();
        this.outputList = new OutputList();
    }
    statefulSetup() {
        super.statefulSetup();
        this.inputList.listInputNames = this.listInputNames;
        this.outputList.listOutputNames = this.listOutputNames;
        this.inputList.mobject = this.mobject;
        this.outputList.mobject = this.mobject;
        this.inputList.statefulSetup(); // rework this
        this.outputList.statefulSetup(); // rework this
        this.add(this.inputList);
        this.add(this.outputList);
    }
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
        this.inputList.updateModel(argsDict);
        this.outputList.updateModel(argsDict);
    }
}
export class DependencyMap extends MGroup {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            linkLines: []
        });
    }
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            interactive: true
        });
    }
    selfHandlePointerDown(e) {
        let t = this.eventTargetMobject(e).eventTargetMobject(e).eventTargetMobject(e);
        // find a better way to handle this!
        if (t instanceof LinkHook) {
            let tl = t;
            let llStart = tl.center(this);
            this.editedLinkLine = new LinkLine({
                startPoint: llStart,
                source: tl.mobject,
                inputName: t.outputName,
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
                    if (!(b instanceof LinkHook)) {
                        continue;
                    }
                    let bc = b.center(this.parent);
                    let tc = tcircle.center(this.parent);
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
            let dict = ioList.inputList.hookLocationDict;
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
            let dict = ioList.outputList.hookLocationDict;
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
        source.update();
    }
    updateModel(argsDict = {}) {
        for (let line of this.linkLines) {
            line.startBullet.updateModel({
                midpoint: line.startHook.center(this)
            });
            line.endBullet.updateModel({
                midpoint: line.endHook.center(this)
            });
        }
        super.updateModel(argsDict);
    }
}
export class LinkLine extends CreatedMobject {
    statelessSetup() {
        super.statelessSetup();
        this.startBullet = new Circle({
            radius: BULLET_SIZE - 4,
            fillOpacity: 1
        });
        this.line = new Segment({
            strokeWidth: 5
        });
        this.endBullet = new Circle({
            radius: BULLET_SIZE - 4,
            fillOpacity: 1
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.add(this.startBullet);
        this.add(this.line);
        this.add(this.endBullet);
        this.startBullet.update({
            midpoint: this.startPoint
        }, false);
        this.line.update({
            startPoint: this.startPoint,
            endPoint: this.startPoint.copy()
        });
        this.endBullet.update({
            midpoint: this.endPoint
        });
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
        this.endBullet.update({ midpoint: q });
        this.line.update({ endPoint: q });
        this.update(); // why does this not work?
        this.endBullet.update();
        this.line.update();
        this.update({ endPoint: q });
    }
    updateModel(argsDict = {}) {
        if (this.startHook != undefined && this.startBullet != undefined) {
            this.startBullet.centerAt(this.startHook.center(this.superMobject), this.superMobject);
        }
        if (this.endHook != undefined && this.endBullet != undefined) {
            this.endBullet.centerAt(this.endHook.center(this.superMobject), this.superMobject);
        }
        if (this.line != undefined && this.startHook != undefined && this.endHook != undefined) {
            this.line.updateModel({
                startPoint: this.startHook.center(this.superMobject),
                endPoint: this.endHook.center(this.superMobject)
            });
        }
        super.updateModel(argsDict);
    }
}
export class LinkableMobject extends Mobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            inputNames: [],
            outputNames: [],
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
        ioList.inputList.update({ anchor: ioList.inputList.anchor.translatedBy(p2[0] - p1[0], p2[1] - p1[1] - 10) });
        let p3 = ioList.outputList.topCenter(this);
        let p4 = submob.bottomCenter(this);
        ioList.outputList.update({ anchor: ioList.outputList.anchor.translatedBy(p4[0] - p3[0], p4[1] - p3[1] + 10) });
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
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
        this.updateIOList();
    }
}
//# sourceMappingURL=linkables.js.map