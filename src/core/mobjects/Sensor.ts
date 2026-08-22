
import { Mobject } from './Mobject'
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { ScreenEventHandler, ScreenEventDevice, ScreenEvent, ScreenEventType, screenEventDevice, screenEventType, eventVertex, isTouchDevice, addPointerDown, addPointerMove, addPointerUp, addPointerOut } from './screen_events'
import { vertex } from 'core/functions/vertex'
import { MAX_TAP_DELAY, MERE_TAP_DELAY, LONG_PRESS_DURATION } from 'core/constants'
import { log, logString } from 'core/functions/logging'
import { getPaper, getSidebar } from 'core/functions/getters'
import { Transform } from 'core/classes/Transform'

export class Sensor extends ExtendedObject {
	
	mobject?: Mobject
	eventTarget?: Mobject
	screenEventHandler: ScreenEventHandler
	savedScreenEventHandler?: ScreenEventHandler
	screenEventDevice?: ScreenEventDevice

	screenEventHistory: Array<ScreenEvent>
	resetPointerTimeoutID?: number
	deleteHistoryTimeoutID?: number
	longPressTimeoutID?: number
	mereTapTimeoutID?: number

	eventStartTime: number
	eventStartLocation: vertex | null

	screenEventState: string
	screenEventMethods: Record<string, Record<string, (ScreenEvent) => void>>

	defaults(): object {
		return {
			mobject: null,
			screenEventHandler: ScreenEventHandler.Parent,
			savedScreenEventHandler: null,
			eventTarget: null,
			screenEventHistory: [],
			screenEventDevice: null,
			eventStartTime: 0,
			eventStartLocation: null,
			screenEventsBlocked: false,
			screenEventState: 'default',
			screenEventMethods: {}
		}
	}

	mutabilities(): object {
		return { }
	}

	setup() {
		addPointerDown(this.mobject.view.div, this.capturedOnPointerDown.bind(this))
		addPointerMove(this.mobject.view.div, this.capturedOnPointerMove.bind(this))
		addPointerUp(this.mobject.view.div, this.capturedOnPointerUp.bind(this))
		addPointerOut(this.mobject.view.div, this.capturedOnPointerOut.bind(this))

		this.setupScreenMethods()
	}

	setupScreenMethods() {
		this.screenEventMethods['default'] = {
			onPointerDown: this.onPointerDown.bind(this),
			onPointerMove: this.onPointerMove.bind(this),
			onPointerUp: this.onPointerUp.bind(this),
			onTap: this.onTap.bind(this),
			onMereTap: this.onMereTap.bind(this),
			onDoubleTap: this.onDoubleTap.bind(this),
			onLongPress: this.onLongPress.bind(this),
			onTouchDown: this.onTouchDown.bind(this),
			onTouchMove: this.onTouchMove.bind(this),
			onTouchUp: this.onTouchUp.bind(this),
			onTouchTap: this.onTouchTap.bind(this),
			onMereTouchTap: this.onMereTouchTap.bind(this),
			onDoubleTouchTap: this.onDoubleTouchTap.bind(this),
			onLongTouchDown: this.onLongTouchDown.bind(this),
			onPenDown: this.onPenDown.bind(this),
			onPenMove: this.onPenMove.bind(this),
			onPenUp: this.onPenUp.bind(this),
			onPenTap: this.onPenTap.bind(this),
			onMerePenTap: this.onMerePenTap.bind(this),
			onDoublePenTap: this.onDoublePenTap.bind(this),
			onLongPenDown: this.onLongPenDown.bind(this),
			onMouseDown: this.onMouseDown.bind(this),
			onMouseMove: this.onMouseMove.bind(this),
			onMouseUp: this.onMouseUp.bind(this),
			onMouseClick: this.onMouseClick.bind(this),
			onMereMouseClick: this.onMereMouseClick.bind(this),
			onDoubleMouseClick: this.onDoubleMouseClick.bind(this),
			onLongMouseDown: this.onLongMouseDown.bind(this),
			// onPointerOut: this.onPointerOut.bind(this)
		}
	}

