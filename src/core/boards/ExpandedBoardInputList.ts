
import { InputList } from 'core/linkables/InputList'
import { LinkHook } from 'core/linkables/LinkHook'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Vertex } from 'core/classes/vertex/Vertex'
import { HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_INSET, HOOK_VERTICAL_SPACING } from 'core/linkables/constants'
import { HOOK_HORIZONTAL_SPACING } from './constants'
import { EditableLinkHook } from './EditableLinkHook'

export class ExpandedBoardInputList extends InputList {

	positionHook(hook: EditableLinkHook, index: number) {
			let m = new Vertex(
				HOOK_INSET_X + hook.radius + HOOK_HORIZONTAL_SPACING * index,
				HOOK_INSET_Y + hook.radius
				)
			hook.update({
				midpoint: m,
				index: index
			})
	}

	getHeight(): number {
		return this.viewHeight
	}

	setup() {
		super.setup()
		this.createNewHook()
	}

	createNewHook() {
		let hook = new EditableLinkHook()
		this.positionHook(hook, this.linkHooks.length)
		this.add(hook)
		this.linkHooks.push(hook)
	}

	updateInputNames() {
		let newInputNames: Array<string> = this.linkHooks.map((hook) => hook.name)
		newInputNames.pop() // last hook is new and empty
		this.mobject.update({
			inputNames: newInputNames
		})
	}


}