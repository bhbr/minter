
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class ComparisonButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['less than', 'less or equal', 'greater than', 'greater or equal', 'equal', 'not equal'],
			icon: new ImageView({
				imageLocation: '../../assets/less_than.png',
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