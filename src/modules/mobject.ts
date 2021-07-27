import { Vertex, Transform } from './vertex-transform'
import { Color } from './color'
import { Dependency } from './dependency'
import { ExtendedObject } from './extended-object'
import { remove, stringFromPoint, pointerEventVertex, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, LocatedEvent, paperLog, DRAW_BORDER } from './helpers'


export class Mobject extends ExtendedObject {

	// position and hierarchy
	transform: Transform
	_parent?: Mobject
	viewWidth: number
	viewHeight: number
	children: Array<Mobject>

	// view and style
	view?: HTMLDivElement
	visible: boolean
	opacity: number
	backgroundColor: Color
	drawBorder: boolean

	// dependency
	dependencies: Array<Dependency>

	// interactivity
	eventTarget?: Mobject
	vetoOnStopPropagation: boolean
	interactive: boolean
	passAlongEvents: boolean // to event target
	previousPassAlongEvents?: boolean // stored copy while temporarily set to false when draggable
	draggable: boolean // by outside forces, that is (FreePoints drag themselves, as that is their method of interaction)
	snappablePoints: Array<any> // workaround, don't ask
	dragPointStart?: Vertex
	dragAnchorStart?: Vertex


	constructor(argsDict: object = {}, superCall = false) {
		super({}, true)

		let initialArgs = this.defaultArgs()
		Object.assign(initialArgs, argsDict)
		Object.assign(initialArgs, this.fixedArgs())

		this.statelessSetup()
		//// updating
		if (!superCall) {
			this.setAttributes(initialArgs)
			this.statefulSetup()
			this.update()
		}
	}

	defaultArgs(): object {
		return {
			transform: Transform.identity(),
			viewWidth: 100,
			viewHeight: 100,
			children: [],

			visible: true,
			opacity: 1.0,
			backgroundColor: Color.clear(),
			drawBorder: DRAW_BORDER,

			dependencies: [],

			interactive: false,
			vetoOnStopPropagation: false,
			passAlongEvents: true,
			draggable: false,
			snappablePoints: [],

			view: document.createElement('div')
		}
	}

	fixedArgs(): object {
		return {}
	}


	statelessSetup() {
		//// state-independent setup

		this.eventTarget = null
		this.boundPointerDown = this.pointerDown.bind(this)
		this.boundPointerMove = this.pointerMove.bind(this)
		this.boundPointerUp = this.pointerUp.bind(this)
		this.boundEventTargetMobject = this.eventTargetMobject.bind(this)
		//this.boundUpdate = this.update.bind(this)
		
		this.savedSelfHandlePointerDown = this.selfHandlePointerDown
		this.savedSelfHandlePointerMove = this.selfHandlePointerMove
		this.savedSelfHandlePointerUp = this.selfHandlePointerUp

		this.disableDragging()

		// this.boundCreatePopover = this.createPopover.bind(this)
		// this.boundDismissPopover = this.dismissPopover.bind(this)
		// this.boundMouseUpAfterCreatingPopover = this.mouseUpAfterCreatingPopover.bind(this)


	}

	statefulSetup() {
		this.setupView()
		addPointerDown(this.view, this.boundPointerDown)
	}

	// position and hierarchy

	get anchor(): Vertex {
		return this.transform.anchor
	}

	set anchor(newValue: Vertex) {
		if (!this.transform) {
			this.transform = Transform.identity()
		}
		this.transform.anchor = newValue
	}

	centerAt(newCenter: Vertex, frame?: Mobject) {
		// If there is no frame, use the parent's coordinate frame. If there is no parent yet, use local coordinates
		frame = frame || this.parent || this
		let dr: Vertex = newCenter.subtract(this.center(frame))
		let oldAnchor: Vertex = this.anchor.copy()
		this.anchor = this.anchor.translatedBy(dr[0], dr[1])
	}


