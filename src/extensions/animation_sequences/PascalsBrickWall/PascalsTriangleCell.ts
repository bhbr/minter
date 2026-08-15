
import { StackedBrickLabel } from './StackedBrickLabel'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { CELL_PADDING } from './constants'

export class PascalsTriangleCell extends StackedBrickLabel {


	defaults(): object {
		return {
			fillColor: Color.gray(0.2),
			fillOpacity: 1,
			strokeColor: Color.gray(0.4),
			strokeWidth: 1,
		}
	}

	setup() {
		super.setup()
		this.showCombinationsLabel()
	}

	animatedAddHeadsCoin(completionHandler: () => void = () => {}) {
		this.animate({
			anchor: [this.anchor[0] - this.width / 2 - CELL_PADDING / 2, this.anchor[1] + this.height + CELL_PADDING],
			opacity: 1
		}, 1, false, function() {
			this.addHeadsCoin()
			completionHandler()
		}.bind(this))
	}

	animatedAddTailsCoin(completionHandler: () => void = () => {}) {
		this.animate({
			anchor: [this.anchor[0] + this.width / 2 + CELL_PADDING / 2, this.anchor[1] + this.height + CELL_PADDING],
			opacity: 1
		}, 1, false, function() {
			this.addTailsCoin()
			completionHandler()
		}.bind(this))
	}
}

