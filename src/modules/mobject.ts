import { Vertex, Transform } from './vertex-transform'
import { Color } from './color'
import { Dependency } from './dependency'
import { Frame } from './frame'
import { remove, stringFromPoint, pointerEventVertex, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, LocatedEvent, paperLog } from './helpers'

export class Mobject extends Frame {

	eventTarget: Mobject
	_parent: Mobject

	fillColor: Color
	fillOpacity: number
	strokeColor: Color
	strokeWidth: number

	viewWidth: number
	viewHeight: number

	_transform: Transform
	_anchor: Vertex
	vertices: Array<Vertex> = []
	children: Array<Mobject> = []
	dependencies: Array<Dependency> = []
	snappablePoints: Array<any> = [] // workaround, don't ask

	passAlongEvents: boolean // to event target
	visible: boolean
	draggable: boolean // by outside forces, that is (FreePoints drag themselves, as that is their method of interaction)

	dragPointStart: Vertex
	dragAnchorStart: Vertex

	drawBorder: boolean = false

	//boundUpdate: (argsDict: object, redraw: boolean) => ()

	get opacity(): number { return this.fillOpacity }
	set opacity(newValue: number) { this.fillOpacity = newValue }

	constructor(argsDict: object = {}) {
		super()
		this.eventTarget = null

		let defaults: object = {
			transform: Transform.identity(),
			anchor: Vertex.origin(),
			viewWidth: 100,
			viewHeight: 100,
			vertices: [],
			children: [],
			dependencies: [],
			fillColor: Color.white(),
			fillOpacity: 1,
			strokeColor: Color.white(),
			strokeWidth: 1,
			passAlongEvents: false, // to event target
			visible: true,
			draggable: true // by outside forces, that is
		}

		this.update(defaults, false)

		if (argsDict['view'] == undefined) {
			let defaultView: HTMLDivElement = document.createElement('div')
			this.setView(defaultView) // placeholder
		} else {
			this.setView(argsDict['view'])
		}

		this.update(argsDict, false)
		//this.show()

		this.boundPointerDown = this.pointerDown.bind(this)
		this.boundPointerMove = this.pointerMove.bind(this)
		this.boundPointerUp = this.pointerUp.bind(this)
		this.boundEventTargetMobject = this.eventTargetMobject.bind(this)
		addPointerDown(this.view, this.boundPointerDown)
		//this.boundUpdate = this.update.bind(this)
		
		this.savedSelfHandlePointerDown = this.selfHandlePointerDown
		this.savedSelfHandlePointerMove = this.selfHandlePointerMove
		this.savedSelfHandlePointerUp = this.selfHandlePointerUp

		this.disableDragging()

		// this.boundCreatePopover = this.createPopover.bind(this)
		// this.boundDismissPopover = this.dismissPopover.bind(this)
		// this.boundMouseUpAfterCreatingPopover = this.mouseUpAfterCreatingPopover.bind(this)

		this.positionView()
		this.update()

	}

	setView(newView: HTMLDivElement) {
		if (newView === this.view) { return }
		if (this.view && this.view.parentNode) {
			this.view.parentNode.removeChild(this.view)
		}
		if (this.view) {
			removePointerDown(this.view, this.boundPointerDown)
		}
		this.view = newView
		this.view['mobject'] = this
		if (this.superMobject) {
			this.superMobject.view.appendChild(this.view)
		}
		addPointerDown(this.view, this.boundPointerDown)
		this.positionView()

		this.view.setAttribute('class', 'mobject-div ' + this.constructor.name)
		this.view.style.position = 'absolute' // 'absolute' positions it relative (sic) to tits parent
		this.view.style.overflow = 'visible'
		if (this.drawBorder) {
			this.view.style.borderColor = Color.green().toCSS()
			this.view.style.borderWidth = "1px"
			this.view.style.borderStyle = "dashed"
		}
	}

