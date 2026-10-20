
import { Circle } from 'shapes/Circle.js'
import { BULLET_RADIUS } from './constants.js'
import { Color } from 'classes/Color.js'
import { vertex } from '@bhbr/affr2'
import { DependencyLink } from './DependencyLink.js'

export class LinkBullet extends Circle {
/*
A link bullet gets dragged onto a link hook to create
a dependency between two linkable mobjects.
*/

	defaults(): object {
		return {
			radius: BULLET_RADIUS,
			fillOpacity: 1,
			strokeColor: Color.black(),
			strokeWidth: 2
		}
	}

	mutabilities(): object {
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

	positionInBoard(): vertex {
	// used e. g. for snapping
		return this.midpoint
	}


}