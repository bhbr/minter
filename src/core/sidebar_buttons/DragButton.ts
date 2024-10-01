
import { ToggleButton } from './ToggleButton'

export class DragButton extends ToggleButton {

	defaults(): object {
		return Object.assign(super.defaults(), {
			messages: [{ drag: true }],
			outgoingMessage: { drag: false },
			text: 'drag'
		})
	}

}