
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class CoinButton extends CreativeButton {
	
	defaults(): object {
		return {
			creations: ['coin', 'coin row', 'coin stack'],
			icon: new ImageView({
				imageLocation: '../../assets/coin.png',
				frameWidth: 30,
				frameHeight: 30
			})
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}