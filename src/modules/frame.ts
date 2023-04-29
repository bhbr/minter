// import { Vertex, Transform } from './vertex-transform'
// import { ExtendedObject } from './extended-object'
// import { remove, xMin, xMax, yMin, yMax, midX, midY } from './helpers'



// type TransformOriginX = "left" | "center" | "right"
// type TransformOriginY = "top" | "center" | "bottom"
// type TransformOrigin = [TransformOriginY, TransformOriginX]

// /**
//  * Frames are precursors to Mobjects.
// */
// export class Frame extends ExtendedObject {

// 	// position and hierarchy
// 	anchor = Vertex.origin()
// 	transform = Transform.identity()
// 	readonly transformOrigin: TransformOrigin = ["top", "left"] // to be writable later
// 	_parent?: Frame = null
// 	viewWidth = 300
// 	viewHeight = 200
// 	children: Array<Frame> = []

// 	// see further below for the meaning of a Frame's extent
// 	getWidth(): number { return this.localExtentXMax() - this.localExtentXMin() }
// 	getHeight(): number { return this.localExtentYMax() - this.localExtentYMin() }


// 	// hierarchy methods //

// 	get parent(): Frame { return this._parent }
// 	set parent(newFrame: Frame) { this._parent = newFrame }

// 	get superframe(): Frame { return this.parent }
// 	set superframe(newValue: Frame) { this.parent = newValue }

// 	get subframes(): Array<Frame> { return this.children }
// 	set subframes(newValue: Array<Frame>) {
// 		this.children = newValue
// 	}

// 	add(child: Frame) {
// 		if (child.parent != this) { child.parent = this }
// 		if (!this.children.includes(child)) {
// 			this.children.push(child)
// 		}
// 	}

// 	remove(child: Frame) {
// 		remove(this.children, child)
// 		child.parent = null
// 	}

// 	// transforming between Frames //

// 	transformRelativeTo(frame?: Frame): Transform {
// 		// If there is no frame, use the parent's coordinate frame. If there is no parent yet, use local coordinates
// 		frame = frame || this.parent || this
// 		let t = Transform.identity()
// 		let fr: Frame = this
// 		while (fr && fr.transform instanceof Transform) {
// 			if (fr == frame) { break }
// 			t.leftComposeWith(new Transform({ shift: fr.anchor }))
// 			t.leftComposeWith(fr.transform)
// 			fr = fr.parent
// 		}
// 		return t
// 	}

// 	localPointRelativeTo(point: Vertex, frame?: Frame): Vertex {
// 		let t = this.transformRelativeTo(frame)
// 		return t.appliedTo(point)
// 	}


// 	// positioning (more to come) //

// 	centerAt(newCenter: Vertex, frame?: Frame) {
// 		// If there is no frame, use the parent's coordinate frame. If there is no parent yet, use local coordinates
// 		frame = frame || this.parent || this
// 		let dr: Vertex = newCenter.subtract(this.relativeViewCenter(frame))
// 		let oldAnchor: Vertex = this.anchor.copy()
// 		this.anchor = this.anchor.translatedBy(dr[0], dr[1])
// 	}


// 	// geometric properties derived from the raw div //

// 	// coords
// 	localViewXMin(): number { return 0 }
// 	localViewMidX(): number { return this.viewWidth/2 }
// 	localViewXMax(): number { return this.viewWidth }
// 	localViewYMin(): number { return 0 }
// 	localViewMidY(): number { return this.viewHeight/2 }
// 	localViewYMax(): number { return this.viewHeight }
// 	// corners
// 	localViewULCorner(): Vertex { return new Vertex(this.localViewXMin(), this.localViewYMin()) }
// 	localViewURCorner(): Vertex { return new Vertex(this.localViewXMax(), this.localViewYMin()) }
// 	localViewLRCorner(): Vertex { return new Vertex(this.localViewXMax(), this.localViewYMax()) }
// 	localViewLLCorner(): Vertex { return new Vertex(this.localViewXMin(), this.localViewYMax()) }
// 	localViewCorners(): Array<Vertex> { return [this.localViewULCorner(), this.localViewURCorner(), this.localViewLRCorner(), this.localViewLLCorner()] }
// 	// centers
// 	localViewCenter(): Vertex { return new Vertex(this.localViewMidX(), this.localViewMidY()) }
// 	localViewTopCenter(): Vertex { return new Vertex(this.localViewMidX(), this.localViewYMin()) }
// 	localViewRightCenter(): Vertex { return new Vertex(this.localViewXMax(), this.localViewMidY()) }
// 	localViewBottomCenter(): Vertex { return new Vertex(this.localViewMidX(), this.localViewYMax()) }
// 	localViewLeftCenter(): Vertex { return new Vertex(this.localViewXMin(), this.localViewMidY()) }
// 	localViewOuterCenters(): Array<Vertex> { return [this.localViewTopCenter(), this.localViewRightCenter(), this.localViewBottomCenter(), this.localViewLeftCenter()] }

