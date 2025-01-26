
import { ToggleButton } from './ToggleButton'

export class DragButton extends ToggleButton {

	ownDefaults(): object {
		return {
			messages: [{ drag: true }],
			outgoingMessage: { drag: false },
			text: 'drag'
		}
	}

	ownMutabilities(): object {
		return {
			messages: 'never',
			outgoingMessage: 'never',
			text: 'never'
		}
	}

}