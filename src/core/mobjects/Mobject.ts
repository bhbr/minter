
import { remove } from 'core/functions/arrays'
import { log } from 'core/functions/logging'
import { deepCopy } from 'core/functions/copying'
import { getPaper } from 'core/functions/getters'
import { ScreenEventDevice, screenEventDevice, ScreenEventHandler, eventVertex, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, ScreenEvent, screenEventType, ScreenEventType, isTouchDevice } from './screen_events'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Transform } from 'core/classes/vertex/Transform'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { Color } from 'core/classes/Color'
import { Dependency } from './Dependency'
import { Paper } from 'core/Paper'
import { DRAW_BORDERS } from 'core/constants'

/*
For debugging; draw the border of the mobject's view
(a HTMLDivelement) via a CSS property
*/

export class Mobject extends ExtendedObject {

/*
A mobject (math object) has a view with an underlying state
and logic for drawing and user interaction.
 */

	//////////////////////////////////////////////////////////
	//                                                      //
	//                    INITIALIZATION                    //
	//                                                      //
	//////////////////////////////////////////////////////////

	/*
	Subclasses dot NOT get their own explicit constructor.
	This is to cleanly separate the stateless and stateful 
	setup processes (explained below).
	
	Subclasses may also have a quite different setup
	than their superclass, and would otherwise have to undo
	a lot of the superclass's constructor setup.
	(E. g. a Circle's anchor should not be set, instead
	its midpoint should. A Circle's anchor acts like
	a computed property.)
	
	It also allows to control the setting of default
	state variables.

	*/

