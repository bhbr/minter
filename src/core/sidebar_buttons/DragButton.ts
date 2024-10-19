
import { ToggleButton } from './ToggleButton'

export class DragButton extends ToggleButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			messages: [{ drag: true }],
			outgoingMessage: { drag: false },
			text: 'drag'
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			messages: 'never',
			outgoingMessage: 'never',
			text: 'never'
		})
	}

}