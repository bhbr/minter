import { ConstructingConArrow } from '../ConstructingConArrow'
import { ConLine } from './ConLine'

export class ConstructingConLine extends ConstructingConArrow {

	line: ConLine

	statelessSetup() {
		super.statelessSetup()
		this.line = new ConLine()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.line)
		this.line.update({
			startPoint: this.startFreePoint.midpoint,
			endPoint: this.endFreePoint.midpoint
		} ,false)
		this.startFreePoint.addDependency('midpoint', this.line, 'startPoint')
		this.endFreePoint.addDependency('midpoint', this.line, 'endPoint')
		this.addDependency('penStrokeColor', this.line, 'strokeColor')
	}


}