
import { VisualSymbol } from './VisualSymbol'
import { VisualFormula } from './VisualFormula'
import { FORMULA_PADDING } from './constants'
import { log } from 'core/functions/logging'
import { AlgebraParser } from '../model/AlgebraParser'

export class VisualGroup extends VisualFormula {

	parenType: '(' | '[' | '{' | '\\{'
	child: VisualFormula
	openParenSymbol: VisualSymbol
	closeParenSymbol: VisualSymbol
	parser: AlgebraParser

	defaults(): object {
		return {
			parenType: '(',
			openParenSymbol: new VisualSymbol(),
			closeParenSymbol: new VisualSymbol(),
			child: new VisualFormula({
				rootFormula: this.rootFormula
			}),
			parser: new AlgebraParser(),
			fontSize: 28
		}
	}

	getValue(): number {
		return this.child.getValue()
	}

	setup() {
		super.setup()
		this.add(this.openParenSymbol)
		this.add(this.child)
		this.child.update({
			rootFormula: this.rootFormula
		})
		this.add(this.closeParenSymbol)
		if (this.parenType == '{') {
			this.update({
				borderWidth: 0
			})
		}
	}

	updateContent() {
		let maxHeight = Math.max(this.openParenSymbol.getHeight(), this.child.getHeight(), this.openParenSymbol.getHeight())

		this.openParenSymbol.update({
			anchor: [
				FORMULA_PADDING,
				FORMULA_PADDING + 0.5 * (maxHeight - this.openParenSymbol.getHeight())
			],
			texString: this.parenType
		})
		this.child.update({
			anchor: [
				this.openParenSymbol.getWidth() +  2 * FORMULA_PADDING,
				FORMULA_PADDING + 0.5 * (maxHeight - this.child.getHeight())
			]
		})
		this.closeParenSymbol.update({
			texString: this.parser.closingParens[this.parenType],
			anchor: [
				this.openParenSymbol.getWidth() + this.child.getWidth() + 3 * FORMULA_PADDING,
				FORMULA_PADDING + 0.5 * (maxHeight - this.closeParenSymbol.getHeight())
			]
		})

		super.updateContent()
	}

	getWidth(): number {
		return this.openParenSymbol.getWidth() + this.child.getWidth() + this.closeParenSymbol.getWidth() + 4 * FORMULA_PADDING
	}

	getHeight(): number {
		return Math.max(this.openParenSymbol.getHeight(), this.child.getHeight(), this.closeParenSymbol.getHeight()) + 2 * FORMULA_PADDING
	}

	fullyLoaded(): boolean {
		return this.child.fullyLoaded()
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['fontSize'] !== undefined) {
			this.child.update({
				fontSize: this.fontSize
			})
		}
	}


}