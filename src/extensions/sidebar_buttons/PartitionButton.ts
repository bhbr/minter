
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'
import { ImageView } from 'mobjects/ImageView.js'

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