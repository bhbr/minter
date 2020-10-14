import { pointerEventVertex } from './modules/helpers.js';
import { Vertex } from './modules/vertex-transform.js';
import { Color } from './modules/color.js';
import { Circle, Rectangle } from './modules/shapes.js';
import { CindyCanvas } from './modules/cindycanvas.js';
import { CreationGroup } from './modules/creationgroup.js';
import { BoxSlider } from './modules/slider.js';
import { LinkableMobject } from './modules/linkables.js';
import { Construction } from './modules/construction.js';
export class Paper extends LinkableMobject {
    constructor(argsDict = {}) {
        super();
        this.children = [];
        this.cindys = [];
        this.visibleCreation = 'freehand';
        this.cindyPorts = [];
        this.snappablePoints = [];
        this.construction = new Construction();
        this.colorPalette = {
            'black': Color.black(),
            'white': Color.white(),
            'red': Color.red(),
            'orange': Color.orange(),
            'yellow': Color.yellow(),
            'green': Color.green(),
            'blue': Color.blue(),
            'indigo': Color.indigo(),
            'violet': Color.violet()
        };
        this.currentColor = this.colorPalette['white'];
        this.setDragging(false);
        this.update(argsDict);
        this.background = new Rectangle({
            fillColor: Color.black(),
            fillOpacity: 1,
            width: this.viewWidth,
            height: this.viewHeight,
            viewWidth: this.viewWidth,
            viewHeight: this.viewHeight,
            passAlongEvents: true
        });
        this.add(this.background);
        this.construction.update({
            viewWidth: this.viewWidth,
            viewHeight: this.viewHeight
        });
        this.add(this.construction);
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
        this.creationGroup.update({
            strokeColor: this.currentColor,
            fillColor: this.currentColor
        });
    }
    setDragging(flag) {
        this.passAlongEvents = !flag;
        for (let c of this.cindys) {
            c.draggable = flag;
            c.csView.parentElement.style['pointer-events'] = (flag ? 'none' : 'auto');
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
        console.log('startDragging');
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
        let newAnchor = this.dragAnchorStart.add(dr);
        this.draggedMobject.update({ anchor: newAnchor });
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
        console.log('startCreating');
        this.creationStartPoint = pointerEventVertex(e);
        let drawFreehand = true;
        for (let fp of this.construction.points) {
            if (this.creationStartPoint.subtract(fp.midPoint).norm() < 20) {
                this.creationStartPoint = fp.midPoint;
                drawFreehand = false;
            }
        }
        this.creationGroup = new CreationGroup({
            startPoint: this.creationStartPoint,
            visibleCreation: this.visibleCreation,
            drawFreehand: drawFreehand,
            strokeColor: this.currentColor,
            fillColor: this.currentColor
        });
        this.addDependency('currentColor', this.creationGroup, 'strokeColor');
        this.addDependency('currentColor', this.creationGroup, 'fillColor');
        this.add(this.creationGroup);
        this.changeVisibleCreation(this.visibleCreation);
    }
    creativeMove(e) {
        let p = pointerEventVertex(e);
        if (['segment', 'ray', 'line', 'circle'].includes(this.creationGroup.visibleCreation)) {
            // snap to existing points
            for (let fq of this.construction.points) {
                let q = fq.anchor;
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
        this.creationGroup = undefined;
    }
    addCindy(cindyCanvas) {
        this.cindys.push(cindyCanvas);
    }
    removeCindy(cindyCanvas) {
        cindyCanvas.view.remove();
        cindyCanvas.initScript.remove();
        cindyCanvas.drawScript.remove();
    }
    add(mobject) {
        if (mobject instanceof CindyCanvas) {
            this.addCindy(mobject);
        }
        else {
            super.add(mobject);
        }
    }
    remove(mobject) {
        if (mobject instanceof CindyCanvas) {
            this.removeCindy(mobject);
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
export const paper = new Paper({
    view: document.querySelector('#paper'),
    anchor: new Vertex(200, 0),
    passAlongEvents: true,
    viewWidth: 800,
    viewHeight: 600
});
let c = new Circle({
    radius: 100,
    anchor: new Vertex(200, 300)
});
let s = new BoxSlider({
    anchor: new Vertex(200, 300),
    height: 150
});
let r = new Rectangle({
    anchor: new Vertex(150, 150),
    fillColor: Color.red(),
    fillOpacity: 1,
    width: 220,
    height: 150,
    viewWidth: 220,
    viewHeight: 150,
    passAlongEvents: true
});
paper.add(c);
paper.add(s);
//paper.add(r)
