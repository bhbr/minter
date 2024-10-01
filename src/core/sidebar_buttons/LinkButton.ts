
import { ToggleButton } from './ToggleButton'

export class LinkButton extends ToggleButton {

	defaults(): object {
		return {
			messages: [{ link: true }],
			outgoingMessage: { link: false },
			text: 'link'
		}
	}

	setup() {
		super.setup()
		this.label.view['fill'] = 'black'
	}

}