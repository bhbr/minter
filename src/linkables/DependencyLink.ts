
import { Dependency } from 'mobjects/Dependency.js'
import { Line } from 'shapes/Line.js'
import { Mobject } from 'mobjects/Mobject.js'
import { Board } from 'boards/Board.js'
import { LinkBullet } from './LinkBullet.js'
import { LINK_LINE_WIDTH } from './constants.js'
import { ScreenEventHandler } from 'mobjects/screen_events.js'
import { LinkHook } from './LinkHook.js'
import { Color } from 'classes/Color.js'

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
	previousHook: LinkHook | null
	linkLine: Line
	borderLinkLine: Line

	defaults(): object {
		return {
			dependency: new Dependency(),
			startBullet: new LinkBullet(),
			endBullet: new LinkBullet(),
			startHook: null,
			endHook: null,
			previousHook: null,
			linkLine: new Line({ strokeWidth: LINK_LINE_WIDTH }),
			borderLinkLine: new Line({
				strokeWidth: LINK_LINE_WIDTH + 4,
				strokeColor: Color.black()
			}),
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
		this.startBullet.addDependency('midpoint', this.borderLinkLine, 'startPoint')
		this.linkLine.update({
			startPoint: this.startBullet.midpoint
		})
		this.borderLinkLine.update({
			startPoint: this.startBullet.midpoint
		})
		this.endBullet.addDependency('midpoint', this.linkLine, 'endPoint')
		this.endBullet.addDependency('midpoint', this.borderLinkLine, 'endPoint')
		this.linkLine.update({
			endPoint: this.endBullet.midpoint
		})
		this.borderLinkLine.update({
			endPoint: this.endBullet.midpoint
		})
		this.add(this.borderLinkLine)
		this.add(this.startBullet)
		this.add(this.endBullet)
		this.add(this.linkLine)
	}

	showLine() {
		this.borderLinkLine.view.show()
		this.linkLine.view.show()
	}

	hideLine() {
		this.borderLinkLine.view.hide()
		this.linkLine.view.hide()
	}





























}