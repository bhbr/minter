import { CreatingMobject } from '../creations/CreatingMobject'
import { Color } from '../helpers/Color'
import { Construction } from '../mobject/expandable/ExpandableMobject'

export class ConstructingMobject extends CreatingMobject {

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

	get parent(): Construction {
		return super.parent as Construction
	}
	set parent(newValue: Construction) {
		super.parent = newValue
	}
}