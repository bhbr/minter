import { Vertex, Transform } from './transform'
import { remove, logInto, stringFromPoint, pointerEventVertex, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, LocatedEvent } from './helpers'

export class Dependency {

	source: Mobject
	outputName: string
	target: Mobject
	inputName: string

	constructor(argsDict: object = {}) {
		this.source = argsDict['source']
		this.outputName = argsDict['outputName'] // may be undefined
		this.target = argsDict['target']
		this.inputName = argsDict['inputName'] // may be undefined
	}
}

export class Color {

	red: number
	green: number
	blue: number
	alpha: number

	constructor(r, g, b, a = 1) {
		this.red = r
		this.green = g
		this.blue = b
		this.alpha = a
	}

	brighten(factor: number): Color {
		return new Color(factor*this.red, factor*this.green, factor*this.blue, this.alpha)
	}

	toHex(): string {
		let hex_r: string = (Math.round(this.red*255)).toString(16).padStart(2, '0')
		let hex_g: string = (Math.round(this.green*255)).toString(16).padStart(2, '0')
		let hex_b: string = (Math.round(this.blue*255)).toString(16).padStart(2, '0')
		let hex_a: string = ''
		if (this.alpha != 1) {
			hex_a = (Math.round(this.alpha*255)).toString(16).padStart(2, '0')
		}
		return '#' + hex_r + hex_g + hex_b + hex_a
	}

	toCSS(): string {
		return `rgb(${255*this.red}, ${255*this.green}, ${255*this.blue}, ${this.alpha})`
	}

	static fromHex(hex: string): Color {
		let r: number = parseInt('0x' + hex.slice(1, 2))/255
		let g: number = parseInt('0x' + hex.slice(3, 2))/255
		let b: number = parseInt('0x' + hex.slice(5, 2))/255
		let a: number = 1
		if (hex.length > 7) {
			a = parseInt('0x' + hex.slice(7, 2))/255
		}
		return new Color(r, g, b, a)
	}

	static gray(x): Color { return new Color(x, x, x) }
	static black(): Color { return Color.gray(0) }
	static white(): Color { return Color.gray(1) }

	static red(): Color { return new Color(1, 0, 0) }
	static orange(): Color { return new Color(1, 0.5, 0) }
	static yellow(): Color { return new Color(1, 1, 0) }
	static green(): Color { return new Color(0, 1, 0) }
	static blue(): Color { return new Color(0, 0, 1) }
	static indigo(): Color { return new Color(0.5, 0, 1) }
	static violet(): Color { return new Color(1, 0, 1) }
}

export class Mobject {

	eventTarget: Mobject
	view: HTMLElement | SVGElement
	_parent: Mobject

	fillColor: Color
	fillOpacity: number
	strokeColor: Color
	strokeWidth: number

	_transform: Transform
	_anchor: Vertex
	vertices: Array<Vertex>
	children: Array<Mobject> = []
	dependencies: Array<Dependency>
	snappablePoints: Array<any> = [] // workaround, don't ask

	passAlongEvents: boolean // to event target
	visible: boolean
	draggable: boolean // by outside forces, that is (FreePoints drag themselves, as that is their method of interaction)

	dragPointStart: Vertex
	dragAnchorStart: Vertex

	get opacity(): number { return this.fillOpacity }
	set opacity(newValue: number) { this.fillOpacity = newValue }

	get transform(): Transform {
		if (this._transform == undefined) {
			this._transform = Transform.identity()
		}
		return this._transform
	}
	set transform(newValue: Transform) {
		if (this._transform == undefined) { this._transform = newValue }
		else { this._transform.copyFrom(newValue) }
	}

	get anchor(): Vertex { return this._anchor }
	set anchor(newValue: Vertex) {
		if (this._anchor == undefined) { this._anchor = newValue }
		else { this._anchor.copyFrom(newValue) }
		this.transform.anchorAt(newValue)
		this.update()
	}

