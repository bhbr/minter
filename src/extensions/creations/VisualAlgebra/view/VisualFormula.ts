
import { getPaper } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Color } from 'core/classes/Color'
import { SentenceTree } from '../model/SentenceTypes'
import { VisualSymbol } from './VisualSymbol'
import { VisualFormulaSensor } from './VisualFormulaSensor'
import { VisualCalculation } from './VisualCalculation'

export class VisualFormula extends Mobject {

	mathQuillLoadingID: number | null
	declare sensor: VisualFormulaSensor
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
 			sensor: new VisualFormulaSensor(),
 			highlightedSubformula: null,
 			rootFormula: null,
 			formulaTree: [],
 			calculation: null
		}
	}

	setup() {
		log('VisualSymbol.setup')
		super.setup()
		this.sensor.update({
			mobject: this
		})
		if (!(this.parent instanceof VisualFormula)) {
			this.update({
				rootFormula: this
			})
		}
	}

	getValue(): number {
		return NaN
	}

	update(args: object = {}, redraw: boolean = true) {
		log('VisualSymbol.update')
		super.update(args, redraw)
		if (!getPaper().loadedAPIs.includes('mathquill') && this.mathQuillLoadingID === null) {
			log('starting loop...')
			this.mathQuillLoadingID = window.setInterval(function() {
				log('in the loop')
				log(getPaper().loadedAPIs)
				if (getPaper().loadedAPIs.includes('mathquill')) {
					this.updateContent()
					log(this.mathQuillLoadingID)
					window.clearInterval(this.mathQuillLoadingID)
					log('...ended loop.')
				}
			}.bind(this), 100)
		} else {
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
		log('VisualFormula.updateContent (empty)')
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
		if (this.calculation) {
			this.calculation.showPossibleTransformations(this)
		}
	}

	unhighlight(f: VisualFormula) {
		this.highlightedSubformula = null
		f.update({
			backgroundColor: Color.clear()
		})
		if (this.calculation) {
			this.calculation.hidePossibleTransformations(this)
		}
	}


}




