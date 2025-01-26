
import { ToggleButton } from './ToggleButton'

export class LinkButton extends ToggleButton {

	ownDefaults(): object {
		return {
			messages: [{ link: true }],
			outgoingMessage: { link: false },
			text: 'link'
		}
	}

	ownMutabilities(): object {
		return {
			messages: 'never',
			outgoingMessage: 'never',
			text: 'never'
		}
	}

	setup() {
		super.setup()
		this.label.view['fill'] = 'black'
	}

}