	relativeTransform(frame?: Mobject): Transform {
		// If there is no frame, use the parent's coordinate frame. If there is no parent yet, use local coordinates
		frame = frame || this.parent || this
		let t = Transform.identity()
		let mob: Mobject = this
		while (mob && mob.transform instanceof Transform) {
			if (mob == frame) { break }
			t.leftComposeWith(new Transform({ shift: mob.anchor }))
			t.leftComposeWith(mob.transform)
			mob = mob.parent
		}
		return t
	}

	transformLocalPoint(point: Vertex, frame?: Mobject): Vertex {
		let t = this.relativeTransform(frame)
		return t.appliedTo(point)

	}

	// The following geometric properties are first computed from the view frame.
	// The versions without "view" in the name can be overriden by subclasses,
	// e. g. SVGMobjects.

	viewULCorner(frame?: Mobject): Vertex {
		return this.transformLocalPoint(Vertex.origin(), frame)
	}

	viewURCorner(frame?: Mobject): Vertex {
		return this.transformLocalPoint(new Vertex(this.viewWidth, 0), frame)
	}

	viewLLCorner(frame?: Mobject): Vertex {
		return this.transformLocalPoint(new Vertex(0, this.viewHeight), frame)
	}

	viewLRCorner(frame?: Mobject): Vertex {
		return this.transformLocalPoint(new Vertex(this.viewWidth, this.viewHeight), frame)
	}

	viewXMin(frame?: Mobject): number { return this.viewULCorner(frame).x }
	viewXMax(frame?: Mobject): number { return this.viewLRCorner(frame).x }
	viewYMin(frame?: Mobject): number { return this.viewULCorner(frame).y }
	viewYMax(frame?: Mobject): number { return this.viewLRCorner(frame).y }

	viewCenter(frame?: Mobject): Vertex {
		return this.transformLocalPoint(new Vertex(this.viewWidth/2, this.viewHeight/2), frame)
	}

	viewMidX(frame?: Mobject): number { return this.viewCenter(frame).x }
	viewMidY(frame?: Mobject): number { return this.viewCenter(frame).y }

	viewLeftCenter(frame?: Mobject): Vertex { return new Vertex(this.viewXMin(frame), this.viewMidY(frame)) }
	viewRightCenter(frame?: Mobject): Vertex { return new Vertex(this.viewXMax(frame), this.viewMidY(frame)) }
	viewTopCenter(frame?: Mobject): Vertex { return new Vertex(this.viewMidX(frame), this.viewYMin(frame)) }
	viewBottomCenter(frame?: Mobject): Vertex { return new Vertex(this.viewMidX(frame), this.viewYMax(frame)) }

	// Equivalent (by default) versions without "view" in the name

	ulCorner(frame?: Mobject): Vertex { return this.viewULCorner(frame) }
	urCorner(frame?: Mobject): Vertex { return this.viewURCorner(frame) }
	llCorner(frame?: Mobject): Vertex { return this.viewLLCorner(frame) }
	lrCorner(frame?: Mobject): Vertex { return this.viewLRCorner(frame) }

	xMin(frame?: Mobject): number { return this.viewXMin(frame) }
	xMax(frame?: Mobject): number { return this.viewXMax(frame) }
	yMin(frame?: Mobject): number { return this.viewYMin(frame) }
	yMax(frame?: Mobject): number { return this.viewYMax(frame) }

	center(frame?: Mobject): Vertex { return this.viewCenter(frame) }

	midX(frame?: Mobject): number { return this.viewMidX(frame) }
	midY(frame?: Mobject): number { return this.viewMidY(frame) }

	leftCenter(frame?: Mobject): Vertex { return this.viewLeftCenter(frame) }
	rightCenter(frame?: Mobject): Vertex { return this.viewRightCenter(frame) }
	topCenter(frame?: Mobject): Vertex { return this.viewTopCenter(frame) }
	bottomCenter(frame?: Mobject): Vertex { return this.viewBottomCenter(frame) }

	// Local versions (relative to own coordinate system)

