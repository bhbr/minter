
import { CurvedLine } from 'core/vmobjects/CurvedLine'
import { Vertex } from 'core/classes/vertex/Vertex'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { DEGREES, TAU } from 'core/constants'

const DEFAULT_RADIUS = 10

export class CircularArc extends CurvedLine {

	radius: number
	angle: number
	nbPoints: number // vertex resolution along the arc

	// A circle's midpoint is not implemented as its own property,
	// that needs to be kept in sync with its anchor
	get midpoint(): Vertex {
		if (this.radius === undefined) {
			throw 'No radius yet!'
		}
		return this.anchor.translatedBy(this.radius, this.radius)
	}
	set midpoint(newValue: Vertex) {
		if (this.radius === undefined) {
			throw 'No radius yet!'
		}
		this.anchor = newValue.translatedBy(-this.radius, -this.radius)
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			midpoint: Vertex.origin(),
			radius: DEFAULT_RADIUS,
			angle: TAU / 4,
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			nbPoints: 32
		})
	}

	updateModel(argsDict: object = {}) {
	/*
	Since midpoint is just an alias for a shifted anchor, there is possible
	confusion when updating a Circle/CircularArc with a new midpoint, anchor
	and/or radius.
	This is resolved here:
		- updating the midpoint changes the anchor with the given new or existing radius
		- updating just the radius keeps the midpoint where it is (anchor changes)
	*/

		// read all possible new values
		let r = argsDict['radius']
		let m = argsDict['midpoint']
		let a = argsDict['anchor']

		if (m && a) {
			throw `Inconsistent data: cannot set midpoint and anchor of a ${this.constructor.name} simultaneously`
		}

		// adjust the anchor according to the given parameters
		if (r !== undefined && !m && !a) { // only r given
			argsDict['anchor'] = this.midpoint.translatedBy(-r, -r)
		} else if (r === undefined && m && !a) { // only m given
			argsDict['anchor'] = m.translatedBy(-this.radius, -this.radius)
		} else if (r === undefined && !m && a) { // only a given
			// nothing to adjust
		} else if (r !== undefined && m) { // r and m given, but no a
			argsDict['anchor'] = m.translatedBy(-r, -r)
		} else if (r !== undefined && !m && a) { // r and a given
			// nothing to adjust
		} 

		// remove the new midpoint (taken care of by updating the anchor)
		delete argsDict['midpoint']

		let updatedRadius = (r !== undefined) ? r : this.radius
		argsDict['viewWidth'] = 2 * updatedRadius
		argsDict['viewHeight'] = 2 * updatedRadius

		super.updateModel(argsDict)
	}

	updateBezierPoints() {
		let newBezierPoints = new VertexArray()
		let d: number = this.radius * 4/3 * Math.tan(this.angle/(4*this.nbPoints))
		for (let i = 0; i <= this.nbPoints; i++) {
			let theta: number = i/this.nbPoints * this.angle
			let radialUnitVector = new Vertex(Math.cos(theta), Math.sin(theta))
			let tangentUnitVector = new Vertex(-Math.sin(theta), Math.cos(theta))
			let anchorPoint: Vertex = radialUnitVector.scaledBy(this.radius)

			let leftControlPoint: Vertex = anchorPoint.translatedBy(tangentUnitVector.scaledBy(-d))
			let rightControlPoint: Vertex = anchorPoint.translatedBy(tangentUnitVector.scaledBy(d))

			if (i != 0) { newBezierPoints.push(leftControlPoint) }
			newBezierPoints.push(anchorPoint)
			if (i != this.nbPoints) { newBezierPoints.push(rightControlPoint) }
		}
		let translatedBezierPoints = new VertexArray()
		for (let i = 0; i < newBezierPoints.length; i++) {
			translatedBezierPoints.push(newBezierPoints[i].translatedBy(this.radius, this.radius))
		}
		this.bezierPoints = translatedBezierPoints

		// do NOT update the view, because redraw calls updateBezierPoints
	}

}






