	constructor(argsDict: object = {}) {
		this.eventTarget = null
		if (argsDict['view'] == undefined) {
			this.view = document.createElement('div') // placeholder
		} else {
			this.view = argsDict['view']
		}
		let defaults: object = {
			transform: Transform.identity(),
			anchor: Vertex.origin(),
			vertices: [],
			children: [],
			dependencies: [],
			fillColor: Color.white(),
			fillOpacity: 1,
			strokeColor: Color.white(),
			strokeWidth: 1,
			passAlongEvents: false, // to event target
			visible: true,
			draggable: false // by outside forces, that is
		}
		Object.assign(defaults, argsDict)
		this.setAttributes(defaults)
		this.view['mobject'] = this
		this.view.setAttribute('class', this.constructor.name)
		this.show()

		this.boundPointerDown = this.pointerDown.bind(this)
		this.boundPointerMove = this.pointerMove.bind(this)
		this.boundPointerUp = this.pointerUp.bind(this)
		this.boundEventTargetMobject = this.eventTargetMobject.bind(this)
		addPointerDown(this.view, this.boundPointerDown)

		this.savedSelfHandlePointerDown = this.selfHandlePointerDown
		this.savedSelfHandlePointerMove = this.selfHandlePointerMove
		this.savedSelfHandlePointerUp = this.selfHandlePointerUp
		this.disableDragging()

		// this.boundCreatePopover = this.createPopover.bind(this)
		// this.boundDismissPopover = this.dismissPopover.bind(this)
		// this.boundMouseUpAfterCreatingPopover = this.mouseUpAfterCreatingPopover.bind(this)

	}

	selfHandlePointerDown(e: LocatedEvent) { }
	selfHandlePointerMove(e: LocatedEvent) { }
	selfHandlePointerUp(e: LocatedEvent) { }
	savedSelfHandlePointerDown(e: LocatedEvent) { }
	savedSelfHandlePointerMove(e: LocatedEvent) { }
	savedSelfHandlePointerUp(e: LocatedEvent) { }
	boundPointerDown(e: LocatedEvent) { }
	boundPointerMove(e: LocatedEvent) { }
	boundPointerUp(e: LocatedEvent) { }
	boundEventTargetMobject(e: LocatedEvent): Mobject { return this }

	getPaper(): Mobject {
		let p: Mobject = this
		while (p != undefined && p.constructor.name != 'Paper') {
			p = p.parent
		}
		return p
	}

	get superMobject(): Mobject { return this.parent }
	set superMobject(newValue: Mobject) { this.parent = newValue }

	enableDragging() {
		this.savedSelfHandlePointerDown = this.selfHandlePointerDown
		this.savedSelfHandlePointerMove = this.selfHandlePointerMove
		this.savedSelfHandlePointerUp = this.selfHandlePointerUp
		this.selfHandlePointerDown = this.startSelfDragging
		this.selfHandlePointerMove = this.selfDragging
		this.selfHandlePointerUp = this.endSelfDragging
	}

	disableDragging() {
		this.selfHandlePointerDown = this.savedSelfHandlePointerDown
		this.selfHandlePointerMove = this.savedSelfHandlePointerMove
		this.selfHandlePointerUp = this.savedSelfHandlePointerUp
	}

	eventTargetMobject(e: LocatedEvent): Mobject {
		let t: Element = e.target as Element
		if (t.tagName == 'path') { t = t.parentElement }
		if (t == this.view) { return this }
		let targetViewChain: Array<Element> = [t]
		while (t != undefined && t != this.view) {
			t = t.parentElement
			targetViewChain.push(t)
		}
		t = targetViewChain.pop()
		t = targetViewChain.pop()
		while (t != undefined) {
			if (t['mobject'] != undefined) { return t['mobject'] }
			t = targetViewChain.pop() 
		}
		return this
	}

	pointerDown(e: LocatedEvent) {
		e.stopPropagation()
		removePointerDown(this.view, this.boundPointerDown)
		addPointerMove(this.view, this.boundPointerMove)
		addPointerUp(this.view, this.boundPointerUp)

		this.eventTarget = this.boundEventTargetMobject(e)
		if (this.eventTarget != this && this.passAlongEvents) {
			this.eventTarget.pointerDown(e)
		} else {
			this.selfHandlePointerDown(e)
		}
	}

	pointerMove(e: LocatedEvent) {
		e.stopPropagation()
		if (this.eventTarget != this && this.passAlongEvents) {
			this.eventTarget.pointerMove(e)
		} else {
			this.selfHandlePointerMove(e)
		}
	}

