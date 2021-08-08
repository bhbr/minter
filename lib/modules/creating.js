import { Vertex } from './vertex-transform.js';
import { MGroup, Polygon } from './mobject.js';
import { Color } from './color.js';
import { Circle, TwoPointCircle } from './shapes.js';
import { Segment, Ray, Line } from './arrows.js';
export class CreatedMobject extends MGroup {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.startPoint = Vertex.origin();
        this.endPoint = Vertex.origin();
        this.visible = true;
        this.interactive = true;
        if (!superCall) {
            this.setup();
            this.update(args);
        }
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
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.penStrokeColor = Color.white();
        this.penStrokeWidth = 1;
        this.penFillColor = Color.white();
        this.penFillOpacity = 1;
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
}
export class Freehand extends DrawnMobject {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.draggable = false;
        this.fillOpacity = 0;
        this.line = new Polygon({
            closed: false,
            opacity: 1.0,
            fillOpacity: this.fillOpacity
        });
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.addDependency('penStrokeColor', this.line, 'strokeColor');
        this.line.update({
            strokeColor: this.penStrokeColor
        });
        this.add(this.line);
    }
    updateWithPoints(q) {
        let nbDrawnPoints = this.children.length;
        let p = null;
        if (nbDrawnPoints > 0) {
            p = this.children[nbDrawnPoints - 1].midpoint;
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
            c.midpoint = new Vertex(newPoint);
            this.add(c);
        }
        let t = Math.random();
        let r = (1 - t) * 0.5 + t * 0.75;
        let c = new Circle({ radius: r, midpoint: new Vertex(q) });
        this.add(c);
    }
    updateWithLines(q) {
        this.line.vertices.push(q);
    }
    updateFromTip(q) {
        this.updateWithLines(q);
        this.update();
    }
    dissolveInto(superMobject) {
        // let dr = this.line.anchor
        // this.line.update({
        // 	anchor: Vertex.origin()
        // })
        // this.update({
        // 	anchor: this.anchor.translatedBy(dr),
        // 	viewWidth: this.line.getWidth(),
        // 	viewHeight: this.line.getHeight()
        // })
        superMobject.remove(this);
        if (this.visible) {
            superMobject.add(this);
            this.line.adjustFrame();
            this.adjustFrame();
        }
    }
}
export class Point extends Circle {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this._radius = 7;
        this.fillColor = Color.white();
        this.fillOpacity = 1;
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        if (!this.midpoint || this.midpoint.isNaN()) {
            this.update({ midpoint: Vertex.origin() }, false);
        }
    }
}
export class FreePoint extends Point {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.draggable = true;
        this.interactive = true;
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.enableDragging();
    }
}
export class DrawnArrow extends DrawnMobject {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.passAlongEvents = true;
        this.startFreePoint = new FreePoint();
        this.endFreePoint = new FreePoint();
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.add(this.startFreePoint);
        this.add(this.endFreePoint);
        this.endPoint = this.startPoint.copy();
        this.addDependency('penStrokeColor', this.startFreePoint, 'strokeColor');
        this.addDependency('penFillColor', this.startFreePoint, 'fillColor');
        this.addDependency('penStrokeColor', this.endFreePoint, 'strokeColor');
        this.addDependency('penFillColor', this.endFreePoint, 'fillColor');
        this.addDependency('startPoint', this.startFreePoint, 'midpoint');
        this.addDependency('endPoint', this.endFreePoint, 'midpoint');
        this.startFreePoint.update({ midpoint: this.startPoint });
        this.endFreePoint.update({ midpoint: this.endPoint });
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
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.segment = new Segment();
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.add(this.segment);
        this.segment.update({
            startPoint: this.startFreePoint.midpoint,
            endPoint: this.endFreePoint.midpoint
        }, false);
        this.startFreePoint.addDependency('midpoint', this.segment, 'startPoint');
        this.endFreePoint.addDependency('midpoint', this.segment, 'endPoint');
        this.addDependency('penStrokeColor', this.segment, 'strokeColor');
    }
}
export class DrawnRay extends DrawnArrow {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.ray = new Ray();
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.add(this.ray);
        this.ray.update({
            startPoint: this.startFreePoint.midpoint,
            endPoint: this.endFreePoint.midpoint
        }, false);
        this.startFreePoint.addDependency('midpoint', this.ray, 'startPoint');
        this.endFreePoint.addDependency('midpoint', this.ray, 'endPoint');
        this.addDependency('penStrokeColor', this.ray, 'strokeColor');
    }
}
export class DrawnLine extends DrawnArrow {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.line = new Line();
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.add(this.line);
        this.line.update({
            startPoint: this.startFreePoint.midpoint,
            endPoint: this.endFreePoint.midpoint
        }, false);
        this.startFreePoint.addDependency('midpoint', this.line, 'startPoint');
        this.endFreePoint.addDependency('midpoint', this.line, 'endPoint');
        this.addDependency('penStrokeColor', this.line, 'strokeColor');
    }
}
export class DrawnCircle extends DrawnMobject {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.freeMidpoint = new FreePoint();
        this.freeOuterPoint = new FreePoint();
        this.circle = new TwoPointCircle();
        this.strokeWidth = 1;
        this.fillOpacity = 0;
        this.passAlongEvents = true;
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.midpoint = this.midpoint || this.startPoint.copy();
        this.outerPoint = this.outerPoint || this.startPoint.copy();
        this.add(this.freeMidpoint);
        this.add(this.freeOuterPoint);
        this.add(this.circle);
        this.addDependency('penStrokeColor', this.freeMidpoint, 'strokeColor');
        this.addDependency('penFillColor', this.freeMidpoint, 'fillColor');
        this.addDependency('penStrokeColor', this.freeOuterPoint, 'strokeColor');
        this.addDependency('penFillColor', this.freeOuterPoint, 'fillColor');
        this.addDependency('penStrokeColor', this.circle, 'strokeColor');
        this.freeMidpoint.addDependency('midpoint', this.circle, 'midpoint');
        this.freeOuterPoint.addDependency('midpoint', this.circle, 'outerPoint');
        this.freeMidpoint.update({
            midpoint: this.midpoint,
            strokeColor: this.penStrokeColor,
            fillColor: this.penFillColor
        }, false);
        this.freeOuterPoint.update({
            midpoint: this.outerPoint,
            strokeColor: this.penStrokeColor,
            fillColor: this.penFillColor
        }, false);
        this.circle.update({
            midpoint: this.freeMidpoint.midpoint,
            outerPoint: this.freeOuterPoint.midpoint,
            fillOpacity: 0
        }, false);
    }
    updateFromTip(q) {
        super.updateFromTip(q);
        this.outerPoint.copyFrom(q);
        this.freeOuterPoint.midpoint.copyFrom(q);
        this.update();
    }
    dissolveInto(paper) {
        paper.construction.integrate(this);
    }
}
//# sourceMappingURL=creating.js.map