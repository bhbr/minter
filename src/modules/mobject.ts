import { Vertex, Transform } from './vertex-transform'
import { Color } from './color'
import { Dependency } from './dependency'
import { Frame } from './frame'
import { pointerEventVertex, LocatedEvent, EventHandlingMode } from './helpers'
import { DRAW_BORDER, paperLog } from './helpers'
import { addPointerDown, removePointerDown } from './helpers'
import { addPointerMove, removePointerMove } from './helpers'
import { addPointerUp, removePointerUp } from './helpers'

export class Mobject extends Frame {

	_parent?: Mobject = null
	children: Array<Mobject> = []

	// view and style
	readonly view: HTMLDivElement = document.createElement('div')
	visible = true
	opacity = 1
	backgroundColor = Color.clear()
	drawBorder = DRAW_BORDER

	// dependency
	dependencies: Array<Dependency> = []

	// interactivity
	eventTarget?: Mobject = null
	eventHandlingMode: EventHandlingMode = "parent"
	previousEventHandlingMode?: EventHandlingMode = null
	draggable: boolean = false
	dragPointStart?: Vertex = null
	dragAnchorStart?: Vertex = null


	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			if (args['view'] !== undefined) {
				if (args['view'] instanceof HTMLDivElement) {
					this.view = args['view']
				} else {
					console.error("Only HTMLDivElements can be a Mobject's view")
				}
			}
			this.setup()
			this.update(args)
		}
	}


	// hierarchy //

	get superMobject(): Mobject { return this.parent }
	set superMobject(newValue: Mobject) { this.parent = newValue }

	get parent(): Mobject { return this._parent }
	set parent(newParent: Mobject) {
		this.view?.remove()
		this._parent = newParent
		if (newParent == null) { return }
		newParent.add(this)
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

	add(child: Mobject) {
		super.add(child)
		this.view.appendChild(child.view)
		child.update()
	}

	remove(child: Mobject) {
		child.view.remove()
		super.remove(child)
	}


	getPaper(): Mobject {
		let p: Mobject = this
		while (p != undefined && p.constructor.name != 'Paper') {
			p = p.parent
		}
		return p
	}




	// setup //

	setup() {
		this.setupView()
		this.setupTouches()
	}

	setupView() {
		this.view['mobject'] = this
		if (this.superMobject) {
			this.superMobject.view.appendChild(this.view)
		}

		this.view.setAttribute('class', 'mobject-div ' + this.constructor.name)
		this.view.style.transformOrigin = `${this.transformOrigin[1]} ${this.transformOrigin[0]}` // 'top left' etc.
		this.view.style.position = 'absolute' // 'absolute' positions it relative (sic) to its parent
		this.view.style.overflow = 'visible'
		this.view.style.border = this.drawBorder ? '1px dashed green' : 'none'
	}

	tearDownView() {
		if (!this.view) { return }
		if (this.superMobject) { this.superMobject.view.removeChild(this.view) }
		removePointerDown(this.view, this.boundPointerDown)
	}


	setupTouches() {
		this.eventTarget = null
		this.boundPointerDown = this.pointerDown.bind(this)
		this.boundPointerMove = this.pointerMove.bind(this)
		this.boundPointerUp = this.pointerUp.bind(this)
		this.boundLowestTargetedMobject = this.lowestTargetedMobject.bind(this)
		
		this.savedSelfHandlePointerDown = this.selfHandlePointerDown
		this.savedSelfHandlePointerMove = this.selfHandlePointerMove
		this.savedSelfHandlePointerUp = this.selfHandlePointerUp

		this.view.style['pointer-events'] = (this.eventHandlingMode == "background") ? "none" : "auto"

		addPointerDown(this.view, this.boundPointerDown)

	}

	// updating //

	update(args = {}, redraw = true) {
		this.updateSelf(args, redraw)
		this.updateSubmobs(redraw)
		this.updateDependents(redraw)
	}

	updateSelf(args = {}, redraw = true) {
		if (args['view'] !== undefined) { this.tearDownView() }
		this.setAttributes(args)
		if (args['view'] !== undefined) {
			this.setup()
		}
		if (redraw) { this.redrawSelf() }
	}

	updateSubmobs(redraw = true) {
		for (let submob of this.submobs || []) {
			if (!this.dependsOn(submob)) { // prevent dependency loops
				submob.update({}, redraw)
			}
		}
	}

	updateDependents(redraw = true) {
		for (let dep of this.dependencies || []) {
			let outputValue: any = this[dep.outputName] // may be undefined
			if (typeof outputValue === 'function') {
				dep.target[dep.inputName] = outputValue.bind(this)()
			} else if (outputValue !== undefined && outputValue !== null) {
				dep.target[dep.inputName] = outputValue
			}
			dep.target.update({}, redraw)
		}
	}

	redrawSelf() {
		this.view.style['left'] = this.anchor.x.toString() + 'px'
		this.view.style['top'] = this.anchor.y.toString() + 'px'

		this.view.style['transform'] = this.transform.asString()
		this.view.style['width'] = this.viewWidth.toString() + 'px'
		this.view.style['height'] = this.viewHeight.toString() + 'px'

		this.view.style['background-color'] = this.backgroundColor.toCSS()
		this.view.style['visibility'] = this.visible ? 'visible' : 'hidden'
	}


	// view and style //

	show() {
		if (this.visible) { return }
		this.redrawSelf()
		this.visible = true
		this.view.style['visibility'] = 'visible'
		for (let submob of this.children) { submob.show() } // we have to propagate visibility bc we have to for invisibility
	}

	hide() {
		if (!this.visible) { return }
		this.visible = false
		this.view.style['visibility'] = 'hidden'
		for (let submob of this.children) { submob.hide() } // we have to propagate visibility bc we have to for invisibility
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


	adjustFrame(recursive = true) {
		if (recursive) {
			for (let submob of this.submobjects) {
				submob.adjustFrame(true)
			}
		}

		let v = this.localExtentULCorner()
		let shift = new Transform({ shift: v })
		let inverseShift = shift.inverse()
		let updateDict: object = {}
		for (let [key, value] of Object.entries(this)) {
			var newValue: any
			if (value instanceof Vertex && key != 'anchor') {
				newValue = inverseShift.appliedTo(value)
			} else if (value instanceof Array && value.length > 0 && value[0] instanceof Vertex) {
				newValue = inverseShift.appliedToVertices(value)
			} else if (value instanceof Mobject && value != this.superMobject && !this.submobjects.includes(value)) {
				// "unregistered" submobs, registered ones are handled below
				value.update({
					anchor: inverseShift.appliedTo(value.anchor)
				})
			} else {
				continue
			}
			updateDict[key] = newValue
		}

		for (let submob of this.submobjects) {
			let newAnchor = inverseShift.appliedTo(submob.anchor)
			submob.update({
				anchor: newAnchor
			})
		}

		if (this.superMobject) {
			updateDict['anchor'] = shift.appliedTo(this.anchor)
		}
		updateDict['viewWidth'] = this.getWidth()
		updateDict['viewHeight'] = this.getHeight()
		this.update(updateDict)

	}






	// dependencies //

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


	// event targets //

	targetViewChain(e: LocatedEvent): Array<Element> {
		var t: Element = e.target as Element
		console.log(t.tagName)
		if (t.tagName == 'path') { t = t.parentElement.parentElement }
		if (t.tagName == 'CANVAS') { t = t.parentElement }
		if (t == this.view) { return [t] }

		let targetViewChain: Array<Element> = [t]
		while (t != undefined && t != this.view) {
			t = t.parentElement
			targetViewChain.push(t)
		}

		return targetViewChain.reverse()
	}

	targetMobjectChain(e: LocatedEvent): Array<Mobject> {
		let viewChain = this.targetViewChain(e)
		let mobjectChain: Array<Mobject> = []
		for (let view of viewChain) {
			let mob = view['mobject']
			if (mob != undefined) { mobjectChain.push(mob) }
		}
		return mobjectChain
	}

	targetedChild(e: LocatedEvent): Mobject | undefined {
		let chain = this.targetMobjectChain(e)
		return chain[1] ?? null
	}

	lowestTargetedMobject(e: LocatedEvent): Mobject | undefined {
		let chain = this.targetMobjectChain(e)
		return chain.pop() ?? null
	}



	// interactivity //

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
	boundLowestTargetedMobject(e: LocatedEvent): Mobject { return this }

	pointerDown(e: LocatedEvent) {

		if (this.draggable) {
			e.stopPropagation()
			this.startSelfDragging(e)
			return
		}

		this.eventTarget = this.boundLowestTargetedMobject(e)
		console.log('event target on ', this, 'is', this.eventTarget)
		if (this.eventTarget.eventHandlingMode == "auto" && !this.eventTarget.draggable) { return }
		e.stopPropagation()

		removePointerDown(this.view, this.boundPointerDown)
		addPointerMove(this.view, this.boundPointerMove)
		addPointerUp(this.view, this.boundPointerUp)

		if (this.eventHandlingMode == "self") {
			console.log(`handling myself, and I am a ${this.constructor.name}`)
			this.eventTarget = this
			this.selfHandlePointerDown(e)
		} else if (this.eventHandlingMode == "child") {
			console.log(`trying to pass to a child`)
			if (this.eventTarget == this) {
				console.log(`no luck, I (a ${this.constructor.name}) have to handle this myself`)
				this.selfHandlePointerDown(e)
			} else {
				console.log('found one')
				this.eventTarget = this.targetedChild(e) ?? this
				console.log(this.eventTarget)
				if (this.eventTarget.draggable) {
					this.eventTarget.startSelfDragging(e)
					return
				}
				let th = this.eventTarget.eventHandlingMode
				if (th == "self" || th == "child") {
					console.log(`passing event down to a ${this.eventTarget.constructor.name}`)
					this.eventTarget.pointerDown(e)
				} else if (th == "parent") {
					console.log(`no luck, the child (a ${this.eventTarget.constructor.name}) can't handle it`)
					this.eventTarget = this
					this.selfHandlePointerDown(e)
				} else {
					console.log(`${this.eventHandlingMode} `)
					console.error(`eventHandlingMode badly set on my child, a ${this.eventTarget.constructor.name}`)
				}
			}
		} else {
			console.log(`${this.eventHandlingMode} `)
			console.error(`eventHandlingMode badly set on myself, a ${this.constructor.name}`)
		}
	}

	pointerMove(e: LocatedEvent) {
		if (this.eventTarget.draggable) {
			e.stopPropagation()
			this.eventTarget.selfDragging(e)
			return
		}

		console.log(this, "event target:", this.eventTarget)
		if (this.eventHandlingMode == "auto") { return }
		e.stopPropagation()

		if (this.eventTarget == this) { this.selfHandlePointerMove(e) }
		else { this.eventTarget.pointerMove(e) }
	}

	pointerUp(e: LocatedEvent) {
		if (this.eventTarget.draggable) {
			e.stopPropagation()
			this.eventTarget.endSelfDragging(e)
			return
		}

		console.log(this, "event target:", this.eventTarget)
		if (this.eventHandlingMode == "auto") { return }
		e.stopPropagation()

		removePointerMove(this.view, this.boundPointerMove)
		removePointerUp(this.view, this.boundPointerUp)
		addPointerDown(this.view, this.boundPointerDown)

		if (this.eventTarget == this) { this.selfHandlePointerUp(e) }
		else { this.eventTarget.pointerUp(e) }

		this.eventTarget = null
	}


	startSelfDragging(e: LocatedEvent) {
		this.dragPointStart = pointerEventVertex(e)
		this.dragAnchorStart = this.anchor.copy()
	}

	selfDragging(e: LocatedEvent) {
		let dragPoint: Vertex = pointerEventVertex(e)
		let dr: Vertex = dragPoint.subtract(this.dragPointStart)
		this.update({
			anchor: this.dragAnchorStart.add(dr)
		}, true)
	}

	endSelfDragging(e: LocatedEvent) {
		this.dragPointStart = null
		this.dragAnchorStart = null
	}

	// aliases: children -> submobs
	localSubmobXMin(): number { return this.localChildrenXMin() }
	localSubmobMidX(): number { return this.localChildrenMidX() }
	localSubmobXMax(): number { return this.localChildrenXMax() }
	localSubmobYMin(): number { return this.localChildrenYMin() }
	localSubmobMidY(): number { return this.localChildrenMidY() }
	localSubmobYMax(): number { return this.localChildrenYMax() }
	localSubmobULCorner(): Vertex { return this.localChildrenULCorner() }
	localSubmobURCorner(): Vertex { return this.localChildrenURCorner() }
	localSubmobLRCorner(): Vertex { return this.localChildrenLRCorner() }
	localSubmobLLCorner(): Vertex { return this.localChildrenLLCorner() }
	localSubmobCorners(): Array<Vertex> { return this.localChildrenCorners() }
	localSubmobCenter(): Vertex { return this.localChildrenCenter() }
	localSubmobTopCenter(): Vertex { return this.localChildrenTopCenter() }
	localSubmobLeftCenter(): Vertex { return this.localChildrenLeftCenter() }
	localSubmobBottomCenter(): Vertex { return this.localChildrenBottomCenter() }
	localSubmobRightCenter(): Vertex { return this.localChildrenRightCenter() }
	localSubmobOuterCenters(): Array<Vertex> { return this.localChildrenOuterCenters() }
	// transformed versions
	relativeSubmobXMin(frame?: Frame): number { return this.relativeChildrenXMin() }
	relativeSubmobMidX(frame?: Frame): number { return this.relativeChildrenMidX() }
	relativeSubmobXMax(frame?: Frame): number { return this.relativeChildrenXMax() }
	relativeSubmobYMin(frame?: Frame): number { return this.relativeChildrenYMin() }
	relativeSubmobMidY(frame?: Frame): number { return this.relativeChildrenMidY() }
	relativeSubmobYMax(frame?: Frame): number { return this.relativeChildrenYMax() }
	relativeSubmobULCorner(frame?: Frame): Vertex { return this.relativeChildrenULCorner(frame) }
	relativeSubmobURCorner(frame?: Frame): Vertex { return this.relativeChildrenURCorner(frame) }
	relativeSubmobLRCorner(frame?: Frame): Vertex { return this.relativeChildrenLRCorner(frame) }
	relativeSubmobLLCorner(frame?: Frame): Vertex { return this.relativeChildrenLLCorner(frame) }
	relativeSubmobCorners(frame?: Frame): Array<Vertex> { return this.relativeChildrenCorners(frame) }
	relativeSubmobCenter(frame?: Frame): Vertex { return this.relativeChildrenCenter(frame) }
	relativeSubmobTopCenter(frame?: Frame): Vertex { return this.relativeChildrenTopCenter(frame) }
	relativeSubmobRightCenter(frame?: Frame): Vertex { return this.relativeChildrenRightCenter(frame) }
	relativeSubmobBottomCenter(frame?: Frame): Vertex { return this.relativeChildrenBottomCenter(frame) }
	relativeSubmobLeftCenter(frame?: Frame): Vertex { return this.relativeChildrenLeftCenter(frame) }
	relativeSubmobOuterCenters(frame?: Frame): Array<Vertex> { return this.relativeChildrenOuterCenters(frame) }
	// default frame
	submobXMin(): number { return this.childrenXMin() }
	submobMidX(): number { return this.childrenMidX() }
	submobXMax(): number { return this.childrenXMax() }
	submobYMin(): number { return this.childrenYMin() }
	submobMidY(): number { return this.childrenMidY() }
	submobYMax(): number { return this.childrenYMax() }
	submobULCorner(): Vertex { return this.childrenULCorner() }
	submobURCorner(): Vertex { return this.childrenURCorner() }
	submobLRCorner(): Vertex { return this.childrenLRCorner() }
	submobLLCorner(): Vertex { return this.childrenLLCorner() }
	submobCorners(): Array<Vertex> { return this.childrenCorners() }
	submobCenter(): Vertex { return this.childrenCenter() }
	submobTopCenter(): Vertex { return this.childrenTopCenter() }
	submobRightCenter(): Vertex { return this.childrenRightCenter() }
	submobBottomCenter(): Vertex { return this.childrenBottomCenter() }
	submobLeftCenter(): Vertex { return this.childrenLeftCenter() }
	submobOuterCenters(): Array<Vertex> { return this.childrenOuterCenters() }

}



export class MGroup extends Mobject {

	setup() {
		super.setup()
		// children may have been set as a constructor args
		for (let submob of this.children) {
			this.add(submob)
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











