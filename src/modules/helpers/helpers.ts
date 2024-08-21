import { isTouchDevice } from '../mobject/screen_events'
import { Paper } from '../../Paper'

/////////////
// LOGGING //
/////////////

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
		return '"' + msg + '"'
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





////////////////////////////
// COPYING NESTED OBJECTS //
////////////////////////////

export function copy(obj: any): any {
	// shallow copy

	// numbers, string, booleans
	// are passed by value anyway,
	// so ne need to create an explicit copy
	if (typeof obj != 'object' || obj === null) {
		return obj
	}

	// Arrays are by default passed by reference.
	// So for a copy, we create a new
	// empty Array and fill it
	if (obj.constructor.name == 'Array') {
			let newObj: Array<any> = []
			for (let x of obj as Array<any>) {
				newObj.push(x)
			}
			return newObj
	}

	// Objects have a convenience method:
	// assign all of the original object's
	// properties to an empty object
	return Object.assign({}, obj)
	// This is a "shallow" copy though:
	// Porperties that are objects will be shared
	// with the original. Modifying or reassigning
	// them in the original will affect the copy,
	// and vice versa
}

export function deepCopy(obj: any, memo: Array<Array<object>> = []): any {

	// A deep copy recursively creates copies of all the objects
	// encountered as properties. Shared objects (i. e.
	// the same object assigned to different properties)
	// must be tracked and their identity retained.
	// This is done via memoization and the reason
	// why this implementation is so convoluted

	if (typeof obj != 'object' || obj === null) {
		return obj
	}

	if (obj.constructor.name.endsWith('Event')) {
		return null
	}

	if (obj.constructor.name == 'Array') {
		let newObj: Array<any> = []
		memo.push([obj, newObj])
		for (let value of obj as Array<any>) {

			var copiedValue: any
			var alreadyCopied = false
			for (let pair of memo) {
				if (pair[0] === value) {
					alreadyCopied = true
					copiedValue = pair[1]
				}
			}

			if (alreadyCopied) {
				newObj.push(copiedValue)
			} else {
				let y = deepCopy(value, memo)
				newObj.push(y)
				memo.push([value, y])
			}
		}
		return newObj
	}

	var newObj = Object.create(obj.constructor.prototype)
	if (obj.constructor.name == 'HTMLDivElement') {
		newObj = document.createElement('div')
	} else if (obj.constructor.name == 'HTMLSVGElement') {
		newObj = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	} else if (obj.constructor.name == 'HTMLPathElement') {
		newObj = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	}

	memo.push([obj, newObj])
	for (let [key, value] of Object.entries(obj)) {

			var copiedValue: any
			var alreadyCopied = false
			for (let pair of memo) {
				if (pair[0] === value) {
					alreadyCopied = true
					copiedValue = pair[1]
				}
			}

			if (alreadyCopied) {
				newObj[key] = copiedValue
			} else {
				let y = deepCopy(value, memo)
				newObj[key] = y
			}
	}
	if (obj.svg != undefined) {
		newObj.svg = obj.svg.cloneNode()
		newObj.path = obj.path.cloneNode()
		newObj.view.appendChild(newObj.svg)
		newObj.svg.appendChild(newObj.path)
	}
	return newObj

}



/////////////
// VARIOUS //
/////////////

export function stringFromPoint(point: Array<number>): string {
	// a string representation for CSS
	let x: number = point[0],
		y: number = point[1]
	return `${x} ${y}`
}

export function remove(arr: Array<any>, value: any, all: boolean = false) {
	// remove an objector value from an Array
	// either the first encountered matching entry (if all = false)
	// or every matching entry (if all = true)
   for (let i = 0; i < arr.length; i++) {
		if (arr[i] == value) {
			arr.splice(i,1)
			if (!all) { break }
		}
	}
}

export function concat(arr1: Array<any>, arr2: Array<any>): Array<any> {
	let ret: Array<any> = []
	for (let x of arr1) { ret.push(x) }
	for (let x of arr2) { ret.push(x) }
	return ret
}

export function extend(arr1: Array<any>, arr2: Array<any>) {
	for (let x of arr2) { arr1.push(x) }
}

export function convertStringToArray(s: string): Array<string> {
	let brackets = ["(", ")", "[", "]"]
	let whitespace = [" ", "\t", "\r", "\n"]
	for (let char of brackets.concat(whitespace)) {
		s = s.replace(char, "")
	}
	if (s.length == 0) return []
	let a: Array<string> =  s.split(",")
	if (a.length == 0) { return [s] }
	return a
}

export function convertArrayToString(array: Array<string>): string {
	var arrayString = "("
	for (let s of array) {
		arrayString += s
		arrayString += ","
	}
	if (arrayString.length > 1) {
		arrayString = arrayString.slice(0, arrayString.length - 1)
	}
	arrayString += ")"
	return arrayString
}

export function getPaper(): Paper {
	return document.querySelector('#paper_id')['mobject']
}















