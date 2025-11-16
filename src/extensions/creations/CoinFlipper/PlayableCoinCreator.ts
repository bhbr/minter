
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { PlayableCoin } from './PlayableCoin'
import { vertexSubtract } from 'core/functions/vertex'

export class PlayableCoinCreator extends DraggingCreator {

	declare mobject: PlayableCoin

	defaults(): object {
		return {
			helpText: 'A coin that shows either heads (H) or tails (T). Tap the coin or the play button to flip it.'
		}
	}

	createMobject(): PlayableCoin {
		return new PlayableCoin()
	}

}