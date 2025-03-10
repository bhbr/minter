
import { ValueBox } from '../ValueBox/ValueBox'
import { Circle } from 'core/shapes/Circle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'

export class BinaryOperatorBox extends ValueBox {

	operand1: number
	operand2: number
	operator: string
	operatorSign: Circle
	operatorLabel: TextLabel
	operatorDict: object

	ownDefaults(): object {
		return {
			operatorDict: {"+": "+", "–": "–", "&times;": "&times;", "/": "/"},
			operatorSign: new Circle({
				radius: 10,
				fillColor: Color.black(),
				fillOpacity: 1.0
			}),
			operatorLabel: new TextLabel(),
			operator: undefined,
			operand1: 0,
			operand2: 0,
			inputNames: ['operand1', 'operand2'],
			outputNames: ['result']
		}
	}

	ownMutabilities(): object {
		return {
			operatorDict: 'in_subclass',
			operatorSign: 'never',
			operatorLabel: 'never',
			operator: 'on_init'
		}
	}

	setup() {
		super.setup()
		this.operatorSign.update({
			midpoint: [this.view.frame.width / 2, 0]
		})
		this.operatorLabel.update({
			text: this.operatorDict[this.operator],
			frameWidth: 2 * this.operatorSign.radius,
			frameHeight: 2 * this.operatorSign.radius
		})
		this.operatorLabel.view.div.style.fontSize = '14px'
		this.operatorSign.add(this.operatorLabel)
		this.add(this.operatorSign)
	}

	result(): number {
		let a = this.operand1
		let b = this.operand2
		switch (this.operator) {
		case "+":
			return a + b
		case "–":
			return a - b
		case "&times;":
			return a * b
		case "/":
			return a / b
		}
		return 0
	}

	update(args: object = {}, redraw: boolean = true) {
		args['value'] = this.result()
		super.update(args, redraw)
	}

}

export class AddBox extends BinaryOperatorBox {
	ownDefaults(): object {
		return {
			operator: '+'
		}
	}
	ownMutabilities(): object {
		return {
			operator: 'never'
		}
	}
}

export class SubtractBox extends BinaryOperatorBox {
	ownDefaults(): object {
		return {
			operator: '–'
		}
	}
	ownMutabilities(): object {
		return {
			operator: 'never'
		}
	}
}

export class MultiplyBox extends BinaryOperatorBox {
	ownDefaults(): object {
		return {
			operator: '&times;'
		}
	}
	ownMutabilities(): object {
		return {
			operator: 'never'
		}
	}
}

export class DivideBox extends BinaryOperatorBox {
	ownDefaults(): object {
		return {
			operator: '/'
		}
	}
	ownMutabilities(): object {
		return {
			operator: 'never'
		}
	}
}













