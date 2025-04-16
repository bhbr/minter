

import { ValueBox } from '../ValueBox/ValueBox'
import { Circle } from 'core/shapes/Circle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'

export class FunctionBox extends ValueBox {

	argument: number | Array<number>
	functionSign: Circle
	functionLabel: TextLabel

	defaults(): object {
		return {
			functionSign: new Circle({
				radius: 10,
				fillColor: Color.black(),
				fillOpacity: 1.0
			}),
			functionLabel: new TextLabel(),
			argument: 0,
			inputNames: ['argument'],
			outputNames: ['result']
		}
	}

	mutabilities(): object {
		return {
			functionSign: 'never',
			functionLabel: 'never'
		}
	}

	setup() {
		super.setup()
		this.functionSign.update({
			midpoint: [this.frameWidth / 2, 0]
		})
		this.functionLabel.update({
			text: '',
			frameWidth: 2 * this.functionSign.radius,
			frameHeight: 2 * this.functionSign.radius
		})
		this.functionLabel.view.div.style.fontSize = '14px'
		this.functionSign.add(this.functionLabel)
		this.add(this.functionSign)
	}

	result(): any {
		return NaN
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		super.update({ value: this.result() }, redraw)
	}

}











