import { remove, stringFromPoint, paperLog } from '../helpers/helpers'
import { PointerEventPolicy, pointerEventVertex, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, LocatedEvent } from './pointer_events'
import { Vertex, Transform } from '../helpers/Vertex_Transform'
import { ExtendedObject } from '../helpers/ExtendedObject'
import { Color } from '../helpers/Color'
import { Dependency } from './Dependency'

export const DRAW_BORDER: boolean = false

export class Mobject extends ExtendedObject {

	// position
	transform: Transform
	viewWidth: number
	viewHeight: number

	// view and style
	view?: HTMLDivElement
	visible: boolean
	opacity: number
	backgroundColor: Color
	drawBorder: boolean

	// hierarchy
	_parent?: Mobject
	children: Array<Mobject>

	// dependency
	dependencies: Array<Dependency>

	// interactivity
	eventTarget?: Mobject
	_pointerEventPolicy: PointerEventPolicy
	savedPointerEventPolicy: PointerEventPolicy
	draggable: boolean
	dragAnchorStart?: Vertex

	snappablePoints: Array<any> // workaround, don't ask
	// remove?


	////////////////////
	// INITIALIZATION //
	////////////////////

	constructor(argsDict: object = {}, isSuperCall = false) {
		super({}, true)

		let initialArgs = this.defaultArgs()
		Object.assign(initialArgs, argsDict)
		Object.assign(initialArgs, this.fixedArgs())

		this.statelessSetup()

		if (!isSuperCall) {
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

			view: document.createElement('div'),
			visible: true,
			opacity: 1.0,
			backgroundColor: Color.clear(),
			drawBorder: DRAW_BORDER,
			dependencies: [],

			pointerEventPolicy: PointerEventPolicy.PassUp,
			snappablePoints: [],
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
		
		this.savedSelfHandlePointerDown = this.selfHandlePointerDown
		this.savedSelfHandlePointerMove = this.selfHandlePointerMove
		this.savedSelfHandlePointerUp = this.selfHandlePointerUp

	}

	statefulSetup() {
		addPointerDown(this.view, this.boundPointerDown)
		this.setupView()
	}


	//////////////
	// POSITION //
	//////////////

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
		let frame_: any = frame || this.parent || this
		let dr: Vertex = newCenter.subtract(this.center(frame_ as this))
		let oldAnchor: Vertex = this.anchor.copy()
		this.anchor = this.anchor.translatedBy(dr[0], dr[1])
	}

