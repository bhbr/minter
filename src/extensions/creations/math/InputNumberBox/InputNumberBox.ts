
import { InputBox } from 'core/mobjects/InputBox'


export class InputNumberBox extends InputBox {

	declare value: number
	
	defaults(): object {
		return {
			value: 0
		}
	}

	valueFromString(valueString: string): number {
		return Number(valueString)
	}

	onReturn() {
		this.update({
			value: this.valueFromString(this.inputElement.value)
		})
	}
}