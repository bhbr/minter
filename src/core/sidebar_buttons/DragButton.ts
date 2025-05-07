
import { ToggleButton } from './ToggleButton'
import { ImageView } from 'core/mobjects/ImageView'

export class DragButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'drag',
			icon: new ImageView({
				imageLocation: '../../assets/drag.png',
				frameWidth: 30,
				frameHeight: 30
			})
		}
	}


}