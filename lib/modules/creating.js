import { Vertex } from './transform.js';
import { Color, MGroup, Polygon } from './mobject.js';
import { Circle, TwoPointCircle } from './shapes.js';
import { Arrow, Segment, Ray, Line } from './arrows.js';
export class CreatedMobject extends MGroup {
    constructor() {
        super(...arguments);
        this.visible = true;
    }
    dissolveInto(superMobject) {
        superMobject.remove(this);
        if (!this.visible) {
            return;
        }
        for (let submob of this.children) {
            superMobject.add(submob);
        }
    }
    updateFromTip(q) { }
}
export class Freehand extends CreatedMobject {
    constructor(argsDict = {}) {
        super();
        this.line = new Polygon();
        this.add(this.line);
        this.setAttributes({
            strokeColor: Color.white(),
            fillOpacity: 0,
            draggable: false
        });
        this.line.update({
            closed: false,
            strokeColor: this.strokeColor,
            fillOpacity: this.fillOpacity
        });
        this.addDependency('strokeColor', this.line, 'strokeColor');
        this.update(argsDict);
    }
    updateWithPoints(q) {
        let nbDrawnPoints = this.children.length;
        let p = null;
        if (nbDrawnPoints > 0) {
            p = this.children[nbDrawnPoints - 1].midPoint;
        }
        let pointDistance = 10;
        let distance = ((p.x - q.x) ** 2 + (p.y - q.y) ** 2) ** 0.5;
        let unitVector = new Vertex([(q.x - p.x) / distance, (q.y - p.y) / distance]);
        for (let step = pointDistance; step < distance; step += pointDistance) {
            let x = p.x + step * unitVector.x + 0.5 * Math.random();
            let y = p.y + step * unitVector.y + 0.5 * Math.random();
            let newPoint = new Vertex([x, y]);
            let c = new Circle({ radius: 2 });
            c.fillColor = this.strokeColor;
            c.midPoint = new Vertex(newPoint);
            this.add(c);
        }
        let t = Math.random();
        let r = (1 - t) * 0.5 + t * 0.75;
        let c = new Circle({ radius: r, midPoint: new Vertex(q) });
        this.add(c);
    }
    updateWithLines(q) {
        this.line.vertices.push(q);
    }
    updateFromTip(q) {
        this.updateWithLines(q);
        this.redraw();
    }
    dissolveInto(superMobject) {
        superMobject.remove(this);
        if (this.visible) {
            superMobject.add(this);
        }
    }
}
export class Point extends Circle {
    constructor(argsDict = {}) {
        super();
        this.radius = 5;
        this.view.setAttribute('class', this.constructor.name);
        this.setDefaults({
            midPoint: Vertex.origin()
        });
        this.setAttributes({
            fillColor: Color.white(),
            fillOpacity: 1.0
        });
        this.update(argsDict);
    }
}
export class FreePoint extends Point {
    constructor(argsDict = {}) {
        super();
        this.setAttributes({
            draggable: true
        });
        this.update(argsDict);
        this.enableDragging();
    }
}
export class DrawnArrow extends CreatedMobject {
    constructor(argsDict = {}) {
        super(argsDict);
        this.endPoint = this.endPoint || this.startPoint.copy();
        this.passAlongEvents = true;
        this.startFreePoint = new FreePoint({
            midPoint: this.startPoint
        });
        this.endFreePoint = new FreePoint({
            midPoint: this.endPoint
        });
        this.addDependency('strokeColor', this.startFreePoint, 'strokeColor');
        this.addDependency('fillColor', this.startFreePoint, 'fillColor');
        this.addDependency('strokeColor', this.endFreePoint, 'strokeColor');
        this.addDependency('fillColor', this.endFreePoint, 'fillColor');
        this.add(this.startFreePoint);
        this.add(this.endFreePoint);
        this.update(argsDict);
    }
    updateFromTip(q) {
        this.endPoint.copyFrom(q);
        this.endFreePoint.midPoint.copyFrom(q);
        this.update();
    }
    dissolveInto(paper) {
        paper.removeFreePoint(this.startFreePoint);
        paper.removeFreePoint(this.endFreePoint);
        for (let fq of paper.snappablePoints) {
            let q = fq.midPoint;
            if (this.startPoint.x == q.x && this.startPoint.y == q.y) {
                this.startPoint = fq.midPoint;
                this.startFreePoint = fq;
                this.update();
                break;
            }
        }
        for (let fq of paper.snappablePoints) {
            let q = fq.midPoint;
            if (this.endPoint.x == q.x && this.endPoint.y == q.y) {
                this.endPoint = fq.midPoint;
                this.endFreePoint = fq;
                this.update();
                break;
            }
        }
        paper.add(this.startFreePoint);
        paper.add(this.endFreePoint);
    }
}
export class DrawnSegment extends DrawnArrow {
    constructor(argsDict = {}) {
        super(argsDict);
        this.segment = new Segment({
            startPoint: this.startFreePoint.midPoint,
            endPoint: this.endFreePoint.midPoint
        });
        this.add(this.segment);
        this.startFreePoint.addDependency('midPoint', this.segment, 'startPoint');
        this.endFreePoint.addDependency('midPoint', this.segment, 'endPoint');
        this.addDependency('strokeColor', this.segment, 'strokeColor');
        this.update(argsDict);
    }
    dissolveInto(superMobject) {
        super.dissolveInto(superMobject);
        superMobject.remove(this.segment);
        this.segment = new Segment({
            startPoint: this.startFreePoint.midPoint,
            endPoint: this.endFreePoint.midPoint,
            strokeColor: this.strokeColor
        });
        superMobject.add(this.segment);
        this.startFreePoint.addDependency('midPoint', this.segment, 'startPoint');
        this.endFreePoint.addDependency('midPoint', this.segment, 'endPoint');
    }
}
export class DrawnRay extends DrawnArrow {
    constructor(argsDict = {}) {
        super(argsDict);
        this.ray = new Ray({
            startPoint: this.startFreePoint.midPoint,
            endPoint: this.endFreePoint.midPoint,
        });
        this.startFreePoint.addDependency('midPoint', this.ray, 'startPoint');
        this.endFreePoint.addDependency('midPoint', this.ray, 'endPoint');
        this.addDependency('strokeColor', this.ray, 'strokeColor');
        this.add(this.ray);
        this.update(argsDict);
    }
    dissolveInto(superMobject) {
        super.dissolveInto(superMobject);
        superMobject.remove(this.ray);
        this.ray = new Ray({
            startPoint: this.startFreePoint.midPoint,
            endPoint: this.endFreePoint.midPoint,
            strokeColor: this.strokeColor
        });
        this.startFreePoint.addDependency('midPoint', this.ray, 'startPoint');
        this.endFreePoint.addDependency('midPoint', this.ray, 'endPoint');
        superMobject.add(this.ray);
        this.ray.update(); // necessary for some reason
    }
}
export class DrawnLine extends DrawnArrow {
    constructor(argsDict = {}) {
        super(argsDict);
        this.line = new Line({
            startPoint: this.startFreePoint.midPoint,
            endPoint: this.endFreePoint.midPoint
        });
        this.add(this.line);
        this.startFreePoint.addDependency('midPoint', this.line, 'startPoint');
        this.endFreePoint.addDependency('midPoint', this.line, 'endPoint');
        this.addDependency('strokeColor', this.line, 'strokeColor');
        this.update(argsDict);
    }
    dissolveInto(superMobject) {
        super.dissolveInto(superMobject);
        superMobject.remove(this.line);
        this.line = new Line({
            startPoint: this.startFreePoint.midPoint,
            endPoint: this.endFreePoint.midPoint,
            strokeColor: this.strokeColor
        });
        this.startFreePoint.addDependency('midPoint', this.line, 'startPoint');
        this.endFreePoint.addDependency('midPoint', this.line, 'endPoint');
        superMobject.add(this.line);
        this.line.update();
    }
}
export class DrawnCircle extends CreatedMobject {
    constructor(argsDict = {}) {
        super(argsDict);
        this.setAttributes({
            strokeWidth: 1,
            fillOpacity: 0
        });
        this.midPoint = this.midPoint || this.startPoint.copy();
        this.outerPoint = this.outerPoint || this.startPoint.copy();
        this.passAlongEvents = true;
        this.freeMidpoint = new FreePoint({
            midPoint: this.midPoint,
            strokeColor: this.strokeColor,
            fillColor: this.fillColor
        });
        this.freeOuterPoint = new FreePoint({
            midPoint: this.outerPoint,
            strokeColor: this.strokeColor,
            fillColor: this.fillColor
        });
        this.circle = new TwoPointCircle({
            midPoint: this.freeMidpoint.midPoint,
            outerPoint: this.freeOuterPoint.midPoint,
            fillOpacity: 0
        });
        this.add(this.freeMidpoint);
        this.add(this.freeOuterPoint);
        this.add(this.circle);
        this.addDependency('strokeColor', this.freeMidpoint, 'strokeColor');
        this.addDependency('fillColor', this.freeMidpoint, 'fillColor');
        this.addDependency('strokeColor', this.freeOuterPoint, 'strokeColor');
        this.addDependency('fillColor', this.freeOuterPoint, 'fillColor');
        this.addDependency('strokeColor', this.circle, 'strokeColor');
        this.update(argsDict);
    }
    updateFromTip(q) {
        this.outerPoint.copyFrom(q);
        this.freeOuterPoint.midPoint.copyFrom(q);
        this.update();
    }
    dissolveInto(paper) {
        paper.removeFreePoint(this.freeMidpoint);
        paper.removeFreePoint(this.freeOuterPoint);
        for (let fq of paper.snappablePoints) {
            let q = fq.midPoint;
            if (this.midPoint.x == q.x && this.midPoint.y == q.y) {
                this.midPoint = fq.midPoint;
                this.freeMidpoint = fq;
                this.update();
                break;
            }
        }
        for (let fq of paper.snappablePoints) {
            let q = fq.midPoint;
            if (this.outerPoint.x == q.x && this.outerPoint.y == q.y) {
                this.outerPoint = fq.midPoint;
                this.freeOuterPoint = fq;
                this.update();
                break;
            }
        }
        paper.add(this.freeMidpoint);
        paper.add(this.freeOuterPoint);
        paper.remove(this.circle);
        this.circle = new TwoPointCircle({
            midPoint: this.freeMidpoint.midPoint,
            outerPoint: this.freeOuterPoint.midPoint
        });
        this.circle.strokeColor = this.strokeColor;
        this.freeMidpoint.addDependency('midPoint', this.circle, 'midPoint');
        this.freeOuterPoint.addDependency('midPoint', this.circle, 'outerPoint');
        paper.add(this.circle);
    }
    update(argsDict = {}, redraw = true) {
        super.update(argsDict, redraw);
    }
}
export class IntersectionPoint extends Point {
    constructor(argsDict = {}) {
        super(argsDict);
        this.fillOpacity = 0;
        this.update(argsDict);
    }
    update(argsDict = {}, redraw = true) {
        console.log('updating IntersectionPoint');
        let anchor = this.intersectionCoords();
        if (anchor.isNaN()) {
            argsDict['strokeWidth'] = 0;
        }
        else {
            argsDict['strokeWidth'] = 1;
            if (!this.anchor.equals(anchor)) {
                console.log('setting IntersectionPoint.anchor');
                this.anchor = anchor;
            }
        }
        super.update(argsDict, redraw);
    }
    intersectionCoords() {
        if (this.geomob1 instanceof Arrow && this.geomob2 instanceof Circle) {
            return this.arrowCircleIntersection(this.geomob1, this.geomob2, this.index);
        }
        else if (this.geomob2 instanceof Arrow && this.geomob1 instanceof Circle) {
            return this.arrowCircleIntersection(this.geomob2, this.geomob1, this.index);
        }
        else {
            return new Vertex(NaN, NaN);
        }
    }
    arrowCircleIntersection(arrow, circle, index) {
        let A = arrow.startPoint;
        let B = arrow.endPoint;
        let C = circle.midPoint;
        let r = circle.radius;
        let a = A.subtract(B).norm2();
        let b = 2 * C.subtract(A).dot(A.subtract(B));
        let c = C.subtract(A).norm2() - r ** 2;
        let d = b ** 2 - 4 * a * c;
        if (d >= 0) {
            let l = (-b + (index == 0 ? -1 : 1) * d ** 0.5) / (2 * a);
            let P = A.add(B.subtract(A).multiply(l));
            if (arrow.constructor.name == 'Segment') {
                if (l < 0 || l > 1) {
                    P = new Vertex(NaN, NaN);
                }
            }
            else if (arrow.constructor.name == 'Ray') {
                if (l < 0) {
                    P = new Vertex(NaN, NaN);
                }
            }
            return P;
        }
        else {
            let P = new Vertex(NaN, NaN);
            return P;
        }
    }
}
