import { pointerEventVertex } from './helpers.js';
import { Vertex } from './vertex-transform.js';
import { Color } from './color.js';
import { TextLabel } from './mobject.js';
import { Rectangle } from './shapes.js';
import { LinkableMobject } from './linkables.js';
export class BoxSlider extends LinkableMobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            min: 0,
            max: 1,
            value: 0.6,
            height: 200,
            width: 50,
            strokeColor: Color.white(),
            draggable: true,
            interactive: true,
            passAlongEvents: false,
            outputNames: ['value'],
            fillColor: Color.black(),
            barFillColor: Color.gray(0.5)
        });
    }
    statelessSetup() {
        //// state-independent setup
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
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            value: 0
        });
    }
    statelessSetup() {
        super.statelessSetup();
        this.valueLabel = new TextLabel();
    }
    statefulSetup() {
        super.statefulSetup();
        this.add(this.valueLabel);
    }
}
// export class Slider extends Mobject {
//     constructor(min = -1, max = 1, value = 0, length = 100, orientation = 'horizontal') {
//         super()
//         this.min = min
//         this.max = max
//         this.value = value
//         this.length = length
//         this.orientation = orientation
//         let start = Vertex.origin()
//         let end = start
//         if (orientation == 'horizontal') { end = start.translatedBy(length, 0) }
//         else if (orientation == 'vertical') { end = start.translatedBy(0, -length) }
//         this.line = new Line(start, end)
//         this.line.strokeWidth = 1
//         this.line.anchor = Vertex.origin()
//         this.add(this.line)
//         this.scrubber = new Polygon([
//             new Vertex(0,0), new Vertex(10,-10), new Vertex(10,10)
//         ])
//         this.scrubber.anchor = this.valueToCoords(this.value)
//         this.add(this.scrubber)
//         if (orientation == 'horizontal') {
//             this.scale = new Polygon([
//                 new Vertex(0,0),
//                 new Vertex(this.length,0),
//                 new Vertex(this.length,-40),
//                 new Vertex(0,-40),
//             ])
//         } else if (orientation == 'vertical') {
//             this.scale = new Polygon([
//                 new Vertex(0,0),
//                 new Vertex(0,-this.length),
//                 new Vertex(-40,-this.length),
//                 new Vertex(-40,0),
//             ])
//         }
//         this.scale.strokeColor = rgba(0,0,0,0)
//         this.scale.fillColor = rgba(0,0,0,0.2)
//         this.boundDragScaleStart = this.dragScaleStart.bind(this)
//         this.boundDragScale = this.dragScale.bind(this)
//         this.boundDragScaleEnd = this.dragScaleEnd.bind(this)
//         this.scale.view.addEventListener('mousedown', this.boundDragScaleStart)
//         this.updateScale()
//         this.add(this.scale)
//         this.boundScrubStart = this.scrubStart.bind(this)
//         this.boundScrub = this.scrub.bind(this)
//         this.boundScrubEnd = this.scrubEnd.bind(this)
//         this.scrubber.view.addEventListener('mousedown', this.boundScrubStart)
//     }
//     scrubStart(e) {
//         if (e.target != this.scrubber.path) { return }
//         this.scrubber.view.removeEventListener('mousedown', this.boundScrubStart)
//         paper.addEventListener('mousemove', this.boundScrub)
//         paper.addEventListener('mouseup', this.boundScrubEnd)
//         this.dragStartingPoint = new Vertex(e.x, e.y)
//         this.oldScrubAnchor = new Vertex(this.scrubber.anchor)
//         this.updateValue()
//     }
//     scrub(e) {
//         let dragVector = new Vertex(e.x, e.y).subtract(this.dragStartingPoint)
//         if (this.orientation == 'horizontal') {
//             let newX = this.oldScrubAnchor.x + dragVector.x
//             newX = Math.max(0, Math.min(this.length, newX))
//             this.scrubber.anchor = new Vertex(newX, this.scrubber.anchor.y)
//         } else if (this.orientation == 'vertical') {
//             let newY = this.oldScrubAnchor.y + dragVector.y
//             newY = Math.min(0, Math.max(-this.length, newY))
//             this.scrubber.anchor = new Vertex(this.scrubber.anchor.x, newY)
//         } else {
//             console.log('Unknown orientation')
//         }
//         this.scrubber.redraw()
//         this.updateValue()
//     }
//     scrubEnd(e) {
//         paper.removeEventListener('mouseup', this.boundScrubEnd)
//         paper.removeEventListener('mousemove', this.boundScrub)
//         this.scrubber.view.addEventListener('mousedown', this.boundScrubStart)
//         this.updateValue()
//     }
//     updateValue() {
//         this.value = this.coordsToValue(this.scrubber.anchor)
//     }
//     valueToCoords(x) {
//         let fraction = (x - this.min)/(this.max - this.min)
//         if (this.orientation == 'horizontal') {
//             return new Vertex(fraction * this.length, 0)
//         } else if (this.orientation == 'vertical') {
//             return new Vertex(0, -fraction * this.length)
//         } else {
//             console.log('Unknown orientation')
//             return undefined
//         }
//     }
//     coordsToValue(v) {
//         let fraction = 0
//         if (this.orientation == 'horizontal') {
//             fraction = v.x/this.length
//         } else if (this.orientation == 'vertical') {
//             fraction = -v.y/this.length
//         } else {
//             console.log('Unknown orientation')
//             return undefined
//         }
//         return (1 - fraction) * this.min + fraction * this.max
//     }
//     static tickValues(a, b) {
//         //console.log('a', a, 'b', b)
//         let n = Math.floor(Math.log10(b - a))
//         //console.log('n', n)
//         let m = 10**(Math.log10(b - a) - n) // mantissa, 1 <= m < 10
//         //console.log('m', m)
//         let unit = 0
//         if (m < 2) { unit = 0.2 * 10**n }
//         else if (m < 5) { unit = 0.5 * 10**n }
//         else { unit = 10**n }
//         //console.log('unit', unit)
//         let ticks = new Array()
//         //console.log('xmin', Math.ceil(a/unit)*unit)
//         for (let x = Math.ceil(a/unit)*unit; x < b; x += unit) {
//              ticks.push(x)
//         }
//         return ticks
//     }
//     updateScale() {
//         for (let submob of this.scale.submobjects) {
//             this.scale.remove(submob)
//         }
//         let values = Slider.tickValues(this.min, this.max)
//         for (let value of values) {
//             let location = this.valueToCoords(value)
//             if (this.orientation == 'horizontal') {
//                 location.translateBy(0, -25)
//             } else if (this.orientation = 'vertical') {
//                 location.translateBy(-25, 0)
//             }
//             let label = new TextLabel(value)
//             label.view.setAttribute('class', 'TextLabel scaleLabel unselectable')
//             label.anchor = location
//             this.scale.add(label)
//         }
//     }
//     dragScaleStart(e) {
//         this.scale.dragStartingPoint = new Vertex(e.x, e.y)
//         this.oldMin = this.min
//         this.oldMax = this.max
//         this.scale.view.removeEventListener('mousedown', this.boundDragScaleStart)
//         this.scale.view.addEventListener('mousemove', this.boundDragScale)
//         this.scale.view.addEventListener('mouseup', this.boundDragScaleEnd)
//         e.stopPropagation()
//     }
//     dragScale(e) {
//         let dragVector = new Vertex(e.x, e.y).subtract(this.scale.dragStartingPoint)
//         let dvalue = 0
//         if (this.orientation == 'horizontal') {
//             let newX = this.scale.dragStartingPoint.x + dragVector.x
//             newX = Math.max(0, Math.min(this.length, newX))
//             let dx = newX - this.scale.dragStartingPoint.x
//             dvalue = this.coordsToValue(new Vertex(newX, 0)) - this.coordsToValue(this.scale.dragStartingPoint)
//         } else if (this.orientation == 'vertical') {
//             let newY = this.scale.dragStartingPoint.y + dragVector.y
//             newY = Math.max(0, Math.min(this.length, newY))
//             let dy = newY - this.scale.dragStartingPoint.y
//             dvalue = this.coordsToValue(new Vertex(0, newY)) - this.coordsToValue(this.scale.dragStartingPoint)
//         } else {
//             console.log('Unknown orientation')
//         }
//         this.min = this.oldMin - dvalue
//         this.max = this.oldMax - dvalue
//         this.scrubber.anchor = this.valueToCoords(this.value)
//         this.scrubber.redraw()
//         this.updateScale()
//     }
//     dragScaleEnd(e) {
//         this.scale.view.addEventListener('mousedown', this.boundDragScaleStart)
//         this.scale.view.removeEventListener('mousemove', this.boundDragScale)
//         this.scale.view.removeEventListener('mouseup', this.boundDragScaleEnd)
//         this.scale.dragStartingPoint = undefined
//         this.oldMin = undefined
//         this.oldMax = undefined
//     }
// }
//# sourceMappingURL=slider.js.map