
import { getPaper } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Color } from 'core/classes/Color'
import { SentenceTree, SubtreeLocation } from '../model/SentenceTypes'
import { VisualSymbol } from './VisualSymbol'
import { VisualCalculation } from './VisualCalculation'
import { conditionTrigger } from 'core/functions/various'
import { FORMULA_BACKGROUND_COLOR, FORMULA_BORDER_COLOR, FORMULA_HIGHLIGHT_BACKGROUND_COLOR, FORMULA_HIGHLIGHT_BORDER_COLOR } from './constants'

export class VisualFormula extends Mobject {

	highlightedSubformula: VisualFormula | null
	rootFormula: VisualFormula | null
	formulaTree: SentenceTree
	calculation: VisualCalculation | null
	location: SubtreeLocation

	defaults(): object {
		return {
			borderWidth: 1,
			borderColor: FORMULA_BORDER_COLOR,
			borderRadius: 15,
			backgroundColor: FORMULA_BACKGROUND_COLOR,
			screenEventHandler: ScreenEventHandler.Self,
 			highlightedSubformula: null,
 			rootFormula: null,
 			formulaTree: [],
 			location: [],
 			calculation: null
		}
	}

	setup() {
		super.setup()
		conditionTrigger(
			this.fullyLoaded.bind(this),
			this.updateContent.bind(this)
		)
		if (!(this.parent instanceof VisualFormula)) {
			this.update({
				rootFormula: this
			})
		}
	}

	getValue(): number {
		return NaN
	}

	fullyLoaded(): boolean {
		return false
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['formulaTree'] !== undefined) {
			this.updateContent()
		}
	}

	getWidth(): number {
		return 100
	}

	getHeight(): number {
		return 50
	}

	updateContent() {
		this.update({
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})
	}

	onPointerUp(e: ScreenEvent) {
		if (this.rootFormula.highlightedSubformula) {
			this.rootFormula.unhighlight(this.rootFormula.highlightedSubformula)
		}
		this.rootFormula.toggleHighlight(this)
	}

	toggleHighlight(f: VisualFormula) {
		if (this.highlightedSubformula === null) {
			this.highlight(f)
		} else if (this.highlightedSubformula === f) {
			this.unhighlight(f)
		} else {
			this.unhighlight(this.highlightedSubformula)
			this.highlight(f)
		}
	}

	highlight(f: VisualFormula) {
		this.highlightedSubformula = f
		f.update({
			backgroundColor: FORMULA_HIGHLIGHT_BACKGROUND_COLOR,
			borderColor: FORMULA_HIGHLIGHT_BORDER_COLOR
		})
		f.updateContent()
		if (this.calculation) {
			this.calculation.showPopover(f)
		}
	}

	unhighlight(f: VisualFormula) {
		this.highlightedSubformula = null
		f.update({
			backgroundColor: FORMULA_BACKGROUND_COLOR,
			borderColor: FORMULA_BORDER_COLOR
		})
		if (this.calculation) {
			if (this.calculation.popover) {
				f.remove(this.calculation.popover)
			}
		}
	}

	handlePopoverMessage(message: object) {
		let i = message['pick'] as number
		let newTree = this.rootFormula.calculation.algebra.replaceSubtreeInTree(
			this.rootFormula.formulaTree,
			this.rootFormula.highlightedSubformula.formulaTree,
			this.rootFormula.calculation.popover.formulas[i].formulaTree
		)
		this.rootFormula.unhighlight(this.rootFormula.highlightedSubformula)
		let newFormula = this.rootFormula.calculation.maker.treeToVisual(newTree)
		this.rootFormula.calculation.addFormula(newFormula)
		this.rootFormula.calculation.update({
			popover: null
		})
	}


}




