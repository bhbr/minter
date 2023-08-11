

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


export function copy(obj: any): any {

	console.log('copying', obj)

	if (typeof obj != 'object' || obj == null) {
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

	if (typeof obj != 'object' || obj == null) {
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

	let newObj: object = {}
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
	return newObj

}



























