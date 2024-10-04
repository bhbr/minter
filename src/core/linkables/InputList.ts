
import { Vertex } from 'core/classes/vertex/Vertex'
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

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'linkHooks'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			mobject: null,
			inputNames: [],
			linkHooks: [],
			cornerRadius: 20,
			fillColor: Color.white(),
			fillOpacity: 0.2,
			strokeWidth: 0,
			width: IO_LIST_WIDTH
		})
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
			let m = new Vertex([HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * i])
			hook.update({ midpoint: m })
			let a = hook.midpoint.translatedBy(HOOK_LABEL_INSET, -HOOK_VERTICAL_SPACING / 2)
			label.update({ anchor: a })
			this.linkHooks.push(hook)
		}
	}

	hookNamed(name: string): LinkHook | null {
		for (let h of this.linkHooks) {
			if (h.name == name) {
				return h
			}
		}
		return null
	}

	update(argsDict: object = {}, redraw: boolean = true) {
		super.update(argsDict, false)
		this.height = this.getHeight()
		this.createHookList()
		if (this.mobject == null) { return }
		super.update({
			anchor: new Vertex(this.mobject.viewWidth / 2 - this.viewWidth / 2, -IO_LIST_OFFSET - this.getHeight())
		}, redraw)
	}
}


























