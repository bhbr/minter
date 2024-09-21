
import { Creator } from './Creator'
import { Color } from 'core/classes/Color'
import { Line } from 'core/shapes/Line'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Mobject } from 'core/mobjects/Mobject'

export class SpanningCreator extends Creator {
	
	p1: Vertex
	p2: Vertex
	p3: Vertex
	p4: Vertex
	top: Line
	bottom: Line
	left: Line
	right: Line

	defaultArgs(): object {
			return Object.assign(super.defaultArgs(), {
			top: new Line({ strokeColor: Color.white() }),
			bottom: new Line({ strokeColor: Color.white() }),
			left: new Line({ strokeColor: Color.white() }),
			right: new Line({ strokeColor: Color.white() }),
			p1: Vertex.origin(),
			p2: Vertex.origin(),
			p3: Vertex.origin(),
			p4: Vertex.origin()
		})
	}

	statelessSetup() {
		super.statelessSetup()
	}

	statefulSetup() {
		super.statefulSetup()
		this.addDependency('p1', this.top, 'startPoint')
		this.addDependency('p2', this.top, 'endPoint')
		this.addDependency('p4', this.bottom, 'startPoint')
		this.addDependency('p3', this.bottom, 'endPoint')
		this.addDependency('p1', this.left, 'startPoint')
		this.addDependency('p4', this.left, 'endPoint')
		this.addDependency('p2', this.right, 'startPoint')
		this.addDependency('p3', this.right, 'endPoint')
		
		// //this.endPoint = this.endPoint || this.startPoint.copy()
		// this.p1 = this.getStartPoint()
		// this.p2 = new Vertex(this.getEndPoint().x, this.getStartPoint().y)
		// this.p3 = this.getEndPoint()
		// this.p4 = new Vertex(this.getStartPoint().x, this.getEndPoint().y)

		this.top.setAttributes({startPoint: this.p1, endPoint: this.p2})
		this.bottom.setAttributes({startPoint: this.p4, endPoint: this.p3})
		this.left.setAttributes({startPoint: this.p1, endPoint: this.p4})
		this.right.setAttributes({startPoint: this.p2, endPoint: this.p3})

		this.add(this.top)
		this.add(this.bottom)
		this.add(this.left)
		this.add(this.right)

	}

	updateFromTip(q: Vertex) {
		this.creationStroke.push(q)
		if (this.creationStroke.length == 1) {
			this.p1.copyFrom(this.getStartPoint())
		}
		this.p2.x = this.getEndPoint().x
		this.p2.y = this.getStartPoint().y
		this.p3.copyFrom(this.getEndPoint())
		this.p4.x = this.getStartPoint().x
		this.p4.y = this.getEndPoint().y
		this.update({
			viewWidth: Math.abs(this.getEndPoint().x - this.getStartPoint().x),
			viewHeight: Math.abs(this.getEndPoint().y - this.getStartPoint().y)
		})
	}

	getWidth(): number {
		return this.lrCorner().x - this.ulCorner().x
	}

	getHeight(): number {
		return this.lrCorner().y - this.ulCorner().y
	}

}




























