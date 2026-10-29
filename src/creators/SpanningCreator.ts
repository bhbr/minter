
import { Creator } from './Creator.js'
import { Rectangle } from '../shapes/Rectangle.js'
import { vertex, vertexAdd } from '@bhbr/affr2'
import { Color } from '../views/Color.js'
import { log } from '../functions/logging.js'
import { Linkable } from '../linkables/Linkable.js'

export class SpanningCreator extends Creator {
	
	rectangle: Rectangle

	defaults(): object {
		return {
			rectangle: new Rectangle()
		}
	}

	mutabilities(): object {
		return {
			rectangle: 'always' // should be never (Mobject bug)
		}
	}

	setup() {
		super.setup()
		this.add(this.rectangle)
		//this.addDependency('topLeftVertex', this.rectangle, 'anchor')
		this.addDependency('getWidth', this.rectangle, 'width')
		this.addDependency('getHeight', this.rectangle, 'height')

	}

	topLeftVertex(): vertex {
		return vertexAdd([
			Math.min(this.getStartPoint()[0], this.getEndPoint()[0]),
			Math.min(this.getStartPoint()[1], this.getEndPoint()[1])
		], this.pointOffset)
	}

	getWidth(): number {
		return Math.abs(this.getStartPoint()[0] - this.getEndPoint()[0])
	}

	getHeight(): number {
		return Math.abs(this.getStartPoint()[1] - this.getEndPoint()[1])
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, false)
		this.update({
			anchor: this.topLeftVertex(),
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})
		if (redraw) { this.view.redraw() }
	}

	dissolve() {
		let w = this.getWidth()
		let h = this.getHeight()
		if (this.creation) {
			this.remove(this.creation)
		}
		this.creation = this.createMobject()
		this.creation.update({
			anchor: this.topLeftVertex(),
			frameWidth: w,
			frameHeight: h
		})
		if (this.creation instanceof Linkable) {
			this.creation.positionIOLists()
		}
		this.parent.addToContent(this.creation)
		this.parent.creator = null
		this.parent.remove(this)
	}

}




























