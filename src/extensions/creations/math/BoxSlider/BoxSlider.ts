
import { Linkable } from 'core/linkables/Linkable'
import { vertex, vertexSubtract } from 'core/functions/vertex'
import { getPaper, getSidebar } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { Color } from 'core/classes/Color'
import { TextLabel } from 'core/mobjects/TextLabel'
import { eventVertex, ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { SimpleNumberBox } from 'extensions/creations/math/boxes/SimpleNumberBox'

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

	// limits
	minValueInputBox: SimpleNumberBox
	maxValueInputBox: SimpleNumberBox

	defaults(): object {
		return {
			inputProperties: [],
			outputProperties: [
				{ name: 'value', type: 'number' }
			],
			outerBar: new Rectangle({
				fillColor: Color.black(),
				fillOpacity: 1,
				strokeColor: Color.white()
			}),
			filledBar: new Rectangle({
				fillOpacity: 0.5
			}),
			label: new TextLabel({
				frameHeight: 25,
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
			precision: 3,
			minValueInputBox: new SimpleNumberBox({
				anchor: [10, 10],
				value: 0
			}),
			maxValueInputBox: new SimpleNumberBox({
				anchor: [10, -30],
				value: 1
			})
		}
	}

	mutabilities(): object {
		return {
			inputProperties: 'never',
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
			frameWidth: this.width,
			frameHeight: this.height
		})

		this.add(this.minValueInputBox)
		this.add(this.maxValueInputBox)
		this.minValueInputBox.inputElement.value = this.min.toString()
		this.maxValueInputBox.inputElement.value = this.max.toString()

		this.minValueInputBox.blur = this.endMinValueEditing.bind(this)
		this.minValueInputBox.onReturn = this.endMinValueEditing.bind(this)
		this.maxValueInputBox.blur = this.endMaxValueEditing.bind(this)
		this.maxValueInputBox.onReturn = this.endMaxValueEditing.bind(this)

		this.updateDependents()
		this.outputList.update()

		this.moveToTop(this.outputList)
	}

	endMinValueEditing() {
		getPaper().blurFocusedChild()
		this.minValueInputBox.inputElement.blur()
		document.removeEventListener('keydown', this.minValueInputBox.boundKeyPressed)
		this.updateMinValue()
	}

	endMaxValueEditing() {
		getPaper().blurFocusedChild()
		this.maxValueInputBox.inputElement.blur()
		document.removeEventListener('keydown', this.maxValueInputBox.boundKeyPressed)
		this.updateMaxValue()
	}

	updateMinValue() {
		let minValue = Number(this.minValueInputBox.value)
		if (minValue >= this.max) {
			this.minValueInputBox.value = this.min
		} else {
			this.update({
				min: minValue
			}, true)
		}
	}

	updateMaxValue() {
		let maxValue = Number(this.maxValueInputBox.value)
		if (maxValue <= this.min) {
			this.maxValueInputBox.value = this.max
		} else {
			this.update({
				max: maxValue
			}, true)
		}
	}

	normalizedValue(): number {
	// is always between 0 and 1
		return (this.value - this.min) / (this.max - this.min)
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)

		if (args['width'] !== undefined) {
			this.view.frame.width = this.width
		}
		if (args['height'] !== undefined) {
			this.view.frame.height = this.height
			this.minValueInputBox.update({
				anchor: [10, this.height + 10]
			})
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
		this.updateDependents()

		if (redraw) { this.view.redraw() }
	}

	updateLabel(redraw: boolean = true) {
		this.label.update({
			text: this.value.toString(),
			anchor: [this.width/2 - this.width/2, this.height/2 - 25/2],
			frameWidth: this.width
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
		this.update({ value: newValue })
	}



}








