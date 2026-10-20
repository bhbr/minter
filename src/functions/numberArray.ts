
export function numberArraySum(arr: Array<number>): number {
	var sum: number = 0
	for (var i = 0; i < arr.length; i++) {
		sum += arr[i]
	}
	return sum
}

export function numberArrayAverage(arr: Array<number>): number {
	if (arr.length == 0) { return NaN }
	return numberArraySum(arr) / arr.length
}

export function numberArrayCumSum(arr: Array<number>): Array<number> {
	if (arr.length == 0) { return [] }
	let cumsum: Array<number> = []
	var sum: number = 0
	for (var i = 0; i < arr.length; i++) {
		sum += arr[i]
		cumsum.push(sum)
	}
	return cumsum
}

export function numberArrayCumAverage(arr: Array<number>): Array<number> {
	if (arr.length == 0) { return [] }
	let cumsum: Array<number> = []
	var sum: number = 0
	for (var i = 0; i < arr.length; i++) {
		sum += arr[i]
		cumsum.push(sum / (i + 1))
	}
	return cumsum
}