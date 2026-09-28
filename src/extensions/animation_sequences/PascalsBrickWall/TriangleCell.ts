
import { StackedBrickLabel } from './StackedBrickLabel'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { CELL_SIZE, CELL_PADDING, CELL_CORNER_RADIUS, COMB_LABEL_WIDTH, COMB_LABEL_HEIGHT, HEADS_COLOR, TAILS_COLOR, SLOW_CELL_ANIMATION_DURATION, FAST_CELL_ANIMATION_DURATION, CELL_STROKE_COLOR, CELL_HIGHLIGHT_STROKE_COLOR, CELL_STROKE_WIDTH, CELL_HIGHLIGHT_STROKE_WIDTH } from './constants'
import { TextLabel } from 'core/ui/TextLabel'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { binomial } from 'core/functions/math'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'


export class TriangleCell extends StackedBrickLabel {

	presentation: 'stacks' | 'combinations'
	nbCombinationsLabel: TextLabel
	probabilityIndicator: RoundedRectangle
	highlighted: boolean
	highlightBorder: RoundedRectangle

	defaults(): object {
		return {
			screenEventHandler: ScreenEventHandler.Parent,
			fillColor: Color.gray(0.2),
			fillOpacity: 1,
			strokeWidth: 0,
			presentation: 'stacks',
			highlighted: false,
			highlightBorder: new RoundedRectangle({
				width: CELL_SIZE,
				height: CELL_SIZE,
				cornerRadius: CELL_CORNER_RADIUS,
				color: CELL_STROKE_COLOR,
				strokeWidth: CELL_STROKE_WIDTH,
				fillOpacity: 0
			}),
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
		this.probabilityIndicator.view.svg.style.overflow = 'hidden'
		this.add(this.probabilityIndicator)
		this.add(this.nbCombinationsLabel)
		this.add(this.highlightBorder)
		if (this.highlighted) {
			this.highlight()
		} else {
			this.unhighlight()
		}
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

	animatedAddHeadsCoin(animationDuration: number = 0, completionHandler: () => void = () => {}) {
		if (this.presentation == 'stacks') {
			this.animate({
				anchor: [this.anchor[0] - this.width / 2 - CELL_PADDING / 2, this.anchor[1] + this.height + CELL_PADDING],
				opacity: 1
			}, animationDuration, false, function() {
				this.addHeadsCoin()
				completionHandler()
			}.bind(this))
		} else if (this.presentation == 'combinations') {
			this.animate({
				anchor: [this.anchor[0] - this.width / 2 - CELL_PADDING / 2, this.anchor[1] + this.height + CELL_PADDING],
				opacity: 1,
			}, animationDuration, false, function() {
				this.addHeadsCoin()
				completionHandler()
			}.bind(this))
		}
	}

	animatedAddTailsCoin(animationDuration: number = 0, completionHandler: () => void = () => {}) {
		if (this.presentation == 'stacks') {
			this.animate({
				anchor: [this.anchor[0] + this.width / 2 + CELL_PADDING / 2, this.anchor[1] + this.height + CELL_PADDING],
				opacity: 1
			}, animationDuration, false, function() {
				this.addTailsCoin()
				completionHandler()
			}.bind(this))
		} else if (this.presentation == 'combinations') {
			this.animate({
				anchor: [this.anchor[0] + this.width / 2 + CELL_PADDING / 2, this.anchor[1] + this.height + CELL_PADDING],
				opacity: 1,
			}, animationDuration, false, function() {
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

	computeFillColor(darkeningFactor: number = 0): Color {
		let interpolatedColor = HEADS_COLOR.interpolate(TAILS_COLOR, this.nbTails / this.nbFlips())
		let baseColor = (this.nbFlips() != 0) ? interpolatedColor : Color.gray(0.25)
		return baseColor.darken(darkeningFactor)
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
		this.update({
			fillColor: this.computeFillColor(0.6)
		})
		let p = binomial(this.nbFlips(), this.nbTails) / (2 ** this.nbFlips())
		this.probabilityIndicator.update({
			fillColor: this.computeFillColor(0),
			anchor: [0, this.height * (1 - p)],
			height: this.height * p
		})
		this.probabilityIndicator.view.svg.style.overflow = 'hidden' // for when height or width < a corner radius
		// this is here not in the setup bc something keeps overwriting this property
	}

	highlight() {
		this.update({
			//fillColor: this.computeFillColor(0.2),
			highlighted: true
		})
		this.highlightBorder.update({
			strokeColor: CELL_HIGHLIGHT_STROKE_COLOR,
			strokeWidth: CELL_HIGHLIGHT_STROKE_WIDTH
		})
	}

	unhighlight() {
		this.update({
			//fillColor: this.computeFillColor(0.6),
			highlighted: false
		})
		this.highlightBorder.update({
			strokeColor: CELL_STROKE_COLOR,
			strokeWidth: CELL_STROKE_WIDTH
		})
	}

}

