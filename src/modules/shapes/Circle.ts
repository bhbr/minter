import { CircularArc } from './CircularArc'
import { TAU } from '../helpers/math'

export class Circle extends CircularArc {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			angle: TAU,
			closed: true
		})
	}

}