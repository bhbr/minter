
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class ListFunctionsButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['list', 'sum', 'mean'],
			iconSize: 25
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}