// 	// transformed versions of all these
// 	relativeViewXMin(frame?: Frame): number { return xMin(this.relativeViewCorners(frame)) }
// 	relativeViewMidX(frame?: Frame): number { return midX(this.relativeViewCorners(frame)) }
// 	relativeViewXMax(frame?: Frame): number { return xMax(this.relativeViewCorners(frame)) }
// 	relativeViewYMin(frame?: Frame): number { return yMin(this.relativeViewCorners(frame)) }
// 	relativeViewMidY(frame?: Frame): number { return midY(this.relativeViewCorners(frame)) }
// 	relativeViewYMax(frame?: Frame): number { return yMax(this.relativeViewCorners(frame)) }
// 	relativeViewULCorner(frame?: Frame) { return this.localPointRelativeTo(this.localViewULCorner(), frame) }
// 	relativeViewURCorner(frame?: Frame) { return this.localPointRelativeTo(this.localViewURCorner(), frame) }
// 	relativeViewLRCorner(frame?: Frame) { return this.localPointRelativeTo(this.localViewLRCorner(), frame) }
// 	relativeViewLLCorner(frame?: Frame) { return this.localPointRelativeTo(this.localViewLLCorner(), frame) }
// 	relativeViewCorners(frame?: Frame): Array<Vertex> { return [this.relativeViewULCorner(frame), this.relativeViewURCorner(frame), this.relativeViewLRCorner(frame), this.relativeViewLLCorner(frame)] }
// 	relativeViewCenter(frame?: Frame) { return this.localPointRelativeTo(this.localViewCenter(), frame) }
// 	relativeViewTopCenter(frame?: Frame) { return this.localPointRelativeTo(this.localViewTopCenter(), frame) }
// 	relativeViewLeftCenter(frame?: Frame) { return this.localPointRelativeTo(this.localViewLeftCenter(), frame) }
// 	relativeViewBottomCenter(frame?: Frame) { return this.localPointRelativeTo(this.localViewBottomCenter(), frame) }
// 	relativeViewRightCenter(frame?: Frame) { return this.localPointRelativeTo(this.localViewRightCenter(), frame) }
// 	relativeViewOuterCenters(frame?: Frame): Array<Vertex> { return [this.relativeViewTopCenter(frame), this.relativeViewRightCenter(frame), this.relativeViewBottomCenter(frame), this.relativeViewLeftCenter(frame)] }

// 	// aliases for the default Frame (the superframe)
// 	viewXMin(): number { return this.relativeViewXMin() }
// 	viewMidX(): number { return this.relativeViewMidX() }
// 	viewXMax(): number { return this.relativeViewXMax() }
// 	viewYMin(): number { return this.relativeViewYMin() }
// 	viewMidY(): number { return this.relativeViewMidY() }
// 	viewYMax(): number { return this.relativeViewYMax() }
// 	viewULCorner(): Vertex { return this.relativeViewULCorner() }
// 	viewURCorner(): Vertex { return this.relativeViewURCorner() }
// 	viewLRCorner(): Vertex { return this.relativeViewLRCorner() }
// 	viewLLCorner(): Vertex { return this.relativeViewLLCorner() }
// 	viewCorners(): Array<Vertex> { return this.relativeViewCorners() }
// 	viewCenter(): Vertex { return this.relativeViewCenter() }
// 	viewTopCenter(): Vertex { return this.relativeViewTopCenter() }
// 	viewLeftCenter(): Vertex { return this.relativeViewLeftCenter() }
// 	viewBottomCenter(): Vertex { return this.relativeViewBottomCenter() }
// 	viewRightCenter(): Vertex { return this.relativeViewRightCenter() }
// 	viewOuterCenters(): Array<Vertex> { return this.relativeViewOuterCenters() }


