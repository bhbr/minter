
import { vertex, vertexTranslatedBy, vertexOrigin } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { Linkable } from './Linkable'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { LinkHook } from './LinkHook'
import { LinkOutlet } from './LinkOutlet'
import { TextLabel } from 'core/mobjects/TextLabel'
import { IO_LIST_WIDTH, HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_INSET, HOOK_VERTICAL_SPACING } from './constants'
import { log } from 'core/functions/logging'
import { clear } from 'core/functions/arrays'

export class IOList extends RoundedRectangle {
/*
A visual list of available input or output variables of a linkable mobject.
It is displayed on top of or below the mobject when the 'link' toggle button is held down.
*/

	linkNames: Array<string>
	linkOutlets: Array<LinkOutlet>
	mobject?: Linkable
	type: 'input' | 'output'
	editable: boolean

	defaults(): object {
		return {
			linkOutlets: [],
			mobject: null,
			linkNames: [],
			cornerRadius: 20,
			width: IO_LIST_WIDTH,
			fillColor: Color.gray(0.2),
			fillOpacity: 1.0,
			strokeWidth: 0,
			editable: false
		}
	}

	mutabilities(): object {
		return {
			cornerRadius: 'never',
			fillColor: 'never',
			fillOpacity: 'never',
			strokeWidth: 'never',
			type: 'in_subclass',
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
		this.createOutlets()
		this.update({ height: this.getHeight() }, false)
	}

	getHeight(): number {
	// calculate the height from the number of outputs
		if (this.linkNames == undefined) { return 0 }
		if (this.linkNames.length == 0) { return 0 }
		else { return 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * this.linkNames.length }
	}

	createOutlets() {
	// create the hooks (empty circles) and their labels
		for (let outlet of this.linkOutlets) {
			this.remove(outlet)
		}
		clear(this.linkOutlets)
		for (var i = 0; i < this.linkNames.length; i++) {
			let name = this.linkNames[i]
			this.createOutlet(name)
		}
	}

	createOutlet(name: string) {
		let outlet = new LinkOutlet({
			name: name,
			editable: this.editable
		})
		this.add(outlet)
		this.linkOutlets.push(outlet)
		this.positionOutlet(outlet, this.linkOutlets.length - 1)

	}

	positionOutlet(outlet: LinkOutlet, index: number) {
		outlet.update({
			anchor: [HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * index]
		})
	}

	hookNamed(name, index: number = 0): LinkHook | null {
		for (let outlet of this.linkOutlets) {
			if (outlet.name == name) {
				return outlet.linkHooks[index]
			}
		}
		return null
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		if (this.mobject == null) { return }
		if (this.constructor.name == 'ExpandedBoardInputList') { return }

		if (args['linkNames'] === undefined) { return }

		this.createOutlets()
		this.height = this.getHeight()
		if (this.mobject == null) { return }
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

	renameProperty(oldName: string, newName: string) {
		let index = this.linkNames.indexOf(oldName)
		this.linkNames[index] = newName
		this.linkOutlets[index].update({
			name: newName
		})
	}

}


