	positionView() {
		if (!this.view || !this.anchor) { return }
		this.view.style['width'] = this.viewWidth.toString() + 'px'
		this.view.style['height'] = this.viewHeight.toString() + 'px'
		this.view.style['left'] = this.anchor.x.toString() + 'px'
		this.view.style['top'] = this.anchor.y.toString() + 'px'
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
		if (t.tagName == 'path') { t = t.parentElement.parentElement }
		if (t == this.view) {
			return this
		}
		let targetViewChain: Array<Element> = [t]
		while (t != undefined && t != this.view) {
			t = t.parentElement
			targetViewChain.push(t)
		}
		//console.log(targetViewChain)
		t = targetViewChain.pop()
		t = targetViewChain.pop()
		while (t != undefined) {
			if (t['mobject'] != undefined) {
				//console.log(t, t['mobject'])
				return t['mobject']
			}
			t = targetViewChain.pop()
		}
		// if all of this fails, you need to handle the event yourself
		return this
	}

	pointerDown(e: LocatedEvent) {
		console.log('pointerDown on', this)
		e.stopPropagation()
		removePointerDown(this.view, this.boundPointerDown)
		addPointerMove(this.view, this.boundPointerMove)
		addPointerUp(this.view, this.boundPointerUp)

		this.eventTarget = this.boundEventTargetMobject(e)
		console.log('event target on ', this, 'is', this.eventTarget)
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

	get parent(): Mobject { return this._parent }
	set parent(newValue: Mobject) {
		this.view.remove()
		this._parent = newValue
		if (newValue == undefined) { return }
		newValue.add(this)
		if (this.parent.visible) { this.show() }
		else { this.hide() }
	}



	update(argsDict: object = {}, redraw = true) {
		if (argsDict['view']) {
			this.setView(argsDict['view'])
			delete argsDict['view']
		}
		this.setAttributes(argsDict)
		this.transform.anchor = this.anchor
		this.updateSubmobs()

		for (let dep of this.dependencies || []) {
			let outputName: any = this[dep.outputName] // may be undefined
			if (typeof outputName === 'function') {
				dep.target[dep.inputName] = outputName.bind(this)()
			} else if (outputName != undefined && outputName != null) {
				dep.target[dep.inputName] = outputName
			}
			dep.target.update()
		}
		if (this.view && redraw) {
			this.positionView()
			this.redraw()
		}

	}

	updateSubmobs() {
		for (let submob of this.children || []) {
			if (!this.dependsOn(submob)) { // prevent dependency loops
				submob.update({}, false)
			}
		}
	}

	redrawSubmobs() {
		for (let submob of this.children || []) {
			submob.redraw()
			submob.redrawSubmobs()
		}
	}

	redraw() {
		if (!this.anchor) { return }
		if (this.anchor.isNaN()) { return }
		this.redrawSubmobs()
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

	show() {
		this.visible = true
		if (this.view != undefined) {
			this.view.style["visibility"] = "visible"
		}
		for (let submob of this.children) { submob.show() } // we have to propagate visibility bc we have to for invisibility
		this.redraw()
	}

	hide() {
		this.visible = false
		if (this.view != undefined) {
			this.view.style["visibility"] = "hidden"
		}
		for (let submob of this.children) { submob.hide() } // we have to propagate invisibility
		this.redraw()
	}

	recursiveShow() {
		this.show()
		for (let depmob of this.allDependents()) {
			depmob.show()
		}
	}

	recursiveHide() {
		this.hide()
		for (let depmob of this.allDependents()) {
			depmob.hide()
		}
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
		if (this.dependsOn(target)) {
			throw 'Circular dependency!'
		}
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

	// empty method as workaround (don't ask)
	removeFreePoint(fp: any) { }

	relativeTransform(frame?: Frame): Transform {
		if (!frame) { return this.transform }
		let mob: Mobject = this
		let t: Transform = this.transform
		while (mob != frame) {
			mob = mob.parent
			t.rightComposeWith(mob.transform)
		}
		return t
	}

	localXMin(): number { return 0 }
	localXMax(): number { return this.viewWidth }
	localYMin(): number { return 0 }
	localYMax(): number { return this.viewHeight }

	localMidX(): number { return (this.localXMin() + this.localXMax()) / 2 }
	localMidY(): number { return (this.localYMin() + this.localYMax()) / 2 }

	localULCorner(): Vertex { return new Vertex(this.localXMin(), this.localYMin()) }
	localURCorner(): Vertex { return new Vertex(this.localXMax(), this.localYMin()) }
	localLLCorner(): Vertex { return new Vertex(this.localXMin(), this.localYMax()) }
	localLRCorner(): Vertex { return new Vertex(this.localXMax(), this.localYMax()) }

	localLeftCenter(): Vertex { return new Vertex(this.localXMin(), this.localMidY()) }
	localRightCenter(): Vertex { return new Vertex(this.localXMax(), this.localMidY()) }
	localTopCenter(): Vertex { return new Vertex(this.localMidX(), this.localYMin()) }
	localBottomCenter(): Vertex { return new Vertex(this.localMidX(), this.localYMax()) }

	localCenter(): Vertex { return new Vertex(this.localMidX(), this.localMidY()) }

	// xMin(frame?: Frame): number {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localXMin())
	// }

	// xMax(frame?: Mobject): number {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localXMax())
	// }

	// yMin(frame?: Mobject): number {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localYMin())
	// }

	// yMax(frame?: Mobject): number {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localYMax())
	// }

	// ulCorner(frame?: Mobject): Vertex {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localULCorner())
	// }

	// urCorner(frame?: Mobject): Vertex {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localURCorner())
	// }

	// llCorner(frame?: Mobject): Vertex {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localLLCorner())
	// }

	// lrCorner(frame?: Mobject): Vertex {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localLRCorner())
	// }

	// midX(frame?: Mobject): number {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localMidX())
	// }

	// midY(frame?: Mobject): number {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localMidY())
	// }

	// leftCenter(frame?: Mobject): Vertex {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localLeftCenter())
	// }

	// rightCenter(frame?: Mobject): Vertex {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localRightCenter())
	// }

	// topCenter(frame?: Mobject): Vertex {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localTopCenter())
	// }

	// bottomCenter(frame?: Mobject): Vertex {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localBottomCenter())
	// }

	// center(frame?: Mobject): Vertex {
	// 	if (!frame) { frame = this }
	// 	return this.relativeTransform(frame).appliedTo(this.localCenter())
	// }

	// globalTransform(): Transform { return this.relativeTransform(paper) }

	// globalXMin(): number { return this.xMin(this.getPaper()) }
	// globalXMax(): number { return this.xMax(this.getPaper()) }
	// globalYMin(): number { return this.yMin(this.getPaper()) }
	// globalYMax(): number { return this.yMax(this.getPaper()) }
	// globalULCorner(): Vertex { return this.ulCorner(this.getPaper()) }
	// globalURCorner(): Vertex { return this.urCorner(this.getPaper()) }
	// globalLLCorner(): Vertex { return this.llCorner(this.getPaper()) }
	// globalLRCorner(): Vertex { return this.lrCorner(this.getPaper()) }
	// globalMidX(): number { return this.midX(this.getPaper()) }
	// globalMidY(): number { return this.midY(this.getPaper()) }
	// globalLeftCenter(): Vertex { return this.leftCenter(this.getPaper()) }
	// globalRightCenter(): Vertex { return this.rightCenter(this.getPaper()) }
	// globalTopCenter(): Vertex { return this.topCenter(this.getPaper()) }
	// globalBottomCenter(): Vertex { return this.bottomCenter(this.getPaper()) }
	// globalCenter(): Vertex { return this.center(this.getPaper()) }

	// globalAnchor(): Vertex { return this.parent.globalTransform().appliedTo(this.anchor) }


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

}



export class VMobject extends Mobject {

	svg: SVGSVGElement
	path: SVGElement // child of view
	vertices: Array<Vertex>

	constructor(argsDict: object = {}) {
		super()
		this.vertices = []
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		this.svg['mobject'] = this
		this.path['mobject'] = this
		this.view.appendChild(this.svg) // why not just add?
		this.svg.appendChild(this.path)
		this.view.setAttribute('class', this.constructor.name + " mobject-div")
		this.svg.setAttribute('class', "mobject-svg")
		this.svg.style.overflow = 'visible'
		this.setAttributes({
			fillColor: Color.white(),
			fillOpacity: 0.5,
			strokeColor: Color.white(),
			strokeWidth: 1
		})
		this.update(argsDict)
	}

	redraw() {
		if (!this.anchor || this.anchor.isNaN()) { return }
		this.positionView()
		if (this.path == undefined) { return }
		let pathString: string = this.pathString()
		if (pathString.includes("NaN")) { return }
		this.path.setAttribute('d', pathString)
		try {
			this.path.style['fill'] = this.fillColor.toHex()
			this.path.style['fill-opacity'] = this.fillOpacity.toString()
			this.path.style['stroke'] = this.strokeColor.toHex()
			this.path.style['stroke-width'] = this.strokeWidth.toString()
			this.redrawSubmobs()
		} catch {}
	}

	pathString(): string {
		console.warn('please subclass pathString')
		return ''
	}

	relativeVertices(frame?: Mobject): Array<Vertex> {
		let returnValue: Array<Vertex> = this.relativeTransform(frame).appliedToVertices(this.vertices)
		if (returnValue == undefined) { return [] }
		else { return returnValue }
	}

	globalVertices(): Array<Vertex> {
		return this.relativeVertices() // uses default frame = paper
	}


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

	// update(argsDict: object = {}, redraw = true) {
	// 	super.update(argsDict, redraw)
	// 	try {
	// 		this.svg.style.width = (this.localXMax() - this.localXMin()).toString() + 'px'
	// 		this.svg.style.height = (this.localYMax() - this.localYMin()).toString() + 'px'
	// 	} catch {}
	// }
}








export class Polygon extends VMobject {

	closed: boolean = true

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

	_bezierPoints: Array<Vertex>

	updateBezierPoints() { }
	// implemented by subclasses

	update(argsDict: object = {}, redraw = true) {
		super.update(argsDict, redraw)
		this.updateBezierPoints()
	}

	// globalBezierPoints(): Array<Vertex> {
	// 	return this.globalTransform().appliedTo(this.bezierPoints)
	// }

	redraw() {
		this.updateBezierPoints()
		super.redraw()
	}

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
	textView: SVGTextElement
	textAnchor: string
	textAlign: string
	color: Color

	constructor(argsDict: object = {}) {
		super()
		this.setAttributes({
			text: '',
			textAnchor: 'middle',
			textAlign: 'center',
			color: Color.white()
		})
		this.view.setAttribute('class', this.constructor.name + ' unselectable')
		this.view.setAttribute('x', '0')
		this.view.setAttribute('y', '0')
		this.textView = document.createElementNS('http://www.w3.org/2000/svg', 'text')
		this.textView['mobject'] = this
		this.textView.setAttribute('alignment-baseline', 'middle')
		this.textView.setAttribute('font-family', 'Helvetica')
		this.textView.setAttribute('font-size', '12')
		this.textView.setAttribute('stroke-width', '0')
		this.update(argsDict)
	}

	redraw() {
		if (this.anchor.isNaN()) { return }
		if (this.color == undefined) { this.color = Color.white() }
		if (this.textView) { this.textView.textContent = this.text }
		if (this.view) {
			//this.view.setAttribute('x', this.globalTransform().e.toString())
			//this.view.setAttribute('y', this.globalTransform().f.toString())
			this.view.setAttribute('x', this.anchor.toString())
			this.view.setAttribute('y', this.anchor.toString())
			this.view.setAttribute('fill', this.color.toHex())
			this.view.setAttribute('stroke', this.color.toHex())
		}
		
		this.redrawSubmobs()
	}

	update(argsDict = {}, redraw = true) {
		if (this.textView) {
			this.textView.setAttribute('text-anchor', this.textAnchor)
			this.textView.setAttribute('text-align', this.textAlign)
		}
		super.update(argsDict, redraw)
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











