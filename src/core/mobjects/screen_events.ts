
import { vertex } from 'core/functions/vertex'
import { log } from 'core/functions/logging'

export const isTouchDevice: boolean = (window.navigator.maxTouchPoints > 0)
export const separateSidebar: boolean = (document.querySelector('#paper_id') === null || document.querySelector('#sidebar_id') === null)

/*
Screen input can come from a mouse, finger(s) or a pen/stylus.
There exist classes MouseEvent and TouchEvent, as well as
PointerEvent as a hardware-agnostic representation of all three.
Pen input has no separate class, but PointerEvent has properties
specific to that.
For backwards compatibility (?), PointerEvent is actually
a subclass of MouseEvent. In addition, depending on device,
OS and browser, pen input may appear as a TouchEvent or even a MouseEvent.
So it is all quite unreliable and we need to build our own
clean API that can distinguish between all these kinds of input.
*/

export type ScreenEvent = MouseEvent | TouchEvent
// this includes PointerEvent (subclass of MouseEvent)
export enum ScreenEventDevice { Mouse, Finger, Pen, Unknown }
export enum ScreenEventType { Down, Move, Up, Cancel, Unknown }
(window as any).emulatedDevice = ScreenEventDevice.Mouse


export enum ScreenEventHandler {
	Auto, // don't interfere with event capturing
	// e.g. for CindyJS canvas
	Below, // pass to mobject underneath (done via a CSS property)
	// e. g. for the interior of a TwoPointCircle
	Self, // you are at the right address
	Parent // let the parent handle it, even if the target (this mob or a submob) could handle it
	// i. e. this disables the interactivity of the mobjects and of all its submobs

	/*
	General rule: the event is handled by the lowest submob that can handle it
	and that is not underneath a mobject that wants its parent to handle it.
	If the event policies end in a loop, no one handles it
	*/
}

export function eventVertex(e: ScreenEvent): vertex {
/*
subtract the sidebar's width if necessary
i. e. if running in the browser (minter.html)
instead of in the app (paper.html)
*/
	var sidebarWidth: number = 0
	let sidebarDiv = document.querySelector('#sidebar_id') as HTMLDivElement
	if (sidebarDiv !== null) {
		// we are in the browser
		sidebarWidth = sidebarDiv.clientWidth
	}
	let t: MouseEvent | Touch = null
	if (e instanceof MouseEvent) { t = e }
	else { t = e.changedTouches[0] }
	return [t.pageX - sidebarWidth, t.pageY]
}

export function screenEventType(e: ScreenEvent): ScreenEventType {
	if (e.type == 'pointerdown' || e.type == 'mousedown' || e.type == 'touchstart') { return ScreenEventType.Down }
	if (e.type == 'pointermove' || e.type == 'mousemove' || e.type == 'touchmove') { return ScreenEventType.Move }
	if (e.type == 'pointerup' || e.type == 'mouseup' || e.type == 'touchend') { return ScreenEventType.Up }
	if (e.type == 'pointercancel' || e.type == 'touchcancel') { return ScreenEventType.Cancel }
	return ScreenEventType.Unknown
}

export function screenEventTypeAsString(e: ScreenEvent): string {
	return ScreenEventType[screenEventType(e)]
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
		return (window as any).emulatedDevice
	}
}

export function screenEventDeviceAsString(e: ScreenEvent): string {
	return ScreenEventDevice[screenEventDevice(e)]
}

export function screenEventDescription(e: ScreenEvent, startTime: number = 0): String {
	return `${e.constructor.name} ${screenEventDeviceAsString(e)} ${screenEventTypeAsString(e)} ${e.timeStamp - startTime} (${eventVertex(e)})`
}

/*
The following functions handle adding and removing event listeners,
including the confusion between touch, mouse and pointer events.
*/

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

export function addPointerOut(element: HTMLElement | SVGElement, method: (Event) => void) {
//	element.addEventListener('touchcancel', method, { capture: true })
//	element.addEventListener('mouseout', method, { capture: true })
//	element.addEventListener('pointercancel', method, { capture: true })
}

export function removePointerOut(element: HTMLElement | SVGElement, method: (Event) => void) {
//	element.removeEventListener('touchcancel', method, { capture: true })
//	element.removeEventListener('mouseout', method, { capture: true })
//	element.removeEventListener('pointercancel', method, { capture: true })
}























