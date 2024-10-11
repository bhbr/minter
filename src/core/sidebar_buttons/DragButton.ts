
import { ToggleButton } from './ToggleButton'

export class DragButton extends ToggleButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				messages: [{ drag: true }],
				outgoingMessage: { drag: false },
				text: 'drag'
			}
		})
	}

}