	callScreenEventMethod(eventName: string, e: ScreenEvent) {
		//log('callScreenEventMethod')
		let methodDict = this.screenEventMethods[this.screenEventState]
		//log('methodDict:')
		//log(methodDict)
		if (!methodDict) { return }
		let method = methodDict[eventName]
		//log('method:')
		//log(method)
		if (!method) { return }
		method(e)
	}

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
		if (t == this.mobject.view.div) {
			return this.mobject
		}
		let targetMobChain = this.eventTargetMobjectChain(e) // defined below
		var m: any
		while (targetMobChain.length > 0) {
			m = targetMobChain.pop()
			if (m === undefined) { return this.mobject }
			if (m.sensor.screenEventHandler == ScreenEventHandler.Parent) {
				continue
			}
			if ((m.sensor.screenEventHandler == ScreenEventHandler.Self || m.sensor.screenEventHandler == ScreenEventHandler.Auto)) {
				return m
			}
		}
		// if all of this fails, this mob must handle the event itself
		return this.mobject
	}

	eventTargetMobjectChain(e: ScreenEvent): Array<Mobject> {
	// Collect the chain of corresponding target mobjects (highest to lowest)
		let targetDivChain = this.eventTargetDivChain(e) // defined below
		let targetMobChain: Array<Mobject> = []
		for (var div of targetDivChain.values()) {
			try {
				let m: any = div['view'].mobject
				let mob: Mobject = m as Mobject
				// only consider targets above the first mobject
				// with ScreenEventHandler.Parent
				targetMobChain.push(mob)
			} catch {
				continue
			}
		}
		return targetMobChain
	}

	eventTargetDivChain(e: ScreenEvent): Array<Element> {
	// Collect the chain of target views (highest to lowest)
		var t: Element = e.target as Element
		if (t.tagName == 'path') { t = t.parentElement.parentElement }
		// the mob whose view contains the svg element containing the path
		if (t.tagName == 'svg') { t = t.parentElement } //.parentElement }
		// we hit an svg outside its path (but inside its bounding box),
		// so ignore the corresponding mob and pass the event on to its parent

		let targetDivChain: Array<Element> = [t]
		while (t != undefined && t != this.mobject.view.div) {
			t = t.parentElement
			targetDivChain.push(t)
		}
		return targetDivChain.reverse()
	}

	/*
	Captured event methods
	*/

	capturedOnPointerDown(e: ScreenEvent) {

		//log('capturedOnPointerDown')
		this.eventStartLocation = this.localEventVertex(e)
		if (this.eventStartTime == 0) {
			this.eventStartTime = e.timeStamp
		}
		let target = this.eventTargetMobject(e)
		this.eventTarget = target
		if (target == null) {
			return
		}
		
		if (target.sensor.screenEventHandler == ScreenEventHandler.Auto) {
			return
		}
		e.stopPropagation()
		if (this.eventTarget.preventDefault) {
			e.preventDefault()
		}

		this.clearResetPointer()
		this.clearDeleteHistoryTimeout()
		this.decideEventAction(e)
		
	}

	capturedOnPointerMove(e: ScreenEvent) {
		let target = this.eventTarget
		if (target == null || this.screenEventDevice == null) {
			return
		}
		if (target.sensor.screenEventHandler == ScreenEventHandler.Auto) {
			return
		}
		e.stopPropagation()
		if (this.eventTarget.preventDefault) {
			e.preventDefault()
		}
		switch (this.screenEventDevice) {
		case ScreenEventDevice.Finger:
			target.sensor.callScreenEventMethod('onTouchMove', e)
			break
		case ScreenEventDevice.Pen:
			target.sensor.callScreenEventMethod('onPenMove', e)
			break
		case ScreenEventDevice.Mouse:
			target.sensor.callScreenEventMethod('onMouseMove', e)
			break
		default:
			throw `Unknown pointer device ${this.screenEventDevice}`
		}
	}

	capturedOnPointerUp(e: ScreenEvent) {
		let target = this.eventTarget
		if (target == null || this.screenEventDevice == null) {
			if (this.mobject) {
				if (this.mobject.isInstanceOf('Board')) {
					let sidebar = getSidebar()
					if (sidebar.activeButton) {
						sidebar.activeButton.commonButtonUp()
					}
				}
			}
			return
		}
		if (target.sensor.screenEventHandler == ScreenEventHandler.Auto) { return }
		e.stopPropagation()
		if (this.eventTarget.preventDefault) {
			e.preventDefault()
		}

		this.decideEventAction(e)
		this.eventStartLocation = null
		if (this.deleteHistoryTimeoutID != null) { return }
		this.deleteHistoryTimeoutID = window.setTimeout(
			this.deleteScreenEventHistory.bind(this), 1000
		)
	}

	capturedOnPointerOut(e: ScreenEvent) {
		let target = this.eventTarget
		if (target == null || this.screenEventDevice == null) { return }
		if (target.sensor.screenEventHandler == ScreenEventHandler.Auto) { return }
		e.stopPropagation()
		if (this.eventTarget.preventDefault) {
			e.preventDefault()
		}

		target.sensor.callScreenEventMethod('onPointerOut', e)
		this.deleteScreenEventHistory()
	}

	decideEventAction(e: ScreenEvent) {
		//log(e)
		let device = screenEventDevice(e)
		let type = screenEventType(e)
		log(`device: ${ScreenEventDevice[device]}`)
		//log(`type: ${ScreenEventType[type]}`)

		//log('decide')

		if (e instanceof MouseEvent && device == ScreenEventDevice.Pen && type == ScreenEventType.Down) {
			log('case 1')
			this.eventTarget.sensor.rawOnPenDown(e)
			this.eventTarget.sensor.registerScreenEvent(e)
			this.screenEventDevice = ScreenEventDevice.Pen
		} else if (e instanceof PointerEvent && device == ScreenEventDevice.Pen && type == ScreenEventType.Up) {
			log('case 2')
			this.eventTarget.sensor.rawOnPenUp(e)
			this.eventTarget.sensor.registerScreenEvent(e)
			this.resetPointer()
		} else if (e instanceof MouseEvent && device == ScreenEventDevice.Pen && type == ScreenEventType.Up) {
			log('case 3')
			// ignore
		} else if (e instanceof MouseEvent && device == ScreenEventDevice.Finger && type == ScreenEventType.Down) {
			log('case 4')
			this.eventTarget.sensor.rawOnTouchDown(e)
			this.eventTarget.sensor.registerScreenEvent(e)
			this.screenEventDevice = ScreenEventDevice.Finger
		} else if (e instanceof PointerEvent && device == ScreenEventDevice.Finger && type == ScreenEventType.Up) {
			log('case 5')
			this.eventTarget.sensor.rawOnTouchUp(e)
			this.eventTarget.sensor.registerScreenEvent(e)
			this.resetPointer()
		} else if (e instanceof MouseEvent && device == ScreenEventDevice.Finger && type == ScreenEventType.Up) {
			log('case 6')
			// ignore
		} else if (e instanceof MouseEvent && device == ScreenEventDevice.Mouse && type == ScreenEventType.Down) {
			if (this.screenEventDevice == ScreenEventDevice.Finger) {
				log('case 7a')
				// ignore
			} else if (this.screenEventDevice == ScreenEventDevice.Pen) {
				log('case 7b')
				// ignore
			} else {
				log('case 7c')
				this.eventTarget.sensor.rawOnMouseDown(e)
				this.eventTarget.sensor.registerScreenEvent(e)
				this.screenEventDevice = ScreenEventDevice.Mouse
			}
		} else if (e instanceof PointerEvent && device == ScreenEventDevice.Mouse && type == ScreenEventType.Up) {
			if (this.screenEventDevice == ScreenEventDevice.Finger) {
				if (isTouchDevice) {
					log('case 8a1')
					this.eventTarget.sensor.rawOnTouchUp(e)
					this.eventTarget.sensor.registerScreenEvent(e)
					this.resetPointerTimeoutID = window.setTimeout(this.resetPointer.bind(this), 250)
				} else {
					log('case 8a2')
					// ignore
				}
			} else if (this.screenEventDevice == ScreenEventDevice.Pen) {
				if (isTouchDevice) {
					log('case 8b1')
					this.eventTarget.sensor.rawOnPenUp(e)
					this.eventTarget.sensor.registerScreenEvent(e)
					this.resetPointerTimeoutID = window.setTimeout(this.resetPointer.bind(this), 250)
				} else {
					log('case 8b2')
					// ignore
				}
			} else {
				log('case 8c')
				this.eventTarget.sensor.rawOnMouseUp(e)
				this.eventTarget.sensor.registerScreenEvent(e)
				this.resetPointerTimeoutID = window.setTimeout(this.resetPointer.bind(this), 250)
			}
		} else if (e instanceof MouseEvent && device == ScreenEventDevice.Mouse && type == ScreenEventType.Up) {
			log('case 9')
			// ignore
		} else if (e instanceof TouchEvent && device == ScreenEventDevice.Finger && type == ScreenEventType.Down) {
			log('case 10')
			this.screenEventDevice = ScreenEventDevice.Finger
			this.eventTarget.sensor.rawOnTouchDown(e)
			this.eventTarget.sensor.registerScreenEvent(e)
		} else if (e instanceof TouchEvent && device == ScreenEventDevice.Pen && type == ScreenEventType.Down) {
			log('case 11')
			this.eventTarget.sensor.rawOnPenDown(e)
			this.eventTarget.sensor.registerScreenEvent(e)
			this.screenEventDevice = ScreenEventDevice.Pen
		} else {
			log('case 12')
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
		this.longPressTimeoutID = window.setTimeout(this.callScreenEventMethod.bind(this, 'onLongTouchDown', e), LONG_PRESS_DURATION)
		this.callScreenEventMethod('onTouchDown', e)
	}

	rawOnTouchUp(e: ScreenEvent) {
		if (this.screenEventHistory.length > 0) {
			let e1 = this.screenEventHistory[this.screenEventHistory.length - 1]
			if (e.timeStamp - e1.timeStamp < MAX_TAP_DELAY) {
				this.clearMereTapTimeout()
				this.callScreenEventMethod('onTouchTap', e)
				this.mereTapTimeoutID = window.setTimeout(function() {
					this.mereTapTimeoutID = null
					if (this.screenEventHistory.length == 2) {
						this.callScreenEventMethod('onMereTouchTap', e)
					}
				}.bind(this), MERE_TAP_DELAY)
				if (this.screenEventHistory.length == 3) {
					let e2 = this.screenEventHistory[this.screenEventHistory.length - 2]
					let e3 = this.screenEventHistory[this.screenEventHistory.length - 3]
					if (e1.timeStamp - e2.timeStamp < MAX_TAP_DELAY && e2.timeStamp - e3.timeStamp < MAX_TAP_DELAY) {
						this.callScreenEventMethod('onDoubleTouchTap', e)
					}
				}
			}
		}
		this.clearLongPressTimeout()
		this.callScreenEventMethod('onTouchUp', e)
	}

	rawOnPenDown(e: ScreenEvent) {
		this.longPressTimeoutID = window.setTimeout(this.callScreenEventMethod.bind(this, 'onLongPenDown', e), LONG_PRESS_DURATION)
		this.callScreenEventMethod('onPenDown', e)
	}

	rawOnPenUp(e: ScreenEvent) {
		let e1 = this.screenEventHistory[this.screenEventHistory.length - 1]
		if (e.timeStamp - e1.timeStamp < MAX_TAP_DELAY) {
			this.callScreenEventMethod('onPenTap', e)
			this.mereTapTimeoutID = window.setTimeout(function() {
				this.mereTapTimeoutID = null
				if (this.screenEventHistory.length == 2) {
					this.callScreenEventMethod('onMerePenTap', e)
				}
			}.bind(this), MERE_TAP_DELAY)
			if (this.screenEventHistory.length == 3) {
				let e2 = this.screenEventHistory[this.screenEventHistory.length - 2]
				let e3 = this.screenEventHistory[this.screenEventHistory.length - 3]
				if (e1.timeStamp - e2.timeStamp < MAX_TAP_DELAY && e2.timeStamp - e3.timeStamp < MAX_TAP_DELAY) {
					this.callScreenEventMethod('onDoublePenTap', e)
				}
			}
		}
		this.clearLongPressTimeout()
		this.callScreenEventMethod('onPenUp', e)
	}

	rawOnMouseDown(e: ScreenEvent) {
		log('rawOnMouseDown')
		this.longPressTimeoutID = window.setTimeout(this.callScreenEventMethod.bind(this, 'onLongMouseDown', e), LONG_PRESS_DURATION)
		this.callScreenEventMethod('onMouseDown', e)
	}

	rawOnMouseUp(e: ScreenEvent) {
		let e1 = this.screenEventHistory[this.screenEventHistory.length - 1]
		if (e.timeStamp - e1.timeStamp < MAX_TAP_DELAY) {
			this.callScreenEventMethod('onMouseClick', e)
			this.mereTapTimeoutID = window.setTimeout(function() {
				this.mereTapTimeoutID = null
				if (this.screenEventHistory.length == 2) {
					this.callScreenEventMethod('onMereMouseClick', e)
				}
			}.bind(this), MERE_TAP_DELAY)
			if (this.screenEventHistory.length == 3) {
				let e2 = this.screenEventHistory[this.screenEventHistory.length - 2]
				let e3 = this.screenEventHistory[this.screenEventHistory.length - 3]
				if (e1.timeStamp - e2.timeStamp < MAX_TAP_DELAY && e2.timeStamp - e3.timeStamp < MAX_TAP_DELAY) {
					this.callScreenEventMethod('onDoubleMouseClick', e)
				}
			}
		}
		this.clearLongPressTimeout()
		this.callScreenEventMethod('onMouseUp', e)
	}

	// Local coordinates for use in custom event methods

	localEventVertex(e: ScreenEvent): vertex {
	/*
	eventVertex(e) gives the coordinates in the topmost
	mobject's frame (paper or sidebar). This method here
	finds them in the mobject's local frame.
	*/
		let p: vertex = eventVertex(e)
		var rt: Transform
		try {
			rt = this.mobject.view.frame.relativeTransform(getPaper().frame)
		} catch {
			rt = this.mobject.view.frame.relativeTransform(getSidebar().frame)
		}
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
			window.clearTimeout(this.deleteHistoryTimeoutID)
			this.deleteHistoryTimeoutID = null
		}
	}

	clearMereTapTimeout() {
		if (this.mereTapTimeoutID) {
			window.clearTimeout(this.mereTapTimeoutID)
			this.mereTapTimeoutID = null
		}
	}

	clearLongPressTimeout() {
		if (this.longPressTimeoutID) {
			window.clearTimeout(this.longPressTimeoutID)
			this.longPressTimeoutID = null
		}
	}


	onPointerDown(e: ScreenEvent) { this.mobject.onPointerDown(e) }
	onPointerMove(e: ScreenEvent) { this.mobject.onPointerMove(e) }
	onPointerUp(e: ScreenEvent) { this.mobject.onPointerUp(e) }
	onTap(e: ScreenEvent) { this.mobject.onTap(e) }
	onMereTap(e: ScreenEvent) { this.mobject.onMereTap(e) }
	onDoubleTap(e: ScreenEvent) { this.mobject.onDoubleTap(e) }
	onLongPress(e: ScreenEvent) { this.mobject.onLongPress(e) }

	onTouchDown(e: ScreenEvent) { this.mobject.onTouchDown(e) }
	onTouchMove(e: ScreenEvent) { this.mobject.onTouchMove(e) }
	onTouchUp(e: ScreenEvent) { this.mobject.onTouchUp(e) }
	onTouchTap(e: ScreenEvent) { this.mobject.onTouchTap(e) }
	onMereTouchTap(e: ScreenEvent) { this.mobject.onMereTouchTap(e) }
	onDoubleTouchTap(e: ScreenEvent) { this.mobject.onDoubleTouchTap(e) }
	onLongTouchDown(e: ScreenEvent) { this.mobject.onLongTouchDown(e) }
	onPenDown(e: ScreenEvent) { this.mobject.onPenDown(e) }
	onPenMove(e: ScreenEvent) { this.mobject.onPenMove(e) }
	onPenUp(e: ScreenEvent) { this.mobject.onPenUp(e) }
	onPenTap(e: ScreenEvent) { this.mobject.onPenTap(e) }
	onMerePenTap(e: ScreenEvent) { this.mobject.onMerePenTap(e) }
	onDoublePenTap(e: ScreenEvent) { this.mobject.onDoublePenTap(e) }
	onLongPenDown(e: ScreenEvent) { this.mobject.onLongPenDown(e) }
	onMouseDown(e: ScreenEvent) { this.mobject.onMouseDown(e) }
	onMouseMove(e: ScreenEvent) { this.mobject.onMouseMove(e) }
	onMouseUp(e: ScreenEvent) { this.mobject.onMouseUp(e) }
	onMouseClick(e: ScreenEvent) { this.mobject.onMouseClick(e) }
	onMereMouseClick(e: ScreenEvent) { this.mobject.onMereMouseClick(e) }
	onDoubleMouseClick(e: ScreenEvent) { this.mobject.onDoubleMouseClick(e) }
	onLongMouseDown(e: ScreenEvent) { this.mobject.onLongMouseDown(e) }

	// onPointerOut(e: ScreenEvent) { this.mobject.onPointerOut(e) }


}
