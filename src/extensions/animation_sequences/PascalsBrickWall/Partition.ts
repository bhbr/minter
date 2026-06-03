
import { Linkable } from 'core/linkables/Linkable'
import { Brick, LabelShower } from './Brick'
import { DetailedBrickLabel } from './DetailedBrickLabel'
import { vertex, vertexAdd, vertexSubtract, vertexMultiply } from 'core/functions/vertex'
import { log } from 'core/functions/logging'
import { TAU } from 'core/constants'
import { HEADS_COLOR, TAILS_COLOR, BASE_BRICK_HEIGHT, BASE_ROW_LENGTH, BRICK_STROKE_WIDTH, FAST_ANIMATION_DURATION, SLOW_ANIMATION_DURATION, BRICK_FILL_OPACITY } from './constants'
import { Color } from 'core/classes/Color'
import { RadioButtonList } from 'core/ui/RadioButtonList'
import { Rectangle } from 'core/shapes/Rectangle'
import { Line } from 'core/shapes/Line'
import { MGroup } from 'core/mobjects/MGroup'
import { binomial } from 'core/functions/math'
import { SimpleButton } from 'core/ui/SimpleButton'
import { Circle } from 'core/shapes/Circle'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'

type PresentationForm = 'row' | 'histogram'

type BrickPosition = {
	anchor?: vertex,
	transformAngle?: number,
	height?: number
}

export class Partition extends Linkable implements LabelShower {

	nbFlips: number
	bricks: Array<Brick>
	leftBricks: Array<Rectangle>
	rightBricks: Array<Rectangle>
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
	anchorMarker: Circle
	fitButton: SimpleButton
	scale: number
	brickLabel: DetailedBrickLabel
	labelledBrick: Brick | null
	
	defaults(): object {
		return {
			nbFlips: 1,
			tailsProbability: 0.5,
			headsColor: HEADS_COLOR,
			tailsColor: TAILS_COLOR,
			bricks: [],
			leftBricks: [],
			rightBricks: [],
			splitLines: [],
			presentationForm: 'row',
			scale: 1,
			inputProperties: [
				{ name: 'tailsProbability', displayName: 'p(tails)', type: 'number' },
				{ name: 'headsColor', displayName: 'heads color', type: 'Color' },
				{ name: 'tailsColor', displayName: 'tails color', type: 'Color' },
			],
			animationSubstep: 0,
			animationDuration: SLOW_ANIMATION_DURATION,
			presentationFormsList: new RadioButtonList({
				anchor: [0, BASE_BRICK_HEIGHT + 15],
				options: [
					'row',
					'histogram'
				],
				orientation: 'horizontal',
				optionSpacing: 100
			}),
			nextSubstepButton: new SimpleButton({
				anchor: [0.5 * (BASE_ROW_LENGTH - 50), BASE_BRICK_HEIGHT + 10],
				text: ">"
			}),
			nextStepButton: new SimpleButton({
				anchor: [0.5 * (BASE_ROW_LENGTH - 50) + 60, BASE_BRICK_HEIGHT + 10],
				text: ">>"
			}),
			fitButton: new SimpleButton({
				anchor: [BASE_ROW_LENGTH - 50, BASE_BRICK_HEIGHT + 10],
				text: 'fit'
			}),
			anchorMarker: new Circle({
				radius: 10,
				fillColor: Color.white(),
				fillOpacity: 1.0,
				midpoint: [0, 0]
			}),
			screenEventHandler: ScreenEventHandler.Self,
			brickLabel: new DetailedBrickLabel(),
			labelledBrick: null
		}
	}

	////////////////////
	// MATH FUNCTIONS //
	////////////////////

	headsProbability(): number {
		return 1 - this.tailsProbability
	}

	combinations(nbFlips: number, nbTails: number): number {
		return binomial(nbFlips, nbTails)
	}

	probability(nbFlips: number, nbTails: number): number {
		return this.combinations(nbFlips, nbTails) * this.tailsProbability ** nbTails * this.headsProbability() ** (nbFlips - nbTails)
	}

	brickLength(nbFlips: number, nbTails: number): number {
		let value = this.probability(nbFlips, nbTails) * BASE_ROW_LENGTH
		return value
	}

