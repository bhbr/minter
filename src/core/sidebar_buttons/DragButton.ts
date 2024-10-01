
import { ToggleButton } from './ToggleButton'

export class DragButton extends ToggleButton {

	defaults(): object {
		return {
			messages: [{ drag: true }],
			outgoingMessage: { drag: false },
			text: 'drag'
		}
	}

}