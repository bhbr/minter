
import { vertex, vertexAdd, vertexSubtract, vertexMultiply } from 'core/functions/vertex'
import { ConStrait } from '../ConStrait'

export class ConRay extends ConStrait {

	drawingEndPoint(): vertex {
		if (this.startPoint == this.endPoint) { return this.endPoint }
		return vertexAdd(this.startPoint, vertexMultiply(vertexSubtract(this.endPoint, this.startPoint), 100))
	}

}