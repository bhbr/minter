
import { SidebarButton } from './SidebarButton'

export class CommandButton extends SidebarButton {

	defaults(): object {
		return {
			messages: [{ com: true }, { drag: true }, { link: true }],
			outgoingMessage: { all: false },
			text: 'drag'
		}
	}

	mutabilities(): object {
		return {
			messages: 'never',
			outgoingMessage: 'never',
			text: 'never'
		}
	}

}