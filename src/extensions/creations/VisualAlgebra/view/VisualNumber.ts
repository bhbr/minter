
import { VisualSymbol } from './VisualSymbol'
import { VisualFormula } from './VisualFormula'
import { FORMULA_PADDING } from './constants'
import { log } from 'core/functions/logging'

export class VisualNumber extends VisualFormula {
	
	value: number
	symbol: VisualSymbol | null

	defaults(): object {
		return {
			value: NaN,
			symbol: null
		}
	}

	setup() {
		this.symbol = new VisualSymbol({ texString: `${this.value}` })
		this.add(this.symbol)
		super.setup()
	}

	getValue(): number {
		return this.value
	}

	fullyLoaded(): boolean {
		return this.symbol.fullyLoaded()
	}

	updateContent() {
		if (this.symbol) {
			this.symbol.update({
				anchor: [FORMULA_PADDING, FORMULA_PADDING],
				texString: `${this.value}`
			})
		}
		super.updateContent()
	}

	getWidth(): number {
		if (this.symbol) {
			return this.symbol.getWidth() + 2 * FORMULA_PADDING
		} else {
			return 0
		}
	}

	getHeight(): number {
		if (this.symbol) {
			return this.symbol.getHeight() + 2 * FORMULA_PADDING
		} else {
			return 0
		}
	}

}