	localULCorner(): Vertex { return this.ulCorner(this) }
	localURCorner(): Vertex { return this.urCorner(this) }
	localLLCorner(): Vertex { return this.llCorner(this) }
	localLRCorner(): Vertex { return this.lrCorner(this) }

	localXMin(): number { return this.xMin(this) }
	localXMax(): number { return this.xMax(this) }
	localYMin(): number { return this.yMin(this) }
	localYMax(): number { return this.yMax(this) }

	localCenter(): Vertex { return this.center(this) }

	localMidX(): number { return this.midX(this) }
	localMidY(): number { return this.midY(this) }

	localLeftCenter(): Vertex { return this.leftCenter(this) }
	localRightCenter(): Vertex { return this.rightCenter(this) }
	localTopCenter(): Vertex { return this.topCenter(this) }
	localBottomCenter(): Vertex { return this.bottomCenter(this) }






	get superMobject(): Mobject { return this.parent }
	set superMobject(newValue: Mobject) { this.parent = newValue }

	// move to update?
	get parent(): Mobject { return this._parent }
	set parent(newValue: Mobject) {
		this.view?.remove()
		this._parent = newValue
		if (newValue == undefined) { return }
		newValue.add(this)
		if (this.parent.visible) { this.show() }
		else { this.hide() }
	}


	get submobjects(): Array<Mobject> { return this.children }
	set submobjects(newValue: Array<Mobject>) {
		this.children = newValue
	}

	get submobs(): Array<Mobject> { return this.submobjects }
	set submobs(newValue: Array<Mobject>) {
		this.submobs = newValue
	}



	// view and style


	setupView() {

		this.view['mobject'] = this
		if (this.superMobject) {
			this.superMobject.view.appendChild(this.view)
		}
		addPointerDown(this.view, this.boundPointerDown) // TODO: move
		//this.positionView()

		this.view.setAttribute('class', 'mobject-div ' + this.constructor.name)
		this.view.style.transformOrigin = 'top left'
		this.view.style.position = 'absolute' // 'absolute' positions it relative (sic) to its parent
		this.view.style.overflow = 'visible'
	}

	positionView() {
		if (!this.view) { return }
		this.view.style.border = this.drawBorder ? '1px dashed green' : 'none'
		this.view.style['transform'] = this.transform.asString()
		this.view.style['width'] = this.viewWidth.toString() + 'px'
		this.view.style['height'] = this.viewHeight.toString() + 'px'
		if (this.anchor != undefined) {
			this.view.style['left'] = this.anchor.x.toString() + 'px'
			this.view.style['top'] = this.anchor.y.toString() + 'px'
		}
	}

