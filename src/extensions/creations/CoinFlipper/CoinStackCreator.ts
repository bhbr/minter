
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { CoinStack } from './CoinStack'

export class CoinStackCreator extends DraggingCreator {

	declare creation: CoinStack

	defaults(): object {
		return {
			helpText: 'A stack of coins automatically sorted into heads (H) and tails (T). Tap the stack or the play button to flip all the coins. The number of coins can be edited.'
		}
	}

	createMobject(): CoinStack {
		return new CoinStack()
	}

}