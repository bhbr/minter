
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'

export class Coin extends Circle {
	
	state: 'heads' | 'tails'
	headsColor: Color
	tailsColor: Color
	tailsProbability: number

	defaults(): object {
		return {
			state: 'heads',
			radius: 25,
			headsColor: new Color(0, 0.3, 1),
			tailsColor: Color.red(),
			tailsProbability: 0.5
		}
	}

	get value(): number { return (this.state == 'tails') ? 1 : 0 }
	set value(newValue: number) { this.state = (newValue == 0) ? 'heads' : 'tails' }

	synchronizeUpdateArguments(args: object = {}): object {
		args = super.synchronizeUpdateArguments(args)
		let newState = args['state']
		if (newState === undefined) { return args }
		let hc = args['headsColor'] ?? this.headsColor
		let tc = args['tailsColor'] ?? this.tailsColor
		args['fillColor'] = (newState === 'heads') ? hc : tc
		return args
	}

	flip() {
		let x = Math.random()
		let newState = (x < this.tailsProbability) ? 'tails' : 'heads'
		this.update({ state: newState })
	}




}