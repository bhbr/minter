
import { SimpleInputBox } from './SimpleInputBox'

export class SimpleTextInputBox extends SimpleInputBox {
	
	get value(): string {
		return this.inputElement.value
	}
	set value(newValue: string) {
		this.inputElement.value = newValue
	}

}