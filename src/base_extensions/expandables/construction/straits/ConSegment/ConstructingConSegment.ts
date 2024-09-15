import { ConstructingConStrait } from '../ConstructingConStrait'
import { ConSegment } from './ConSegment'

export class ConstructingConSegment extends ConstructingConStrait {

	segment: ConSegment

	statelessSetup() {
		super.statelessSetup()
		this.segment = new ConSegment()
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