	add(submob: Mobject) {
		if (submob.parent != this) { submob.parent = this }
		if (this.children == undefined) {
			console.error(`Please add submob ${submob.constructor.name} to ${this.constructor.name} later, in statefulSetup()`)
		}
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

	redrawSelf() { }

	redrawSubmobs() {
		for (let submob of this.children || []) {
			submob.redraw()
		}
	}

	redraw(recursive = true) {
		try {
			if (!this.view) { return }
			this.positionView()
			this.view.style['background-color'] = this.backgroundColor.toCSS()
			//if (!this.visible || !this.parent) { return }
			this.redrawSelf()
			if (recursive) { this.redrawSubmobs() }
		} catch {
			console.warn(`Unsuccessfully tried to draw ${this.constructor.name} (too soon?)`)
		}
	}


	getPaper(): Mobject {
		let p: Mobject = this
		while (p != undefined && p.constructor.name != 'Paper') {
			p = p.parent
		}
		return p
	}




	show() {
		try {
			if (!this.view) { return }
			this.visible = true
			this.view.style["visibility"] = "visible"
			for (let submob of this.children) { submob.show() } // we have to propagate visibility bc we have to for invisibility
			this.redraw()
		} catch {
			console.warn(`Unsuccessfully tried to show ${this.constructor.name} (too soon?)`)
		}
	}

	hide() {
		try {
			if (!this.view) { return }
			this.visible = false
			this.view.style["visibility"] = "hidden"
			for (let submob of this.children) { submob.hide() } // we have to propagate invisibility
			this.redraw()
		} catch {
			console.warn(`Unsuccessfully tried to hide ${this.constructor.name} (too soon?)`)
		}
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





	// dependency

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

	initialUpdate(argsDict: object = {}, superCall = false) {
		if (superCall) {
			this.setAttributes(argsDict)
		} else {
			this.update(argsDict)
		}
	}

	updateModel(argsDict: object = {}) {

		this.setAttributes(argsDict)
		//this.positionView()
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

	}

	update(argsDict: object = {}, redraw = true) {
		this.updateModel(argsDict)

		if (redraw) {
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





	// interactivity

	// empty method as workaround (don't ask)
	removeFreePoint(fp: any) { }

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


	enableDragging() {
		this.previousPassAlongEvents = this.passAlongEvents
		this.passAlongEvents = false
		this.savedSelfHandlePointerDown = this.selfHandlePointerDown
		this.savedSelfHandlePointerMove = this.selfHandlePointerMove
		this.savedSelfHandlePointerUp = this.selfHandlePointerUp
		this.selfHandlePointerDown = this.startSelfDragging
		this.selfHandlePointerMove = this.selfDragging
		this.selfHandlePointerUp = this.endSelfDragging
	}

	disableDragging() {
		if (this.previousPassAlongEvents != undefined) {
			this.passAlongEvents = this.previousPassAlongEvents
		}
		this.selfHandlePointerDown = this.savedSelfHandlePointerDown
		this.selfHandlePointerMove = this.savedSelfHandlePointerMove
		this.selfHandlePointerUp = this.savedSelfHandlePointerUp
	}

	eventTargetMobject(e: LocatedEvent): Mobject {
		var t: Element = e.target as Element
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
				let r: Mobject = t['mobject']
				//console.log('event target mob:', r)
				return r
			}
			t = targetViewChain.pop()
		}
		// if all of this fails, you need to handle the event yourself
		//console.log('event target mob:', this)
		return this
	}

	pointerDown(e: LocatedEvent) {
		this.eventTarget = this.boundEventTargetMobject(e)
		if (this.eventTarget.vetoOnStopPropagation) { return }

		e.stopPropagation()
		removePointerDown(this.view, this.boundPointerDown)
		addPointerMove(this.view, this.boundPointerMove)
		addPointerUp(this.view, this.boundPointerUp)

		//console.log('event target on ', this, 'is', this.eventTarget)
		if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
			//console.log('passing on')
			this.eventTarget.pointerDown(e)
		} else {
			//console.log(`handling myself, and I am a ${this.constructor.name}`)
			this.selfHandlePointerDown(e)
		}
	}

	pointerMove(e: LocatedEvent) {
		//console.log(this, "event target:", this.eventTarget)
		if (this.eventTarget.vetoOnStopPropagation) { return }
		e.stopPropagation()

		if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
			//console.log("passing on")
			this.eventTarget.pointerMove(e)
		} else {
			//console.log(`handling myself, and I am a ${this.constructor.name}`)
			this.selfHandlePointerMove(e)
		}
	}

	pointerUp(e: LocatedEvent) {
		if (this.eventTarget.vetoOnStopPropagation) { return }

		e.stopPropagation()
		removePointerMove(this.view, this.boundPointerMove)
		removePointerUp(this.view, this.boundPointerUp)
		addPointerDown(this.view, this.boundPointerDown)

		if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
			this.eventTarget.pointerUp(e)
		} else {
			this.selfHandlePointerUp(e)
		}
		this.eventTarget = null
	}


	startSelfDragging(e: LocatedEvent) {
		this.dragPointStart = pointerEventVertex(e)
		this.dragAnchorStart = this.anchor
	}

	selfDragging(e: LocatedEvent) {
		console.log('selfDragging')
		let dragPoint: Vertex = pointerEventVertex(e)
		let dr: Vertex = dragPoint.subtract(this.dragPointStart)
		
		this.update({
			anchor: this.dragAnchorStart.add(dr)
		}, true)
	}

	endSelfDragging(e: LocatedEvent) {
		this.dragPointStart = undefined
		this.dragAnchorStart = undefined
	}


}



