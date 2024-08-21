// long press gesture recognizer
export function addLongPressListener(
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

	function detectLongPress(e: Event, triggeredFunction: any) {
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

export function removeLongPressListener(element: Element) {
	element.removeEventListener('mousedown', element['startLongPress'])
	element['startLongPress'] = undefined
}