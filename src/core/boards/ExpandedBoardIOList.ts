
import { IOList } from 'core/linkables/IOList'
import { LinkHook } from 'core/linkables/LinkHook'
import { TextLabel } from 'core/mobjects/TextLabel'
import { vertex } from 'core/functions/vertex'
import { HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_INSET, HOOK_VERTICAL_SPACING } from 'core/linkables/constants'
import { HOOK_HORIZONTAL_SPACING } from './constants'
import { EditableLinkHook } from './EditableLinkHook'
import { Board } from 'core/boards/Board'


export class ExpandedBoardIOList extends IOList {

	emptyLinkHook: EditableLinkHook
	declare _parent: Board

	ownDefaults(): object {
		return {
			emptyLinkHook: new EditableLinkHook({ showBox: false })
		}
	}

	ownMutabilities(): object {
		return {
			emptyLinkHook: 'always'
		}
	}

	positionHook(hook: EditableLinkHook, index: number) {
		let m: vertex = [
			HOOK_INSET_X + hook.radius + HOOK_HORIZONTAL_SPACING * index,
			HOOK_INSET_Y + hook.radius
		]
		hook.update({
			midpoint: m,
			index: index
		})
	}

	get parent(): Board {
		return super.parent as Board
	}

	set parent(newValue: Board) {
		super.parent = newValue
	}

	getHeight(): number {
		return this.view.frame.height
	}

	setup() {
		super.setup()
		this.createNewHook(true)
	}

	createNewHook(empty: boolean = false) {
		let hook = new EditableLinkHook({
			mobject: this.mobject,
			empty: empty
		})
		this.positionHook(hook, this.linkHooks.length)
		this.add(hook)
		this.linkHooks.push(hook)
	}

	getLinkNames(): Array<string> {
		let newLinkNames: Array<string> = this.linkHooks.map((hook) => hook.name)
		newLinkNames.pop() // last hook is new and empty
		return newLinkNames
	}

	updateLinkNames() {
		// implemented in subclasses
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		let newMob = args['mobject']
		if (newMob !== undefined) {
			this.linkHooks.forEach((hook) => hook.update({
				mobject: newMob
			}, false))
		}
	}

}