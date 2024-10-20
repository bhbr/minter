
import { Vertex } from 'core/classes/vertex/Vertex'
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
		return this.updateDefaults(super.defaults(), {
			name: '',
			type: 'input',
			radius: HOOK_RADIUS,
			fillOpacity: 0,
			strokeColor: Color.white(),
			mobject: null
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			radius: 'never',
			fillOpacity: 'never',
			strokeColor: 'never',
			name: 'always',
			type: 'on_init',
			mobject: 'on_init'
		})
	}


	positionInLinkMap(): Vertex {
	// used e. g. for snapping
		return this.parent.transformLocalPoint(this.midpoint, this.parent.parent.parent)
	}

}