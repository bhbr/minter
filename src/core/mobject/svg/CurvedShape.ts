import { CurvedLine } from './CurvedLine'

export class CurvedShape extends CurvedLine {
	/*
	A closed CurvedLine is a CurvedShape
	*/

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			closed: true
		})
	}

}