// 	// geometric properties derived from the Frame's extent //

// 	// A Frame's extent is determined by its div OR its children's extents (if any)
// 	// later, a VMobject's extent is determined by its vertices AND its children's extents (if any)

// 	// coords
// 	localExtentXMin(): number { return this.children.length == 0 ? this.localViewXMin() : this.relativeChildrenXMin(this) }
// 	localExtentMidX(): number { return (this.localExtentXMin() + this.localExtentXMax())/2 }
// 	localExtentXMax(): number { return this.children.length == 0 ? this.localViewXMax() : this.relativeChildrenXMax(this) }
// 	localExtentYMin(): number { return this.children.length == 0 ? this.localViewYMin() : this.relativeChildrenYMin(this) }
// 	localExtentMidY(): number { return (this.localExtentYMin() + this.localExtentYMax())/2 }
// 	localExtentYMax(): number { return this.children.length == 0 ? this.localViewYMax() : this.relativeChildrenYMax(this) }
// 	// corners
// 	localExtentULCorner(): Vertex { return new Vertex(this.localExtentXMin(), this.localExtentYMin()) }
// 	localExtentURCorner(): Vertex { return new Vertex(this.localExtentXMax(), this.localExtentYMin()) }
// 	localExtentLRCorner(): Vertex { return new Vertex(this.localExtentXMax(), this.localExtentYMax()) }
// 	localExtentLLCorner(): Vertex { return new Vertex(this.localExtentXMin(), this.localExtentYMax()) }
// 	localExtentCorners(): Array<Vertex> { return [this.localExtentULCorner(), this.localExtentURCorner(), this.localExtentLRCorner(), this.localExtentLLCorner()] }
// 	// centers
// 	localExtentCenter(): Vertex { return new Vertex(this.localExtentMidX(), this.localExtentMidY()) }
// 	localExtentTopCenter(): Vertex { return new Vertex(this.localExtentMidX(), this.localExtentYMin()) }
// 	localExtentLeftCenter(): Vertex { return new Vertex(this.localExtentXMin(), this.localExtentMidY()) }
// 	localExtentBottomCenter(): Vertex { return new Vertex(this.localExtentMidX(), this.localExtentYMax()) }
// 	localExtentRightCenter(): Vertex { return new Vertex(this.localExtentXMax(), this.localExtentMidY()) }
// 	localExtentOuterCenters(): Array<Vertex> { return [this.localExtentTopCenter(), this.localExtentRightCenter(), this.localExtentBottomCenter(), this.localExtentLeftCenter()] }

// 	// transformed versions
// 	relativeExtentXMin(frame?: Frame): number { return xMin(this.relativeExtentCorners(frame)) }
// 	relativeExtentMidX(frame?: Frame): number { return midX(this.relativeExtentCorners(frame)) }
// 	relativeExtentXMax(frame?: Frame): number { return xMax(this.relativeExtentCorners(frame)) }
// 	relativeExtentYMin(frame?: Frame): number { return yMin(this.relativeExtentCorners(frame)) }
// 	relativeExtentMidY(frame?: Frame): number { return midY(this.relativeExtentCorners(frame)) }
// 	relativeExtentYMax(frame?: Frame): number { return yMax(this.relativeExtentCorners(frame)) }
// 	relativeExtentULCorner(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localExtentULCorner(), frame) }
// 	relativeExtentURCorner(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localExtentURCorner(), frame) }
// 	relativeExtentLRCorner(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localExtentLRCorner(), frame) }
// 	relativeExtentLLCorner(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localExtentLLCorner(), frame) }
// 	relativeExtentCorners(frame?: Frame) { return [this.relativeExtentULCorner(frame), this.relativeExtentURCorner(frame), this.relativeExtentLRCorner(frame), this.relativeExtentLLCorner(frame)] }
// 	relativeExtentCenter(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localExtentCenter(), frame) }
// 	relativeExtentTopCenter(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localExtentTopCenter(), frame) }
// 	relativeExtentLeftCenter(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localExtentLeftCenter(), frame) }
// 	relativeExtentBottomCenter(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localExtentBottomCenter(), frame) }
// 	relativeExtentRightCenter(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localExtentRightCenter(), frame) }
// 	relativeExtentOuterCenters(frame?: Frame): Array<Vertex> { return [this.relativeExtentTopCenter(frame), this.relativeExtentRightCenter(frame), this.relativeExtentBottomCenter(frame), this.relativeExtentLeftCenter(frame)] }

