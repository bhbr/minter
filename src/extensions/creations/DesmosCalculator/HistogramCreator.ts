
import { Histogram } from './Histogram'
import { SpanningCreator } from 'core/creators/SpanningCreator'

export class HistogramCreator extends SpanningCreator {

	createdMobject(): Histogram {
		let p = this.getStartPoint()
		return new Histogram({
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