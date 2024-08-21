import { ConstructingArrow } from './ConstructingArrow'
import { Segment } from '../arrows/Segment'
import { log } from '../helpers/helpers'

export class ConstructingSegment extends ConstructingArrow {

	segment: Segment

	statelessSetup() {
		super.statelessSetup()
		this.segment = new Segment()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.segment)
		this.segment.update({
			startPoint: this.startFreePoint.midpoint,
			endPoint: this.endFreePoint.midpoint
		})
		this.startFreePoint.addDependency('midpoint', this.segment, 'startPoint')
		this.endFreePoint.addDependency('midpoint', this.segment, 'endPoint')
		this.addDependency('penStrokeColor', this.segment, 'strokeColor')
	}

}