import { Vertex, Transform } from './vertex-transform'
import { Color } from './color'
import { Dependency } from './dependency'
import { ExtendedObject } from './extended-object'
import { remove, stringFromPoint, pointerEventVertex } from './helpers'
import { addPointerDown, removePointerDown } from './helpers'
import { addPointerMove, removePointerMove } from './helpers'
import { addPointerUp, removePointerUp, LocatedEvent } from './helpers'
import { paperLog, DRAW_BORDER, EVENT_LOGGING } from './helpers'
import { xMin, xMax, yMin, yMax, midX, midY } from './helpers'

type TransformOriginX = "left" | "center" | "right"
type TransformOriginY = "top" | "center" | "bottom"
type TransformOrigin = [TransformOriginY, TransformOriginX]

export class Mobject extends ExtendedObject {

	// position and hierarchy
	anchor = Vertex.origin()
	_transform = Transform.identity()
	readonly transformOrigin: TransformOrigin = ["top", "left"] // to be writable later
	_parent?: Mobject = null
	viewWidth = 200
	viewHeight = 200
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
	vetoOnStopPropagation = false
	interactive: boolean = false
	passAlongEvents = true // to event target
	previousPassAlongEvents?: boolean = null // stored copy while temporarily set to false when draggable
	draggable = false // by outside forces, that is (FreePoints drag themselves, as that is their method of interaction)
	dragPointStart?: Vertex = null
	dragAnchorStart?: Vertex = null


