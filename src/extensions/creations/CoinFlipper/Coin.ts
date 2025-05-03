
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { TextLabel } from 'core/mobjects/TextLabel'

export class Coin extends Circle {
	
	state: 'heads' | 'tails'
	headsColor: Color
	tailsColor: Color
	tailsProbability: number
	label: TextLabel

	defaults(): object {
		return {
			state: 'heads',
			radius: 25,
			headsColor: new Color(0, 0.3, 1),
			tailsColor: Color.red(),
			tailsProbability: 0.5,
			label: new TextLabel({
				fontSize: 24,
				text: 'H'
			})
		}
	}

	setup() {
		super.setup()
		this.label.update({
			//anchor: [0, 0],
			frameWidth: 2 * this.radius,
			frameHeight: 2 * this.radius
		})
		this.add(this.label)
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
		args['labelText'] = (newState === 'heads') ? 'H' : 'T'
		return args
	}

	flip() {
		let x = Math.random()
		let newState = (x < this.tailsProbability) ? 'tails' : 'heads'
		this.update({ state: newState })
	}

	get labelText(): string {
		return this.label.text
	}

	set labelText(newValue: string) {
		this.label.update({ text: newValue })
	}




}