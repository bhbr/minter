
import { Linkable } from 'core/linkables/Linkable'
import { vertex, vertexSubtract } from 'core/functions/vertex'
import { getPaper, getSidebar } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { Color } from 'core/classes/Color'
import { TextLabel } from 'core/mobjects/TextLabel'
import { eventVertex, ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { SimpleNumberInputBox } from 'extensions/creations/math/boxes/SimpleNumberInputBox'
import { VariableNameBox } from './VariableNameBox'

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
	valueLabel: TextLabel
	nameLabel: TextLabel

	// style
	fillColor: Color
	barFillColor: Color

	// variable
	name: string | null
	min: number
	max: number
	value: number
	precision: number

	// scrubbing
	valueBeforeScrubbing: number
	scrubStartingPoint: vertex

	// limits
	minValueInputBox: SimpleNumberInputBox
	maxValueInputBox: SimpleNumberInputBox

	// name
	nameInputBox: VariableNameBox

	defaults(): object {
		return {
			inputProperties: [],
			outputProperties: [
				{ name: 'value', type: 'number' }
			],
			nameInputBox: new VariableNameBox({
				width: 20,
				anchor: [10, -30],

			}),
			nameLabel: new TextLabel({
				backgroundColor: Color.clear(),
				frameWidth: 50,
				frameHeight: 20,
				text: '',
				anchor: [10, -30]
			}),
			maxValueInputBox: new SimpleNumberInputBox({
				anchor: [-60, -10],
				value: 1
			}),
			outerBar: new Rectangle({
				anchor: [0, 0],
				fillColor: Color.black(),
				fillOpacity: 1,
				strokeColor: Color.white()
			}),
			filledBar: new Rectangle({
				fillOpacity: 0.5
			}),
			valueLabel: new TextLabel({
				frameHeight: 25,
				horizontalAlign: 'center',
				verticalAlign: 'center',
				fontSize: 20
			}),
			minValueInputBox: new SimpleNumberInputBox({
				anchor: [-60, 10],
				value: 0
			}),
			name: null,
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

	mutabilities(): object {
		return {
			inputProperties: 'never',
			outputNames: 'never',
			outerBar: 'never',
			filledBar: 'never',
			valueLabel: 'never'
		}
	}

	setup() {
		super.setup()
		this.add(this.outerBar)
		this.add(this.filledBar)
		this.add(this.valueLabel)
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

		this.controls.push(this.nameInputBox)
		this.controls.push(this.minValueInputBox)
		this.controls.push(this.maxValueInputBox)

		this.add(this.nameLabel)
		this.add(this.nameInputBox)

		this.nameLabel.update({
			horizontalAlign: 'center',
			verticalAlign: 'center',
			fontSize: 14,
			screenEventHandler: ScreenEventHandler.Below
		})

		// this.nameInputBox.update({
		// 	width: 20,
		// 	anchor: [(this.width - 20) / 2, this.height + 20]
		// })
		this.nameInputBox.onReturn = function() {
			this.update({
				name: this.nameInputBox.value
			})
		}.bind(this)

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
		if (args['name'] !== undefined) {
			this.renameLinkableProperty('output', this.name ?? 'value', args['name'])
			this.nameLabel.update({
				text: args['name']
			})
		}

		super.update(args, false)

		if (args['width'] !== undefined) {
			this.view.frame.width = this.width
		}
		if (args['height'] !== undefined) {
			this.view.frame.height = this.height
			this.minValueInputBox.update({
				anchor: [-60, this.height - 10]
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

		this.updateValueLabel(redraw)

		if (this.name != null) {
			getPaper().globals[this.name] = this.value
		}

		this.updateDependents()
		if (redraw) { this.view.redraw() }
	}

	updateValueLabel(redraw: boolean = true) {
		this.valueLabel.update({
			text: this.value.toString(),
			anchor: [this.width / 2 - this.width / 2, this.height / 2 - 25 / 2],
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








