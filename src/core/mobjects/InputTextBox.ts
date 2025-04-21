
import { InputBox } from 'core/mobjects/InputBox'

export class InputTextBox extends InputBox {

	declare value: string
	
	defaults(): object {
		return {
			value: ''
		}
	}

	valueFromString(valueString: string): string {
		return valueString
	}


}