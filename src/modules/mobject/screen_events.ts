import { Vertex } from '../helpers/Vertex'
import { log } from '../helpers/helpers'

(window as any).emulatePen = false
export const isTouchDevice: boolean = (document.body.className == 'ipad')

// Screen input can come from a mouse, finger(s) or a pen/stylus.
// There exist classes MouseEvent and TouchEvent, as well as
// PointerEvent as a hardware-agnostic representation of all three.
// Pen input has no separate class, but PointerEvent has properties
// specific to that.
// For backwards compatibility (?), PointerEvent is actually
// a subclass of MouseEvent. In addition, depending on device,
// OS and browser, pen input may appear as a TouchEvent or even a MouseEvent.
// So it is all quite unreliable and we need to build our own
// clean API that can distinguish between all these kinds of input.

export type ScreenEvent = MouseEvent | TouchEvent
// this includes PointerEvent (subclass of MouseEvent)
export enum ScreenEventDevice { Mouse, Finger, Pen, Unknown }
export enum ScreenEventType { Down, Move, Up, Cancel, Unknown }

export enum ScreenEventHandler {
	Auto, // don't interfere with event capturing
	// e.g. for CindyJS canvas
	Below, // pass to mobject underneath (done via a CSS property)
	// e. g. for the interior of a TwoPointCircle
	Self, // you are at the right address
	Parent // let the parent handle it, even if the target (this mob or a submob) could handle it
	// i. e. this disables the interactivity of the mobjects and of all its submobs

	// General rule: the event is handled by the lowest submob that can handle it
	// and that is not underneath a PassUp
	// If the event policies end in a loop, no one handles it
}

export function eventVertex(e: ScreenEvent): Vertex {
	// subtract the sidebar's width if necessary
	// i. e. if running in the browser (minter.html)
	// instead of in the app (paper.html)
	var sidebarWidth: number = 0
	let sidebarView: Element = document.querySelector('#sidebar_id')
	if (sidebarView !== null) {
		// we are in the browser
		sidebarWidth = sidebarView.clientWidth
	}
	let t: MouseEvent | Touch = null
	if (e instanceof MouseEvent) { t = e }
	else { t = e.changedTouches[0] }
	//log(`pageXY: ${t.pageX}, ${t.pageY}`)
	return new Vertex(t.pageX - sidebarWidth, t.pageY)
}

export function screenEventType(e: ScreenEvent): ScreenEventType {
	if (e.type == 'pointerdown' || e.type == 'mousedown' || e.type == 'touchstart') { return ScreenEventType.Down }
	if (e.type == 'pointermove' || e.type == 'mousemove' || e.type == 'touchmove') { return ScreenEventType.Move }
	if (e.type == 'pointerup' || e.type == 'mouseup' || e.type == 'touchend') { return ScreenEventType.Up }
	if (e.type == 'pointercancel' || e.type == 'touchcancel') { return ScreenEventType.Cancel }
	return ScreenEventType.Unknown
}

export function screenEventDevice(e: ScreenEvent): ScreenEventDevice {
	if (isTouchDevice) {
		if (e instanceof TouchEvent) {
			if (e.touches[0].force == 0) {
				return ScreenEventDevice.Finger
			} else {
				return ScreenEventDevice.Pen
			}
		} else if (e instanceof MouseEvent) {
			return ScreenEventDevice.Mouse
		}
		 else {
			return ScreenEventDevice.Unknown
		}
	} else {
		if ((window as any).emulatePen) {
			return ScreenEventDevice.Pen
		} else {
			return ScreenEventDevice.Finger
		}
	}
}


export function addPointerDown(element: HTMLElement | SVGElement, method: (Event) => void) {
	element.addEventListener('touchstart', method, { capture: true })
	element.addEventListener('mousedown', method, { capture: true })
}

export function removePointerDown(element: HTMLElement | SVGElement, method: (Event) => void) {
	element.removeEventListener('touchstart', method, { capture: true })
	element.removeEventListener('mousedown', method, { capture: true })
}

export function addPointerMove(element: HTMLElement | SVGElement, method: (Event) => void) {
	element.addEventListener('touchmove', method, { capture: true })
	element.addEventListener('mousemove', method, { capture: true })
}

export function removePointerMove(element: HTMLElement | SVGElement, method: (Event) => void) {
	element.removeEventListener('touchmove', method, { capture: true })
	element.removeEventListener('mousemove', method, { capture: true })
}

export function addPointerUp(element: HTMLElement | SVGElement, method: (Event) => void) {
	element.addEventListener('touchend', method, { capture: true })
	element.addEventListener('mouseup', method, { capture: true })
	element.addEventListener('pointerup', method, { capture: true })
}

export function removePointerUp(element: HTMLElement | SVGElement, method: (Event) => void) {
	element.removeEventListener('touchend', method, { capture: true })
	element.removeEventListener('mouseup', method, { capture: true })
	element.removeEventListener('pointerup', method, { capture: true })
}