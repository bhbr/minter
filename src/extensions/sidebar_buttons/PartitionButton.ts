
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class PartitionButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['partition', 'wall'],
			iconSize: 35
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}