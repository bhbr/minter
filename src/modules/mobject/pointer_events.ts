import { Vertex } from '../helpers/Vertex_Transform'

export const isTouchDevice: boolean = 'ontouchstart' in document.documentElement

export type LocatedEvent = MouseEvent | TouchEvent
// any Event that has an associated location on the screen
// it can be triggered by a mouse, a finger or a stylus

export enum LocatedEventType { Down, Move, Up, Cancel, Unknown }
export enum LocatedEventDevice { Mouse, Finger, Pen, Unknown }

export enum PointerEventPolicy {
	Transparent, // pass to Mobject underneath (done via a CSS property)
	// e. g. for the interior of a TwoPointCircle
	Propagate, // don't interfere with event capturing
	// e.g. for CindyJS canvas
	Handle, // you are at the right address
	PassUp // let the parent handle it, even if the target (this mob or a submob) could handle it

	// General rule: the event is handled by the lowest submob that can handle it
	// and that is not underneath a PassUp
	// If the event policies end in a loop, no one handles it
}

export function eventPageLocation(e: LocatedEvent): Array<number> {
	// subtract the sidebar's width if necessary
	// i. e. if running in the browser (minter.html)
	// instead of in the app (paper.html)
	let sidebarWidth: number = 0
	try {
		let sidebar: Element = document.querySelector('#sidebar')
		sidebarWidth = sidebar.clientWidth
	} catch {
	}
	let t: MouseEvent | Touch = null
	if (e instanceof MouseEvent) { t = e }
	else { t = e.changedTouches[0] }
	return [t.pageX - sidebarWidth, t.pageY]
}

export function eventVertex(e: LocatedEvent): Vertex {
	return new Vertex(eventPageLocation(e))
}

export function locatedEventType(e: LocatedEvent): LocatedEventType {
	if (e.type == 'pointerdown' || e.type == 'mousedown' || e.type == 'touchstart') { return LocatedEventType.Down }
	if (e.type == 'pointermove' || e.type == 'mousemove' || e.type == 'touchmove') { return LocatedEventType.Move }
	if (e.type == 'pointerup' || e.type == 'mouseup' || e.type == 'touchend') { return LocatedEventType.Up }
	if (e.type == 'pointercancel' || e.type == 'touchcancel') { return LocatedEventType.Cancel }
	return LocatedEventType.Unknown
}

export function locatedEventDevice(e: LocatedEvent): LocatedEventDevice {
	if (e instanceof PointerEvent) {
		switch (e.pointerType) {
		case "pen":
			return LocatedEventDevice.Pen
		case "touch":
			return LocatedEventDevice.Finger
		case "mouse":
			return LocatedEventDevice.Mouse
		default:
			return LocatedEventDevice.Unknown
		}
	}
	if (e instanceof MouseEvent) {
		return LocatedEventDevice.Mouse
	}
	if (e instanceof TouchEvent) {
		if ((e as TouchEvent).touches[0].force == 0) {
			return LocatedEventDevice.Pen
		} else {
			return LocatedEventDevice.Finger
		}
	}
	return LocatedEventDevice.Unknown
}

export function addPointerDown(element: HTMLElement, method: (Event) => void) {
	element.addEventListener('touchstart', method, { capture: true })
	element.addEventListener('mousedown', method, { capture: true })
}

export function removePointerDown(element: HTMLElement, method: (Event) => void) {
	element.removeEventListener('touchstart', method, { capture: true })
	element.removeEventListener('mousedown', method, { capture: true })
}

export function addPointerMove(element: HTMLElement, method: (Event) => void) {
	element.addEventListener('touchmove', method, { capture: true })
	element.addEventListener('mousemove', method, { capture: true })
}

export function removePointerMove(element: HTMLElement, method: (Event) => void) {
	element.removeEventListener('touchmove', method, { capture: true })
	element.removeEventListener('mousemove', method, { capture: true })
}

export function addPointerUp(element: HTMLElement, method: (Event) => void) {
	element.addEventListener('touchend', method, { capture: true })
	element.addEventListener('mouseup', method, { capture: true })
	element.addEventListener('pointerup', method, { capture: true })
}

export function removePointerUp(element: HTMLElement, method: (Event) => void) {
	element.removeEventListener('touchend', method, { capture: true })
	element.removeEventListener('mouseup', method, { capture: true })
	element.removeEventListener('pointerup', method, { capture: true })
}