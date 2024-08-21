import { ConstructingArrow } from './ConstructingArrow'
import { Line } from '../arrows/Line'

export class ConstructingLine extends ConstructingArrow {

	line: Line

	statelessSetup() {
		super.statelessSetup()
		this.line = new Line()
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