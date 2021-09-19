import { pointerEventVertex, LocatedEvent, TouchHandler } from './helpers'
import { Vertex } from './vertex-transform'
import { Color } from './color'
import { Mobject, MGroup } from './mobject'
import { Polygon } from './vmobject'
import { TextLabel } from './textlabel'
import { Line } from './arrows'
import { Circle, Rectangle } from './shapes'
import { LinkableMobject } from './linkables'




export class BoxSlider extends LinkableMobject {

	min = 0
	max = 1
	value = 0.6
	valueBeforeScrubbing = this.value
	scrubStartingPoint?: Vertex = null
	height = 200
	width = 50
	touchHandler: TouchHandler = "self"

	readonly strokeColor = Color.white()
	readonly draggable = true
	readonly interactive = true
	readonly passAlongEvents = false
	readonly outputNames = ['value']
	readonly fillColor = Color.black()
	readonly barFillColor = Color.gray(0.5)

	outerBar = new Rectangle({
		fillColor: Color.black(),
		fillOpacity: 1,
		strokeColor: Color.white()
	})
	filledBar = new Rectangle({
		fillOpacity: 0.5
	})
	label = new TextLabel({
		viewHeight: 25,
		horizontalAlign: 'center',
		verticalAlign: 'center'
	})

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.add(this.outerBar)
		this.add(this.filledBar)
		this.add(this.label)

	}

	normalizedValue(): number {
		return (this.value - this.min) / (this.max - this.min)
	}

	updateSelf(args = {} ,redraw = true) {
		args['viewWidth'] = args['width'] ?? this.width
		args['viewHeight'] = args['height'] ?? this.height

		super.updateSelf(args, redraw)

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

	value = 0
	valueLabel = new TextLabel()

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.add(this.valueLabel)
	}

}


