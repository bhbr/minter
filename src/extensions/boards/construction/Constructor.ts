
import { Creator } from 'core/creators/Creator'
import { Color } from 'core/classes/Color'
import { Construction } from 'extensions/boards/construction/Construction'
import { Vertex } from 'core/classes/vertex/Vertex'

export class Constructor extends Creator {

	penStrokeColor: Color
	penStrokeWidth: number
	penFillColor: Color
	penFillOpacity: number
	construction?: Construction
	startPoint: Vertex
	endPoint: Vertex

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				construction: undefined // defined in constructor arguments
			},
			mutable: {
				penStrokeColor: Color.white(),
				penStrokeWidth: 1.0,
				penFillColor: Color.white(),
				penFillOpacity: 0.0
			}
		})
	}

	dissolve() {
		this.construction.integrate(this)
		this.construction.creator = null
		this.construction.remove(this)
	}


}