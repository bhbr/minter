
import { Creator } from './Creator'
import { Color } from 'core/classes/Color'
import { Rectangle } from 'core/shapes/Rectangle'
import { vertex } from 'core/functions/vertex'
import { Mobject } from 'core/mobjects/Mobject'

export class SpanningCreator extends Creator {
	
	rectangle: Rectangle

	ownDefaults(): object {
		return {
			rectangle: new Rectangle()
		}
	}

	ownMutabilities(): object {
		return {
			rectangle: 'never'
		}
	}

	setup() {
		super.setup()
		this.add(this.rectangle)
		this.addDependency('topLeftVertex', this.rectangle, 'anchor')
		this.addDependency('getWidth', this.rectangle, 'width')
		this.addDependency('getHeight', this.rectangle, 'height')

	}

	topLeftVertex(): vertex {
		return [
			Math.min(this.getStartPoint()[0], this.getEndPoint()[0]),
			Math.min(this.getStartPoint()[1], this.getEndPoint()[1])
		]
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
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})
		if (redraw) { this.view.redraw() }
	}

	dissolve() {
		this.creation = this.createMobject()
		this.creation.update({
			anchor: this.topLeftVertex(),
			width: this.getWidth(),
			height: this.getHeight()
		})
		this.parent.addToContent(this.creation)
		this.parent.creator = null
		this.parent.remove(this)
	}

}




























