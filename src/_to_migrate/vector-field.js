// import { Vertex } from './transform.js'
// import { Vector } from './arrows.js'
// import { MGroup } from './mobject.js'

// export class VectorField extends MGroup {

// 	constructor(fieldFunction, width, height, samplingLength) {
// 		super()
// 		this.fieldFunction = fieldFunction
// 		this.samplingLength = samplingLength
// 		this.anchoringMode = 'anchor'
// 		this.samplingPoints = this.createSamplingPoints(width, height, samplingLength)
// 		for (let point of this.samplingPoints) {
// 			let start = point
// 			let components = this.fieldFunction(point)
// 			let end = start.add(components)
// 			let v = new Vector(start, end)
// 			v.samplingPoint = point
// 			this.add(v)
// 		}
// 	}

// 	get anchoringMode() { return this._anchoringMode }
// 	set anchoringMode(newValue) {
// 		if (newValue == 'start' || newValue == 'center' || newValue == 'end') {
// 			this._anchoringMode = newValue
// 			this.redraw()
// 		}
// 	}

// 	createSamplingPoints(width, height, samplingLength) {
// 		let anchors = []
// 		let dx = samplingLength
// 		let dy = samplingLength
// 		for (let x = 0; x < width; x += dx) {
// 			for (let y = 0; y < height; y += dy) {
// 				anchors.push(new Vertex(x, y))
// 			}
// 		}
// 		return anchors
// 	}

// 	redraw() {
// 		for (let v of this.submobjects) {
// 			v.components = this.fieldFunction(v.samplingPoint)
// 			if (this.anchoringMode == 'start') {
// 				v.anchor = v.samplingPoint
// 			} else if (this.anchoringMode == 'center') {
// 				v.anchor = v.samplingPoint.translatedBy(v.components.scaledBy(-0.5))
// 			} else if (this.anchoringMode == 'end') {
// 				v.anchor = v.samplingPoint.translatedBy(v.components.scaledBy(-1))
// 			}
// 			if (v.norm2() > 4 * this.samplingLength**2) { v.hide() }
// 				else { v.show() }
// 		}
// 		super.redraw()
// 	}

// }
