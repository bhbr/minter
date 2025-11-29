
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { vertex, vertexArray, vertexAdd } from 'core/functions/vertex'
import { Board } from 'core/boards/Board'

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
		return vertexAdd(this.creationStroke[0] ?? this.view.frame.anchor, this.pointOffset)
	}

	getEndPoint(): vertex {
		return vertexAdd(this.creationStroke[this.creationStroke.length - 1] ?? this.view.frame.anchor, this.pointOffset)
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
		return new Mobject({
			anchor: this.pointOffset
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		this.creationStroke.push(q)
		this.updateDependents()
		if (redraw) { this.view.redraw() }
	}

}
























