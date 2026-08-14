
import { Mobject } from 'core/mobjects/Mobject'
import { VMobject } from 'core/vmobjects/VMobject'
import { CurvedShape } from 'core/vmobjects/CurvedShape'
import { vertex, vertexArray, vertexOrigin, vertexSubtract } from 'core/functions/vertex'
import { Transform } from 'core/classes/Transform'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { TAU } from 'core/constants'

interface PopoverRoot extends Mobject {
	handlePopoverMessage(message: object)
}

export class Popover extends CurvedShape {
	
	rootMobject: PopoverRoot | null
	direction: 'top' | 'bottom' | 'left' | 'right'
	tipOffset: number
	chevronTip: vertex
	tipLocation: 'center' | 'edge'
	chevronSize: number
	cornerRadius: number

	defaults(): object {
		return {
			rootMobject: null,
			direction: 'bottom',
			chevronTip: vertexOrigin(),
			tipLocation: 'center',
			tipOffset: 0,
			chevronSize: 10,
			cornerRadius: 40,
			fillColor: Color.black()
		}
	}

	get width(): number { return this.frameWidth }
	set width(newValue: number) { this.frameWidth = newValue }

	get height(): number { return this.frameHeight }
	set height(newValue: number) { this.frameHeight = newValue }

	setup() {
		super.setup()
		if (!this.rootMobject) { return }
		this.update({
			chevronTip: this.defaultChevronTip()
		})
		this.position()
	}

	dismiss(message: object) {
		this.rootMobject.handlePopoverMessage(message)
		this.rootMobject.remove(this)
	}

	defaultTipPosition(): vertex {
		switch (this.direction) {
		case 'top':
			return [this.rootMobject.frameWidth / 2, - this.tipOffset]
		case 'bottom':
			return [this.rootMobject.frameWidth / 2, this.rootMobject.frameHeight + this.tipOffset]
		case 'left':
			return [- this.tipOffset, this.rootMobject.frameHeight / 2]
		case 'right':
			return [this.frameWidth + this.tipOffset, this.rootMobject.frameHeight / 2]
		default:
			return [this.rootMobject.frameWidth / 2, this.rootMobject.frameHeight + this.tipOffset]
		}
	}

	updateBezierPoints() {
		switch (this.direction) {
		case 'top':
			this.bezierPoints = this.topBezierPoints()
			break
		case 'bottom':
			this.bezierPoints = this.bottomBezierPoints()
			break
		case 'left':
			this.bezierPoints = this.leftBezierPoints()
			break
		case 'right':
			this.bezierPoints = this.rightBezierPoints()
			break
		default:
			this.bezierPoints = this.bottomBezierPoints()
			break
		}
	}

	anchorCenteredBottomBezierPoints(): vertexArray {
		let s = this.chevronSize
		let r = this.cornerRadius
		let isVerticallyOrientated = (this.direction == 'top' || this.direction == 'bottom')
		let w = isVerticallyOrientated ? this.width : this.height
		let h = isVerticallyOrientated ? this.height : this.width

		return [
			[0, 0], [0, 0], // 0
			[s, s], [s, s], [s, s], // 1 
			[w / 2 - r, s], [w / 2 - r, s], [w / 2, s], // 2
			[w / 2, s], [w / 2, s + r], [w / 2, s + h - r], // 3
			[w / 2, s + r], [w / 2, s + h - r], [w / 2, s + h], // 4
			[w / 2, s + h], [w / 2 - r, s + h], [- w / 2 + r, h + s], // 5
			[w / 2 - r, s + h], [- w / 2 + r, h + s], [- w / 2, s + h], // 6
			[- w / 2, s + h], [- w / 2, s + h - r], [- w / 2, s + r], // 7
			[- w / 2, s + h - r], [- w / 2, s + r], [- w / 2, s], // 8
			[- w / 2, s], [- w / 2 + r, s], [- s, s], // 9
			[- w / 2 + r, s], [- s, s], [0, 0], // 10
			[0, 0], [0, 0] // 0
		]
	}

	bottomBezierPoints(): vertexArray {
		let t = new Transform({
			shift: [this.width / 2, - this.chevronSize]
		})
		return t.appliedToVertices(this.anchorCenteredBottomBezierPoints())
	}

	topBezierPoints():  vertexArray {
		let r = new Transform({
			angle: TAU / 2
		})
		let t = new Transform({
			shift: [this.width / 2, this.height + this.chevronSize]
		})
		return t.appliedToVertices(
			r.appliedToVertices(this.anchorCenteredBottomBezierPoints())
		)
	}


	leftBezierPoints(): vertexArray {
		let r = new Transform({
			angle: - TAU / 4
		})
		let t = new Transform({
			shift: [this.width + this.chevronSize, this.height / 2]
		})
		return t.appliedToVertices(
			r.appliedToVertices(this.anchorCenteredBottomBezierPoints())
		)
	}

	rightBezierPoints(): vertexArray {
		let r = new Transform({
			angle: TAU / 4
		})
		let t = new Transform({
			shift: [- this.chevronSize, this.height / 2]
		})
		return t.appliedToVertices(
			r.appliedToVertices(this.anchorCenteredBottomBezierPoints())
		)
	}

	position() {
		let newAnchor: vertex
		switch (this.direction) {
		case 'top':
			newAnchor = [
				this.chevronTip[0] - this.width / 2, this.chevronTip[1] - this.height - this.chevronSize
			]
			break
		case 'bottom':
			newAnchor = [
				this.chevronTip[0] - this.width / 2, this.chevronTip[1] + this.chevronSize
			]
			break
		case 'left':
			newAnchor = [
				this.chevronTip[0] - this.width - this.chevronSize, this.chevronTip[1] - this.height / 2
			]
			break
		case 'right':
			newAnchor = [
				this.chevronTip[0] + this.chevronSize, this.chevronTip[1] - this.height / 2
			]
			break
		default:
			newAnchor = [
				- this.width / 2, this.chevronSize
			]
			break
		}
		this.update({ anchor: newAnchor })
	}

	defaultChevronTip() {
		if (this.tipLocation == 'center') {
			return this.rootMobject.frame.center()
		} else {
			switch (this.direction) {
			case 'top':
				return [this.rootMobject.frame.midX(), this.rootMobject.frame.yMin() - this.tipOffset]
			case 'bottom':
				return [this.rootMobject.frame.midX(), this.rootMobject.frame.yMax() + this.tipOffset]
			case 'left':
				return [this.rootMobject.frame.xMin() - this.tipOffset, this.rootMobject.frame.midY()]
			case 'right':
				return [this.rootMobject.frame.xMax() + this.tipOffset, this.rootMobject.frame.midY()]
			default:
				return [this.rootMobject.frame.midX(), this.rootMobject.frame.yMax() + this.tipOffset]
			}
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['chevronTip'] !== undefined) {
			this.position()
		} else if (args['tipLocation'] !== undefined) {
			log('tipLocation')
			this.update({
				chevronTip: this.defaultChevronTip()
			})
		}
	}

}