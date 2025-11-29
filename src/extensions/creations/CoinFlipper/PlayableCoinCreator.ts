
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { PlayableCoin } from './PlayableCoin'
import { vertexSubtract } from 'core/functions/vertex'

export class PlayableCoinCreator extends DraggingCreator {

	declare mobject: PlayableCoin

	defaults(): object {
		return {
			helpText: 'A coin that shows either heads (H) or tails (T). Tap the coin or the play button to flip it.',
			pointOffset: [-25, -50]
		}
	}


	createMobject(): PlayableCoin {
		let c = new PlayableCoin()
		c.update({
			anchor: this.pointOffset
		})
		return c
	}

}