
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class ListFunctionsButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['sum', 'mean'],
			icon: new ImageView({
				imageLocation: '../../assets/sum.png',
				frameWidth: 25,
				frameHeight: 25
			})
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}