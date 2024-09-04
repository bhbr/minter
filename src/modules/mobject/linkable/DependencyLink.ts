import { Vertex } from '../../helpers/Vertex'
import { Dependency } from '../Dependency'
import { CreatingMobject } from '../../creations/CreatingMobject'
import { Circle } from '../../shapes/Circle'
import { LinkHook } from './LinkHook'
import { Segment } from '../../arrows/Segment'
import { LinkableMobject } from './LinkableMobject'
import { Mobject } from '../Mobject'
import { log } from '../../helpers/helpers'
import { LinkBullet } from './LinkBullet'
import { LINK_LINE_WIDTH } from './constants'

export class DependencyLink extends Mobject {
/*
The drawn link between an output hook and an input hook,
the visual representation of a dependency between two
linkable mobjects
*/

	dependency: Dependency
	startBullet: LinkBullet
	endBullet: LinkBullet
	linkLine: Segment

	statelessSetup() {
		super.statelessSetup()
		this.dependency = new Dependency()
		this.startBullet = new LinkBullet()
		this.endBullet = new LinkBullet()
		this.linkLine = new Segment({
			strokeWidth: LINK_LINE_WIDTH
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.startBullet)
		this.add(this.linkLine)
		this.add(this.endBullet)
		this.startBullet.addDependency('midpoint', this.linkLine, 'startPoint')
		this.endBullet.addDependency('midpoint', this.linkLine, 'endPoint')
	}

}