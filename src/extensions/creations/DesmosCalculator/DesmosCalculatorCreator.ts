
import { SpanningCreator } from 'creators/SpanningCreator.js'
import { DesmosCalculator } from './DesmosCalculator.js'

export class DesmosCalculatorCreator extends SpanningCreator {

	createMobject(): DesmosCalculator {
		return new DesmosCalculator({
			anchor: this.getStartPoint(),
			frameWidth: this.frameWidth,
			frameHeight: this.frameHeight
		})
	}

	
}