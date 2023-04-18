import { CreatedMobject, Freehand, DrawnSegment, DrawnRay, DrawnLine, DrawnCircle } from './creating.js';
import { DrawnRectangle } from './cindycanvas.js';
import { CreatedBoxSlider } from './createdslider.js';
import { CreatedPendulum } from './pendulum.js';
import { Vertex } from './vertex-transform.js';
import { Color } from './color.js';
export class CreationGroup extends CreatedMobject {
    constructor() {
        super(...arguments);
        this.visibleCreation = 'freehand';
        this.drawFreehand = true;
    }
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            penColor: Color.white(),
            startPoint: Vertex.origin()
        });
    }
    statelessSetup() {
        super.statelessSetup();
        this.creations = {};
    }
    statefulSetup() {
        super.statefulSetup();
        this.creations['freehand'] = new Freehand();
        this.creations['segment'] = new DrawnSegment({ startPoint: this.startPoint });
        this.creations['ray'] = new DrawnRay({ startPoint: this.startPoint });
        this.creations['line'] = new DrawnLine({ startPoint: this.startPoint });
        this.creations['circle'] = new DrawnCircle({ startPoint: this.startPoint });
        this.creations['cindy'] = new DrawnRectangle({ startPoint: this.startPoint });
        this.creations['slider'] = new CreatedBoxSlider({ startPoint: this.startPoint });
        this.creations['pendulum'] = new CreatedPendulum({ startPoint: this.startPoint });
        for (let mob of Object.values(this.creations)) {
            this.addDependency('penColor', mob, 'penStrokeColor');
            this.addDependency('penColor', mob, 'penFillColor');
            mob.update();
        }
        this.setVisibleCreation(this.visibleCreation);
        for (let creation of Object.values(this.creations)) {
            this.add(creation);
        }
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
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
        if (this.creations == undefined) {
            return;
        }
        let sc = argsDict['strokeColor'];
        if (sc != undefined) {
            for (let mob of Object.values(this.creations)) {
                mob.updateModel({ strokeColor: sc });
            }
        }
        let fc = argsDict['fillColor'];
        if (fc != undefined) {
            for (let mob of Object.values(this.creations)) {
                mob.updateModel({ fillColor: fc });
            }
        }
    }
}
//# sourceMappingURL=creationgroup.js.map