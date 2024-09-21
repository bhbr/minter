
import { Vertex } from 'core/classes/vertex/Vertex'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { ConStrait } from '../ConStrait'

export class ConSegment extends ConStrait {

	vectorComponents(): Vertex {
		return this.endPoint.subtract(this.startPoint)
	}

	norm2(): number { return this.vectorComponents().norm2() }
	norm():number { return Math.sqrt(this.norm2()) }

}