import { pointerEventVertex } from './helpers.js';
import { Vertex } from './vertex-transform.js';
import { Color } from './color.js';
import { TextLabel } from './mobject.js';
import { Rectangle } from './shapes.js';
import { LinkableMobject } from './linkables.js';
export class BoxSlider extends LinkableMobject {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.min = 0;
        this.max = 1;
        this.value = 0.6;
        this.valueBeforeScrubbing = this.value;
        this.scrubStartingPoint = null;
        this.height = 200;
        this.width = 50;
        this.strokeColor = Color.white();
        this.draggable = true;
        this.interactive = true;
        this.passAlongEvents = false;
        this.outputNames = ['value'];
        this.fillColor = Color.black();
        this.barFillColor = Color.gray(0.5);
        this.outerBar = new Rectangle({
            fillColor: Color.black(),
            fillOpacity: 1,
            strokeColor: Color.white()
        });
        this.filledBar = new Rectangle({
            fillOpacity: 0.5
        });
        this.label = new TextLabel({
            viewHeight: 25,
            horizontalAlign: 'center',
            verticalAlign: 'center'
        });
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.add(this.outerBar);
        this.add(this.filledBar);
        this.add(this.label);
    }
    normalizedValue() {
        return (this.value - this.min) / (this.max - this.min);
    }
    updateSelf(args = {}) {
        var _a, _b;
        args['viewWidth'] = (_a = args['width']) !== null && _a !== void 0 ? _a : this.width;
        args['viewHeight'] = (_b = args['height']) !== null && _b !== void 0 ? _b : this.height;
        super.updateSelf(args);
        //// updating submobs
        let a = this.normalizedValue();
        if (isNaN(a)) {
            return;
        }
        this.outerBar.update({
            width: this.width,
            height: this.height,
            fillColor: this.backgroundColor
        }, false);
        this.filledBar.update({
            width: this.width,
            height: a * this.height,
            anchor: new Vertex(0, this.height - a * this.height),
            fillColor: this.barFillColor
        }, false);
        this.label.update({
            text: this.value.toPrecision(3).toString(),
            anchor: new Vertex(this.width / 2 - this.width / 2, this.height / 2 - 25 / 2),
            viewWidth: this.width
        }, false);
    }
    selfHandlePointerDown(e) {
        this.scrubStartingPoint = pointerEventVertex(e);
        this.valueBeforeScrubbing = this.value;
    }
    selfHandlePointerMove(e) {
        let scrubVector = pointerEventVertex(e).subtract(this.scrubStartingPoint);
        this.value = this.valueBeforeScrubbing - scrubVector.y / this.height * (this.max - this.min);
        this.value = Math.max(Math.min(this.value, this.max), this.min);
        this.update();
    }
}
export class ValueBox extends Rectangle {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.value = 0;
        this.valueLabel = new TextLabel();
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.add(this.valueLabel);
    }
}
//# sourceMappingURL=slider.js.map