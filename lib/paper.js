import { rgb, remove, pointerEventVertex } from './modules/helpers.js';
import { FreePoint } from './modules/creating.js';
import { CindyCanvas } from './modules/cindycanvas.js';
import { CreationGroup } from './modules/creationgroup.js';
import { LinkableMobject } from './modules/linkables.js';
let log = function (msg) { }; // logInto(msg.toString(), 'paper-console')
export class Paper extends LinkableMobject {
    constructor(argsDict) {
        super(argsDict);
        this.children = [];
        this.cindys = [];
        this.setDragging(false);
        this.visibleCreation = 'freehand';
        this.cindyPorts = [];
        this.snappablePoints = [];
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
    changeColor(newColor) {
        this.currentColor = newColor;
        if (this.creationGroup == undefined) {
            return;
        }
        this.creationGroup.setStrokeColor(this.currentColor);
        this.creationGroup.setFillColor(this.currentColor);
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
                log(p1);
                log(p2);
                log(p3);
                log(p4);
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
                this.changeColor(value);
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
}
export const paper = new Paper({ view: document.querySelector('#paper'), passAlongEvents: true });
