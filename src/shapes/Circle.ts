
import { CircularArc } from './CircularArc.js'
import { TAU } from 'constants.js'

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

	mutabilities(): object {
		return {
			angle: 'never',
			closed: 'never'
		}
	}

}