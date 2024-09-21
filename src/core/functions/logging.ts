
import { isTouchDevice } from 'core/mobjects/screen_events'

export const LOG_STACK_RESOLUTION = Infinity

// logging inside HTML instead of the console
// for debugging the app e. g. on iPad
function logInto(obj: any, id: string) {
	let msg = obj.toString()
	let newLine: HTMLElement = document.createElement('p')
	newLine.innerText = msg
	let htmlConsole: HTMLElement = document.querySelector('#' + id)
  	htmlConsole.appendChild(newLine)
	
	// push old log entries out the top of the scroll view
	// (these lines don't work though)
	htmlConsole.scrollTop = htmlConsole.scrollHeight
	newLine.scrollIntoView()
}

export function logString(msg: any) {
	if (msg === undefined) {
		return 'undefined'
	} else if (msg === null) {
		return 'null'
	} else if (typeof msg === 'string') {
		return msg
	} else if (typeof msg === 'boolean') {
		return (msg as boolean) ? 'true' : 'false'
	} else if (typeof msg === 'number') {
		return msg.toString()
	} else if (msg.constructor.name == 'Array' || msg.constructor.name == 'Vertex') {
		if (msg.length == 0) {
			return "[]"
		} else if (msg[0].constructor.name == 'HTMLDivElement') {
			let ret = '['
			for (let i = 0; i < msg.length - 1; i++) {
				ret += msg[i].className + ', '
			}
			ret += msg[msg.length - 1].className + ']'
			return ret
		} else {
			let ret = '['
			for (let i = 0; i < msg.length - 1; i++) {
				ret += logString(msg[i]) + ', '
			}
			ret += logString(msg[msg.length - 1]) + ']'
			return ret
		}
	} else {
		let keys = Object.keys(msg)
		if (keys.length <= 5) {
			let ret = '{ '
			for (let i = 0; i < keys.length - 1; i++) {
				ret += keys[i] + ' : ' + logString(msg[keys[i]]) + ', '
			}
			ret += keys[keys.length - 1] + ' : ' + logString(msg[keys[keys.length - 1]]) + ' }'
		} else {
			return msg.constructor.name
		}
	}
}

function htmlLog(msg: any) {
	logInto(logString(msg), 'htmlConsole')
}
function jsLog(msg: any) {
	console.log(logString(msg))
}

export function stackSize(): number {
	// how many levels of function calls deep are we?
	let s = (new Error()).stack
	let a = s.split('\n')
	return a.length
}

export function log(msg: any) {
	// device-agnostic log function
	// with variable resolution,
	// this should be used for logging
	if (stackSize() > LOG_STACK_RESOLUTION) { return }
	if (isTouchDevice) { htmlLog(msg) } else { jsLog(msg) }
}


























