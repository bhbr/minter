
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { CoinStack } from './CoinStack'

export class CoinStackCreator extends DraggingCreator {

	declare creation: CoinStack

	createMobject(): CoinStack {
		return new CoinStack()
	}

}