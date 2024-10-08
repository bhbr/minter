
import { CurvedShape } from 'core/vmobjects/CurvedShape'

export class Ellipse extends CurvedShape {

	majorAxis: number
	minorAxis: number

	defaultValues() {
		return Object.assign(super.defaultValues(), {
			majorAxis: 200,
			minorAxis: 100
		})
	}

	updateBezierPoints() { }
	// needs implementation

}