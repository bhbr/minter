import { Mobject } from './Mobject'

export class MGroup extends Mobject {
/*
MGroup (a group of mobjects) is essentially a synonym for Mobject.
*/
	statefulSetup() {
		super.statefulSetup()
		// Children may have been set as constructor arguments
		// and need not be added explicitly, this setup does it.
		for (let submob of this.children) {
			this.add(submob)
		}
	}

}