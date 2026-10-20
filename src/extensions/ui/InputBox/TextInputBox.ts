
import { InputBox } from './InputBox.js'

export class TextInputBox extends InputBox {
	
	get value(): string {
		return this.inputElement.value
	}
	set value(newValue: string) {
		this.inputElement.value = newValue
	}

}