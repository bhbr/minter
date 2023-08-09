import { Vertex } from '../helpers/Vertex_Transform'

export const isTouchDevice: boolean = 'ontouchstart' in document.documentElement

export type LocatedEvent = PointerEvent | MouseEvent | TouchEvent
// any Event that has an associated location on the screen
// it can be triggered by a mouse, a finger or a stylus

export enum PointerEventPolicy {
	Transparent, // pass to Mobject underneath (done via a CSS property)
	// e. g. for the interior of a TwoPointCircle
	Propagate, // don't interfere with event capturing
	// e.g. for CindyJS canvas
	Handle, // you are at the right address
	Pass // up or down
}

export function pointerEventPageLocation(e: LocatedEvent): Array<number> {
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

export function pointerEventVertex(e: LocatedEvent): Vertex {
	return new Vertex(pointerEventPageLocation(e))
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