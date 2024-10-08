
import { Line } from 'core/shapes/Line'
import { Vertex } from 'core/classes/vertex/Vertex'
import { VertexArray } from 'core/classes/vertex/VertexArray'

export class ConStrait extends Line {

	drawingStartPoint(): Vertex { return this.startPoint }
	drawingEndPoint(): Vertex { return this.endPoint }

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.vertices[0] = this.drawingStartPoint()
		this.vertices[1] = this.drawingEndPoint()
		if (redraw) { this.redraw() }
	}

}