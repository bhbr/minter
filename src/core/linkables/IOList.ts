
import { vertex, vertexTranslatedBy, vertexOrigin } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { Linkable } from './Linkable'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { LinkHook } from './LinkHook'
import { LinkOutlet } from './LinkOutlet'
import { TextLabel } from 'core/mobjects/TextLabel'
import { IO_LIST_WIDTH, HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_INSET, HOOK_VERTICAL_SPACING } from './constants'
import { log } from 'core/functions/logging'
import { clear, remove } from 'core/functions/arrays'
import { IOProperty } from './Linkable'

export class IOList extends RoundedRectangle {
/*
A visual list of available input or output variables of a linkable mobject.
It is displayed on top of or below the mobject when the 'link' toggle button is held down.
*/

	outletProperties: Array<IOProperty>
	linkOutlets: Array<LinkOutlet>
	mobject?: Linkable
	kind: 'input' | 'output'
	editable: boolean

	defaults(): object {
		return {
			linkOutlets: [],
			mobject: null,
			outletProperties: [],
			cornerRadius: 20,
			width: IO_LIST_WIDTH,
			frameWidth: IO_LIST_WIDTH,
			fillColor: Color.gray(0.2),
			fillOpacity: 1.0,
			strokeColor: Color.gray(0.4),
			strokeWidth: 0.75,
			editable: false
		}
	}

	mutabilities(): object {
		return {
			cornerRadius: 'never',
			fillColor: 'never',
			fillOpacity: 'never',
			strokeWidth: 'never',
			kind: 'in_subclass',
			editable: 'on_update'
		}
	}

	get parent(): Linkable {
		return super.parent as Linkable
	}

	set parent(newValue: Linkable) {
		super.parent = newValue
	}

	setup() {
		super.setup()
		this.updateOutlets()
		this.update({ height: this.getHeight() })
	}

	getHeight(): number {
	// calculate the height from the number of outputs
		if (this.outletProperties == undefined) { return 0 }
		if (this.outletProperties.length == 0) { return 0 }
		else { return 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * this.outletProperties.length }
	}

	updateOutlets() {
	// create the hooks (empty circles) and their labels
		for (var i = 0; i < this.outletProperties.length; i++) {
			let prop = this.outletProperties[i]
			if (!this.outletNamed(prop.name)) {
				this.createOutlet(prop)
			}
		}
		for (let outlet of this.linkOutlets) {
			var found = false
			for (let prop of this.outletProperties) {
				if (outlet.name == prop['name']) {
					found = true
					break
				}
			}
			if (!found) {
				this.removeOutlet(outlet)
			}
			for (let hook of outlet.linkHooks) {
				hook.updateDependents()
			}
		}
	}

	createOutlet(prop: IOProperty) {
		let outlet = new LinkOutlet({
			name: prop.name,
			displayName: prop.displayName ?? prop.name,
			editable: this.editable,
			ioList: this,
			type: prop.type
		})
		this.add(outlet)
		this.linkOutlets.push(outlet)
		this.positionOutlet(outlet, this.linkOutlets.length - 1)
	}

	removeOutlet(outlet: LinkOutlet) {
		for (let hook of outlet.linkHooks) {
			if (hook.linked) {
				this.mobject.board.removeDependencyAtHook(hook)
			}
		}
		this.remove(outlet)
		remove(this.linkOutlets, outlet)
	}

	positionOutlet(outlet: LinkOutlet, index: number) {
		outlet.update({
			anchor: [HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * index]
		})
		for (let hook of outlet.linkHooks) {
			hook.updateDependents()
		}
	}

	positionOutlets() {
		for (let i = 0; i < this.linkOutlets.length; i++) {
			let outlet = this.linkOutlets[i]
			this.positionOutlet(outlet, i)
		}
	}

	hookNamed(name: string, index: number = 0): LinkHook | null {
		let outlet = this.outletNamed(name)
		if (outlet === null) { return null }
		let hooks = outlet.linkHooks
		if (hooks.length <= index) { return null }
		return hooks[index]
	}

	outletNamed(name: string): LinkOutlet | null {
		for (let outlet of this.linkOutlets) {
			if (outlet.name == name) { return outlet }
		}
		return null
	}


	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.height = this.getHeight()
		if (this.height == 0) {
			this.view.hide()
		} else {
			this.view.show()
		}
		if (this.mobject == null) { return }
		if (this.constructor.name == 'ExpandedBoardInputList') { return }

		if (args['outletProperties'] === undefined) { return }

		this.updateOutlets()
		if (this.mobject == null) { return }
		if (this.mobject.board) {
			this.mobject.board.updateLinks()
		}
		this.positionSelf()
		if (redraw) {
			this.redraw()
		}
	}

	positionSelf() {
		super.update({
			anchor: this.getAnchor()
		}, true)
	}

	getAnchor(): vertex {
		// placeholder, subclassed in InputList and OutputList
		return vertexOrigin()
	}

	outletNames(): Array<string> {
		return this.outletProperties.map((prop) => prop.name)
	}

	renameProperty(oldName: string, newName: string) {
		let index = this.outletNames().indexOf(oldName)
		this.outletProperties[index].name = newName
		this.linkOutlets[index].update({
			name: newName
		})
	}

	allHooks(): Array<LinkHook> {
		let ret: Array<LinkHook> = []
		for (let outlet of this.linkOutlets) {
			ret = ret.concat(outlet.linkHooks)
		}
		return ret
	}

}


























