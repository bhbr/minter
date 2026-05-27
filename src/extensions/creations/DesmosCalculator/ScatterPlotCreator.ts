
import { ScatterPlot } from './ScatterPlot'
import { SpanningCreator } from 'core/creators/SpanningCreator'

export class ScatterPlotCreator extends SpanningCreator {

	defaults(): object {
		return {
			helpText: 'Plots the entries of two number lists as a scatter plot.'
		}
	}

	createMobject(): ScatterPlot {
		let p = this.getStartPoint()
		return new ScatterPlot({
			anchor: p,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height
		})
	}


}