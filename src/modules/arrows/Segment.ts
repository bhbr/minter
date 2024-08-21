import { Vertex } from './../helpers/Vertex'
import { VertexArray } from './../helpers/VertexArray'
import { Arrow } from './Arrow'

export class Segment extends Arrow {

	components(): Vertex {
		return this.endPoint.subtract(this.startPoint)
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		let p: Vertex = this.drawingStartPoint()
		let q: Vertex = this.drawingEndPoint()
		this.vertices = new VertexArray([p, q])

	}

	drawingStartPoint(): Vertex { return this.startPoint }
	drawingEndPoint(): Vertex { return this.endPoint }

	norm2(): number { return this.components().norm2() }
	norm():number { return Math.sqrt(this.norm2()) }

}