
import { Linkable } from 'core/linkables/Linkable'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'
import { TextLabel } from 'core/mobjects/TextLabel'
import { eventVertex, ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'

export class BoxSlider extends Linkable {
/*
A BoxSlider represents a continuous variable. Its value varies
between a min (0 for now) and max (1 for now) value via scrubbing.
*/

	// geometry
	height: number
	width: number

	// components
	outerBar: Rectangle
	filledBar: Rectangle
	label: TextLabel

	// style
	fillColor: Color
	barFillColor: Color

	// variable
	min: number
	max: number
	value: number
	precision: number

	// scrubbing
	valueBeforeScrubbing: number
	scrubStartingPoint: Vertex

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'outerBar',
			'filledBar',
			'label'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			min: 0,
			max: 1,
			value: 0.6,
			height: 200,
			width: 70,
			strokeColor: Color.white(),
			fillColor: Color.black(),
			barFillColor: Color.gray(0.5),
			screenEventHandler: ScreenEventHandler.Self,
			precision: 3,
			inputNames: [],
			outputNames: ['value'],
			outerBar: new Rectangle({
				fillColor: Color.black(),
				fillOpacity: 1,
				strokeColor: Color.white()
			}),
			filledBar: new Rectangle({
				fillOpacity: 0.5
			}),
			label: new TextLabel({
				viewHeight: 25,
				horizontalAlign: 'center',
				verticalAlign: 'center',
				fontSize: 20
			})
		})
	}

	setup() {
		super.setup()
		this.add(this.outerBar)
		this.add(this.filledBar)
		this.add(this.label)
		this.update()
	}

	normalizedValue(): number {
	// is always between 0 and 1
		return (this.value - this.min) / (this.max - this.min)
	}

	update(argsDict: object = {}, redraw: boolean = true) {
		super.update(argsDict, false)

		//// internal dependencies
		this.viewWidth = this.width
		this.viewHeight = this.height

		//// updating submobs
		let a: number = this.normalizedValue()
		if (isNaN(a)) { return }

		this.outerBar.update({
			width: this.width,
			height: this.height,
			//fillColor: this.backgroundColor
		}, redraw)

		this.filledBar.update({
			width: this.width,
			height: a * this.height,
			anchor:  new Vertex(0, this.height - a * this.height),
			//fillColor: this.barFillColor
		}, redraw)

		this.updateLabel(redraw)

		if (redraw) { this.redraw() }
	}

	updateLabel(redraw: boolean = true) {
		this.label.update({
			text: this.value.toPrecision(this.precision).toString(),
			anchor: new Vertex(this.width/2 - this.width/2, this.height/2 - 25/2),
			viewWidth: this.width
		}, redraw)
	}

	onPointerDown(e: ScreenEvent) {
		this.scrubStartingPoint = eventVertex(e)
		this.valueBeforeScrubbing = this.value
	}

	onPointerMove(e: ScreenEvent) {
		let scrubVector: Vertex = eventVertex(e).subtract(this.scrubStartingPoint)
		this.value = this.valueBeforeScrubbing - scrubVector.y/this.height * (this.max - this.min)
		this.value = Math.max(Math.min(this.value, this.max), this.min)
		this.update()
	}

}








