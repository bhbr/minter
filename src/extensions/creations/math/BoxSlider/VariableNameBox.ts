
import { SimpleTextInputBox } from 'extensions/creations/math/boxes/SimpleTextInputBox'
import { getPaper } from 'core/functions/getters'

export class VariableNameBox extends SimpleTextInputBox {

	keyPressed(e: KeyboardEvent) {
		super.keyPressed(e)
		if (e.which != 13) { return }
		if (this.inputElement.value.length == 1) {
			this.inputElement.blur()
			getPaper().activeKeyboard = true
			this.onReturn()
		}
	}

}