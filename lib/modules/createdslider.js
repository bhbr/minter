import { Vertex } from './vertex-transform.js';
import { CreatedMobject } from './creating.js';
import { BoxSlider } from './slider.js';
import { Color } from './color.js';
export class CreatedBoxSlider extends CreatedMobject {
    constructor(argsDict = {}) {
        super();
        this.setAttributes({
            width: 50,
            height: 0,
            fillColor: Color.black()
        });
        this.setDefaults({ startPoint: Vertex.origin() });
        this.anchor = this.startPoint;
        this.protoSlider = new BoxSlider(argsDict);
        this.protoSlider.update({
            value: 0.5,
            width: this.width,
            height: 0,
            fillColor: Color.black()
        });
        this.protoSlider.filledBar.update({
            width: this.width,
            fillColor: Color.gray(0.5)
        });
        this.add(this.protoSlider);
        this.update(argsDict);
    }
    updateFromTip(q) {
        this.update({
            fillColor: Color.black()
        });
        this.protoSlider.update({
            height: q.y - this.startPoint.y,
        });
        this.protoSlider.filledBar.update({
            fillColor: Color.gray(0.5)
        });
        this.redraw();
    }
    dissolveInto(superMobject) {
        superMobject.remove(this);
        this.protoSlider.update({
            anchor: this.anchor
        });
        superMobject.add(this.protoSlider);
        this.protoSlider.outerBar.update({ anchor: new Vertex(0, 0) });
        this.protoSlider.label.update({
            anchor: new Vertex(this.protoSlider.width / 2 - this.protoSlider.label.viewWidth / 2, this.protoSlider.height / 2 - this.protoSlider.label.viewHeight / 2)
        });
    }
}
//# sourceMappingURL=createdslider.js.map