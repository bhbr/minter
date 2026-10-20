
import { ConStraitConstructor } from '../ConStraitConstructor.js'
import { ConSegment } from './ConSegment.js'

export class ConSegmentConstructor extends ConStraitConstructor {

	segment: ConSegment

	defaults(): object {
		return {
			segment: new ConSegment()
		}
	}

	mutabilities(): object {
		return {
			segment: 'never'
		}
	}

	setup() {
		super.setup()
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