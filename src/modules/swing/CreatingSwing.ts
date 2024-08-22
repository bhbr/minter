import { CreatingMobject } from '../creations/CreatingMobject'
import { Swing } from './Swing'
import { Vertex } from '../helpers/Vertex'
import { Paper } from '../../Paper'

export class CreatingSwing extends CreatingMobject {

	swing: Swing

	statelessSetup() {
		super.statelessSetup()
		this.swing = new Swing()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.swing)
		this.swing.update({
			anchor: this.startPoint
		}, false)
		this.swing.hideLinks()
	}

	createdMobject(): Swing {
		return this.swing
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		var dr: Vertex = q.subtract(this.startPoint)
		dr = dr.subtract(new Vertex(this.viewWidth/2, this.swing.fixtureHeight))
		let length: number = dr.norm()
		let angle: number = Math.atan2(dr.x, dr.y)
		this.swing.update({
			maxLength: length,
			length: 1,
			initialAngle: angle
		})
		this.swing.hideLinks()
	}

	dissolve() {
		super.dissolve()
		this.swing.update({
			initialTime: Date.now()
		})
		this.swing.run()
	}

}