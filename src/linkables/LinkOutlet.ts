
import { TextLabel } from 'ui/TextLabel.js'
import { InputTextBox } from 'ui/InputTextBox.js'
import { LinkHook } from './LinkHook.js'
import { MGroup } from 'mobjects/MGroup.js'
import { HOOK_HORIZONTAL_SPACING, IO_LIST_WIDTH } from './constants.js'
import { ScreenEvent, ScreenEventHandler } from 'mobjects/screen_events.js'
import { getPaper, getSidebar } from 'functions/getters.js'
import { IOList } from './IOList.js'
import { InputList } from './InputList.js'
import { log } from 'functions/logging.js'
import { remove } from '@bhbr/betray'

export class LinkOutlet extends MGroup {

	name: string
	displayName?: string
	type: string
	label: TextLabel
	inputBox?: InputTextBox
	linkHooks: Array<LinkHook>
	editable: boolean
	ioList?: IOList

	defaults(): object {
		return {
			name: '',
			displayName: '',
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
		this.displayName = this.displayName ?? this.name
		this.label.update({
			text: this.displayName
		})
		this.label.view.update({
			horizontalAlignment: 'right'
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
					value: this.displayName,
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
		let li = this.ioList
		let mp = [
				li.frameWidth / 2 + 15 + HOOK_HORIZONTAL_SPACING * index,
				this.label.frameHeight / 2
			]
		let newHook = new LinkHook({
			midpoint: mp,
			outlet: this
		})
		
		// delay to fight a concurrency bug
		window.setTimeout(function() {
			this.add(newHook)
			this.linkHooks.push(newHook)
		}.bind(this), 100)
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
			displayName: this.inputBox.value
		})
	}

	update(args: object = {}, redraw: boolean = true) {
		let newName = args['displayName'] ?? args['name']
		if (newName == '') {
			throw `Name of property ${this.displayName} cannot be changed to an empty string`
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

	removeUnlinkedHook() {
		var i = 0
		for (let hook of this.linkHooks) {
			if (!hook.linked) { break }
			i += 1
		}
		let unlinkedHook = this.linkHooks[i]
		this.remove(unlinkedHook)
		while (i < this.linkHooks.length) {
			this.linkHooks[i].update({
				midpoint: [this.linkHooks[i].midpoint[0] - HOOK_HORIZONTAL_SPACING, this.linkHooks[i].midpoint[1]]
			})
			i += 1
		}
		remove(this.linkHooks, unlinkedHook)
	}








}