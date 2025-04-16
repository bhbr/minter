
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { log } from 'core/functions/logging'

export class ValueBox extends Linkable {

	value: any
	valueLabel: TextLabel
	background: Rectangle

	defaults(): object {
		return {
			background: new Rectangle({
				fillColor: Color.black()
			}),
			valueLabel: new TextLabel(),
			frameWidth: 80,
			frameHeight: 40,
			inputNames: ['value'],
			outputNames: ['value'],
			strokeWidth: 0.0,
			value: 1
		}
	}

	mutabilities(): object {
		return {
			background: 'never',
			valueLabel: 'never'
		}
	}

	setup() {
		super.setup()
		this.background.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		})
		this.valueLabel.update({
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height,
			text: `${this.value}`
		})
		this.valueLabel.view.div.style.fontSize = '20px'
		this.add(this.background)
		this.add(this.valueLabel)
	}

	valueAsString(): string {
		if (typeof this.value == 'number') {
			return this.numberValueAsString()
		} else if (this.value instanceof Array) {
			return this.listValueAsString()
		} else {
			return this.value.toString()
		}
	}

	numberValueAsString(): string {
		if (!this.value) { return '' }
		var text = this.value.toString()
		if (!Number.isInteger(this.value)) {
			text = `${this.value.toPrecision(3)}`
		}
		if (isNaN(this.value) || !isFinite(this.value)) {
			text = ''
		}
		return text
	}

	listValueAsString(): string {
		var str = this.value.toString()
		if (str.length < 12) {
			return `[${str}]`
		} else {
			str = str.substring(0, 12)
			var entries = str.split(',')
			entries.pop()
			return `[${entries},...]`
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.background.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		}, redraw)

		var labelText = this.valueAsString()

		this.valueLabel.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			text: labelText
		}, redraw)

		if (redraw) { this.view.redraw() }
	}


















}