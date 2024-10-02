
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

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'operator',
			'operatorSign',
			'operatorLabel',
			'operatorDict'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			operand1: 0,
			operand2: 0,
			operator: "+",
			inputNames: ['operand1', 'operand2'],
			outputNames: ['result'],
			operatorDict: {"+": "+", "–": "–", "&times;": "&times;", "/": "/"},
			operatorSign: new Circle({
				radius: 10,
				fillColor: Color.black(),
				fillOpacity: 1.0
			}),
			operatorLabel: new TextLabel()
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

	updateModel(argsDict: object = {}) {
		argsDict['value'] = this.result()
		super.updateModel(argsDict)
	}

}

export class AddBox extends BinaryOperatorBox {
	defaults(): object {
		return Object.assign(super.defaults(), {
			operator: '+'
		})
	}
}

export class SubtractBox extends BinaryOperatorBox {
	defaults(): object {
		return Object.assign(super.defaults(), {
			operator: "–"
		})
	}
}

export class MultiplyBox extends BinaryOperatorBox {
	defaults(): object {
		return Object.assign(super.defaults(), {
			operator: "&times;"
		})
	}
}

export class DivideBox extends BinaryOperatorBox {
	defaults(): object {
		return Object.assign(super.defaults(), {
			operator:  "/"
		})
	}
}














