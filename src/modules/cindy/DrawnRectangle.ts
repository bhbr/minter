import { CreatedMobject } from '../creations/CreatedMobject'
import { Color } from '../helpers/Color'
import { Segment } from '../arrows/Segment'
import { Vertex } from '../helpers/Vertex_Transform'
import { WaveCindyCanvas } from './WaveCindyCanvas'
import { Mobject } from '../mobject/Mobject'

export class DrawnRectangle extends CreatedMobject {
	
	p1: Vertex
	p2: Vertex
	p3: Vertex
	p4: Vertex
	top: Segment
	bottom: Segment
	left: Segment
	right: Segment

	statelessSetup() {
		super.statelessSetup()
		this.top = new Segment({ strokeColor: Color.white() })
		this.bottom = new Segment({ strokeColor: Color.white() })
		this.left = new Segment({ strokeColor: Color.white() })
		this.right = new Segment({ strokeColor: Color.white() })
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
		this.update()
	}

	dissolveInto(parent: Mobject) {
		let w: number = Math.abs(this.p3.x - this.p1.x)
		let h: number = Math.abs(this.p3.y - this.p1.y)
		let topLeft = new Vertex(Math.min(this.p1.x, this.p3.x), Math.min(this.p1.y, this.p3.y))

		let cv = new WaveCindyCanvas({
			anchor: topLeft,
			viewWidth: w,
			viewHeight: h,
			points: [[0.4, 0.4], [0.3, 0.8]],
			id: `wave-${w}x${h}`
		})

		parent.add(cv)
		cv.startUp()
	}

	
}