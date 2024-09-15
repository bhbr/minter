import { CreatingMobject } from 'core/mobject/creating/CreatingMobject'
import { Color } from 'core/helpers/Color'
import { Construction } from 'core/mobject/expandable/ExpandableMobject_Construction'

export class ConstructingMobject extends CreatingMobject {

	penStrokeColor: Color
	penStrokeWidth: number
	penFillColor: Color
	penFillOpacity: number
	construction: Construction

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			penStrokeColor: Color.white(),
			penStrokeWidth: 1.0,
			penFillColor: Color.white(),
			penFillOpacity: 0.0
		})
	}

}