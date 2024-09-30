
import { CurvedShape } from 'core/vmobjects/CurvedShape'

export class Ellipse extends CurvedShape {

	majorAxis: number
	minorAxis: number

	defaultArgs() {
		return Object.assign(super.defaultArgs(), {
			majorAxis: 200,
			minorAxis: 100
		})
	}

	updateBezierPoints() { }
	// needs implementation

}