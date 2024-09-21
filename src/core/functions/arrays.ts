
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























