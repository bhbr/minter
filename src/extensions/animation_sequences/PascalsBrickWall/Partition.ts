
import { Linkable } from 'core/linkables/Linkable'
import { Brick } from './Brick'
import { vertex, vertexAdd, vertexSubtract } from 'core/functions/vertex'
import { log } from 'core/functions/logging'
import { TAU } from 'core/constants'
import { HEADS_COLOR, TAILS_COLOR, BRICK_HEIGHT, ROW_WIDTH, BRICK_STROKE_WIDTH, FAST_ANIMATION_DURATION, SLOW_ANIMATION_DURATION, BRICK_FILL_OPACITY } from './constants'
import { Color } from 'core/classes/Color'
import { RadioButtonList } from 'core/mobjects/RadioButtonList'
import { Rectangle } from 'core/shapes/Rectangle'
import { Line } from 'core/shapes/Line'
import { MGroup } from 'core/mobjects/MGroup'
import { binomial } from 'core/functions/math'
import { SimpleButton } from 'core/mobjects/SimpleButton'

type PresentationForm = 'row' | 'histogram' | 'centered-histogram'

export class Partition extends Linkable {

	nbFlips: number
	bricks: Array<Brick>
	rowLength: number
	brickWidth: number
	leftPartBricks: Array<Rectangle>
	rightPartBricks: Array<Rectangle>
	splitLines: Array<Line>
	tailsProbability: number
	headsColor: Color
	tailsColor: Color
	presentationForm: PresentationForm
	presentationFormsList: RadioButtonList | null
	animationSubstep: number
	animationDuration: number
	nextSubstepButton: SimpleButton
	nextStepButton: SimpleButton
	
	defaults(): object {
		return {
			nbFlips: 1,
			tailsProbability: 0.5,
			rowLength: ROW_WIDTH,
			brickWidth: BRICK_HEIGHT,
			headsColor: HEADS_COLOR,
			tailsColor: TAILS_COLOR,
			bricks: [],
			leftPartBricks: [],
			rightPartBricks: [],
			splitLines: [],
			presentationForm: 'row',
			presentationFormsList: null,
			inputProperties: [
				{ name: 'tailsProbability', displayName: 'p(tails)', type: 'number' },
				{ name: 'headsColor', displayName: 'heads color', type: 'Color' },
				{ name: 'tailsColor', displayName: 'tails color', type: 'Color' },
			],
			animationSubstep: 0,
			animationDuration: SLOW_ANIMATION_DURATION,
			nextSubstepButton: new SimpleButton({
				anchor: [0.5 * (ROW_WIDTH - 50), BRICK_HEIGHT + 10],
				text: ">"
			}),
			nextStepButton: new SimpleButton({
				anchor: [0.5 * (ROW_WIDTH - 50) + 60, BRICK_HEIGHT + 10],
				text: ">>"
			}),
		}
	}

	headsProbability(): number {
		return 1 - this.tailsProbability
	}

	combinations(nbFlips: number, nbTails: number): number {
		return binomial(nbFlips, nbTails)
	}

	probability(nbFlips: number, nbTails: number): number {
		return this.combinations(nbFlips, nbTails) * this.tailsProbability ** nbTails * this.headsProbability() ** (nbFlips - nbTails)
	}

	brickHeight(nbFlips: number, nbTails: number): number {
		return this.probability(nbFlips, nbTails) * this.rowLength
	}

