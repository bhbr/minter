
import { InputList } from 'core/linkables/InputList'
import { LinkHook } from 'core/linkables/LinkHook'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Vertex } from 'core/classes/vertex/Vertex'
import { HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_INSET, HOOK_VERTICAL_SPACING } from 'core/linkables/constants'
import { HOOK_HORIZONTAL_SPACING } from './constants'
import { EditableLinkHook } from './EditableLinkHook'

export class ExpandedBoardInputList extends InputList {

	positionHookAndLabel(hook: LinkHook, label: TextLabel, index: number) {
			let m = new Vertex(HOOK_INSET_X + HOOK_HORIZONTAL_SPACING * index, HOOK_INSET_Y)
			hook.update({ midpoint: m })
			let a = hook.midpoint.translatedBy(HOOK_LABEL_INSET, -0.5 * HOOK_VERTICAL_SPACING)
			label.update({ anchor: a })
	}

	getHeight(): number {
		return this.viewHeight
	}

	setup() {
		super.setup()
		let hook = new EditableLinkHook()
		this.add(hook)
	}

}