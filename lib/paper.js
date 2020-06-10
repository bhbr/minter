import { remove, pointerEventVertex } from './modules/helpers.js';
import { Vertex } from './modules/transform.js';
import { Color } from './modules/mobject.js';
import { Circle, TwoPointCircle } from './modules/shapes.js';
import { Segment, Ray, Line } from './modules/arrows.js';
import { Point, FreePoint } from './modules/creating.js';
import { CindyCanvas } from './modules/cindycanvas.js';
import { CreationGroup } from './modules/creationgroup.js';
import { LinkableMobject } from './modules/linkables.js';
let log = function (msg) { }; // logInto(msg.toString(), 'paper-console')
export class Paper extends LinkableMobject {
    constructor(argsDict = {}) {
        super();
        this.children = [];
        this.cindys = [];
        this.visibleCreation = 'freehand';
        this.cindyPorts = [];
        this.snappablePoints = [];
        this.geometricObjects = [];
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
        this.creationGroup.strokeColor = this.currentColor;
        this.creationGroup.fillColor = this.currentColor;
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
    // pointerDown(e: LocatedEvent) {
    // 	if (this.passAlongEvents) {
    // 		this.startCreating(e)
    // 	} else {
    // 		this.startDragging(e)
    // 	}
    // }
    // pointerMove(e: LocatedEvent) {
    // 	if (this.passAlongEvents) {
    // 		this.creativeMove(e)
    // 	} else {
    // 		this.dragging(e)
    // 	}
    // }
    // pointerUp(e: LocatedEvent) {
    // 	if (this.passAlongEvents) {
    // 		this.endCreating(e)
    // 	} else {
    // 		this.endDragging(e)
    // 	}
    // }
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
    arrowCircleIntersections(arrow, circle) {
        let A = arrow.startPoint;
        let B = arrow.endPoint;
        let C = circle.midPoint;
        let r = circle.radius;
        let a = A.subtract(B).norm2();
        let b = -2 * A.subtract(B).dot(B.add(C));
        let c = B.add(C).norm2() - r ** 2;
        let d = b ** 2 - 4 * a * c;
        if (d >= 0) {
            let l1 = (-b - d ** 0.5) / (2 * a);
            let l2 = (-b + d ** 0.5) / (2 * a);
            let P1 = A.multiply(l1).add(B.multiply(1 - l1));
            let P2 = A.multiply(l2).add(B.multiply(1 - l2));
            let intersections = [P1, P2];
            if (A instanceof Segment) {
                if (l1 < 0 || l1 > 1) {
                    P1 = new Vertex(NaN, NaN);
                }
                if (l2 < 0 || l2 > 1) {
                    P2 = new Vertex(NaN, NaN);
                }
            }
            else if (A instanceof Ray) {
                if (l1 < 0) {
                    P1 = new Vertex(NaN, NaN);
                }
                if (l2 < 0) {
                    P2 = new Vertex(NaN, NaN);
                }
            }
            return intersections;
        }
        else {
            let P1 = new Vertex(NaN, NaN);
            let P2 = new Vertex(NaN, NaN);
            return [P1, P2];
        }
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
        if (this.creationGroup.visibleCreation == 'segment') {
            let segment = this.creationGroup.creations['segment'].segment;
            for (let geomob of this.geometricObjects) {
                if (geomob instanceof Circle) {
                    let arr = this.arrowCircleIntersections(segment, geomob);
                    let p1 = new Point({ midPoint: arr[0], fillOpacity: 0.2 });
                    let p2 = new Point({ midPoint: arr[1], fillOpacity: 0.2 });
                    this.add(p1);
                    this.add(p2);
                }
            }
        }
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
        if (mobject instanceof Segment || mobject instanceof Ray || mobject instanceof Line || mobject instanceof TwoPointCircle) {
            this.geometricObjects.push(mobject);
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
    redraw() {
        this.redrawSubmobs();
    }
}
export const paper = new Paper({
    view: document.querySelector('#paper'),
    passAlongEvents: true
});
