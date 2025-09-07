
import { SequencePlot } from './SequencePlot'
import { SpanningCreator } from 'core/creators/SpanningCreator'

export class SequencePlotCreator extends SpanningCreator {

	createMobject(): SequencePlot {
		let p = this.getStartPoint()
		return new SequencePlot({
			anchor: p,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height
		})
	}


}