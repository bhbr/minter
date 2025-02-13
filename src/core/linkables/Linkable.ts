
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

	// this declares that the parent mobject will always be a board
	get parent(): Board {
		return super.parent as Board
	}
	set parent(newValue: Board) {
		super.parent = newValue
	}

	setup() {
		super.setup()
		this.inputList.update({
			mobject: this,
			inputNames: this.inputNames
		})
		this.add(this.inputList)
		this.inputList.hide()
		this.outputList.update({
			mobject: this,
			outputNames: this.outputNames
		})
		this.add(this.outputList)
		this.outputList.hide()
	}

	showLinks() {
		this.inputList.show()
		this.outputList.show()
	}

	hideLinks() {
		this.inputList.hide()
		this.outputList.hide()
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

	dragging(e: ScreenEvent) {
	// so we can drag while showing the links
	// (doesn't work at present)
		super.dragging(e)
		for (let link of this.parent.links) {
			link.update()
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['inputNames'] !== undefined) {
			this.inputList.update({
				inputNames: args['inputNames']
			}, true)
		}
		if (args['outputNames'] !== undefined) {
			this.outputList.update({
				outputNames: args['outputNames']
			}, true)
		}
	}

}





















