import { Vertex } from 'core/helpers/Vertex'
import { ConStrait } from '../ConStrait'

export class ConRay extends ConStrait {

	drawingEndPoint(): Vertex {
		if (this.startPoint == this.endPoint) { return this.endPoint }
		return this.startPoint.add(this.endPoint.subtract(this.startPoint).multiply(100))
	}

}