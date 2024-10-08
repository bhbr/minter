
import { ToggleButton } from './ToggleButton'

export class DragButton extends ToggleButton {

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			messages: [{ drag: true }],
			outgoingMessage: { drag: false },
			text: 'drag'
		})
	}

}