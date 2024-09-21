
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




























