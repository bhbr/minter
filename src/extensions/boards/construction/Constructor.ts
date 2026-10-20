
import { Creator } from 'creators/Creator.js'
import { Color } from 'classes/Color.js'
import { Construction } from 'extensions/boards/construction/Construction.js'
import { vertex } from '@bhbr/affr2'

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