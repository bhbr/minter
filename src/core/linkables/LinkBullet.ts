
import { Circle } from 'core/shapes/Circle'
import { BULLET_RADIUS } from './constants'
import { Color } from 'core/classes/Color'
import { Vertex } from 'core/classes/vertex/Vertex'
import { DependencyLink } from './DependencyLink'

export class LinkBullet extends Circle {
/*
A link bullet gets dragged onto a link hook to create
a dependency between two linkable mobjects.
*/
	
	fixedValues(): object {
		return Object.assign(super.fixedValues(), {        
			radius: BULLET_RADIUS,
			fillOpacity: 1,
			strokeColor: Color.white()
		})
	}

	get parent(): DependencyLink {
		return super.parent as DependencyLink
	}
	set parent(newValue: DependencyLink) {
		super.parent = newValue
	}

	positionInLinkMap(): Vertex {
	// used e. g. for snapping
		return this.parent.transformLocalPoint(this.midpoint, this.parent.parent.parent)
	}


}