
import { vertex } from 'core/functions/vertex'
import { Linkable } from './Linkable'
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { HOOK_RADIUS, BULLET_RADIUS } from './constants'
import { LinkOutlet } from './LinkOutlet'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { log } from 'core/functions/logging'
import { Mobject } from 'core/mobjects/Mobject'
import { LinkBullet } from './LinkBullet'

export class LinkHook extends Circle {

	outlet?: LinkOutlet // TODO: redirect to parent
	linked: boolean
	linkedBulletIndicator: Circle

	defaults(): object {
		return {
			name: '',
			radius: HOOK_RADIUS,
			fillOpacity: 0,
			strokeColor: Color.white(),
			outlet: null,
			linked: false,
			linkedBulletIndicator: new LinkBullet({
				midpoint: [HOOK_RADIUS, HOOK_RADIUS]
			})
		}
	}

	mutabilities(): object {
		return {
			radius: 'never',
			fillOpacity: 'never',
			strokeColor: 'never',
			name: 'always',
			outlet: 'on_init'
		}
	}

	setup() {
		super.setup()
		if (this.linked) {
			this.add(this.linkedBulletIndicator)
		}
	}

	positionInBoard(): vertex {
		let board = this.outlet.ioList.mobject.board
		return this.parent.frame.transformLocalPoint(this.midpoint, board.frame)
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['linked'] !== undefined) {
			if (this.linked) {
				this.add(this.linkedBulletIndicator)
			} else {
				this.remove(this.linkedBulletIndicator)
			}
		}
	}




}