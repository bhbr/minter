
import { Mobject } from 'core/mobjects/Mobject'
import { MGroup } from 'core/mobjects/MGroup'
import { Color } from 'core/classes/Color'
import { vertex, vertexArray } from 'core/functions/vertex'
import { Transform } from 'core/classes/Transform/Transform'
import { remove } from 'core/functions/arrays'
import { deepCopy } from 'core/functions/copying'
import { addPointerDown, addPointerMove, addPointerUp, removePointerDown, removePointerMove, removePointerUp } from 'core/mobjects/screen_events'
import { VView } from './VView'
import { Frame } from 'core/mobjects/Frame'

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

	declare view: VView

	ownDefaults(): object {
		return {
			view: new VView(),
			vertices: []
		}
	}

	get fillColor(): Color { return this.view.fillColor }
	set fillColor(newValue: Color) { this.view.fillColor = newValue }

	get fillOpacity(): number { return this.view.fillOpacity }
	set fillOpacity(newValue: number) { this.view.fillOpacity = newValue }

	get strokeColor(): Color { return this.view.strokeColor }
	set strokeColor(newValue: Color) { this.view.strokeColor = newValue }

	get strokeWidth(): number { return this.view.strokeWidth }
	set strokeWidth(newValue: number) { this.view.strokeWidth = newValue }

	setup() {
		// setup the svg
		super.setup()
		if (!this.view.svg || !this.view.path || !this.view) { return }
		this.view.svg['mobject'] = this
		this.view.setup()
		// screen events are detected on the path
		// so the active area is clipped to its shape
		removePointerDown(this.view.div, this.sensor.capturedOnPointerDown.bind(this))
		removePointerMove(this.view.div, this.sensor.capturedOnPointerMove.bind(this))
		removePointerUp(this.view.div, this.sensor.capturedOnPointerUp.bind(this))
		addPointerDown(this.view.path, this.sensor.capturedOnPointerDown.bind(this))
		addPointerMove(this.view.path, this.sensor.capturedOnPointerMove.bind(this))
		addPointerUp(this.view.path, this.sensor.capturedOnPointerUp.bind(this))
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

	relativeVertices(frame?: Frame): vertexArray {
	// the vertices are in local coordinates, convert them to the given frame of an ancestor mobject
		let returnValue: vertexArray = this.view.frame.relativeTransform(frame).appliedToVertices(this.vertices)
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
				xMin = Math.min(xMin, mob.view.frame.localXMin() + mob.view.frame.anchor[0])
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
				xMax = Math.max(xMax, mob.view.frame.localXMax() + mob.view.frame.anchor[0])
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
				yMin = Math.min(yMin, mob.view.frame.localYMin() + mob.view.frame.anchor[1])
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
				yMax = Math.max(yMax, mob.view.frame.localYMax() + mob.view.frame.anchor[1])
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

	ulCorner(frame?: Frame): vertex { return this.view.frame.transformLocalPoint(this.localULCorner(), frame) }
	urCorner(frame?: Frame): vertex { return this.view.frame.transformLocalPoint(this.localURCorner(), frame) }
	llCorner(frame?: Frame): vertex { return this.view.frame.transformLocalPoint(this.localLLCorner(), frame) }
	lrCorner(frame?: Frame): vertex { return this.view.frame.transformLocalPoint(this.localLRCorner(), frame) }

	center(frame?: Frame): vertex { return this.view.frame.transformLocalPoint(this.localCenter(), frame) }

	xMin(frame?: Frame): number { return this.ulCorner(frame)[0] }
	xMax(frame?: Frame): number { return this.lrCorner(frame)[0] }
	yMin(frame?: Frame): number { return this.ulCorner(frame)[1] }
	yMax(frame?: Frame): number { return this.lrCorner(frame)[1] }

	midX(frame?: Frame): number { return this.center(frame)[0] }
	midY(frame?: Frame): number { return this.center(frame)[1] }

	leftCenter(frame?: Frame): vertex { return this.view.frame.transformLocalPoint(this.localLeftCenter(), frame) }
	rightCenter(frame?: Frame): vertex { return this.view.frame.transformLocalPoint(this.localRightCenter(), frame) }
	topCenter(frame?: Frame): vertex { return this.view.frame.transformLocalPoint(this.localTopCenter(), frame) }
	bottomCenter(frame?: Frame): vertex { return this.view.frame.transformLocalPoint(this.localBottomCenter(), frame) }

	getWidth(): number { return this.localXMax() - this.localXMin() }
	getHeight(): number { return this.localYMax() - this.localYMin() }




}






























