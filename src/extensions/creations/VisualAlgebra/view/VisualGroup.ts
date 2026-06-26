
import { VisualSymbol } from './VisualSymbol'
import { VisualFormula } from './VisualFormula'
import { FORMULA_PADDING } from './constants'
import { log } from 'core/functions/logging'
import { TeXParser } from '../model/TeXParser'

export class VisualGroup extends VisualFormula {

	parenType: '(' | '[' | '{' | '\\{'
	child: VisualFormula
	openParenSymbol: VisualSymbol
	closeParenSymbol: VisualSymbol

	defaults(): object {
		return {
			parenType: '(',
			openParenSymbol: new VisualSymbol(),
			closeParenSymbol: new VisualSymbol(),
			child: new VisualFormula({
				rootFormula: this.rootFormula
			})
		}
	}

	getValue(): number {
		return this.child.getValue()
	}

	setup() {
		log('VisualGroup.setup')
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
		log('VisualGroup.updateContent')

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
			texString: TeXParser.closingParens[this.parenType],
			anchor: [
				this.openParenSymbol.getWidth() + this.child.getWidth() + 3 * FORMULA_PADDING,
				FORMULA_PADDING + 0.5 * (maxHeight - this.closeParenSymbol.getHeight())
			]
		})

		this.view.update({
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})

	}

	getWidth(): number {
		return this.openParenSymbol.getWidth() + this.child.getWidth() + this.closeParenSymbol.getWidth() + 4 * FORMULA_PADDING
	}

	getHeight(): number {
		return Math.max(this.openParenSymbol.getHeight(), this.child.getHeight(), this.closeParenSymbol.getHeight()) + 2 * FORMULA_PADDING
	}
}