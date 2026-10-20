
import { vertex, vertexAdd, vertexSubtract, vertexMultiply } from '@bhbr/affr2'
import { ConStrait } from '../ConStrait.js'

export class ConRay extends ConStrait {

	drawingEndPoint(): vertex {
		if (this.startPoint == this.endPoint) { return this.endPoint }
		return vertexAdd(this.startPoint, vertexMultiply(vertexSubtract(this.endPoint, this.startPoint), 100))
	}

}