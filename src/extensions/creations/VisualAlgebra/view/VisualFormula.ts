
import { getPaper } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Color } from 'core/classes/Color'
import { SentenceTree, SubtreeLocation } from '../model/SentenceTypes'
import { VisualSymbol } from './VisualSymbol'
import { VisualCalculation } from './VisualCalculation'
import { conditionTrigger } from 'core/functions/various'
import {
	FORMULA_BACKGROUND_COLOR,
	FORMULA_BORDER_COLOR,
	FORMULA_BORDER_WIDTH,
	FORMULA_BORDER_RADIUS,
	FORMULA_HIGHLIGHT_BACKGROUND_COLORS,
	FORMULA_HIGHLIGHT_BORDER_COLORS,
	FORMULA_HIGHLIGHT_BORDER_WIDTH,
} from './constants'

export class VisualFormula extends Mobject {

	subformulas: Array<VisualFormula>
	selectedSubformula: VisualFormula | null
	rootFormula: VisualFormula | null
	formulaTree: SentenceTree
	calculation: VisualCalculation | null
	location: SubtreeLocation
	fontSize: number

	defaults(): object {
		return {
			subformulas: [],
			borderWidth: FORMULA_BORDER_WIDTH,
			borderColor: FORMULA_BORDER_COLOR,
			borderRadius: FORMULA_BORDER_RADIUS,
			backgroundColor: FORMULA_BACKGROUND_COLOR,
			screenEventHandler: ScreenEventHandler.Self,
 			selectedSubformula: null,
 			rootFormula: null,
 			formulaTree: [],
 			location: [],
 			calculation: null,
 			fontSize: 28
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
		if (args['rootFormula'] !== undefined) {
			for (let child of this.subformulas) {
				child.update({
					rootFormula: this.rootFormula
				})
			}
		}
		if (args['fontSize'] !== undefined) {
			for (let f of this.subformulas) {
				f.update({
					fontSize: this.fontSize
				})
			}
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

	onTap(e: ScreenEvent) {
		if (this.rootFormula.selectedSubformula == this) {
			this.rootFormula.deselect(this.rootFormula.selectedSubformula)
			return
		}
		if (this.rootFormula.selectedSubformula) {
			this.rootFormula.deselect(this.rootFormula.selectedSubformula)
		}
		this.rootFormula.toggleSelection(this)
	}

	toggleSelection(f: VisualFormula) {
		if (this.rootFormula.selectedSubformula === null) {
			this.select(f)
		} else if (this.rootFormula.selectedSubformula === f) {
			this.deselect(f)
		} else {
			this.deselect(this.rootFormula.selectedSubformula)
			this.select(f)
		}
	}

	highlightBackgroundColor(): Color {
		if (this.rootFormula.calculation) {
			return this.rootFormula.calculation.highlightBackgroundColor()
		} else {
			return FORMULA_HIGHLIGHT_BACKGROUND_COLORS[0]
		}
	}

	highlightBorderColor(): Color {
		if (this.rootFormula.calculation) {
			return this.rootFormula.calculation.highlightBorderColor()
		} else {
			return FORMULA_HIGHLIGHT_BORDER_COLORS[0]
		}
	}

	select(f: VisualFormula) {
		this.update({
			selectedSubformula: f
		})
		f.highlightBackground()
		f.updateContent()
		if (this.rootFormula.calculation) {
			this.rootFormula.calculation.showPopover(f)
		}
	}

	deselect(f: VisualFormula) {
		this.update({
			selectedSubformula: null
		})
		f.unhighlightBackground()
		if (this.rootFormula.calculation) {
			if (this.rootFormula.calculation.popover) {
				f.remove(this.rootFormula.calculation.popover)
			}
		}
	}

	handlePopoverMessage(message: object) {
		let i = message['pick'] as number
		let newTree = this.rootFormula.calculation.algebra.replaceSubtreeInTree(
			this.rootFormula.formulaTree,
			this.rootFormula.selectedSubformula.formulaTree,
			this.rootFormula.calculation.popover.formulas[i].formulaTree
		)

		this.rootFormula.selectedSubformula.highlightBackground()

		let newFormula = this.rootFormula.calculation.maker.treeToVisual(newTree)
		this.rootFormula.calculation.addFormula(newFormula)
		this.rootFormula.calculation.update({
			popover: null
		})

		let transformedSubformula = newFormula.subformulaAtLocation(this.location)
		transformedSubformula.highlightBorder()

		if (this.rootFormula.calculation) {
			this.rootFormula.calculation.update({
				highlightColorIndex: (this.rootFormula.calculation.highlightColorIndex + 1) % 4
			})
		}
	}

	subformulaAtLocation(location: Array<number>): VisualFormula {
		var f = this as VisualFormula
		for (let index of location) {
			f = f.subformulas[index]
		}
		return f
	}

	highlightBorder() {
		this.update({
			borderColor: FORMULA_HIGHLIGHT_BORDER_COLORS[this.rootFormula.calculation.highlightColorIndex],
			borderWidth: FORMULA_HIGHLIGHT_BORDER_WIDTH
		})
	}

	unhighlightBorder() {
		this.update({
			borderColor: FORMULA_BORDER_COLOR,
			borderWidth: FORMULA_BORDER_WIDTH,
		})
	}

	highlightBackground() {
		this.update({
			backgroundColor: FORMULA_HIGHLIGHT_BACKGROUND_COLORS[this.rootFormula.calculation.highlightColorIndex]
		})
	}

	unhighlightBackground() {
		this.update({
			backgroundColor: FORMULA_BACKGROUND_COLOR
		})
	}





}




