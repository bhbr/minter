
import { Vertex } from 'core/classes/vertex/Vertex'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { Polygon } from 'core/vmobjects/Polygon'

export class Line extends Polygon {

	startPoint: Vertex
	endPoint: Vertex

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
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

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		let p: Vertex = this.drawingStartPoint()
		let q: Vertex = this.drawingEndPoint()
		this.vertices = new VertexArray([p, q])
		if (redraw) { this.redraw() }
	}
}
