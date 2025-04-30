
import { InputNumberBox } from './InputNumberBox'
import { LinkableInputBox } from 'core/mobjects/LinkableInputBox'

export class LinkableInputNumberBox extends LinkableInputBox {

	declare inputBox: InputNumberBox

	defaults(): object {
		return {
			outputProperties: [
				{ name: 'value', type: 'number' }
			],
		}
	}

	get value(): number {
		return this.inputBox.value
	}

	set value(newValue: number) {
		this.inputBox.value = newValue
	}


}