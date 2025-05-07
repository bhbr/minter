
import { ToggleButton } from './ToggleButton'
import { ImageView } from 'core/mobjects/ImageView'

export class ControlsButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'ctrl',
			icon: new ImageView({
				imageLocation: '../../assets/ctrl.png',
				frameWidth: 30,
				frameHeight: 30
			})
		}
	}

}