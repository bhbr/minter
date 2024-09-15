import { Vertex } from 'core/helpers/Vertex'
import { VertexArray } from 'core/helpers/VertexArray'
import { Polygon } from 'core/mobject/svg/Polygon'

export class Line extends Polygon {
	startPoint: Vertex
	endPoint: Vertex

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			startPoint: Vertex.origin(),
			endPoint: Vertex.origin()
		})
	}

	drawingStartPoint() {
		return this.startPoint
	}

	drawingEndPoint() {
		return this.endPoint
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		let p: Vertex = this.drawingStartPoint()
		let q: Vertex = this.drawingEndPoint()
		this.vertices = new VertexArray([p, q])
	}
}
