import { DrawnArrow } from './DrawnArrow'
import { Segment } from '../arrows/Segment'
import { log } from '../helpers/helpers'

export class DrawnSegment extends DrawnArrow {

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
		log(this.startFreePoint.midpoint)
		log(this.endFreePoint.midpoint)
		log(this.segment.startPoint)
		log(this.segment.endPoint)

	}

}