// 	// aliases for the default Frame (the superframe)
// 	extentXMin(): number { return this.relativeExtentXMin() }
// 	extentMidX(): number { return this.relativeExtentMidX() }
// 	extentXMax(): number { return this.relativeExtentXMax() }
// 	extentYMin(): number { return this.relativeExtentYMin() }
// 	extentMidY(): number { return this.relativeExtentMidY() }
// 	extentYMax(): number { return this.relativeExtentYMax() }
// 	extentULCorner(): Vertex { return this.relativeExtentULCorner() }
// 	extentURCorner(): Vertex { return this.relativeExtentURCorner() }
// 	extentLRCorner(): Vertex { return this.relativeExtentLRCorner() }
// 	extentLLCorner(): Vertex { return this.relativeExtentLLCorner() }
// 	extentCorners(): Array<Vertex> { return this.relativeExtentCorners() }
// 	extentCenter(): Vertex { return this.relativeExtentCenter() }
// 	extentTopCenter(): Vertex { return this.relativeExtentTopCenter() }
// 	extentLeftCenter(): Vertex { return this.relativeExtentLeftCenter() }
// 	extentBottomCenter(): Vertex { return this.relativeExtentBottomCenter() }
// 	extentRightCenter(): Vertex { return this.relativeExtentRightCenter() }
// 	extentOuterCenters(): Array<Vertex> { return this.relativeExtentOuterCenters() }


// 	// aliases with no reference to either the view or extent //

// 	localXMin(): number { return this.relativeExtentXMin(this) }
// 	localMidX(): number { return this.relativeExtentMidX(this) }
// 	localXMax(): number { return this.relativeExtentXMax(this) }
// 	localYMin(): number { return this.relativeExtentYMin(this) }
// 	localYMax(): number { return this.relativeExtentYMax(this) }
// 	localMidY(): number { return this.relativeExtentMidY(this) }
// 	localULCorner(): Vertex { return this.relativeExtentULCorner(this) }
// 	localURCorner(): Vertex { return this.relativeExtentURCorner(this) }
// 	localLRCorner(): Vertex { return this.relativeExtentLRCorner(this) }
// 	localLLCorner(): Vertex { return this.relativeExtentLLCorner(this) }
// 	localCorners(): Array<Vertex> { return this.relativeExtentCorners(this) }
// 	localCenter(): Vertex { return this.relativeExtentCenter(this) }
// 	localTopCenter(): Vertex { return this.relativeExtentTopCenter(this) }
// 	localLeftCenter(): Vertex { return this.relativeExtentLeftCenter(this) }
// 	localBottomCenter(): Vertex { return this.relativeExtentBottomCenter(this) }
// 	localRightCenter(): Vertex { return this.relativeExtentRightCenter(this) }
// 	localOuterCenters(): Array<Vertex> { return this.relativeExtentOuterCenters(this) }
// 	// transformed versions
// 	relativeXMin(frame?: Frame): number { return this.relativeExtentXMin(frame) }
// 	relativeMidX(frame?: Frame): number { return this.relativeExtentMidX(frame) }
// 	relativeXMax(frame?: Frame): number { return this.relativeExtentXMax(frame) }
// 	relativeYMin(frame?: Frame): number { return this.relativeExtentYMin(frame) }
// 	relativeMidY(frame?: Frame): number { return this.relativeExtentMidY(frame) }
// 	relativeYMax(frame?: Frame): number { return this.relativeExtentYMax(frame) }
// 	relativeULCorner(frame?: Frame): Vertex { return this.relativeExtentULCorner(frame) }
// 	relativeURCorner(frame?: Frame): Vertex { return this.relativeExtentURCorner(frame) }
// 	relativeLRCorner(frame?: Frame): Vertex { return this.relativeExtentLRCorner(frame) }
// 	relativeLLCorner(frame?: Frame): Vertex { return this.relativeExtentLLCorner(frame) }
// 	relativeCorners(frame?: Frame): Array<Vertex> { return this.relativeExtentCorners(frame) }
// 	relativeCenter(frame?: Frame): Vertex { return this.relativeExtentCenter(frame) }
// 	relativeTopCenter(frame?: Frame): Vertex { return this.relativeExtentTopCenter(frame) }
// 	relativeLeftCenter(frame?: Frame): Vertex { return this.relativeExtentLeftCenter(frame) }
// 	relativeBottomCenter(frame?: Frame): Vertex { return this.relativeExtentBottomCenter(frame) }
// 	relativeRightCenter(frame?: Frame): Vertex { return this.relativeExtentRightCenter(frame) }
// 	relativeOuterCenters(frame?: Frame): Array<Vertex> { return this.relativeExtentOuterCenters(frame) }
// 	// default frame
// 	xMin(): number { return this.extentXMin() }
// 	midX(): number { return this.extentMidX() }
// 	xMax(): number { return this.extentXMax() }
// 	yMin(): number { return this.extentYMin() }
// 	yMax(): number { return this.extentYMax() }
// 	midY(): number { return this.extentMidY() }
// 	ulCorner(): Vertex { return this.extentULCorner() }
// 	urCorner(): Vertex { return this.extentURCorner() }
// 	lrCorner(): Vertex { return this.extentLRCorner() }
// 	llCorner(): Vertex { return this.extentLLCorner() }
// 	corners(): Array<Vertex> { return this.extentCorners() }
// 	center(): Vertex { return this.extentCenter() }
// 	topCenter(): Vertex { return this.extentTopCenter() }
// 	leftCenter(): Vertex { return this.extentLeftCenter() }
// 	bottomCenter(): Vertex { return this.extentBottomCenter() }
// 	rightCenter(): Vertex { return this.extentRightCenter() }
// 	outerCenters(): Array<Vertex> { return this.extentOuterCenters() }

