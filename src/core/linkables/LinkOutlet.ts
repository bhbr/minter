
import { TextLabel } from 'core/mobjects/TextLabel'
import { InputTextBox } from 'core/mobjects/InputTextBox'
import { LinkHook } from './LinkHook'
import { MGroup } from 'core/mobjects/MGroup'
import { HOOK_HORIZONTAL_SPACING, IO_LIST_WIDTH } from './constants'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { getPaper, getSidebar } from 'core/functions/getters'
import { IOList } from './IOList'
import { InputList } from './InputList'
import { log } from 'core/functions/logging'

export class LinkOutlet extends MGroup {

	name: string
	type: string
	label: TextLabel
	inputBox?: InputTextBox
	linkHooks: Array<LinkHook>
	editable: boolean
	ioList?: IOList

	defaults(): object {
		return {
			name: '',
			type: 'number',
			label: new TextLabel({
				frameWidth: IO_LIST_WIDTH / 2,
				frameHeight: 25
			}),
			inputBox: null,
			linkHooks: [],
			editable: false,
			ioList: null
		}
	}

	mutabilities(): object {
		return {
			label: 'never',
			inputBox: 'on_update',
			linkHooks: 'never',
			editable: 'on_init',
			ioList: 'on_init',
			type: 'on_init'
		}
	}

	setup() {
		super.setup()
		this.label.update({
			text: this.name
		})
		this.label.view.update({
			horizontalAlign: 'right'
		})
		this.add(this.label)
		if (this.editable) {
			this.label.update({
				screenEventHandler: ScreenEventHandler.Self
			})
			this.label.onTap = function(e: ScreenEvent) {
				this.editLabel()
			}.bind(this)
			this.update({
				inputBox: new InputTextBox({
					value: this.name,
					frameWidth: this.label.frameWidth,
					frameHeight: this.label.frameHeight
				})
			})
			this.inputBox.onReturn = function() {
				this.updateLabel()
			}.bind(this)
		}
		this.addHook()
	}

	addHook() {
		let index = this.linkHooks.length
		let newHook = new LinkHook({
			midpoint: [
				this.ioList.frameWidth / 2 + 15 + HOOK_HORIZONTAL_SPACING * index,
				this.label.frameHeight / 2
			],
			outlet: this
		})
		this.add(newHook)
		this.linkHooks.push(newHook)
	}

	get kind(): 'input' | 'output' {
		return this.ioList.kind
	}

	removeHook() {
		let lastHook = this.linkHooks.pop()
		this.remove(lastHook)
	}

	editLabel() {
		this.remove(this.label)
		this.add(this.inputBox)
		this.inputBox.focus()
	}

	updateLabel() {
		this.remove(this.inputBox)
		this.add(this.label)
		this.update({
			name: this.inputBox.value
		})
	}

	update(args: object = {}, redraw: boolean = true) {
		let newName = args['name']
		if (newName == '') {
			throw `Name of property ${this.name} cannot be changed to an empty string`;
		}
		super.update(args, redraw)
		if (newName !== undefined) {
			this.label.update({
				text: newName
			}, redraw)
			if (this.editable) {
				this.inputBox.update({
					value: newName
				}, redraw)
			}
		}
	}








}