
import { CurvedShape } from 'core/vmobjects/CurvedShape'

export class Ellipse extends CurvedShape {

	majorAxis: number
	minorAxis: number

	ownDefaults(): object {
		return {
			majorAxis: 200,
			minorAxis: 100
		}
	}

	updateBezierPoints() { }
	// needs implementation

}