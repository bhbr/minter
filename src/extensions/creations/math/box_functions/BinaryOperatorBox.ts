
import { NumberBox } from 'extensions/creations/math/boxes/NumberBox'
import { NumberListBox } from 'extensions/creations/math/boxes/NumberListBox'
import { Linkable } from 'core/linkables/Linkable'
import { Circle } from 'core/shapes/Circle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'

type operatorString = '+' | '–' | '&times;' | '/' | '<' | '≤' | '>' | '≥' | '=' | '≠' 

export class BinaryOperatorBox extends Linkable {

	operand1: number | Array<number>
	operand2: number | Array<number>
	operator: operatorString
	operatorSign: Circle
	operatorSignDict: object
	operatorLabel: TextLabel
	valueType: 'number' | 'Array<number>'
	valueBox: NumberBox | NumberListBox

	defaults(): object {
		return {
			operatorSignDict: { '–': '–' },
			operatorSign: new Circle({
				radius: 10,
				fillColor: Color.black(),
				fillOpacity: 1.0
			}),
			operatorLabel: new TextLabel(),
			operator: undefined,
			operand1: 0,
			operand2: 0,
			valueType: 'number',
			valueBox: new NumberBox(),
 			inputProperties: [
				{ name: 'operand1', displayName: null, type: 'number|Array<number>' },
				{ name: 'operand2', displayName: null, type: 'number|Array<number>' }
			],
			outputProperties: [
				{ name: 'result', displayName: null, type: 'number|Array<number>' }
			]
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
		this.add(this.valueBox)
		this.update({
			frameWidth: this.valueBox.frameWidth,
			frameHeight: this.valueBox.frameHeight
		})
		this.outputList.positionSelf()
		this.operatorSign.update({
			midpoint: [this.view.frame.width / 2, 0]
		})
		this.operatorLabel.update({
			text: this.operatorLabelText(),
			frameWidth: 2 * this.operatorSign.radius,
			frameHeight: 2 * this.operatorSign.radius
		})
		this.operatorLabel.view.div.style.fontSize = '14px'
		this.operatorSign.add(this.operatorLabel)
		this.add(this.operatorSign)
		if (this.valueBox instanceof NumberBox) {
			this.valueBox.inputElement.disabled = true
			this.valueBox.inputElement.value = ''
		} else if (this.valueBox instanceof NumberListBox) {
			this.valueBox.scroll.update({ list: [] })
		}
	}

	operatorLabelText(): string {
		return this.operatorSignDict[this.operator] ?? this.operator
	}

	setValueTypeTo(newType: 'number' | 'Array<number>') {
		if (this.valueType == 'number' && newType == 'Array<number>') {
			this.remove(this.valueBox)
			this.valueBox = new NumberListBox({
				value: this.result()
			})
		} else if (this.valueType == 'Array<number>' && newType == 'number') {
			this.remove(this.valueBox)
			this.valueBox = new NumberBox({
				value: this.result()
			})
			this.valueBox.inputElement.disabled = true
		} else {
			return
		}
		this.update({
			frameHeight: this.valueBox.frameHeight
		})
		this.outputList.positionSelf()
		this.add(this.valueBox)
		this.moveToTop(this.operatorSign)
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
		case '+':
			return a + b
		case '–':
			return a - b
		case '&times;':
			return a * b
		case '/':
			return a / b
		case '<':
			return a < b ? 1 : 0
		case '≤':
			return a <= b ? 1 : 0
		case '>':
			return a > b ? 1 : 0
		case '≥':
			return a >= b ? 1 : 0
		case '=':
			return a === b ? 1 : 0
		case '≠':
			return a !== b ? 1 : 0
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
		let oldOp1Type = typeof this.operand1
		let oldOp2Type = typeof this.operand2
		super.update(args, redraw)
		if (typeof this.operand1 != oldOp1Type || typeof this.operand2 != oldOp2Type) {
			if (typeof this.operand1 == 'number' && typeof this.operand2 == 'number') {
				this.setValueTypeTo('number')
			} else {
				this.setValueTypeTo('Array<number>')
			}
		}
		this.valueBox.update({ value: this.result() }, redraw)
	}

}

export class AddBox extends BinaryOperatorBox {
	defaults(): object {
		return {
			operator: '+',
 			inputProperties: [
				{ name: 'operand1', displayName: 'term', type: 'number|Array<number>' },
				{ name: 'operand2', displayName: 'term', type: 'number|Array<number>' }
			],
			outputProperties: [
				{ name: 'result', displayName: 'sum', type: 'number|Array<number>' }
			]
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
			operator: '–',
 			inputProperties: [
				{ name: 'operand1', displayName: 'minuend', type: 'number|Array<number>' },
				{ name: 'operand2', displayName: 'subtrahend', type: 'number|Array<number>' }
			],
			outputProperties: [
				{ name: 'result', displayName: 'difference', type: 'number|Array<number>' }
			]
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
			operator: '&times;',
 			inputProperties: [
				{ name: 'operand1', displayName: 'factor', type: 'number|Array<number>' },
				{ name: 'operand2', displayName: 'factor', type: 'number|Array<number>' }
			],
			outputProperties: [
				{ name: 'result', displayName: 'product', type: 'number|Array<number>' }
			]
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
			operator: '/',
 			inputProperties: [
				{ name: 'operand1', displayName: 'dividend', type: 'number|Array<number>' },
				{ name: 'operand2', displayName: 'divisor', type: 'number|Array<number>' }
			],
			outputProperties: [
				{ name: 'result', displayName: 'quotient', type: 'number|Array<number>' }
			]
		}
	}
	mutabilities(): object {
		return {
			operator: 'never'
		}
	}
}













