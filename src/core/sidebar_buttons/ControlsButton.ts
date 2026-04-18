
import { ToggleButton } from './ToggleButton'
import { ImageView } from 'core/mobjects/ImageView'

export class ControlsButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'show controls',
			iconSize: 30
		}
	}

}