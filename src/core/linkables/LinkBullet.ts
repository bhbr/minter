
import { Circle } from 'core/shapes/Circle'
import { BULLET_RADIUS } from './constants'
import { Color } from 'core/classes/Color'
import { vertex } from 'core/functions/vertex'
import { DependencyLink } from './DependencyLink'

export class LinkBullet extends Circle {
/*
A link bullet gets dragged onto a link hook to create
a dependency between two linkable mobjects.
*/

	ownDefaults(): object {
		return {
			radius: BULLET_RADIUS,
			fillOpacity: 1,
			strokeColor: Color.white()
		}
	}

	ownMutabilities(): object {
		return {
			radius: 'never',
			fillOpacity: 'never',
			strokeColor: 'never'
		}
	}

	get parent(): DependencyLink {
		return super.parent as DependencyLink
	}
	set parent(newValue: DependencyLink) {
		super.parent = newValue
	}

	positionInLinkMap(): vertex {
	// used e. g. for snapping
		return this.midpoint
	}


}