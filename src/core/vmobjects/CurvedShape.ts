
import { CurvedLine } from './CurvedLine'

export class CurvedShape extends CurvedLine {
	/*
	A closed CurvedLine is a CurvedShape
	*/

	defaults(): object {
		let superDefs = super.defaults()
		let defs = this.updateDefaults(superDefs, {
			readonly: {
				closed: true
			}
		})
		return defs
	}

}