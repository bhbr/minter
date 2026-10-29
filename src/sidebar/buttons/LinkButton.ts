
import { ToggleButton } from './ToggleButton.js'
import { ImageView } from '../../views/ImageView.js'

export class LinkButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'link'
		}
	}

}