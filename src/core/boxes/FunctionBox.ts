
import { Linkable } from 'core/linkables/Linkable'
import { ValueBox } from './ValueBox'
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'

export class FunctionBox extends Linkable {

	argument: any
	valueBox: ValueBox
	functionSign: Rectangle
	functionLabel: TextLabel
	functionName: string

	defaults(): object {
		return {
			functionSign: new Rectangle({
				width: 50,
				height: 20,
				fillColor: Color.black(),
				fillOpacity: 1.0
			}),
			valueBox: new ValueBox(),
			functionLabel: new TextLabel(),
			functionName: '',
			argument: 0,
			inputNames: ['argument'],
			outputNames: ['result']
		}
	}

	mutabilities(): object {
		return {
			functionSign: 'never',
			functionLabel: 'never',
			functionName: 'on_init'
		}
	}

	setup() {
		super.setup()
		this.add(this.valueBox)
		this.functionSign.update({
			anchor: [this.frameWidth / 2 - this.functionSign.frameWidth / 2, -this.functionSign.frameHeight]
		})
		this.functionLabel.update({
			text: this.functionName,
			fontSize: 12,
			frameWidth: this.functionSign.width,
			frameHeight: this.functionSign.height
		})
		this.functionSign.add(this.functionLabel)
		this.add(this.functionSign)
	}

	result(): any {
		return NaN
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.valueBox.update({ value: this.result() }, redraw)
	}

}