	relativeTransform(frame?: Mobject): Transform {
		// If there is no frame, use the parent's coordinate frame. If there is no parent yet, use local coordinates
		let frame_: any = frame || this.parent || this
		let t = Transform.identity()
		let mob: Mobject = this
		while (mob && mob.transform instanceof Transform) {
			if (mob == frame_) { break }
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
	// e. g. VMobjects.

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


	////////////////////
	// VIEW AND STYLE //
	////////////////////

	setupView() {

		this.view['mobject'] = this
		if (this.parent) {
			this.parent.view.appendChild(this.view)
		}

		this.view.setAttribute('class', 'mobject-div ' + this.constructor.name)
		this.view.style.transformOrigin = 'top left'
		this.view.style.position = 'absolute' // 'absolute' positions it relative (sic) to its parent
		this.view.style.overflow = 'visible'

		addPointerDown(this.view, this.boundPointerDown)
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


	///////////////
	// HIERARCHY //
	///////////////

	get parent(): Mobject { return this._parent }
	set parent(newValue: Mobject) {
		this.view?.remove()
		this._parent = newValue
		if (newValue == undefined) { return }
		newValue.add(this)
		if (this.parent.visible) { this.show() }
		else { this.hide() }
	}

	get superMobject(): this { return this.parent as this }
	set superMobject(newValue: this) { this.parent = newValue }

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
		remove(this.children, submob)
		submob.parent = undefined
		submob.view.remove()
	}

	getPaper(): Mobject {
		let p: Mobject = this
		while (p != undefined && p.constructor.name != 'Paper') {
			p = p.parent
		}
		return p
	}


	////////////////
	// DEPENDENCY //
	////////////////

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


	///////////////////
	// INTERACTIVITY //
	///////////////////

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

	get pointerEventPolicy(): PointerEventPolicy {
		return this._pointerEventPolicy
	}

	set pointerEventPolicy(newValue: PointerEventPolicy) {
		this._pointerEventPolicy = newValue
		if (this.view == undefined) { return }
		if (this.pointerEventPolicy == PointerEventPolicy.Transparent) {
			this.view.style['pointer-events'] = 'none'
		} else {
			this.view.style['pointer-events'] = 'auto'
		}
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
		console.log(targetViewChain)
		t = targetViewChain.pop()
		t = targetViewChain.pop()
		while (t != undefined) {
			if (t['mobject'] != undefined) {
				let r: any = t['mobject']
				//console.log('event target mob:', r)
				if (r.constructor.name == 'InteractiveMobject') {
					return r
				}
			}
			t = targetViewChain.pop()
		}
		// if all of this fails, you need to handle the event yourself
		return this
	}

	pointerDown(e: LocatedEvent) {
		this.eventTarget = this.boundEventTargetMobject(e)
		if (this.eventTarget.pointerEventPolicy == PointerEventPolicy.Propagate) { return }

		e.stopPropagation()
		removePointerDown(this.view, this.boundPointerDown)
		addPointerMove(this.view, this.boundPointerMove)
		addPointerUp(this.view, this.boundPointerUp)

		console.log('event target on ', this, 'is', this.eventTarget)
		console.log(this.pointerEventPolicy, this.eventTarget.pointerEventPolicy)
		if (this.eventTarget != this
			&& this.pointerEventPolicy == PointerEventPolicy.PassDown
			&& this.eventTarget.pointerEventPolicy != PointerEventPolicy.PassUp) {
			//console.log('passing down')
			this.eventTarget.pointerDown(e)
		} else {
			//console.log(`handling myself, and I am a ${this.constructor.name}`)
			if (this.draggable) {
				this.startDragging(e)
			} else {
				this.selfHandlePointerDown(e)
			}
		}
	}

	pointerMove(e: LocatedEvent) {
		if (this.eventTarget.pointerEventPolicy == PointerEventPolicy.Propagate) { return }
		e.stopPropagation()

		if (this.eventTarget != this
			&& this.pointerEventPolicy == PointerEventPolicy.PassDown
			&& this.eventTarget.pointerEventPolicy != PointerEventPolicy.PassUp) {
			this.eventTarget.pointerMove(e)
		} else {
			//console.log(`handling myself, and I am a ${this.constructor.name}`)
			if (this.draggable) {
				this.dragging(e)
			} else {
				this.selfHandlePointerMove(e)
			}
		}
	}

	pointerUp(e: LocatedEvent) {
		if (this.eventTarget.pointerEventPolicy == PointerEventPolicy.Propagate) { return }

		e.stopPropagation()
		removePointerMove(this.view, this.boundPointerMove)
		removePointerUp(this.view, this.boundPointerUp)
		addPointerDown(this.view, this.boundPointerDown)

		if (this.eventTarget != this
			&& this.pointerEventPolicy == PointerEventPolicy.PassDown
			&& this.eventTarget.pointerEventPolicy != PointerEventPolicy.PassUp) {
			this.eventTarget.pointerUp(e)
		} else {
			if (this.draggable) {
				this.endDragging(e)
			} else {
				this.selfHandlePointerUp(e)
			}
		}
		this.eventTarget = null
	}


	startDragging(e: LocatedEvent) {
		this.dragAnchorStart = this.anchor.subtract(pointerEventVertex(e))
	}

	dragging(e: LocatedEvent) {
		this.update({
			anchor: pointerEventVertex(e).add(this.dragAnchorStart)
		})
	}

	endDragging(e: LocatedEvent) {
		this.dragAnchorStart = null
	}

}