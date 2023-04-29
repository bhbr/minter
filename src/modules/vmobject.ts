import { Mobject } from './mobject'
import { Color } from './color'
import { xMin, xMax, yMin, yMax, midX, midY } from './helpers'
import { stringFromPoint } from './helpers'
import { Vertex } from './vertex-transform'


export class VMobject extends Mobject {

	svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	path: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	vertices: Array<Vertex> = []

	fillColor = Color.white()
	fillOpacity = 0.5
	strokeColor = Color.white()
	strokeWidth = 1

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.svg['mobject'] = this
		this.path['mobject'] = this
		this.svg.appendChild(this.path)
		this.svg.setAttribute('class', 'mobject-svg')
		this.svg.style.overflow = 'visible'
		this.view.appendChild(this.svg) // why not just add?
		this.view.setAttribute('class', this.constructor.name + ' mobject-div')
	}

	redrawSelf() {
		super.redrawSelf()

		this.svg.style.width = `${this.viewWidth + this.strokeWidth}px`
		this.svg.style.height = `${this.viewHeight + this.strokeWidth}px`

		let pathString: string = this.pathString()
		if (pathString.includes('NaN')) { return }

		this.path.setAttribute('d', pathString)
		this.path.style['fill'] = this.fillColor.toHex()
		this.path.style['fill-opacity'] = this.fillOpacity.toString()
		this.path.style['stroke'] = this.strokeColor.toHex()
		this.path.style['stroke-width'] = this.strokeWidth.toString()
	}

	pathString(): string {
		console.warn('please subclass pathString')
		return ''
	}

	relativeVertices(frame?: Mobject): Array<Vertex> {
		let returnValue: Array<Vertex> = this.transformRelativeTo(frame).appliedToVertices(this.vertices)
		if (returnValue == undefined) { return [] }
		else { return returnValue }
	}

	globalVertices(): Array<Vertex> {
		return this.relativeVertices() // uses default frame = paper
	}

	// geometric properties from the vertices //
	localVerticesXMin(): number { return xMin(this.vertices) }
	localVerticesXMax(): number { return xMax(this.vertices) }
	localVerticesYMin(): number { return yMin(this.vertices) }
	localVerticesYMax(): number { return yMax(this.vertices) }
	localVerticesMidX(): number { return midX(this.vertices) }
	localVerticesMidY(): number { return midY(this.vertices) }
	localVerticesULCorner(): Vertex { return new Vertex(this.localVerticesXMin(), this.localVerticesYMin()) }
	localVerticesURCorner(): Vertex { return new Vertex(this.localVerticesXMax(), this.localVerticesYMin()) }
	localVerticesLRCorner(): Vertex { return new Vertex(this.localVerticesXMax(), this.localVerticesYMax()) }
	localVerticesLLCorner(): Vertex { return new Vertex(this.localVerticesXMin(), this.localVerticesYMax()) }
	localVerticesCorners(): Array<Vertex> { return [this.localVerticesULCorner(), this.localVerticesURCorner(), this.localVerticesLRCorner(), this.localVerticesLLCorner()] }
	localVerticesCenter(): Vertex { return new Vertex(this.localVerticesMidX(), this.localVerticesMidY()) }
	localVerticesTopCenter(): Vertex { return new Vertex(this.localVerticesMidX(), this.localVerticesYMin()) }
	localVerticesBottomCenter(): Vertex { return new Vertex(this.localVerticesMidX(), this.localVerticesYMax()) }
	localVerticesLeftCenter(): Vertex { return new Vertex(this.localVerticesXMin(), this.localVerticesMidY()) }
	localVerticesRightCenter(): Vertex { return new Vertex(this.localVerticesXMax(), this.localVerticesMidY()) }
	// transformed versions
	relativeVerticesXMin(frame?: Mobject): number { return xMin(this.relativeVerticesCorners(frame)) }
	relativeVerticesXMax(frame?: Mobject): number { return xMax(this.relativeVerticesCorners(frame)) }
	relativeVerticesYMin(frame?: Mobject): number { return yMin(this.relativeVerticesCorners(frame)) }
	relativeVerticesYMax(frame?: Mobject): number { return yMax(this.relativeVerticesCorners(frame)) }
	relativeVerticesMidX(frame?: Mobject): number { return midX(this.relativeVerticesCorners(frame)) }
	relativeVerticesMidY(frame?: Mobject): number { return midY(this.relativeVerticesCorners(frame)) }
	relativeVerticesULCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesULCorner(), frame) }
	relativeVerticesURCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesURCorner(), frame) }
	relativeVerticesLRCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesLRCorner(), frame) }
	relativeVerticesLLCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesLLCorner(), frame) }
	relativeVerticesCorners(frame?: Mobject): Array<Vertex> { return [this.relativeVerticesULCorner(frame), this.relativeVerticesURCorner(frame), this.relativeVerticesLRCorner(frame), this.relativeVerticesLLCorner(frame)] }
	relativeVerticesCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesCenter(), frame) }
	relativeVerticesTopCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesTopCenter(), frame) }
	relativeVerticesBottomCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesBottomCenter(), frame) }
	relativeVerticesLeftCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesLeftCenter(), frame) }
	relativeVerticesRightCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesRightCenter(), frame) }
	// default frame
	verticesXMin(): number { return this.relativeVerticesXMin() }
	verticesXMax(): number { return this.relativeVerticesXMax() }
	verticesYMin(): number { return this.relativeVerticesYMin() }
	verticesYMax(): number { return this.relativeVerticesYMax() }
	verticesMidX(): number { return this.relativeVerticesMidX() }
	verticesMidY(): number { return this.relativeVerticesMidY() }
	verticesULCorner(): Vertex { return this.relativeVerticesULCorner() }
	verticesURCorner(): Vertex { return this.relativeVerticesURCorner() }
	verticesLRCorner(): Vertex { return this.relativeVerticesLRCorner() }
	verticesLLCorner(): Vertex { return this.relativeVerticesLLCorner() }
	verticesCorners(): Array<Vertex> { return this.relativeVerticesCorners() }
	verticesCenter(): Vertex { return this.relativeVerticesCenter() }
	verticesTopCenter(): Vertex { return this.relativeVerticesTopCenter() }
	verticesBottomCenter(): Vertex { return this.relativeVerticesBottomCenter() }
	verticesLeftCenter(): Vertex { return this.relativeVerticesLeftCenter() }
	verticesRightCenter(): Vertex { return this.relativeVerticesRightCenter() }

	// overriding Frame's definition of extent
	localExtentXMin(): number { return Math.min(this.localVerticesXMin(), this.localChildrenXMin()) }
	localExtentXMax(): number { return Math.max(this.localVerticesXMax(), this.localChildrenXMax()) }
	localExtentYMin(): number { return Math.min(this.localVerticesYMin(), this.localChildrenYMin()) }
	localExtentYMax(): number { return Math.max(this.localVerticesYMax(), this.localChildrenYMax()) }
	localExtentMidX(): number { return (this.localVerticesXMin() + this.localChildrenXMax())/2 }
	localExtentMidY(): number { return (this.localVerticesYMin() + this.localChildrenYMax())/2 }

}








