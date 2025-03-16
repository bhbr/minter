
import { vertex } from 'core/functions/vertex'
import { Mobject } from 'core/mobjects/Mobject'
import { Linkable } from './Linkable'
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { HOOK_INSET_X, HOOK_INSET_Y, HOOK_RADIUS, BULLET_RADIUS } from './constants'

export class LinkHook extends Circle {

	mobject?: Linkable
	name: string
	type: 'input' | 'output'

	defaults(): object {
		return {
			name: '',
			type: 'input',
			radius: HOOK_RADIUS,
			fillOpacity: 0,
			strokeColor: Color.white(),
			mobject: null
		}
	}

	mutabilities(): object {
		return {
			radius: 'never',
			fillOpacity: 'never',
			strokeColor: 'never',
			name: 'always',
			type: 'on_init'
		}
	}

	positionInLinkMap(): vertex {
	// used e. g. for snapping
		let p = this.parent.view.frame.transformLocalPoint(this.midpoint, this.mobject.parent.view.frame)
		return p
	}

}