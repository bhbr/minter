
import { CurvedLine } from './CurvedLine'

export class CurvedShape extends CurvedLine {
	/*
	A closed CurvedLine is a CurvedShape
	*/

	ownMutabilities(): object {
		return {
			closed: 'never'
		}
	}
}