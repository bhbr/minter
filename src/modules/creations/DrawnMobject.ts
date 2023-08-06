import { CreatedMobject } from './CreatedMobject'
import { Color } from '../helpers/Color'

export class DrawnMobject extends CreatedMobject {

	penStrokeColor: Color
	penStrokeWidth: number
	penFillColor: Color
	penFillOpacity: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			penStrokeColor: Color.white(),
			penStrokeWidth: 1.0,
			penFillColor: Color.white(),
			penFillOpacity: 0.0
		})
	}
}