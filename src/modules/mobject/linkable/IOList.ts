import { Mobject } from '../Mobject'
import { MGroup } from '../MGroup'
import { InputList } from './InputList'
import { OutputList } from './OutputList'

export class IOList extends MGroup {

	inputList: InputList
	outputList: OutputList
	listInputNames: Array<string>
	listOutputNames: Array<string>
	mobject: Mobject

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			listInputNames: [],
			listOutputNames: []
		})
	}

	statelessSetup() {
		this.inputList = new InputList()
		this.outputList = new OutputList()
	}

	statefulSetup() {
		super.statefulSetup()
		this.inputList.listInputNames = this.listInputNames
		this.outputList.listOutputNames = this.listOutputNames
		this.inputList.mobject = this.mobject
		this.outputList.mobject = this.mobject
		this.inputList.statefulSetup()  // rework this
		this.outputList.statefulSetup() // rework this
		this.add(this.inputList)
		this.add(this.outputList)
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		this.inputList.updateModel(argsDict)
		this.outputList.updateModel(argsDict)
	}
}