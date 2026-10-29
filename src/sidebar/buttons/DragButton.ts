
import { ToggleButton } from './ToggleButton.js'
import { ImageView } from '../../views/ImageView.js'

export class DragButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'drag',
			iconSize: 30
		}
	}


}