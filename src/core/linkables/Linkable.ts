
import { Board } from 'core/boards/Board'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { IOList } from './IOList'
import { InputList } from './InputList'
import { OutputList } from './OutputList'
import { LinkHook } from './LinkHook'
import { log } from 'core/functions/logging'

export class Linkable extends Mobject {
/*
A mobject with input and output variables exposed to the UI,
which can be linked to such-exposed variables of other mobjects.
*/

	inputNames: Array<string>
	outputNames: Array<string>
	inputList: InputList
	outputList: OutputList
	linksEditable: boolean

	defaults(): object {
		return {
			inputList: new InputList(),
			outputList: new OutputList(),
			inputNames: [],
			outputNames: [],
			linksEditable: false,
			screenEventHandler: ScreenEventHandler.Self
		}
	}

	mutabilities(): object {
		return {
			inputList: 'never',
			outputList: 'never',
			linksEditable: 'in_subclass'
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
			linkNames: this.inputNames,
			editable: this.linksEditable
		})
		this.add(this.inputList)
		//this.inputList.view.hide()
		this.outputList.update({
			mobject: this,
			linkNames: this.outputNames,
			editable: this.linksEditable
		})
		this.add(this.outputList)
		this.outputList.view.hide()
	}

	showLinks() {
		this.inputList.view.show()
		this.outputList.view.show()
		this.disable()
	}

	hideLinks() {
		this.inputList.view.hide()
		this.outputList.view.hide()
		this.enable()
	}

	inputHooks(): Array<LinkHook> {
	// the hooks (with name and position) of available input variables
	// TODO: filter by kind
		let arr: Array<LinkHook> = []
		for (let inputName of this.inputNames) {
			arr.push(this.inputList.hookNamed(inputName))
		}
		return arr
	}

	outputHooks(): Array<LinkHook> {
	// the hooks (with name and position) of available output variables
	// TODO: filter by kind
		let arr: Array<LinkHook> = []
		for (let outputName of this.outputNames) {
			arr.push(this.outputList.hookNamed(outputName))
		}
		return arr
	}

	renameLinkableProperty(kind: 'input' | 'output', oldName: string, newName: string) {
		let propertyNames = (kind == 'input') ? this.inputNames : this.outputNames
		let list: IOList = (kind == 'input') ? this.inputList : this.outputList
		list.renameProperty(oldName, newName)
		// TODO: update dependencies
	}

	// The following two methods are used only for positioning IOLists, rework/rename this

	getCompactWidth(): number {
		return this.view.frame.width
	}

	getCompactHeight(): number {
		return this.view.frame.height
	}

	dragging(e: ScreenEvent) {
	// so we can drag while showing the links
	// (doesn't work at present)
		super.dragging(e)
		this.board.updateLinks()
	}

	allHooks(): Array<LinkHook> {
		return this.inputList.allHooks().concat(this.outputList.allHooks())
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





















