
import { Vertex } from './Vertex'
import { Transform } from './Transform'

export class VertexArray extends Array<Vertex> {

	constructor(array?: Array<Vertex> | Array<Array<number>>) {
		super()
		if (!array) {
			return
		}
		for (let vertex of array) {
			if (vertex instanceof Vertex) {
				this.push(vertex)
			} else {
				this.push(new Vertex(vertex))
			}
		}
	}
	
	interpolate(newVertexArray: VertexArray, weight: number): VertexArray {
		let interpolatedVertexArray = new VertexArray()
		for (let i = 0; i < this.length; i++) {
			interpolatedVertexArray.push(
				this[i].interpolate(newVertexArray[i], weight)
			)
		}
		return interpolatedVertexArray
	}

	imageUnder(transform: Transform): VertexArray {
		let image = new VertexArray()
		for (let i = 0; i < this.length; i++) {
			image.push(
				this[i].imageUnder(transform)
			)
		}
		return image
	}

}