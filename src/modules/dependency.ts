import { Mobject } from './mobject'

export class Dependency {

	source: Mobject
	outputName: string
	target: Mobject
	inputName: string

	constructor(args: object = {}) {
		this.source = args['source']
		this.outputName = args['outputName'] // may be undefined
		this.target = args['target']
		this.inputName = args['inputName'] // may be undefined
	}
}
