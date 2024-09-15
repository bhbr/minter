import { Vertex } from 'core/helpers/Vertex'
import { VertexArray } from 'core/helpers/VertexArray'
import { ConStrait } from '../ConStrait'

export class ConSegment extends ConStrait {

	vectorComponents(): Vertex {
		return this.endPoint.subtract(this.startPoint)
	}

	norm2(): number { return this.vectorComponents().norm2() }
	norm():number { return Math.sqrt(this.norm2()) }

}