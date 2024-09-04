import { Vertex } from '../helpers/Vertex'
import { VertexArray } from './../helpers/VertexArray'
import { Polygon } from './Polygon'

export class Rectangle extends Polygon {

	width: number
	height: number
	p1: Vertex // top left is always (0, 0) (in its own frame)
	p2: Vertex // = (width, 0)
	p3: Vertex // = (width, height)
	p4: Vertex // = (0, height)

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			width: 200,
			height: 100,
			p1: Vertex.origin(),
			p2: new Vertex(200, 0),
			p3: new Vertex(200, 100),
			p4: new Vertex(0, 100)
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.vertices = new VertexArray([this.p1, this.p2, this.p3, this.p4])
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)

		//// internal dependencies
		this.viewWidth = this.width
		this.viewHeight = this.height

		this.p2.x = this.width
		this.p3.x = this.width
		this.p3.y = this.height
		this.p4.y = this.height

	}

	
}