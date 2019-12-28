import { MGroup } from './mobject.js'
import { RoundedRectangle } from './shapes.js'
import { rgb } from './helpers.js'

export class IOList extends RoundedRectangle {
	constructor(argsDict) {
		super(argsDict)
		this.setAttributes({
			cornerRadius: 30,
			fillColor: rgb(1, 1, 1),
			fillOpacity: 0.1,
		})
	}
}

export class LinkableMobject extends MGroup {

	constructor(argsDict) {
		super(argsDict)
		this.setDefaults({
            inputs: [],  // linkable parameters
            outputs: [], // linkable parameters
            showInputs: false,
            showOutputs: false
        })

	}

	setShowInputs(flag) {
		this.showInputs = flag
		if (flag) {}
	}

}