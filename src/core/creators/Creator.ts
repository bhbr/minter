
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { vertex, vertexArray, vertexAdd, vertexSubtract } from 'core/functions/vertex'
import { Board } from 'core/boards/Board'
import { log } from 'core/functions/logging'

export class Creator extends Mobject {

	creation?: Mobject
	creationStroke: vertexArray
	helpText: string
	pointOffset: vertex

	defaults(): object {
		return {
			creationStroke: [],
			creation: null,
			screenEventHandler: ScreenEventHandler.Self,
			helpText: '',
			pointOffset: [0, 0]
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
			anchor: vertexAdd(this.getStartPoint(), this.pointOffset)
		}, true)
		this.parent.addToContent(this.creation)
		this.parent.creator = null
		this.parent.remove(this)
	}

	createMobject(): Mobject {
		return new Mobject({
			anchor: this.pointOffset
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		this.updateDependents()
		if (redraw) { this.view.redraw() }
	}

}
























