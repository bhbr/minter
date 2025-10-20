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