
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { log } from 'core/functions/logging'

export class ValueBox extends Linkable {

	value: any
	background: Rectangle

	defaults(): object {
		return {
			background: new Rectangle({
				fillColor: Color.black()
			}),
			frameWidth: 80,
			frameHeight: 40,
			inputProperties: [
				{ name: 'value', type: 'any' }
			],
			outputProperties: [
				{ name: 'value', type: 'any' }
			],
			strokeWidth: 0.0,
			value: 1
		}
	}

	mutabilities(): object {
		return {
			background: 'never',
		}
	}

	setup() {
		super.setup()
		this.background.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		})
		this.add(this.background)
	}

	valueAsString(): string {
		return this.value.toString()
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.background.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		}, redraw)

		if (redraw) { this.view.redraw() }
	}


















}