// 	// geometric properties derived from the Frame's children's extents //

// 	// coords
// 	localChildrenXMin(): number {
// 		var ret = Infinity
// 		for (let child of this.children) {
// 			ret = Math.min(ret, xMin(child.relativeExtentCorners(this)))
// 		}
// 		return ret
// 	}
// 	localChildrenXMax(): number {
// 		var ret = -Infinity
// 		for (let child of this.children) {
// 			ret = Math.max(ret, xMax(child.relativeExtentCorners(this))) }
// 		return ret
// 	}
// 	localChildrenYMin(): number {
// 		var ret = Infinity
// 		for (let child of this.children) { ret = Math.min(ret, yMin(child.relativeExtentCorners(this))) }
// 		return ret
// 	}
// 	localChildrenYMax(): number {
// 		var ret = -Infinity
// 		for (let child of this.children) { ret = Math.max(ret, yMax(child.relativeExtentCorners(this))) }
// 		return ret
// 	}
// 	localChildrenMidX(): number {
// 		return (this.localChildrenXMin() + this.localChildrenXMax())/2
// 	}
// 	localChildrenMidY(): number {
// 		return (this.localChildrenYMin() + this.localChildrenYMax())/2
// 	}
// 	// corners
// 	localChildrenULCorner(): Vertex { return new Vertex(this.localChildrenXMin(), this.localChildrenYMin()) }
// 	localChildrenURCorner(): Vertex { return new Vertex(this.localChildrenXMax(), this.localChildrenYMin()) }
// 	localChildrenLRCorner(): Vertex { return new Vertex(this.localChildrenXMax(), this.localChildrenYMax()) }
// 	localChildrenLLCorner(): Vertex { return new Vertex(this.localChildrenXMin(), this.localChildrenYMax()) }
// 	localChildrenCorners(): Array<Vertex> { return [this.localChildrenULCorner(), this.localChildrenURCorner(), this.localChildrenLRCorner(), this.localChildrenLLCorner()] }
// 	// centers
// 	localChildrenCenter(): Vertex { return new Vertex(this.localChildrenMidX(), this.localChildrenMidY()) }
// 	localChildrenTopCenter(): Vertex { return new Vertex(this.localChildrenMidX(), this.localChildrenYMin()) }
// 	localChildrenLeftCenter(): Vertex { return new Vertex(this.localChildrenXMin(), this.localChildrenMidY()) }
// 	localChildrenBottomCenter(): Vertex { return new Vertex(this.localChildrenMidX(), this.localChildrenYMax()) }
// 	localChildrenRightCenter(): Vertex { return new Vertex(this.localChildrenXMax(), this.localChildrenMidY()) }
// 	localChildrenOuterCenters(): Array<Vertex> { return [this.localChildrenTopCenter(), this.localChildrenRightCenter(), this.localChildrenBottomCenter(), this.localChildrenLeftCenter()] }

