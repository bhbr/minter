
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

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