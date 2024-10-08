
import { CircularArc } from './CircularArc'
import { TAU } from 'core/constants'

export class Circle extends CircularArc {
	/*
	A Circle is a CircularArc whose angle equals TAU = 2*PI.
	*/
	
	fixedValues(): object {
		return Object.assign(super.fixedValues(), {
			angle: TAU,
			closed: true
		})
	}

}