	pointerUp(e: LocatedEvent) {
		e.stopPropagation()
		removePointerMove(this.view, this.boundPointerMove)
		removePointerUp(this.view, this.boundPointerUp)
		addPointerDown(this.view, this.boundPointerDown)

		if (this.eventTarget != this && this.passAlongEvents) {
			this.eventTarget.pointerUp(e)
		} else {
			this.selfHandlePointerUp(e)
		}
		this.eventTarget = null
	}

	properties(): Array<string> {
		let obj: object = this
		let properties: Array<string> = []
		while (obj.constructor.name != 'Object') {
			properties.push(...Object.getOwnPropertyNames(obj))
			obj = Object.getPrototypeOf(obj)
		}
		return properties
	}

	setter(key: string): any {
		let descriptor: any = undefined
		if (this.properties().includes(key)) {
			let obj: object = this
			while (obj.constructor.name != 'Object' && descriptor == undefined) {
				descriptor = Object.getOwnPropertyDescriptor(obj, key)
				obj = Object.getPrototypeOf(obj)
			}
		}
		if (descriptor != undefined) { return descriptor.set }
		else { return undefined }
	}

	setAttributes(argsDict: object = {}) {
		for (let [key, value] of Object.entries(argsDict)) {
			let setter: any = this.setter(key)
			if (setter != undefined) {
				setter.call(this, value)
			} else {
				if (this[key] instanceof Vertex) { this[key].copyFrom(value) }
				else { this[key] = value }
			}
		}
	}

	// flagged for deletion
	setDefaults(argsDict: object = {}) {
		for (let [key, value] of Object.entries(argsDict)) {
			if (this[key] != undefined) { continue }
			if (this[key] instanceof Vertex) { this[key].copyFrom(value) }
			else { this[key] = value }
		}
	}

	get parent(): Mobject { return this._parent }
	set parent(newValue: Mobject) {
		this.view.remove()
		this._parent = newValue
		if (newValue == undefined) { return }
		newValue.add(this)
		if (this.parent.visible) { this.show() }
		else { this.hide() }
	}

