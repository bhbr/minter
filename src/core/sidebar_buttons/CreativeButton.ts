
import { SidebarButton } from './SidebarButton'

export class CreativeButton extends SidebarButton {

	creations: Array<string>

	ownDefaults(): object {
		return {
			creations: [],
			outgoingMessage: { create: 'freehand' }
		}
	}

	ownMutabilities(): object {
		return {
			creations: 'on_init'
		}
	}

	setup() {
		super.setup()
		for (let c of this.creations) {
			this.messages.push({create: c})
		}
	}

}