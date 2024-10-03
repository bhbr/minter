
import { ConStraitConstructor } from '../ConStraitConstructor'
import { ConLine } from './ConLine'

export class ConLineConstructor extends ConStraitConstructor {

	line: ConLine

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'line'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			line: new ConLine()
		})
	}

	setup() {
		super.setup()
		this.add(this.line)
		this.line.update({
			startPoint: this.startFreePoint.midpoint,
			endPoint: this.endFreePoint.midpoint
		})
		this.startFreePoint.addDependency('midpoint', this.line, 'startPoint')
		this.endFreePoint.addDependency('midpoint', this.line, 'endPoint')
		this.addDependency('penStrokeColor', this.line, 'strokeColor')
	}


}