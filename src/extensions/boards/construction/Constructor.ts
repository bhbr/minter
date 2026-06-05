
import { Creator } from 'core/creators/Creator'
import { Color } from 'core/classes/Color'
import { Construction } from 'extensions/boards/construction/Construction'
import { vertex } from 'core/functions/vertex'

export class Constructor extends Creator {

	penStrokeColor: Color
	penStrokeWidth: number
	penFillColor: Color
	penFillOpacity: number
	construction?: Construction
	startPoint: vertex
	endPoint: vertex

	defaults(): object {
		return {
			construction: undefined, // defined in constructor arguments
			penStrokeColor: Color.white(),
			penStrokeWidth: 1.0,
			penFillColor: Color.white(),
			penFillOpacity: 0.0
		}
	}

	mutabilities(): object {
		return {
			construction: 'on_init'
		}
	}

	dissolve() {
		this.construction.integrate(this)
		this.construction.creator = null
		this.construction.remove(this)
	}


}