	relativeTransform(frame?: Mobject): Transform {
		let t = Transform.identity()
		let mob: Mobject = this
		if (mob.constructor.name == 'CindyCanvas') {
			if (frame == this) {
				return t
			} else if (frame == (this.getPaper())) {
				t.e = this.anchor.x
				t.f = this.anchor.y
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

	relativeVertices(frame?: Mobject): Array<Vertex> {
		let returnValue: Array<Vertex> = this.relativeTransform(frame).appliedTo(this.vertices)
		if (returnValue == undefined) { return [] }
		else { return returnValue }
	}

	globalVertices(): Array<Vertex> {
		return this.relativeVertices()
	}

	update(argsDict: object = {}, redraw = true) {
		this.setAttributes(argsDict)
		this.transform.anchorAt(this.anchor)
		this.updateSubmobs()

		for (let dep of this.dependencies || []) {
			let outputName: any = this[dep.outputName] // may be undefined
			if (typeof outputName === 'function') {
				dep.target[dep.inputName] = outputName()
			} else if (outputName != undefined && outputName != null) {
				dep.target[dep.inputName] = outputName
			}
			dep.target.update()
		}
		if (redraw) { this.redraw() }

	}

	updateSubmobs() {
		for (let submob of this.children || []) {
			submob.update({}, false)
		}
	}

	redrawSubmobs(redraw = true) {
		for (let submob of this.children || []) {
			submob.redraw()
			submob.redrawSubmobs()
		}
	}

	redraw() {
		console.warn('Please subclass Mobject.redraw for class', this.constructor.name)
	}

	get submobjects(): Array<Mobject> { return this.children }
	set submobjects(newValue: Array<Mobject>) {
		this.children = newValue
	}

	get submobs(): Array<Mobject> { return this.submobjects }
	set submobs(newValue: Array<Mobject>) {
		this.submobs = newValue
	}

	add(submob: Mobject) {
		if (submob.parent != this) { submob.parent = this }
		if (!this.children.includes(submob)) {
			this.children.push(submob)
		}
		this.view.append(submob.view)
		submob.redraw()
	}

	remove(submob: Mobject) {
		submob.view.remove()
		remove(this.children, submob)
		submob.parent = undefined
	}

	hide() {
		this.visible = false
		if (this.view != undefined) {
			this.view.style["visibility"] = "hidden"
		}
		for (let submob of this.children) { submob.hide() } // we have to propagate invisibility
		this.redraw()
	}

	show() {
		this.visible = true
		if (this.view != undefined) {
			this.view.style["visibility"] = "visible"
		}
		for (let submob of this.children) { submob.show() } // we have to propagate visibility bc we have to for invisibility
		this.redraw()
	}

	centerAt(newCenter: Vertex, frame: Mobject) {
		if (!frame) { frame = this }
		let dr: Vertex = newCenter.subtract(this.center(frame))
		this.anchor = this.anchor.translatedBy(dr[0], dr[1])
		this.redraw()
	}

	startSelfDragging(e: LocatedEvent) {
		this.dragPointStart = pointerEventVertex(e)
		this.dragAnchorStart = this.anchor.copy()
	}

	selfDragging(e: LocatedEvent) {
		let dragPoint: Vertex = pointerEventVertex(e)
		let dr: Vertex = dragPoint.subtract(this.dragPointStart)
		this.anchor.copyFrom(this.dragAnchorStart.add(dr))
		this.update()
	}

	endSelfDragging(e: LocatedEvent) {
		this.dragPointStart = undefined
		this.dragAnchorStart = undefined
	}




	dependents(): Array<Mobject> {
		let dep: Array<Mobject> = []
		for (let d of this.dependencies) {
			dep.push(d.target)
		}
		return dep
	}

	allDependents(): Array<Mobject> {
		let dep: Array<Mobject> = this.dependents()
		for (let mob of dep) {
			dep.push(...mob.allDependents())
		}
		return dep
	}

	dependsOn(otherMobject: Mobject): boolean {
		return otherMobject.allDependents().includes(this)
	}


	addDependency(outputName: string, target: Mobject, inputName: string) {
		let dep = new Dependency({
			source: this,
			outputName: outputName,
			target: target,
			inputName: inputName
		})
		this.dependencies.push(dep)
	}

	addDependent(target: Mobject) {
		this.addDependency(null, target, null)
	}

	// empty methods as workaround (don't ask)
	removeFreePoint(fp: any) { }

	localXMin(): number {
		let xMin = Infinity
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
		let xMax = -Infinity
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
		let yMin = Infinity
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
		let yMax = -Infinity
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

	getWidth(): number { return this.localXMax() - this.localXMin() }
	getHeight(): number { return this.localYMax() - this.localYMin() }

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

	xMin(frame?: Mobject): number {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localXMin())
	}

	xMax(frame?: Mobject): number {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localXMax())
	}

	yMin(frame?: Mobject): number {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localYMin())
	}

	yMax(frame?: Mobject): number {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localYMax())
	}

