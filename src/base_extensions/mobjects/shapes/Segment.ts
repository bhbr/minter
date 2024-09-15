import { Vertex } from 'core/helpers/Vertex'
import { Polygon } from 'core/mobject/svg/Polygon'

export class Segment extends Polygon {
	startPoint: Vertex
	endPoint: Vertex

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			startPoint: Vertex.origin(),
			endPoint: Vertex.origin()
		})
	}
}
