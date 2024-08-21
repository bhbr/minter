import { ToggleButton } from './ToggleButton'
import { Color } from '../modules/helpers/Color'

export class LinkButton extends ToggleButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			messages: [{ link: true }],
			outgoingMessage: { link: false },
			key: 'w'
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.label.view['fill'] = 'black'
		this.label.text = 'link'
	}

}