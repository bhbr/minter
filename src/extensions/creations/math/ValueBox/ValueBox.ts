
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { log } from 'core/functions/logging'

export class ValueBox extends Linkable {

	value: number
	valueLabel: TextLabel
	background: Rectangle

	fixedValues(): object {
		return Object.assign(super.fixedValues(), {
			'valueLabel',
			'background'
		])
	}

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			viewWidth: 80,
			viewHeight: 40,
			inputNames: ['value'],
			outputNames: ['value'],
			strokeWidth: 0.0,
			background: new Rectangle({
				fillColor: Color.black()
			}),
			valueLabel: new TextLabel(),
			value: 1
		})
	}

	setup() {
		super.setup()
		this.background.update({
			width: this.viewWidth,
			height: this.viewHeight
		})
		this.valueLabel.update({
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight,
			text: `${this.value}`
		})
		this.valueLabel.view.style.fontSize = '20px'
		this.add(this.background)
		this.add(this.valueLabel)
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.background.update({
			width: this.viewWidth,
			height: this.viewHeight
		}, redraw)

		var labelText = `${this.value.toPrecision(3)}`
		if (isNaN(this.value) || !isFinite(this.value)) {
			labelText = ''
		}

		this.valueLabel.update({
			width: this.viewWidth,
			height: this.viewHeight,
			text: labelText
		}, redraw)

		if (redraw) { this.redraw() }
	}


















}