
import { getPaper } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Color } from 'core/classes/Color'
import { SentenceTree } from '../model/SentenceTypes'
import { VisualSymbol } from './VisualSymbol'
import { VisualCalculation } from './VisualCalculation'
import { conditionTrigger } from 'core/functions/various'

export class VisualFormula extends Mobject {

	highlightedSubformula: VisualFormula | null
	rootFormula: VisualFormula | null
	formulaTree: SentenceTree
	calculation: VisualCalculation | null

	defaults(): object {
		return {
			borderColor: Color.white(),
			borderWidth: 1,
			mathQuillLoadingID: null,
			screenEventHandler: ScreenEventHandler.Self,
 			highlightedSubformula: null,
 			rootFormula: null,
 			formulaTree: [],
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
			backgroundColor: Color.red()
		})
		f.updateContent()
		if (this.calculation) {
			this.calculation.showPossibleTransformations(f)
		}
	}

	unhighlight(f: VisualFormula) {
		this.highlightedSubformula = null
		f.update({
			backgroundColor: Color.clear()
		})
		if (this.calculation) {
			this.calculation.hidePossibleTransformations(f)
		}
	}

	handlePopoverMessage(message: object) {
		let i = message['pick'] as number
		this.calculation.addFormula(this.calculation.popover.formulas[i])
	}


}




