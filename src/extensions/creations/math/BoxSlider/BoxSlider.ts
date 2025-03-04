
import { Linkable } from 'core/linkables/Linkable'
import { vertex, vertexSubtract } from 'core/functions/vertex'
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
	scrubStartingPoint: vertex

	ownDefaults(): object {
		return {
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
			}),
			min: 0,
			max: 1,
			value: 0.6,
			height: 200,
			width: 70,
			strokeColor: Color.white(),
			fillColor: Color.black(),
			barFillColor: Color.gray(0.5),
			screenEventHandler: ScreenEventHandler.Self,
			precision: 3
		}
	}

	ownMutabilities(): object {
		return {
			inputNames: 'never',
			outputNames: 'never',
			outerBar: 'never',
			filledBar: 'never',
			label: 'never'
		}
	}

	setup() {
		super.setup()
		this.add(this.outerBar)
		this.add(this.filledBar)
		this.add(this.label)
		this.addDependency('width', this.outerBar, 'width')
		this.addDependency('height', this.outerBar, 'height')
		this.update({
			viewWidth: this.width,
			viewHeight: this.height
		})
		this.outputList.update()
	}

	normalizedValue(): number {
	// is always between 0 and 1
		return (this.value - this.min) / (this.max - this.min)
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)

		if (args['width'] !== undefined) {
			this.viewWidth = this.width
		}
		if (args['height'] !== undefined) {
			this.viewHeight = this.height
		}

		//// updating submobs
		let a: number = this.normalizedValue()
		if (isNaN(a)) { return }

		this.filledBar.update({
			width: this.width,
			height: a * this.height,
			anchor: [0, this.height - a * this.height]
		}, redraw)

		this.updateLabel(redraw)

		if (redraw) { this.redraw() }
	}

	updateLabel(redraw: boolean = true) {
		this.label.update({
			text: this.value.toString(),
			anchor: [this.width/2 - this.width/2, this.height/2 - 25/2],
			viewWidth: this.width
		}, redraw)
	}

	onPointerDown(e: ScreenEvent) {
		this.scrubStartingPoint = eventVertex(e)
		this.valueBeforeScrubbing = this.value
	}

	onPointerMove(e: ScreenEvent) {
		let scrubVector: vertex = vertexSubtract(eventVertex(e), this.scrubStartingPoint)
		var newValue = this.valueBeforeScrubbing - scrubVector[1]/this.height * (this.max - this.min)
		newValue = Math.max(Math.min(newValue, this.max), this.min)
		newValue = Math.round(newValue * 10**this.precision) / 10**this.precision
		this.update({ value: newValue})
	}

}








