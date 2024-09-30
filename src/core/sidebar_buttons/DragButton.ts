
import { ToggleButton } from './ToggleButton'

export class DragButton extends ToggleButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			messages: [{ drag: true }],
			outgoingMessage: { drag: false },
			text: 'drag'
		})
	}

}