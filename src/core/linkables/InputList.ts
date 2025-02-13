
import { vertex, vertexTranslatedBy } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { Linkable } from './Linkable'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { LinkHook } from './LinkHook'
import { TextLabel } from 'core/mobjects/TextLabel'
import { IO_LIST_WIDTH, IO_LIST_OFFSET, HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_INSET, HOOK_VERTICAL_SPACING } from './constants'

export class InputList extends RoundedRectangle {
/*
A visual list of available input variables of a linkable mobject.
It is displayed on top of the mobject when the 'link' toggle button is held down.
*/

	inputNames: Array<string>
	linkHooks: Array<LinkHook>
	mobject?: Linkable // the mobject whose input this list represents

	ownDefaults(): object {
		return {
			linkHooks: [],
			cornerRadius: 20,
			fillColor: Color.white(),
			fillOpacity: 0.2,
			strokeWidth: 0,
			width: IO_LIST_WIDTH,
			mobject: null,
			inputNames: []
		}
	}

	ownMutabilities(): object {
		return {
			cornerRadius: 'never',
			fillColor: 'never',
			fillOpacity: 'never',
			strokeWidth: 'never'
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
	// calculate the height from the number of inputs
		if (this.inputNames == null) { return 0 }
		if (this.inputNames.length == 0) { return 0 }
		else { return 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * (this.inputNames.length - 1) }
	}

	createHookList() {
	// create the hooks (empty circles) and their labels
		this.linkHooks = []
		for (let submob of this.submobs) {
			this.remove(submob)
		}
		for (let i = 0; i < this.inputNames.length; i++) {
			let name = this.inputNames[i]
			let hook = new LinkHook({
				mobject: this.mobject,
				name: name,
				type: 'input'
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
			this.positionHookAndLabel(hook, label, i)
			this.linkHooks.push(hook)
		}
	}

	positionHookAndLabel(hook: LinkHook, label: TextLabel, index: number) {
		let m: vertex = [HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * index]
		hook.update({ midpoint: m })
		let a = vertexTranslatedBy(hook.midpoint, [HOOK_LABEL_INSET, -0.5 * HOOK_VERTICAL_SPACING])
		label.update({ anchor: a })
	}

	hookNamed(name: string): LinkHook | null {
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

		if (args['inputNames'] === undefined) { return }

		this.createHookList()
		this.height = this.getHeight()
		this.positionSelf()
	}

	positionSelf() {
		super.update({
			anchor: [0.5 * (this.mobject.viewWidth - this.viewWidth), -IO_LIST_OFFSET - this.getHeight()]
		}, true)
	}
}


























