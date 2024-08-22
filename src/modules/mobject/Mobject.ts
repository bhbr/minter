import { remove, stringFromPoint, log, deepCopy, getPaper } from '../helpers/helpers'
import { ScreenEventDevice, screenEventDevice, ScreenEventHandler, eventVertex, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, ScreenEvent, screenEventType, ScreenEventType, isTouchDevice } from './screen_events'
import { Vertex } from '../helpers/Vertex'
import { Transform } from '../helpers/Transform'
import { ExtendedObject } from '../helpers/ExtendedObject'
import { Color } from '../helpers/Color'
import { Dependency } from './Dependency'
import { VertexArray } from '../helpers/VertexArray'
import { Paper } from '../../Paper'
import { stackSize } from '../helpers/helpers'

/*
For debugging; draw the border of the mobject's view
(a HTMLDivelement) via a CSS property
*/
export const DRAW_BORDER: boolean = false

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
	
	It also allows to control the setting of fixed and default
	state variables.

	A mobject is created in four steps:

	STEP 1: [in this.statelessSetup()] //
	
	   Create all objects that any properties (state-defining variables)
	   may rely on (e. g. the view = HTMLDivElement).
	
	STEP 2: [in this.setAttributes(...)] //
	
	   Set all state variables.
	
	STEP 3: [in this.statefulSetup()] //
	
	   Complete the setup applying the properties
	   onto the objects created in step 1
	   (e. g. setting the view's width and height).
	   This step should only contain commands that
	   need to be run only once at the mobject's
	   creation.
	
	STEP 4: [in this.update(...)] //
	
	   All the ways the properties influence
	   the mobject whenever they change.
	*/

	constructor(argsDict: object = {}, isSuperCall = false) {
	/*
	A mobject is initialized by providing a dictionary (object)
	of parameters (argsDict).
	*/

		// First call all superclass constructors with no parameters at all
		super({}, true)
		if (isSuperCall) { return }

		// Now we are back in the lowest-class constructor

		// STEP 1
		this.statelessSetup()
		// STEP 2
		let initialArgs = this.initialArgs(argsDict)
		this.setAttributes(initialArgs)
		// STEP 3
		this.statefulSetup()
		// STEP 4
		this.update()
		
	}

	initialArgs(argsDict: object = {}): object {
	/*
	Adjust the constructor's arguments in light
	of default and fixed values.
	*/

		// Given values supercede default values
		let initialArgs = this.defaultArgs()
		Object.assign(initialArgs, argsDict)

		// Fixed values supercede given values
		Object.assign(initialArgs, this.fixedArgs())
		return initialArgs
	}

	defaultArgs(): object {
	/*
	Default values of properties (declared
	in the sections that follow).
	This list is complemented in subclasses
	by overriding the method like this:

		defaultArgs(): object {
			return Object.assign(super.defaultArgs(), {
				...
			})
		}
	*/
		return {
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
			drawBorder: DRAW_BORDER,

			// hierarchy
			children: [], // i. e. submobjects

			// dependencies
			dependencies: [],

			// interactivity
			screenEventHandler: ScreenEventHandler.Parent,
			savedScreenEventHandler: null,
			eventTarget: null,
			screenEventHistory: []
		}
	}

	fixedArgs(): object {
	// These are property values that cannot be changed,
	// either by arguments given to the constructor
	// or in a subclass.
	// For declaring fixed properties in a Mobject
	// subclass, override this method as described
	// further up in defaultArgs().
		return {}
	}

	statelessSetup() {
	// state-independent setup (step 1)

		// These methods for event handling need to be "bound"
		// to the mobject (whatever that means)
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
	}

	statefulSetup() {
	// state-dependent setup (step 3)
		this.setupView()
		addPointerDown(this.view, this.boundCapturedOnPointerDown)
		addPointerMove(this.view, this.boundCapturedOnPointerMove)
		addPointerUp(this.view, this.boundCapturedOnPointerUp)
	}



	//////////////////////////////////////////////////////////
	//                                                      //
	//                  POSITION AND SIZE                   //
	//                                                      //
	//////////////////////////////////////////////////////////


	/*
	Mainly the transform just has an anchor
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


	//////////////////////////////////////////////////////////
	//                                                      //
	//                    VIEW AND STYLE                    //
	//                                                      //
	//////////////////////////////////////////////////////////


	view?: HTMLDivElement
	// the following properties encode CSS properties
	opacity: number
	backgroundColor: Color
	drawBorder: boolean

	get visible(): boolean {
		return this.view.style['visibility'] == 'visible'
	}

	set visible(newValue: boolean) {
		this.view.style['visibility'] = newValue ? 'visible' : 'hidden'
	}


	setupView() {
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

	positionView() {
		if (!this.view) { return }
		this.view.style['transform'] = this.transform.withoutAnchor().toCSSString()
		this.view.style['left'] = `${this.anchor.x.toString()}px`
		this.view.style['top'] = `${this.anchor.y.toString()}px`
		this.view.style['width'] = `${this.viewWidth.toString()}px`
		this.view.style['height'] = `${this.viewHeight.toString()}px`
	}

	styleView() { // CSS properties
		if (!this.view) { return }
		this.view.style.border = this.drawBorder ? '1px dashed green' : 'none'
		this.view.style['background-color'] = this.backgroundColor.toCSS()
		this.view.style['opacity'] = this.opacity.toString()
	}


	// Drawing methods //

	redrawSelf() { }
	/*
	Redraw just yourself, not your children (submobs),
	overridden in subclasses
	*/

	redrawSubmobs() {
		for (let submob of this.children || []) {
			submob.redraw()
		}
	}

	redraw(recursive = true) {
		// redraw yourself and your children
		try {
			if (!this.view) { return }
			this.positionView()
			this.styleView()
			this.redrawSelf()
			if (recursive) {
				this.redrawSubmobs()
			}
		} catch {
			console.warn(`Unsuccessfully tried to draw ${this.constructor.name} (too soon?)`)
		}
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
		try {
			if (!this.view) { return }
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
		if (newValue.visible) {
			this.show()
		} else {
			this.hide()
		}
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
			submob.parent = this
		}
		// Add submob to the children
		if (this.children === undefined || this.children === null) {
			throw `Please add submob ${submob.constructor.name} to ${this.constructor.name} later, in statefulSetup()`
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
		if (submob.parent != this) {
			console.warn(`moveToTop: ${submob} is not yet a submob of ${this}`)
			return
		}
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

	updateModel(argsDict: object = {}) {
	// Update just the properties and what depends on them, without redrawing
		argsDict = this.consolidateTransformAndAnchor(argsDict) // see below
		this.setAttributes(argsDict)
		this.updateSubmobModels()

		for (let dep of this.dependencies || []) {

			let outputName: any = this[dep.outputName] // may be undefined
			if (typeof outputName === 'function') {
				dep.target[dep.inputName] = outputName.bind(this)()
			} else if (outputName !== undefined && outputName !== null) {
				dep.target[dep.inputName] = outputName
			}
			dep.target.updateModel()

		}
	}

	updateSubmobModels() {
		for (let submob of this.children || []) {
			if (!this.dependsOn(submob)) { // prevent dependency loops
				submob.updateModel()
			}
		}
	}

	update(argsDict: object = {}, redraw = true) {
	// Update with or without redrawing
		this.updateModel(argsDict)
		if (redraw) {
			this.redraw()
		}
		for (let depmob of this.dependents()) {
			depmob.update({}, redraw)
		}
	}

	updateFrom(mob: Mobject, attrs: Array<string>, redraw = true) {
		let updateDict: object = {}
		for (let attr of attrs) {
			updateDict[attr] = mob[attr]
		}
		this.update(updateDict, redraw)
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
	_screenEventHandler: ScreenEventHandler
	savedScreenEventHandler?: ScreenEventHandler
	dragAnchorStart?: Vertex

	screenEventHistory: Array<ScreenEvent>
	timeoutID?: number

	// empty method as workaround (don't ask)
	removeFreePoint(fp: any) { }

	onPointerDown(e: ScreenEvent) { }
	onPointerMove(e: ScreenEvent) { }
	onPointerUp(e: ScreenEvent) { }
	onTap(e: ScreenEvent) { }
	onDoubleTap(e: ScreenEvent) { }
	onLongPress(e: ScreenEvent) { }

	savedOnPointerDown(e: ScreenEvent) { }
	savedOnPointerMove(e: ScreenEvent) { }
	savedOnPointerUp(e: ScreenEvent) { }
	savedOnTap(e: ScreenEvent) { }
	savedOnLongPress(e: ScreenEvent) { }

	boundEventTargetMobject(e: ScreenEvent): Mobject { return this }
	boundCapturedOnPointerDown(e: ScreenEvent) { }
	boundCapturedOnPointerMove(e: ScreenEvent) { }
	boundCapturedOnPointerUp(e: ScreenEvent) { }
	boundRawOnPointerDown(e: ScreenEvent) { }
	boundRawOnPointerMove(e: ScreenEvent) { }
	boundRawOnPointerUp(e: ScreenEvent) { }
	boundRawOnLongPress(e: ScreenEvent) { }
	boundOnPointerDown(e: ScreenEvent) { }
	boundOnPointerMove(e: ScreenEvent) { }
	boundOnPointerUp(e: ScreenEvent) { }
	boundOnTap(e: ScreenEvent) { }

	get screenEventHandler(): ScreenEventHandler {
		return this._screenEventHandler
	}

	set screenEventHandler(newValue: ScreenEventHandler) {
		this._screenEventHandler = newValue
		if (this.view == undefined) { return }
		if (this.screenEventHandler == ScreenEventHandler.Below) {
			this.view.style['pointer-events'] = 'none'
		} else {
			this.view.style['pointer-events'] = 'auto'
		}
	}

	disable() {
		this.savedScreenEventHandler = this.screenEventHandler
		this.screenEventHandler = ScreenEventHandler.Parent // .Below?
	}

	enable() {
		if (this.savedScreenEventHandler === null) { return }
		this.screenEventHandler = this.savedScreenEventHandler
		this.savedScreenEventHandler = null
	}

	eventTargetMobjectChain(e: ScreenEvent): Array<Mobject> {
		// find the lowest Mobject willing and allowed to handle the event

		// collect the chain of target views (highest to lowest)
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
		targetViewChain.reverse()
		//log(targetViewChain)

		// collect the chain of corresponding target mobjects (lowest to highest)
		let targetMobChain: Array<Mobject> = []
		for (var view of targetViewChain.values()) {
			let m: any = view['mobject']
			if (m == undefined) { continue }
			let mob: Mobject = m as Mobject
			if (mob.screenEventHandler == ScreenEventHandler.Parent) { break }
			// only consider targets above the first .Parent
			targetMobChain.push(mob)
		}
		//log(targetMobChain)
		return targetMobChain
	}

	eventTargetMobject(e: ScreenEvent): Mobject | null {
		var t: Element = e.target as Element
		if (t == this.view) {
			return this
		}
		let targetMobChain = this.eventTargetMobjectChain(e)
		//log(targetMobChain)
		var m: any
		while (targetMobChain.length > 0) {
			//log('pop')
			m = targetMobChain.pop()
			//log(m)
			//log(m.screenEventHandler)
			if (m != undefined && (m.screenEventHandler == ScreenEventHandler.Self || m.screenEventHandler == ScreenEventHandler.Auto)) {
				//log(`event target mobject: ${m.constructor.name}`)
				//log(m.screenEventHandler)
				return m
			}
		}
		// if all of this fails, this mob must handle the event itself
		return this
	}

	capturedOnPointerDown(e: ScreenEvent) {
		this.eventTarget = this.boundEventTargetMobject(e)
		if (this.eventTarget == null) { return }
		if (this.eventTarget.screenEventHandler == ScreenEventHandler.Auto) { return }
		e.stopPropagation()
		this.eventTarget.rawOnPointerDown(e)
	}

	capturedOnPointerMove(e: ScreenEvent) {
		if (this.eventTarget == null) { return }
		if (this.eventTarget.screenEventHandler == ScreenEventHandler.Auto) { return }
		e.stopPropagation()
		this.eventTarget.rawOnPointerMove(e)
	}

	capturedOnPointerUp(e: ScreenEvent) {
		if (this.eventTarget == null) { return }
		if (this.eventTarget.screenEventHandler == ScreenEventHandler.Auto) { return }
		e.stopPropagation()
		this.eventTarget.rawOnPointerUp(e)
		this.eventTarget = null
	}

	localEventVertex(e: ScreenEvent): Vertex {
		let p: Vertex = eventVertex(e)
		let pp = getPaper()
		let rt = this.relativeTransform(pp)
		let inv = rt.inverse()
		let q = inv.appliedTo(p)
		return q
	}

	registerScreenEvent(e: ScreenEvent): boolean {
		// return value is a success flag
		// (false if e is just a duplicate of the latest registered event)
		if (isTouchDevice) {

			let minIndex = Math.max(0, this.screenEventHistory.length - 5)
			for (var i = minIndex; i < this.screenEventHistory.length; i++) {
				let e2 = this.screenEventHistory[i]
				if (eventVertex(e).closeTo(eventVertex(e2), 2)) {
					if (screenEventType(e) == screenEventType(e2)) {
						return false
					}	
				}
			}
		}
		this.screenEventHistory.push(e)
		return true
	}

	rawOnPointerDown(e: ScreenEvent) {
		if (!this.registerScreenEvent(e)) { return }
		this.onPointerDown(e)
		this.timeoutID = window.setTimeout(this.boundRawOnLongPress, 1000, e)
	}

	rawOnPointerMove(e: ScreenEvent) {
		if (!this.registerScreenEvent(e)) { return }
		this.resetTimeout()
		this.onPointerMove(e)
	}

	rawOnPointerUp(e: ScreenEvent) {
		if (!this.registerScreenEvent(e)) { return }
		this.resetTimeout()
		this.onPointerUp(e)
		if (this.tapDetected()) {
			this.onTap(e)
		}
		if (this.doubleTapDetected()) {
			this.onDoubleTap(e)
		}
		//window.setTimeout(this.clearScreenEventHistory, 2000)
	}

	clearScreenEventHistory() {
		this.screenEventHistory = []
	}

	isTap(e1: ScreenEvent, e2: ScreenEvent, dt: number = 500): boolean {
		return (screenEventType(e1) == ScreenEventType.Down
			&& screenEventType(e2) == ScreenEventType.Up
			&& Math.abs(e2.timeStamp - e1.timeStamp) < 500)
	}

	tapDetected(): boolean {
		if (this.screenEventHistory.length < 2) { return false }
		let e1 = this.screenEventHistory[this.screenEventHistory.length - 2]
		let e2 = this.screenEventHistory[this.screenEventHistory.length - 1]
		return this.isTap(e1, e2)
	}

	doubleTapDetected(): boolean {
		if (this.screenEventHistory.length < 4) { return false }
		let e1 = this.screenEventHistory[this.screenEventHistory.length - 4]
		let e2 = this.screenEventHistory[this.screenEventHistory.length - 3]
		let e3 = this.screenEventHistory[this.screenEventHistory.length - 2]
		let e4 = this.screenEventHistory[this.screenEventHistory.length - 1]
		return this.isTap(e1, e2) && this.isTap(e3, e4) && this.isTap(e1, e4, 1000)
		
	}

	rawOnLongPress(e: ScreenEvent) {
		this.onLongPress(e)
		this.resetTimeout()
	}

	resetTimeout() {
		if (this.timeoutID) {
			clearTimeout(this.timeoutID)
			this.timeoutID = null
		}
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

	draggingEnabled(): boolean {
		return (this.onPointerDown == this.startDragging)
	}

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




























}