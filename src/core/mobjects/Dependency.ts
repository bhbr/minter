
import { Mobject } from './Mobject'

export class Dependency {
/*
A dependency sets a property of one mobject (target) as the property of another (source).
So target.inputName will always be synced to source.outputName.
This class here is almost entirely representational, the actual updating is done in the
updating code in Mobject.
*/
	source: Mobject
	outputName: string | null
	target: Mobject
	inputName: string | null

	constructor(args: object = {}) {

		this.source = args['source']
		this.outputName = args['outputName']
		if (this.outputName === undefined) { this.outputName = null }

		this.target = args['target']
		this.inputName = args['inputName']
		if (this.inputName === undefined) { this.inputName = null }
			
	}

	delete() {
		this.source.removeDependency(this)
	}
}
