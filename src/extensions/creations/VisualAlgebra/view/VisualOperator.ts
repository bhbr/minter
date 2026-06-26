
import { VisualSymbol } from './VisualSymbol'
import { VisualFormula } from './VisualFormula'
import { FORMULA_PADDING } from './constants'
import { log } from 'core/functions/logging'

export class VisualOperator extends VisualFormula {

	operator: string
	operatorSymbol: VisualSymbol
	child1: VisualFormula
	child2: VisualFormula

	defaults(): object {
		return {
			operator: '+',
			operatorSymbol: new VisualSymbol(),
			child1: new VisualFormula({
				rootFormula: this.rootFormula
			}),
			child2: new VisualFormula({
				rootFormula: this.rootFormula
			})
		}
	}

	getValue(): number {
		let a = this.child1.getValue()
		let b = this.child2.getValue()
		switch (this.operator) {
		case '+':
			return a + b
		case '-':
			return a - b
		case '\\cdot':
			return a * b
		case '*':
			return a * b
		case '/':
			return a / b
		case '^':
			return a ** b
		default:
			return NaN
		}
	}

	setup() {
		log('VisualOperator.setup')
		super.setup()
		this.add(this.operatorSymbol)
		this.add(this.child1)
		this.add(this.child2)
		this.child1.update({
			rootFormula: this.rootFormula
		})
		this.child2.update({
			rootFormula: this.rootFormula
		})
	}

	updateContent() {

		log('VisualOperator.updateContent')

		let maxHeight = Math.max(this.child1.getHeight(), this.operatorSymbol.getHeight(), this.child2.getHeight())

		this.child1.update({
			anchor: [
				FORMULA_PADDING,
				FORMULA_PADDING + 0.5 * (maxHeight - this.child1.getHeight())
			]
		})

		let displayOperator = (this.operator == '*') ? '\\cdot' : this.operator

		this.operatorSymbol.update({
			texString: displayOperator,
			anchor: [
				this.child1.getWidth() + 2 * FORMULA_PADDING,
				FORMULA_PADDING + 0.5 * (maxHeight - this.operatorSymbol.getHeight())
			]
		})

		this.child2.update({
			anchor: [
				this.operatorSymbol.anchor[0] + this.operatorSymbol.getWidth() + FORMULA_PADDING,
				FORMULA_PADDING + 0.5 * (maxHeight - this.child2.getHeight())
			]
		})

		this.view.update({
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})
	}

	getWidth(): number {
		return this.child1.getWidth() + this.operatorSymbol.getWidth() + this.child2.getWidth() + 4 * FORMULA_PADDING
	}

	getHeight(): number {
		return Math.max(this.child1.getHeight(), this.operatorSymbol.getHeight(), this.child2.getHeight()) + 2 * FORMULA_PADDING
	}

}