
import { log } from './logging.js'

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

function prettyPrintNumber(value: number, precision: number = 4): string {
	if (Math.round(value) != value) {
		return value.toPrecision(precision)
	} else {
		return `${value}`;
	}
}

export function prettyPrint(value: any, precision: number =  4): string {
	if (typeof value == 'number') {
		return prettyPrintNumber(value as number)
	} else {
		return `${value}`;
	}
}

export function conditionTrigger(condition: () => boolean, handler: () => void, period: number = 0.1) {
	let id = `timeoutID_${Date.now()}`
	window[id] = window.setInterval(function() {
		if (condition()) {
			window.clearInterval(window[id])
			delete window[id]
			handler()
		}
	}, period * 1000)
}





