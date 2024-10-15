
import { CurvedLine } from './CurvedLine'

export class CurvedShape extends CurvedLine {
	/*
	A closed CurvedLine is a CurvedShape
	*/

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			closed: 'never'
		})
	}
}