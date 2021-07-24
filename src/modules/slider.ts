import { pointerEventVertex, LocatedEvent } from './helpers'
import { Vertex } from './vertex-transform'
import { Color } from './color'
import { Mobject, MGroup, TextLabel, Polygon } from './mobject'
import { Line } from './arrows'
import { Circle, Rectangle } from './shapes'
import { LinkableMobject } from './linkables'




export class BoxSlider extends LinkableMobject {

	min: number
	max: number
	value: number
	valueBeforeScrubbing: number
	scrubStartingPoint: Vertex
	height: number
	width: number
	outerBar: Rectangle
	filledBar: Rectangle
	label: TextLabel

	constructor(argsDict: object = {}) {
		super()
		this.setDefaults({
			min: 0,
			max: 1,
			value: 0.6,
			height: 200,
			width: 50,
			strokeColor: Color.white()
		})
		this.setAttributes({
			draggable: true,
			interactive: true,
			outputNames: ['value'],
			drawBorder: true,
			viewWidth: this.width,
			viewHeight: this.height,
			fillColor: argsDict['backgroundColor'] || Color.white()
		})

		if (this.constructor.name == "BoxSlider") {
			this.update(argsDict)
		}

		this.outerBar = new Rectangle({
			width: this.width,
			height: this.height,
			fillColor: Color.black(),
			fillOpacity: 1,
			strokeColor: Color.white()
		})
		this.add(this.outerBar)

		this.filledBar = new Rectangle({
			width: this.width,
			height: this.normalizedValue() * this.height,
			fillColor: argsDict['fillColor'] || Color.gray(0.5),
			fillOpacity: 1
		})
		this.add(this.filledBar)
		this.label = new TextLabel({text: this.value.toString()})
		this.addDependency('localCenter', this.label, 'center')
		let labelWidth = 30
		let labelHeight = 15
		this.label.update({
			viewWidth: labelWidth,
			viewHeight: labelHeight,
			horizontalAlign: 'center',
			verticalAlign: 'center',
			drawBorder: true
		})
		this.add(this.label)

	}

	normalizedValue(): number {
		return (this.value - this.min) / (this.max - this.min)
	}

	update(argsDict: object = {}, redraw = true) {
		if (argsDict['height'] != undefined) {
			argsDict['viewHeight'] = argsDict['height']
		}
		super.update(argsDict, redraw = true)
		let a: number = this.normalizedValue()
		if (isNaN(a)) { return }
		try {
			// anchor should already have been set above, so:
			delete argsDict['anchor'] // so it does not propagate to the outer bar in the next line
			this.outerBar.update(argsDict)
			this.filledBar.anchor.copyFrom(new Vertex(0, this.height - this.filledBar.height))
			this.filledBar.update({ height: a * this.height })
			this.label.update({
				text: this.value.toPrecision(3).toString()
			})
		} catch { }
		if (redraw) { this.redraw() }
	}

	selfHandlePointerDown(e: LocatedEvent) {
		this.scrubStartingPoint = pointerEventVertex(e)
		this.valueBeforeScrubbing = this.value
	}

	selfHandlePointerMove(e: LocatedEvent) {
		let scrubVector: Vertex = pointerEventVertex(e).subtract(this.scrubStartingPoint)
		var v = this.valueBeforeScrubbing - scrubVector.y/this.height * (this.max - this.min)
		v = Math.max(Math.min(v, this.max), this.min)
		this.update({
			value: v
		})
	}

}


export class ValueBox extends Rectangle {
	value: number = 0
	valueLabel: TextLabel

	constructor(argsDict: object = {}) {
		super()
		this.valueLabel = new TextLabel()
		this.add(this.valueLabel)
		
		if (this.constructor.name == "ValueBox") {
			this.update(argsDict)
		}
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
