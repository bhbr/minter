
import { Rectangle } from 'core/shapes/Rectangle'
import { HEADS_COLOR, TAILS_COLOR, BRICK_HEIGHT, ROW_WIDTH } from './constants'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { binomial } from 'core/functions/math'
import { vertex } from 'core/functions/vertex'
import { Line } from 'core/shapes/Line'

export class Brick extends Rectangle {
	
	nbFlips: number
	nbTails: number
	tailsProbability: number
	headsColor: Color
	tailsColor: Color
	splitLine: Line

	defaults(): object {
		return {
			nbFlips: 1,
			nbTails: 0,
			tailsProbability: 0.5,
			height: BRICK_HEIGHT,
			fillOpacity: 1,
			headsColor: HEADS_COLOR,
			tailsColor: TAILS_COLOR,
			// splitLine: new Line({
			// 	opacity: 0
			// }),
			// leftPart: new Rectangle({
			// 	anchor: [0, 0],
			// 	height: BRICK_HEIGHT,
			// 	opacity: 0,
			// 	strokeWidth: 0
			// }),
			// rightPart: new Rectangle({
			// 	opacity: 0,
			// 	height: BRICK_HEIGHT,
			// 	strokeWidth: 0
			// })
		}
	}

	// setup() {
	// 	super.setup()

		// this.splitLine.view.div.style.strokeDasharray = "4"
		// this.addDependency('topCenter', this.splitLine, 'startPoint')
		// this.addDependency('bottomCenter', this.splitLine, 'endPoint')
		// this.add(this.splitLine)

		// this.addDependency('leftPartColor', this.leftPart, 'fillColor')
		// this.addDependency('leftPartWidth', this.leftPart, 'width')
		// this.add(this.leftPart)

		// this.addDependency('rightPartColor', this.rightPart, 'fillColor')
		// this.addDependency('rightPartAnchor', this.rightPart, 'anchor')
		// this.addDependency('rightPartWidth', this.rightPart, 'width')
		// this.add(this.rightPart)
	// }

	headsProbability(): number {
		return 1 - this.tailsProbability
	}

	// leftPartColor(): Color {
	// 	return this.headsColor.interpolate(this.tailsColor, this.nbTails / (this.nbFlips + 1))
	// }

	// rightPartAnchor(): vertex {
	// 	return [this.leftPartWidth(), 0]
	// }

	// leftPartWidth(): number {
	// 	return this.headsProbability() * this.getWidth()
	// }

	// rightPartWidth(): number {
	// 	return this.tailsProbability * this.getWidth()
	// }

	// rightPartColor(): Color {
	// 	return this.headsColor.interpolate(this.tailsColor, (this.nbTails + 1) / (this.nbFlips + 1))
	// }

	getFillColor(): Color {
		return this.headsColor.interpolate(this.tailsColor, this.nbTails / this.nbFlips)
	}

	combinations(): number {
		return binomial(this.nbFlips, this.nbTails)
	}

	getWidth(): number {
		return this.combinations() * this.tailsProbability ** this.nbTails * (1 - this.tailsProbability) ** (this.nbFlips - this.nbTails) * ROW_WIDTH
	}

	update(args: object = {}, redraw: boolean = true) {
		args['fillColor'] = this.getFillColor()
		args['width'] = this.getWidth()
		super.update(args, redraw)
		this.updateDependents()
	}






}