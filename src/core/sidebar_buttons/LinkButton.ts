
import { ToggleButton } from './ToggleButton'
import { ImageView } from 'core/mobjects/ImageView'

export class LinkButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'link'
		}
	}

}