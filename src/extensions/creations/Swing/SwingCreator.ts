
import { Creator } from 'core/creators/Creator'
import { Swing } from './Swing'
import { vertex, vertexSubtract, vertexNorm } from 'core/functions/vertex'

export class SwingCreator extends Creator {

	swing: Swing

	ownDefaults(): object {
		return {
			swing: new Swing()
		}
	}

	ownMutabilities(): object {
		return {
			swing: 'never'
		}
	}

	setup() {
		super.setup()
		this.add(this.swing)
		this.swing.update({
			anchor: this.getStartPoint()
		}, false)
		this.swing.hideLinks()
	}

	createMobject(): Swing {
		return this.swing
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		var dr: vertex = vertexSubtract(q, this.getStartPoint())
		dr = vertexSubtract(dr, [this.view.frame.width/2, this.swing.fixtureHeight])
		let length: number = vertexNorm(dr)
		let angle: number = -Math.atan2(dr[0], dr[1])
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
		this.swing.outputList.update()
		this.swing.run()
	}


























}