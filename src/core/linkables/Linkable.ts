
import { Board } from 'core/boards/Board'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { InputList } from './InputList'
import { OutputList } from './OutputList'
import { LinkHook } from './LinkHook'

export class Linkable extends Mobject {
/*
A mobject with input and output variables exposed to the UI,
which can be linked to such-exposed variables of other mobjects.
*/

	inputNames: Array<string>
	outputNames: Array<string>
	inputList: InputList
	outputList: OutputList 

	ownDefaults(): object {
		return {
			inputList: new InputList(),
			outputList: new OutputList(),
			inputNames: [],
			outputNames: [],			
			screenEventHandler: ScreenEventHandler.Self
		}
	}

	ownMutabilities(): object {
		return {
			inputList: 'never',
			outputList: 'never'
		}
	}

	get board(): Board | null {
		let p = super.parent
		if (p) {
			let pp = (p as Mobject).parent
			if (pp) {
				return pp as Board
			}
		}
		return null
	}

	set board(newValue: Board) {
		super.parent = newValue.content
	}

	setup() {
		super.setup()
		this.inputList.update({
			mobject: this,
			linkNames: this.inputNames
		})
		this.add(this.inputList)
		this.inputList.hide()
		this.outputList.update({
			mobject: this,
			linkNames: this.outputNames
		})
		this.add(this.outputList)
		this.outputList.hide()
	}

	showLinks() {
		this.inputList.show()
		this.outputList.show()
		this.disable()
	}

	hideLinks() {
		this.inputList.hide()
		this.outputList.hide()
		this.enable()
	}

	inputHooks(): Array<LinkHook> {
	// the hooks (with name and position) of available input variables
	// TODO: filter by type
		let arr: Array<LinkHook> = []
		for (let inputName of this.inputNames) {
			arr.push(this.inputList.hookNamed(inputName))
		}
		return arr
	}

	outputHooks(): Array<LinkHook> {
	// the hooks (with name and position) of available output variables
	// TODO: filter by type
		let arr: Array<LinkHook> = []
		for (let outputName of this.outputNames) {
			arr.push(this.outputList.hookNamed(outputName))
		}
		return arr
	}

	getCompactWidth(): number {
		return this.viewWidth
	}

	getCompactHeight(): number {
		return this.viewHeight
	}

	dragging(e: ScreenEvent) {
	// so we can drag while showing the links
	// (doesn't work at present)
		super.dragging(e)
		this.board.updateLinks()
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['inputNames'] !== undefined) {
			this.inputList.update({
				linkNames: args['inputNames']
			}, true)
		}
		if (args['outputNames'] !== undefined) {
			this.outputList.update({
				linkNames: args['outputNames']
			}, true)
		}
	}

}





















