
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

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'linkHooks'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			mobject: null,
			outputNames: [],
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
	// calculate the height from the number of outputs
		if (this.outputNames == undefined) { return 0 }
		if (this.outputNames.length == 0) { return 0 }
		else { return 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * (this.outputNames.length - 1) }
	}

	createHookList() {
	// create the hooks (empty circles) and their labels
		this.linkHooks = []
		for (let i = 0; i < this.outputNames.length; i++) {
			let name = this.outputNames[i]
			let h = new LinkHook({
				mobject: this.mobject,
				name: name,
				type: 'output'
			})
			let t = new TextLabel({
				text: name,
				horizontalAlign: 'left',
				verticalAlign: 'center',
				viewHeight: HOOK_VERTICAL_SPACING,
				viewWidth: IO_LIST_WIDTH - HOOK_LABEL_INSET
			})
			this.add(h)
			this.add(t)
			h.update({ midpoint: new Vertex([HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * i]) })
			t.update({ anchor: h.midpoint.translatedBy(HOOK_LABEL_INSET, -HOOK_VERTICAL_SPACING/2) })
			this.linkHooks.push(h)
		}
	}

	hookNamed(name): LinkHook | null {
		for (let h of this.linkHooks) {
			if (h.name == name) {
				return h
			}
		}
		return null
	}

	updateModel(argsDict: object = {}) {
		if (argsDict['outputNames'] !== undefined) {
			this.createHookList()
		}
		let p1: Vertex = this.topCenter()
		let p2: Vertex = (this.mobject != null) ? this.mobject.localBottomCenter() : Vertex.origin()
		argsDict['anchor'] = this.anchor.translatedBy(p2[0] - p1[0], p2[1] - p1[1] + IO_LIST_OFFSET)
		argsDict['height'] = this.getHeight()
		super.updateModel(argsDict)
	}
}



























