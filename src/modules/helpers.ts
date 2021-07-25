import { Vertex } from './vertex-transform'

export const isTouchDevice: boolean = 'ontouchstart' in document.documentElement
export const DRAW_BORDER: boolean = true

export function stringFromPoint(point: Array<number>): string {
	let x: number = point[0],
		y: number = point[1]
	return `${x} ${y}`
}

export function remove(arr: Array<any>, value: any, all: boolean = false) {
   for (let i = 0; i < arr.length; i++) {
		if (arr[i] == value) {
			arr.splice(i,1)
			if (!all) { break }
		}
	}
}


// replicate RGB(A) notation from CSS
//function rgb(r, g, b) { return `rgb(${255*r}, ${255*g}, ${255*b})` }
export function rgba(r: number, g: number, b: number, a: number): string {
	return `rgb(${255*r}, ${255*g}, ${255*b}, ${a})`
}

export function rgb(r: number, g: number, b: number): string {
	let hex_r = (Math.round(r*255)).toString(16).padStart(2, '0')
	let hex_g = (Math.round(g*255)).toString(16).padStart(2, '0')
	let hex_b = (Math.round(b*255)).toString(16).padStart(2, '0')
	return '#' + hex_r + hex_g + hex_b
}

export function gray(x: number): string { return rgb(x, x, x) }

// long press gesture recognizer
export function addLongPress(
	element: Element,
	triggeredFunction: (Event) => void,
	time: number = 500
) {
	let timeoutID: number = 0

	function startLongPress(e: Event) {
		element.removeEventListener('mousedown', startLongPress)
		timeoutID = window.setTimeout(detectLongPress, time, e, triggeredFunction)
		element.addEventListener('mouseup', cancelLongPress)
		element.addEventListener('mousemove', cancelLongPress)
	}

	function cancelLongPress(e: Event) {
		element.removeEventListener('mouseup', cancelLongPress)
		element.removeEventListener('mousemove', cancelLongPress)
		element.addEventListener('mousedown', startLongPress)
		window.clearTimeout(timeoutID)
	}

	function detectLongPress(e: Event) {
		element.removeEventListener('mouseup', cancelLongPress)
		element.addEventListener('mouseup', endLongPress)
		triggeredFunction(e)
	}

	function endLongPress(e: Event) {
		element.removeEventListener('mouseup', endLongPress)
		element.addEventListener('mousedown', startLongPress)
	}

	element.addEventListener('mousedown', startLongPress)
	element['startLongPress'] = startLongPress

}

export function removeLongPress(element: Element) {
	element.removeEventListener('mousedown', element['startLongPress'])
	element['startLongPress'] = undefined
}

export type LocatedEvent = PointerEvent | MouseEvent | TouchEvent

export function pointerEventPageLocation(e: LocatedEvent): Array<number> {
	let t: MouseEvent | Touch = null
	let sidebarWidth: number = 0
	try {
		let sidebar: Element = document.querySelector('#sidebar')
		sidebarWidth = sidebar.clientWidth
	} catch {
	}
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

export function logInto(obj: any, id: string) {
	let msg = obj.toString()
	let newLine: HTMLElement = document.createElement('p')
	newLine.innerText = msg
	let myConsole: HTMLElement = document.querySelector('#' + id)
	
	// Neither of these lines does what it is claimed to. I give up
	//myConsole.scrollTop = console.scrollHeight
	//newLine.scrollIntoView()
}

export function paperLog(msg: any) { } // logInto(msg.toString(), 'paper-console') }



// https://www.typescriptlang.org/docs/handbook/mixins.html
export function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
      );
    });
  });
}









