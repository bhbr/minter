
import { Creator } from 'core/creators/Creator'
import { Swing } from './Swing'
import { Vertex } from 'core/classes/vertex/Vertex'

export class SwingCreator extends Creator {

	swing: Swing

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'swing'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			swing: new Swing()
		})
	}

	setup() {
		super.setup()
		this.add(this.swing)
		this.swing.update({
			anchor: this.getStartPoint()
		}, false)
		this.swing.hideLinks()
	}

	createdMobject(): Swing {
		return this.swing
	}

	updateFromTip(q: Vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		var dr: Vertex = q.subtract(this.getStartPoint())
		dr = dr.subtract(new Vertex(this.viewWidth/2, this.swing.fixtureHeight))
		let length: number = dr.norm()
		let angle: number = Math.atan2(dr.x, dr.y)
		this.swing.update({
			maxLength: length,
			length: 1,
			initialAngle: angle
		}, redraw)
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