
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { ValueBox } from '../ValueBox'
import { log } from 'core/functions/logging'

export class NumberBox extends ValueBox {

	declare value: number
	valueLabel: TextLabel

	get number(): number { return this.value }
	set number(newValue: number) { this.value = newValue }

	defaults(): object {
		return {
			value: 1,
			valueLabel: new TextLabel()
		}
	}

	setup() {
		super.setup()
		this.valueLabel.update({
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height,
			text: `${this.value}`
		})
		this.valueLabel.view.div.style.fontSize = '20px'
		this.add(this.valueLabel)
	}


	valueAsString(): string {
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


	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		
		var labelText = this.valueAsString()
		this.valueLabel.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			text: labelText
		}, redraw)
	}
















}