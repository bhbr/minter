
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'

export class Coin extends Circle {
	
	state: 'heads' | 'tails'
	headsColor: Color
	tailsColor: Color

	defaults(): object {
		return {
			state: 'heads',
			radius: 25,
			headsColor: Color.black(),
			tailsColor: Color.white()
		}
	}

	synchronizeUpdateArguments(args: object = {}): object {
		args = super.synchronizeUpdateArguments(args)
		let newState = args['state']
		if (newState === undefined) { return args }
		let hc = this.headsColor ?? args['headsColor']
		let tc = this.tailsColor ?? args['tailsColor']
		args['fillColor'] = (newState === 'heads') ? hc : tc
		return args
	}

	flip(tailsProbability: number = 0.5) {
		let x = Math.random()
		let newState = (x > tailsProbability) ? 'heads' : 'tails'
		this.update({ state: newState })
	}

}