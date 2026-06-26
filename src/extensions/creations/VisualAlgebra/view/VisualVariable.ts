
import { VisualSymbol } from './VisualSymbol'
import { VisualFormula } from './VisualFormula'
import { FORMULA_PADDING } from './constants'
import { getPaper } from 'core/functions/getters'
import { log } from 'core/functions/logging'

export class VisualVariable extends VisualFormula {

	name: string
	symbol: VisualSymbol

	defaults(): object {
		return {
			name: 'x',
			symbol: new VisualSymbol()
		}
	}

	setup() {
		log('VisualVariable.setup')
		super.setup()
		this.add(this.symbol)
	}

	getValue(): number {
		return getPaper().globals[this.name] ?? NaN
	}

	updateContent() {
		log(`VisualVariable.updateContent to ${this.getWidth()} ${this.getHeight()}`)
		this.symbol.update({
			anchor: [FORMULA_PADDING, FORMULA_PADDING],
			texString: this.name
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