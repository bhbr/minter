
import { InputBox } from './InputBox'

export class NumberInputBox extends InputBox {

	get value(): number {
		return Number(this.inputElement.value)
	}
	set value(newValue: number) {
		let isFalsy = [null, undefined, NaN, Infinity, -Infinity].includes(newValue)
		this.inputElement.value = isFalsy ? '' : newValue.toString()
	}

	setup() {
		super.setup()
		//this.inputElement.setAttribute('type', 'number')
		// needs adjustment for iPad
	}

}