
import { remove } from 'core/functions/arrays'
import { log } from 'core/functions/logging'
import { copy, deepCopy } from 'core/functions/copying'
import { getPaper } from 'core/functions/getters'
import { ScreenEventDevice, screenEventDevice, ScreenEventHandler, eventVertex, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, addPointerCancel, removePointerCancel, ScreenEvent, screenEventType, ScreenEventType, screenEventTypeAsString, screenEventDeviceAsString, screenEventDescription, isTouchDevice } from './screen_events'
import { vertex, vertexArray, isVertex, isVertexArray, vertexOrigin, vertexInterpolate, vertexArrayInterpolate, vertexCloseTo, vertexAdd, vertexSubtract } from 'core/functions/vertex'
import { Transform } from 'core/classes/Transform/Transform'
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { Color } from 'core/classes/Color'
import { Dependency } from './Dependency'
import { Paper } from 'core/Paper'
import { DRAW_BORDERS, MAX_TAP_DELAY, MERE_TAP_DELAY, LONG_PRESS_DURATION } from 'core/constants'

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
	The state is completely set by defaults().
	Any additional actions are performed afterwards in setup().
	
	Subclasses may also have quite a different setup
	than their superclass, and would otherwise have to undo
	a lot of the superclass's constructor setup.
	(E. g. a Circle's anchor should not be set, instead
	its midpoint should. A Circle's anchor acts like
	a computed property.)
	
	It also allows to control the setting of default
	state variables.

	*/

	constructor(args: object = {}) {
	/*
	A mobject is initialized by providing a dictionary (object)
	of parameters (args).
	*/
		super(args)
		this.setup()
		this.update()
		this.redraw()
	}

	ownDefaults(): object {
	/*
	Default values of properties (declared
	in the sections that follow).
	This list is complemented in subclasses
	by overriding the method.
	*/
		return {
			view: document.createElement('div'),
			children: [], // i. e. submobjects
			// The meaning of these properties is explained in the sections further below.

			// position
			transform: Transform.identity(),
			anchor: vertexOrigin(),
			viewWidth: 100,
			viewHeight: 100,
			/*
			Note: anchor is a property of transform
			and exposed to the mobject itself
			with a getter/setter.
			*/

			// view
			visible: true,
			opacity: 1.0,
			backgroundColor: Color.clear(),
			drawShadow: false,
			savedDrawShadow: null,
			drawBorder: DRAW_BORDERS,

			// hierarchy
			_parent: null,

			// dependencies
			dependencies: [],

			// interactivity
			screenEventHandler: ScreenEventHandler.Parent,
			savedScreenEventHandler: null,
			eventTarget: null,
			screenEventHistory: [],
			screenEventDevice: null,
			eventStartTime: 0,

			// animation
			animationStartArgs: {},
			animationStopArgs: {}
		}
	}

	ownMutabilities(): object {
		return {
			view: 'on_init',
			children: 'never'
		}
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
		addPointerDown(this.view, this.capturedOnPointerDown.bind(this))
		addPointerMove(this.view, this.capturedOnPointerMove.bind(this))
		addPointerUp(this.view, this.capturedOnPointerUp.bind(this))
		addPointerCancel(this.view, this.capturedOnPointerCancel.bind(this))
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
	get anchor(): vertex {
		return (this.transform ?? Transform.identity()).anchor
	}

	set anchor(newValue: vertex) {
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

	transformLocalPoint(point: vertex, frame?: Mobject): vertex {
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

	viewULCorner(frame?: Mobject): vertex {
		return this.transformLocalPoint(vertexOrigin(), frame)
	}

	viewURCorner(frame?: Mobject): vertex {
		return this.transformLocalPoint([this.viewWidth, 0], frame)
	}

	viewLLCorner(frame?: Mobject): vertex {
		return this.transformLocalPoint([0, this.viewHeight], frame)
	}

	viewLRCorner(frame?: Mobject): vertex {
		return this.transformLocalPoint([this.viewWidth, this.viewHeight], frame)
	}

	viewXMin(frame?: Mobject): number { return this.viewULCorner(frame)[0] }
	viewXMax(frame?: Mobject): number { return this.viewLRCorner(frame)[0] }
	viewYMin(frame?: Mobject): number { return this.viewULCorner(frame)[1] }
	viewYMax(frame?: Mobject): number { return this.viewLRCorner(frame)[1] }

	viewCenter(frame?: Mobject): vertex {
		let p = this.transformLocalPoint([this.viewWidth/2, this.viewHeight/2], frame)
		return p
	}

	viewMidX(frame?: Mobject): number { return this.viewCenter(frame)[0] }
	viewMidY(frame?: Mobject): number { return this.viewCenter(frame)[1] }

	viewLeftCenter(frame?: Mobject): vertex { return [this.viewXMin(frame), this.viewMidY(frame)] }
	viewRightCenter(frame?: Mobject): vertex { return [this.viewXMax(frame), this.viewMidY(frame)] }
	viewTopCenter(frame?: Mobject): vertex { return [this.viewMidX(frame), this.viewYMin(frame)] }
	viewBottomCenter(frame?: Mobject): vertex { return [this.viewMidX(frame), this.viewYMax(frame)] }

	/*
	Equivalent (by default) versions without "view" in the name
	These can be overriden in subclasses, e. g. in VMobject using
	its vertices.
	*/

	ulCorner(frame?: Mobject): vertex { return this.viewULCorner(frame) }
	urCorner(frame?: Mobject): vertex { return this.viewURCorner(frame) }
	llCorner(frame?: Mobject): vertex { return this.viewLLCorner(frame) }
	lrCorner(frame?: Mobject): vertex { return this.viewLRCorner(frame) }

	xMin(frame?: Mobject): number { return this.viewXMin(frame) }
	xMax(frame?: Mobject): number { return this.viewXMax(frame) }
	yMin(frame?: Mobject): number { return this.viewYMin(frame) }
	yMax(frame?: Mobject): number { return this.viewYMax(frame) }

	center(frame?: Mobject): vertex { return this.viewCenter(frame) }

	midX(frame?: Mobject): number { return this.viewMidX(frame) }
	midY(frame?: Mobject): number { return this.viewMidY(frame) }

	leftCenter(frame?: Mobject): vertex { return this.viewLeftCenter(frame) }
	rightCenter(frame?: Mobject): vertex { return this.viewRightCenter(frame) }
	topCenter(frame?: Mobject): vertex { return this.viewTopCenter(frame) }
	bottomCenter(frame?: Mobject): vertex { return this.viewBottomCenter(frame) }

	// Local versions (relative to own coordinate system)

	localULCorner(): vertex { return this.ulCorner(this) }
	localURCorner(): vertex { return this.urCorner(this) }
	localLLCorner(): vertex { return this.llCorner(this) }
	localLRCorner(): vertex { return this.lrCorner(this) }

	localXMin(): number { return this.xMin(this) }
	localXMax(): number { return this.xMax(this) }
	localYMin(): number { return this.yMin(this) }
	localYMax(): number { return this.yMax(this) }

	localCenter(): vertex { return this.center(this) }

	localMidX(): number { return this.midX(this) }
	localMidY(): number { return this.midY(this) }

	localLeftCenter(): vertex { return this.leftCenter(this) }
	localRightCenter(): vertex { return this.rightCenter(this) }
	localTopCenter(): vertex { return this.topCenter(this) }
	localBottomCenter(): vertex { return this.bottomCenter(this) }

	getWidth(): number { return this.localXMax() - this.localXMin() }
	getHeight(): number { return this.localYMax() - this.localYMin() }

	adjustFrame() {
	// Set the view anchor and size to fit the frame as computed from the vertices
		let shift = new Transform({ shift: this.localULCorner() })
		let inverseShift = shift.inverse()
		let updateDict: object = {}

		for (let [key, value] of Object.entries(this)) {
			var newValue: any
			if (isVertex(value)) {
				newValue = inverseShift.appliedTo(value)
			} else if (isVertexArray(value)) {
				newValue = []
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
	drawShadow: boolean
	savedDrawShadow: boolean | null
	drawBorder: boolean

	setupView() {
		if (!this.view) { return }
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
		this.view.style.border = this.drawBorder ? '1px dashed green' : 'none'
		if (this.drawShadow) {
			this.enableShadow()
		}
	}

	redraw() {
		if (!this.view) { return }
		this.view.style.transform = this.transform.withoutAnchor().toCSSString()
		this.view.style.left = `${this.anchor[0].toString()}px`
		this.view.style.top = `${this.anchor[1].toString()}px`
		this.view.style.width = `${this.viewWidth.toString()}px`
		this.view.style.height = `${this.viewHeight.toString()}px`
		this.view.style.backgroundColor = this.backgroundColor.toCSS()
		this.view.style.opacity = this.opacity.toString()

		this.setViewVisibility(this.shouldBeDrawn())
	}

	setViewVisibility(visibility: boolean) {
		this.view.style.visibility = visibility ? 'visible' : 'hidden'
		for (let submob of this.submobs) {
			submob.setViewVisibility(submob.visible && visibility)
		}
	}

	enableShadow() {
		if (this.savedDrawShadow !== null) {
			this.drawShadow = this.savedDrawShadow
		}
		this.savedDrawShadow = null
		if (this.drawShadow) {
			this.view.style.filter = 'drop-shadow(2px 2px 5px)'
		}
	}

	disableShadow() {
		this.savedDrawShadow = this.drawShadow
		this.drawShadow = false
		this.view.style.filter = ''
		this.parent.update()
	}

	shouldBeDrawn(): boolean {
		if (!this.visible) { return false }
		for (let a of this.ancestors()) {
			if (!a.visible) { return false }
		}
		return true
	}

	// Show and hide //

	show() {
		this.visible = true
		this.setViewVisibility(this.visible)
	}

	hide() {
		this.visible = false
		this.setViewVisibility(this.visible)
	}

	showDependents() {
		for (let depmob of this.allDependents()) {
			depmob.show()
		}
	}

	hideDependents() {
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
	number array, vertexArray, Transform) can be animated.
	For this, we create animationStopArgs (the given
	animation arguments), and animationStartArgs
	(the dict of corresponding current values).
	Then, at regular intervals, we compute
	a convex combination of each property
	and update this mobject with those.
	*/

	animationTimeStart: number
	animationDuration: number
	animationInterval: number

	animationStartArgs: object
	animationStopArgs: object

	static isAnimatable(args: object): boolean {
		for (let [key, value] of Object.entries(args)) {
			if ((typeof value ==  'number') 
				|| isVertex(value)
				|| isVertexArray(value)
				|| value instanceof Transform
				|| value instanceof Color)
				{ continue }
			else {
				console.error(`Property ${key} on ${this.constructor.name} is not animatable`)
				return false
			}
		}
		return true
	}

	animate(args: object = {}, seconds: number) {
	// Calling this method launches an animation
		if (!Mobject.isAnimatable(args)) {
			return
		}

		for (let key of Object.keys(args)) {
			this.animationStartArgs[key] = copy(this[key])
		}
		this.animationStopArgs = args

		// all times in ms bc that is what setInterval and setTimeout expect
		let dt = 10
		this.animationTimeStart = Date.now()
		this.animationDuration = seconds * 1000
		this.disableShadow()

		this.animationInterval = window.setInterval(
			function() {
				this.updateAnimation(Object.keys(args))
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
		let newArgs = this.interpolatedAnimationArgs(keys, weight)
		this.update(newArgs, true)
	}

	interpolatedAnimationArgs(keys: Array<string>, weight: number): object {
	/*
	Compute a convex combination between the start and stop values
	of each key. The custom types (all except number) all have
	their own interpolation method.
	*/
		let returnValues: object = {}
		for (let key of keys) {
			let startValue: any = this.animationStartArgs[key]
			let stopValue: any = this.animationStopArgs[key]
			if (typeof startValue ==  'number') {
				returnValues[key] = (1 - weight) * startValue + weight * stopValue
			} else if (isVertex(startValue)) {
				returnValues[key] = vertexInterpolate(startValue, stopValue as vertex, weight)
			} else if (isVertexArray(startValue)) {
				returnValues[key] = vertexArrayInterpolate(startValue, stopValue as vertexArray, weight)
			} else if (startValue instanceof Transform) {
				returnValues[key] = startValue.interpolate(stopValue as Transform, weight)
			} else if (startValue instanceof Color) {
				returnValues[key] = startValue.interpolate(stopValue as Color, weight)
			}
		}
		return returnValues
	}

	cleanupAfterAnimation() {
	// This method gets called at the end of the animation
		window.clearInterval(this.animationInterval)
		this.animationInterval = null
		this.animationStartArgs = {}
		this.animationStopArgs = {}
		this.enableShadow()
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
			let dict = {}
			if (typeof this[outputName] === 'function') {
				dict[inputName] = this[outputName]()
			} else {
				dict[inputName] = this[outputName]
			}
			target.update(dict)
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

	synchronizeUpdateArguments(args: object = {}): object {
		let syncedArgs: object = copy(args)
		let a = args['anchor']
		if (a !== undefined) {
			let t = args['transform'] ?? this.transform ?? Transform.identity()
			t.anchor = a
			syncedArgs['transform'] = t
			delete syncedArgs['anchor']
		}
		return syncedArgs
	}

	update(args: object = {}, redraw: boolean = true) {

		super.update(args)

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
			if (Object.keys(updateDict).includes('null')) {
				target.update()
			} else {
				target.update(updateDict)
			}
		}
		if (redraw) { this.redraw() }
	}


	//////////////////////////////////////////////////////////
	//                                                      //
	//                     INTERACTIVITY                    //
	//                                                      //
	//////////////////////////////////////////////////////////


	eventTarget?: Mobject
	screenEventHandler: ScreenEventHandler
	savedScreenEventHandler?: ScreenEventHandler
	dragAnchorStart?: vertex
	screenEventDevice?: ScreenEventDevice

	screenEventHistory: Array<ScreenEvent>
	resetPointerTimeoutID?: number
	deleteHistoryTimeoutID?: number
	longPressTimeoutID?: number
	mereTapTimeoutID?: number

	eventStartTime: number

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

	onTouchDown(e: ScreenEvent) { this.onPointerDown(e) }
	onTouchMove(e: ScreenEvent) { this.onPointerMove(e) }
	onTouchUp(e: ScreenEvent) { this.onPointerUp(e) }
	onTouchTap(e: ScreenEvent) { this.onTap(e) }
	onMereTouchTap(e: ScreenEvent) { this.onMereTap(e) }
	onDoubleTouchTap(e: ScreenEvent) { this.onDoubleTap(e) }
	onLongTouchDown(e: ScreenEvent) { this.onLongPress(e) }
	onPenDown(e: ScreenEvent) { this.onPointerDown(e) }
	onPenMove(e: ScreenEvent) { this.onPointerMove(e) }
	onPenUp(e: ScreenEvent) { this.onPointerUp(e) }
	onPenTap(e: ScreenEvent) { this.onTap(e) }
	onMerePenTap(e: ScreenEvent) { this.onMereTap(e) }
	onDoublePenTap(e: ScreenEvent) { this.onDoubleTap(e) }
	onLongPenDown(e: ScreenEvent) { this.onLongPress(e) }
	onMouseDown(e: ScreenEvent) { this.onPointerDown(e) }
	onMouseMove(e: ScreenEvent) { this.onPointerMove(e) }
	onMouseUp(e: ScreenEvent) { this.onPointerUp(e) }
	onMouseClick(e: ScreenEvent) { this.onTap(e) }
	onMereMouseClick(e: ScreenEvent) { this.onMereTap(e) }
	onDoubleMouseClick(e: ScreenEvent) { this.onDoubleTap(e) }
	onLongMouseDown(e: ScreenEvent) { this.onLongPress(e) }

	onPointerCancel(e: ScreenEvent) { }

	/*
	Backup versions for temporarily disabling
	interactivity on a mobject (e. g. while dragging)
	*/

	savedOnTouchDown(e: ScreenEvent) { }
	savedOnTouchMove(e: ScreenEvent) { }
	savedOnTouchUp(e: ScreenEvent) { }
	savedOnTouchTap(e: ScreenEvent) { }
	savedOnMereTouchTap(e: ScreenEvent) { }
	savedOnDoubleTouchTap(e: ScreenEvent) { }
	savedOnLongTouchDown(e: ScreenEvent) { }

	savedOnPenDown(e: ScreenEvent) { }
	savedOnPenMove(e: ScreenEvent) { }
	savedOnPenUp(e: ScreenEvent) { }
	savedOnPenTap(e: ScreenEvent) { }
	savedOnMerePenTap(e: ScreenEvent) { }
	savedOnDoublePenTap(e: ScreenEvent) { }
	savedOnLongPenDown(e: ScreenEvent) { }

	savedOnMouseDown(e: ScreenEvent) { }
	savedOnMouseMove(e: ScreenEvent) { }
	savedOnMouseUp(e: ScreenEvent) { }
	savedOnMouseClick(e: ScreenEvent) { }
	savedOnMereMouseClick(e: ScreenEvent) { }
	savedOnDoubleMouseClick(e: ScreenEvent) { }
	savedOnLongMouseDown(e: ScreenEvent) { }

	/*
	Methods for temporarily disabling interactivity on a mobject
	(e. g. when dragging a CindyCanvas)
	*/
	disable() {
		if (this.isDisabled()) { return }
		this.savedScreenEventHandler = this.screenEventHandler
		this.screenEventHandler = ScreenEventHandler.Parent // .Below?
	}

	enable() {
		if (this.isEnabled()) { return }
		this.screenEventHandler = this.savedScreenEventHandler
		this.savedScreenEventHandler = null
	}

	isEnabled(): boolean {
		return (this.savedScreenEventHandler === null)
	}

	isDisabled(): boolean {
		return !this.isEnabled()
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
				continue
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
	*/

	capturedOnPointerDown(e: ScreenEvent) {

		if (this.eventStartTime == 0) {
			this.eventStartTime = e.timeStamp
		}

		let target = this.eventTargetMobject(e)
		this.eventTarget = target
		if (target == null) { return }
		
		if (target.screenEventHandler == ScreenEventHandler.Auto) { return }
		e.stopPropagation()

		this.clearResetPointer()
		this.clearDeleteHistoryTimeout()
		this.decideEventAction(e)
		
	}

	capturedOnPointerMove(e: ScreenEvent) {

		let target = this.eventTarget
		if (target == null || this.screenEventDevice == null) { return }
		if (target.screenEventHandler == ScreenEventHandler.Auto) { return }
		e.stopPropagation()

		switch (this.screenEventDevice) {
		case ScreenEventDevice.Finger:
			target.onTouchMove(e)
			break
		case ScreenEventDevice.Pen:
			target.onPenMove(e)
			break
		case ScreenEventDevice.Mouse:
			target.onMouseMove(e)
			break
		default:
			throw `Unknown pointer device ${target.screenEventDevice}`
		}
	}

	capturedOnPointerUp(e: ScreenEvent) {
		
		let target = this.eventTarget
		if (target == null || this.screenEventDevice == null) { return }
		if (target.screenEventHandler == ScreenEventHandler.Auto) { return }
		e.stopPropagation()
		e.preventDefault()

		this.decideEventAction(e)
		if (this.deleteHistoryTimeoutID != null) { return }
		this.deleteHistoryTimeoutID = window.setTimeout(this.deleteScreenEventHistory.bind(this), 1000
		)
	}

	capturedOnPointerCancel(e: ScreenEvent) {
		
		let target = this.eventTarget
		if (target == null || this.screenEventDevice == null) { return }
		if (target.screenEventHandler == ScreenEventHandler.Auto) { return }
		e.stopPropagation()

		target.onPointerCancel(e)
		this.deleteScreenEventHistory()
	}

	decideEventAction(e: ScreenEvent) {
		let device = screenEventDevice(e)
		let type = screenEventType(e)

		if (e instanceof MouseEvent && device == ScreenEventDevice.Pen && type == ScreenEventType.Down) {
			//log('case 1')
			this.eventTarget.rawOnPenDown(e)
			this.eventTarget.registerScreenEvent(e)
			this.screenEventDevice = ScreenEventDevice.Pen
		} else if (e instanceof PointerEvent && device == ScreenEventDevice.Pen && type == ScreenEventType.Up) {
			//log('case 2')
			this.eventTarget.rawOnPenUp(e)
			this.eventTarget.registerScreenEvent(e)
			this.resetPointer()
		} else if (e instanceof MouseEvent && device == ScreenEventDevice.Pen && type == ScreenEventType.Up) {
			//log('case 3')
			// ignore
		} else if (e instanceof MouseEvent && device == ScreenEventDevice.Finger && type == ScreenEventType.Down) {
			//log('case 4')
			this.eventTarget.rawOnTouchDown(e)
			this.eventTarget.registerScreenEvent(e)
			this.screenEventDevice = ScreenEventDevice.Finger
		} else if (e instanceof PointerEvent && device == ScreenEventDevice.Finger && type == ScreenEventType.Up) {
			//log('case 5')
			this.eventTarget.rawOnTouchUp(e)
			this.eventTarget.registerScreenEvent(e)
			this.resetPointer()
		} else if (e instanceof MouseEvent && device == ScreenEventDevice.Finger && type == ScreenEventType.Up) {
			//log('case 6')
			// ignore
		} else if (e instanceof MouseEvent && device == ScreenEventDevice.Mouse && type == ScreenEventType.Down) {
			if (this.screenEventDevice == ScreenEventDevice.Finger) {
				//log('case 7a')
				// ignore
			} else if (this.screenEventDevice == ScreenEventDevice.Pen) {
				//log('case 7b')
				// ignore
			} else {
				//log('case 7c')
				this.eventTarget.rawOnMouseDown(e)
				this.eventTarget.registerScreenEvent(e)
				this.screenEventDevice = ScreenEventDevice.Mouse
			}
		} else if (e instanceof PointerEvent && device == ScreenEventDevice.Mouse && type == ScreenEventType.Up) {
			if (this.screenEventDevice == ScreenEventDevice.Finger) {
				if (isTouchDevice) {
					//log('case 8a1')
					this.eventTarget.rawOnTouchUp(e)
					this.eventTarget.registerScreenEvent(e)
					this.resetPointerTimeoutID = window.setTimeout(this.resetPointer.bind(this), 250)
				} else {
					//log('case 8a2')
					// ignore
				}
			} else if (this.screenEventDevice == ScreenEventDevice.Pen) {
				if (isTouchDevice) {
					//log('case 8b1')
					this.eventTarget.rawOnPenUp(e)
					this.eventTarget.registerScreenEvent(e)
					this.resetPointerTimeoutID = window.setTimeout(this.resetPointer.bind(this), 250)
				} else {
					//log('case 8b2')
					// ignore
				}
			} else {
				//log('case 8c')
				this.eventTarget.rawOnMouseUp(e)
				this.eventTarget.registerScreenEvent(e)
				this.resetPointerTimeoutID = window.setTimeout(this.resetPointer.bind(this), 250)
			}
		} else if (e instanceof MouseEvent && device == ScreenEventDevice.Mouse && type == ScreenEventType.Up) {
			// ignore
			//log('case 9')
		} else if (e instanceof TouchEvent && device == ScreenEventDevice.Finger && type == ScreenEventType.Down) {
			//log('case 10')
			this.eventTarget.rawOnTouchDown(e)
			this.eventTarget.registerScreenEvent(e)
			this.screenEventDevice = ScreenEventDevice.Finger
		} else if (e instanceof TouchEvent && device == ScreenEventDevice.Pen && type == ScreenEventType.Down) {
			//log('case 11')
			this.eventTarget.rawOnPenDown(e)
			this.eventTarget.registerScreenEvent(e)
			this.screenEventDevice = ScreenEventDevice.Pen
		} else {
			//log('case 12')
			// ignore
		}
	}

	resetPointer() {
		this.screenEventDevice = null
		this.resetPointerTimeoutID = null
	}

	clearResetPointer() {
		window.clearTimeout(this.resetPointerTimeoutID)
		this.resetPointerTimeoutID = null
	}

	registerScreenEvent(e: ScreenEvent) {
		this.screenEventHistory.push(e)
	}

	rawOnTouchDown(e: ScreenEvent) {
		this.longPressTimeoutID = window.setTimeout(this.onLongTouchDown.bind(this), LONG_PRESS_DURATION)
		this.onTouchDown(e)
	}

	rawOnTouchUp(e: ScreenEvent) {
		let e1 = this.screenEventHistory[this.screenEventHistory.length - 1]
		if (e.timeStamp - e1.timeStamp < MAX_TAP_DELAY) {
			this.clearMereTapTimeout()
			this.onTouchTap(e)
			this.mereTapTimeoutID = window.setTimeout(function() {
				this.mereTapTimeoutID = null
				if (this.screenEventHistory.length == 2) {
					this.onMereTouchTap(e)
				}
			}.bind(this), MERE_TAP_DELAY)
			if (this.screenEventHistory.length == 3) {
				let e2 = this.screenEventHistory[this.screenEventHistory.length - 2]
				let e3 = this.screenEventHistory[this.screenEventHistory.length - 3]
				if (e1.timeStamp - e2.timeStamp < MAX_TAP_DELAY && e2.timeStamp - e3.timeStamp < MAX_TAP_DELAY) {
					this.onDoubleTouchTap(e)
				}
			}
		}
		this.onTouchUp(e)
	}

	rawOnPenDown(e: ScreenEvent) {
		this.longPressTimeoutID = window.setTimeout(this.onLongPenDown.bind(this), LONG_PRESS_DURATION)
		this.onPenDown(e)
	}

	rawOnPenUp(e: ScreenEvent) {
		let e1 = this.screenEventHistory[this.screenEventHistory.length - 1]
		if (e.timeStamp - e1.timeStamp < MAX_TAP_DELAY) {
			this.onPenTap(e)
			this.mereTapTimeoutID = window.setTimeout(function() {
				this.mereTapTimeoutID = null
				if (this.screenEventHistory.length == 2) {
					this.onMerePenTap(e)
				}
			}.bind(this), MERE_TAP_DELAY)
			if (this.screenEventHistory.length == 3) {
				let e2 = this.screenEventHistory[this.screenEventHistory.length - 2]
				let e3 = this.screenEventHistory[this.screenEventHistory.length - 3]
				if (e1.timeStamp - e2.timeStamp < MAX_TAP_DELAY && e2.timeStamp - e3.timeStamp < MAX_TAP_DELAY) {
					this.onDoublePenTap(e)
				}
			}
		}
		this.onPenUp(e)
	}

	rawOnMouseDown(e: ScreenEvent) {
		this.longPressTimeoutID = window.setTimeout(this.onLongMouseDown.bind(this), LONG_PRESS_DURATION)
		this.onMouseDown(e)
	}

	rawOnMouseUp(e: ScreenEvent) {
		let e1 = this.screenEventHistory[this.screenEventHistory.length - 1]
		if (e.timeStamp - e1.timeStamp < MAX_TAP_DELAY) {
			this.onMouseClick(e)
			this.mereTapTimeoutID = window.setTimeout(function() {
				this.mereTapTimeoutID = null
				if (this.screenEventHistory.length == 2) {
					this.onMereMouseClick(e)
				}
			}.bind(this), MERE_TAP_DELAY)
			if (this.screenEventHistory.length == 3) {
				let e2 = this.screenEventHistory[this.screenEventHistory.length - 2]
				let e3 = this.screenEventHistory[this.screenEventHistory.length - 3]
				if (e1.timeStamp - e2.timeStamp < MAX_TAP_DELAY && e2.timeStamp - e3.timeStamp < MAX_TAP_DELAY) {
					this.onDoubleMouseClick(e)
				}
			}
		}
		this.onMouseUp(e)
	}

	// Local coordinates for use in custom event methods

	localEventVertex(e: ScreenEvent): vertex {
	/*
	eventVertex(e) gives the coordinates in the topmost
	mobject's frame (paper or sidebar). This method here
	finds them in the mobject's local frame.
	*/
		let p: vertex = eventVertex(e)
		let rt = this.relativeTransform(getPaper())
		let q = rt.inverse().appliedTo(p)
		return q
	}


	// Cleanup methods

	deleteScreenEventHistory() {
		this.screenEventHistory = []
		this.eventTarget = null
		this.deleteHistoryTimeoutID = null
	}

	clearDeleteHistoryTimeout() {
		if (this.deleteHistoryTimeoutID) {
			clearTimeout(this.deleteHistoryTimeoutID)
			this.deleteHistoryTimeoutID = null
		}
	}

	clearMereTapTimeout() {
		if (this.mereTapTimeoutID) {
			window.clearInterval(this.mereTapTimeoutID)
			this.mereTapTimeoutID = null
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

			this.savedOnTouchDown = this.onTouchDown
			this.savedOnTouchMove = this.onTouchMove
			this.savedOnTouchUp = this.onTouchUp
			this.savedOnTouchTap = this.onTouchTap
			this.savedOnMereTouchTap = this.onMereTouchTap
			this.savedOnDoubleTouchTap = this.onDoubleTouchTap
			this.savedOnLongTouchDown = this.onLongTouchDown

			this.savedOnPenDown = this.onPenDown
			this.savedOnPenMove = this.onPenMove
			this.savedOnPenUp = this.onPenUp
			this.savedOnPenTap = this.onPenTap
			this.savedOnMerePenTap = this.onMerePenTap
			this.savedOnDoublePenTap = this.onDoublePenTap
			this.savedOnLongPenDown = this.onLongPenDown

			this.savedOnMouseDown = this.onMouseDown
			this.savedOnMouseMove = this.onMouseMove
			this.savedOnMouseUp = this.onMouseUp
			this.savedOnMouseClick = this.onMouseClick
			this.savedOnMereMouseClick = this.onMereMouseClick
			this.savedOnDoubleMouseClick = this.onDoubleMouseClick
			this.savedOnLongMouseDown = this.onLongMouseDown

			this.onTouchDown = this.startDragging
			this.onTouchMove = this.dragging
			this.onTouchUp = this.endDragging
			this.onTouchTap = (e: ScreenEvent) => { }
			this.onMereTouchTap = (e: ScreenEvent) => { }
			this.onDoubleTouchTap = (e: ScreenEvent) => { }
			this.onLongTouchDown = (e: ScreenEvent) => { }

			this.onPenDown = this.startDragging
			this.onPenMove = this.dragging
			this.onPenUp = this.endDragging
			this.onPenTap = (e: ScreenEvent) => { }
			this.onMerePenTap = (e: ScreenEvent) => { }
			this.onDoublePenTap = (e: ScreenEvent) => { }
			this.onLongPenDown = (e: ScreenEvent) => { }

			this.onMouseDown = this.startDragging
			this.onMouseMove = this.dragging
			this.onMouseUp = this.endDragging
			this.onMouseClick = (e: ScreenEvent) => { }
			this.onMereMouseClick = (e: ScreenEvent) => { }
			this.onDoubleMouseClick = (e: ScreenEvent) => { }
			this.onLongMouseDown = (e: ScreenEvent) => { }

		} else {

			if (!this.draggingEnabled()) { return }

			this.onTouchDown = this.savedOnTouchDown
			this.onTouchMove = this.savedOnTouchMove
			this.onTouchUp = this.savedOnTouchUp
			this.onTouchTap = this.savedOnTouchTap
			this.onMereTouchTap = this.savedOnMereTouchTap
			this.onDoubleTouchTap = this.savedOnDoubleTouchTap
			this.onLongTouchDown = this.savedOnLongTouchDown

			this.onPenDown = this.savedOnPenDown
			this.onPenMove = this.savedOnPenMove
			this.onPenUp = this.savedOnPenUp
			this.onPenTap = this.savedOnPenTap
			this.onMerePenTap = this.savedOnMerePenTap
			this.onDoublePenTap = this.savedOnDoublePenTap
			this.onLongPenDown = this.savedOnLongPenDown

			this.onMouseDown = this.savedOnMouseDown
			this.onMouseMove = this.savedOnMouseMove
			this.onMouseUp = this.savedOnMouseUp
			this.onMouseClick = this.savedOnMouseClick
			this.onMereMouseClick = this.savedOnMereMouseClick
			this.onDoubleMouseClick = this.savedOnDoubleMouseClick
			this.onLongMouseDown = this.savedOnLongMouseDown

			this.savedOnTouchDown = (e: ScreenEvent) => { }
			this.savedOnTouchMove = (e: ScreenEvent) => { }
			this.savedOnTouchUp = (e: ScreenEvent) => { }
			this.savedOnTouchTap = (e: ScreenEvent) => { }
			this.savedOnMereTouchTap = (e: ScreenEvent) => { }
			this.savedOnDoubleTouchTap = (e: ScreenEvent) => { }
			this.savedOnLongTouchDown = (e: ScreenEvent) => { }

			this.savedOnPenDown = (e: ScreenEvent) => { }
			this.savedOnPenMove = (e: ScreenEvent) => { }
			this.savedOnPenUp = (e: ScreenEvent) => { }
			this.savedOnPenTap = (e: ScreenEvent) => { }
			this.savedOnMerePenTap = (e: ScreenEvent) => { }
			this.savedOnDoublePenTap = (e: ScreenEvent) => { }
			this.savedOnLongPenDown = (e: ScreenEvent) => { }

			this.savedOnMouseDown = (e: ScreenEvent) => { }
			this.savedOnMouseMove = (e: ScreenEvent) => { }
			this.savedOnMouseUp = (e: ScreenEvent) => { }
			this.savedOnMouseClick = (e: ScreenEvent) => { }
			this.savedOnMereMouseClick = (e: ScreenEvent) => { }
			this.savedOnDoubleMouseClick = (e: ScreenEvent) => { }
			this.savedOnLongMouseDown = (e: ScreenEvent) => { }
		}
	}

	draggingEnabled(): boolean {
		return (this.onTouchDown == this.startDragging)
	}

	startDragging(e: ScreenEvent) {
		this.dragAnchorStart = vertexSubtract(this.anchor, eventVertex(e))
		this.disableShadow()
	}

	dragging(e: ScreenEvent) {
		this.update({
			anchor: vertexAdd(eventVertex(e), this.dragAnchorStart)
		})
	}

	endDragging(e: ScreenEvent) {
		this.dragAnchorStart = null
		this.enableShadow()
	}

}



