// 	// transformed versions
// 	relativeChildrenXMin(frame?: Frame): number { return xMin(this.relativeChildrenCorners(frame)) }
// 	relativeChildrenMidX(frame?: Frame): number { return midX(this.relativeChildrenCorners(frame)) }
// 	relativeChildrenXMax(frame?: Frame): number { return xMax(this.relativeChildrenCorners(frame)) }
// 	relativeChildrenYMin(frame?: Frame): number { return yMin(this.relativeChildrenCorners(frame)) }
// 	relativeChildrenYMax(frame?: Frame): number { return yMax(this.relativeChildrenCorners(frame)) }
// 	relativeChildrenMidY(frame?: Frame): number { return midY(this.relativeChildrenCorners(frame)) }
// 	relativeChildrenULCorner(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localChildrenULCorner(), frame) }
// 	relativeChildrenURCorner(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localChildrenURCorner(), frame) }
// 	relativeChildrenLRCorner(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localChildrenLRCorner(), frame) }
// 	relativeChildrenLLCorner(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localChildrenLLCorner(), frame) }
// 	relativeChildrenCorners(frame?: Frame): Array<Vertex> { return [this.relativeChildrenULCorner(frame), this.relativeChildrenURCorner(frame), this.relativeChildrenLRCorner(frame), this.relativeChildrenLLCorner(frame)] }
// 	relativeChildrenCenter(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localChildrenCenter(), frame) }
// 	relativeChildrenTopCenter(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localChildrenTopCenter(), frame) }
// 	relativeChildrenLeftCenter(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localChildrenLeftCenter(), frame) }
// 	relativeChildrenBottomCenter(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localChildrenBottomCenter(), frame) }
// 	relativeChildrenRightCenter(frame?: Frame): Vertex { return this.localPointRelativeTo(this.localChildrenRightCenter(), frame) }
// 	relativeChildrenOuterCenters(frame?: Frame): Array<Vertex> { return [this.relativeChildrenTopCenter(frame), this.relativeChildrenRightCenter(frame), this.relativeChildrenBottomCenter(frame), this.relativeChildrenLeftCenter(frame)] }
// 	// default frame
// 	childrenXMin(): number { return this.relativeChildrenXMin() }
// 	childrenMidX(): number { return this.relativeChildrenMidX() }
// 	childrenXMax(): number { return this.relativeChildrenXMax() }
// 	childrenYMin(): number { return this.relativeChildrenYMin() }
// 	childrenMidY(): number { return this.relativeChildrenMidY() }
// 	childrenYMax(): number { return this.relativeChildrenYMax() }
// 	childrenULCorner(): Vertex { return this.relativeChildrenULCorner() }
// 	childrenURCorner(): Vertex { return this.relativeChildrenURCorner() }
// 	childrenLRCorner(): Vertex { return this.relativeChildrenLRCorner() }
// 	childrenLLCorner(): Vertex { return this.relativeChildrenLLCorner() }
// 	childrenCorners(): Array<Vertex> { return this.relativeChildrenCorners() }
// 	childrenCenter(): Vertex { return this.relativeChildrenCenter() }
// 	childrenTopCenter(): Vertex { return this.relativeChildrenTopCenter() }
// 	childrenBottomCenter(): Vertex { return this.relativeChildrenBottomCenter() }
// 	childrenLeftCenter(): Vertex { return this.relativeChildrenLeftCenter() }
// 	childrenRightCenter(): Vertex { return this.relativeChildrenRightCenter() }
// 	childrenOuterCenters(): Array<Vertex> { return this.relativeChildrenOuterCenters() }



// 	// aliases: children -> subframe //

