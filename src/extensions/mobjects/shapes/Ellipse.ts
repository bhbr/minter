
import { CurvedShape } from 'core/vmobjects/CurvedShape'

export class Ellipse extends CurvedShape {

	majorAxis: number
	minorAxis: number

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			mutable: {
				majorAxis: 200,
				minorAxis: 100
			}
		})
	}

	updateBezierPoints() { }
	// needs implementation

}