	constructor(argsDict: object = {}) {
	/*
	A mobject is initialized by providing a dictionary (object)
	of parameters (argsDict).
	*/
		super()
		let initialArgs = Object.assign(this.defaults(), argsDict)
		this.setAttributes(initialArgs)

		this.setup()
		this.update()
		this.redraw()
	}

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'view'
		])
	}

	defaults(): object {
	/*
	Default values of properties (declared
	in the sections that follow).
	This list is complemented in subclasses
	by overriding the method.
	*/
		return Object.assign(super.defaults(), {
			// The meaning of these properties is explained in the sections further below.

			// position
			transform: Transform.identity(),
			viewWidth: 100,
			viewHeight: 100,
			/*
			Note: anchor is a property of transform
			and exposed to the mobject itself
			with a getter/setter.
			*/

			// view
			view: document.createElement('div'),
			visible: true,
			opacity: 1.0,
			backgroundColor: Color.clear(),
			drawBorder: DRAW_BORDERS,

			// hierarchy
			_parent: null,
			children: [], // i. e. submobjects

			// dependencies
			dependencies: [],

			// interactivity
			screenEventHandler: ScreenEventHandler.Parent,
			savedScreenEventHandler: null,
			eventTarget: null,
			screenEventHistory: []
		})
	}

	setup() {
	// state-dependent setup (step 3 in constructor)
		this.setupView()

		/*
		When holding down the drag button,
		the onPointer methods are redirected to
		the corresponding methods that make the
		mobject self-drag.
		After the drag button is let go, these
		methods are redirected to their previous
		code.
		*/
		this.savedOnPointerDown = this.onPointerDown
		this.savedOnPointerMove = this.onPointerMove
		this.savedOnPointerUp = this.onPointerUp
		addPointerDown(this.view, this.capturedOnPointerDown.bind(this))
		addPointerMove(this.view, this.capturedOnPointerMove.bind(this))
		addPointerUp(this.view, this.capturedOnPointerUp.bind(this))
	}



	//////////////////////////////////////////////////////////
	//                                                      //
	//                  POSITION AND SIZE                   //
	//                                                      //
	//////////////////////////////////////////////////////////


	/*
	Most often the transform just has an anchor
	that describes where the mobject is
	located in its parent's frame.
	But the transform can also include a scale
	and a rotation angle (and a shift vector,
	which maybe shouldn't be used as mobject
	translations should be handled via its anchor).
	*/
	transform: Transform

	viewWidth: number
	viewHeight: number
	// (Note: the view itself is declared further below)

	// this.anchor is a synonym for this.transform.anchor
	get anchor(): Vertex {
		return this.transform.anchor
	}

	set anchor(newValue: Vertex) {
		if (!this.transform) {
			this.transform = Transform.identity()
		}
		this.transform.anchor = newValue
	}

	relativeTransform(frame?: Mobject): Transform {
	/*
	What transform maps (actively) from the given
	ancestor mobject ('frame') to this descendant mobject?
	If the transforms in between are all just anchor
	translations, this gives this mobject's anchor
	in the coordinate frame of the given mobject.
	*/

		// If there is no frame, use the direct parent's coordinate frame.
		// If there is no parent yet, use your own (local) coordinates.
		let frame_: any = frame || this.parent || this
		let t = Transform.identity()
		let mob: Mobject = this
		while (mob && mob.transform instanceof Transform) {
			if (mob == frame_) { return t }
			t.leftComposeWith(new Transform({ shift: mob.anchor }))
			t.leftComposeWith(mob.transform)
			mob = mob.parent
		}
		throw 'relativeTransform requires a direct ancestor'
	}

	transformLocalPoint(point: Vertex, frame?: Mobject): Vertex {
	/*
	Given a point (Vertex) in local coordinates,
	compute its coordinates in the given ancestor
	mobject's frame.
	*/
		let t = this.relativeTransform(frame)
		return t.appliedTo(point)
	}

	/*
	The following geometric properties are first computed from the view frame.
	The versions without 'view' in the name can be overriden by subclasses,
	e. g. VMobjects.
	*/

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
		let p = this.transformLocalPoint(new Vertex(this.viewWidth/2, this.viewHeight/2), frame)
		return p
	}

	viewMidX(frame?: Mobject): number { return this.viewCenter(frame).x }
	viewMidY(frame?: Mobject): number { return this.viewCenter(frame).y }

	viewLeftCenter(frame?: Mobject): Vertex { return new Vertex(this.viewXMin(frame), this.viewMidY(frame)) }
	viewRightCenter(frame?: Mobject): Vertex { return new Vertex(this.viewXMax(frame), this.viewMidY(frame)) }
	viewTopCenter(frame?: Mobject): Vertex { return new Vertex(this.viewMidX(frame), this.viewYMin(frame)) }
	viewBottomCenter(frame?: Mobject): Vertex { return new Vertex(this.viewMidX(frame), this.viewYMax(frame)) }

	/*
	Equivalent (by default) versions without "view" in the name
	These can be overriden in subclasses, e. g. in VMobject using
	its vertices.
	*/

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

	getWidth(): number { return this.localXMax() - this.localXMin() }
	getHeight(): number { return this.localYMax() - this.localYMin() }

	adjustFrame() {
	// Set the view anchor and size to fit the frame as computed from the vertices
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
		this.update(updateDict)

	}

	//////////////////////////////////////////////////////////
	//                                                      //
	//                    VIEW AND STYLE                    //
	//                                                      //
	//////////////////////////////////////////////////////////


	view: HTMLDivElement
	// the following properties encode CSS properties
	opacity: number
	visible: boolean
	backgroundColor: Color
	drawBorder: boolean

	setupView() {
		if (this.view == null) { return }
		this.view['mobject'] = this
		if (this.parent) {
			this.parent.view.appendChild(this.view)
		}
		this.view.setAttribute('class', 'mobject-div ' + this.constructor.name)
		this.view.style.transformOrigin = 'top left'
		this.view.style.position = 'absolute'
		// 'absolute' positions this mobject relative (sic) to its parent
		this.view.style.overflow = 'visible'
		// by default, the mobject can draw outside its view's borders
	}

	redraw() {
		if (!this.view) { return }
		this.view.style.transform = this.transform.withoutAnchor().toCSSString()
		this.view.style.left = `${this.anchor.x.toString()}px`
		this.view.style.top = `${this.anchor.y.toString()}px`
		this.view.style.width = `${this.viewWidth.toString()}px`
		this.view.style.height = `${this.viewHeight.toString()}px`
		this.view.style.border = this.drawBorder ? '1px dashed green' : 'none'
		this.view.style.backgroundColor = this.backgroundColor.toCSS()
		this.view.style.opacity = this.opacity.toString()
		this.view.style.visibility = this.shouldBeDrawn() ? 'visible' : 'hidden'
	}

	shouldBeDrawn(): boolean {
		if (!this.visible) { return false }
		for (let a of this.ancestors()) {
			if (!a.visible) { return false}
		}
		return true
	}

	// Show and hide //

	show() {
	// Show this mobject and all of its descendents
		try {
			if (!this.view) { return }
			this.visible = true
			for (let submob of this.children) {
				submob.show()
			} // we have to propagate visibility bc we have to for invisibility
			this.redraw()
		} catch {
			console.warn(`Unsuccessfully tried to show ${this.constructor.name} (too soon?)`)
		}
	}

	hide() {
	// Hide this mobject and all of its descendents
		if (!this.view) {
			console.warn(`Unsuccessfully tried to hide ${this.constructor.name} (no view yet)`)
			return
		}
		try {
			this.visible = false
			for (let submob of this.children) {
				submob.hide()
			} // we have to propagate invisibility
			this.redraw()
		} catch {
			console.warn(`Unsuccessfully tried to hide ${this.constructor.name} (too soon?)`)
		}
	}

	recursiveShow() {
	// Show this mobject and all mobjects that depend on it
		this.show()
		for (let depmob of this.allDependents()) {
			depmob.show()
		}
	}

	recursiveHide() {
	// Hide this mobject and all mobjects that depend on it
		this.hide()
		for (let depmob of this.allDependents()) {
			depmob.hide()
		}
	}


	//////////////////////////////////////////////////////////
	//                                                      //
	//                       ANIMATION                      //
	//                                                      //
	//////////////////////////////////////////////////////////


	/*
	Animation is 'home-grown' (not via CSS).
	Any numerical property (number, Color, Vertex,
	VertexArray, Transform) can be animated.
	For this, we create two copies of the mobject,
	and update the second copy with the desired
	end values. Then at regular intervals,
	we compute a convex combination of each property
	and update this mobject with those.
	*/

	interpolationStartCopy: this
	interpolationStopCopy: this
	animationTimeStart: number
	animationDuration: number
	animationInterval: number

	animate(argsDict: object = {}, seconds: number) {
	// Calling this method launches an animation

		// Create mobject copies
		this.interpolationStartCopy = deepCopy(this)
		this.interpolationStartCopy.clearScreenEventHistory()
		this.interpolationStopCopy = deepCopy(this.interpolationStartCopy)
		this.interpolationStopCopy.update(argsDict, false)

		// all times in ms bc that is what setInterval and setTimeout expect
		let dt = 10
		this.animationTimeStart = Date.now()
		this.animationDuration = seconds * 1000

		this.animationInterval = window.setInterval(
			function() {
				this.updateAnimation(Object.keys(argsDict))
			}
			.bind(this), dt)
		// this.animationInterval is a reference number
		// that we need to remember to stop the animation
		window.setTimeout(
			this.cleanupAfterAnimation
		.bind(this), this.animationDuration)
	}

	updateAnimation(keys: Array<string>) {
	// This method gets called at regular intervals during the animation
		let weight = (Date.now() - this.animationTimeStart) / this.animationDuration
		let newArgsDict = this.interpolatedAnimationArgs(keys, weight)
		this.update(newArgsDict)
	}

	interpolatedAnimationArgs(keys: Array<string>, weight: number): object {
	/*
	Compute a convex combination between the start and stop values
	of each key. The custom types (all except number) all have
	their own interpolation method.
	*/
		let returnValues: object = {}
		for (let key of keys) {
			let startValue: any = this.interpolationStartCopy[key]
			let stopValue: any = this.interpolationStopCopy[key]
			if (typeof startValue ==  'number') {
				returnValues[key] = (1 - weight) * startValue + weight * stopValue
			} else if (startValue instanceof Vertex) {
				returnValues[key] = startValue.interpolate(stopValue as Vertex, weight)
			} else if (startValue instanceof Transform) {
				returnValues[key] = startValue.interpolate(stopValue as Transform, weight)
			} else if (startValue instanceof Color) {
				returnValues[key] = startValue.interpolate(stopValue as Color, weight)
			} else if (startValue instanceof VertexArray) {
				returnValues[key] = startValue.interpolate(stopValue as VertexArray, weight)
			}
		}
		return returnValues
	}

	cleanupAfterAnimation() {
	// This method gets called at the end of the animation
		window.clearInterval(this.animationInterval)
		this.animationInterval = null
		this.interpolationStartCopy = null
		this.interpolationStopCopy = null
	}








	//////////////////////////////////////////////////////////
	//                                                      //
	//                       HIERARCHY                      //
	//                                                      //
	//////////////////////////////////////////////////////////


	_parent?: Mobject // == superMobject
	children: Array<Mobject> // ==  submobjects == submobs

	/*
	Actually we want to hide behind setting this.parent
	some more housekeeping code bc parent and child
	reference each other, and probably the views need
	to be updated.
	*/
	get parent(): Mobject { return this._parent }
	set parent(newValue: Mobject) {
		try {
			// there might already be a parent
			this.parent.remove(this)
		} catch { }
		this._parent = newValue
		if (newValue === undefined || newValue == null) {
			return
		}
		newValue.add(this)
	}

	ancestors(): Array<Mobject> {
		let ret: Array<Mobject> = []
		let p = this.parent
		if (p === undefined || p === null) {
			return ret
		}
		while (p != null) {
			ret.push(p)
			p = p.parent
		}
		return ret
	}

	// Alias for parent
	get superMobject(): this { return this.parent as this }
	set superMobject(newValue: this) { this.parent = newValue }

	// Aliases for children
	get submobjects(): Array<Mobject> { return this.children }
	set submobjects(newValue: Array<Mobject>) {
		this.children = newValue
	}
	get submobs(): Array<Mobject> { return this.submobjects }
	set submobs(newValue: Array<Mobject>) {
		this.submobs = newValue
	}

	add(submob: Mobject) {
		// Set this as the submob's parent
		if (submob.parent != this) {
			if (submob.parent !== null && submob.parent !== undefined) {
				submob.parent.remove(submob)
			}
			submob.parent = this
		}
		// Add submob to the children
		if (this.children === undefined || this.children === null) {
			throw `Please add submob ${submob.constructor.name} to ${this.constructor.name} later, in setup()`
		} else if (!this.children.includes(submob)) {
			this.children.push(submob)
		}
		// Add its view to this view and redraw
		this.view.append(submob.view)
		submob.redraw()
	}

	remove(submob: Mobject) {
		// Remove from the array of children
		// (with an imported helper method)
		remove(this.children, submob)
		submob.parent = null
		submob.view.remove()
	}

	moveToTop(submob: Mobject) {
	/*
	Put this submob in front of every other sibling,
	so that it will obstruct them and catch screen events
	*/
		if (submob.parent != this) { return }
		this.remove(submob)
		this.add(submob)
	}



	//////////////////////////////////////////////////////////
	//                                                      //
	//                     DEPENDENCIES                     //
	//                                                      //
	//////////////////////////////////////////////////////////

	/*
	A dependency describes how one mobject's property1
	equals another's property2, i. e. changing the first ('output')
	triggers an update on the second ('input').
	The output property can also be the result of a method
	(provided it requires no arguments).
	*/
	dependencies: Array<Dependency>

	dependents(): Array<Mobject> {
	// All mobjects that depend directly on this
		let dep: Array<Mobject> = []
		for (let d of this.dependencies) {
			dep.push(d.target)
		}
		return dep
	}

	allDependents(): Array<Mobject> {
	// All mobjects that depend either directly or indirectly on this
		let dep: Array<Mobject> = this.dependents()
		for (let mob of dep) {
			dep.push(...mob.allDependents())
		}
		return dep
	}

	dependsOn(otherMobject: Mobject): boolean {
		return otherMobject.allDependents().includes(this)
	}

	addDependency(outputName: string | null, target: Mobject, inputName: string | null, refresh: boolean = true) {
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
		if (refresh) {
			target.update({
				inputName: this['outputName']
			})
		}
	}

	removeDependency(dep: Dependency) {
		remove(this.dependencies, dep)
	}

	addDependent(target: Mobject) {
	/*
	No properties given. Simply if this mobject updates,
	update the target mobject as well.
	*/
		this.addDependency(null, target, null)
	}

	// Update methods //

	update(argsDict: object = {}, redraw: boolean = true) {

	// Update just the properties and what depends on them, without redrawing
		argsDict = this.consolidateTransformAndAnchor(argsDict) // see below
		this.setAttributes(argsDict)
		//this.updateSubmobModels()

		if (this.view != null) {
			this.view.setAttribute('screen-event-handler', this.screenEventHandler.toString())
			if (this.screenEventHandler == ScreenEventHandler.Below) {
				this.view.style['pointer-events'] = 'none'
			} else {
				this.view.style['pointer-events'] = 'auto'
			}
		}

		let targetsAndUpdateDicts: Array<[Mobject, object]> = []

		for (let dep of this.dependencies || []) {

			let output: any = this[dep.outputName] // value or function, may be undefined
			var outputValue: any = null
			if (typeof output === 'function') {
				outputValue = output.bind(this)()
			} else if (output !== undefined && output !== null) {
				outputValue = output
			}
			
			var repeatMobject = false
			for (let pair of targetsAndUpdateDicts) {
				let target = pair[0]
				if (target == dep.target) {
					let updateDict = pair[1]
					updateDict[dep.inputName] = outputValue
					repeatMobject = true
					break
				}
			}
			if (!repeatMobject) {
				let newUpdateDict = {}
				newUpdateDict[dep.inputName] = outputValue
				targetsAndUpdateDicts.push([dep.target, newUpdateDict])
			}
		}

		for (let pair of targetsAndUpdateDicts) {
			let target = pair[0]
			let updateDict = pair[1]
			target.update(updateDict)
		}

		if (redraw) { this.redraw() }
	}

	consolidateTransformAndAnchor(argsDict: object = {}): object {
	/*
	argsDict may contain updated values for the anchor, the transform, or both.
	Since this.anchor == this.transform.anchor, this may be contradictory
	information. This method fixes argsDict.
	*/
		let newAnchor: any = argsDict['anchor']
		var newTransform: any = argsDict['transform']

		if (newTransform) {
			let nt: Transform = newTransform as Transform
			if (nt.anchor.isZero()) {
				/*
				If the new transform has no anchor,
				set it to the new anchor if given one.
				Otherwise set it to your own anchor (i. e. it won't change).
				*/
				nt.anchor = newAnchor ?? this.anchor
			}

		} else {
			/*
			If there is no new transform value, still create
			a copy of the existing one and put the new anchor
			in there (if given, otherwise the old anchor).
			*/
			newTransform = this.transform
			newTransform.anchor = argsDict['anchor'] ?? this.anchor
		}
		delete argsDict['anchor']
		argsDict['transform'] = newTransform
		return argsDict
	}


	//////////////////////////////////////////////////////////
	//                                                      //
	//                     INTERACTIVITY                    //
	//                                                      //
	//////////////////////////////////////////////////////////


	eventTarget?: Mobject
	screenEventHandler: ScreenEventHandler
	savedScreenEventHandler?: ScreenEventHandler
	dragAnchorStart?: Vertex

	screenEventHistory: Array<ScreenEvent>
	timeoutID?: number


	/*
	The following empty methods need to be declared here
	so we can manipulate and override them later.
	*/

	onPointerDown(e: ScreenEvent) { }
	onPointerMove(e: ScreenEvent) { }
	onPointerUp(e: ScreenEvent) { }
	onTap(e: ScreenEvent) { }
	onMereTap(e: ScreenEvent) { }
	onDoubleTap(e: ScreenEvent) { }
	onLongPress(e: ScreenEvent) { }

	/*
	Backup versions for temporarily disabling
	interactivity on a mobject (e. g. while dragging)
	*/
	savedOnPointerDown(e: ScreenEvent) { }
	savedOnPointerMove(e: ScreenEvent) { }
	savedOnPointerUp(e: ScreenEvent) { }
	savedOnTap(e: ScreenEvent) { }
	savedOnMereTap(e: ScreenEvent) { }
	savedOnLongPress(e: ScreenEvent) { }


	/*
	Methods for temporarily disabling interactivity on a mobject
	(e. g. when dragging a CindyCanvas)
	*/
	disable() {
		this.savedScreenEventHandler = this.screenEventHandler
		this.screenEventHandler = ScreenEventHandler.Parent // .Below?
	}

	enable() {
		if (this.savedScreenEventHandler === null) { return }
		this.screenEventHandler = this.savedScreenEventHandler
		this.savedScreenEventHandler = null
	}


	/*
	Finding the event target

	Depending on the screenEventHandler:

	- .Below: mobject is transparent (via CSS), the sibling mobject
	          underneath or the parent should handle the event
	          Example: TwoPointCircle in a Construction
	- .Auto:  don't interfere with event propagation at all
	          Example: CindyCanvas

	Otherwise the event is captured by the topmost view (paper or sidebar),
	the automatic propagation is stopped and the event is passed onto the
	eventTarget as determined by the declared screenEventHandlers in the
	chain of possible event targets.
	The event target is the lowest mobject willing to handle it and that
	is not underneath a mobject that wants its parent to handle it.

	- .Parent: the parent should handle it
	- .Self:   handle it if no child wants to handle it and if no parent wants
	           its parent to handle it
	*/

	eventTargetMobject(e: ScreenEvent): Mobject | null {
	/*
	Find the lowest Mobject willing and allowed to handle the event
	General rule: the event is handled by the lowest submob that can handle it
	and that is not underneath a mobject that wants its parent to handle it.
	If the event policies end in a loop, no one handles it.
	*/
		var t: Element = e.target as Element
		if (t == this.view) {
			return this
		}
		let targetMobChain = this.eventTargetMobjectChain(e) // defined below
		var m: any
		while (targetMobChain.length > 0) {
			m = targetMobChain.pop()
			if (m === undefined) { return this }
			if (m.screenEventHandler == ScreenEventHandler.Parent) {
				return m.parent
			}
			if ((m.screenEventHandler == ScreenEventHandler.Self || m.screenEventHandler == ScreenEventHandler.Auto)) {
				return m
			}
		}
		// if all of this fails, this mob must handle the event itself
		return this
	}

	eventTargetMobjectChain(e: ScreenEvent): Array<Mobject> {
	// Collect the chain of corresponding target mobjects (highest to lowest)
		let targetViewChain = this.eventTargetViewChain(e) // defined below
		let targetMobChain: Array<Mobject> = []
		for (var view of targetViewChain.values()) {
			let m: any = view['mobject']
			if (m == undefined) { continue }
			let mob: Mobject = m as Mobject
			// only consider targets above the first mobject
			// with ScreenEventHandler.Parent
			targetMobChain.push(mob)
		}
		return targetMobChain
	}

	eventTargetViewChain(e: ScreenEvent): Array<Element> {
	// Collect the chain of target views (highest to lowest)
		var t: Element = e.target as Element
		if (t.tagName == 'path') { t = t.parentElement.parentElement }
		// the mob whose view contains the svg element containing the path
		if (t.tagName == 'svg') { t = t.parentElement.parentElement }
		// we hit an svg outside its path (but inside its bounding box),
		// so ignore the corresponding mob and pass the event on to its parent

		let targetViewChain: Array<Element> = [t]
		while (t != undefined && t != this.view) {
			t = t.parentElement
			targetViewChain.push(t)
		}
		return targetViewChain.reverse()
	}


	/*
	Captured event methods

	Instead of calling the event methods exposed in the API (onPointerDown etc.),
	the event listeners call these methods that do some housekeeping
	before and after:

	Step 1: determine the event target (only in capturedOnPointerDown)
	Step 2: stop the propagation (or not if screenEventHandler is .Auto)
	Step 3: check if the event is just a duplicate of the last event
	Step 4: call the API event method
	Step 5: set/unset timers to listen for e. g. taps, double taps, long presses etc.
	*/

	capturedOnPointerDown(e: ScreenEvent) {

		// step 1
		let target = this.eventTargetMobject(e)
		this.eventTarget = target
		if (target == null) { return }
		
		// step 2
		if (target.screenEventHandler == ScreenEventHandler.Auto) { return }
		e.stopPropagation()
		
		// step 3
		if (target.isDuplicate(e)) { return }
		target.registerScreenEvent(e)
		
		// step 4
		target.onPointerDown(e)
		
		// step 5
		target.timeoutID = window.setTimeout(
			function() {
				target.onLongPress(e)
				this.resetTimeout()
			}.bind(this), 1000, e)
	}

	capturedOnPointerMove(e: ScreenEvent) {

		// step 1
		let target = this.eventTarget
		if (target == null) { return }
		
		// step 2
		if (target.screenEventHandler == ScreenEventHandler.Auto) { return }
		e.stopPropagation()
		
		// step 3
		if (target.isDuplicate(e)) { return }
		target.registerScreenEvent(e)
		
		// step 4
		target.onPointerMove(e)
	
		// step 5
		target.resetTimeout()
	}

	capturedOnPointerUp(e: ScreenEvent) {

		// step 1
		let target = this.eventTarget
		if (target == null) { return }
		
		// step 2
		if (target.screenEventHandler == ScreenEventHandler.Auto) { return }
		e.stopPropagation()
		
		// step 3
		if (target.isDuplicate(e)) { return }
		target.registerScreenEvent(e)
		
		// step 4
		target.onPointerUp(e)
		if (target.tapDetected()) { target.onTap(e) }
		if (target.mereTapDetected()) { target.onMereTap(e) }
		if (target.doubleTapDetected()) { target.onDoubleTap(e) }

		// step 5
		target.resetTimeout()
		window.setTimeout(target.clearScreenEventHistory.bind(target), 500)
		this.eventTarget = null
	}


	// Local coordinates for use in custom event methods

	localEventVertex(e: ScreenEvent): Vertex {
	/*
	eventVertex(e) gives the coordinates in the topmost
	mobject's frame (paper or sidebar). This method here
	finds them in the mobject's local frame.
	*/
		let p: Vertex = eventVertex(e)
		let rt = this.relativeTransform(getPaper())
		let q = rt.inverse().appliedTo(p)
		return q
	}


	// Looking for duplicate events

	registerScreenEvent(e: ScreenEvent) {
		if (this.isDuplicate(e)) { return }
		this.screenEventHistory.push(e)
	}

	isDuplicate(e: ScreenEvent): boolean {
	/*
	Duplicates can occur e. g. on an iPad where the same action
	triggers a TouchEvent and a MouseEvent. Here we are just looking at
	the screenEvent's type (down, move, up or cancel) and ignore
	the device to determine duplicates.
	*/
		let minIndex = Math.max(0, this.screenEventHistory.length - 5)
		for (var i = minIndex; i < this.screenEventHistory.length; i++) {
			let e2 = this.screenEventHistory[i]
			if (eventVertex(e).closeTo(eventVertex(e2), 2)) {
				// too close
				if (screenEventType(e) == screenEventType(e2) && screenEventType(e) != ScreenEventType.Move) {
					return true
				}
			} else if (!eventVertex(e).closeTo(eventVertex(e2), 200)) {
				// too far, this can't be either
				// (TODO: multiple touches)
				return true
			}
		}
		return false
	}


	// Gesture recognizers

	isTap(e1: ScreenEvent, e2: ScreenEvent, dt: number = 500): boolean {
	// Do these two events together form a tap gesture?
		return (screenEventType(e1) == ScreenEventType.Down
			&& screenEventType(e2) == ScreenEventType.Up
			&& Math.abs(e2.timeStamp - e1.timeStamp) < 500)
	}

	tapDetected(): boolean {
	// Have we just witnessed a tap?
		if (this.screenEventHistory.length < 2) { return false }
		let e1 = this.screenEventHistory[this.screenEventHistory.length - 2]
		let e2 = this.screenEventHistory[this.screenEventHistory.length - 1]
		return this.isTap(e1, e2)
	}

	doubleTapDetected(): boolean {
	// Do these fours events together form a double tap gesture?
		if (this.screenEventHistory.length < 4) { return false }
		let e1 = this.screenEventHistory[this.screenEventHistory.length - 4]
		let e2 = this.screenEventHistory[this.screenEventHistory.length - 3]
		let e3 = this.screenEventHistory[this.screenEventHistory.length - 2]
		let e4 = this.screenEventHistory[this.screenEventHistory.length - 1]
		return this.isTap(e1, e2) && this.isTap(e3, e4) && this.isTap(e1, e4, 1000)
		
	}

	mereTapDetected(): boolean {
		return this.tapDetected() && !this.doubleTapDetected()
	}


	// Cleanup methods

	clearScreenEventHistory() {
		this.screenEventHistory = []
	}

	resetTimeout() {
		if (this.timeoutID) {
			clearTimeout(this.timeoutID)
			this.timeoutID = null
		}
	}


	// Dragging methods

	/*
	Mobjects drag themselves, not via their parent.
	This is possible since the event target is fixed by hand
	as long as the gesture occurs, even if individual events
	(pointer moves) may trigger outside it because of lag.
	*/

	setDragging(flag: boolean) {
		if (flag) {
			if (this.draggingEnabled()) { return }
			this.savedOnPointerDown = this.onPointerDown
			this.savedOnPointerMove = this.onPointerMove
			this.savedOnPointerUp = this.onPointerUp
			this.onPointerDown = this.startDragging
			this.onPointerMove = this.dragging
			this.onPointerUp = this.endDragging
		} else {
			if (!this.draggingEnabled()) { return }
			this.onPointerDown = this.savedOnPointerDown
			this.onPointerMove = this.savedOnPointerMove
			this.onPointerUp = this.savedOnPointerUp
			this.savedOnPointerDown = (e: ScreenEvent) => { }
			this.savedOnPointerMove = (e: ScreenEvent) => { }
			this.savedOnPointerUp = (e: ScreenEvent) => { }
		}
	}

	draggingEnabled(): boolean {
		return (this.onPointerDown == this.startDragging)
	}

	startDragging(e: ScreenEvent) {
		this.dragAnchorStart = this.anchor.subtract(eventVertex(e))
	}

	dragging(e: ScreenEvent) {
		this.update({
			anchor: eventVertex(e).add(this.dragAnchorStart)
		})
	}

	endDragging(e: ScreenEvent) {
		this.dragAnchorStart = null
	}

}



























