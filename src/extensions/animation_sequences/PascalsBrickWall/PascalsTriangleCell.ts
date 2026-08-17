
import { StackedBrickLabel } from './StackedBrickLabel'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { CELL_SIZE, CELL_PADDING, CELL_CORNER_RADIUS, COMB_LABEL_WIDTH, COMB_LABEL_HEIGHT, HEADS_COLOR, TAILS_COLOR, SLOW_CELL_ANIMATION_DURATION, FAST_CELL_ANIMATION_DURATION } from './constants'
import { TextLabel } from 'core/ui/TextLabel'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { binomial } from 'core/functions/math'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'


export class PascalsTriangleCell extends StackedBrickLabel {

	presentation: 'stacks' | 'combinations'
	nbCombinationsLabel: TextLabel
	probabilityIndicator: RoundedRectangle

	defaults(): object {
		return {
			fillColor: Color.gray(0.2),
			fillOpacity: 1,
			strokeColor: Color.gray(0.4),
			strokeWidth: 1,
			presentation: 'stacks',
			nbCombinationsLabel: new TextLabel({
				anchor: [(CELL_SIZE - COMB_LABEL_WIDTH) / 2, (CELL_SIZE - COMB_LABEL_HEIGHT) / 2],
				frameWidth: COMB_LABEL_WIDTH,
				frameHeight: COMB_LABEL_HEIGHT,
				textColor: Color.white(),
				fontSize: 20,
				screenEventHandler: ScreenEventHandler.Below,
				opacity: 0
			}),
			probabilityIndicator: new RoundedRectangle({
				width: CELL_SIZE,
				height: CELL_SIZE,
				fillColor: Color.clear(),
				fillOpacity: 1,
				strokeWidth: 0,
				cornerRadii: [0, 0, CELL_CORNER_RADIUS, CELL_CORNER_RADIUS]
			})
		}
	}

	setup() {
		super.setup()
		this.add(this.probabilityIndicator)
		this.add(this.nbCombinationsLabel)
		if (this.presentation == 'stacks') {
			this.showHTLabel()
		} else if (this.presentation == 'combinations') {
			this.showCombinationsLabel()
		}
	}
	
	addHeadsCoin() {
		super.addHeadsCoin()
		this.updateCombinationsLabel()
	}

	addTailsCoin() {
		super.addTailsCoin()
		this.updateCombinationsLabel()
	}

	removeHeadsCoin() {
		super.removeHeadsCoin()
		this.updateCombinationsLabel()
	}

	removeTailsCoin() {
		super.removeTailsCoin()
		this.updateCombinationsLabel()
	}

	animatedAddHeadsCoin(completionHandler: () => void = () => {}) {
		if (this.presentation == 'stacks') {
			this.animate({
				anchor: [this.anchor[0] - this.width / 2 - CELL_PADDING / 2, this.anchor[1] + this.height + CELL_PADDING],
				opacity: 1
			}, SLOW_CELL_ANIMATION_DURATION, false, function() {
				this.addHeadsCoin()
				completionHandler()
			}.bind(this))
		} else if (this.presentation == 'combinations') {
			this.animate({
				anchor: [this.anchor[0] - this.width / 2 - CELL_PADDING / 2, this.anchor[1] + this.height + CELL_PADDING],
				opacity: 1,
			}, SLOW_CELL_ANIMATION_DURATION, false, function() {
				this.addHeadsCoin()
				completionHandler()
			}.bind(this))
		}
	}

	animatedAddTailsCoin(completionHandler: () => void = () => {}) {
		if (this.presentation == 'stacks') {
			this.animate({
				anchor: [this.anchor[0] + this.width / 2 + CELL_PADDING / 2, this.anchor[1] + this.height + CELL_PADDING],
				opacity: 1
			}, SLOW_CELL_ANIMATION_DURATION, false, function() {
				this.addTailsCoin()
				completionHandler()
			}.bind(this))
		} else if (this.presentation == 'combinations') {
			this.animate({
				anchor: [this.anchor[0] + this.width / 2 + CELL_PADDING / 2, this.anchor[1] + this.height + CELL_PADDING],
				opacity: 1,
			}, SLOW_CELL_ANIMATION_DURATION, false, function() {
				this.addTailsCoin()
				completionHandler()
			}.bind(this))
		}
	}

	showHTLabel(duration: number = 0) {
		this.update({
			presentation: 'stacks'
		})
		this.updateHeadsLabel()
		this.updateTailsLabel()
		this.nbCombinationsLabel.animate({
			opacity: 0
		}, duration)
		this.probabilityIndicator.animate({
			opacity: 0
		}, duration)
		this.headsLabel.animate({
			opacity: 1
		}, duration)
		this.tailsLabel.animate({
			opacity: 1
		}, duration)
		this.headsStack.animate({
			opacity: 1
		}, duration)
		this.tailsStack.animate({
			opacity: 1
		}, duration)
	}

	computeFillColor(): Color {
		return (this.nbFlips() != 0) ? HEADS_COLOR.interpolate(TAILS_COLOR, this.nbTails / this.nbFlips()) : Color.black()
	}

	showCombinationsLabel(duration: number = 0) {
		this.update({
			presentation: 'combinations'
		})
		this.updateCombinationsLabel()
		this.nbCombinationsLabel.animate({
			opacity: 1
		}, duration)
		this.probabilityIndicator.animate({
			opacity: 1
		}, duration)
		this.headsLabel.animate({
			opacity: 0
		}, duration)
		this.tailsLabel.animate({
			opacity: 0
		}, duration)
		this.headsStack.animate({
			opacity: 0
		}, duration)
		this.tailsStack.animate({
			opacity: 0
		}, duration)
	}

	updateCombinationsLabel() {
		this.nbCombinationsLabel.update({
			text: binomial(this.nbFlips(), this.nbTails).toString()
		})
		if (this.nbFlips() == 0) { return }
		let p = binomial(this.nbFlips(), this.nbTails) / (2 ** this.nbFlips())
		this.probabilityIndicator.update({
			fillColor: this.computeFillColor(),
			anchor: [0, this.height * (1 - p)],
			height: this.height * p
		})
	}

}

