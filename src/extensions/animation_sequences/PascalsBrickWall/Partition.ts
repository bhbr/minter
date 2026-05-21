
import { Linkable } from 'core/linkables/Linkable'
import { Brick } from './Brick'
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

const SHIFT = 0

type PresentationForm = 'row' | 'histogram' | 'centered histogram'

type BrickPosition = {
	anchor?: vertex,
	transformAngle?: number
}

export class Partition extends Linkable {

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
	scale: number
	
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
			presentationFormsList: null,
			scale: 1,
			inputProperties: [
				{ name: 'tailsProbability', displayName: 'p(tails)', type: 'number' },
				{ name: 'headsColor', displayName: 'heads color', type: 'Color' },
				{ name: 'tailsColor', displayName: 'tails color', type: 'Color' },
			],
			animationSubstep: 0,
			animationDuration: SLOW_ANIMATION_DURATION,
			nextSubstepButton: new SimpleButton({
				anchor: [0.5 * (BASE_ROW_LENGTH - 50), BASE_BRICK_HEIGHT + 10],
				text: ">"
			}),
			nextStepButton: new SimpleButton({
				anchor: [0.5 * (BASE_ROW_LENGTH - 50) + 60, BASE_BRICK_HEIGHT + 10],
				text: ">>"
			}),
			anchorMarker: new Circle({
				radius: 10,
				fillColor: Color.white(),
				fillOpacity: 1.0,
				midpoint: [0, 0]
			})
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
		let value = this.probability(nbFlips, nbTails) * BASE_ROW_LENGTH / this.scale
		return value
	}

	brickHeight(): number {
		return BASE_BRICK_HEIGHT // * this.scale
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
		this.add(this.anchorMarker)
		for (let i = 0; i <= this.nbFlips; i++) {
			let brick = new Brick({
				nbFlips: this.nbFlips,
				nbTails: i,
				tailsProbability: this.tailsProbability,
			})
			this.bricks.push(brick)
			this.addDependency('tailsProbability', brick, 'tailsProbability')
			this.add(brick)
		}
		this.positionBricks()
		this.presentationFormsList = new RadioButtonList({
			anchor: [0, 150],
			options: [
				'row',
				'histogram',
				'centered histogram'
			],
			orientation: 'horizontal',
			optionSpacing: 150,
			action: this.animateTo.bind(this)
		})
		this.presentationFormsList.update({
			selectedButton: this.presentationFormsList.radioButtons[0]
		})
		this.presentationFormsList.radioButtons[2].label.update({
			frameWidth: 300
		})
		this.controls.add(this.presentationFormsList)
		this.controls.add(this.nextSubstepButton)
		this.nextSubstepButton.action = this.nextSubstep.bind(this)
		this.controls.add(this.nextStepButton)
		this.nextStepButton.action = this.nextStep.bind(this)

	}

	positionBricks() {
		let transformAngle = this.brickAngle(this.presentationForm)
		for (var i = 0; i <= this.nbFlips; i++) {
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
		} else if (i == 2) {
			this.presentationForm = 'centered histogram'
		}
		this.animateToForm(this.presentationForm)
	}

	animateToForm(newForm: PresentationForm) {
		let transformAngle = this.brickAngle(newForm)
		log('==============================================================')
		log(`animating to ${newForm} after substep: ${this.animationSubstep}`)
		for (let i = 0; i < this.bricks.length; i++) { // here we may already have more bricks than nbFlips (after merge, before mix)
			this.bricks[i].animate(
				this.brickPosition(newForm, this.nbFlips, i),
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
	}


	////////////////////////////////////////////////////
	// BRICK POSITIONING IN ANY FORM AT EVERY SUBSTEP //
	////////////////////////////////////////////////////

	brickAngle(form: PresentationForm): number {
		switch (form) {
		case 'row':
			return 0
		default:
			return TAU / 4
		}
	}

	brickPosition(presentationForm: PresentationForm, nbFlips: number, i: number): BrickPosition {
		if (presentationForm == 'row') {
			return this.brickPositionForRow(nbFlips, i)
		} else if (presentationForm == 'histogram') {
			return this.brickPositionForHistogram(nbFlips, i)
		} else { // presentationForm == 'centered histogram'
			return this.brickPositionForCenteredHistogram(nbFlips, i)
		}
	}

	brickPositionForRow(nbFlips: number, i: number): BrickPosition {
		if (this.animationSubstep < 3) { // before merging
			return {
				anchor: [this.cumulatedBrickLength(nbFlips, i), 0],
				transformAngle: this.brickAngle('row')
			}
		} else { // when merging and afterwards
			return {
				anchor: [this.cumulatedBrickLength(nbFlips + 1, i), 0],
				transformAngle: this.brickAngle('row')
			}
		}
	}

	brickPositionForHistogram(nbFlips: number, i: number): BrickPosition {
		let scale = 1
		if (this.animationSubstep < 5) {
			scale = this.nbFlips / (this.nbFlips + 1)
		} else {
			(this.nbFlips + 1) / (this.nbFlips + 2)
		}
		return {
			anchor: [i * this.brickHeight(), 0],
			transformAngle: this.brickAngle('histogram')
		}
	}

	brickPositionForCenteredHistogram(nbFlips: number, i: number): BrickPosition {
		let scale = (this.animationSubstep < 6) ? this.nbFlips / (this.nbFlips + 1) : (this.nbFlips + 1) / (this.nbFlips + 2)
		if (this.animationSubstep < 5) { // before recentering
			return {
				anchor: [i * this.brickHeight(), this.brickLength(nbFlips, i) / 2],
				transformAngle: this.brickAngle('centered histogram')
			}
		} else { // when recentering and afterwards
			return {
				anchor: [i * this.brickHeight(), this.brickLength(nbFlips + 1, i) / 2],
				transformAngle: this.brickAngle('centered histogram')
			}
		}
	}

	leftBrickPosition(presentationForm: PresentationForm, nbFlips: number, i: number): BrickPosition {
		if (presentationForm == 'row') {
			return this.leftBrickPositionForRow(nbFlips, i)
		} else if (presentationForm == 'histogram') {
			return this.leftBrickPositionForHistogram(nbFlips, i)
		} else { // presentationForm == 'centered histogram'
			return this.leftBrickPositionForCenteredHistogram(nbFlips, i)
		}
	}

	leftBrickPositionForRow(nbFlips: number, i: number): BrickPosition {
		return {
			anchor: [this.cumulatedBrickLength(nbFlips, i), 0],
			transformAngle: this.brickAngle('row')
		}
	}

	leftBrickPositionForHistogram(nbFlips: number, i: number): BrickPosition {
		return {
			anchor: [i * this.brickHeight(), 0],
			transformAngle: this.brickAngle('histogram')
		}
	}

	leftBrickPositionForCenteredHistogram(nbFlips: number, i: number): BrickPosition {
		if (this.animationSubstep < 5) { // before recentering
			return {
				anchor: [i * this.brickHeight(), this.brickLength(nbFlips, i) / 2],
				transformAngle: this.brickAngle('centered histogram')
			}
		} else { // when recentering and afterwards
			return {
				anchor: [i * this.brickHeight(), this.brickLength(nbFlips + 1, i) / 2],
				transformAngle: this.brickAngle('centered histogram')
			}
		}
	}

	rightBrickPosition(presentationForm: PresentationForm, nbFlips: number, i: number): BrickPosition {
		if (presentationForm == 'row') {
			return this.rightBrickPositionForRow(nbFlips, i)
		} else if (presentationForm == 'histogram') {
			return this.rightBrickPositionForHistogram(nbFlips, i)
		} else { // presentationForm == 'centered histogram'
			return this.rightBrickPositionForCenteredHistogram(nbFlips, i)
		}
	}

	rightBrickPositionForRow(nbFlips: number, i: number): BrickPosition {
		return {
			anchor: [this.cumulatedBrickLength(nbFlips, i) + this.brickLength(nbFlips, i) / 2, 0],
			transformAngle: this.brickAngle('row')
		}
	}

	rightBrickPositionForHistogram(nbFlips: number, i: number): BrickPosition {
		if (this.animationSubstep < 2) { // before moving
			return {
				anchor: [i * this.brickHeight(), -this.brickLength(nbFlips, i) / 2],
				transformAngle: this.brickAngle('histogram')
			}
		} else { // when moving and afterwards
			return {
				anchor: [(i + 1) * this.brickHeight(), -this.brickLength(nbFlips, i + 1) / 2],
				transformAngle: this.brickAngle('histogram')
			}
		}
	}

	rightBrickPositionForCenteredHistogram(nbFlips: number, i: number): BrickPosition {
		if (this.animationSubstep < 2) { // before moving
			return {
				anchor: [i * this.brickHeight(), 0],
				transformAngle: this.brickAngle('centered histogram')
			}
		} else { // when moving and afterwards
			return {
				anchor: [(i + 1) * this.brickHeight(), 0],
				transformAngle: this.brickAngle('centered histogram')
			}
		}
	}



	///////////////////////////////
	// SUBSTEP 0 -> 1: SPLITTING //
	///////////////////////////////

	splitBricks(completionHandler: Function = () => {}) {
		log('===============================================')
		log('split')
		log(completionHandler)
		this.animationSubstep += 1
		log(this.animationSubstep)
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
		log('===============================================')
		log(`move with N = ${this.nbFlips} and substep = ${this.animationSubstep}`)
		log(this.animationSubstep)
		log(completionHandler)
		if (this.presentationForm == 'row') {
			this.moveBricksForRow(completionHandler)
		} else if (this.presentationForm == 'histogram') {
			this.moveBricksForHistogram(completionHandler)
		} else if (this.presentationForm == 'centered histogram') {
			this.moveBricksForCenteredHistogram(completionHandler)
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

	moveBricksForCenteredHistogram(completionHandler: Function = () => {}) {
		for (let i = 0; i <= this.nbFlips; i++) {
			this.rightBricks[i].animate(
				this.rightBrickPositionForCenteredHistogram(this.nbFlips, i),
				this.animationDuration, false, (i == this.nbFlips) ? completionHandler : () => {}
			)
		}

	}



	/////////////////////////////
	// SUBSTEP 2 -> 3: MERGING //
	/////////////////////////////

	mergeBricks(completionHandler: Function = () => {}) {
		this.animationSubstep += 1
		log('===============================================')
		log(`merge with N = ${this.nbFlips} and substep = ${this.animationSubstep}`)
		log(this.animationSubstep)
		log(completionHandler)
		if (this.presentationForm == 'row') {
			this.mergeBricksForRow(completionHandler)
		} else if (this.presentationForm == 'histogram') {
			this.mergeBricksForHistogram(completionHandler)
		} else if (this.presentationForm == 'centered histogram') {
			this.mergeBricksForCenteredHistogram(completionHandler)
		}
	}

	mergeBricksForRow(completionHandler: Function = () => {}) {
		for (let i = 0; i <= this.nbFlips; i++) {
			let lp = this.leftBricks[i]
			let rp = this.rightBricks[i]
			let b = this.bricks[i]
			lp.animate({ strokeWidth: 0 }, this.animationDuration)
			rp.animate({ strokeWidth: 0 }, this.animationDuration, false, (i == this.nbFlips) ? completionHandler : () => {})
			let updateObject = this.brickPositionForRow(this.nbFlips, i) as object
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
			transformAngle: this.brickAngle('row')
		})
		newBrick.update(
			this.brickPositionForRow(this.nbFlips, this.nbFlips + 1) // sic, don't ask
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
			transformAngle: this.brickAngle('histogram')
		})
		newBrick.update(
			this.leftBrickPositionForHistogram(this.nbFlips + 1, this.nbFlips + 1)
		)
		this.add(newBrick)
		this.bricks.push(newBrick)
	}

	mergeBricksForCenteredHistogram(completionHandler: Function = () => {}) {
		for (let i = 0; i <= this.nbFlips; i++) {
			let lp = this.leftBricks[i]
			let rp = this.rightBricks[i]
			let b = this.bricks[i]
			lp.animate({ strokeWidth: 0 }, this.animationDuration)
			rp.animate({ strokeWidth: 0 }, this.animationDuration, false, (i == this.nbFlips) ? completionHandler : () => {})
			let updateObject = this.leftBrickPositionForCenteredHistogram(this.nbFlips, i) as object
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
			transformAngle: this.brickAngle('centered histogram')
		})
		newBrick.update(
			this.rightBrickPositionForCenteredHistogram(this.nbFlips, this.nbFlips)
		)
		this.add(newBrick)
		this.bricks.push(newBrick)
	}


	////////////////////////////
	// SUBSTEP 3 -> 4: MIXING //
	////////////////////////////


	mixBricks(completionHandler: Function = () => {}) {
		this.animationSubstep += 1
		log('===============================================')
		log(`mix with N = ${this.nbFlips} and substep = ${this.animationSubstep}`)
		log(this.animationSubstep)
		log(completionHandler)
		console.trace()
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
	}


	/////////////////////////////////
	// SUBSTEP 4 -> 5: RECENTERING //
	/////////////////////////////////

	recenterBricks(completionHandler: Function = () => {}) {
		this.animationSubstep += 1
		log('recenter')
		if (this.presentationForm == 'row') {
			this.recenterBricksForRow(completionHandler)
		} else if (this.presentationForm == 'histogram') {
			this.recenterBricksForHistogram(completionHandler)
		} else if (this.presentationForm == 'centered histogram') {
			this.recenterBricksForCenteredHistogram(completionHandler)
		}
	}

	recenterBricksForRow(completionHandler: Function = () => {}) {
		// nothing to do
		completionHandler()
	}

	recenterBricksForHistogram(completionHandler: Function = () => {}) {
		// nothing to do
		completionHandler()
	}

	recenterBricksForCenteredHistogram(completionHandler: Function = () => {}) {
		log('for centered histogram')
		log(this.bricks.length)
		log(this.nbFlips)
		for (let i = 0; i <= this.nbFlips + 1; i++) {
			this.bricks[i].animate(
				this.brickPositionForCenteredHistogram(this.nbFlips, i),
			this.animationDuration, false, (i == this.nbFlips + 1) ? completionHandler : () => {})
		}
	}


	///////////////////////////////
	// SUBSTEP 5 -> 6: SQUISHING //
	///////////////////////////////


	squishBricks(completionHandler: Function = () => {}) {
		this.animationSubstep += 1
		log('squish')
		if (this.presentationForm == 'row') {
			this.squishBricksForRow(completionHandler)
		} else if (this.presentationForm == 'histogram') {
			this.squishBricksForHistogram(completionHandler)
		} else if (this.presentationForm == 'centered histogram') {
			this.squishBricksForCenteredHistogram(completionHandler)
		}
	}

	squishBricksForRow(completionHandler: Function = () => {}) {
		// nothing to do
		completionHandler()
	}

	squishBricksForHistogram(completionHandler: Function = () => {}) {
		for (let i = 0; i <= this.nbFlips + 1; i++) {
			let b = this.bricks[i]
			let oldAnchor = b.anchor
			let f = (this.nbFlips + 1) / (this.nbFlips + 2)
			let newAnchor = [f * oldAnchor[0], oldAnchor[1]]
			b.animate({
				anchor: newAnchor,
				scale: (this.nbFlips + 2) / 2
			}, this.animationDuration, false, (i == this.nbFlips + 1) ? completionHandler : () => {})
		}
	}

	squishBricksForCenteredHistogram(completionHandler: Function = () => {}) {
		for (let i = 0; i <= this.nbFlips + 1; i++) {
			let b = this.bricks[i]
			let oldAnchor = b.anchor
			let f = (this.nbFlips + 1) / (this.nbFlips + 2)
			let newAnchor = [f * oldAnchor[0], oldAnchor[1]]
			b.animate({
				anchor: newAnchor,
				scale: (this.nbFlips + 2) / 2
			}, this.animationDuration, false, (i == this.nbFlips + 1) ? completionHandler : () => {})
		}
	}

	////////////////////////////////
	// SUBSTEP 6 -> 0: STRETCHING //
	////////////////////////////////


	stretchBricks(completionHandler: Function = () => {}) {
		this.animationSubstep = 0
		log('stretch')
		// let completeAndIncrement = function() {
		completionHandler()
		this.cleanupAfterFullStep()
		// }.bind(this)
		// if (this.presentationForm == 'row') {
		// 	this.stretchBricksForRow(completeAndIncrement)
		// } else if (this.presentationForm == 'histogram') {
		// 	this.stretchBricksForHistogram(completeAndIncrement)
		// } else if (this.presentationForm == 'centered histogram') {
		// 	this.stretchBricksForCenteredHistogram(completeAndIncrement)
		// }
	}

	stretchBricksForRow(completionHandler: Function = () => {}) {
		// nothing to do
		completionHandler()
	}

	stretchBricksForHistogram(completionHandler: Function = () => {}) {
		// for (let i = 0; i <= this.nbFlips + 1; i++) {
		// 	let b = this.bricks[i]
		// 	let f = (this.nbFlips + 2) / (this.nbFlips + 1)
		// 	let newRowLength = f * b.rowLength
		// 	let newAnchor = b.anchor
		// 	b.animate({
		// 		anchor: newAnchor,
		// 		rowLength: newRowLength
		// 	}, this.animationDuration / 2, false, (i == this.nbFlips + 1) ? completionHandler.bind(this) : () => {})
		// }
	}

	stretchBricksForCenteredHistogram(completionHandler: Function = () => {}) {
		// for (let i = 0; i <= this.nbFlips + 1; i++) {
		// 	let b = this.bricks[i]
		// 	let f = (this.nbFlips + 2) / (this.nbFlips + 1)
		// 	let newRowLength = f * b.rowLength
		// 	let newAnchor = [i * b.height, 0.5 * b.width * f]
		// 	b.animate({
		// 		anchor: newAnchor,
		// 		rowLength: newRowLength
		// 	}, this.animationDuration / 2, false, (i == this.nbFlips + 1) ? completionHandler.bind(this) : () => {})
		// }
	}

	cleanupAfterFullStep() {
		this.nbFlips += 1
		log('step complete, balance:')
		log(`nbFlips: ${this.nbFlips}`)
		log(`bricks.length: ${this.bricks.length}`)
	}


	// stretchBricks(completionHandler: Function = () => {}) {
	// 	log('stretch')
	// 	for (var i = 0; i <= this.nbFlips; i++) {
	// 		let b = this.bricks[i]
	// 		let newWidthScale = b.widthScale * (this.nbFlips + 1) / this.nbFlips
	// 		let newAnchor = (this.presentationForm == 'histogram') ? b.anchor : [i * this.brickWidth, 0.5 * b.width * (this.nbFlips + 1) / this.nbFlips]
	// 		b.animate({
	// 			anchor: newAnchor,
	// 			widthScale: newWidthScale
	// 		}, this.animationDuration / 2, false, (i == this.nbFlips) ? completionHandler.bind(this) : () => {})
	// 	}
	// }



	//////////////////////
	// JOINING SUBSTEPS //
	//////////////////////


	nextStep() {
		log('nextStep')
		switch (this.animationSubstep) {
		case 0:
			log(`animationSubstep = 0`)
			stackedFunction([
				this.splitBricks,
				this.moveBricks,
				this.mergeBricks,
				this.mixBricks,
				this.recenterBricks,
				this.squishBricks,
				this.stretchBricks
			], this)()
			break
		case 1:
			log(`animationSubstep = 1`)
			stackedFunction([
				this.moveBricks,
				this.mergeBricks,
				this.mixBricks,
				this.recenterBricks,
				this.squishBricks,
				this.stretchBricks
			], this)()
			break
		case 2:
			log(`animationSubstep = 2`)
			stackedFunction([
				this.mergeBricks,
				this.mixBricks,
				this.recenterBricks,
				this.squishBricks,
				this.stretchBricks
			], this)()
			break
		case 3:
			log(`animationSubstep = 3`)
			stackedFunction([
				this.mixBricks,
				this.recenterBricks,
				this.squishBricks,
				this.stretchBricks
			], this)()
			break
		case 4:
			log(`animationSubstep = 4`)
			stackedFunction([
				this.recenterBricks,
				this.squishBricks,
				this.stretchBricks
			], this)()
			break
		case 5:
			log(`animationSubstep = 5`)
			stackedFunction([
				this.squishBricks,
				this.stretchBricks
			], this)()
			break
		case 6:
			log(`animationSubstep = 6`)
			stackedFunction([
				this.stretchBricks
			], this)()
			break
		default:
			log(`???`)
			break
		}
	}

	nextSubstep() {
		log('nextSubstep')
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
		case 4:
			this.recenterBricks()
			break
		case 5:
			this.squishBricks()
			break
		case 6:
			this.stretchBricks()

			// later: re-add double steps like this
//			this.stretchBricks(this.stretchBricks.bind(this, completionHandler))
			break
		default:
			break
		}
		log(`updating animation substep to ${this.animationSubstep}`)
	}



}


function stackedFunction(functions: Array<Function>, boundToObject: object): Function {
	var stackedFunction = () => {}
	for (let f of functions.reverse()) {
		stackedFunction = f.bind(boundToObject, stackedFunction)
	}
	return stackedFunction
}


