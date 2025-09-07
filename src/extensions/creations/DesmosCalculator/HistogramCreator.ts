
import { Histogram } from './Histogram'
import { SpanningCreator } from 'core/creators/SpanningCreator'

export class HistogramCreator extends SpanningCreator {

	createMobject(): Histogram {
		let p = this.getStartPoint()
		return new Histogram({
			anchor: p,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height
		})
	}


}