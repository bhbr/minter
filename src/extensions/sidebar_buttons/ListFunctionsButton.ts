
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'
import { ImageView } from 'mobjects/ImageView.js'

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