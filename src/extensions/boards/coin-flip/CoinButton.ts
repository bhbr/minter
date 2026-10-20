
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'
import { ImageView } from 'mobjects/ImageView.js'

export class CoinButton extends CreativeButton {
	
	defaults(): object {
		return {
			creations: ['coin', 'coin row', 'coin stack'],
			iconSize: 30
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}