	ulCorner(frame?: Mobject): Vertex {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localULCorner())
	}

	urCorner(frame?: Mobject): Vertex {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localURCorner())
	}

	llCorner(frame?: Mobject): Vertex {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localLLCorner())
	}

	lrCorner(frame?: Mobject): Vertex {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localLRCorner())
	}

	midX(frame?: Mobject): number {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.midX())
	}

	midY(frame?: Mobject): number {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.midY())
	}

	leftCenter(frame?: Mobject): Vertex {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localLeftCenter())
	}

	rightCenter(frame?: Mobject): Vertex {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localRightCenter())
	}

	topCenter(frame?: Mobject): Vertex {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localTopCenter())
	}

	bottomCenter(frame?: Mobject): Vertex {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localBottomCenter())
	}

	center(frame?: Mobject): Vertex {
		if (!frame) { frame = this }
		return this.relativeTransform(frame).appliedTo(this.localCenter())
	}

	globalXMin(): number { return this.xMin(this.getPaper()) }
	globalXMax(): number { return this.xMax(this.getPaper()) }
	globalYMin(): number { return this.yMin(this.getPaper()) }
	globalYMax(): number { return this.yMax(this.getPaper()) }
	globalULCorner(): Vertex { return this.ulCorner(this.getPaper()) }
	globalURCorner(): Vertex { return this.urCorner(this.getPaper()) }
	globalLLCorner(): Vertex { return this.llCorner(this.getPaper()) }
	globalLRCorner(): Vertex { return this.lrCorner(this.getPaper()) }
	globalMidX(): number { return this.midX(this.getPaper()) }
	globalMidY(): number { return this.midY(this.getPaper()) }
	globalLeftCenter(): Vertex { return this.leftCenter(this.getPaper()) }
	globalRightCenter(): Vertex { return this.rightCenter(this.getPaper()) }
	globalTopCenter(): Vertex { return this.topCenter(this.getPaper()) }
	globalBottomCenter(): Vertex { return this.bottomCenter(this.getPaper()) }
	globalCenter(): Vertex { return this.center(this.getPaper()) }



	// createPopover(e) {
	//     this.popover = new Popover(this, 200, 300, 'right')
	//     paper.add(this.popover)
	//     //paper.addEventListener('mousedown', this.boundDismissPopover)
	//     this.view.removeEventListener('dblclick', this.boundCreatePopover)
	//     this.view.removeEventListener('mousedown', this.boundDragStart)
	//     paper.removeEventListener('mousemove', this.boundDrag)
	//     removeLongPress(this.view)
	//     this.view.addEventListener('mouseup', this.boundMouseUpAfterCreatingPopover)
	// }

	// mouseUpAfterCreatingPopover(e) {
	//     this.view.addEventListener('mousedown', this.boundDragStart)
	//     this.view.removeEventListener('mouseup', this.boundMouseUpAfterCreatingPopover)
	// }

	// dismissPopover(e) {
	//     if (this.popover == undefined) { return }
	//     if (this.popover.view.contains(e.target)
	//         && !this.popover.closeButton.view.contains(e.target)
	//         && !this.popover.deleteButton.view.contains(e.target))
	//         { return }
	//     this.popover.view.remove()
	//     //paper.removeEventListener('mousedown', this.boundDismissPopover)
	//     this.view.addEventListener('dblclick', this.boundCreatePopover)
	//     addLongPress(this.view, this.boundCreatePopover)
	//     this.popover = undefined
	// }
												   
	// registerTouchStart(e) {
	//     this.touchStart = new Vertex(pointerEventPageLocation(e))
	// }
		   
	// closeTo(otherMobject) {
	//     return (this.anchor.subtract(otherMobject.anchor).norm() < 10)
	// }


}



export class MGroup extends Mobject {

	constructor(argsDict: object = {}) {
		super()
		for (let submob of this.children) {
			this.add(submob)
		}
		this.update(argsDict)
	}

	redraw() {
		this.redrawSubmobs()
	}

}



export class VMobject extends Mobject {

	view: SVGElement
	path: SVGElement // child of view
	vertices: Array<Vertex>

	constructor(argsDict: object = {}) {
		super()
		this.vertices = []
		this.view = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		this.path['mobject'] = this
		this.view.appendChild(this.path) // why not just add?
		this.setAttributes({
			fillColor: Color.white(),
			fillOpacity: 0.5,
			strokeColor: Color.white(),
			strokeWidth: 1
		})
		this.update(argsDict)
	}

	redraw() {
		if (this.path == undefined || this.vertices.length == 0) { return }
		let pathString: string = this.pathString()
		if (pathString.includes("NaN")) { return }
		this.path.setAttribute('d', pathString)
		this.path.style['fill'] = this.fillColor.toHex()
		this.path.style['fill-opacity'] = this.fillOpacity.toString()
		this.path.style['stroke'] = this.strokeColor.toHex()
		this.path.style['stroke-width'] = this.strokeWidth.toString()
		this.redrawSubmobs()
	}

	pathString(): string {
		console.log('please subclass pathString')
		return ''
	}

}








export class Polygon extends VMobject {

	pathString(): string {
		let pathString: string = ''
		for (let point of this.vertices) {
			if (point.isNaN()) {
				pathString = ''
				return pathString
			}
			let prefix: string = (pathString == '') ? 'M' : 'L'
			pathString += prefix + stringFromPoint(point)
		}
		pathString += 'Z'
		return pathString
	}
	
}














export class CurvedShape extends VMobject {

	_bezierPoints: Array<Vertex>

	updateBezierPoints() { }
	// implemented by subclasses

	update(argsDict: object = {}, redraw = true) {
		super.update(argsDict, redraw)
		this.updateBezierPoints()
	}

	globalBezierPoints(): Array<Vertex> {
		return this.globalTransform().appliedTo(this.bezierPoints)
	}

	redraw() {
		this.updateBezierPoints()
		super.redraw()
	}