	setup() {
		super.setup()
		for (var i = 0; i <= this.nbFlips; i++) {
			let brick = new Brick({
				nbFlips: this.nbFlips,
				nbTails: i,
				tailsProbability: this.tailsProbability,
				headsColor: this.headsColor,
				tailsColor: this.tailsColor,
			})
			this.bricks.push(brick)
			this.addDependency('tailsProbability', brick, 'tailsProbability')
			this.addDependency('headsColor', brick, 'headsColor')
			this.addDependency('tailsColor', brick, 'tailsColor')
			this.add(brick)
		}
		this.positionBricks()
		this.createBrickParts()
		this.hideBrickParts()
		this.presentationFormsList = new RadioButtonList({
			anchor: [0, 100],
			options: {
				'row': this.animateToRow.bind(this),
				'histogram': this.animateToHistogram.bind(this),
				'centered-histogram': this.animateToCenteredHistogram.bind(this),
			},
			selection: this.presentationForm
		})
		this.add(this.presentationFormsList)
		this.add(this.nextSubstepButton)
		this.nextSubstepButton.action = this.nextSubstep.bind(this)
		this.add(this.nextStepButton)
		this.nextStepButton.action = this.nextStep.bind(this)
	}

	positionBricks() {
		let anchors = this.brickAnchors(this.presentationForm)
		let angle = this.brickAngle(this.presentationForm)
		for (var i = 0; i <= this.nbFlips; i++) {
			this.bricks[i].update({
				anchor: anchors[i],
				transformAngle: angle
			})
		}
	}

	animateToRow() {
		this.presentationForm = 'row'
		this.animateToForm('row')
	}

	animateToHistogram() {
		this.presentationForm = 'histogram'
		this.animateToForm('histogram')
	}

	animateToCenteredHistogram() {
		this.presentationForm = 'centered-histogram'
		this.animateToForm('centered-histogram')
	}

	animateToForm(newForm: PresentationForm) {
		let anchors = this.brickAnchors(newForm)
		let angle = this.brickAngle(newForm)
		for (var i = 0; i <= this.nbFlips; i++) {
			this.bricks[i].animate({
				anchor: anchors[i],
				transformAngle: angle
			}, this.animationDuration)
			this.leftPartBricks[i].animate({
				anchor: anchors[i],
				transformAngle: angle
			}, this.animationDuration)
			this.rightPartBricks[i].animate({
				anchor: vertexAdd(anchors[i], [0, this.bricks[i].getWidth() / 2]),
				transformAngle: angle
			}, this.animationDuration)
		}
		
	}

	brickAngle(form: PresentationForm): number {
		switch (form) {
		case 'row':
			return 0
		default:
			return TAU / 4
		}
	}

	brickAnchors(form: PresentationForm): Array<vertex> {
		switch (form) {
		case 'row':
			return this.brickAnchorsForRow()
		case 'histogram':
			return this.brickAnchorsForHistogram()
		case 'centered-histogram':
			return this.brickAnchorsForCenteredHistogram()
		default:
			return []
		}
	}

	brickAnchorsForRow(): Array<vertex> {
		let ret: Array<vertex> = []
		var w: number = 0
		for (var i = 0; i <= this.nbFlips; i++) {
			ret.push([w, 0])
			w += this.bricks[i].getWidth()
		}
		return ret
	}

	brickAnchorsForHistogram(): Array<vertex> {
		let ret: Array<vertex> = []
		var w: number = 0
		for (var i = 0; i <= this.nbFlips; i++) {
			ret.push([w, 0])
			w += this.brickWidth
		}
		return ret
	}

	brickAnchorsForCenteredHistogram(): Array<vertex> {
		let ret: Array<vertex> = []
		var w: number = 0
		for (var i = 0; i <= this.nbFlips; i++) {
			ret.push([w, this.bricks[i].getWidth() / 2])
			w += this.brickWidth
		}
		return ret
	}

	update(args: object = {}, redraw: boolean = false) {
		super.update(args, redraw)
		this.positionBricks()
	}

	splitBricks(completionHandler: Function = () => {}) {
		this.animateBrickSplitting(function() {
			this.actuallySplitBricks()
			completionHandler()
		}.bind(this))
	}

