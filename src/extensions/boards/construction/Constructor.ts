
import { Creator } from 'core/creators/Creator'
import { Color } from 'core/classes/Color'
import { Construction } from 'extensions/boards/construction/Construction'
import { Vertex } from 'core/classes/vertex/Vertex'

export class Constructor extends Creator {

	penStrokeColor: Color
	penStrokeWidth: number
	penFillColor: Color
	penFillOpacity: number
	construction: Construction
	startPoint: Vertex
	endPoint: Vertex

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'construction'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			penStrokeColor: Color.white(),
			penStrokeWidth: 1.0,
			penFillColor: Color.white(),
			penFillOpacity: 0.0
		})
	}

}