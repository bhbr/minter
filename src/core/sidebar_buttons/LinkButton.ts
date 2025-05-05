
import { ToggleButton } from './ToggleButton'
import { ImageView } from 'core/mobjects/ImageView'

export class LinkButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'link',
			icon: new ImageView({
				imageLocation: '../../assets/link.png',
				frameWidth: 40,
				frameHeight: 40
			})
		}
	}

}