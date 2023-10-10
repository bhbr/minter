

export function stringFromPoint(point: Array<number>): string {
	// a string representation for CSS
	let x: number = point[0],
		y: number = point[1]
	return `${x} ${y}`
}

export function remove(arr: Array<any>, value: any, all: boolean = false) {
	// remove an object from an Array
   for (let i = 0; i < arr.length; i++) {
		if (arr[i] == value) {
			arr.splice(i,1)
			if (!all) { break }
		}
	}
}

// logging inside HTML instead of the console
// for debugging the app
function logInto(obj: any, id: string) {
	let msg = obj.toString()
	let newLine: HTMLElement = document.createElement('p')
	newLine.innerText = msg
	let myConsole: HTMLElement = document.querySelector('#' + id)
  myConsole.appendChild(newLine)
	
	// Neither of these lines does what it is claimed to. I give up
	myConsole.scrollTop = myConsole.scrollHeight
	newLine.scrollIntoView()
}

function paperLog(msg: any) { logInto(msg.toString(), 'paper-console') }
function sidebarLog(msg: any) { logInto(msg.toString(), 'sidebar-console') }
function consoleLog(msg: any) { console.log(msg.toString()) }
// change the next line to suit your debugging needs
export function log(msg: any) { console.log(msg) }

// mixins allow to inherit from multiple classes (kinda)
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

export function restrictedDict(dict: object, keys: Array<string>): object {
	let ret: object = {}
	for (let key of keys) {
		let value: any = dict[key]
		if (value !== undefined) {
			ret[key] = dict[key]
		}
	}
	return ret
}

export function copy(obj: any): any {

	if (typeof obj != 'object' || obj === null) {
		return obj
	}

	if (obj.constructor.name == 'Array') {
			let newObj: Array<any> = []
			for (let x of obj as Array<any>) {
				newObj.push(x)
			}
			return newObj
	}

	return Object.assign({}, obj)
}

export function deepCopy(obj: any, memo: Array<Array<object>> = []): any {

	//console.log('deep-copying', obj)
	//console.log('memo:', memo)

	if (typeof obj != 'object' || obj === null) {
		return obj
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
						//console.log('ARRAY found a previously copied object:', value, copiedValue)
					}
				}

				if (alreadyCopied) {
					newObj.push(copiedValue)
				} else {
					let y = deepCopy(value, memo)
					newObj.push(y)
					memo.push([value, y])
					//console.log('ARRAY registered new value:', value, y)
					//console.log('ARRAY new memo:', memo)
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
					//console.log('OBJECT found a previously copied object:', value, copiedValue)
				}
			}

			if (alreadyCopied) {
				newObj[key] = copiedValue
			} else {
				let y = deepCopy(value, memo)
				newObj[key] = y
				//console.log('OBJECT registered new value:', value, y)
				//console.log('OBJECT new memo:', memo)
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



























