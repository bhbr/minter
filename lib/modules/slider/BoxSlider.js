import { LinkableMobject } from '../mobject/linkable/LinkableMobject.js';
import { Vertex } from '../helpers/Vertex.js';
import { Color } from '../helpers/Color.js';
import { TextLabel } from '../TextLabel.js';
import { eventVertex, ScreenEventHandler } from '../mobject/screen_events.js';
import { Rectangle } from '../shapes/Rectangle.js';
export class BoxSlider extends LinkableMobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            min: 0,
            max: 1,
            value: 0.6,
            height: 200,
            width: 50,
            strokeColor: Color.white(),
            fillColor: Color.black(),
            barFillColor: Color.gray(0.5),
            screenEventHandler: ScreenEventHandler.Self
        });
    }
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            inputNames: [],
            outputNames: ['value']
        });
    }
    statelessSetup() {
        //// state-independent setup
        super.statelessSetup();
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
    }
    statefulSetup() {
        super.statefulSetup();
        this.add(this.outerBar);
        this.add(this.filledBar);
        this.add(this.label);
        this.update();
    }
    normalizedValue() {
        return (this.value - this.min) / (this.max - this.min);
    }
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
        //// internal dependencies
        this.viewWidth = this.width;
        this.viewHeight = this.height;
        this.positionView();
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
    onPointerDown(e) {
        this.scrubStartingPoint = eventVertex(e);
        this.valueBeforeScrubbing = this.value;
    }
    onPointerMove(e) {
        let scrubVector = eventVertex(e).subtract(this.scrubStartingPoint);
        this.value = this.valueBeforeScrubbing - scrubVector.y / this.height * (this.max - this.min);
        this.value = Math.max(Math.min(this.value, this.max), this.min);
        this.update();
    }
}
//# sourceMappingURL=BoxSlider.js.map