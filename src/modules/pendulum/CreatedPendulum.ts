import { CreatedMobject } from '../creations/CreatedMobject'
import { Pendulum } from './Pendulum'
import { Vertex } from '../helpers/Vertex_Transform'
import { Paper } from '../../Paper'

export class CreatedPendulum extends CreatedMobject {

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
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		let dr: Vertex = q.subtract(this.startPoint)
		let length: number = dr.norm()
		let angle: number = Math.atan2(dr.x, dr.y)
		this.pendulum.update({
			length: length,
			initialAngle: angle
		})
	}

	dissolveInto(paper: Paper) {
		super.dissolveInto(paper)
		this.pendulum.update({
			initialTime: Date.now(),
			period: 500 * this.pendulum.length ** 0.5 // ms
		})
		this.pendulum.run()
	}

}