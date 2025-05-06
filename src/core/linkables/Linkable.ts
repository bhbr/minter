
import { Board } from 'core/boards/Board'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { IOList } from './IOList'
import { InputList } from './InputList'
import { OutputList } from './OutputList'
import { LinkHook } from './LinkHook'
import { log } from 'core/functions/logging'
import { SimpleButton } from 'core/mobjects/SimpleButton'

export interface IOProperty {
	name: string
	type: string
	displayName: string | null
}

export class Linkable extends Mobject {
/*
A mobject with input and output variables exposed to the UI,
which can be linked to such-exposed variables of other mobjects.
*/

	inputProperties: Array<IOProperty>
	outputProperties: Array<IOProperty>
	inputList: InputList
	outputList: OutputList
	linksEditable: boolean

	defaults(): object {
		return {
			inputList: new InputList(),
			outputList: new OutputList(),
			inputs: [],
			outputs: [],
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
			outletProperties: this.inputProperties,
			editable: this.linksEditable
		})
		this.add(this.inputList)
		this.inputList.view.hide()
		this.outputList.update({
			mobject: this,
			outletProperties: this.outputProperties,
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
		let arr: Array<LinkHook> = []
		for (let ip of this.inputProperties) {
			arr.push(this.inputList.hookNamed(ip.name))
		}
		return arr
	}

	outputHooks(): Array<LinkHook> {
	// the hooks (with name and position) of available output variables
		let arr: Array<LinkHook> = []
		for (let op of this.outputProperties) {
			arr.push(this.outputList.hookNamed(op.name))
		}
		return arr
	}

	renameLinkableProperty(kind: 'input' | 'output', oldName: string, newName: string) {
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

	setButtonVisibility(visible: boolean) {
		for (let mob of this.submobs) {
			if (mob instanceof SimpleButton) {
				mob.update({
					visible: visible
				})
			}
		}
	}

	allHooks(): Array<LinkHook> {
		return this.inputList.allHooks().concat(this.outputList.allHooks())
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['inputProperties'] !== undefined) {
			this.inputList.update({
				outletProperties: args['inputProperties']
			}, true)
		}
		if (args['outputProperties'] !== undefined) {
			this.outputList.update({
				outletProperties: args['outputProperties']
			}, true)
		}
	}

}





















