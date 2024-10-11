
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

	defaults(): object {
		let il = new InputList()
		return this.updateDefaults(super.defaults(), {
			readonly: {
				inputNames: [],
				outputNames: [],
				inputList: il,
				outputList: new OutputList()
			},
			mutable: {
				screenEventHandler: ScreenEventHandler.Self
			}
		})
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
		this.addDependency('viewHeight', this.inputList, null)
		this.addDependency('viewWidth', this.inputList, null)
		this.addDependency('viewHeight', this.outputList, null)
		this.addDependency('viewWidth', this.outputList, null)
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
		this.parent.linkMap.update()
	}

}





















