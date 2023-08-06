

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







