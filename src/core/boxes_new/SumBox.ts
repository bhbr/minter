
import { NumberBox } from './NumberBox'
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { numberArraySum } from 'core/functions/numberArray'

export class SumBox extends NumberBox {
	
	argument: Array<number>
	functionSign: Rectangle
	functionLabel: TextLabel

	defaults(): object {
		return {
			argument: [],
			functionSign: new Rectangle({
				width: 50,
				height: 20,
				fillColor: Color.black(),
				fillOpacity: 1.0
			}),
			functionLabel: new TextLabel({ text: 'sum' }),
			inputProperties: [
				{ name: 'argument', type: 'Array<number>' }
			],
			outputProperties: [
				{ name: 'value', type: 'number' }
			]
		}
	}

	setup() {
		super.setup()
		this.functionSign.update({
			anchor: [this.frameWidth / 2 - this.functionSign.frameWidth / 2, -this.functionSign.frameHeight]
		})
		this.functionLabel.update({
			fontSize: 12,
			frameWidth: this.functionSign.width,
			frameHeight: this.functionSign.height
		})
		this.functionSign.add(this.functionLabel)
		this.add(this.functionSign)
	}

	result(): number {
		return numberArraySum(this.argument) 
	}

	update(args: object = {}, redraw: boolean = true) {
		args['value'] = this.result()
		super.update(args, redraw)
		//if (redraw) { this.view.redraw() }
	}




}