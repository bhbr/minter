import { CreatingMobject } from './CreatingMobject.js';
import { Polygon } from '../shapes/Polygon.js';
import { Circle } from '../shapes/Circle.js';
import { Vertex } from '../helpers/Vertex.js';
import { Color } from '../helpers/Color.js';
import { ScreenEventHandler } from '../mobject/screen_events.js';
export class Freehand extends CreatingMobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            penStrokeColor: Color.white(),
            penStrokeWidth: 1.0
        });
    }
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            screenEventHandler: ScreenEventHandler.Below
        });
    }
    statelessSetup() {
        super.statelessSetup();
        this.line = new Polygon({
            closed: false,
            opacity: 1.0
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.addDependency('penStrokeColor', this.line, 'strokeColor');
        this.line.update({
            strokeColor: this.penStrokeColor
        });
        if (this.line.vertices.length > 0) {
            this.startPoint = this.line.vertices[0];
            this.endPoint = this.line.vertices[this.line.vertices.length - 1];
        }
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
        this.endPoint.copyFrom(q);
        this.redraw();
    }
    dissolve() {
        this.line.adjustFrame();
        let dr = this.line.anchor.copy();
        this.line.update({
            anchor: Vertex.origin()
        });
        this.update({
            anchor: this.anchor.translatedBy(dr),
            viewWidth: this.line.getWidth(),
            viewHeight: this.line.getHeight()
        });
        let par = this.parent;
        this.parent.remove(this);
        if (this.visible) {
            par.addToContent(this);
        }
    }
}
//# sourceMappingURL=Freehand.js.map