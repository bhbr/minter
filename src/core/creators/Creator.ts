
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { vertex, vertexArray } from 'core/functions/vertex'
import { Board } from 'core/boards/Board'

export class Creator extends Mobject {

	creation?: Mobject
	creationStroke: vertexArray

	defaults(): object {
		return {
			creationStroke: [],
			creation: null,
			screenEventHandler: ScreenEventHandler.Self
		}
	}

	get parent(): Board {
		return super.parent as Board
	}
	set parent(newValue: Board) {
		super.parent = newValue
	}

	setup() {
		super.setup()
		this.update({
			anchor: this.getStartPoint()
		})
	}

	getStartPoint(): vertex {
		return this.creationStroke[0] ?? this.view.frame.anchor
	}

	getEndPoint(): vertex {
		return this.creationStroke[this.creationStroke.length - 1] ?? this.view.frame.anchor
	}

	dissolve() {
		this.remove(this.creation)
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

	updateFromTip(q: vertex, redraw: boolean = true) {
		this.creationStroke.push(q)
		this.updateDependents()
		if (redraw) { this.view.redraw() }
	}

}
























