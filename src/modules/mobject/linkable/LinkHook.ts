import { Vertex } from '../../helpers/Vertex'
import { Mobject } from '../Mobject'
import { LinkableMobject } from '../linkable/LinkableMobject'
import { Circle } from '../../shapes/Circle'
import { Color } from '../../helpers/Color'
import { log } from '../../helpers/helpers'
import { HOOK_INSET_X, HOOK_INSET_Y, HOOK_RADIUS, BULLET_RADIUS } from './constants'
import { isTouchDevice } from '../screen_events'

export class LinkHook extends Circle {
/*
A link bullet gets dragged onto a link hook to create
a dependency between two linkable mobjects.
*/

	mobject: LinkableMobject
	name: string
	type: "input" | "output"

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			mobject: new Mobject(),
			name: "default",
			type: "input"
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {        
			radius: HOOK_RADIUS,
			fillOpacity: 0,
			strokeColor: Color.white()
		})
	}

	positionInLinkMap(): Vertex {
	// used e. g. for snapping
		return this.parent.transformLocalPoint(this.midpoint, this.parent.parent.parent)
	}






}