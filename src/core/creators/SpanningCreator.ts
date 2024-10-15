
import { Creator } from './Creator'
import { Color } from 'core/classes/Color'
import { Rectangle } from 'core/shapes/Rectangle'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Mobject } from 'core/mobjects/Mobject'

export class SpanningCreator extends Creator {
	
	rectangle: Rectangle

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			rectangle: new Rectangle()
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			rectangle: 'never'
		})
	}

	setup() {
		super.setup()
		this.add(this.rectangle)
		this.addDependency('topLeftVertex', this.rectangle, 'anchor')
		this.addDependency('getWidth', this.rectangle, 'width')
		this.addDependency('getHeight', this.rectangle, 'height')

	}

	topLeftVertex(): Vertex {
		return new Vertex(
			Math.min(this.getStartPoint().x, this.getEndPoint().x),
			Math.min(this.getStartPoint().y, this.getEndPoint().y)
		)
	}

	getWidth(): number {
		return Math.abs(this.getStartPoint().x - this.getEndPoint().x)
	}

	getHeight(): number {
		return Math.abs(this.getStartPoint().y - this.getEndPoint().y)
	}


	updateFromTip(q: Vertex, redraw: boolean = true) {
		super.updateFromTip(q, false)
		this.update()
		if (redraw) { this.redraw() }
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




























