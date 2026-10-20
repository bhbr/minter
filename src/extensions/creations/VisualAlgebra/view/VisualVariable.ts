
import { VisualSymbol } from './VisualSymbol.js'
import { VisualFormula } from './VisualFormula.js'
import { FORMULA_PADDING } from './constants.js'
import { getPaper } from 'functions/getters.js'
import { log } from 'functions/logging.js'
import { Color } from 'classes/Color.js'

export class VisualVariable extends VisualFormula {

	name: string
	symbol: VisualSymbol | null

	defaults(): object {
		return {
			name: 'x',
			symbol: null,
			borderWidth: 0,
			backgroundColor: Color.clear()
		}
	}

	setup() {
		this.symbol = new VisualSymbol({ texString: this.name })
		this.add(this.symbol)
		//this.disable()
		super.setup()
	}

	getValue(): number {
		return getPaper().globals[this.name] ?? NaN
	}

	fullyLoaded(): boolean {
		return this.symbol.fullyLoaded()
	}

	updateContent() {
		if (this.symbol) {
			this.symbol.update({
				anchor: [FORMULA_PADDING, FORMULA_PADDING],
				texString: this.name
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

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['fontSize'] !== undefined) {
			this.symbol.update({
				fontSize: this.fontSize
			})
		}
	}

	
}
