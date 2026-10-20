
import { CurvedLine } from './CurvedLine.js'

export class CurvedShape extends CurvedLine {
	/*
	A closed CurvedLine is a CurvedShape
	*/

	mutabilities(): object {
		return {
			closed: 'never'
		}
	}
}