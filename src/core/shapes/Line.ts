
import { Vertex } from 'core/classes/vertex/Vertex'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { Polygon } from 'core/vmobjects/Polygon'

export class Line extends Polygon {

	startPoint: Vertex
	endPoint: Vertex

	defaults(): object {
		return Object.assign(super.defaults(), {
			startPoint: Vertex.origin(),
			endPoint: Vertex.origin()
		})
	}

	/*
	Subclasses might want to draw not right from start to end,
	but e. g. extend to the edge of the screen or leave
	space for an arrow
	*/
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
