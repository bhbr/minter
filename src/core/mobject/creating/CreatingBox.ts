import { CreatingMobject } from './CreatingMobject'
import { Color } from 'core/helpers/Color'
import { Line } from 'base_extensions/mobjects/shapes/Line'
import { Vertex } from 'core/helpers/Vertex'
import { Mobject } from '../Mobject'

export class CreatingBox extends CreatingMobject {
	
	p1: Vertex
	p2: Vertex
	p3: Vertex
	p4: Vertex
	top: Line
	bottom: Line
	left: Line
	right: Line

	statelessSetup() {
		super.statelessSetup()
		this.top = new Line({ strokeColor: Color.white() })
		this.bottom = new Line({ strokeColor: Color.white() })
		this.left = new Line({ strokeColor: Color.white() })
		this.right = new Line({ strokeColor: Color.white() })
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
		
		this.endPoint = this.endPoint || this.startPoint.copy()
		this.p1 = this.startPoint
		this.p2 = new Vertex(this.endPoint.x, this.startPoint.y)
		this.p3 = this.endPoint
		this.p4 = new Vertex(this.startPoint.x, this.endPoint.y)

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
		this.endPoint.copyFrom(q)
		this.p2.x = this.endPoint.x
		this.p2.y = this.startPoint.y
		this.p4.x = this.startPoint.x
		this.p4.y = this.endPoint.y
		this.update({
			viewWidth: Math.abs(this.endPoint.x - this.startPoint.x),
			viewHeight: Math.abs(this.endPoint.y - this.startPoint.y)
		})
	}

	getWidth(): number {
		return this.lrCorner().x - this.ulCorner().x
	}

	getHeight(): number {
		return this.lrCorner().y - this.ulCorner().y
	}


}


