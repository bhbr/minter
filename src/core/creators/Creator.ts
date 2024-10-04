
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Board } from 'core/boards/Board'

export class Creator extends Mobject {

	creation?: Mobject
	creationStroke: Array<Vertex>

	defaults(): object {
		return Object.assign(super.defaults(), {
			creationStroke: [],
			creation: null,
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	get parent(): Board {
		return super.parent as Board
	}
	set parent(newValue: Board) {
		super.parent = newValue
	}

	getStartPoint(): Vertex {
		return this.creationStroke[0] ?? this.anchor
	}

	getEndPoint(): Vertex {
		return this.creationStroke[this.creationStroke.length - 1] ?? this.anchor
	}

	dissolve() {
		this.creation = this.createMobject()
		this.creation.update({
			anchor: this.getStartPoint()
		}, true)
		this.parent.addToContent(this.creation)
		this.parent.creator = null
		this.parent.remove(this)
	}

	createMobject(): Mobject {
		return new Mobject()
	}

	updateFromTip(q: Vertex, redraw: boolean = true) {
		this.creationStroke.push(q)
		if (redraw) { this.redraw() }
	}

}
























