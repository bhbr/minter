
import { vertex } from '@bhbr/affr2'
import { Linkable } from './Linkable.js'
import { Circle } from '../shapes/Circle.js'
import { Color } from '../views/Color.js'
import { HOOK_RADIUS, BULLET_RADIUS } from './constants.js'
import { LinkOutlet } from './LinkOutlet.js'
import { ScreenEvent, ScreenEventHandler } from '../mobjects/screen_events.js'
import { log } from '../functions/logging.js'
import { Mobject } from '../mobjects/Mobject.js'
import { LinkBullet } from './LinkBullet.js'

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