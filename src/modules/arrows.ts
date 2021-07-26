import { Vertex, Transform } from './vertex-transform'
import { MGroup, Polygon } from './mobject'

export class Arrow extends Polygon {
	startPoint: Vertex
	endPoint: Vertex

	constructor(argsDict: object = {}) {
		super()
		this.setAttributes({
			startPoint: Vertex.origin(),
			endPoint: Vertex.origin()
		})
		if (this.constructor.name == 'Arrow') {
			this.update(argsDict)
		}
	}

	update(argsDict: object = {}, redraw = true) {
		super.update(argsDict, false)
		if (this.constructor.name == 'Arrow' && redraw) {
			this.redraw()
		}
	}

}

export class Segment extends Arrow {

	constructor(argsDict: object = {}) {
		super()
		if (this.constructor.name == 'Segment') {
			this.update(argsDict)
		}
	}

	components(): Vertex {
		return this.endPoint.subtract(this.startPoint)
	}

	update(argsDict: object = {}, redraw = true) {
		super.update(argsDict, false)
		let p: Vertex = this.drawingStartPoint()
		let q: Vertex = this.drawingEndPoint()
		this.vertices = [p, q]

		if (this.constructor.name == 'Segment' && redraw) {
			this.redraw()
		}
	}

	drawingStartPoint(): Vertex { return this.startPoint }
	drawingEndPoint(): Vertex { return this.endPoint }

	norm2(): number { return this.components().norm2() }
	norm():number { return Math.sqrt(this.norm2()) }

}

export class Ray extends Segment {

	constructor(argsDict: object = {}) {
		super()
		if (this.constructor.name == 'Ray') {
			this.update(argsDict)
		}
	}

	drawingEndPoint(): Vertex {
		if (this.startPoint == this.endPoint) { return this.endPoint }
		return this.startPoint.add(this.endPoint.subtract(this.startPoint).multiply(100))
	}


	update(argsDict: object = {}, redraw = true) {
		super.update(argsDict, false)

		if (this.constructor.name == 'Ray' && redraw) {
			this.redraw()
		}
	}
}

export class Line extends Ray {

	constructor(argsDict: object = {}) {
		super()
		if (this.constructor.name == 'Line') {
			this.update(argsDict)
		}
	}

	drawingStartPoint(): Vertex {
		if (this.startPoint == this.endPoint) { return this.startPoint }
		return this.endPoint.add(this.startPoint.subtract(this.endPoint).multiply(100))
	}

	update(argsDict: object = {}, redraw = true) {
		super.update(argsDict, false)

		if (this.constructor.name == 'Line' && redraw) {
			this.redraw()
		}
	}

}


// export class Arrow extends MGroup {

//     constructor(start = Vertex.origin(), end = Vertex.origin()) {
//         super()
//         if (end == null) {
//             this.components = new Vertex(start)
//         } else {
//             this.startPoint = new Vertex(start)
//             this.components = new Vertex(end)
//         }
//         this.stem = new Segment(Vertex.origin(), this.components())
//         this.add(this.stem)
//         this.tip = new Polygon(this.tipPoints())
//         this.add(this.tip)
//     }

//     get startPoint() { return this.anchor }
//     set startPoint(newValue) { this.anchor = new Vertex(newValue) }

//     tipPoints() {
//         let w = new Scaling(-0.2).appliedTo(this.components)
//         let w1 = new Rotation(Math.PI/8).appliedTo(w)
//         let w2 = new Rotation(-Math.PI/8).appliedTo(w)
//         return new Translation(this.components).appliedTo([Vertex.origin(), w1, w2])

//     }

//     get endPoint() {
//         return this.startPoint.translatedBy(this.components)
//     }

//     set endPoint(newValue) {
//         this.components = new Vertex(newValue).subtract(this.startPoint)
//     }

//     redraw() {

//         if (this.view == undefined || this.components == undefined) { return }

//         if (this.visible && this.components.isNaN()) {
//             this.visible = false
//         }
//         if (!this.visible && !this.components.isNaN()) {
//             this.visible = true
//         }

//         if (this.stem != undefined) {
//             this.stem.anchor = Vertex.origin()
//             this.stem.vertices = [Vertex.origin(), this.components]
//         }
//         if (this.tip != undefined) {
//             this.tip.anchor = Vertex.origin()
//             this.tip.vertices = this.tipPoints()
//         }
//         super.redraw()
//     }

//     norm2() { return this.components.norm2() }
//     norm() { return Math.sqrt(this.norm2()) }

// }

// export class Vector extends Arrow {}
