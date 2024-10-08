
import { ValueBox } from '../ValueBox/ValueBox'
import { Circle } from 'core/shapes/Circle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Vertex } from 'core/classes/vertex/Vertex'

export class BinaryOperatorBox extends ValueBox {

	operand1: number
	operand2: number
	operator: string
	operatorSign: Circle
	operatorLabel: TextLabel
	operatorDict: object

	fixedValues(): object {
		return Object.assign(super.fixedValues(), {
			operatorDict: {"+": "+", "–": "–", "&times;": "&times;", "/": "/"},
			operatorSign: new Circle({
				radius: 10,
				fillColor: Color.black(),
				fillOpacity: 1.0
			}),
			operatorLabel: new TextLabel()
		})
	}

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'operator'
		])
	}

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			operand1: 0,
			operand2: 0,
			inputNames: ['operand1', 'operand2'],
			outputNames: ['result'],
		})
	}

	setup() {
		super.setup()
		this.operatorSign.update({
			midpoint: new Vertex(this.viewWidth / 2, 0)
		})
		this.operatorLabel.update({
			text: this.operatorDict[this.operator],
			viewWidth: 2 * this.operatorSign.radius,
			viewHeight: 2 * this.operatorSign.radius
		})
		this.operatorLabel.view.style.fontSize = '14px'
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
	fixedValues(): object {
		return Object.assign(super.fixedValues(), {
			operator: '+'
		})
	}
}

export class SubtractBox extends BinaryOperatorBox {
	fixedValues(): object {
		return Object.assign(super.fixedValues(), {
			operator: "–"
		})
	}
}

export class MultiplyBox extends BinaryOperatorBox {
	fixedValues(): object {
		return Object.assign(super.fixedValues(), {
			operator: "&times;"
		})
	}
}

export class DivideBox extends BinaryOperatorBox {
	fixedValues(): object {
		return Object.assign(super.fixedValues(), {
			operator:  "/"
		})
	}
}














