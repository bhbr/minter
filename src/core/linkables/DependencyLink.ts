
import { Vertex } from 'core/classes/vertex/Vertex'
import { Dependency } from 'core/mobjects/Dependency'
import { Line } from 'core/shapes/Line'
import { Mobject } from 'core/mobjects/Mobject'
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
	linkLine: Line

	statelessSetup() {
		super.statelessSetup()
		this.dependency = new Dependency()
		this.startBullet = new LinkBullet()
		this.endBullet = new LinkBullet()
		this.linkLine = new Line({
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