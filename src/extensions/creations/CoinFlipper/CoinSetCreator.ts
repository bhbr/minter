
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { CoinSet } from './CoinSet'

export class CoinSetCreator extends DraggingCreator {

	declare creation: CoinSet

	createMobject(): CoinSet {
		return new CoinSet()
	}

	// dissolve() {
	// 	super.dissolve()
	// 	this.creation.nbCoinsInputBox.inputElement.focus()
	// 	this.creation.nbCoinsInputBox.activateKeyboard()
	// }

}