	animateBrickSplitting(completionHandler: Function = () => {}) {
		for (var i = 0; i < this.bricks.length; i++) {
			let brick = this.bricks[i]
			let startPoint = this.presentationForm == 'row' ? brick.frame.topCenter(brick.parent.frame) : brick.frame.leftCenter(brick.parent.frame)
			let endPoint = this.presentationForm == 'row' ? brick.frame.bottomCenter(brick.parent.frame) : brick.frame.rightCenter(brick.parent.frame)
			let line = new Line({
				startPoint: startPoint,
				endPoint: startPoint,
				strokeWidth: BRICK_STROKE_WIDTH
			})
			this.splitLines.push(line)
			this.add(line)
			line.animate({
				endPoint: endPoint
			}, this.animationDuration, false, (i == this.bricks.length - 1) ? completionHandler : () => {})
		}
		//this.temporarilyDisableButtons()
	}

	actuallySplitBricks() {
		this.createBrickParts()
		for (let brick of this.bricks) {
			this.remove(brick)
		}
		for (let line of this.splitLines) {
			this.remove(line)
		}
		this.splitLines = []
	}

	createBrickParts() {
		for (let brick of this.bricks) {
			let lp = brick.makeLeftPart()
			lp.update({
				anchor: brick.anchor
			})
			this.add(lp)
			this.leftPartBricks.push(lp)
			let rp = brick.makeRightPart()
			let a = lp.urCorner(lp.parent.frame)
			rp.update({
				anchor: a
			})
			this.add(rp)
			this.rightPartBricks.push(rp)
		}
	}

	hideBrickParts() {
		for (var i = 0; i <= this.nbFlips; i++) {
			this.leftPartBricks[i].view.hide()
			this.rightPartBricks[i].view.hide()
		}
	}

	moveBricks(completionHandler: Function = () => {}) {
		if (this.presentationForm == 'row') {
			completionHandler()
			return
		}
		for (var i = 0; i <= this.nbFlips; i++) {
			let rp = this.rightPartBricks[i]
			let lpw = (i < this.nbFlips) ? this.leftPartBricks[i + 1].getWidth() : 0
			let dy =  (this.presentationForm == 'histogram') ? rp.getWidth() - lpw : 0
			let shift = [this.brickWidth, dy]
			rp.animate({
				anchor: vertexAdd(rp.anchor, shift)
			}, this.animationDuration, false, (i == this.nbFlips) ? completionHandler : () => {})
		}
	}

	mergeBricks(completionHandler: Function = () => {}) {
		for (var i = 0; i <= this.nbFlips; i++) {
			let lp = this.leftPartBricks[i]
			let rp = this.rightPartBricks[i]
			let b = this.bricks[i]
			lp.animate({ strokeWidth: 0 }, this.animationDuration)
			rp.animate({ strokeWidth: 0 }, this.animationDuration)
			let newWidth = (i == 0) ? lp.width : this.rightPartBricks[i - 1].width + lp.width
			b.update({
				fillOpacity: 0,
				nbFlips: this.nbFlips + 1
			})
			if (this.presentationForm == 'row') {
				b.update({
					anchor: (i == 0) ? lp.anchor : this.rightPartBricks[i - 1].anchor
				})
			}
			this.add(b)
		}

		this.nbFlips += 1
		let lastBrick = this.bricks[this.bricks.length - 1]
		let newBrick = new Brick({
			nbFlips: this.nbFlips,
			nbTails: this.nbFlips,
			widthScale: this.bricks[0].widthScale,
			height: this.brickWidth,
			fillOpacity: 0,
			strokeWidth: 0,
			transformAngle: this.brickAngle(this.presentationForm)
		})
		this.add(newBrick)
		this.bricks.push(newBrick)
		let newAnchor = this.rightPartBricks[this.rightPartBricks.length - 1].anchor
		newBrick.update({
			anchor: newAnchor
		})
		newBrick.animate({
			strokeWidth: BRICK_STROKE_WIDTH
		}, this.animationDuration, false, completionHandler)
	}

