
import { SpanningCreator } from 'core/creators/SpanningCreator'
import { DesmosCalculator } from './DesmosCalculator'

export class DesmosCalculatorCreator extends SpanningCreator {

	createMobject(): DesmosCalculator {
		return new DesmosCalculator({
			anchor: this.getStartPoint(),
			frameWidth: this.frameWidth,
			frameHeight: this.frameHeight
		})
	}

	
}