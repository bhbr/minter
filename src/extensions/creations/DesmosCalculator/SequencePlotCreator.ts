
import { SequencePlot } from './SequencePlot'
import { SpanningCreator } from 'core/creators/SpanningCreator'

export class SequencePlotCreator extends SpanningCreator {

	defaults(): object {
		return {
			helpText: 'Plots the entries of a number list as a graph.'
		}
	}

	createMobject(): SequencePlot {
		let p = this.getStartPoint()
		return new SequencePlot({
			anchor: p,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height
		})
	}


}