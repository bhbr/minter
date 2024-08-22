import { ValueBox } from './ValueBox'
import { Circle } from '../shapes/Circle'
import { TextLabel } from '../TextLabel'
import { Color } from '../helpers/Color'
import { Vertex } from '../helpers/Vertex'
import { log } from '../helpers/helpers'

export class BinaryOperatorBox extends ValueBox {

	operand1: number
	operand2: number
	operator: string
	operatorSign: Circle
	operatorLabel: TextLabel
	operatorDict: object

	defaultsArgs(): object {
		return Object.assign(super.defaultArgs(), {
			operand1: 0,
			operand2: 0,
			operator: "+"
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			inputNames: ['operand1', 'operand2'],
			outputNames: ['result'],
			operatorDict: {"+": "+", "–": "–", "&times;": "&times;", "/": "/"}
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.operatorSign = new Circle({
			midpoint: new Vertex(this.viewWidth / 2, 0),
			radius: 10,
			fillColor: Color.black(),
			fillOpacity: 1.0
		})
		this.operatorLabel = new TextLabel({
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

	updateModel(argsDict) {
		argsDict['value'] = this.result()
		super.updateModel(argsDict)
	}

}

export class AddBox extends BinaryOperatorBox {
	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			operator: "+"
		})
	}
}

export class SubtractBox extends BinaryOperatorBox {
	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			operator: "–"
		})
	}
}

export class MultiplyBox extends BinaryOperatorBox {
	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			operator: "&times;"
		})
	}
}

export class DivideBox extends BinaryOperatorBox {
	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			operator: "/"
		})
	}
}

















