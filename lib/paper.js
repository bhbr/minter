import { isTouchDevice, pointerEventVertex } from './modules/helpers.js';
import { Vertex } from './modules/vertex-transform.js';
import { Color, COLOR_PALETTE } from './modules/color.js';
import { Rectangle } from './modules/shapes.js';
import { CreationGroup } from './modules/creationgroup.js';
import { LinkableMobject, DependencyMap } from './modules/linkables.js';
import { Construction } from './modules/construction.js';
import { CindyCanvas } from './modules/cindycanvas.js';
export class Paper extends LinkableMobject {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.visibleCreation = 'freehand';
        this.cindyPorts = [];
        this.snappablePoints = [];
        this.creationStartPoint = null;
        this.currentColor = COLOR_PALETTE['white'];
        this.creationGroup = null;
        this.dependencyMap = new DependencyMap();
        this.draggedMobject = null;
        this.dragPointStart = null;
        this.dragAnchorStart = null;
        this.draggedIOList = null;
        this.dragIOListAnchorStart = null;
        this.construction = new Construction();
        this.background = new Rectangle({
            fillColor: Color.black(),
            fillOpacity: 1,
            strokeWidth: 0,
            passAlongEvents: true
        });
        this.isPanning = false;
        this.panLocation = null;
        this.oldShift = Vertex.origin();
        this.children = [];
        this.interactive = true;
        this.draggable = false;
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.setDragging(false);
        this.add(this.background);
        this.add(this.construction);
        this.construction.update({
            viewWidth: 0,
            viewHeight: 0 //this.viewHeight
        }, false);
    }
    updateSelf(args = {}) {
        super.updateSelf(args);
        this.background.update({
            width: this.viewWidth,
            height: this.viewHeight,
            viewWidth: this.viewWidth,
            viewHeight: this.viewHeight
        }, false);
    }
    changeColorByName(newColorName) {
        let newColor = COLOR_PALETTE[newColorName];
        this.changeColor(newColor);
    }
    changeColor(newColor) {
        this.currentColor = newColor;
        if (this.creationGroup == undefined) {
            return;
        }
        this.creationGroup.update({
            penColor: this.currentColor
        });
    }
    setDragging(flag) {
        this.passAlongEvents = !flag;
        if (flag) {
            this.selfHandlePointerDown = this.startDragging;
            this.selfHandlePointerMove = this.dragging;
            this.selfHandlePointerUp = this.endDragging;
            for (let submob of this.getCindys()) {
                submob.vetoOnStopPropagation = false;
            }
        }
        else {
            this.selfHandlePointerDown = this.startCreating;
            this.selfHandlePointerMove = this.creativeMove;
            this.selfHandlePointerUp = this.endCreating;
            for (let submob of this.getCindys()) {
                submob.vetoOnStopPropagation = true;
            }
        }
    }
    getCindys() {
        let ret = [];
        for (let submob of this.submobs) {
            if (submob instanceof CindyCanvas) {
                ret.push(submob);
            }
        }
        return ret;
    }
    startDragging(e) {
        this.draggedMobject = this.eventTargetMobject(e);
        if (this.draggedMobject == this) {
            // check if we hit a CindyCanvas
            for (let c of this.cindys) {
                let p = pointerEventVertex(e);
                let p1 = (p.x > c.anchor.x);
                let p2 = (p.y > c.anchor.y);
                let p3 = (p.x < c.anchor.x + c.viewWidth);
                let p4 = (p.y < c.anchor.y + c.viewHeight);
                if (p1 && p2 && p3 && p4) {
                    this.draggedMobject = c;
                    break;
                }
            }
        }
        if (this.draggedMobject == this || !this.draggedMobject.draggable) {
            this.draggedMobject = null;
            return;
        }
        this.dragPointStart = pointerEventVertex(e);
        this.dragAnchorStart = this.draggedMobject.anchor.copy();
        this.draggedIOList = null;
        if (this.dependencyMap == null) {
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
        if (this.draggedMobject == null) {
            return;
        }
        let dragPoint = pointerEventVertex(e);
        let dr = dragPoint.subtract(this.dragPointStart);
        let newAnchor = this.dragAnchorStart.add(dr);
        this.draggedMobject.update({ anchor: newAnchor });
        this.draggedMobject.view.style.left = `${newAnchor.x}px`;
        this.draggedMobject.view.style.top = `${newAnchor.y}px`;
        this.draggedIOList.anchor.copyFrom(this.dragIOListAnchorStart.add(dr));
        this.draggedIOList.update();
        this.dependencyMap.update();
    }
    endDragging(e) {
        this.dragPointStart = null;
        this.dragAnchorStart = null;
        this.draggedMobject = null;
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
                this.changeColor(COLOR_PALETTE[value]);
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
            case 'pan':
                this.setPanning(value);
        }
    }
    setPanning(flag) {
        this.isPanning = flag;
        this.passAlongEvents = !flag;
        if (flag) {
            this.selfHandlePointerDown = this.startPanning;
            this.selfHandlePointerMove = this.panning;
            this.selfHandlePointerUp = this.endPanning;
            for (let submob of this.getCindys()) {
                submob.vetoOnStopPropagation = false;
            }
        }
        else {
            this.selfHandlePointerDown = this.startCreating;
            this.selfHandlePointerMove = this.creativeMove;
            this.selfHandlePointerUp = this.endCreating;
            for (let submob of this.getCindys()) {
                submob.vetoOnStopPropagation = true;
            }
        }
    }
    startPanning(e) {
        this.panLocation = pointerEventVertex(e);
    }
    panning(e) {
        let dx = pointerEventVertex(e).subtract(this.panLocation);
        for (let submob of this.submobs) {
            if (submob == this.background) {
                continue;
            }
            submob.transform.shift = this.oldShift.add(dx);
            submob.update();
        }
    }
    endPanning(e) {
        this.panLocation = null;
        if (this.submobs.length > 1) {
            this.oldShift = this.submobs[1].transform.shift;
        }
    }
    changeVisibleCreation(newVisibleCreation) {
        this.visibleCreation = newVisibleCreation;
        if (this.creationGroup != undefined) {
            this.creationGroup.setVisibleCreation(newVisibleCreation);
        }
    }
    startCreating(e) {
        console.log('startCreating');
        this.creationStartPoint = pointerEventVertex(e);
        let drawFreehand = true;
        for (let fp of this.construction.points) {
            if (this.creationStartPoint.subtract(fp.midpoint).norm() < 20) {
                this.creationStartPoint = fp.midpoint;
                drawFreehand = false;
            }
        }
        this.creationGroup = new CreationGroup({
            viewWidth: this.viewWidth,
            viewHeight: this.viewHeight,
            startPoint: this.creationStartPoint,
            visibleCreation: this.visibleCreation,
            drawFreehand: drawFreehand,
            penColor: this.currentColor
        });
        this.addDependency('currentColor', this.creationGroup, 'strokeColor');
        this.add(this.creationGroup);
        this.changeVisibleCreation(this.visibleCreation);
    }
    creativeMove(e) {
        let p = pointerEventVertex(e);
        if (['segment', 'ray', 'line', 'circle'].includes(this.creationGroup.visibleCreation)) {
            // snap to existing points
            for (let fq of this.construction.points) {
                let q = fq.midpoint;
                if (p.subtract(q).norm() < 10) {
                    p = q;
                    break;
                }
            }
        }
        this.creationGroup.updateFromTip(p);
    }
    endCreating(e) {
        this.creationGroup.dissolveInto(this);
        this.creationGroup = null;
    }
    showAllLinks() {
        this.showLinksOfSubmobs();
    }
    hideAllLinks() {
        this.hideLinksOfSubmobs();
    }
}
var paperAnchor = Vertex.origin();
if (isTouchDevice === false) {
    paperAnchor = new Vertex(150, 0);
}
export const paper = new Paper({
    view: document.querySelector('#paper'),
    anchor: paperAnchor,
    passAlongEvents: true,
    viewWidth: 1250,
    viewHeight: 1200
});
// let c = new Circle({
// 	radius: 100,
// 	anchor: new Vertex(200, 300)
// })
// let s = new BoxSlider({
// 	anchor: new Vertex(200, 300),
// 	height: 150
// })
// let r = new Rectangle({
// 	anchor: new Vertex(150, 150),
// 	fillColor: Color.red(),
// 	fillOpacity: 1,
// 	width: 220,
// 	height: 150,
// 	viewWidth: 220,
// 	viewHeight: 150,
// 	passAlongEvents: true
// })
// paper.add(c)
// paper.add(s)
// paper.add(r)
//# sourceMappingURL=paper.js.map