export class MGroup extends Mobject {

	statefulSetup() {
		super.statefulSetup()
		// children may have been set as a constructor args
		for (let submob of this.children) {
			this.add(submob)
		}
	}

}




export class VMobject extends Mobject {

	svg: SVGSVGElement
	path: SVGElement // child of view
	vertices: Array<Vertex>

	fillColor: Color
	fillOpacity: number
	strokeColor: Color
	strokeWidth: number


	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			fillColor: Color.white(),
			fillOpacity: 0,
			strokeColor: Color.white(),
			strokeWidth: 1,
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.vertices = []
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		this.svg['mobject'] = this
		this.path['mobject'] = this
		this.svg.appendChild(this.path)
		this.svg.setAttribute('class', 'mobject-svg')
		this.svg.style.overflow = 'visible'
	}

	statefulSetup() {
		super.statefulSetup()
		this.view.appendChild(this.svg) // why not just add?
		this.view.setAttribute('class', this.constructor.name + ' mobject-div')
	}

	redrawSelf() {
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

	localULCorner(): Vertex {
		return new Vertex(this.localXMin(), this.localYMin())
	}

	getWidth(): number { return this.localXMax() - this.localXMin() }
	getHeight(): number { return this.localYMax() - this.localYMin() }

	adjustFrame() {
		let shift = new Transform({ shift: this.localULCorner() })
		let inverseShift = shift.inverse()
		let updateDict: object = {}
		for (let [key, value] of Object.entries(this)) {
			var newValue: any
			if (value instanceof Vertex) {
				newValue = inverseShift.appliedTo(value)
			} else if (value instanceof Array && value.length > 0) {
				newValue = []
				if (!(value[0] instanceof Vertex)) { continue }
				for (let v of value) {
					newValue.push(inverseShift.appliedTo(v))
				}
			} else {
				continue
			}
			updateDict[key] = newValue
		}

		updateDict['anchor'] = shift.appliedTo(this.anchor)
		updateDict['viewWidth'] = this.getWidth()
		updateDict['viewHeight'] = this.getHeight()
		console.log(updateDict)
		this.update(updateDict)

	}
}








export class Polygon extends VMobject {

	closed: boolean

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			closed: true
		})
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

	_bezierPoints: Array<Vertex>

	updateBezierPoints() { }
	// implemented by subclasses

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		this.updateBezierPoints()
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
	horizontalAlign: string // 'left' | 'center' | 'right'
	verticalAlign: string // 'top' | 'center' | 'bottom'
	color?: Color


	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			text: 'text',
			horizontalAlign: 'center',
			verticalAlign: 'center',
			color: Color.white()
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.view.setAttribute('class', this.constructor.name + ' unselectable mobject-div')
		this.view.style.display = 'flex'
		this.view.style.fontFamily = 'Helvetica'
		this.view.style.fontSize = '10px'
	}

	redrawSelf() {
		if (this.anchor.isNaN()) { return }
		if (this.color == undefined) { this.color = Color.white() }
		super.redrawSelf()
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)

		//// internal dependencies
		this.view.innerHTML = this.text
		this.view.style.color = (this.color ?? Color.white()).toHex()
		switch (this.verticalAlign) {
		case 'top':
			this.view.style.alignItems = 'flex-start'
			break
		case 'center':
			this.view.style.alignItems = 'center'
			break
		case 'bottom':
			this.view.style.alignItems = 'flex-end'
			break
		}
		switch (this.horizontalAlign) {
		case 'left':
			this.view.style.justifyContent = 'flex-start'
			break
		case 'center':
			this.view.style.justifyContent = 'center'
			break
		case 'right':
			this.view.style.justifyContent = 'flex-end'
			break
		}

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











