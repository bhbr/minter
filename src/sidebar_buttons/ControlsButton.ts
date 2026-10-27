
import { ToggleButton } from './ToggleButton.js'
import { ImageView } from 'minter/mobjects/ImageView.js'

export class ControlsButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'show controls',
			iconSize: 30,
			bigLabelFontSize: 12
		}
	}

}