
import { Creator } from 'core/creators/Creator'
import { CoinRow } from './CoinRow'
import { vertex } from 'core/functions/vertex'

export class CoinRowCreator extends Creator {
	
	declare creation?: CoinRow

	setup() {
		super.setup()
		this.creation = this.createMobject()
		this.add(this.creation)
	}

	createMobject(): CoinRow {
		return new CoinRow({
			nbCoins: 1,
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		let width = q[0] - this.getStartPoint()[0] - 100
		let nbCoins = Math.max(Math.floor(width / this.creation.coinSpacing), 1)
		this.creation.update({
			nbCoins: nbCoins
		})
	}

	dissolve() {
		this.parent.addToContent(this.creation)
		this.parent.creator = null
		this.parent.remove(this)
	}

}