
import { StackedBrickLabel } from './StackedBrickLabel'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'

export class PascalsTriangleCell extends StackedBrickLabel {

	defaults(): object {
		return {
			fillColor: Color.gray(0.2),
			fillOpacity: 0.8,
			strokeWidth: 0,
		}
	}

	animatedAddHeadsCoin(completionHandler: () => void = () => {}) {
		this.animate({
			anchor: [this.anchor[0] - this.width / 2 - 5, this.anchor[1] + this.height + 10]
		}, 1, false, function() {
			this.addHeadsCoin()
			completionHandler()
		}.bind(this))
	}

	animatedAddTailsCoin(completionHandler: () => void = () => {}) {
		this.animate({
			anchor: [this.anchor[0] + this.width / 2 + 5, this.anchor[1] + this.height + 10]
		}, 1, false, function() {
			this.addTailsCoin()
			completionHandler()
		}.bind(this))
	}
}

