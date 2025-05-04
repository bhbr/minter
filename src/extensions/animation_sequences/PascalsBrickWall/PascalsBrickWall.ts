
import { AnimationSequence } from 'core/animation_sequence/AnimationSequence'
import { BrickRow } from './BrickRow'

export class PascalsBrickWall extends AnimationSequence {

	nbRows: number

	defaults(): object {
		return {
			nbRows: 10
		}
	}

	setup() {
		super.setup()
		for (var i = 1; i < this.nbRows; i++) {
			let row = new BrickRow({
				anchor: [100, 100 + 50 * i],
				nbFlips: i
			})
			this.add(row)
		}
	}
	
}