export class Polygon extends VMobject {

	closed = true

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	pathString(): string {
		let pathString: string = ''
		//let v = this.globalVertices()
		let v = this.vertices
		if (v.length == 0) { return '' }
		for (let point of v) {
			if (point == undefined || point.isNaN()) {
				pathString = ''
				return pathString
			}
			let prefix: string = (pathString == '') ? 'M' : 'L'
			pathString += prefix + stringFromPoint(point)
		}
		if (this.closed) {
			pathString += 'Z'
		}
		return pathString
	}
	
}














export class CurvedShape extends VMobject {

	_bezierPoints: Array<Vertex> = []

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	updateBezierPoints() { }
	// implemented by subclasses

	updateSelf(args = {}, redraw = true) {
		super.updateSelf(args, false)
		this.updateBezierPoints()
		if (redraw) { this.redrawSelf() }
	}

	// globalBezierPoints(): Array<Vertex> {
	// 	return this.globalTransform().appliedTo(this.bezierPoints)
	// }

	// redrawSelf() {
	// 	this.updateBezierPoints()
	// 	super.redrawSelf()
	// }

	pathString(): string {
		//let points: Array<Vertex> = this.globalBezierPoints()
		let points: Array<Vertex> = this.bezierPoints
		if (points == undefined || points.length == 0) { return '' }

		// there should be 3n+1 points
		let nbCurves: number = (points.length - 1)/3
		if (nbCurves % 1 != 0) { throw 'Incorrect number of Bézier points' }

		let pathString: string = 'M' + stringFromPoint(points[0])
		for (let i = 0; i < nbCurves; i++) {
			let point1str: string = stringFromPoint(points[3*i + 1])
			let point2str: string = stringFromPoint(points[3*i + 2])
			let point3str: string = stringFromPoint(points[3*i + 3])
			pathString += 'C' + point1str + ' ' + point2str + ' ' + point3str
		}
		pathString += 'Z'
		return pathString
	}



	get bezierPoints(): Array<Vertex> { return this._bezierPoints }
	set bezierPoints(newValue: Array<Vertex>) {
		this._bezierPoints = newValue
		let v: Array<Vertex> = []
		let i: number = 0
		for (let p of this.bezierPoints) {
			if (i % 3 == 1) { v.push(p) }
			i += 1
		}
		this.vertices = v
	}

}