	brickHeight(): number {
		return BASE_BRICK_HEIGHT / this.scale
	}

	cumulatedBrickLength(nbFlips: number, nbTails: number): number {
		// exclusive
		if (nbTails == 0) {
			return 0
		}
		var sum = 0
		for (let i = 0; i < nbTails; i++) {
			sum += this.brickLength(nbFlips, i)
		}
		return sum
	}

	///////////
	// SETUP //
	///////////

	setup() {
		super.setup()
		//this.add(this.anchorMarker)
		for (let i = 0; i <= this.nbFlips; i++) {
			let brick = new Brick({
				nbFlips: this.nbFlips,
				nbTails: i,
				height: BASE_BRICK_HEIGHT / this.scale,
				tailsProbability: this.tailsProbability,
				labelShower: this
			})
			this.bricks.push(brick)
			this.addDependency('tailsProbability', brick, 'tailsProbability')
			this.add(brick)
		}
		this.positionBricks()
		this.presentationFormsList.action = this.animateTo.bind(this)
		this.presentationFormsList.update({
			selectedButton: this.presentationFormsList.radioButtons[0]
		})
		this.nextSubstepButton.action = this.nextSubstep.bind(this)
		this.nextStepButton.action = this.nextStep.bind(this)
		this.fitButton.action = this.fitBricks.bind(this, function() {
			this.controls.remove(this.fitButton)
		}.bind(this))

		this.controls.add(this.presentationFormsList)
		this.controls.add(this.nextSubstepButton)
		this.controls.add(this.nextStepButton)
	}

	positionBricks() {
		let transformAngle = this.brickAngle(this.presentationForm)
		for (let i = 0; i <= this.nbFlips; i++) {
			this.bricks[i].update(
				this.leftBrickPosition(this.presentationForm, this.nbFlips, i)
			)
		}
	}

	update(args: object = {}, redraw: boolean = false) {
		super.update(args, redraw)
		this.positionBricks()
	}

	//////////////////////////////////////////
	// SWITCHING BETWEEN PRESENTATION FORMS //
	//////////////////////////////////////////

	animateTo() {
		let i = this.presentationFormsList.radioButtons.indexOf(this.presentationFormsList.selectedButton)
		if (i == 0) {
			this.presentationForm = 'row'
		} else if (i == 1) {
			this.presentationForm = 'histogram'
		}
		this.animateToForm(this.presentationForm)
	}

	animateToForm(newForm: PresentationForm) {
		let transformAngle = this.brickAngle(newForm)
		for (let i = 0; i < this.bricks.length; i++) {
			this.bricks[i].animate(
				this.leftBrickPosition(newForm, this.animationSubstep == 0 ? this.nbFlips : (this.nbFlips + 1), i),
			this.animationDuration)
			if (this.leftBricks[i] !== undefined) { // see above, possibly one too few leftBricks
				this.leftBricks[i].animate(
					this.leftBrickPosition(newForm, this.nbFlips, i),
				this.animationDuration)
			}
			if (this.rightBricks[i] !== undefined) { // see above, possibly one too few rightBricks
				this.rightBricks[i].animate(
					this.rightBrickPosition(newForm, this.nbFlips, i),
				this.animationDuration)
			}
		}
		if (this.bricks.length * BASE_BRICK_HEIGHT > BASE_ROW_LENGTH) {
			this.controls.add(this.fitButton)
		}
	}


	//////////////////////////////////////////////////
	// BRICK POSITIONING IN ANY FORM AT ANY SUBSTEP //
	//////////////////////////////////////////////////

	brickAngle(form: PresentationForm): number {
		switch (form) {
		case 'row':
			return 0
		default:
			return TAU / 4
		}
	}

	leftBrickPosition(presentationForm: PresentationForm, nbFlips: number, i: number): BrickPosition {
		if (presentationForm == 'row') {
			return this.leftBrickPositionForRow(nbFlips, i)
		} else if (presentationForm == 'histogram') {
			return this.leftBrickPositionForHistogram(nbFlips, i)
		}
	}

