
import { ToggleButton } from './ToggleButton'
import { ImageView } from 'core/mobjects/ImageView'

export class ControlsButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'show controls',
			icon: new ImageView({
				imageLocation: '../../assets/show_controls.png',
				frameWidth: 30,
				frameHeight: 30
			})
		}
	}

}