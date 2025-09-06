
import { vertex } from 'core/functions/vertex'
import { Linkable } from './Linkable'
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { HOOK_RADIUS, BULLET_RADIUS } from './constants'
import { LinkOutlet } from './LinkOutlet'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { log } from 'core/functions/logging'
import { Mobject } from 'core/mobjects/Mobject'

export class LinkHook extends Circle {

	mobject?: Linkable
	outlet?: LinkOutlet // TODO: redirect to parent
	linked: boolean
	linkedBulletIndicator: Circle

	defaults(): object {
		return {
			name: '',
			kind: 'input',
			radius: HOOK_RADIUS,
			fillOpacity: 0,
			strokeColor: Color.white(),
			mobject: null,
			outlet: null,
			linked: false,
			linkedBulletIndicator: new Circle({
				radius: BULLET_RADIUS,
				fillColor: Color.white(),
				fillOpacity: 1,
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
			kind: 'on_init',
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