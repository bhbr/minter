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
			draggable: true,
			interactive: true,
			passAlongEvents: false,
			outputNames: ['value'],
			fillColor: Color.black(),
			barFillColor: Color.gray(0.5)
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

	selfHandlePointerDown(e: LocatedEvent) {
		this.scrubStartingPoint = pointerEventVertex(e)
		this.valueBeforeScrubbing = this.value
	}

	selfHandlePointerMove(e: LocatedEvent) {
		let scrubVector: Vertex = pointerEventVertex(e).subtract(this.scrubStartingPoint)
		this.value = this.valueBeforeScrubbing - scrubVector.y/this.height * (this.max - this.min)
		this.value = Math.max(Math.min(this.value, this.max), this.min)
		this.update()
	}

}


export class ValueBox extends Rectangle {

	value: number
	valueLabel: TextLabel

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			value: 0
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.valueLabel = new TextLabel()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.valueLabel)
	}

}


