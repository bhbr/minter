
import { Histogram } from './Histogram.js'
import { SpanningCreator } from 'creators/SpanningCreator.js'

export class HistogramCreator extends SpanningCreator {

	defaults(): object {
		return {
			helpText: 'Shows the distribution of the entries of a number list as a histogram. The binning parameters and colors can be changed as input variables.'
		}
	}

	createMobject(): Histogram {
		let p = this.getStartPoint()
		return new Histogram({
			anchor: p,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height
		})
	}


}