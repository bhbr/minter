import { CreatedMobject, Freehand } from './creating.js';
import { Vertex } from './vertex-transform.js';
import { Color } from './color.js';
export class CreationGroup extends CreatedMobject {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.creations = {}; // convert into string index signature 
        this.visibleCreation = 'freehand';
        this.drawFreehand = true;
        this.penColor = Color.white();
        this.startPoint = Vertex.origin();
        this.penTip = null;
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.creations['freehand'] = new Freehand();
        // this.creations['segment'] = new DrawnSegment({ startPoint: this.startPoint})
        // this.creations['ray'] = new DrawnRay({startPoint: this.startPoint})
        // this.creations['line'] = new DrawnLine({startPoint: this.startPoint})
        // this.creations['circle'] = new DrawnCircle({startPoint: this.startPoint})
        // this.creations['cindy'] = new DrawnRectangle({startPoint: this.startPoint})
        // this.creations['slider'] = new CreatedBoxSlider({startPoint: this.startPoint})
        // this.creations['pendulum'] = new CreatedPendulum({startPoint: this.startPoint})
        for (let creation of Object.values(this.creations)) {
            this.add(creation);
            this.addDependency('penColor', creation, 'penStrokeColor');
            this.addDependency('penColor', creation, 'penFillColor');
            creation.update();
        }
        this.setVisibleCreation(this.visibleCreation);
    }
    updateFromTip(q) {
        this.creations['freehand'].updateFromTip(q);
        if (this.visibleCreation != 'freehand') {
            this.creations[this.visibleCreation].updateFromTip(q);
        }
        this.penTip = q;
    }
    setVisibleCreation(visibleCreation) {
        for (let mob of Object.values(this.creations)) {
            mob.hide();
        }
        this.visibleCreation = visibleCreation;
        if (this.penTip) {
            this.creations[this.visibleCreation].updateFromTip(this.penTip);
        }
        if (!(visibleCreation == 'freehand' && !this.drawFreehand)) {
            this.creations[visibleCreation].show();
        }
        // if (visibleCreation == 'cindy') {
        // 	this.creations[visibleCreation].strokeColor = Color.white()
        // }
    }
    dissolveInto(paper) {
        paper.remove(this);
        this.creations[this.visibleCreation].dissolveInto(paper);
        paper.updateIOList();
        this.penTip = null;
    }
    updateSelf(args = {}) {
        super.updateSelf(args);
        if (this.creations == undefined) {
            return;
        }
        let sc = args['strokeColor'];
        if (sc != undefined) {
            for (let mob of Object.values(this.creations)) {
                mob.update({ strokeColor: sc }, false);
            }
        }
        let fc = args['fillColor'];
        if (fc != undefined) {
            for (let mob of Object.values(this.creations)) {
                mob.update({ fillColor: fc }, false);
            }
        }
    }
}
//# sourceMappingURL=creationgroup.js.map