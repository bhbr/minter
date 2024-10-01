
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
		return this.creationStroke[0]
	}

	getEndPoint(): Vertex {
		return this.creationStroke[this.creationStroke.length - 1]
	}

	dissolve() {
		this.creation = this.createMobject()
		this.creation.update({
			anchor: this.getStartPoint()
		})
		this.parent.addToContent(this.creation)
		this.parent.remove(this)
		this.parent.creator = null
	}

	createMobject(): Mobject {
		return new Mobject()
	}

	updateFromTip(q: Vertex) {
		this.creationStroke.push(q)
	}

}
























