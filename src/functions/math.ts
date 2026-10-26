
///////////////////////
// SUMS AND AVERAGES //
///////////////////////

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




///////////////////
// COMBINATORICS //
///////////////////


export function factorial(n: number): number {
	if (n == 0 || n == 1) { return 1 }
	var prod = 1
	for (var i = 2; i <= n; i++) {
		prod *= i
	}
	return prod
}

export function binomial(n: number, k: number): number {
	var prod = 1
	for (var i = 0; i < k; i++) {
		prod *= (n - i) / (k - i)
	}
	for (var j = 0; j < n - k; j++) {
		prod *= (n - k - j) / (j + 1)
	}
	return Math.round(prod)
}


//////////
// RNGS //
//////////




export function gaussianRandom(mean: number = 0, stdev: number = 1): number {
    const u = 1 - Math.random() // Converting [0,1) to (0,1]
    const v = Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean
}

export function randomBinomial(n: number = 1, p: number = 0.5): number {
	if (n < 5e3) {
		var X: number = 0
		for (var i = 0; i < n; i++) {
			let v = (Math.random() < p) ? 1 : 0
			X += v
		}
		return X
	}
	return Math.round(gaussianRandom(n * p, (n * p * (1 - p)) ** 0.5))
}























