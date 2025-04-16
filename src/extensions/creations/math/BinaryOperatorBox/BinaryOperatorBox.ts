
import { ValueBox } from '../ValueBox/ValueBox'
import { Circle } from 'core/shapes/Circle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'

type operatorString = "+" | "–" | "&times;" | "/"

export class BinaryOperatorBox extends ValueBox {

	operand1: number | Array<number>
	operand2: number | Array<number>
	operator: operatorString
	operatorSign: Circle
	operatorLabel: TextLabel
	operatorDict: object

	defaults(): object {
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

	mutabilities(): object {
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

	result(): number | Array<number> {
		let a = this.operand1
		let b = this.operand2
		return this.compute(a, b, this.operator)
	}

	compute(a: number | Array<number>, b: number | Array<number>, op: operatorString): number | Array<number> {
		if (typeof a == 'number' && typeof b == 'number') {
			return this.computeNumberAndNumber(a, b, op)
		} else if (a instanceof Array && typeof b == 'number') {
			return this.computeArrayAndNumber(a, b, op)
		} else if (typeof a == 'number' && b instanceof Array) {
			return this.computeNumberAndArray(a, b, op)
		} else if (a instanceof Array && b instanceof Array) {
			return this.computeArrayAndArray(a, b, op)
		}
	}

	computeNumberAndNumber(a: number, b: number, op: operatorString): number {
		switch (op) {
		case "+":
			return a + b
		case "–":
			return a - b
		case "&times;":
			return a * b
		case "/":
			return a / b
		}
	}

	computeArrayAndNumber(a: Array<number>, b: number, op: operatorString): Array<number> {
		return a.map((v) => this.compute.bind(this)(v, b, op))
	}

	computeNumberAndArray(a: number, b: Array<number>, op: operatorString): Array<number> {
		return b.map((v) => this.compute.bind(this)(a, v, op))
	}

	computeArrayAndArray(a: Array<number>, b: Array<number>, op: operatorString): Array<number> {
		if (a.length != b.length) { return [] }
		let r: Array<number> = []
		for (var i = 0; i < a.length; i++) {
			r.push(this.computeNumberAndNumber(a[i], b[i], op))
		}
		return r
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		super.update({ value: this.result() }, redraw)
	}

}

export class AddBox extends BinaryOperatorBox {
	defaults(): object {
		return {
			operator: '+'
		}
	}
	mutabilities(): object {
		return {
			operator: 'never'
		}
	}
}

export class SubtractBox extends BinaryOperatorBox {
	defaults(): object {
		return {
			operator: '–'
		}
	}
	mutabilities(): object {
		return {
			operator: 'never'
		}
	}
}

export class MultiplyBox extends BinaryOperatorBox {
	defaults(): object {
		return {
			operator: '&times;'
		}
	}
	mutabilities(): object {
		return {
			operator: 'never'
		}
	}
}

export class DivideBox extends BinaryOperatorBox {
	defaults(): object {
		return {
			operator: '/'
		}
	}
	mutabilities(): object {
		return {
			operator: 'never'
		}
	}
}













