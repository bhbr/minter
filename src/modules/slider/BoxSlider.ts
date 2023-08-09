import { LinkableMobject } from '../mobject/linkable/LinkableMobject'
import { Vertex } from '../helpers/Vertex_Transform'
import { Color } from '../helpers/Color'
import { Mobject } from '../mobject/Mobject'
import { MGroup } from '../mobject/MGroup'
import { TextLabel } from '../TextLabel'
import { Polygon } from '../shapes/Polygon'
import { pointerEventVertex, LocatedEvent, PointerEventPolicy } from '../mobject/pointer_events'
import { Line } from '../arrows/Line'
import { Circle } from '../shapes/Circle'
import { Rectangle } from '../shapes/Rectangle'

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
	fillColor: Color
	barFillColor: Color
	label: TextLabel

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			min: 0,
			max: 1,
			value: 0.6,
			height: 200,
			width: 50,
			strokeColor: Color.white(),
			fillColor: Color.black(),
			barFillColor: Color.gray(0.5),
			pointerEventPolicy: PointerEventPolicy.HandleYourself
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			outputNames: ['value']
		})
	}

	statelessSetup() {
		//// state-independent setup
		this.outerBar = new Rectangle({
			fillColor: Color.black(),
			fillOpacity: 1,
			strokeColor: Color.white()
		})

		this.filledBar = new Rectangle({
			fillOpacity: 0.5
		})

		this.label = new TextLabel({
			viewHeight: 25,
			horizontalAlign: 'center',
			verticalAlign: 'center'
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.outerBar)
		this.add(this.filledBar)
		this.add(this.label)

	}

	normalizedValue(): number {
		return (this.value - this.min) / (this.max - this.min)
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)

		//// internal dependencies
		this.viewWidth = this.width
		this.viewHeight = this.height
		this.positionView()


		//// updating submobs
		let a: number = this.normalizedValue()
		if (isNaN(a)) { return }

		this.outerBar.update({
			width: this.width,
			height: this.height,
			fillColor: this.backgroundColor
		}, false)

		this.filledBar.update({
			width: this.width,
			height: a * this.height,
			anchor:  new Vertex(0, this.height - a * this.height),
			fillColor: this.barFillColor
		}, false)

		this.label.update({
			text: this.value.toPrecision(3).toString(),
			anchor: new Vertex(this.width/2 - this.width/2, this.height/2 - 25/2),
			viewWidth: this.width
		}, false)

	}

	onPointerDown(e: LocatedEvent) {
		this.scrubStartingPoint = pointerEventVertex(e)
		this.valueBeforeScrubbing = this.value
	}

	onPointerMove(e: LocatedEvent) {
		let scrubVector: Vertex = pointerEventVertex(e).subtract(this.scrubStartingPoint)
		this.value = this.valueBeforeScrubbing - scrubVector.y/this.height * (this.max - this.min)
		this.value = Math.max(Math.min(this.value, this.max), this.min)
		this.update()
	}

}