// 	localSubframeXMin(): number { return this.localChildrenXMin() }
// 	localSubframeMidX(): number { return this.localChildrenMidX() }
// 	localSubframeXMax(): number { return this.localChildrenXMax() }
// 	localSubframeYMin(): number { return this.localChildrenYMin() }
// 	localSubframeMidY(): number { return this.localChildrenMidY() }
// 	localSubframeYMax(): number { return this.localChildrenYMax() }
// 	localSubframeULCorner(): Vertex { return this.localChildrenULCorner() }
// 	localSubframeURCorner(): Vertex { return this.localChildrenURCorner() }
// 	localSubframeLRCorner(): Vertex { return this.localChildrenLRCorner() }
// 	localSubframeLLCorner(): Vertex { return this.localChildrenLLCorner() }
// 	localSubframeCorners(): Array<Vertex> { return this.localChildrenCorners() }
// 	localSubframeCenter(): Vertex { return this.localChildrenCenter() }
// 	localSubframeTopCenter(): Vertex { return this.localChildrenTopCenter() }
// 	localSubframeLeftCenter(): Vertex { return this.localChildrenLeftCenter() }
// 	localSubframeBottomCenter(): Vertex { return this.localChildrenBottomCenter() }
// 	localSubframeRightCenter(): Vertex { return this.localChildrenRightCenter() }
// 	localSubframeOuterCenters(): Array<Vertex> { return this.localChildrenOuterCenters() }
// 	// transformed
// 	relativeSubframeXMin(frame?: Frame): number { return this.relativeChildrenXMin() }
// 	relativeSubframeMidX(frame?: Frame): number { return this.relativeChildrenMidX() }
// 	relativeSubframeXMax(frame?: Frame): number { return this.relativeChildrenXMax() }
// 	relativeSubframeYMin(frame?: Frame): number { return this.relativeChildrenYMin() }
// 	relativeSubframeMidY(frame?: Frame): number { return this.relativeChildrenMidY() }
// 	relativeSubframeYMax(frame?: Frame): number { return this.relativeChildrenYMax() }
// 	relativeSubframeULCorner(frame?: Frame): Vertex { return this.relativeChildrenULCorner(frame) }
// 	relativeSubframeURCorner(frame?: Frame): Vertex { return this.relativeChildrenURCorner(frame) }
// 	relativeSubframeLRCorner(frame?: Frame): Vertex { return this.relativeChildrenLRCorner(frame) }
// 	relativeSubframeLLCorner(frame?: Frame): Vertex { return this.relativeChildrenLLCorner(frame) }
// 	relativeSubframeCorners(frame?: Frame): Array<Vertex> { return this.relativeChildrenCorners(frame) }
// 	relativeSubframeCenter(frame?: Frame): Vertex { return this.relativeChildrenCenter(frame) }
// 	relativeSubframeTopCenter(frame?: Frame): Vertex { return this.relativeChildrenTopCenter(frame) }
// 	relativeSubframeRightCenter(frame?: Frame): Vertex { return this.relativeChildrenRightCenter(frame) }
// 	relativeSubframeBottomCenter(frame?: Frame): Vertex { return this.relativeChildrenBottomCenter(frame) }
// 	relativeSubframeLeftCenter(frame?: Frame): Vertex { return this.relativeChildrenLeftCenter(frame) }
// 	relativeSubframeOuterCenters(frame?: Frame): Array<Vertex> { return this.relativeChildrenOuterCenters(frame) }
// 	// default frame
// 	subframeXMin(): number { return this.childrenXMin() }
// 	subframeMidX(): number { return this.childrenMidX() }
// 	subframeXMax(): number { return this.childrenXMax() }
// 	subframeYMin(): number { return this.childrenYMin() }
// 	subframeMidY(): number { return this.childrenMidY() }
// 	subframeYMax(): number { return this.childrenYMax() }
// 	subframeULCorner(): Vertex { return this.childrenULCorner() }
// 	subframeURCorner(): Vertex { return this.childrenURCorner() }
// 	subframeLRCorner(): Vertex { return this.childrenLRCorner() }
// 	subframeLLCorner(): Vertex { return this.childrenLLCorner() }
// 	subframeCorners(): Array<Vertex> { return this.childrenCorners() }
// 	subframeCenter(): Vertex { return this.childrenCenter() }
// 	subframeTopCenter(): Vertex { return this.childrenTopCenter() }
// 	subframeRightCenter(): Vertex { return this.childrenRightCenter() }
// 	subframeBottomCenter(): Vertex { return this.childrenBottomCenter() }
// 	subframeLeftCenter(): Vertex { return this.childrenLeftCenter() }
// 	subframeOuterCenters(): Array<Vertex> { return this.childrenOuterCenters() }


// }