import { Vertex } from './../helpers/Vertex_Transform'
import { Ray } from './Ray'

export class Line extends Ray {

	drawingStartPoint(): Vertex {
		if (this.startPoint == this.endPoint) { return this.startPoint }
		return this.endPoint.add(this.startPoint.subtract(this.endPoint).multiply(100))
	}

}