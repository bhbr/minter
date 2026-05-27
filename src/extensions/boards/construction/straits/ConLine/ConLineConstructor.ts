
import { ConStraitConstructor } from '../ConStraitConstructor'
import { ConLine } from './ConLine'

export class ConLineConstructor extends ConStraitConstructor {

	line: ConLine

	constructor(args: object = {}) {
		super(args)
	}

	defaults(): object {
		return {
			line: new ConLine()
		}
	}

	mutabilities(): object {
		return {
			line: 'never'
		}
	}

	setup() {
		super.setup()
		this.add(this.line)
		this.startFreePoint.addDependency('midpoint', this.line, 'startPoint')
		this.endFreePoint.addDependency('midpoint', this.line, 'endPoint')
		this.addDependency('penStrokeColor', this.line, 'strokeColor')

		this.line.update({
			startPoint: this.startFreePoint.midpoint,
			endPoint: this.endFreePoint.midpoint,
			strokeColor: this.penStrokeColor
		})
	}


}