	get transform(): Transform { return this._transform }
	set transform(newTransform: Transform) {
		if (!newTransform.shift.isZero()) {
			console.warn("A Mobject's transform should not have a shift. Adjust the Mobject's anchor instead.")
		}
		this._transform = newTransform
	}

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		this.setupView()
		this.setupTouches()
	}

	tearDownView() {
		if (!this.view) { return }
		if (this.superMobject) { this.superMobject.view.removeChild(this.view) }
		removePointerDown(this.view, this.boundPointerDown)
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

	setupTouches() {
		this.eventTarget = null
		this.boundPointerDown = this.pointerDown.bind(this)
		this.boundPointerMove = this.pointerMove.bind(this)
		this.boundPointerUp = this.pointerUp.bind(this)
		this.boundEventTargetMobject = this.eventTargetMobject.bind(this)
		
		this.savedSelfHandlePointerDown = this.selfHandlePointerDown
		this.savedSelfHandlePointerMove = this.selfHandlePointerMove
		this.savedSelfHandlePointerUp = this.selfHandlePointerUp

		addPointerDown(this.view, this.boundPointerDown)
		this.disableDragging()
	}


	update(args = {}, redraw = true) {
		this.updateSelf(args, redraw)
		this.updateSubmobs(redraw)
		this.updateDependents(redraw)
	}

	updateSelf(args = {}, redraw = true) {
		if (args['view'] !== undefined) { this.tearDownView() }
		this.setAttributes(args)
		if (args['view'] !== undefined) {
			this.setupView()
			this.setupTouches()
		}
		if (redraw) { this.redrawSelf() }
	}

	updateSubmobs(redraw = true) {
		for (let submob of this.children || []) {
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








	centerAt(newCenter: Vertex, frame?: Mobject) {
		// If there is no frame, use the parent's coordinate frame. If there is no parent yet, use local coordinates
		frame = frame || this.parent || this
		let dr: Vertex = newCenter.subtract(this.relativeViewCenter(frame))
		let oldAnchor: Vertex = this.anchor.copy()
		this.anchor = this.anchor.translatedBy(dr[0], dr[1])
	}


	transformRelativeTo(frame?: Mobject): Transform {
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

	localPointRelativeTo(point: Vertex, frame?: Mobject): Vertex {
		let t = this.transformRelativeTo(frame)
		return t.appliedTo(point)
	}


	localViewXMin(): number { return 0 }
	localViewXMax(): number { return this.viewWidth }
	localViewYMin(): number { return 0 }
	localViewYMax(): number { return this.viewHeight }
	localViewMidX(): number { return this.viewWidth/2 }
	localViewMidY(): number { return this.viewHeight/2 }

	localViewULCorner(): Vertex { return new Vertex(this.localViewXMin(), this.localViewYMin()) }
	localViewURCorner(): Vertex { return new Vertex(this.localViewXMax(), this.localViewYMin()) }
	localViewLRCorner(): Vertex { return new Vertex(this.localViewXMax(), this.localViewYMax()) }
	localViewLLCorner(): Vertex { return new Vertex(this.localViewXMin(), this.localViewYMax()) }
	localViewCorners(): Array<Vertex> { return [this.localViewULCorner(), this.localViewURCorner(), this.localViewLRCorner(), this.localViewLLCorner()] }

	localViewCenter(): Vertex { return new Vertex(this.localViewMidX(), this.localViewMidY()) }
	localViewTopCenter(): Vertex { return new Vertex(this.localViewMidX(), this.localViewYMin()) }
	localViewBottomCenter(): Vertex { return new Vertex(this.localViewMidX(), this.localViewYMax()) }
	localViewLeftCenter(): Vertex { return new Vertex(this.localViewXMin(), this.localViewMidY()) }
	localViewRightCenter(): Vertex { return new Vertex(this.localViewXMax(), this.localViewMidY()) }

	relativeViewULCorner(frame?: Mobject) { return this.localPointRelativeTo(this.localViewULCorner(), frame) }
	relativeViewURCorner(frame?: Mobject) { return this.localPointRelativeTo(this.localViewURCorner(), frame) }
	relativeViewLRCorner(frame?: Mobject) { return this.localPointRelativeTo(this.localViewLRCorner(), frame) }
	relativeViewLLCorner(frame?: Mobject) { return this.localPointRelativeTo(this.localViewLLCorner(), frame) }
	relativeViewCorners(frame?: Mobject): Array<Vertex> { return [this.relativeViewULCorner(frame), this.relativeViewURCorner(frame), this.relativeViewLRCorner(frame), this.relativeViewLLCorner(frame)] }

	relativeViewCenter(frame?: Mobject) { return this.localPointRelativeTo(this.localViewCenter(), frame) }
	relativeViewTopCenter(frame?: Mobject) { return this.localPointRelativeTo(this.localViewTopCenter(), frame) }
	relativeViewBottomCenter(frame?: Mobject) { return this.localPointRelativeTo(this.localViewBottomCenter(), frame) }
	relativeViewLeftCenter(frame?: Mobject) { return this.localPointRelativeTo(this.localViewLeftCenter(), frame) }
	relativeViewRightCenter(frame?: Mobject) { return this.localPointRelativeTo(this.localViewRightCenter(), frame) }

	relativeViewXMin(frame?: Mobject): number { return xMin(this.relativeViewCorners(frame)) }
	relativeViewXMax(frame?: Mobject): number { return xMax(this.relativeViewCorners(frame)) }
	relativeViewYMin(frame?: Mobject): number { return yMin(this.relativeViewCorners(frame)) }
	relativeViewYMax(frame?: Mobject): number { return yMax(this.relativeViewCorners(frame)) }
	relativeViewMidX(frame?: Mobject): number { return midX(this.relativeViewCorners(frame)) }
	relativeViewMidY(frame?: Mobject): number { return midY(this.relativeViewCorners(frame)) }

	viewULCorner(): Vertex { return this.relativeViewULCorner() }
	viewURCorner(): Vertex { return this.relativeViewURCorner() }
	viewLRCorner(): Vertex { return this.relativeViewLRCorner() }
	viewLLCorner(): Vertex { return this.relativeViewLLCorner() }
	viewCorners(): Array<Vertex> { return this.relativeViewCorners() }
	viewCenter(): Vertex { return this.relativeViewCenter() }
	viewTopCenter(): Vertex { return this.relativeViewTopCenter() }
	viewBottomCenter(): Vertex { return this.relativeViewBottomCenter() }
	viewLeftCenter(): Vertex { return this.relativeViewLeftCenter() }
	viewRightCenter(): Vertex { return this.relativeViewRightCenter() }
	viewXMin(): number { return this.relativeViewXMin() }
	viewXMax(): number { return this.relativeViewXMax() }
	viewYMin(): number { return this.relativeViewYMin() }
	viewYMax(): number { return this.relativeViewYMax() }
	viewMidX(): number { return this.relativeViewMidX() }
	viewMidY(): number { return this.relativeViewMidY() }




	localExtentXMin(): number { return this.submobjects.length == 0 ? this.localViewXMin() : this.relativeSubmobXMin(this) }
	localExtentXMax(): number { return this.submobjects.length == 0 ? this.localViewXMax() : this.relativeSubmobXMax(this) }
	localExtentYMin(): number { return this.submobjects.length == 0 ? this.localViewYMin() : this.relativeSubmobYMin(this) }
	localExtentYMax(): number { return this.submobjects.length == 0 ? this.localViewYMax() : this.relativeSubmobYMax(this) }
	localExtentMidX(): number { return (this.localExtentXMin() + this.localExtentXMax())/2 }
	localExtentMidY(): number { return (this.localExtentYMin() + this.localExtentYMax())/2 }

	localExtentULCorner(): Vertex { return new Vertex(this.localExtentXMin(), this.localExtentYMin()) }
	localExtentURCorner(): Vertex { return new Vertex(this.localExtentXMax(), this.localExtentYMin()) }
	localExtentLRCorner(): Vertex { return new Vertex(this.localExtentXMax(), this.localExtentYMax()) }
	localExtentLLCorner(): Vertex { return new Vertex(this.localExtentXMin(), this.localExtentYMax()) }
	localExtentCorners(): Array<Vertex> { return [this.localExtentULCorner(), this.localExtentURCorner(), this.localExtentLRCorner(), this.localExtentLLCorner()] }

	localExtentCenter(): Vertex { return new Vertex(this.localExtentMidX(), this.localExtentMidY()) }
	localExtentTopCenter(): Vertex { return new Vertex(this.localExtentMidX(), this.localExtentYMin()) }
	localExtentBottomCenter(): Vertex { return new Vertex(this.localExtentMidX(), this.localExtentYMax()) }
	localExtentLeftCenter(): Vertex { return new Vertex(this.localExtentXMin(), this.localExtentMidY()) }
	localExtentRightCenter(): Vertex { return new Vertex(this.localExtentXMax(), this.localExtentMidY()) }


	relativeExtentULCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localExtentULCorner(), frame) }
	relativeExtentURCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localExtentURCorner(), frame) }
	relativeExtentLRCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localExtentLRCorner(), frame) }
	relativeExtentLLCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localExtentLLCorner(), frame) }
	relativeExtentCorners(frame?: Mobject) { return [this.relativeExtentULCorner(frame), this.relativeExtentURCorner(frame), this.relativeExtentLRCorner(frame), this.relativeExtentLLCorner(frame)] }

	relativeExtentCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localExtentCenter(), frame) }
	relativeExtentTopCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localExtentTopCenter(), frame) }
	relativeExtentBottomCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localExtentBottomCenter(), frame) }
	relativeExtentLeftCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localExtentLeftCenter(), frame) }
	relativeExtentRightCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localExtentRightCenter(), frame) }

	relativeExtentXMin(frame?: Mobject): number { return xMin(this.relativeExtentCorners(frame)) }
	relativeExtentXMax(frame?: Mobject): number { return xMax(this.relativeExtentCorners(frame)) }
	relativeExtentYMin(frame?: Mobject): number { return yMin(this.relativeExtentCorners(frame)) }
	relativeExtentYMax(frame?: Mobject): number { return yMax(this.relativeExtentCorners(frame)) }
	relativeExtentMidX(frame?: Mobject): number { return midX(this.relativeExtentCorners(frame)) }
	relativeExtentMidY(frame?: Mobject): number { return midY(this.relativeExtentCorners(frame)) }

	extentULCorner(): Vertex { return this.relativeExtentULCorner() }
	extentURCorner(): Vertex { return this.relativeExtentURCorner() }
	extentLRCorner(): Vertex { return this.relativeExtentLRCorner() }
	extentLLCorner(): Vertex { return this.relativeExtentLLCorner() }
	extentCorners(): Array<Vertex> { return this.relativeExtentCorners() }
	extentCenter(): Vertex { return this.relativeExtentCenter() }
	extentTopCenter(): Vertex { return this.relativeExtentTopCenter() }
	extentBottomCenter(): Vertex { return this.relativeExtentBottomCenter() }
	extentLeftCenter(): Vertex { return this.relativeExtentLeftCenter() }
	extentRightCenter(): Vertex { return this.relativeExtentRightCenter() }
	extentXMin(): number { return this.relativeExtentXMin() }
	extentXMax(): number { return this.relativeExtentXMax() }
	extentYMin(): number { return this.relativeExtentYMin() }
	extentYMax(): number { return this.relativeExtentYMax() }
	extentMidX(): number { return this.relativeExtentMidX() }
	extentMidY(): number { return this.relativeExtentMidY() }

	relativeULCorner(frame?: Mobject): Vertex { return this.relativeExtentULCorner(frame) }
	relativeURCorner(frame?: Mobject): Vertex { return this.relativeExtentURCorner(frame) }
	relativeLRCorner(frame?: Mobject): Vertex { return this.relativeExtentLRCorner(frame) }
	relativeLLCorner(frame?: Mobject): Vertex { return this.relativeExtentLLCorner(frame) }
	relativeCorners(frame?: Mobject): Array<Vertex> { return this.relativeExtentCorners(frame) }
	relativeCenter(frame?: Mobject): Vertex { return this.relativeExtentCenter(frame) }
	relativeTopCenter(frame?: Mobject): Vertex { return this.relativeExtentTopCenter(frame) }
	relativeBottomCenter(frame?: Mobject): Vertex { return this.relativeExtentBottomCenter(frame) }
	relativeLeftCenter(frame?: Mobject): Vertex { return this.relativeExtentLeftCenter(frame) }
	relativeRightCenter(frame?: Mobject): Vertex { return this.relativeExtentRightCenter(frame) }
	relativeXMin(frame?: Mobject): number { return this.relativeExtentXMin(frame) }
	relativeXMax(frame?: Mobject): number { return this.relativeExtentXMax(frame) }
	relativeYMin(frame?: Mobject): number { return this.relativeExtentYMin(frame) }
	relativeYMax(frame?: Mobject): number { return this.relativeExtentYMax(frame) }
	relativeMidX(frame?: Mobject): number { return this.relativeExtentMidX(frame) }
	relativeMidY(frame?: Mobject): number { return this.relativeExtentMidY(frame) }

	localULCorner(): Vertex { return this.relativeExtentULCorner(this) }
	localURCorner(): Vertex { return this.relativeExtentURCorner(this) }
	localLRCorner(): Vertex { return this.relativeExtentLRCorner(this) }
	localLLCorner(): Vertex { return this.relativeExtentLLCorner(this) }
	localCorners(): Array<Vertex> { return this.relativeExtentCorners(this) }
	localCenter(): Vertex { return this.relativeExtentCenter(this) }
	localTopCenter(): Vertex { return this.relativeExtentTopCenter(this) }
	localBottomCenter(): Vertex { return this.relativeExtentBottomCenter(this) }
	localLeftCenter(): Vertex { return this.relativeExtentLeftCenter(this) }
	localRightCenter(): Vertex { return this.relativeExtentRightCenter(this) }
	localXMin(): number { return this.relativeExtentXMin(this) }
	localXMax(): number { return this.relativeExtentXMax(this) }
	localYMin(): number { return this.relativeExtentYMin(this) }
	localYMax(): number { return this.relativeExtentYMax(this) }



	ulCorner(): Vertex { return this.extentULCorner() }
	urCorner(): Vertex { return this.extentURCorner() }
	lrCorner(): Vertex { return this.extentLRCorner() }
	llCorner(): Vertex { return this.extentLLCorner() }
	corners(): Array<Vertex> { return this.extentCorners() }
	center(): Vertex { return this.extentCenter() }
	topCenter(): Vertex { return this.extentTopCenter() }
	bottomCenter(): Vertex { return this.extentBottomCenter() }
	leftCenter(): Vertex { return this.extentLeftCenter() }
	rightCenter(): Vertex { return this.extentRightCenter() }
	xMin(): number { return this.extentXMin() }
	xMax(): number { return this.extentXMax() }
	yMin(): number { return this.extentYMin() }
	yMax(): number { return this.extentYMax() }


	localSubmobXMin(): number {
		var ret = Infinity
		for (let submob of this.submobjects) {
			ret = Math.min(ret, xMin(submob.relativeExtentCorners(this)))
		}
		return ret
	}
	localSubmobXMax(): number {
		var ret = -Infinity
		for (let submob of this.submobjects) {
			ret = Math.max(ret, xMax(submob.relativeExtentCorners(this))) }
		return ret
	}
	localSubmobYMin(): number {
		var ret = Infinity
		for (let submob of this.submobjects) { ret = Math.min(ret, yMin(submob.relativeExtentCorners(this))) }
		return ret
	}
	localSubmobYMax(): number {
		var ret = -Infinity
		for (let submob of this.submobjects) { ret = Math.max(ret, yMax(submob.relativeExtentCorners(this))) }
		return ret
	}
	localSubmobMidX(): number {
		return (this.localSubmobXMin() + this.localSubmobXMax())/2
	}
	localSubmobMidY(): number {
		return (this.localSubmobYMin() + this.localSubmobYMax())/2
	}

	localSubmobULCorner(): Vertex { return new Vertex(this.localSubmobXMin(), this.localSubmobYMin()) }
	localSubmobURCorner(): Vertex { return new Vertex(this.localSubmobXMax(), this.localSubmobYMin()) }
	localSubmobLLCorner(): Vertex { return new Vertex(this.localSubmobXMin(), this.localSubmobYMax()) }
	localSubmobLRCorner(): Vertex { return new Vertex(this.localSubmobXMax(), this.localSubmobYMax()) }
	localSubmobCorners(): Array<Vertex> { return [this.localSubmobULCorner(), this.localSubmobURCorner(), this.localSubmobLRCorner(), this.localSubmobLLCorner()] }

	localSubmobCenter(): Vertex { return new Vertex(this.localSubmobMidX(), this.localSubmobMidY()) }
	localSubmobTopCenter(): Vertex { return new Vertex(this.localSubmobMidX(), this.localSubmobYMin()) }
	localSubmobBottomCenter(): Vertex { return new Vertex(this.localSubmobMidX(), this.localSubmobYMax()) }
	localSubmobLeftCenter(): Vertex { return new Vertex(this.localSubmobXMin(), this.localSubmobMidY()) }
	localSubmobRightCenter(): Vertex { return new Vertex(this.localSubmobXMax(), this.localSubmobMidY()) }

	relativeSubmobULCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localSubmobULCorner(), frame) }
	relativeSubmobURCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localSubmobURCorner(), frame) }
	relativeSubmobLLCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localSubmobLLCorner(), frame) }
	relativeSubmobLRCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localSubmobLRCorner(), frame) }
	relativeSubmobCorners(frame?: Mobject): Array<Vertex> { return [this.relativeSubmobULCorner(frame), this.relativeSubmobURCorner(frame), this.relativeSubmobLRCorner(frame), this.relativeSubmobLLCorner(frame)] }

	relativeSubmobCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localSubmobCenter(), frame) }
	relativeSubmobTopCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localSubmobTopCenter(), frame) }
	relativeSubmobBottomCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localSubmobBottomCenter(), frame) }
	relativeSubmobLeftCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localSubmobLeftCenter(), frame) }
	relativeSubmobRightCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localSubmobRightCenter(), frame) }

	relativeSubmobXMin(frame?: Mobject): number { return xMin(this.relativeSubmobCorners(frame)) }
	relativeSubmobXMax(frame?: Mobject): number { return xMax(this.relativeSubmobCorners(frame)) }
	relativeSubmobYMin(frame?: Mobject): number { return yMin(this.relativeSubmobCorners(frame)) }
	relativeSubmobYMax(frame?: Mobject): number { return yMax(this.relativeSubmobCorners(frame)) }
	relativeSubmobMidX(frame?: Mobject): number { return midX(this.relativeSubmobCorners(frame)) }
	relativeSubmobMidY(frame?: Mobject): number { return midY(this.relativeSubmobCorners(frame)) }

	submobULCorner(): Vertex { return this.relativeSubmobULCorner() }
	submobURCorner(): Vertex { return this.relativeSubmobURCorner() }
	submobLRCorner(): Vertex { return this.relativeSubmobLRCorner() }
	submobLLCorner(): Vertex { return this.relativeSubmobLLCorner() }
	submobCorners(): Array<Vertex> { return this.relativeSubmobCorners() }
	submobCenter(): Vertex { return this.relativeSubmobCenter() }
	submobTopCenter(): Vertex { return this.relativeSubmobTopCenter() }
	submobBottomCenter(): Vertex { return this.relativeSubmobBottomCenter() }
	submobLeftCenter(): Vertex { return this.relativeSubmobLeftCenter() }
	submobRightCenter(): Vertex { return this.relativeSubmobRightCenter() }
	submobXMin(): number { return this.relativeSubmobXMin() }
	submobXMax(): number { return this.relativeSubmobXMax() }
	submobYMin(): number { return this.relativeSubmobYMin() }
	submobYMax(): number { return this.relativeSubmobYMax() }
	submobMidX(): number { return this.relativeSubmobMidX() }
	submobMidY(): number { return this.relativeSubmobMidY() }




	getWidth(): number { return this.localExtentXMax() - this.localExtentXMin() }
	getHeight(): number { return this.localExtentYMax() - this.localExtentYMin() }

	adjustFrame() {
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





	get superMobject(): Mobject { return this.parent }
	set superMobject(newValue: Mobject) { this.parent = newValue }

	// move to update?
	get parent(): Mobject { return this._parent }
	set parent(newParent: Mobject) {
		this.view?.remove()
		this._parent = newParent
		if (newParent == undefined) { return }
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



	// view and style



	add(submob: Mobject) {
		if (submob.parent != this) { submob.parent = this }
		if (this.children == undefined) {
			console.error(`Please add submob ${submob.constructor.name} to ${this.constructor.name} later, in statefulSetup()`)
		}
		if (!this.children.includes(submob)) {
			this.children.push(submob)
		}
		this.view.append(submob.view)
		submob.update()
	}

	remove(submob: Mobject) {
		submob.view.remove()
		remove(this.children, submob)
		submob.parent = undefined
	}


	getPaper(): Mobject {
		let p: Mobject = this
		while (p != undefined && p.constructor.name != 'Paper') {
			p = p.parent
		}
		return p
	}




	show() {
		this.update({visible: true})
		for (let submob of this.children) { submob.show() } // we have to propagate visibility bc we have to for invisibility
	}

	hide() {
		this.update({visible: false}, false)
		for (let submob of this.children) { submob.show() } // we have to propagate visibility bc we have to for invisibility
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

		if (EVENT_LOGGING) { console.log('event target on ', this, 'is', this.eventTarget) }
		if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
			if (EVENT_LOGGING) { console.log('passing on') }
			this.eventTarget.pointerDown(e)
		} else {
			if (EVENT_LOGGING) { console.log(`handling myself, and I am a ${this.constructor.name}`) }
			this.selfHandlePointerDown(e)
		}
	}

	pointerMove(e: LocatedEvent) {
		if (EVENT_LOGGING) { console.log(this, "event target:", this.eventTarget) }
		if (this.eventTarget.vetoOnStopPropagation) { return }
		e.stopPropagation()

		if (this.eventTarget.interactive && this.eventTarget != this && this.passAlongEvents) {
			if (EVENT_LOGGING) { console.log("passing on") }
			this.eventTarget.pointerMove(e)
		} else {
			if (EVENT_LOGGING) { console.log(`handling myself, and I am a ${this.constructor.name}`) }
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

	setup() {
		super.setup()
		// children may have been set as a constructor args
		for (let submob of this.children) {
			this.add(submob)
		}
	}

}




export class VMobject extends Mobject {

	svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	path: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	vertices: Array<Vertex> = []

	fillColor = Color.white()
	fillOpacity = 0.5
	strokeColor = Color.white()
	strokeWidth = 1

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.svg['mobject'] = this
		this.path['mobject'] = this
		this.svg.appendChild(this.path)
		this.svg.setAttribute('class', 'mobject-svg')
		this.svg.style.overflow = 'visible'
		this.view.appendChild(this.svg) // why not just add?
		this.view.setAttribute('class', this.constructor.name + ' mobject-div')
	}

	redrawSelf() {
		super.redrawSelf()
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
		let returnValue: Array<Vertex> = this.transformRelativeTo(frame).appliedToVertices(this.vertices)
		if (returnValue == undefined) { return [] }
		else { return returnValue }
	}

	globalVertices(): Array<Vertex> {
		return this.relativeVertices() // uses default frame = paper
	}

	localVerticesXMin(): number { return xMin(this.vertices) }
	localVerticesXMax(): number { return xMax(this.vertices) }
	localVerticesYMin(): number { return yMin(this.vertices) }
	localVerticesYMax(): number { return yMax(this.vertices) }
	localVerticesMidX(): number { return midX(this.vertices) }
	localVerticesMidY(): number { return midY(this.vertices) }

	localVerticesULCorner(): Vertex { return new Vertex(this.localVerticesXMin(), this.localVerticesYMin()) }
	localVerticesURCorner(): Vertex { return new Vertex(this.localVerticesXMax(), this.localVerticesYMin()) }
	localVerticesLRCorner(): Vertex { return new Vertex(this.localVerticesXMax(), this.localVerticesYMax()) }
	localVerticesLLCorner(): Vertex { return new Vertex(this.localVerticesXMin(), this.localVerticesYMax()) }
	localVerticesCorners(): Array<Vertex> { return [this.localVerticesULCorner(), this.localVerticesURCorner(), this.localVerticesLRCorner(), this.localVerticesLLCorner()] }

	localVerticesCenter(): Vertex { return new Vertex(this.localVerticesMidX(), this.localVerticesMidY()) }
	localVerticesTopCenter(): Vertex { return new Vertex(this.localVerticesMidX(), this.localVerticesYMin()) }
	localVerticesBottomCenter(): Vertex { return new Vertex(this.localVerticesMidX(), this.localVerticesYMax()) }
	localVerticesLeftCenter(): Vertex { return new Vertex(this.localVerticesXMin(), this.localVerticesMidY()) }
	localVerticesRightCenter(): Vertex { return new Vertex(this.localVerticesXMax(), this.localVerticesMidY()) }

	relativeVerticesULCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesULCorner(), frame) }
	relativeVerticesURCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesURCorner(), frame) }
	relativeVerticesLRCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesLRCorner(), frame) }
	relativeVerticesLLCorner(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesLLCorner(), frame) }
	relativeVerticesCorners(frame?: Mobject): Array<Vertex> { return [this.relativeVerticesULCorner(frame), this.relativeVerticesURCorner(frame), this.relativeVerticesLRCorner(frame), this.relativeVerticesLLCorner(frame)] }

	relativeVerticesCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesCenter(), frame) }
	relativeVerticesTopCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesTopCenter(), frame) }
	relativeVerticesBottomCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesBottomCenter(), frame) }
	relativeVerticesLeftCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesLeftCenter(), frame) }
	relativeVerticesRightCenter(frame?: Mobject): Vertex { return this.localPointRelativeTo(this.localVerticesRightCenter(), frame) }

	relativeVerticesXMin(frame?: Mobject): number { return xMin(this.relativeVerticesCorners(frame)) }
	relativeVerticesXMax(frame?: Mobject): number { return xMax(this.relativeVerticesCorners(frame)) }
	relativeVerticesYMin(frame?: Mobject): number { return yMin(this.relativeVerticesCorners(frame)) }
	relativeVerticesYMax(frame?: Mobject): number { return yMax(this.relativeVerticesCorners(frame)) }
	relativeVerticesMidX(frame?: Mobject): number { return midX(this.relativeVerticesCorners(frame)) }
	relativeVerticesMidY(frame?: Mobject): number { return midY(this.relativeVerticesCorners(frame)) }

	verticesULCorner(): Vertex { return this.relativeVerticesULCorner() }
	verticesURCorner(): Vertex { return this.relativeVerticesURCorner() }
	verticesLRCorner(): Vertex { return this.relativeVerticesLRCorner() }
	verticesLLCorner(): Vertex { return this.relativeVerticesLLCorner() }
	verticesCorners(): Array<Vertex> { return this.relativeVerticesCorners() }
	verticesCenter(): Vertex { return this.relativeVerticesCenter() }
	verticesTopCenter(): Vertex { return this.relativeVerticesTopCenter() }
	verticesBottomCenter(): Vertex { return this.relativeVerticesBottomCenter() }
	verticesLeftCenter(): Vertex { return this.relativeVerticesLeftCenter() }
	verticesRightCenter(): Vertex { return this.relativeVerticesRightCenter() }
	verticesXMin(): number { return this.relativeVerticesXMin() }
	verticesXMax(): number { return this.relativeVerticesXMax() }
	verticesYMin(): number { return this.relativeVerticesYMin() }
	verticesYMax(): number { return this.relativeVerticesYMax() }
	verticesMidX(): number { return this.relativeVerticesMidX() }
	verticesMidY(): number { return this.relativeVerticesMidY() }




	localExtentXMin(): number { return Math.min(this.localVerticesXMin(), this.localSubmobXMin()) }
	localExtentXMax(): number { return Math.max(this.localVerticesXMax(), this.localSubmobXMax()) }
	localExtentYMin(): number { return Math.min(this.localVerticesYMin(), this.localSubmobYMin()) }
	localExtentYMax(): number { return Math.max(this.localVerticesYMax(), this.localSubmobYMax()) }
	localExtentMidX(): number { return (this.localVerticesXMin() + this.localSubmobXMax())/2 }
	localExtentMidY(): number { return (this.localVerticesYMin() + this.localSubmobYMax())/2 }
	

}








export class Polygon extends VMobject {

	closed = true

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
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

	_bezierPoints: Array<Vertex> = []

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	updateBezierPoints() { }
	// implemented by subclasses

	updateSelf(args = {}) {
		super.updateSelf(args)
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



	get bezierPoints(): Array<Vertex> { return this._bezierPoints }
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

	text = 'text'
	horizontalAlign = 'center' // 'left' | 'center' | 'right'
	verticalAlign = 'center' // 'top' | 'center' | 'bottom'
	color = Color.white()
	fontSize = 10
	fontFamily = 'Helvetica'

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.view.setAttribute('class', this.constructor.name + ' unselectable mobject-div')
		this.view.style.display = 'flex'
		this.view.style.fontFamily = this.fontFamily
	}

	redrawSelf() {
		super.redrawSelf()
		this.view.style.fontSize = `${this.fontSize}px`

		this.view.innerHTML = this.text
		this.view.style.color = this.color.toHex()
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











