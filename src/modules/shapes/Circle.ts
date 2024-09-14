import { CircularArc } from './CircularArc'
import { TAU } from '../helpers/math'

export class Circle extends CircularArc {
	/*
	A Circle is a CircularArc whose angle equals TAU = 2*PI.
	*/
	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			angle: TAU,
			closed: true
		})
	}

}