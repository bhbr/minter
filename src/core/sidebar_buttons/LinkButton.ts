
import { ToggleButton } from './ToggleButton'

export class LinkButton extends ToggleButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			messages: [{ link: true }],
			outgoingMessage: { link: false },
			text: 'link'
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			messages: 'never',
			outgoingMessage: 'never',
			text: 'never'
		})
	}

	setup() {
		super.setup()
		this.label.view['fill'] = 'black'
	}

}