import { CurvedShape } from './CurvedShape'

export class Ellipse extends CurvedShape {

	majorAxis: number
	minorAxis: number
	tilt: number

	defaultArgs() {
		return Object.assign(super.defaultArgs(), {
			majorAxis: 200,
			minorAxis: 100,
			tilt: 0
		})
	}

	updateBezierPoints() { }
	// needs implementation

}