	pathString(): string {
		let points: Array<Vertex> = this.globalBezierPoints()
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

	get bezierPoints(): Array<Vertex> { return this._bezierPoints }
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





export class TextLabel extends Mobject {

	text: string
	textAnchor: string
	color: Color

	constructor(argsDict: object = {}) {
		super()
		this.setAttributes({
			text: '',
			textAnchor: 'middle',
			color: Color.white()
		})
		this.view = document.createElementNS('http://www.w3.org/2000/svg', 'text')
		this.view['mobject'] = this
		this.view.setAttribute('class', this.constructor.name + ' unselectable')
		this.view.setAttribute('text-anchor', this.textAnchor)
		this.view.setAttribute('alignment-baseline', 'middle')
		this.view.setAttribute('font-family', 'Helvetica')
		this.view.setAttribute('font-size', '12')
		this.view.setAttribute('x', '0')
		this.view.setAttribute('y', '0')
		this.view.setAttribute('stroke-width', '0')
		this.update(argsDict)
	}

	redraw() {
		this.view.textContent = this.text
		this.view.setAttribute('x', this.globalTransform().e.toString())
		this.view.setAttribute('y', this.globalTransform().f.toString())
		
		if (this.color == undefined) { this.color = Color.white() }

		this.view.setAttribute('fill', this.color.toHex())
		this.view.setAttribute('stroke', this.color.toHex())
		
		this.redrawSubmobs()
	}

}



// export class Popover extends CurvedShape {
//     constructor(sourceMobject, width, height, direction = 'right') {
//         super()
//         this.sourceMobject = sourceMobject
//         this.anchor = sourceMobject.anchor.translatedBy(sourceMobject.rightEdge())
//         // sourceMobject != parentMobject because using the latter
//         // conflicts with the z hierarchy

//         let tipSize = 10
//         let cornerRadius = 30
//         this.fillColor = 'white'
//         this.strokeColor = 'black'
//         this.strokeWidth = 1
//         if (direction == 'right') {
//             let bezierPoints = Vertex.vertices([
//                 [0, 0], [0, 0],
//                 [tipSize, tipSize], [tipSize, tipSize], [tipSize, tipSize],
//                 [tipSize, height/2 - cornerRadius], [tipSize, height/2 - cornerRadius], [tipSize, height/2],
//                 [tipSize, height/2], [tipSize + cornerRadius, height/2], [tipSize + cornerRadius, height/2],
//                 [tipSize + width - cornerRadius, height/2], [tipSize + width - cornerRadius, height/2], [tipSize + width, height/2],
//                 [tipSize + width, height/2], [tipSize + width, height/2 - cornerRadius], [tipSize + width, height/2 - cornerRadius],
//                 [tipSize + width, -height/2 + cornerRadius], [tipSize + width, -height/2 + cornerRadius], [tipSize + width, -height/2],
//                 [tipSize + width, -height/2], [tipSize + width - cornerRadius, -height/2], [tipSize + width - cornerRadius, -height/2],
//                 [tipSize + cornerRadius, -height/2], [tipSize + cornerRadius, -height/2], [tipSize, -height/2], 
//                 [tipSize, -height/2], [tipSize, -height/2 + cornerRadius], [tipSize, -height/2 + cornerRadius],
//                 [tipSize, -tipSize], [tipSize, -tipSize], [tipSize, -tipSize],
//                 [0, 0], [0, 0]
//             ])
//             // let translatedBezierPoints = []
//             // for (let point of bezierPoints) {
//             //     point.translateBy(this.anchor)
//             // }
//             this.bezierPoints = bezierPoints
//         }
		
//         this.closeButton = new TextLabel('X')
//         this.closeButton.anchor = new Vertex(70, -130)
//         this.boundDismiss = this.dismiss.bind(this)
//         this.closeButton.view.addEventListener('click', this.boundDismiss)
//         this.add(this.closeButton)

//         this.deleteButton = new TextLabel('🗑')
//         this.deleteButton.anchor = new Vertex(65, 140)
//         this.boundDelete = this.delete.bind(this)
//         this.deleteButton.view.addEventListener('click', this.boundDelete)
//         this.add(this.deleteButton)

//     }

//     dismiss(e) {
//         this.sourceMobject.dismissPopover(e)
//     }

//     delete(e) {
//         this.dismiss(e)
//     }
																							
// }











