
import { IOList } from 'linkables/IOList.js'
// import { vertex } from '@bhbr/affr2'
import { HOOK_INSET_X, HOOK_INSET_Y, HOOK_LABEL_INSET, HOOK_VERTICAL_SPACING } from 'linkables/constants.js'
import { OUTLET_HORIZONTAL_SPACING } from './constants.js'
// import { EditableLinkHook } from './EditableLinkHook'
 import { Board } from 'boards/Board.js'
import { LinkOutlet } from 'linkables/LinkOutlet.js'
import { Color } from 'classes/Color.js'
import { log } from 'functions/logging.js'
import { IOProperty } from 'linkables/Linkable.js'

export class ExpandedBoardIOList extends IOList {

// 	emptyLinkHook: EditableLinkHook
 	declare _parent: Board

// 	defaults(): object {
// 		return {
// 			emptyLinkHook: new EditableLinkHook({ showBox: false })
// 		}
// 	}

// 	mutabilities(): object {
// 		return {
// 			emptyLinkHook: 'always'
// 		}
// 	}

	get parent(): Board {
		return super.parent as Board
	}

	set parent(newValue: Board) {
		super.parent = newValue
	}

	createOutlet(prop: IOProperty) {
		super.createOutlet(prop)
		this.linkOutlets[this.linkOutlets.length - 1].label.update({
			backgroundColor: Color.gray(0.5)
		})
	}

	positionOutlet(outlet: LinkOutlet, index: number) {
		outlet.update({
			anchor: [HOOK_INSET_X + OUTLET_HORIZONTAL_SPACING * index, HOOK_INSET_Y]
		})
	}

// 	positionHook(hook: EditableLinkHook, index: number) {
// 		let m: vertex = [
// 			HOOK_INSET_X + hook.radius + HOOK_HORIZONTAL_SPACING * index,
// 			HOOK_INSET_Y + hook.radius
// 		]
// 		hook.update({
// 			midpoint: m,
// 			index: index
// 		})
// 	}


// 	getHeight(): number {
// 		return this.view.frame.height
// 	}


// 	createNewHook(empty: boolean = false) {
// 		let hook = new EditableLinkHook({
// 			mobject: this.mobject,
// 			empty: empty
// 		})
// 		this.positionHook(hook, this.linkHooks.length)
// 		this.add(hook)
// 		this.linkHooks.push(hook)
// 	}

// 	getLinkNames(): Array<string> {
// 		let newLinkNames: Array<string> = this.linkHooks.map((hook) => hook.name)
// 		newLinkNames.pop() // last hook is new and empty
// 		return newLinkNames
// 	}

// 	updateLinkNames() {
// 		// implemented in subclasses
// 	}


}