	leftBrickPositionForRow(nbFlips: number, i: number): BrickPosition {
		return {
			anchor: [this.cumulatedBrickLength(nbFlips, i), 0],
			transformAngle: this.brickAngle('row'),
			height: BASE_BRICK_HEIGHT
		}
	}

	leftBrickPositionForHistogram(nbFlips: number, i: number): BrickPosition {
		return {
			anchor: [i * this.brickHeight(), 0],
			transformAngle: this.brickAngle('histogram'),
			height: BASE_BRICK_HEIGHT / this.scale
		}
	}

	rightBrickPosition(presentationForm: PresentationForm, nbFlips: number, i: number): BrickPosition {
		if (presentationForm == 'row') {
			return this.rightBrickPositionForRow(nbFlips, i)
		} else if (presentationForm == 'histogram') {
			return this.rightBrickPositionForHistogram(nbFlips, i)
		}
	}

	rightBrickPositionForRow(nbFlips: number, i: number): BrickPosition {
		return {
			anchor: [this.cumulatedBrickLength(nbFlips, i) + this.brickLength(nbFlips, i) / 2, 0],
			transformAngle: this.brickAngle('row'),
			height: BASE_BRICK_HEIGHT
		}
	}

	rightBrickPositionForHistogram(nbFlips: number, i: number): BrickPosition {
		if (this.animationSubstep < 2) { // before moving
			return {
				anchor: [i * this.brickHeight(), -this.brickLength(nbFlips, i) / 2],
				transformAngle: this.brickAngle('histogram'),
				height: BASE_BRICK_HEIGHT / this.scale
			}
		} else { // when moving and afterwards
			return {
				anchor: [(i + 1) * this.brickHeight(), -this.brickLength(nbFlips, i + 1) / 2],
				transformAngle: this.brickAngle('histogram'),
				height: BASE_BRICK_HEIGHT / this.scale
			}
		}
	}


	///////////////////////////////
	// SUBSTEP 0 -> 1: SPLITTING //
	///////////////////////////////

	splitBricks(completionHandler: Function = () => {}) {
		this.animationSubstep += 1
		this.animateBrickSplitting(function() {
			this.actuallySplitBricks()
			completionHandler()
		}.bind(this))
	}

