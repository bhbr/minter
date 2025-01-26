
import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'
import { Mobject } from 'core/mobjects/Mobject'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { LinkHook } from './LinkHook'
import { TextLabel } from 'core/mobjects/TextLabel'
import { IO_LIST_WIDTH, IO_LIST_OFFSET, HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_INSET, HOOK_VERTICAL_SPACING } from './constants'

export class OutputList extends RoundedRectangle {
/*
A visual list of available output variables of a linkable mobject.
It is displayed on top of the mobject when the 'link' toggle button is held down.
*/

	outputNames: Array<string>
	linkHooks: Array<LinkHook>
	mobject: Mobject

	ownDefaults(): object {
		return {
			linkHooks: [],
			mobject: null,
			outputNames: [],
			cornerRadius: 20,
			fillColor: Color.white(),
			fillOpacity: 0.2,
			strokeWidth: 0,
			width: IO_LIST_WIDTH
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

	setup() {
		super.setup()
		this.createHookList()
		this.update({ height: this.getHeight() }, false)
	}

	getHeight(): number {
	// calculate the height from the number of outputs
		if (this.outputNames == undefined) { return 0 }
		if (this.outputNames.length == 0) { return 0 }
		else { return 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * (this.outputNames.length - 1) }
	}

	createHookList() {
	// create the hooks (empty circles) and their labels
		this.linkHooks = []
		for (let submob of this.submobs) {
			this.remove(submob)
		}
		for (let i = 0; i < this.outputNames.length; i++) {
			let name = this.outputNames[i]
			let hook = new LinkHook({
				mobject: this.mobject,
				name: name,
				type: 'output'
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
		}
	}

	positionHookAndLabel(hook: LinkHook, label: TextLabel, index: number) {
		let m = new Vertex([HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * index])
		hook.update({ midpoint: m })
		let a = hook.midpoint.translatedBy(HOOK_LABEL_INSET, -HOOK_VERTICAL_SPACING / 2)
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

		if (args['outputNames'] === undefined) { return }

		this.createHookList()
		this.height = this.getHeight()
		if (this.mobject == null) { return }
		this.positionSelf()
	}

	positionSelf() {
		super.update({
			anchor: new Vertex(0.5 * (this.mobject.viewWidth - this.viewWidth), this.mobject.viewHeight + IO_LIST_OFFSET)
		}, true)
	}
}



























