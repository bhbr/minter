
import { ToggleButton } from './ToggleButton'
import { ImageView } from 'core/mobjects/ImageView'

export class DragButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'drag',
			iconSize: 30
		}
	}


}