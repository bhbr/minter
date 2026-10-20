
import { ToggleButton } from './ToggleButton.js'
import { ImageView } from 'mobjects/ImageView.js'

export class LinkButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'link'
		}
	}

}