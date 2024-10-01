
import { CurvedShape } from 'core/vmobjects/CurvedShape'

export class Ellipse extends CurvedShape {

	majorAxis: number
	minorAxis: number

	defaults() {
		return Object.assign(super.defaults(), {
			majorAxis: 200,
			minorAxis: 100
		})
	}

	updateBezierPoints() { }
	// needs implementation

}