	animateBrickSplitting(completionHandler: Function = () => {}) {
		for (let i = 0; i < this.bricks.length; i++) {
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
		for (let i = 0; i < this.bricks.length; i++) {
			let brick = this.bricks[i]
			let lp = brick.makeLeftPart()
			lp.update(
				this.leftBrickPosition(this.presentationForm, this.nbFlips, i)
			)
			this.add(lp)
			this.leftBricks.push(lp)
			let rp = brick.makeRightPart()
			rp.update(
				this.rightBrickPosition(this.presentationForm, this.nbFlips, i)
			)
			this.add(rp)
			this.rightBricks.push(rp)
		}
	}

	showBrickParts() {
		for (var i = 0; i <= this.nbFlips; i++) {
			this.leftBricks[i].view.show()
			this.rightBricks[i].view.show()
		}
	}

	hideBrickParts() {
		for (var i = 0; i <= this.nbFlips; i++) {
			this.leftBricks[i].view.hide()
			this.rightBricks[i].view.hide()
		}
	}



	////////////////////////////
	// SUBSTEP 1 -> 2: MOVING //
	////////////////////////////


	moveBricks(completionHandler: Function = () => {}) {
		this.animationSubstep += 1
		if (this.presentationForm == 'row') {
			this.moveBricksForRow(completionHandler)
		} else if (this.presentationForm == 'histogram') {
			this.moveBricksForHistogram(completionHandler)
		}
	}

	moveBricksForRow(completionHandler: Function = () => {}) {
		// nothing to move
		completionHandler()
	}

	moveBricksForHistogram(completionHandler: Function = () => {}) {
		for (let i = 0; i <= this.nbFlips; i++) {
			this.rightBricks[i].animate(
				this.rightBrickPositionForHistogram(this.nbFlips, i),
				this.animationDuration, false, (i == this.nbFlips) ? completionHandler : () => {}
			)
		}
	}


	/////////////////////////////
	// SUBSTEP 2 -> 3: MERGING //
	/////////////////////////////

	mergeBricks(completionHandler: Function = () => {}) {
		this.animationSubstep += 1
		if (this.presentationForm == 'row') {
			this.mergeBricksForRow(completionHandler)
		} else if (this.presentationForm == 'histogram') {
			this.mergeBricksForHistogram(completionHandler)
		}
	}

	mergeBricksForRow(completionHandler: Function = () => {}) {
		for (let i = 0; i <= this.nbFlips; i++) {
			let lp = this.leftBricks[i]
			let rp = this.rightBricks[i]
			let b = this.bricks[i]
			lp.animate({ strokeWidth: 0 }, this.animationDuration)
			rp.animate({ strokeWidth: 0 }, this.animationDuration, false, (i == this.nbFlips) ? completionHandler : () => {})
			let updateObject = this.leftBrickPositionForRow(this.nbFlips + 1, i) as object
			updateObject['fillOpacity'] = 0
			updateObject['nbFlips'] = this.nbFlips + 1
			b.update(updateObject)
		 	this.add(b)
		}
		let newBrick = new Brick({
			nbFlips: this.nbFlips + 1,
			nbTails: this.nbFlips + 1,
			fillOpacity: 0,
			height: BASE_BRICK_HEIGHT / this.scale,
			strokeWidth: BRICK_STROKE_WIDTH,
			transformAngle: this.brickAngle('row'),
			labelShower: this
		})
		newBrick.update(
			this.leftBrickPositionForRow(this.nbFlips + 1, this.nbFlips + 1)
		)
		this.add(newBrick)
		this.bricks.push(newBrick)
	}

	mergeBricksForHistogram(completionHandler: Function = () => {}) {
		for (let i = 0; i <= this.nbFlips; i++) {
			let lp = this.leftBricks[i]
			let rp = this.rightBricks[i]
			let b = this.bricks[i]
			lp.animate({ strokeWidth: 0 }, this.animationDuration)
			rp.animate({ strokeWidth: 0 }, this.animationDuration, false, (i == this.nbFlips) ? completionHandler : () => {})
			let updateObject = this.leftBrickPositionForHistogram(this.nbFlips + 1, i) as object
			updateObject['fillOpacity'] = 0
			updateObject['nbFlips'] = this.nbFlips + 1
			b.update(updateObject)
		 	this.add(b)
		}
		let newBrick = new Brick({
			nbFlips: this.nbFlips + 1,
			nbTails: this.nbFlips + 1,
			fillOpacity: 0,
			strokeWidth: BRICK_STROKE_WIDTH,
			height: BASE_BRICK_HEIGHT / this.scale,
			transformAngle: this.brickAngle('histogram'),
			labelShower: this
		})
		newBrick.update(
			this.leftBrickPositionForHistogram(this.nbFlips + 1, this.nbFlips + 1)
		)
		this.add(newBrick)
		this.bricks.push(newBrick)
	}


	////////////////////////////
	// SUBSTEP 3 -> 0: MIXING //
	////////////////////////////


	mixBricks(completionHandler: Function = () => {}) {
		this.animationSubstep = 0
		for (let i = 0; i <= this.nbFlips + 1; i++) {
			let brick = this.bricks[i]
			brick.animate({
				fillOpacity: BRICK_FILL_OPACITY,
				strokeWidth: BRICK_STROKE_WIDTH
			}, this.animationDuration, false, (i == this.nbFlips + 1) ? function() {
				this.cleanupAfterMixing()
				completionHandler()
			}.bind(this) : () => {})
		}
	}


	cleanupAfterMixing() {
		for (let lp of this.leftBricks) {
			this.remove(lp)
		}
		for (let rp of this.rightBricks) {
			this.remove(rp)
		}
		this.leftBricks = []
		this.rightBricks = []
		this.nbFlips += 1

		if (this.bricks.length * BASE_BRICK_HEIGHT > BASE_ROW_LENGTH && this.presentationForm == 'histogram') {
			this.controls.add(this.fitButton)
		}
	}



	///////////////
	// SQUISHING //
	///////////////


	fitBricks(completionHandler: Function = () => {}) {
		//this.animationSubstep += 1
		if (this.presentationForm == 'row') {
			this.fitBricksForRow(completionHandler)
		} else if (this.presentationForm == 'histogram') {
			this.fitBricksForHistogram(completionHandler)
		}
	}

	fitBricksForRow(completionHandler: Function = () => {}) {
		// nothing to do
		completionHandler()
	}

	fitBricksForHistogram(completionHandler: Function = () => {}) {
		let scale = this.bricks.length * BASE_BRICK_HEIGHT / BASE_ROW_LENGTH
		if (scale < 1) { return }
		this.scale = scale
		for (let i = 0; i <= this.nbFlips; i++) {
			let b = this.bricks[i]
			let newAnchor = [i * BASE_BRICK_HEIGHT / this.scale, 0]
			b.animate({
				anchor: newAnchor,
				height: BASE_BRICK_HEIGHT / this.scale
			}, this.animationDuration, false, i == this.nbFlips ? completionHandler : () => {})
		}
	}




	//////////////////////
	// JOINING SUBSTEPS //
	//////////////////////


	nextStep() {
		if (this.labelledBrick) {
			this.toggleLabelOnBrick(this.labelledBrick)
		}
		switch (this.animationSubstep) {
		case 0:
			stackedFunction([
				this.splitBricks,
				this.moveBricks,
				this.mergeBricks,
				this.mixBricks
			], this)()
			break
		case 1:
			stackedFunction([
				this.moveBricks,
				this.mergeBricks,
				this.mixBricks
			], this)()
			break
		case 2:
			stackedFunction([
				this.mergeBricks,
				this.mixBricks
			], this)()
			break
		case 3:
			stackedFunction([
				this.mixBricks
			], this)()
			break
		default:
			break
		}
	}

	nextSubstep() {
		if (this.labelledBrick) {
			this.toggleLabelOnBrick(this.labelledBrick)
		}
		if (this.presentationForm == 'row') {
			switch (this.animationSubstep) {
			case 0:
				this.splitBricks()
				break
			case 1:
				this.moveBricks()
				this.mergeBricks()
				break
			case 2:
				this.mergeBricks()
				break
			case 3:
				this.mixBricks()
				break
			default:
				break
			}
		} else {
			switch (this.animationSubstep) {
			case 0:
				this.splitBricks()
				break
			case 1:
				this.moveBricks()
				break
			case 2:
				this.mergeBricks()
				break
			case 3:
				this.mixBricks()
				break
			default:
				break
			}
		}
	}

	toggleLabelOnBrick(brick: Brick) {

		let newAnchor = (this.presentationForm == 'row') ? [
				brick.anchor[0] + brick.view.frame.midX() - this.brickLabel.frameWidth / 2,
				brick.anchor[1] + brick.view.frame.midY() - this.brickLabel.frameHeight / 2
			] : [
				brick.anchor[0] + brick.view.frame.midY() - this.brickLabel.frameWidth / 2,
				brick.anchor[1] - brick.view.frame.midX() - this.brickLabel.frameHeight / 2
			]

		if (this.labelledBrick) {
			// we were highlighting some brick already
			this.labelledBrick.update({
				fillColor: this.labelledBrick.getFillColor()
			})
			if (brick == this.labelledBrick) {
				// tapped on highlighted brick to make the label disappear
				this.brickLabel.view.hide()
				this.labelledBrick = null
				return
			}
			// tapped on a new brick
			this.brickLabel.update({
				nbHeads: brick.nbHeads(),
				nbTails: brick.nbTails,
				anchor: newAnchor
			})
			brick.update({
				fillColor: brick.getFillColor().brighten(0.65)
			})
			this.labelledBrick = brick
		} else {
			// no brick was previously highlighted
			this.brickLabel.update({
				nbHeads: brick.nbHeads(),
				nbTails: brick.nbTails,
				anchor: newAnchor
			})
			brick.update({
				fillColor: brick.getFillColor().brighten(0.65)
			})
			this.brickLabel.view.show()
			this.labelledBrick = brick
		}

		this.moveToTop(this.brickLabel)

	}



}


function stackedFunction(functions: Array<Function>, boundToObject: object): Function {
	var stackedFunction = () => {}
	for (let f of functions.reverse()) {
		stackedFunction = f.bind(boundToObject, stackedFunction)
	}
	return stackedFunction
}


