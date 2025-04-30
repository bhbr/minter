
import { InputTextBox } from './InputTextBox'
import { LinkableInputBox } from './LinkableInputBox'

export class LinkableInputTextBox extends LinkableInputBox {

	declare inputBox: InputTextBox

	defaults(): object {
		return {
			outputProperties: [
				{ name: 'value', type: 'string' }
			],
		}
	}

	get value(): string {
		return this.inputBox.value
	}

	set value(newValue: string) {
		this.inputBox.value = newValue
	}