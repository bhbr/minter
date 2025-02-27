
import { vertex, vertexTranslatedBy, vertexOrigin } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { Linkable } from './Linkable'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { LinkHook } from './LinkHook'
import { TextLabel } from 'core/mobjects/TextLabel'
import { IO_LIST_WIDTH, IO_LIST_OFFSET, HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_INSET, HOOK_VERTICAL_SPACING } from './constants'

export class IOList extends RoundedRectangle {
/*
A visual list of available input or output variables of a linkable mobject.
It is displayed on top of or below the mobject when the 'link' toggle button is held down.
*/

	linkNames: Array<string>
	linkHooks: Array<LinkHook>
	mobject?: Linkable
	type: 'input' | 'output'

	ownDefaults(): object {
		return {
			linkHooks: [],
			mobject: null,
			linkNames: [],
			cornerRadius: 20,
			fillColor: Color.gray(0.2),
			fillOpacity: 1.0,
			strokeWidth: 0,
			width: IO_LIST_WIDTH
		}
	}

	ownMutabilities(): object {
		return {
			cornerRadius: 'never',
			fillColor: 'never',
			fillOpacity: 'never',
			strokeWidth: 'never',
			type: 'in_subclass'
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
		this.createHookList()
		this.update({ height: this.getHeight() }, false)
	}

	getHeight(): number {
	// calculate the height from the number of outputs
		if (this.linkNames == undefined) { return 0 }
		if (this.linkNames.length == 0) { return 0 }
		else { return 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * (this.linkNames.length - 1) }
	}

	createHookList() {
	// create the hooks (empty circles) and their labels
		this.linkHooks = []
		for (let submob of this.submobs) {
			this.remove(submob)
		}
		for (let i = 0; i < this.linkNames.length; i++) {
			let name = this.linkNames[i]
			this.createHookAndLabel(name)
		}
	}

	createHookAndLabel(name: string) {
		let hook = new LinkHook({
			mobject: this.mobject,
			name: name,
			type: this.type
		})
		let label = new TextLabel({
			text: name,
			horizontalAlign: 'left',
			verticalAlign: 'center',
			viewHeight: HOOK_VERTICAL_SPACING,
			viewWidth: IO_LIST_WIDTH - HOOK_LABEL_INSET
		})
		this.add(hook)
		this.add(label)
		this.linkHooks.push(hook)
		this.positionHookAndLabel(hook, label, this.linkHooks.length - 1)
	}

	positionHookAndLabel(hook: LinkHook, label: TextLabel, index: number) {
		let m: vertex = [HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * index]
		hook.update({ midpoint: m })
		let a = vertexTranslatedBy(hook.midpoint, [HOOK_LABEL_INSET, -HOOK_VERTICAL_SPACING / 2])
		label.update({ anchor: a })
	}

	hookNamed(name): LinkHook | null {
		for (let h of this.linkHooks) {
			if (h.name == name) {
				return h
			}
		}
		return null
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		if (this.mobject == null) { return }
		if (this.constructor.name == 'ExpandedBoardInputList') { return }

		if (args['linkNames'] === undefined) { return }

		this.createHookList()
		this.height = this.getHeight()
		if (this.mobject == null) { return }
		this.positionSelf()
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

}


























