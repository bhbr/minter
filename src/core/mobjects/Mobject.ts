
import { remove } from 'core/functions/arrays'
import { log } from 'core/functions/logging'
import { copy } from 'core/functions/copying'
import { ScreenEventHandler, eventVertex, addPointerDown, addPointerMove, addPointerUp, addPointerOut, ScreenEvent, screenEventType, ScreenEventType } from './screen_events'
import { vertex, vertexAdd, vertexSubtract } from 'core/functions/vertex'
import { Transform } from 'core/classes/Transform/Transform'
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { Color } from 'core/classes/Color'
import { Dependency } from './Dependency'
import { Frame } from './Frame'
import { View } from './View'
import { Motor } from './Motor'
import { Sensor } from './Sensor'

export class Mobject extends ExtendedObject {

/*
A mobject (math object) has a view with an underlying state and logic
for drawing (View), animation (Motor) and user interaction (Sensor).
 */

	//////////////////////////////////////////////////////////
	//                                                      //
	//                    INITIALIZATION                    //
	//                                                      //
	//////////////////////////////////////////////////////////

	/*
	Subclasses dot NOT get their own explicit constructor.
	The state is completely set by fullDefaults().
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
		this.view.redraw()
	}

	defaults(): object {
	/*
	Default values of properties (declared
	in the sections that follow).
	This list is complemented in subclasses
	by overriding the method.
	*/
		return {
			view: new View(),
			children: [], // i. e. submobjects
			// The meaning of these properties is explained in the sections further below.

			motor: new Motor(),
			sensor: new Sensor(),

			// hierarchy
			_parent: null,

			// dependencies
			dependencies: [],

			draggingEnabled: false
		}
	}

	mutabilities(): object {
		return {
			view: 'on_init',
			children: 'never'
		}
	}

	setup() {
		this.view.mobject = this
		this.view.setup()
		this.motor.mobject = this
		this.sensor.mobject = this

		// put into sensor setup?
		addPointerDown(this.view.div, this.sensor.capturedOnPointerDown.bind(this.sensor))
		addPointerMove(this.view.div, this.sensor.capturedOnPointerMove.bind(this.sensor))
		addPointerUp(this.view.div, this.sensor.capturedOnPointerUp.bind(this.sensor))
		addPointerOut(this.view.div, this.sensor.capturedOnPointerOut.bind(this.sensor))
	}

	// this.anchor is a synonym for this.frame.anchor
	get anchor(): vertex {
		return this.view?.anchor ?? [0, 0]
	}

	set anchor(newValue: vertex) {
		if (!this.view) { return }
		this.view.anchor = newValue
	}

	get transform(): Transform {
		return this.view?.transform ?? Transform.identity()
	}

	set transform(newValue: Transform) {
		if (!this.view) { return }
		this.view.transform = newValue
	}

	get frame(): Frame {
		return this.view.frame
	}

	set frame(newValue: Frame) {
		this.view.frame = newValue
	}

	get frameWidth(): number {
		return this.frame.width
	}

	set frameWidth(newValue: number) {
		this.frame.width = newValue
	}

	get frameHeight(): number {
		return this.frame.height ?? 0
	}

	set frameHeight(newValue: number) {
		this.frame.height = newValue
	}



	//////////////////////////////////////////////////////////
	//                                                      //
	//                    VIEW AND STYLE                    //
	//                                                      //
	//////////////////////////////////////////////////////////

	view: View

	get visible(): boolean { return this.view.visible }
	set visible(newValue: boolean) { this.view.visible = newValue }

	get opacity(): number { return this.view.opacity }
	set opacity(newValue: number) { this.view.opacity = newValue }

	get backgroundColor(): Color { return this.view.backgroundColor }
	set backgroundColor(newValue: Color) { this.view.backgroundColor = newValue }

	get drawBorder(): boolean { return this.view.drawBorder }
	set drawBorder(newValue: boolean) { this.view.drawBorder = newValue }

	get drawShadow(): boolean { return this.view.drawShadow }
	set drawShadow(newValue: boolean) { this.view.drawShadow = newValue }

	hideShadow() { this.view.hideShadow() }
	showShadow() { this.view.showShadow() }

	showDependents() {
		for (let depmob of this.allDependents()) {
			depmob.view.show()
		}
	}

	hideDependents() {
		for (let depmob of this.allDependents()) {
			depmob.view.hide()
		}
	}

	redraw() { this.view.redraw() }

	//////////////////////////////////////////////////////////
	//                                                      //
	//                       ANIMATION                      //
	//                                                      //
	//////////////////////////////////////////////////////////

	motor: Motor

	animate(args: object = {}, seconds: number) {
		this.motor.animate(args, seconds)
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
			submob.parent.frame = this.frame
		}
		// Add submob to the children
		if (this.children === undefined || this.children === null) {
			throw `Please add submob ${submob.constructor.name} to ${this.constructor.name} later, in setup()`
		} else if (!this.children.includes(submob)) {
			this.children.push(submob)
		}
		// Add its view to this view and redraw
		this.view.add(submob.view)
		submob.view.redraw()
	}

	remove(submob: Mobject) {
		// Remove from the array of children
		// (with an imported helper method)
		remove(this.children, submob)
		submob.parent = null
		submob.view.div.remove()
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
			let t = args['transform'] ?? this.view?.frame.transform ?? Transform.identity()
			t.anchor = a
			syncedArgs['transform'] = t
			delete syncedArgs['anchor']
		}
		return syncedArgs
	}

	update(args: object = {}, redraw: boolean = true) {

		super.update(args)

		if (this.view != null) {
			this.view.div.setAttribute('screen-event-handler', ScreenEventHandler[this.sensor.screenEventHandler])
			if (this.sensor.screenEventHandler == ScreenEventHandler.Below) {
				this.view.div.style['pointer-events'] = 'none'
			} else {
				this.view.div.style['pointer-events'] = 'auto'
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
		if (redraw) { this.view.redraw() }
	}


	//////////////////////////////////////////////////////////
	//                                                      //
	//                     INTERACTIVITY                    //
	//                                                      //
	//////////////////////////////////////////////////////////

	sensor: Sensor
	dragAnchorStart?: vertex

	disable() { this.sensor.disable() }
	enable() { this.sensor.enable() }

	get screenEventHandler(): ScreenEventHandler { return this.sensor.screenEventHandler }
	set screenEventHandler(newValue: ScreenEventHandler) { this.sensor.screenEventHandler = newValue }


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

	onPointerOut(e: ScreenEvent) { }



	draggingEnabled: boolean


	setDragging(flag: boolean) {
		if (flag) {
			if (this.draggingEnabled) { return }
			this.sensor.setTouchMethodsTo(this.startDragging.bind(this), this.dragging.bind(this), this.endDragging.bind(this))
			this.sensor.setPenMethodsTo(this.startDragging.bind(this), this.dragging.bind(this), this.endDragging.bind(this))
			this.sensor.setMouseMethodsTo(this.startDragging.bind(this), this.dragging.bind(this), this.endDragging.bind(this))
		} else {
			if (!this.draggingEnabled) { return }
			this.sensor.restoreTouchMethods()
			this.sensor.restorePenMethods()
			this.sensor.restoreMouseMethods()
		}
		this.draggingEnabled = flag
	}

	startDragging(e: ScreenEvent) {
		this.dragAnchorStart = vertexSubtract(this.view.frame.anchor, eventVertex(e))
		this.hideShadow()
		this.parent.update()
	}

	dragging(e: ScreenEvent) {
		if (this.dragAnchorStart == null) { return }
		this.update({
			anchor: vertexAdd(eventVertex(e), this.dragAnchorStart)
		})
	}

	endDragging(e: ScreenEvent) {
		this.dragAnchorStart = null
		this.showShadow()
	}

}



























