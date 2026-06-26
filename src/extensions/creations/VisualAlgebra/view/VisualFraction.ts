
import { VisualFormula } from './VisualFormula'
import { VisualOperator } from './VisualOperator'
import { FORMULA_PADDING } from './constants'
import { Line } from 'core/shapes/Line'
import { log } from 'core/functions/logging'

export class VisualFraction extends VisualOperator {

	fractionBar: Line

	defaults(): object {
		return {
			operator: '/',
			fractionBar: new Line()
		}
	}

	mutabilities(): object {
		return {
			operator: 'never'
		}
	}

	get numerator(): VisualFormula {
		return this.child1
	}
	set numerator(newValue: VisualFormula) {
		this.child1 = newValue
	}

	get denominator(): VisualFormula {
		return this.child2
	}
	set denominator(newValue: VisualFormula) {
		this.child2 = newValue
	}

	setup() {
		super.setup()
		this.remove(this.operatorSymbol)
		this.add(this.fractionBar)
	}

	updateContent() {
		let barWidth = Math.max(this.numerator.getWidth(), this.denominator.getWidth()) + 2 * FORMULA_PADDING
		this.numerator.update({
			anchor: [
				0.5 * (barWidth - this.numerator.getWidth()) + FORMULA_PADDING,
				FORMULA_PADDING
			]
		})
		this.fractionBar.update({
			startPoint: [FORMULA_PADDING, this.numerator.getHeight() + FORMULA_PADDING],
			endPoint: [this.getWidth() - FORMULA_PADDING, this.numerator.getHeight() + FORMULA_PADDING]
		})
		this.denominator.update({
			anchor: [
				0.5 * (barWidth - this.denominator.getWidth()) + FORMULA_PADDING,
				this.numerator.getHeight() + 2 * FORMULA_PADDING
			]
		})
		this.numerator.updateContent()
		this.denominator.updateContent()
		this.view.update({
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})
	}

	getWidth(): number {
		return Math.max(this.numerator.getWidth(), this.denominator.getWidth()) + 2 * FORMULA_PADDING
	}

	getHeight(): number {
		return this.numerator.getHeight() + this.denominator.getHeight() + 4 * FORMULA_PADDING
	}


}