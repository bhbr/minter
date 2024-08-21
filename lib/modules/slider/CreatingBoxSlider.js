import { Vertex } from '../helpers/Vertex.js';
import { CreatingMobject } from '../creations/CreatingMobject.js';
import { BoxSlider } from './BoxSlider.js';
import { Color } from '../helpers/Color.js';
export class CreatingBoxSlider extends CreatingMobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            width: 50,
            height: 0,
            fillColor: Color.black(),
            startPoint: Vertex.origin()
        });
    }
    statelessSetup() {
        super.statelessSetup();
        this.protoSlider = new BoxSlider();
    }
    statefulSetup() {
        super.statefulSetup();
        this.add(this.protoSlider);
        this.anchor = this.startPoint;
        this.protoSlider.update({
            value: 0.5,
            width: this.width,
            height: 1,
            fillColor: Color.black(),
            barFillColor: Color.gray(0.5)
        });
        this.protoSlider.hideLinks();
    }
    createdMobject() {
        return this.protoSlider;
    }
    updateFromTip(q) {
        this.update({
            fillColor: Color.black()
        });
        this.protoSlider.update({
            height: q.y - this.startPoint.y,
            //fillColor: gray(0.5) // This shouldn't be necessary, fix
        });
        this.protoSlider.filledBar.update({
            fillColor: Color.gray(0.5)
        });
        this.protoSlider.hideLinks();
    }
    dissolve() {
        super.dissolve();
        this.protoSlider.update({
            anchor: this.anchor
        });
        this.protoSlider.outerBar.update({ anchor: new Vertex(0, 0) }); // necessary?
        this.protoSlider.label.update({
            anchor: new Vertex(this.protoSlider.width / 2 - this.protoSlider.label.viewWidth / 2, this.protoSlider.height / 2 - this.protoSlider.label.viewHeight / 2)
        });
    }
}
//# sourceMappingURL=CreatingBoxSlider.js.map