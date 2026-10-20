
import { Creator } from 'creators/Creator.js'
import { CoinRow } from './CoinRow.js'
import { vertex, vertexAdd } from '@bhbr/affr2'
import { log } from 'functions/logging.js'

export class CoinRowCreator extends Creator {

	defaults(): object {
		return {
			helpText: 'A row of coins. Drag horizontally to the desired number of coins. Tap the coins or the play button to flip them. Long press to flip 100 times.',
			pointOffset: [-50, -50]
		}
	}

	declare creation?: CoinRow

	setup() {
		super.setup()
		this.creation = this.createMobject()
		this.creation.update({
			anchor: this.pointOffset
		})
		this.add(this.creation)
	}

	createMobject(): CoinRow {
		return new CoinRow({
			nbCoins: 1,
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		let width = q[0] - this.getStartPoint()[0]
		let nbCoins = Math.max(Math.floor(width / this.creation.coinSpacing), 1)
		this.creation.update({
			nbCoins: nbCoins
		})
	}

	dissolve() {
		if (this.creation === null) { return }
		this.creation.update({
			anchor: vertexAdd(this.getStartPoint(), this.pointOffset),
			frameWidth: this.creation.computeWidth()
		})
		this.creation.inputList.positionSelf()
		this.creation.outputList.positionSelf()
		this.parent.addToContent(this.creation)
		this.parent.creator = null
		this.parent.remove(this)
	}

}