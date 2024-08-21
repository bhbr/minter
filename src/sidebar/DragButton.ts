import { ToggleButton } from './ToggleButton'
import { Color } from '../modules/helpers/Color'

export class DragButton extends ToggleButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			messages: [{ drag: true }],
			outgoingMessage: { drag: false },
			key: 'q'
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.label.text = 'drag'
	}

}