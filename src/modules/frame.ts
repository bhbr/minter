
import { ExtendedObject } from './extended-object'
import { Vertex, Transform } from './vertex-transform'

export class Frame extends ExtendedObject {

	view: HTMLDivElement
	viewWidth: number
	viewHeight: number
	anchor: Vertex // assigned by reference
	viewAngle: number
	viewScale: number
	transform: Transform
	parent: Frame

	constructor(argsDict: object = {}) {
		super(argsDict)
		this.view = document.createElement('div')
		this.view.setAttribute('class', 'mobject-div ' + this.constructor.name)
		this.view.style.transformOrigin = 'top left'
		if (this.transform == undefined) {
			this.transform = new Transform({shift: this.anchor})
		}
	}

	redraw() {
		this.view.style.width = this.viewWidth.toString() + 'px'
		this.view.style.height = this.viewHeight.toString() + 'px'
		this.view.style.transform = this.transform.asString()
		console.log(this.view.style)
	}

	moveAnchorTo(newAnchor: Vertex) {
		this.anchor.copyFrom(newAnchor)
	}

	centerAt(newCenter: Vertex, frame: Frame) {
		if (!frame) { frame = this }
		let dr: Vertex = newCenter.subtract(this.anchor) // this.center(frame)
		this.anchor = this.anchor.translatedBy(dr[0], dr[1])
	}

	relativeTransform(frame?: Frame): Transform {
		let t = Transform.identity()
		let mob: Frame = this
		if (mob.constructor.name == 'CindyCanvas') {
			if (frame == this) {
				return t
			} else if (frame.constructor.name == 'Paper') {
				t.shift = this.anchor
				return t
			} else {
				throw 'Cannot compute property of CindyCanvas for this frame'
			}
		}
		while (mob && mob.transform instanceof Transform) {
			if (mob == frame) { break }
			t.leftComposeWith(mob.transform)
			mob = mob.parent
		}
		return t
	}

	globalTransform(): Transform {
		return this.relativeTransform()
	}



	localXMin(): number { return 0 }
	localXMax(): number { return this.viewWidth }
	localYMin(): number { return 0 }
	localYMax(): number { return this.viewHeight }

	localULCorner(): Vertex { return new Vertex(this.localXMin(), this.localYMin()) }
	localURCorner(): Vertex { return new Vertex(this.localXMax(), this.localYMin()) }
	localLLCorner(): Vertex { return new Vertex(this.localXMin(), this.localYMax()) }
	localLRCorner(): Vertex { return new Vertex(this.localXMax(), this.localYMax()) }

	localMidX(): number { return (this.localXMin() + this.localXMax())/2 }
	localMidY(): number { return (this.localYMin() + this.localYMax())/2 }

	localLeftCenter(): Vertex { return new Vertex(this.localXMin(), this.localMidY()) }
	localRightCenter(): Vertex { return new Vertex(this.localXMax(), this.localMidY()) }
	localTopCenter(): Vertex { return new Vertex(this.localMidX(), this.localYMin()) }
	localBottomCenter(): Vertex { return new Vertex(this.localMidX(), this.localYMax()) }

	localCenter(): Vertex {
		return new Vertex(this.localMidX(), this.localMidY())
	}

	center(frame: Frame): Vertex {
		return this.relativeTransform(frame).appliedTo(this.localCenter())
	}

	topCenter(frame: Frame): Vertex {
		return this.relativeTransform(frame).appliedTo(this.localTopCenter())
	}

	bottomCenter(frame: Frame): Vertex {
		return this.relativeTransform(frame).appliedTo(this.localBottomCenter())
	}

	globalCenter(): Vertex {
		return this.globalTransform().appliedTo(this.localCenter())
	}

}







