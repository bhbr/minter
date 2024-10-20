
import { Mobject } from 'core/mobjects/Mobject'
import { MGroup } from 'core/mobjects/MGroup'
import { Color } from 'core/classes/Color'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Transform } from 'core/classes/vertex/Transform'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { remove } from 'core/functions/arrays'
import { deepCopy } from 'core/functions/copying'
import { addPointerDown, addPointerMove, addPointerUp, removePointerDown, removePointerMove, removePointerUp } from 'core/mobjects/screen_events'

export class VMobject extends Mobject {
/*
A VMobject (vector mobject)'s shape is defined by an array of vertices. There are two kinds:

- subclass Polygon (vertices = corners)
- subclass CurvedShape (vertices = Bézier points)

The view in HTML looks like this:
<div>
	<svg>
		<path d='...'>
		</path>
	</svg>
</div>

TODO: support mutiple paths e. g. for shapes with holes
(multiple svgs are not necessary though).

	//////////////////////////////////////////////////////////
	//                                                      //
	//                    INITIALIZATION                    //
	//                                                      //
	//////////////////////////////////////////////////////////

*/

	vertices: VertexArray

	fillColor: Color
	fillOpacity: number // 0 to 1
	strokeColor: Color
	strokeWidth: number

	svg: SVGSVGElement // child of view
	path: SVGElement // child of svg

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			svg: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
			fillColor: Color.white(),
			fillOpacity: 0,
			strokeColor: Color.white(),
			strokeWidth: 1,
			vertices: new VertexArray()
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			svg: 'never',
			path: 'never'
		})
	}

	setup() {

		// setup the svg
		this.svg['mobject'] = this
		this.svg.setAttribute('class', 'mobject-svg')
		this.svg.style.overflow = 'visible'
		// and its path
		this.path['mobject'] = this
		this.svg.appendChild(this.path)

		this.setupView()
		this.view.appendChild(this.svg)
		this.view.setAttribute('class', this.constructor.name + ' mobject-div')
		// screen events are detected on the path
		// so the active area is clipped to its shape
		addPointerDown(this.path, this.capturedOnPointerDown.bind(this))
		addPointerMove(this.path, this.capturedOnPointerMove.bind(this))
		addPointerUp(this.path, this.capturedOnPointerUp.bind(this))
	}

	redraw() {
		super.redraw()
		let pathString: string = this.pathString()
		if (pathString.includes('NaN')) { return }
		this.path.setAttribute('d', pathString)

		this.path.style['fill'] = this.fillColor.toHex()
		this.path.style['fill-opacity'] = this.fillOpacity.toString()
		this.path.style['stroke'] = this.strokeColor.toHex()
		this.path.style['stroke-width'] = this.strokeWidth.toString()
	}

	static stringFromPoint(point: Array<number>): string {
		// a string representation for CSS
		let x: number = point[0],
			y: number = point[1]
		return `${x} ${y}`
	}

	pathString(): string {
	// This method turns this.vertices into a CSS path
		console.warn('please subclass pathString')
		return ''
	}

	relativeVertices(frame?: Mobject): VertexArray {
	// the vertices are in local coordinates, convert them to the given frame of an ancestor mobject
		let returnValue: VertexArray = this.relativeTransform(frame).appliedToVertices(this.vertices)
		if (returnValue == undefined) { return new VertexArray() }
		else { return returnValue }
	}

	globalVertices(): VertexArray {
	// uses default frame = paper
		return this.relativeVertices()
	}


	//////////////////////////////////////////////////////////
	//                                                      //
	//                     FRAME METHODS                    //
	//                                                      //
	//////////////////////////////////////////////////////////

	/*
	The coordinate extrema (x_min, x_max, y_min, y_max) are computed from the vertices
	instead of the view frame as for a general Mobject.
	Other coordinate quantities (x_mid, y_mid, ulCorner etc.) are computes from these
	four values.
	*/

	localXMin(): number {
		let xMin: number = Infinity
		if (this.vertices != undefined) {
			for (let p of this.vertices) { xMin = Math.min(xMin, p.x) }
		}
		if (this.children != undefined) {
			for (let mob of this.children) {
				xMin = Math.min(xMin, mob.localXMin() + mob.anchor.x)
			}
		}
		return xMin
	}

	localXMax(): number {
		let xMax: number = -Infinity
		if (this.vertices != undefined) {
			for (let p of this.vertices) { xMax = Math.max(xMax, p.x) }
		}
		if (this.children != undefined) {
			for (let mob of this.children) {
				xMax = Math.max(xMax, mob.localXMax() + mob.anchor.x)
			}
		}
		return xMax
	}

	localYMin(): number {
		let yMin: number = Infinity
		if (this.vertices != undefined) {
			for (let p of this.vertices) { yMin = Math.min(yMin, p.y) }
		}
		if (this.children != undefined) {
			for (let mob of this.children) {
				yMin = Math.min(yMin, mob.localYMin() + mob.anchor.y)
			}
		}
		return yMin
	}

	localYMax(): number {
		let yMax: number = -Infinity
		if (this instanceof MGroup) {

		}
		if (this.vertices != undefined) {
			for (let p of this.vertices) { yMax = Math.max(yMax, p.y) }
		}
		if (this.children != undefined) {
			for (let mob of this.children) {
				yMax = Math.max(yMax, mob.localYMax() + mob.anchor.y)
			}
		}
		return yMax
	}

	localMidX(): number { return (this.localXMin() + this.localXMax()) / 2 }
	localMidY(): number { return (this.localYMin() + this.localYMax()) / 2 }

	localULCorner(): Vertex { return new Vertex(this.localXMin(), this.localYMin())}
	localURCorner(): Vertex { return new Vertex(this.localXMax(), this.localYMin())}
	localLLCorner(): Vertex { return new Vertex(this.localXMin(), this.localYMax())}
	localLRCorner(): Vertex { return new Vertex(this.localXMax(), this.localYMax())}

	localCenter(): Vertex { return new Vertex(this.localMidX(), this.localMidY()) }
	localLeftCenter(): Vertex { return new Vertex(this.localXMin(), this.localMidY()) }
	localRightCenter(): Vertex { return new Vertex(this.localXMax(), this.localMidY()) }
	localTopCenter(): Vertex { return new Vertex(this.localMidX(), this.localYMin()) }
	localBottomCenter(): Vertex { return new Vertex(this.localMidX(), this.localYMax()) }

	ulCorner(frame?: Mobject): Vertex { return this.transformLocalPoint(this.localULCorner(), frame) }
	urCorner(frame?: Mobject): Vertex { return this.transformLocalPoint(this.localURCorner(), frame) }
	llCorner(frame?: Mobject): Vertex { return this.transformLocalPoint(this.localLLCorner(), frame) }
	lrCorner(frame?: Mobject): Vertex { return this.transformLocalPoint(this.localLRCorner(), frame) }

	center(frame?: Mobject): Vertex { return this.transformLocalPoint(this.localCenter(), frame) }

	xMin(frame?: Mobject): number { return this.ulCorner(frame).x }
	xMax(frame?: Mobject): number { return this.lrCorner(frame).x }
	yMin(frame?: Mobject): number { return this.ulCorner(frame).y }
	yMax(frame?: Mobject): number { return this.lrCorner(frame).y }

	midX(frame?: Mobject): number { return this.center(frame).x }
	midY(frame?: Mobject): number { return this.center(frame).y }

	leftCenter(frame?: Mobject): Vertex { return this.transformLocalPoint(this.localLeftCenter(), frame) }
	rightCenter(frame?: Mobject): Vertex { return this.transformLocalPoint(this.localRightCenter(), frame) }
	topCenter(frame?: Mobject): Vertex { return this.transformLocalPoint(this.localTopCenter(), frame) }
	bottomCenter(frame?: Mobject): Vertex { return this.transformLocalPoint(this.localBottomCenter(), frame) }

	getWidth(): number { return this.localXMax() - this.localXMin() }
	getHeight(): number { return this.localYMax() - this.localYMin() }




}






























