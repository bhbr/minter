
import { CircularArc } from './CircularArc'
import { TAU } from 'core/constants'

export class Circle extends CircularArc {
	/*
	A Circle is a CircularArc whose angle equals TAU = 2*PI.
	*/
	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'angle',
			'closed'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			angle: TAU,
			closed: true
		})
	}

}