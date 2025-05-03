
import { Linkable } from 'core/linkables/Linkable'
import { InputTextBox } from './InputTextBox'

export class LinkableInputTextBox extends Linkable {

	wrappedInputTextBox: InputTextBox

	defaults(): object {
		return {
			wrappedInputTextBox: new InputTextBox(),
			outputProperties: [
				{ name: 'value', type: 'string' }
			]
		}
	}

	setup() {
		super.setup()
		this.add(this.wrappedInputTextBox)
	}

	get value(): string {
		return this.wrappedInputTextBox.value
	}

	set value(newValue: string) {
		this.wrappedInputTextBox.value = newValue
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		let newValue = args['value']
		if (newValue !== undefined) {
			this.wrappedInputTextBox.update({
				value: newValue
			})
		}
	}





