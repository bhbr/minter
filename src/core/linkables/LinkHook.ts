
import { vertex } from 'core/functions/vertex'
import { Linkable } from './Linkable'
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { HOOK_RADIUS } from './constants'
import { LinkOutlet } from './LinkOutlet'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { log } from 'core/functions/logging'

export class LinkHook extends Circle {

	mobject?: Linkable
	name: string
	outlet?: LinkOutlet

	defaults(): object {
		return {
			name: '',
			kind: 'input',
			radius: HOOK_RADIUS,
			fillOpacity: 0,
			strokeColor: Color.white(),
			mobject: null,
			outlet: null
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

	




}