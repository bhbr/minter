
import { CircularArc } from './CircularArc'
import { TAU } from 'core/constants'

export class Circle extends CircularArc {
	/*
	A Circle is a CircularArc whose angle equals TAU = 2*PI.
	*/
	
	ownDefaults(): object {
		return {
			angle: TAU,
			closed: true
		}
	}

	ownMutabilities(): object {
		return {
			angle: 'never',
			closed: 'never'
		}
	}

}