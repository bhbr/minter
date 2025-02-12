
import { Mobject } from 'core/mobjects/Mobject'
import { MGroup } from 'core/mobjects/MGroup'
import { Color } from 'core/classes/Color'
import { vertex, vertexArray } from 'core/functions/vertex'
import { Transform } from 'core/classes/Transform/Transform'
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

	vertices: vertexArray

	fillColor: Color
	fillOpacity: number // 0 to 1
	strokeColor: Color
	strokeWidth: number

	svg?: SVGSVGElement // child of view
	path?: SVGElement // child of svg

	ownDefaults(): object {
		return {
			svg: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
			fillColor: Color.white(),
			fillOpacity: 0,
			strokeColor: Color.white(),
			strokeWidth: 1,
			vertices: []
		}
	}

	ownMutabilities(): object {
		return {
			svg: 'never',
			path: 'never'
		}
	}

	setup() {
		if (!this.svg || !this.path || !this.view) { return }
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
		if (!this.svg || !this.path || !this.view) { return }
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

	relativeVertices(frame?: Mobject): vertexArray {
	// the vertices are in local coordinates, convert them to the given frame of an ancestor mobject
		let returnValue: vertexArray = this.relativeTransform(frame).appliedToVertices(this.vertices)
		if (returnValue == undefined) { return [] }
		else { return returnValue }
	}

	globalVertices(): vertexArray {
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
			for (let p of this.vertices) { xMin = Math.min(xMin, p[0]) }
		}
		if (this.children != undefined) {
			for (let mob of this.children) {
				xMin = Math.min(xMin, mob.localXMin() + mob.anchor[0])
			}
		}
		return xMin
	}

	localXMax(): number {
		let xMax: number = -Infinity
		if (this.vertices != undefined) {
			for (let p of this.vertices) { xMax = Math.max(xMax, p[0]) }
		}
		if (this.children != undefined) {
			for (let mob of this.children) {
				xMax = Math.max(xMax, mob.localXMax() + mob.anchor[0])
			}
		}
		return xMax
	}

	localYMin(): number {
		let yMin: number = Infinity
		if (this.vertices != undefined) {
			for (let p of this.vertices) { yMin = Math.min(yMin, p[1]) }
		}
		if (this.children != undefined) {
			for (let mob of this.children) {
				yMin = Math.min(yMin, mob.localYMin() + mob.anchor[1])
			}
		}
		return yMin
	}

	localYMax(): number {
		let yMax: number = -Infinity
		if (this instanceof MGroup) {

		}
		if (this.vertices != undefined) {
			for (let p of this.vertices) { yMax = Math.max(yMax, p[1]) }
		}
		if (this.children != undefined) {
			for (let mob of this.children) {
				yMax = Math.max(yMax, mob.localYMax() + mob.anchor[1])
			}
		}
		return yMax
	}

	localMidX(): number { return (this.localXMin() + this.localXMax()) / 2 }
	localMidY(): number { return (this.localYMin() + this.localYMax()) / 2 }

	localULCorner(): vertex { return [this.localXMin(), this.localYMin()] }
	localURCorner(): vertex { return [this.localXMax(), this.localYMin()] }
	localLLCorner(): vertex { return [this.localXMin(), this.localYMax()] }
	localLRCorner(): vertex { return [this.localXMax(), this.localYMax()] }

	localCenter(): vertex { return [this.localMidX(), this.localMidY()] }
	localLeftCenter(): vertex { return [this.localXMin(), this.localMidY()] }
	localRightCenter(): vertex { return [this.localXMax(), this.localMidY()] }
	localTopCenter(): vertex { return [this.localMidX(), this.localYMin()] }
	localBottomCenter(): vertex { return [this.localMidX(), this.localYMax()] }

	ulCorner(frame?: Mobject): vertex { return this.transformLocalPoint(this.localULCorner(), frame) }
	urCorner(frame?: Mobject): vertex { return this.transformLocalPoint(this.localURCorner(), frame) }
	llCorner(frame?: Mobject): vertex { return this.transformLocalPoint(this.localLLCorner(), frame) }
	lrCorner(frame?: Mobject): vertex { return this.transformLocalPoint(this.localLRCorner(), frame) }

	center(frame?: Mobject): vertex { return this.transformLocalPoint(this.localCenter(), frame) }

	xMin(frame?: Mobject): number { return this.ulCorner(frame)[0] }
	xMax(frame?: Mobject): number { return this.lrCorner(frame)[0] }
	yMin(frame?: Mobject): number { return this.ulCorner(frame)[1] }
	yMax(frame?: Mobject): number { return this.lrCorner(frame)[1] }

	midX(frame?: Mobject): number { return this.center(frame)[0] }
	midY(frame?: Mobject): number { return this.center(frame)[1] }

	leftCenter(frame?: Mobject): vertex { return this.transformLocalPoint(this.localLeftCenter(), frame) }
	rightCenter(frame?: Mobject): vertex { return this.transformLocalPoint(this.localRightCenter(), frame) }
	topCenter(frame?: Mobject): vertex { return this.transformLocalPoint(this.localTopCenter(), frame) }
	bottomCenter(frame?: Mobject): vertex { return this.transformLocalPoint(this.localBottomCenter(), frame) }

	getWidth(): number { return this.localXMax() - this.localXMin() }
	getHeight(): number { return this.localYMax() - this.localYMin() }




}






























