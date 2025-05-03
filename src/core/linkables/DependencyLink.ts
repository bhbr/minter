
import { Dependency } from 'core/mobjects/Dependency'
import { Line } from 'core/shapes/Line'
import { Mobject } from 'core/mobjects/Mobject'
import { Board } from 'core/boards/Board'
import { LinkBullet } from './LinkBullet'
import { LINK_LINE_WIDTH } from './constants'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { LinkHook } from './LinkHook'

export class DependencyLink extends Mobject {
/*
The drawn link between an output hook and an input hook,
the visual representation of a dependency between two
linkable mobjects
*/

	dependency: Dependency
	startBullet: LinkBullet
	startHook: LinkHook | null
	endBullet: LinkBullet
	endHook: LinkHook | null
	linkLine: Line

	defaults(): object {
		return {
			dependency: new Dependency(),
			startBullet: new LinkBullet(),
			endBullet: new LinkBullet(),
			startHook: null,
			endHook: null,
			linkLine: new Line({ strokeWidth: LINK_LINE_WIDTH }),
			screenEventHandler: ScreenEventHandler.Parent
		}
	}

	mutabilities(): object {
		return {
			startBullet: 'on_init',
			endBullet: 'on_init',
			linkLine: 'never'
		}
	}

	get parent(): Board {
		return super.parent as Board
	}
	set parent(newValue: Board) {
		super.parent = newValue
	}

	setup() {
		super.setup()
		this.startBullet.addDependency('midpoint', this.linkLine, 'startPoint')
		this.linkLine.update({
			startPoint: this.startBullet.midpoint
		})
		this.endBullet.addDependency('midpoint', this.linkLine, 'endPoint')
		this.linkLine.update({
			endPoint: this.endBullet.midpoint
		})
		this.add(this.startBullet)
		this.add(this.endBullet)
		this.add(this.linkLine)
	}






























}