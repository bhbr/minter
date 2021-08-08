import { Vertex } from './vertex-transform.js';
import { CreatedMobject } from './creating.js';
import { BoxSlider } from './slider.js';
import { Color } from './color.js';
export class CreatedBoxSlider extends CreatedMobject {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.protoSlider = new BoxSlider();
        this.width = 50;
        this.height = 0;
        this.fillColor = Color.black();
        this.startPoint = Vertex.origin();
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.add(this.protoSlider);
        this.anchor = this.startPoint;
        this.protoSlider.update({
            value: 0.5,
            width: this.width,
            height: 0,
            fillColor: Color.black(),
            barFillColor: Color.gray(0.5)
        }, false);
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
        //this.redraw()
    }
    dissolveInto(superMobject) {
        superMobject.remove(this);
        this.protoSlider.update({
            anchor: this.anchor
        });
        superMobject.add(this.protoSlider);
        this.protoSlider.outerBar.update({ anchor: new Vertex(0, 0) }); // necessary?
        this.protoSlider.label.update({
            anchor: new Vertex(this.protoSlider.width / 2 - this.protoSlider.label.viewWidth / 2, this.protoSlider.height / 2 - this.protoSlider.label.viewHeight / 2)
        });
    }
}
//# sourceMappingURL=createdslider.js.map