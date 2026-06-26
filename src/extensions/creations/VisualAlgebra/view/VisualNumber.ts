
import { VisualSymbol } from './VisualSymbol'
import { VisualFormula } from './VisualFormula'
import { FORMULA_PADDING } from './constants'
import { log } from 'core/functions/logging'

export class VisualNumber extends VisualFormula {
	
	value: number
	symbol: VisualSymbol

	defaults(): object {
		return {
			value: NaN,
			symbol: new VisualSymbol()
		}
	}

	setup() {
		super.setup()
		this.add(this.symbol)
	}

	getValue(): number {
		return this.value
	}

	updateContent() {
		this.symbol.update({
			anchor: [FORMULA_PADDING, FORMULA_PADDING],
			texString: `${this.value}`
		})
		this.view.update({
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})
	}

	getWidth(): number {
		return this.symbol.getWidth() + 2 * FORMULA_PADDING
	}

	getHeight(): number {
		return this.symbol.getHeight() + 2 * FORMULA_PADDING
	}

}
