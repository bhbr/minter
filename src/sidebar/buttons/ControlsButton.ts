
import { ToggleButton } from './ToggleButton.js'
import { ImageView } from '../../views/ImageView.js'

export class ControlsButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'show controls',
			iconSize: 30,
			bigLabelFontSize: 12
		}
	}

}