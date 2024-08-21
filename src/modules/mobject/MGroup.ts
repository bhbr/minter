import { Mobject } from './Mobject'

export class MGroup extends Mobject {

	statefulSetup() {
		super.statefulSetup()
		// children may have been set as constructor args
		for (let submob of this.children) {
			this.add(submob)
		}
	}

}