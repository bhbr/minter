
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { PlayableCoin } from './PlayableCoin'

export class PlayableCoinCreator extends DraggingCreator {

	declare mobject: PlayableCoin

	createMobject(): PlayableCoin {
		return new PlayableCoin()
	}

}