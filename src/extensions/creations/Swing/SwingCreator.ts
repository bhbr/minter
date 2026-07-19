
import { Creator } from 'core/creators/Creator'
import { Swing } from './Swing'
import { vertex, vertexSubtract, vertexNorm } from 'core/functions/vertex'

export class SwingCreator extends Creator {

	defaults(): object {
		return {
			creation: new Swing({
				length: 0
			})
		}
	}

	mutabilities(): object {
		return {
			swing: 'never'
		}
	}

	declare creation?: Swing

	setup() {
		super.setup()
		this.add(this.creation)
		this.creation.hideLinks()
	}

	createMobject(): Swing {
		return this.creation
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		var dr: vertex = vertexSubtract(q, this.getStartPoint())
		let length: number = vertexNorm(dr)
		let angle: number = -Math.atan2(dr[0], dr[1])
		this.creation.update({
			maxLength: length,
			length: 1,
			initialAngle: angle
		}, redraw)
		this.creation.hideLinks()
	}

	dissolve() {
		super.dissolve()
		this.creation.update({
			initialTime: Date.now()
		})
		this.creation.outputList.update()
		this.creation.run()
	}


























}