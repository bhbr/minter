import { Mobject } from './Mobject'

export class Dependency {

	source: Mobject
	outputName: string
	target: Mobject
	inputName: string

	constructor(argsDict: object = {}) {
		this.source = argsDict['source']
		this.outputName = argsDict['outputName'] // may be undefined
		this.target = argsDict['target']
		this.inputName = argsDict['inputName'] // may be undefined
	}

	delete() {
		this.source.removeDependency(this)
	}
}
