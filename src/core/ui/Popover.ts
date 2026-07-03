
import { Mobject } from 'core/mobjects/Mobject'
import { VMobject } from 'core/vmobjects/VMobject'
import { CurvedShape } from 'core/vmobjects/CurvedShape'
import { vertex, vertexArray } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'

interface PopoverRoot extends Mobject {
	handlePopoverMessage(message: object)
}

export class Popover extends CurvedShape {
	
	rootMobject: PopoverRoot | null
	direction: 'top' | 'bottom' | 'left' | 'right'
	anchorOffset: number
	chevronSize: number
	cornerRadius: number

	defaults(): object {
		return {
			rootMobject: null,
			direction: 'bottom',
			anchorOffset: -5,
			chevronSize: 10,
			cornerRadius: 40,
			fillColor: Color.black()
		}
	}

	setup() {
		super.setup()
		this.update({
			anchor: this.computeAnchor()
		})
	}

	dismiss(message: object) {
		this.rootMobject.handlePopoverMessage(message)
		this.rootMobject.remove(this)
	}

	computeAnchor(): vertex {
		switch (this.direction) {
		case 'top':
			return [this.rootMobject.frameWidth / 2, - this.anchorOffset]
		case 'bottom':
			return [this.rootMobject.frameWidth / 2, this.rootMobject.frameHeight + this.anchorOffset]
		case 'left':
			return [- this.anchorOffset, this.rootMobject.frameHeight / 2]
		case 'right':
			return [this.frameWidth + this.anchorOffset, this.rootMobject.frameHeight / 2]
		default:
			return [this.rootMobject.frameWidth / 2, this.rootMobject.frameHeight + this.anchorOffset]
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

	topBezierPoints(): vertexArray {
		return []
	}

	bottomBezierPoints(): vertexArray {
		let s = this.chevronSize
		let r = this.cornerRadius
		let w = this.frameWidth
		let h = this.frameHeight

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

	leftBezierPoints(): vertexArray {
		return []
	}

	rightBezierPoints(): vertexArray {
		return []
	}


}