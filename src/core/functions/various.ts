import { log } from './logging'

export function roundedString(x: number, digits: number = 3): string {
	//log(x)
	if (digits <= 0) {
		digits = 1
	}
	let signed = (x < 0)
	x = Math.abs(x)
	let maxDecimalPlace = Math.floor(Math.log10(x))
	//log(maxDecimalPlace)
	let minDecimalPlace = maxDecimalPlace - digits + 1
	//log(minDecimalPlace)
	let y = x * 10 ** (-minDecimalPlace)
	//log(y)
	let z = Math.round(y)
	//log(z)
	let w = z * 10 ** minDecimalPlace
	//log(w)
	let s = w.toString()
	//log(s)
	if (s.includes('.')) {
		let t = s.substring(0, digits + 1)
		return `${signed ? '-' : ''}${t}`
	} else {
		return `${signed ? '-' : ''}${s}`
	}
}

export function gaussianRandom(mean: number = 0, stdev: number = 1): number {
    const u = 1 - Math.random() // Converting [0,1) to (0,1]
    const v = Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean
}

export function randomBinomial(n: number = 1, p: number = 0.5): number {
	if (n < 1e7) {
		var X: number = 0
		for (var i = 0; i < n; i++) {
			let v = (Math.random() < p) ? 1 : 0
			X += v
		}
		return X
	}
	return Math.round(gaussianRandom(n * p, (n * p * (1 - p)) ** 0.5))
}