	mixBricks(completionHandler: Function = () => {}) {
		for (var i = 0; i <= this.nbFlips; i++) {
			let brick = this.bricks[i]
			brick.animate({
				fillOpacity: BRICK_FILL_OPACITY,
				strokeWidth: BRICK_STROKE_WIDTH
			}, this.animationDuration, false, (i == this.nbFlips) ? function() {
				this.cleanupAfterMixing()
				completionHandler()
			}.bind(this) : () => {})
		}
	}

	cleanupAfterMixing() {
		for (let lp of this.leftPartBricks) {
			this.remove(lp)
		}
		for (let rp of this.rightPartBricks) {
			this.remove(rp)
		}
		this.leftPartBricks = []
		this.rightPartBricks = []
	}

	recenterBricks(completionHandler: Function = () => {}) {
		if (this.presentationForm == 'centered-histogram') {
			for (var i = 0; i <= this.nbFlips; i++) {
				let b = this.bricks[i]
				let newAnchor = [i * this.brickWidth, 0.5 * b.width]
				b.animate({
					anchor: newAnchor
				}, this.animationDuration, false, (i == this.nbFlips) ? completionHandler: () => {})
			}
		} else {
			completionHandler()
		}
	}

	resizeBricks(completionHandler: Function = () => {}) {
		if (true) { //(this.presentationForm == 'row') {
		// resizing should be done manually, otherwise too confusing
			completionHandler()
			return
		}
		this.squishBricks(completionHandler)
	}

	squishBricks(completionHandler: Function = () => {}) {
		this.brickWidth = this.nbFlips / (this.nbFlips + 1) * this.brickWidth
		for (var i = 0; i <= this.nbFlips; i++) {
			let b = this.bricks[i]
			let newAnchor = [i * this.brickWidth, b.anchor[1]]
			b.animate({
				anchor: newAnchor,
				height: this.brickWidth
			}, this.animationDuration / 2, false, (i == this.nbFlips) ? this.stretchBricks.bind(this, completionHandler) : () => {})
		}
	}

	stretchBricks(completionHandler: Function = () => {}) {
		for (var i = 0; i <= this.nbFlips; i++) {
			let b = this.bricks[i]
			let newWidthScale = b.widthScale * (this.nbFlips + 1) / this.nbFlips
			let newAnchor = (this.presentationForm == 'histogram') ? b.anchor : [i * this.brickWidth, 0.5 * b.width * (this.nbFlips + 1) / this.nbFlips]
			b.animate({
				anchor: newAnchor,
				widthScale: newWidthScale
			}, this.animationDuration / 2, false, (i == this.nbFlips) ? completionHandler.bind(this) : () => {})
		}
	}

	nextStep(completionHandler: Function = () => {}) {
		switch (this.animationSubstep) {
		case 0:
			this.splitBricks(
				this.moveBricks.bind(this,
					this.mergeBricks.bind(this,
						this.mixBricks.bind(this,
							this.recenterBricks.bind(this,
								this.resizeBricks.bind(this,
									completionHandler
								)
							)
						)
					)
				)
			)
			break
		case 1:
			this.moveBricks(
				this.mergeBricks.bind(this,
					this.mixBricks.bind(this,
						this.recenterBricks.bind(this,
							this.resizeBricks.bind(this,
								completionHandler
							)
						)
					)
				)
			)
			break
		case 2:
			this.mixBricks(
				this.recenterBricks.bind(this,
					this.resizeBricks.bind(this,
						completionHandler
					)
				)
			)
			break
		default:
			break
		}
		this.animationSubstep = 0
	}

	nextSubstep(completionHandler: Function = () => {}) {
		switch (this.animationSubstep) {
		case 0:
			this.splitBricks(completionHandler)
			break
		case 1:
			this.moveBricks(this.mergeBricks.bind(this, completionHandler))
			break
		case 2:
			this.mixBricks(this.recenterBricks.bind(this, completionHandler))
			break
		default:
			break
		}
		this.animationSubstep = (this.animationSubstep + 1) % 3
	}



















}