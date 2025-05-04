
import { MGroup } from 'core/mobjects/MGroup'
import { Brick } from './Brick'
import { vertex, vertexAdd } from 'core/functions/vertex'

export class BrickRow extends MGroup {

	nbFlips: number
	bricks: Array<Brick>
	
	defaults(): object {
		return {
			nbFlips: 1,
			bricks: []
		}
	}

	setup() {
		super.setup()
		var slidingAnchor: vertex = [0, 0]
		for (var i = 0; i <= this.nbFlips; i++) {
			let brick = new Brick({
				anchor: slidingAnchor,
				nbFlips: this.nbFlips,
				nbTails: i
			})
			this.bricks.push(brick)
			this.add(brick)
			slidingAnchor = vertexAdd(slidingAnchor, [brick.width, 0])
		}
	}
}