import { CreatedMobject, Freehand, DrawnSegment, DrawnRay, DrawnLine, DrawnCircle } from './creating.js';
import { DrawnRectangle } from './cindycanvas.js';
import { CreatedBoxSlider } from './createdslider.js';
import { Vertex } from './transform.js';
import { Color } from './mobject.js';
export class CreationGroup extends CreatedMobject {
    constructor(argsDict) {
        super(argsDict);
        this.visibleCreation = 'freehand';
        this.drawFreehand = true;
        this.startPoint = argsDict['startPoint'] || Vertex.origin();
        this.creations = {};
        this.creations['freehand'] = new Freehand();
        this.creations['segment'] = new DrawnSegment({ startPoint: this.startPoint });
        this.creations['ray'] = new DrawnRay({ startPoint: this.startPoint });
        this.creations['line'] = new DrawnLine({ startPoint: this.startPoint });
        this.creations['circle'] = new DrawnCircle({ startPoint: this.startPoint });
        this.creations['cindy'] = new DrawnRectangle({ startPoint: this.startPoint });
        this.creations['slider'] = new CreatedBoxSlider({ startPoint: this.startPoint });
        for (let mob of Object.values(this.creations)) {
            this.addDependency('strokeColor', mob, 'strokeColor');
            this.addDependency('fillColor', mob, 'fillColor');
            mob.update();
        }
        this.setVisibleCreation(this.visibleCreation);
        for (let creation of Object.values(this.creations)) {
            this.add(creation);
        }
        this.update(argsDict);
    }
    updateFromTip(q) {
        for (let creation of Object.values(this.creations)) {
            creation.updateFromTip(q);
        }
    }
    setVisibleCreation(visibleCreation) {
        for (let mob of Object.values(this.creations)) {
            mob.hide();
        }
        this.visibleCreation = visibleCreation;
        if (!(visibleCreation == 'freehand' && !this.drawFreehand)) {
            this.creations[visibleCreation].show();
        }
        if (visibleCreation == 'cindy') {
            this.creations[visibleCreation].strokeColor = Color.white();
        }
    }
    dissolveInto(paper) {
        paper.remove(this);
        this.creations[this.visibleCreation].dissolveInto(paper);
        paper.updateIOList();
    }
    update(argsDict = {}, redraw = true) {
        if (this.creations == undefined) {
            return;
        }
        let sc = argsDict['strokeColor'];
        if (sc != undefined) {
            for (let mob of Object.values(this.creations)) {
                mob.update({ strokeColor: sc }, redraw);
            }
        }
        let fc = argsDict['fillColor'];
        if (fc != undefined) {
            for (let mob of Object.values(this.creations)) {
                mob.update({ fillColor: fc }, redraw);
            }
        }
        super.update(argsDict, redraw);
    }
}
