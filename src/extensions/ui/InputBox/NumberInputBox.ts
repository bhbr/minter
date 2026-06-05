
import { InputBox } from './InputBox'

export class NumberInputBox extends InputBox {

	defaults(): object {
		return {
			value: 0
		}
	}

	get value(): number {
		//if (this.inputElement.value == '') { return NaN }
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