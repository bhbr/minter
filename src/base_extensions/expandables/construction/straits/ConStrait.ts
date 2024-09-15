import { Line } from 'base_extensions/mobjects/shapes/Line'
import { Vertex } from 'core/helpers/Vertex'
import { VertexArray } from 'core/helpers/VertexArray'

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