
import { ToggleButton } from './ToggleButton'

export class LinkButton extends ToggleButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				messages: [{ link: true }],
				outgoingMessage: { link: false },
				text: 'link'
			}
		})
	}

	setup() {
		super.setup()
		this.label.view['fill'] = 'black'
	}

}