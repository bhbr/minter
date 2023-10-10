import { remove, stringFromPoint, log, deepCopy, restrictedDict } from '../helpers/helpers'
import { PointerEventPolicy, eventVertex, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, LocatedEvent, eventPageLocation, locatedEventType, LocatedEventType, isTouchDevice } from './pointer_events'
import { Vertex, Transform } from '../helpers/Vertex_Transform'
import { ExtendedObject } from '../helpers/ExtendedObject'
import { Color } from '../helpers/Color'
import { Dependency } from './Dependency'
import { VertexArray } from '../helpers/VertexArray'

export const DRAW_BORDER: boolean = false

export class Mobject extends ExtendedObject {

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
			snappablePoints: []
		}
	}

	fixedArgs(): object {
		return {}
	}

	statelessSetup() {
		// state-independent setup

		this.eventTarget = null
		this.locatedEventHistory = []

		this.boundEventTargetMobject = this.eventTargetMobject.bind(this)
		this.boundCapturedOnPointerDown = this.capturedOnPointerDown.bind(this)
		this.boundCapturedOnPointerMove = this.capturedOnPointerMove.bind(this)
		this.boundCapturedOnPointerUp = this.capturedOnPointerUp.bind(this)
		this.boundRawOnPointerDown = this.rawOnPointerDown.bind(this)
		this.boundRawOnPointerMove = this.rawOnPointerMove.bind(this)
		this.boundRawOnPointerUp = this.rawOnPointerUp.bind(this)
		this.boundOnPointerDown = this.onPointerDown.bind(this)
		this.boundOnPointerMove = this.onPointerMove.bind(this)
		this.boundOnPointerUp = this.onPointerUp.bind(this)
		this.boundOnTap = this.onTap.bind(this)
		this.boundRawOnLongPress = this.rawOnLongPress.bind(this)

		this.savedOnPointerDown = this.onPointerDown
		this.savedOnPointerMove = this.onPointerMove
		this.savedOnPointerUp = this.onPointerUp
	}

	statefulSetup() {
		this.setupView()
		addPointerDown(this.view, this.boundCapturedOnPointerDown)
		addPointerMove(this.view, this.boundCapturedOnPointerMove)
		addPointerUp(this.view, this.boundCapturedOnPointerUp)
	}


	//////////////
	// POSITION //
	//////////////

	transform: Transform
	viewWidth: number
	viewHeight: number

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

	view?: HTMLDivElement
	visible: boolean
	opacity: number
	backgroundColor: Color
	drawBorder: boolean

	setupView() {

		this.view['mobject'] = this
		if (this.parent) {
			this.parent.view.appendChild(this.view)
		}

		this.view.setAttribute('class', 'mobject-div ' + this.constructor.name)
		this.view.style.transformOrigin = 'top left'
		this.view.style.position = 'absolute' // 'absolute' positions it relative (sic) to its parent
		this.view.style.overflow = 'visible'

		//addPointerDown(this.view, this.boundRawOnPointerDown)
	}

	positionView() {
		if (!this.view) { return }
		this.view.style.border = this.drawBorder ? '1px dashed green' : 'none'
		this.view.style['transform'] = this.transform.asString()
		this.view.style['left'] = this.anchor.x.toString() + 'px'
		this.view.style['top'] = this.anchor.y.toString() + 'px'
		this.view.style['width'] = this.viewWidth.toString() + 'px'
		this.view.style['height'] = this.viewHeight.toString() + 'px'
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
			this.view.style['opacity'] = this.opacity.toString()
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
	// ANIMATION //
	///////////////

	interpolationStartCopy: this
	interpolationStopCopy: this
	animationTimeStart: number
	animationDuration: number


	animate(argsDict: object = {}, seconds: number) {
		this.interpolationStartCopy = deepCopy(this)
		this.interpolationStopCopy = deepCopy(this)
		this.interpolationStopCopy.update(argsDict, false)
		let dt = 10
		this.animationTimeStart = Date.now()
		this.animationDuration = seconds
		let animationInterval = window.setInterval(function(){this.updateAnimation(Object.keys(argsDict))}.bind(this), dt)
		window.setTimeout(()=>{window.clearInterval(animationInterval)}, seconds * 1000)
	}

	updateAnimation(keys: Array<string>) {
		let weight = (Date.now() - this.animationTimeStart)/(this.animationDuration * 1000)
		let newArgsDict = this.interpolatedAnimationArgs(keys, weight)
		this.update(newArgsDict)
	}

	interpolatedAnimationArgs(keys: Array<string>, weight: number): object {
		let ret: object = {}
		for (let key of keys) {
			let startValue: any = this.interpolationStartCopy[key]
			let stopValue: any = this.interpolationStopCopy[key]
			if (typeof startValue ==  'number') {
				ret[key] = (1 - weight) * startValue + weight * stopValue
			} else if (startValue instanceof Vertex) {
				ret[key] = startValue.interpolate(stopValue as Vertex, weight)
			} else if (startValue instanceof Transform) {
				ret[key] = startValue.interpolate(stopValue as Transform, weight)
			} else if (startValue instanceof Color) {
				ret[key] = startValue.interpolate(stopValue as Color, weight)
			} else if (startValue instanceof VertexArray) {
				ret[key] = startValue.interpolate(stopValue as VertexArray, weight)
			}
		}
		return ret
	}

	///////////////
	// HIERARCHY //
	///////////////

	_parent?: Mobject
	children: Array<Mobject>

	get parent(): Mobject { return this._parent }
	set parent(newValue: Mobject) {
		try {
			this.view?.remove()
		} catch {
			console.warn('View is not part of body')
		}
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

	dependencies: Array<Dependency>

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

	consolidateTransformAndAnchor(argsDict: object = {}): object {
		let newAnchor: any = argsDict['anchor']
		var newTransform: any = argsDict['transform'] ?? Transform.identity()
		if (newTransform) {
			let nt: Transform = newTransform as Transform
			if (nt.anchor.isZero()) {
				nt.anchor = newAnchor ?? this.anchor
			}
			argsDict['transform'] = newTransform
		} else {
			newTransform = this.transform
			newTransform.anchor = argsDict['anchor'] ?? this.anchor
		}
		delete argsDict['anchor']
		return argsDict
	}

	updateModel(argsDict: object = {}) {

		argsDict = this.consolidateTransformAndAnchor(argsDict)
		this.setAttributes(argsDict)
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

	updateFrom(mob: Mobject, attrs: Array<string>, redraw = true) {
		let updateDict: object = {}
		for (let attr of attrs) {
			updateDict[attr] = mob[attr]
		}
		this.update(updateDict, redraw)
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

	eventTarget?: Mobject
	_pointerEventPolicy: PointerEventPolicy
	savedPointerEventPolicy: PointerEventPolicy
	dragAnchorStart?: Vertex

	snappablePoints: Array<any> // workaround, don't ask
	// remove?

	locatedEventHistory: Array<LocatedEvent>
	timeoutID?: number

	// empty method as workaround (don't ask)
	removeFreePoint(fp: any) { }

	onPointerDown(e: LocatedEvent) {
		log('pointer down on')
		log(this)
	}
	onPointerMove(e: LocatedEvent) {
		//log('pointer move on')
		//log(this)
	}
	onPointerUp(e: LocatedEvent) {
		log('pointer up on')
		log(this)
	}
	onTap(e: LocatedEvent) {
		log('tap on')
		log(this)
	}
	onDoubleTap(e: LocatedEvent) {
		log('double tap on')
		log(this)
	}
	onLongPress(e: LocatedEvent) {
		log('long press on')
		log(this)
	}
	savedOnPointerDown(e: LocatedEvent) { }
	savedOnPointerMove(e: LocatedEvent) { }
	savedOnPointerUp(e: LocatedEvent) { }
	savedOnTap(e: LocatedEvent) { }
	savedOnLongPress(e: LocatedEvent) { }

	boundEventTargetMobject(e: LocatedEvent): Mobject { return this }
	boundCapturedOnPointerDown(e: LocatedEvent) { }
	boundCapturedOnPointerMove(e: LocatedEvent) { }
	boundCapturedOnPointerUp(e: LocatedEvent) { }
	boundRawOnPointerDown(e: LocatedEvent) { }
	boundRawOnPointerMove(e: LocatedEvent) { }
	boundRawOnPointerUp(e: LocatedEvent) { }
	boundRawOnLongPress(e: LocatedEvent) { }
	boundOnPointerDown(e: LocatedEvent) { }
	boundOnPointerMove(e: LocatedEvent) { }
	boundOnPointerUp(e: LocatedEvent) { }
	boundOnTap(e: LocatedEvent) { }

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

	eventTargetMobject(e: LocatedEvent): Mobject | null {
		// find the lowest Mobject willing and allowed to handle the event

		// collect the chain of target views (highest to lowest)
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
		targetViewChain.reverse()
		//log("view chain:")
		//log(targetViewChain)

		let targetMobChain: Array<Mobject> = []
		for (var view of targetViewChain.values()) {
			//log(view)
			let m: any = view['mobject']
			if (m == undefined) { continue }
			let mob: Mobject = m as Mobject
			if (mob.pointerEventPolicy == PointerEventPolicy.PassUp) { break }
			// only consider targets above the first PassUp
			targetMobChain.push(mob)
		}
		//log("target mob chain:")
		//log(targetMobChain)

		var m: any
		while (targetMobChain.length > 0) {
			//log('pop')
			m = targetMobChain.pop()
			//log(m)
			//log(m.pointerEventPolicy)
			//log(PointerEventPolicy.Handle)
			if (m != undefined && m.pointerEventPolicy == PointerEventPolicy.Handle) {
				//log(`event target mobject: ${m.constructor.name}`)
				return m
			}
		}
		// if all of this fails, this mob must handle the event itself
		return null
	}

	capturedOnPointerDown(e: LocatedEvent) {
		this.eventTarget = this.boundEventTargetMobject(e)
		if (this.eventTarget == null) { return }
		if (this.eventTarget.pointerEventPolicy == PointerEventPolicy.Propagate) { return }
		e.stopPropagation()
		this.eventTarget.rawOnPointerDown(e)
	}

	capturedOnPointerMove(e: LocatedEvent) {
		if (this.eventTarget == null) { return }
		if (this.eventTarget.pointerEventPolicy == PointerEventPolicy.Propagate) { return }
		e.stopPropagation()
		this.eventTarget.rawOnPointerMove(e)
	}

	capturedOnPointerUp(e: LocatedEvent) {
		if (this.eventTarget == null) { return }
		if (this.eventTarget.pointerEventPolicy == PointerEventPolicy.Propagate) { return }
		e.stopPropagation()
		this.eventTarget.rawOnPointerUp(e)
		this.eventTarget = null
	}

	registerLocatedEvent(e: LocatedEvent): boolean {
		//log(`registering, ${e.type}, ${e.timeStamp}, ${eventPageLocation(e)}`)
		if (isTouchDevice) {

			let minIndex = Math.max(0, this.locatedEventHistory.length - 5)
			for (var i = minIndex; i < this.locatedEventHistory.length; i++) {
				let e2 = this.locatedEventHistory[i]
				if (eventVertex(e).closeTo(eventVertex(e2), 2)) {
					//log(`same location, ${e.type}, ${e2.type}`)
					if (locatedEventType(e) == locatedEventType(e2)) {
						//log('found a duplicate')
						return false
					}	
				}
			}
			//log('no duplicate')
			this.locatedEventHistory.push(e)
			return true
		} else {
			this.locatedEventHistory.push(e)
			return true
		}
	}

	rawOnPointerDown(e: LocatedEvent) {
		if (!this.registerLocatedEvent(e)) { return }
		//log('rawOnPointerDown down')
		this.onPointerDown(e)
		this.timeoutID = window.setTimeout(this.boundRawOnLongPress, 1000, e)
	}

	rawOnPointerMove(e: LocatedEvent) {
		if (!this.registerLocatedEvent(e)) { return }
		//log('rawOnPointerMove move')
		this.resetTimeout()
		this.onPointerMove(e)
	}

	rawOnPointerUp(e: LocatedEvent) {
		if (!this.registerLocatedEvent(e)) { return }
		//log('rawOnPointerUp up')
		this.resetTimeout()
		this.onPointerUp(e)
		if (this.tapDetected()) {
			this.onTap(e)
		}
		if (this.doubleTapDetected()) {
			this.onDoubleTap(e)
		}
	}

	isTap(e1: LocatedEvent, e2: LocatedEvent, dt: number = 500): boolean {
		return (locatedEventType(e1) == LocatedEventType.Down
			&& locatedEventType(e2) == LocatedEventType.Up
			&& Math.abs(e2.timeStamp - e1.timeStamp) < 500)
	}

	tapDetected(): boolean {
		if (this.locatedEventHistory.length < 2) { return false }
		let e1 = this.locatedEventHistory[this.locatedEventHistory.length - 2]
		let e2 = this.locatedEventHistory[this.locatedEventHistory.length - 1]
		return this.isTap(e1, e2)
	}

	doubleTapDetected(): boolean {
		if (this.locatedEventHistory.length < 4) { return false }
		let e1 = this.locatedEventHistory[this.locatedEventHistory.length - 4]
		let e2 = this.locatedEventHistory[this.locatedEventHistory.length - 3]
		let e3 = this.locatedEventHistory[this.locatedEventHistory.length - 2]
		let e4 = this.locatedEventHistory[this.locatedEventHistory.length - 1]
		return this.isTap(e1, e2) && this.isTap(e3, e4) && this.isTap(e1, e4, 1000)
		
	}

	rawOnLongPress(e: LocatedEvent) {
		this.onLongPress(e)
		this.resetTimeout()
	}

	resetTimeout() {
		if (this.timeoutID) {
			clearTimeout(this.timeoutID)
			this.timeoutID = null
		}

	}

	startDragging(e: LocatedEvent) {
		this.dragAnchorStart = this.anchor.subtract(eventVertex(e))
	}

	dragging(e: LocatedEvent) {
		this.update({
			anchor: eventVertex(e).add(this.dragAnchorStart)
		})
	}

	endDragging(e: LocatedEvent) {
		this.dragAnchorStart = null
	}

	setDragging(draggable: boolean) {
		if (draggable) {
			this.savedOnPointerDown = this.onPointerDown
			this.savedOnPointerMove = this.onPointerMove
			this.savedOnPointerUp = this.onPointerUp
			this.onPointerDown = this.startDragging
			this.onPointerMove = this.dragging
			this.onPointerUp = this.endDragging
		} else {
			this.onPointerDown = this.savedOnPointerDown
			this.onPointerMove = this.savedOnPointerMove
			this.onPointerUp = this.savedOnPointerUp
			this.savedOnPointerDown = (e: LocatedEvent) => { }
			this.savedOnPointerMove = (e: LocatedEvent) => { }
			this.savedOnPointerUp = (e: LocatedEvent) => { }
		}
	}




























}