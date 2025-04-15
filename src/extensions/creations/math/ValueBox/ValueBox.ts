
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { log } from 'core/functions/logging'

export class ValueBox extends Linkable {

	value: number
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

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.background.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		}, redraw)

		let precision = Number.isInteger(this.value) ? 1 : 3
		var labelText = `${this.value.toPrecision(precision)}`
		if (isNaN(this.value) || !isFinite(this.value)) {
			labelText = ''
		}

		this.valueLabel.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			text: labelText
		}, redraw)

		if (redraw) { this.view.redraw() }
	}


















}