
import { CurvedLine } from './CurvedLine'

export class CurvedShape extends CurvedLine {
	/*
	A closed CurvedLine is a CurvedShape
	*/

	defaults(): object {
		return Object.assign(super.defaults(), {
			closed: true
		})
	}

}