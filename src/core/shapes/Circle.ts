
import { CircularArc } from './CircularArc'
import { TAU } from 'core/constants'

export class Circle extends CircularArc {
	/*
	A Circle is a CircularArc whose angle equals TAU = 2*PI.
	*/
	
	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			angle: TAU,
			closed: true
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			angle: 'never',
			closed: 'never'
		})
	}

}