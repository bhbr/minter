
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { log } from 'core/functions/logging'

export class ValueBox extends Linkable {

	value: number
	valueLabel: TextLabel
	background: Rectangle

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'valueLabel',
			'background'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
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

	updateModel(argsDict) {
		super.updateModel(argsDict)
		this.background.update({
			width: this.viewWidth,
			height: this.viewHeight
		})

		var labelText = `${this.value.toPrecision(3)}`
		if (isNaN(this.value) || !isFinite(this.value)) {
			labelText = ''
		}

		this.valueLabel.update({
			width: this.viewWidth,
			height: this.viewHeight,
			text: labelText
		})
	}


















}