import { Vertex } from './vertex-transform.js';
import { MGroup, Polygon } from './mobject.js';
import { Color } from './color.js';
import { Circle, TwoPointCircle } from './shapes.js';
import { Segment, Ray, Line } from './arrows.js';
export class CreatedMobject extends MGroup {
    constructor(argsDict = {}) {
        super();
        this.visible = true;
        this.setDefaults({
            startPoint: Vertex.origin(),
            endPoint: Vertex.origin()
        });
        this.interactive = true;
        this.update(argsDict);
    }
    dissolveInto(paper) {
        paper.remove(this);
        if (!this.visible) {
            return;
        }
        for (let submob of this.children) {
            paper.add(submob);
        }
        console.log('dissolving CreatedMobject');
    }
    updateFromTip(q) {
        this.endPoint.copyFrom(q);
    }
}
class DrawnMobject extends CreatedMobject {
    constructor(argsDict = {}) {
        super(argsDict);
        this.setDefaults({
            penStrokeColor: Color.white(),
            penStrokeWidth: 1.0,
            penFillColor: Color.white(),
            penFillOpacity: 0.0
        });
    }
}
export class Freehand extends DrawnMobject {
    constructor(argsDict = {}) {
        super();
        this.line = new Polygon();
        this.add(this.line);
        this.setAttributes({
            draggable: false
        });
        this.line.update({
            closed: false,
            strokeColor: this.penStrokeColor,
            opacity: 1.0
        });
        this.addDependency('penStrokeColor', this.line, 'strokeColor');
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
            c.fillColor = this.penStrokeColor;
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
        this.view.setAttribute('class', this.constructor.name);
        if (!this.midPoint || this.midPoint.isNaN()) {
            this.update({ midPoint: Vertex.origin() });
        }
        this.setAttributes({
            radius: 7.0,
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
            draggable: true,
            interactive: true
        });
        this.update(argsDict);
        this.enableDragging();
    }
}
export class DrawnArrow extends DrawnMobject {
    constructor(argsDict = {}) {
        super(argsDict);
        this.endPoint = this.startPoint.copy();
        this.passAlongEvents = true;
        this.startFreePoint = new FreePoint();
        this.endFreePoint = new FreePoint();
        this.addDependency('penStrokeColor', this.startFreePoint, 'strokeColor');
        this.addDependency('penFillColor', this.startFreePoint, 'fillColor');
        this.addDependency('penStrokeColor', this.endFreePoint, 'strokeColor');
        this.addDependency('penFillColor', this.endFreePoint, 'fillColor');
        this.add(this.startFreePoint);
        this.add(this.endFreePoint);
        this.addDependency('startPoint', this.startFreePoint, 'midPoint');
        this.addDependency('endPoint', this.endFreePoint, 'midPoint');
        this.startFreePoint.update({ midPoint: this.startPoint });
        this.endFreePoint.update({ midPoint: this.endPoint });
        console.log('end point:', this.endPoint);
        this.update(argsDict);
    }
    updateFromTip(q) {
        super.updateFromTip(q);
        this.update();
    }
    dissolveInto(paper) {
        paper.construction.integrate(this);
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
        this.addDependency('penStrokeColor', this.segment, 'strokeColor');
        this.update(argsDict);
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
        this.addDependency('penStrokeColor', this.ray, 'strokeColor');
        this.add(this.ray);
        this.update(argsDict);
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
        this.addDependency('penStrokeColor', this.line, 'strokeColor');
        this.update(argsDict);
    }
}
export class DrawnCircle extends DrawnMobject {
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
            strokeColor: this.penStrokeColor,
            fillColor: this.penFillColor
        });
        this.freeOuterPoint = new FreePoint({
            midPoint: this.outerPoint,
            strokeColor: this.penStrokeColor,
            fillColor: this.penFillColor
        });
        this.circle = new TwoPointCircle({
            midPoint: this.freeMidpoint.midPoint,
            outerPoint: this.freeOuterPoint.midPoint,
            fillOpacity: 0
        });
        this.add(this.freeMidpoint);
        this.add(this.freeOuterPoint);
        this.add(this.circle);
        this.addDependency('penStrokeColor', this.freeMidpoint, 'strokeColor');
        this.addDependency('penFillColor', this.freeMidpoint, 'fillColor');
        this.addDependency('penStrokeColor', this.freeOuterPoint, 'strokeColor');
        this.addDependency('penFillColor', this.freeOuterPoint, 'fillColor');
        this.addDependency('penStrokeColor', this.circle, 'strokeColor');
        this.update(argsDict);
    }
    updateFromTip(q) {
        super.updateFromTip(q);
        this.outerPoint.copyFrom(q);
        this.freeOuterPoint.midPoint.copyFrom(q);
        this.update();
    }
    dissolveInto(paper) {
        paper.construction.integrate(this);
    }
    update(argsDict = {}, redraw = true) {
        super.update(argsDict, redraw);
    }
}
//# sourceMappingURL=creating.js.map