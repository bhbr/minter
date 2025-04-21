
import { InputTextBox } from './InputTextBox'
import { LinkableInputBox } from './LinkableInputBox'

export class LinkableInputTextBox extends LinkableInputBox {

	declare inputBox: InputTextBox

	get value(): string {
		return this.inputBox.value
	}

	set value(newValue: string) {
		this.inputBox.value = newValue
	}