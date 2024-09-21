
import { Line } from 'core/shapes/Line'
import { Vertex } from 'core/classes/vertex/Vertex'
import { VertexArray } from 'core/classes/vertex/VertexArray'

export class ConStrait extends Line {

	drawingStartPoint(): Vertex { return this.startPoint }
	drawingEndPoint(): Vertex { return this.endPoint }

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		let p: Vertex = this.drawingStartPoint()
		let q: Vertex = this.drawingEndPoint()
		this.vertices = new VertexArray([p, q])
	}

}