
import { SimpleInputBox } from './SimpleInputBox'

export class SimpleNumberInputBox extends SimpleInputBox {

	get value(): number {
		return Number(this.inputElement.value)
	}
	set value(newValue: number) {
		let isFalsy = [null, undefined, NaN, Infinity, -Infinity].includes(newValue)
		this.inputElement.value = isFalsy ? '' : newValue.toString()
	}

}