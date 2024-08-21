import { CreatingMobject } from '../creations/CreatingMobject'
import { Pendulum } from './Pendulum'
import { Vertex } from '../helpers/Vertex'
import { Paper } from '../../Paper'

export class CreatingPendulum extends CreatingMobject {

	pendulum: Pendulum

	statelessSetup() {
		super.statelessSetup()
		this.pendulum = new Pendulum()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.pendulum)
		this.pendulum.update({
			anchor: this.startPoint
		}, false)
		this.pendulum.hideLinks()
	}

	createdMobject(): Pendulum {
		return this.pendulum
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		let dr: Vertex = q.subtract(this.startPoint)
		let length: number = dr.norm()
		let angle: number = Math.atan2(dr.x, dr.y)
		this.pendulum.update({
			maxLength: length,
			length: 1,
			initialAngle: angle
		})
		this.pendulum.hideLinks()
	}

	dissolve() {
		super.dissolve()
		this.pendulum.update({
			initialTime: Date.now()
		})
		this.pendulum.run()
	}

}