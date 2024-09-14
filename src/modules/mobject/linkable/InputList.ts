import { Vertex } from '../../helpers/Vertex'
import { Color } from '../../helpers/Color'
import { LinkableMobject } from './LinkableMobject'
import { RoundedRectangle } from '../../shapes/RoundedRectangle'
import { LinkHook } from './LinkHook'
import { TextLabel } from '../../TextLabel'
import { log } from '../../helpers/helpers'
import { IO_LIST_WIDTH, IO_LIST_OFFSET, HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_INSET, HOOK_VERTICAL_SPACING } from './constants'

export class InputList extends RoundedRectangle {
/*
A visual list of available input variables of a linkable mobject
*/

	inputNames: Array<string>
	linkHooks: Array<LinkHook>
	mobject: LinkableMobject // the mobject whose input this list represents

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
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

	statefulSetup() {
		super.statefulSetup()
		this.createHookList()
		this.update({ height: this.getHeight() }, false)
	}

	getHeight(): number {
		if (this.inputNames == undefined) { return 0 }
		if (this.inputNames.length == 0) { return 0 }
		else {
			let h = 2 * HOOK_INSET_Y + HOOK_VERTICAL_SPACING * (this.inputNames.length - 1)
			return h
		}
	}

	createHookList() {
		this.linkHooks = []
		for (let i = 0; i < this.inputNames.length; i++) {
			let name = this.inputNames[i]
			let h = new LinkHook({
				mobject: this.mobject,
				name: name,
				type: 'input'
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
			let m = new Vertex([HOOK_INSET_X, HOOK_INSET_Y + HOOK_VERTICAL_SPACING * i])
			h.update({ midpoint: m })
			let a = h.midpoint.translatedBy(HOOK_LABEL_INSET, -HOOK_VERTICAL_SPACING/2)
			t.update({ anchor: a })
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
		if (argsDict['inputNames'] !== undefined) {
			this.createHookList()
		}
		let p1: Vertex = this.bottomCenter()
			let p2: Vertex = this.mobject.localTopCenter()
		let v = new Vertex(p2[0] - p1[0], p2[1] - p1[1] - IO_LIST_OFFSET)
		argsDict['anchor'] = this.anchor.translatedBy(v)
		argsDict['height'] = this.getHeight()
		super.updateModel(argsDict)
	}
}