
import { SpanningCreator } from 'core/creators/SpanningCreator'
import { DesmosCalculator } from './DesmosCalculator'

export class DesmosCalculatorCreator extends SpanningCreator {

	createdMobject(): DesmosCalculator {
		let p = this.getStartPoint()
		return new DesmosCalculator({
			anchor: p,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height
		})
	}

	dissolve() {
		let cm = this.createdMobject()
		this.parent.addToContent(cm)
		this.parent.remove(this)
	}
	
}