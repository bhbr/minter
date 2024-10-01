
import { CircularArc } from './CircularArc'
import { TAU } from 'core/constants'

export class Circle extends CircularArc {
	/*
	A Circle is a CircularArc whose angle equals TAU = 2*PI.
	*/
	defaults(): object {
		return {
			angle: TAU,
			closed: true
		}
	}

}