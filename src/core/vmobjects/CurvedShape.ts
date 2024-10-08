
import { CurvedLine } from './CurvedLine'

export class CurvedShape extends CurvedLine {
	/*
	A closed CurvedLine is a CurvedShape
	*/

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			closed: true
		})
	}

}